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

  const calculateOriginalItemPrice = (item: any) => {
    return item.salePrice;
  };

  const calculateDiscountedItemPrice = (item: any) => {
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

  const calculateOriginalSubtotal = () => {
    return cart.reduce((total, item) => total + item.salePrice * item.quantity, 0);
  };

  const calculateFinalTotal = () => {
    return cart.reduce((total, item) => total + calculateDiscountedItemPrice(item) * item.quantity, 0);
  };

  const handleCheckout = () => {
    console.log("Checkout clickedd", {
      cart,
      subtotal: calculateOriginalSubtotal(),
      total: calculateFinalTotal(),
      appliedDiscount,
    });
  };

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Your cart is empty, Start adding products</p>;
  }

  return (
    <div className="w-full space-y-4">
      {cart.map((item) => (
        <div
          key={item.id}
          className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700/50 hover:border-gray-600 transition-all duration-200 shadow-lg"
        >
          <div className="flex items-center gap-4">
            {/* Product Image */}
            <div className="relative">
              <Image
                src={item.images[0].url}
                alt={item.title}
                width={70}
                height={70}
                className="rounded-lg object-cover shadow-md"
              />
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-white text-sm sm:text-base truncate mb-1">
                {item.title}
              </h3>
              
              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                {appliedDiscount && item.discountCodes.includes(appliedDiscount.id) ? (
                  <>
                    <span className="text-gray-400 line-through text-xs">
                      ${calculateOriginalItemPrice(item).toFixed(2)}
                    </span>
                    <span className="text-[#ff8800] font-bold text-sm">
                      ${calculateDiscountedItemPrice(item).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#ff8800] font-bold text-sm">
                    ${calculateOriginalItemPrice(item).toFixed(2)}
                  </span>
                )}
                <span className="text-gray-400 text-xs">each</span>
              </div>

              {/* Quantity and Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600">
                  <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                    className="bg-transparent hover:bg-gray-700 text-gray-300 h-8 w-8 p-0 rounded-r-none border-0"
                  >
                    -
                  </Button>
                  <span className="px-3 py-1 text-white text-sm font-medium bg-gray-700 border-x border-gray-600">
                    {item.quantity}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                    className="bg-transparent hover:bg-gray-700 text-gray-300 h-8 w-8 p-0 rounded-l-none border-0"
                  >
                    +
                  </Button>
                </div>

                <div className="flex items-center gap-3">
                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-white font-bold text-base">
                      ${(appliedDiscount && item.discountCodes.includes(appliedDiscount.id) 
                        ? calculateDiscountedItemPrice(item) * item.quantity 
                        : calculateOriginalItemPrice(item) * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>

                  {/* Remove Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                      >
                        ×
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 text-white border-gray-700 max-w-sm mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-lg">Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-sm">
                          This will remove "{item.title}" from your cart.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-sm">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveItem(item.id)} 
                          className="bg-red-600 hover:bg-red-700 text-sm"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Cart Summary */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 border border-gray-700/50 shadow-lg">
        {/* Summary Header */}
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Order Summary</h2>
          <span className="text-sm text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-gray-400">Subtotal</span>
            <span className="text-white font-medium">${calculateOriginalSubtotal().toFixed(2)}</span>
          </div>
          
          {appliedDiscount && (
            <div className="flex justify-between items-center text-green-400">
              <span className="flex items-center gap-2">
                <span>Discount</span>
                <span className="px-2 py-1 bg-green-900/30 rounded-full text-xs">
                  {appliedDiscount.public_name}
                </span>
              </span>
              <span className="font-medium">
                -${(calculateOriginalSubtotal() - calculateFinalTotal()).toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="border-t border-gray-700 pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-white">Total</span>
              <span className="text-xl font-bold text-[#ff8800]">${calculateFinalTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Discount Code Section */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#ff8800] focus:ring-[#ff8800]/20"
            />
            <Button 
              onClick={applyDiscountCode} 
              className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-4"
            >
              Apply
            </Button>
          </div>
        </div>
        
        {/* Checkout Button */}
        <Button 
          size="lg" 
          onClick={handleCheckout} 
          className="w-full bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <span className="flex items-center justify-center gap-2">
            Proceed to Checkout
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
