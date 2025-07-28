import { create } from "zustand"
import { persist } from "zustand/middleware"

type Product = {
    id: string;
    title: string;
    price: number;
    image: string;
    quantity: number;
    shopId: string;
    stock: number;
    images: { url: string }[];
    discount?: {
        code: string;
        discountType: "percentage" | "amount";
        discountValue: number;
    };
    color: string;
    size: string;
}

type Store = {
    cart: Product[];
    wishlist: Product[];
    addToCart: (
        product: Product,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;

    removeFromCart: (
        id: string,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;

    addToWishlist: (
        product: Product,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;

    removeFromWishlist: (
        id: string,
        user: any,
        location: string,
        deviceInfo: string
    ) => void;
    updateCartQuantity: (id: string, quantity: number) => void;
}

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
                        cart: [...state.cart, { ...product, quantity: 1 }]
                    }
                })
            },

            //Remove from cart
            removeFromCart: (id, user, location, deviceInfo) => {
                //Find product before calling set
                const removeProduct = get().cart.find((item) => item.id === id)

                set((state) => ({
                    cart: state.cart.filter((item) => item.id !== id),
                }))
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
            },

            //Remove from wishlist
            removeFromWishlist: (id, user, location, deviceInfo) => {
                const removeProduct = get().wishlist.find((item) => item.id === id)
                set((state) => ({
                    wishlist: state.wishlist.filter((item) => item.id !== id),
                }))
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
    {name: "store-storage"})

)
