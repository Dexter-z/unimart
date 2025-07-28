"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useStore } from "@/store";
import useUser from "@/hooks/useUser";
import useLocationTracking from "@/hooks/useLocationTracking";
import useDeviceTracking from "@/hooks/useDeviceTracking";

// Assuming the Product type in the store is the source of truth
type CartItem = ReturnType<typeof useStore.getState>['cart'][0] & {
    images: { url: string }[];
    stock: number;
    discount?: {
        code: string;
        discountType: "percentage" | "amount";
        discountValue: number;
    };
    color: string;
    size: string;
};


const CartItems: React.FC = () => {
  const { cart, removeFromCart, addToCart } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [discountCode, setDiscountCode] = useState("");

  const handleQuantityChange = (item: CartItem, newQuantity: number) => {
    if (newQuantity > 0 && newQuantity <= item.stock) {
      const productToAdd = {
        ...item,
        quantity: newQuantity,
      };
      addToCart(productToAdd, user, JSON.stringify(location), deviceInfo);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId, user, JSON.stringify(location), deviceInfo);
  };

  const calculateDiscountedPrice = (item: CartItem) => {
    const { price, discount, quantity } = item;

    if (discount && discount.code === discountCode) {
      if (discount.discountType === "percentage") {
        return (price * (1 - discount.discountValue / 100)) * quantity;
      } else if (discount.discountType === "amount") {
        return (price - discount.discountValue) * quantity;
      }
    }
    return price * quantity;
  };

  const handleCheckout = () => {
    console.log("Checkout clicked", cart);
  };

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Your cart is empty, Start adding products</p>;
  }

  return (
    <div className="w-full">
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex flex-col md:flex-row items-center justify-between p-4 mb-4 border border-gray-700 rounded-lg bg-gray-800"
        >
          <div className="flex items-center mb-4 md:mb-0">
            <Image
              src={item.image}
              alt={item.title}
              width={100}
              height={100}
              className="rounded-md"
            />
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-white">{item.title}</h3>
              <p className="text-sm text-gray-400">
                {/* Assuming color and size are not in the store, you might need to adjust this */}
                {/* Color: {item.color} | Size: {item.size} */}
              </p>
              <p className="text-lg font-bold text-[#ff8800]">
                ${calculateDiscountedPrice(item as any).toFixed(2)}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item as any, item.quantity - 1)}
              className="bg-[#18181b] text-white hover:bg-gray-700"
            >
              -
            </Button>
            <span className="mx-4 text-white">{item.quantity}</span>
            <Button
              size="sm"
              onClick={() => handleQuantityChange(item as any, item.quantity + 1)}
              className="bg-[#18181b] text-white hover:bg-gray-700"
            >
              +
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="ml-4 bg-red-600 hover:bg-red-700">
                  Remove
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-gray-800 text-white border-gray-700">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-400">
                    This action cannot be undone. This will permanently remove
                    the item from your cart.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gray-600 hover:bg-gray-500">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => handleRemoveItem(item.id)} className="bg-red-600 hover:bg-red-700">
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      ))}
      <div className="flex flex-col md:flex-row justify-between items-center mt-6">
        <div className="flex items-center mb-4 md:mb-0">
          <Input
            type="text"
            placeholder="Discount code"
            value={discountCode}
            onChange={(e) => setDiscountCode(e.target.value)}
            className="mr-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400"
          />
          <Button className="bg-[#ff8800] text-[#18181b] hover:bg-orange-600">Apply</Button>
        </div>
        <Button size="lg" onClick={handleCheckout} className="bg-[#ff8800] text-[#18181b] hover:bg-orange-600">
          Checkout
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
