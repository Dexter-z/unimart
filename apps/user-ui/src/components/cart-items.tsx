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
import axiosInstance from "@/utils/axiosInstance";

const CartItems: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);

  const handleQuantityChange = (itemId: string, newQuantity: number, stock: number) => {
    if (newQuantity > 0 && newQuantity <= stock) {
      updateCartQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId, user, JSON.stringify(location), deviceInfo);
  };

  const applyDiscountCode = async () => {
    try {
      const response = await axiosInstance.get(`/product/api/get-discount-code/${discountCode}`);
      setAppliedDiscount(response.data.discount);
    } catch (error) {
      console.error("Invalid discount code", error);
      setAppliedDiscount(null);
    }
  };

  const calculateItemPrice = (item: any) => {
    let price = item.salePrice;
    if (appliedDiscount && item.discountCodes.includes(appliedDiscount.id)) {
      if (appliedDiscount.discountType === "percentage") {
        price *= (1 - appliedDiscount.discountValue / 100);
      } else if (appliedDiscount.discountType === "amount") {
        price -= appliedDiscount.discountValue;
      }
    }
    return price;
  };

  const calculateSubtotal = () => {
    return cart.reduce((total, item) => total + calculateItemPrice(item) * item.quantity, 0);
  };

  const handleCheckout = () => {
    console.log("Checkout clicked", {
      cart,
      subtotal: calculateSubtotal(),
      total: calculateSubtotal(), // Total is the same as subtotal after per-item discount
      appliedDiscount,
    });
  };

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Your cart is empty, Start adding products</p>;
  }

  return (
    <div className="w-full">
      {cart.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between p-4 mb-4 border border-gray-700 rounded-lg bg-gray-800"
        >
          <div className="flex-shrink-0">
            <Image
              src={item.images[0].url}
              alt={item.title}
              width={100}
              height={100}
              className="rounded-md"
            />
          </div>

          <div className="flex-grow ml-4 flex flex-col items-start">
            <div className="w-full">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
            </div>
            <div className="w-full flex items-center justify-between mt-2">
                <p className="text-lg font-bold text-[#ff8800]">
                    ${(calculateItemPrice(item) * item.quantity).toFixed(2)}
                </p>
                <div className="flex items-center">
                    <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                    className="bg-[#18181b] text-white hover:bg-gray-700"
                    >
                    -
                    </Button>
                    <span className="mx-4 text-white">{item.quantity}</span>
                    <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
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
          </div>
        </div>
      ))}
      <div className="mt-6 p-4 border-t border-gray-700">
        <div className="flex justify-between items-center mb-4">
            <p className="text-lg text-gray-400">Subtotal</p>
            <p className="text-lg font-bold text-white">${calculateSubtotal().toFixed(2)}</p>
        </div>
        {appliedDiscount && (
            <div className="flex justify-between items-center mb-4">
                <p className="text-lg text-gray-400">Discount ({appliedDiscount.public_name})</p>
                <p className="text-lg font-bold text-green-500">
                    -
                    {appliedDiscount.discountType === "percentage"
                        ? `${appliedDiscount.discountValue}%`
                        : `$${appliedDiscount.discountValue.toFixed(2)}`}
                </p>
            </div>
        )}
        <div className="flex justify-between items-center font-bold text-xl mb-6">
            <p>Total</p>
            <p>${calculateSubtotal().toFixed(2)}</p>
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
            <Input
                type="text"
                placeholder="Discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="mr-2 border-gray-600 bg-gray-700 text-white placeholder-gray-400"
            />
            <Button onClick={applyDiscountCode} className="bg-[#ff8800] text-[#18181b] hover:bg-orange-600">Apply</Button>
            </div>
            <Button size="lg" onClick={handleCheckout} className="bg-[#ff8800] text-[#18181b] hover:bg-orange-600">
            Checkout
            </Button>
        </div>
      </div>
    </div>
  );
};

export default CartItems;
