"use client";

import React, { useState, useEffect } from 'react';
import { Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';
import { useStore } from '@/store';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking'; 
import useDeviceTracking from '@/hooks/useDeviceTracking';
import Ratings from '@/components/ratings';
import ShareModal from '@/components/share-modal';

interface ProductPageProps {
  product: any;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
  const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const [showRemoveCartDialog, setShowRemoveCartDialog] = useState(false);

  const { user } = useUser();
  const location = useLocationTracking();
  const deviceInfo = useDeviceTracking();

  const addToCart = useStore((state: any) => state.addToCart);
  const removeFromCart = useStore((state: any) => state.removeFromCart);
  const cart = useStore((state: any) => state.cart);
  const isInCart = cart.some((item: any) => item.id === product.id);

  const addToWishlist = useStore((state: any) => state.addToWishlist);
  const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
  const wishlist = useStore((state: any) => state.wishlist);
  const isWishlisted = wishlist.some((item: any) => item.id === product.id);

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
  };

  const handleQuantityChange = (action: 'increment' | 'decrement') => {
    if (action === 'increment' && quantity < product.stock) {
      setQuantity(prev => prev + 1);
    } else if (action === 'decrement' && quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const handleWishlistClick = () => {
    if (isWishlisted) {
      setShowRemoveDialog(true);
    } else {
      addToWishlist({ ...product, quantity: 1 }, user, location, deviceInfo);
    }
  };

  const handleAddToCartClick = () => {
    if (!isInCart) {
      addToCart({ 
        ...product, 
        quantity,
        selectedColor,
        selectedSize 
      }, user, location, deviceInfo);
    } else {
      setShowRemoveCartDialog(true);
    }
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  const handleChatClick = () => {
    
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
        <div className="text-white text-xl">Product not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#18181b] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] overflow-hidden aspect-square">
              <img
                src={product.images?.[selectedImageIndex]?.url || '/placeholder.svg'}
                alt={product.title}
                className="w-full h-full object-contain p-4"
              />
            </div>
            
            {/* Thumbnail Images */}
            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {product.images.map((image: any, index: number) => (
                  <button
                    key={image.id}
                    onClick={() => handleImageClick(index)}
                    className={`min-w-20 h-20 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border-2 overflow-hidden transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-[#ff8800] scale-105' 
                        : 'border-[#232326] hover:border-[#ff8800]'
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={`${product.title} ${index + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            {/* Header */}
            <div className="space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                    {product.title}
                  </h1>
                  <p className="text-gray-400 text-sm">
                    Category: {product.category} {product.subCategory && `• ${product.subCategory}`}
                  </p>
                  {product.brand && (
                    <p className="text-gray-400 text-sm">
                      Brand: {product.brand}
                    </p>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={handleWishlistClick}
                    className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-3 border border-[#232326] hover:border-[#ff8800] transition-all duration-200"
                  >
                    <Heart
                      className={`w-5 h-5 ${isWishlisted ? 'fill-[#ff8800] text-[#ff8800]' : 'text-gray-300'} transition`}
                      fill={isWishlisted ? '#ff8800' : 'none'}
                    />
                  </button>
                  <button
                    onClick={handleShareClick}
                    className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-3 border border-[#232326] hover:border-[#ff8800] transition-all duration-200"
                  >
                    <Share2 className="w-5 h-5 text-gray-300 hover:text-[#ff8800] transition" />
                  </button>
                </div>
              </div>

              {/* Rating and Reviews */}
              <div className="flex items-center gap-4">
                <Ratings rating={typeof product.ratings === 'number' ? product.ratings : 0} />
                <span className="text-gray-400 text-sm">
                  ({product.totalSales || 0} sales)
                </span>
                {product.stock && (
                  <span className={`text-sm font-medium ${
                    product.stock > 10 ? 'text-green-500' : 
                    product.stock > 0 ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                  </span>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-[#ff8800]">
                  ₦{product.salePrice?.toLocaleString()}
                </span>
                {product.regularPrice && product.regularPrice > product.salePrice && (
                  <span className="text-lg text-gray-400 line-through">
                    ₦{product.regularPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {product.regularPrice && product.regularPrice > product.salePrice && (
                <span className="inline-block bg-[#ff8800] text-[#18181b] text-xs font-bold px-2 py-1 rounded-full">
                  Save ₦{(product.regularPrice - product.salePrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Short Description */}
            {product.shortDescription && (
              <p className="text-gray-300 text-sm leading-relaxed">
                {product.shortDescription}
              </p>
            )}

            {/* Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Color</h3>
                <div className="flex gap-3">
                  {product.colors.map((color: string) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        selectedColor === color 
                          ? 'border-[#ff8800] scale-110' 
                          : 'border-[#232326] hover:border-[#ff8800]'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Size</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 rounded-xl border transition-all duration-200 ${
                        selectedSize === size
                          ? 'border-[#ff8800] bg-[#ff8800] text-[#18181b] font-semibold'
                          : 'border-[#232326] bg-gradient-to-b from-[#232326] to-[#18181b] text-white hover:border-[#ff8800]'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="space-y-3">
              <h3 className="font-semibold text-white">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                  <button
                    onClick={() => handleQuantityChange('decrement')}
                    disabled={quantity <= 1}
                    className="p-3 hover:bg-[#ff8800] hover:text-[#18181b] transition-all duration-200 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-6 py-3 font-semibold text-center min-w-[60px]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange('increment')}
                    disabled={quantity >= product.stock}
                    className="p-3 hover:bg-[#ff8800] hover:text-[#18181b] transition-all duration-200 rounded-r-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-gray-400 text-sm">
                  {product.stock} available
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCartClick}
              disabled={product.stock === 0}
              className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                product.stock === 0
                  ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  : isInCart
                  ? 'bg-[#232326] border-2 border-[#ff8800] text-[#ff8800] hover:bg-[#ff8800] hover:text-[#18181b]'
                  : 'bg-[#ff8800] text-[#18181b] hover:bg-orange-600 hover:scale-[1.02]'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {product.stock === 0 
                ? 'Out of Stock' 
                : isInCart 
                ? 'Already in Cart' 
                : 'Add to Cart'
              }
            </button>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                <Truck className="w-5 h-5 text-[#ff8800]" />
                <div>
                  <p className="font-semibold text-sm">Free Delivery</p>
                  <p className="text-xs text-gray-400">On orders over ₦10,000</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                <RotateCcw className="w-5 h-5 text-[#ff8800]" />
                <div>
                  <p className="font-semibold text-sm">Easy Returns</p>
                  <p className="text-xs text-gray-400">7-day return policy</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                <Shield className="w-5 h-5 text-[#ff8800]" />
                <div>
                  <p className="font-semibold text-sm">Secure Payment</p>
                  <p className="text-xs text-gray-400">100% protected</p>
                </div>
              </div>
            </div>

            {/* Shop Information */}
            {product.Shop && (
              <div className="p-4 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                <div className="mb-3">
                  <h3 className="font-semibold text-white inline">Sold by </h3>
                  <span className="font-medium text-[#ff8800]">{product.Shop.name}</span>
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-400">{product.Shop.bio}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={handleChatClick}
                    className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200 flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Chat with Seller
                  </button>
                  <button className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200">
                    View Shop
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Detailed Description & Specifications */}
        <div className="mt-12 space-y-8">
          {/* Description */}
          {product.detailedDescription && (
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
              <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                {product.detailedDescription}
              </p>
            </div>
          )}

          {/* Specifications */}
          {product.specifications && product.specifications.length > 0 && (
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <h2 className="text-2xl font-bold text-white mb-4">Specifications</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {product.specifications.map((spec: string, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-[#18181b] rounded-xl">
                    <div className="w-2 h-2 bg-[#ff8800] rounded-full"></div>
                    <span className="text-gray-300">{spec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cash on Delivery */}
            {product.cashOnDelivery && (
              <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
                <h3 className="text-xl font-bold text-white mb-3">Payment Options</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Cash on Delivery Available</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Online Payment Accepted</span>
                  </div>
                </div>
              </div>
            )}

            {/* Warranty */}
            {product.warranty && (
              <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
                <h3 className="text-xl font-bold text-white mb-3">Warranty</h3>
                <p className="text-gray-300">{product.warranty}</p>
              </div>
            )}
          </div>

          {/* Tags */}
          {product.tags && product.tags.length > 0 && (
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
              <h3 className="text-xl font-bold text-white mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-[#18181b] border border-[#232326] rounded-full text-sm text-gray-300 hover:border-[#ff8800] transition-all duration-200"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Remove from Wishlist Dialog */}
      {showRemoveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] max-w-md w-full mx-auto p-6">
            <h3 className="text-xl font-bold text-white mb-4">Remove from Wishlist</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove "{product.title}" from your wishlist?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveDialog(false)}
                className="flex-1 py-3 px-4 bg-[#18181b] border border-[#232326] text-white rounded-xl hover:border-[#ff8800] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeFromWishlist(product.id, user, location, deviceInfo);
                  setShowRemoveDialog(false);
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove from Cart Dialog */}
      {showRemoveCartDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] max-w-md w-full mx-auto p-6">
            <h3 className="text-xl font-bold text-white mb-4">Remove from Cart</h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to remove "{product.title}" from your cart?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRemoveCartDialog(false)}
                className="flex-1 py-3 px-4 bg-[#18181b] border border-[#232326] text-white rounded-xl hover:border-[#ff8800] transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  removeFromCart(product.id, user, location, deviceInfo);
                  setShowRemoveCartDialog(false);
                }}
                className="flex-1 py-3 px-4 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all duration-200"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareModal 
          productUrl={typeof window !== 'undefined' ? window.location.href : ''}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </div>
  );
};

export default ProductPage;
