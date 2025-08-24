"use client";

import React, { useState } from 'react';
import { Heart, Share2, ShoppingCart, Star, Truck, Shield, RotateCcw, Plus, Minus } from 'lucide-react';

interface ProductPageProps {
    product: any;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [selectedColor, setSelectedColor] = useState(product?.colors?.[0] || '');
    const [selectedSize, setSelectedSize] = useState(product?.sizes?.[0] || '');
    const [quantity, setQuantity] = useState(1);

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
                        <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] overflow-hidden aspect-square">
                            <img
                                src={product.images?.[selectedImageIndex]?.url || '/placeholder.svg'}
                                alt={product.title}
                                className="w-full h-full object-contain p-4"
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-3 overflow-x-auto pb-2">
                                {product.images.map((image: any, index: number) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`min-w-20 h-20 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border-2 overflow-hidden transition-all duration-200 ${selectedImageIndex === index
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
                                <div className="flex gap-2">
                                    <button className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-3 border border-[#232326] hover:border-[#ff8800] transition-all duration-200">
                                        <Heart className="w-5 h-5 text-gray-300 transition" />
                                    </button>
                                    <button className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl p-3 border border-[#232326] hover:border-[#ff8800] transition-all duration-200">
                                        <Share2 className="w-5 h-5 text-gray-300 transition" />
                                    </button>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="flex items-center gap-1 text-yellow-400">
                                    <Star className="w-4 h-4" />
                                    {typeof product.ratings === 'number' ? product.ratings : 0}
                                </span>
                                <span className="text-gray-400 text-sm">
                                    ({product.totalSales || 0} sales)
                                </span>
                                {product.stock && (
                                    <span className={`text-sm font-medium ${product.stock > 10 ? 'text-green-500' :
                                            product.stock > 0 ? 'text-yellow-500' : 'text-red-500'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                )}
                            </div>
                        </div>
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
                        {product.shortDescription && (
                            <p className="text-gray-300 text-sm leading-relaxed">
                                {product.shortDescription}
                            </p>
                        )}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white">Color</h3>
                                <div className="flex gap-3">
                                    {product.colors.map((color: string) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${selectedColor === color
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
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white">Size</h3>
                                <div className="flex gap-2 flex-wrap">
                                    {product.sizes.map((size: string) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-4 py-2 rounded-xl border transition-all duration-200 ${selectedSize === size
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
                        <div className="space-y-3">
                            <h3 className="font-semibold text-white">Quantity</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326]">
                                    <button
                                        onClick={() => setQuantity(quantity > 1 ? quantity - 1 : 1)}
                                        disabled={quantity <= 1}
                                        className="p-3 hover:bg-[#ff8800] hover:text-[#18181b] transition-all duration-200 rounded-l-xl disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="px-6 py-3 font-semibold text-center min-w-[60px]">
                                        {quantity}
                                    </span>
                                    <button
                                        onClick={() => setQuantity(quantity < product.stock ? quantity + 1 : quantity)}
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
                        <button
                            disabled={product.stock === 0}
                            className={`w-full py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-3 ${product.stock === 0
                                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                    : 'bg-[#ff8800] text-[#18181b] hover:bg-orange-600 hover:scale-[1.02]'
                                }`}
                        >
                            <ShoppingCart className="w-5 h-5" />
                            {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
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
                    </div>
                </div>
                {product.detailedDescription && (
                    <div className="mt-12 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
                        <h2 className="text-2xl font-bold text-white mb-4">Description</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                            {product.detailedDescription}
                        </p>
                    </div>
                )}
                {product.specifications && product.specifications.length > 0 && (
                    <div className="mt-8 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
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
                {product.tags && product.tags.length > 0 && (
                    <div className="mt-8 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
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
    );
};

export default ProductPage;
