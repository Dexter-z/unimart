"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, MapPin, Plus } from "lucide-react";
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
import { useQuery } from "@tanstack/react-query";

const CartItems: React.FC = () => {
  const { cart, removeFromCart, updateCartQuantity, addToWishlist, removeFromWishlist, wishlist } = useStore();
  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();
  const router = useRouter();
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<any>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);
  const [showRemoveWishlistDialog, setShowRemoveWishlistDialog] = useState(false);
  const [itemToRemoveFromWishlist, setItemToRemoveFromWishlist] = useState<any>(null);
  const [selectedAddressId, setSelectedAddressId] = useState("")

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
      // Show confirmation dialog before removing from wishlist
      setItemToRemoveFromWishlist(item);
      setShowRemoveWishlistDialog(true);
    } else {
      // Add to wishlist if not already there
      addToWishlist({ ...item, quantity: 1 }, user, JSON.stringify(location), deviceInfo);
    }
  };

  const confirmRemoveFromWishlist = () => {
    if (itemToRemoveFromWishlist) {
      removeFromWishlist(itemToRemoveFromWishlist.id, user, JSON.stringify(location), deviceInfo);
      setShowRemoveWishlistDialog(false);
      setItemToRemoveFromWishlist(null);
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
    if (!selectedAddressId) {
      alert("Please select a shipping address before proceeding to checkout");
      return;
    }

    console.log("Checkout clicked", {
      cart,
      subtotal: calculateOriginalSubtotal(),
      total: calculateFinalTotal(),
      appliedDiscount,
      selectedAddressId,
    });
  };

  const handleCardClick = (item: any) => {
    router.push(`/product/${item.slug}`);
  };

  //Get addresses
  const {data: addresses = []} = useQuery<any[], Error>({
    queryKey: ["shipping-addresses"],
    queryFn: async() => {
      const res = await axiosInstance.get("/api/shipping-addresses");
      return res.data.addresses
    }
  })

  useEffect(() => {
    if(addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(addr => addr.isDefault);
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
      }
    }
  }, [addresses, selectedAddressId])

  if (cart.length === 0) {
    return <p className="text-center text-gray-500">Your cart is empty, Start adding products</p>;
  }

  return (
    <div className="w-full space-y-4">
      {/* Clear Cart Button */}
      {cart.length > 0 && (
        <div className="flex justify-end mb-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="px-4 py-2 bg-gradient-to-b from-[#232326] to-[#18181b] border border-red-500/30 text-red-400 hover:border-red-500 hover:bg-red-900/10 rounded-xl transition-all duration-200 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear Cart ({cart.length} items)
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-gradient-to-b from-[#232326] to-[#18181b] text-white border-[#232326] max-w-md mx-4">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl text-white">Clear Cart?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-300">
                  This will remove all {cart.length} items from your cart. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2">
                <AlertDialogCancel className="bg-[#18181b] hover:bg-[#232326] border-[#232326] text-white">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleClearCart} 
                  className="bg-red-600 hover:bg-red-700"
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
          onClick={() => handleCardClick(item)}
          className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-4 sm:p-6 border border-[#232326] hover:border-[#ff8800] transition-all duration-200 shadow-lg group cursor-pointer"
        >
          <div className="flex items-start gap-4 sm:gap-6">
            {/* Product Image */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326] overflow-hidden">
                <Image
                  src={item.images[0].url}
                  alt={item.title}
                  width={96}
                  height={96}
                  className="w-full h-full rounded-xl object-cover group-hover:scale-105 transition-transform duration-200"
                />
              </div>
            </div>

            {/* Product Info - Main Content */}
            <div className="flex-1 space-y-3 sm:space-y-4 min-w-0">
              {/* Title and Actions Row */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-white text-sm sm:text-lg leading-tight mb-1 line-clamp-2">
                    {item.title}
                  </h3>
                  
                  {/* Stock Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`inline-flex items-center px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-medium ${
                      item.stock > 10 
                        ? 'bg-green-900/20 text-green-400 border border-green-500/20' 
                        : item.stock > 0 
                        ? 'bg-yellow-900/20 text-yellow-400 border border-yellow-500/20' 
                        : 'bg-red-900/20 text-red-400 border border-red-500/20'
                    }`}>
                      <div className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full mr-1 sm:mr-1.5 ${
                        item.stock > 10 ? 'bg-green-400' : item.stock > 0 ? 'bg-yellow-400' : 'bg-red-400'
                      }`}></div>
                      <span className="text-xs whitespace-nowrap">
                        {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                      </span>
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 ml-2 sm:ml-4">
                  {/* Wishlist Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddToWishlist(item);
                    }}
                    className={`p-1.5 sm:p-2 rounded-xl border transition-all duration-200 ${
                      wishlist.some((wishItem: any) => wishItem.id === item.id)
                        ? 'border-[#ff8800] bg-[#ff8800]/10 text-[#ff8800] hover:bg-[#ff8800]/20' 
                        : 'border-[#232326] bg-gradient-to-b from-[#232326] to-[#18181b] text-gray-400 hover:border-[#ff8800] hover:text-[#ff8800]'
                    }`}
                    title={wishlist.some((wishItem: any) => wishItem.id === item.id) ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart 
                      className="w-3 h-3 sm:w-4 sm:h-4" 
                      fill={wishlist.some((wishItem: any) => wishItem.id === item.id) ? '#ff8800' : 'none'}
                    />
                  </button>

                  {/* Remove Button */}
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button 
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 sm:p-2 rounded-xl border border-[#232326] bg-gradient-to-b from-[#232326] to-[#18181b] text-gray-400 hover:border-red-500 hover:text-red-400 hover:bg-red-900/10 transition-all duration-200"
                        title="Remove from cart"
                      >
                        <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-gradient-to-b from-[#232326] to-[#18181b] text-white border-[#232326] max-w-md mx-4">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-xl text-white">Remove Item?</AlertDialogTitle>
                        <AlertDialogDescription className="text-gray-300">
                          This will remove "{item.title}" from your cart.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2">
                        <AlertDialogCancel className="bg-[#18181b] hover:bg-[#232326] border-[#232326] text-white">
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleRemoveItem(item.id)} 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              {/* Price and Quantity Row */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                {/* Price Section */}
                <div className="space-y-1">
                  {appliedDiscount && item.discountCodes.includes(appliedDiscount.id) ? (
                    <div className="flex items-center gap-2 sm:gap-3">
                      <span className="text-gray-400 line-through text-xs sm:text-sm">
                        ₦{calculateOriginalItemPrice(item).toLocaleString()}
                      </span>
                      <span className="text-[#ff8800] font-bold text-sm sm:text-lg">
                        ₦{calculateDiscountedItemPrice(item).toLocaleString()}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[#ff8800] font-bold text-sm sm:text-lg">
                      ₦{calculateOriginalItemPrice(item).toLocaleString()}
                    </span>
                  )}
                  <p className="text-gray-400 text-xs">per item</p>
                </div>

                {/* Quantity Controls and Total */}
                <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4">
                  <div className="flex items-center bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                      disabled={item.quantity <= 1}
                      className="p-1.5 sm:p-2 hover:bg-[#ff8800] hover:text-[#18181b] transition-all duration-200 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <div className="px-3 py-1.5 sm:px-4 sm:py-2 font-semibold text-center min-w-[40px] sm:min-w-[50px] text-white text-sm sm:text-base">
                      {item.quantity}
                    </div>
                    <button
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                      disabled={item.quantity >= item.stock}
                      className="p-1.5 sm:p-2 hover:bg-[#ff8800] hover:text-[#18181b] transition-all duration-200 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  {/* Total Price */}
                  <div className="text-right">
                    <div className="text-white font-bold text-sm sm:text-xl">
                      ₦{(appliedDiscount && item.discountCodes.includes(appliedDiscount.id) 
                        ? calculateDiscountedItemPrice(item) * item.quantity 
                        : calculateOriginalItemPrice(item) * item.quantity
                      ).toLocaleString()}
                    </div>
                    <p className="text-gray-400 text-xs">total</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
      {/* Cart Summary */}
      <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-6 border border-[#232326] shadow-lg">
        {/* Summary Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-[#232326]">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Order Summary</h2>
          <span className="px-3 py-1 bg-[#ff8800]/10 border border-[#ff8800]/20 rounded-full text-[#ff8800] text-sm font-medium self-start sm:self-auto">
            {cart.length} item{cart.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-base sm:text-lg">Subtotal</span>
            <span className="text-white font-semibold text-base sm:text-lg">₦{calculateOriginalSubtotal().toLocaleString()}</span>
          </div>
          
          {appliedDiscount && (
            <div className="bg-green-900/10 border border-green-500/20 rounded-xl p-2.5 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-green-400">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm sm:text-base">Discount Applied</span>
                  <span className="px-2 py-0.5 bg-green-900/30 rounded-full text-xs font-medium text-green-400">
                    {appliedDiscount.public_name}
                  </span>
                </div>
                <span className="text-green-400 font-bold text-sm sm:text-base">
                  -₦{(calculateOriginalSubtotal() - calculateFinalTotal()).toLocaleString()}
                </span>
              </div>
            </div>
          )}
          
          <div className="border-t border-[#232326] pt-3">
            <div className="flex justify-between items-center">
              <span className="text-lg sm:text-xl font-bold text-white">Total</span>
              <span className="text-xl sm:text-2xl font-bold text-[#ff8800]">₦{calculateFinalTotal().toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Discount Code Section */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-2 text-sm sm:text-base">Have a discount code?</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Enter discount code"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                className="w-full bg-[#18181b] border-[#232326] text-white placeholder-gray-400 focus:border-[#ff8800] focus:ring-[#ff8800]/20 rounded-xl h-12 text-sm sm:text-base"
                style={{ textTransform: 'uppercase' }}
                disabled={isApplyingDiscount}
              />
            </div>
            <Button 
              onClick={applyDiscountCode} 
              className="bg-gradient-to-b from-[#232326] to-[#18181b] hover:bg-[#ff8800] hover:text-[#18181b] text-white border border-[#232326] hover:border-[#ff8800] px-4 sm:px-6 h-12 rounded-xl transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
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

        {/* Shipping Address Section */}
        <div className="mb-4">
          <label className="block text-white font-medium mb-2 text-sm sm:text-base">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ff8800]" />
              <span>Shipping Address</span>
            </div>
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1">
              <select
                value={selectedAddressId}
                onChange={(e) => setSelectedAddressId(e.target.value)}
                className="w-full bg-[#18181b] border border-[#232326] text-white focus:border-[#ff8800] focus:ring-1 focus:ring-[#ff8800]/20 rounded-xl h-12 px-3 text-sm sm:text-base appearance-none cursor-pointer"
                style={{
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '16px'
                }}
              >
                <option value="" disabled className="text-gray-400">
                  Select shipping address
                </option>
                {addresses.length > 0 ? (
                  addresses.map((address: any) => (
                    <option 
                      key={address.id} 
                      value={address.id}
                      className="bg-[#18181b] text-white"
                    >
                      {address.name} • {address.address}, {address.city}
                      {address.isDefault ? " (Default)" : ""}
                    </option>
                  ))
                ) : (
                  <option value="" disabled className="text-gray-500">
                    No addresses found
                  </option>
                )}
              </select>
            </div>
            <Button
              onClick={() => router.push('/profile?tab=address')}
              className="bg-gradient-to-b from-[#232326] to-[#18181b] hover:bg-white hover:text-[#ff8800] text-white border border-[#232326] hover:border-[#ff8800] px-4 sm:px-6 h-12 rounded-xl transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
              title="Add new address"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Address
            </Button>
          </div>
          {selectedAddressId && addresses.length > 0 && (
            <div className="mt-2 p-3 bg-[#ff8800]/5 border border-[#ff8800]/20 rounded-xl">
              {(() => {
                const selectedAddress = addresses.find((addr: any) => addr.id === selectedAddressId);
                return selectedAddress ? (
                  <div className="text-sm text-gray-300">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-white">{selectedAddress.name}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-400">{selectedAddress.phone}</span>
                    </div>
                    <div className="text-gray-400">
                      {selectedAddress.address}
                      {selectedAddress.landmark && `, ${selectedAddress.landmark}`}
                    </div>
                    <div className="text-gray-400">
                      {selectedAddress.city}, {selectedAddress.state}
                    </div>
                  </div>
                ) : null;
              })()}
            </div>
          )}
        </div>
        
        {/* Checkout Button */}
        <Button 
          size="lg" 
          onClick={handleCheckout} 
          className="w-full bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-[#18181b] font-bold py-3 sm:py-4 rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200 text-base sm:text-lg"
        >
          <span className="flex items-center justify-center gap-2 sm:gap-3">
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span className="whitespace-nowrap">Proceed to Checkout</span>
            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Button>
      </div>

      {/* Wishlist Removal Confirmation Dialog */}
      {showRemoveWishlistDialog && itemToRemoveFromWishlist && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-[#232326] border border-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-white mb-2">
              Remove from Wishlist
            </h3>
            <p className="text-gray-300 text-sm mb-6">
              Are you sure you want to remove "{itemToRemoveFromWishlist.title}" from your wishlist?
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowRemoveWishlistDialog(false);
                  setItemToRemoveFromWishlist(null);
                }}
                className="px-4 py-2 text-sm border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRemoveFromWishlist}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 text-white"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartItems;
