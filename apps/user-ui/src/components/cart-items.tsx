"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart } from "lucide-react";
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
  const { cart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, wishlist } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  const handleQuantityChange = (itemId: string, newQuantity: number, stock: number) => {
    if (newQuantity > 0 && newQuantity <= stock) {
      updateCartQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    removeFromCart(itemId, user, JSON.stringify(location), deviceInfo);
  };

  const handleAddToWishlist = (item: any) => {
    const isWishlisted = wishlist.some((wishItem: any) => wishItem.id === item.id);
    if (isWishlisted) {
      // Remove from wishlist if already wishlisted
      removeFromWishlist(item.id, user, JSON.stringify(location), deviceInfo);
    } else {
      // Add to wishlist if not already there
      addToWishlist({ ...item, quantity: 1 }, user, JSON.stringify(location), deviceInfo);
    }
  };

  const handleClearCart = () => {
    // Clear cart by removing each item individually
    cart.forEach((item) => {
      removeFromCart(item.id, user, JSON.stringify(location), deviceInfo);
    });
  };

  const applyDiscountCode = async () => {
    if (!discountCode.trim()) return;
    
    setIsApplyingDiscount(true);
    try {
      const response = await axiosInstance.get(`/product/api/get-discount-code/${discountCode}`);
      setAppliedDiscount(response.data.discount);
    } catch (error) {
      console.error("Invalid discount code", error);
      setAppliedDiscount(null);
    } finally {
      setIsApplyingDiscount(false);
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
      {/* Clear Cart Button */}
      {cart.length > 0 && (
        <div className="flex justify-end mb-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="text-red-400 border-red-400 hover:bg-red-900/20 hover:text-red-300">
                Clear Cart ({cart.length} items)
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gray-900 text-white border-gray-700 max-w-sm mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg">Clear Cart?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-400 text-sm">
                  This will remove all {cart.length} items from your cart. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-sm">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearCart} 
                  className="bg-red-600 hover:bg-red-700 text-sm"
                >
                  Clear Cart
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

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
              <h3 className="font-semibold text-white text-lg sm:text-xl truncate mb-1">
                {item.title}
              </h3>
              
              {/* Stock Information */}
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-sm px-2 py-1 rounded-full ${
                  item.stock > 10 
                    ? 'bg-green-900/30 text-green-400' 
                    : item.stock > 0 
                    ? 'bg-yellow-900/30 text-yellow-400' 
                    : 'bg-red-900/30 text-red-400'
                }`}>
                  {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                </span>
              </div>
              
              {/* Price */}
              <div className="flex items-center gap-2 mb-2">
                {appliedDiscount && item.discountCodes.includes(appliedDiscount.id) ? (
                  <>
                    <span className="text-gray-400 line-through text-sm">
                      ${calculateOriginalItemPrice(item).toFixed(2)}
                    </span>
                    <span className="text-[#ff8800] font-bold text-lg">
                      ${calculateDiscountedItemPrice(item).toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#ff8800] font-bold text-lg">
                    ${calculateOriginalItemPrice(item).toFixed(2)}
                  </span>
                )}
                <span className="text-gray-400 text-sm">each</span>
              </div>

              {/* Quantity and Total */}
              <div className="flex items-center justify-between">
                <div className="flex items-center bg-gray-800 rounded-lg border border-gray-600">
                  <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                    className="bg-transparent hover:bg-gray-700 text-gray-300 h-8 w-8 p-0 rounded-r-none border-0 text-lg"
                    disabled={item.quantity <= 1}
                  >
                    -
                  </Button>
                  <Input
                    type="number"
                    min="1"
                    max={item.stock}
                    value={item.quantity}
                    onChange={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const validQuantity = Math.min(Math.max(newQuantity, 1), item.stock);
                      handleQuantityChange(item.id, validQuantity, item.stock);
                    }}
                    onBlur={(e) => {
                      const newQuantity = parseInt(e.target.value) || 1;
                      const validQuantity = Math.min(Math.max(newQuantity, 1), item.stock);
                      if (validQuantity !== parseInt(e.target.value)) {
                        handleQuantityChange(item.id, validQuantity, item.stock);
                      }
                    }}
                    className="w-12 h-8 text-center bg-gray-700 border-0 border-x border-gray-600 text-white text-lg font-medium rounded-none focus:ring-0 focus:border-gray-600 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                    className="bg-transparent hover:bg-gray-700 text-gray-300 h-8 w-8 p-0 rounded-l-none border-0 text-lg"
                    disabled={item.quantity >= item.stock}
                  >
                    +
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  {/* Item Total */}
                  <div className="text-right">
                    <div className="text-white font-bold text-xl">
                      ${(appliedDiscount && item.discountCodes.includes(appliedDiscount.id) 
                        ? calculateDiscountedItemPrice(item) * item.quantity 
                        : calculateOriginalItemPrice(item) * item.quantity
                      ).toFixed(2)}
                    </div>
                  </div>

                  {/* Save for Later (Wishlist) Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleAddToWishlist(item)}
                    className={`h-8 w-8 p-0 ${
                      wishlist.some((wishItem: any) => wishItem.id === item.id)
                        ? 'text-[#ff8800] hover:text-[#ff6600] hover:bg-orange-900/20' 
                        : 'text-gray-400 hover:text-[#ff8800] hover:bg-orange-900/20'
                    }`}
                    title={wishlist.some((wishItem: any) => wishItem.id === item.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart 
                      className="w-5 h-5" 
                      fill={wishlist.some((wishItem: any) => wishItem.id === item.id) ? '#ff8800' : 'none'}
                    />
                  </Button>

                  {/* Remove Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-red-400 hover:text-red-300 hover:bg-red-900/20 h-8 w-8 p-0"
                        title="Remove from cart"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gray-900 text-white border-gray-700 max-w-sm mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl">Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-400 text-lg">
                          This will remove "{item.title}" from your cart.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 border-gray-600 text-lg">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveItem(item.id)} 
                          className="bg-red-600 hover:bg-red-700 text-lg"
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
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700/50 shadow-lg">
        {/* Summary Header */}
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Order Summary</h2>
          <span className="text-lg text-gray-400">{cart.length} item{cart.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg text-gray-400">Subtotal</span>
            <span className="text-lg text-white font-medium">${calculateOriginalSubtotal().toFixed(2)}</span>
          </div>
          
          {appliedDiscount && (
            <div className="flex justify-between items-center text-green-400">
              <span className="flex items-center gap-2">
                <span className="text-lg">Discount</span>
                <span className="px-2 py-1 bg-green-900/30 rounded-full text-sm">
                  {appliedDiscount.public_name}
                </span>
              </span>
              <span className="font-medium text-lg">
                -${(calculateOriginalSubtotal() - calculateFinalTotal()).toFixed(2)}
              </span>
            </div>
          )}
          
          <div className="border-t border-gray-700 pt-2">
            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-white">Total</span>
              <span className="text-2xl font-bold text-[#ff8800]">${calculateFinalTotal().toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Discount Code Section */}
        <div className="mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter discount code"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
              className="flex-1 bg-gray-800 border-gray-600 text-white placeholder-gray-400 focus:border-[#ff8800] focus:ring-[#ff8800]/20 uppercase text-lg"
              style={{ textTransform: 'uppercase' }}
              disabled={isApplyingDiscount}
            />
            <Button 
              onClick={applyDiscountCode} 
              className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600 px-4 text-lg min-w-[80px]"
              disabled={isApplyingDiscount || !discountCode.trim()}
            >
              {isApplyingDiscount ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Applying...</span>
                </div>
              ) : (
                'Apply'
              )}
            </Button>
          </div>
        </div>
        
        {/* Checkout Button */}
        <Button 
          size="lg" 
          onClick={handleCheckout} 
          className="w-full bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-white font-semibold py-2.5 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-xl"
        >
          <span className="flex items-center justify-center gap-2">
            Proceed to Checkout
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default CartItems;
