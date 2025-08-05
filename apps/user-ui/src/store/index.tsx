import { sendKafkaEvent } from "@/actions/track-user";
import { create } from "zustand";
import { persist, createJSONStorage, StateStorage } from "zustand/middleware";

type Product = {
    id: string;
    title: string;
    price: number;
    salePrice: number;
    image: string;
    quantity: number;
    shopId: string;
    stock: number;
    images: { url: string }[];
    discountCodes: string[];
    color: string;
    size: string;
}

type Store = {
    cart: Product[];
    wishlist: Product[];
    addToCart: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;

    removeFromCart: (
        id: string,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;

    addToWishlist: (
        product: Product,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;

    removeFromWishlist: (
        id: string,
        user: any,
        location: any,
        deviceInfo: any
    ) => void;
    updateCartQuantity: (id: string, quantity: number) => void;
}

const storage: StateStorage = {
    getItem: (name: string) => {
        if (typeof window !== "undefined") {
            return localStorage.getItem(name);
        }
        return null;
    },
    setItem: (name: string, value: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem(name, value);
        }
    },
    removeItem: (name: string) => {
        if (typeof window !== "undefined") {
            localStorage.removeItem(name);
        }
    },
};

export const useStore = create<Store>()(
    persist(
        (set, get) => ({
            cart: [],
            wishlist: [],

            //Add to cart
            addToCart: (product, user, location, deviceInfo) => {
                set((state) => {
                    const existing = state.cart?.find((item) => item.id === product.id)
                    if (existing) {
                        const newQuantity = (existing.quantity ?? 1) + 1;
                        if (newQuantity > product.stock) {
                            return state; // Do not update if quantity exceeds stock
                        }
                        return {
                            cart: state.cart.map((item) => item.id === product.id ? { ...item, quantity: newQuantity } : item)
                        }
                    }
                    return {
                        cart: [...state.cart, { ...product, quantity: product.quantity || 1 }]
                    }
                })

                //Send kafka event
                if(user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device",
                    })
                }
            },

            //Remove from cart
            removeFromCart: (id, user, location, deviceInfo) => {
                //Find product before calling set
                const removeProduct = get().cart.find((item) => item.id === id)

                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                }))

                //Send kafka event
                if(user?.id && location && deviceInfo && removeProduct){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_cart",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device",
                    })
                }
            },

            //Add to wishlist
            addToWishlist: (product, user, location, deviceInfo) => {
                set((state) => {
                    if(state.wishlist.find((item) => item.id === product.id)) 
                        return state;
                    return {
                        wishlist: [...state.wishlist, product]
                    }
                })

                //Send kafka event
                if(user?.id && location && deviceInfo){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: product?.id,
                        shopId: product?.shopId,
                        action: "add_to_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device",
                    })
                }
            },

            //Remove from wishlist
            removeFromWishlist: (id, user, location, deviceInfo) => {
                const removeProduct = get().wishlist.find((item) => item.id === id)
                set((state) => ({
                    wishlist: state.wishlist.filter((item) => item.id !== id),
                }))

                //Send kafka event
                if(user?.id && location && deviceInfo && removeProduct){
                    sendKafkaEvent({
                        userId: user?.id,
                        productId: removeProduct?.id,
                        shopId: removeProduct?.shopId,
                        action: "remove_from_wishlist",
                        country: location?.country || "Unknown",
                        city: location?.city || "Unknown",
                        device: deviceInfo || "Unknown Device",
                    })
                }
            },

            updateCartQuantity: (id, quantity) => {
                set((state) => {
                    const itemToUpdate = state.cart.find((item) => item.id === id);
                    if (itemToUpdate && quantity > itemToUpdate.stock) {
                        return state; // Do not update if quantity exceeds stock
                    }
                    return {
                        cart: state.cart.map((item) =>
                            item.id === id ? { ...item, quantity } : item
                        ),
                    }
                });
            },
        }),
        {
            name: "store-storage",
            storage: createJSONStorage(() => storage),
        }
    )
);
