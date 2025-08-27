"use client";

import React, { useState } from 'react';
import { Star, Truck, Shield, RotateCcw, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface ProductPageProps {
    product: any;
}

const ProductPage: React.FC<ProductPageProps> = ({ product }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    if (!product) {
        return (
            <div className="min-h-screen bg-[#18181b] flex items-center justify-center">
                <div className="text-white text-xl">Product not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#18181b] text-white">
            <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
                <div className="mb-8">
                    <Link href="/dashboard/products" className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#232326] text-gray-200 hover:bg-[#232326]/80 transition shadow border border-[#232326]">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="font-semibold">Back to Products</span>
                    </Link>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Images */}
                    <div className="space-y-6 flex flex-col items-center justify-center">
                        <div className="bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-3xl border-4 border-[#ff8800] shadow-xl overflow-hidden aspect-square w-full max-w-md flex items-center justify-center">
                            <img
                                src={product.images?.[selectedImageIndex]?.url || '/placeholder.svg'}
                                alt={product.title}
                                className="w-full h-full object-contain p-8 transition-transform duration-300 hover:scale-105"
                            />
                        </div>
                        {product.images && product.images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2">
                                {product.images.map((image: any, index: number) => (
                                    <button
                                        key={image.id}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`min-w-24 h-24 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border-2 overflow-hidden transition-all duration-200 ${selectedImageIndex === index
                                                ? 'border-[#ff8800] scale-110 shadow-lg'
                                                : 'border-[#232326] hover:border-[#ff8800]'
                                            }`}
                                    >
                                        <img
                                            src={image.url}
                                            alt={`${product.title} ${index + 1}`}
                                            className="w-full h-full object-contain p-2"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    {/* Product Details */}
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tight">
                                {product.title}
                            </h1>
                            <div className="flex flex-wrap gap-4 items-center">
                                <span className="text-lg bg-[#232326] px-4 py-2 rounded-full text-[#ff8800] font-semibold shadow">
                                    Category: {product.category} {product.subCategory && `• ${product.subCategory}`}
                                </span>
                                {product.brand && (
                                    <span className="text-lg bg-[#232326] px-4 py-2 rounded-full text-gray-300 font-semibold shadow">
                                        Brand: {product.brand}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-6 mt-2">
                                <span className="flex items-center gap-2 text-yellow-400 text-xl font-bold">
                                    <Star className="w-6 h-6" />
                                    {typeof product.ratings === 'number' ? product.ratings : 0}
                                </span>
                                <span className="text-gray-400 text-lg">
                                    ({product.totalSales || 0} sales)
                                </span>
                                {product.stock && (
                                    <span className={`text-lg font-bold px-4 py-2 rounded-full shadow ${product.stock > 10 ? 'bg-green-900 text-green-400' :
                                            product.stock > 0 ? 'bg-yellow-900 text-yellow-400' : 'bg-red-900 text-red-400'
                                        }`}>
                                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-extrabold text-[#ff8800] drop-shadow">
                                    ₦{product.salePrice?.toLocaleString()}
                                </span>
                                {product.regularPrice && product.regularPrice > product.salePrice && (
                                    <span className="text-2xl text-gray-400 line-through">
                                        ₦{product.regularPrice.toLocaleString()}
                                    </span>
                                )}
                            </div>
                            {product.regularPrice && product.regularPrice > product.salePrice && (
                                <span className="inline-block bg-[#ff8800] text-[#18181b] text-base font-bold px-4 py-2 rounded-full shadow">
                                    Save ₦{(product.regularPrice - product.salePrice).toLocaleString()}
                                </span>
                            )}
                        </div>
                        {product.shortDescription && (
                            <p className="text-gray-200 text-lg leading-relaxed bg-[#232326] rounded-xl p-6 shadow">
                                {product.shortDescription}
                            </p>
                        )}
                        {product.colors && product.colors.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white text-lg">Available Colors</h3>
                                <div className="flex gap-4">
                                    {product.colors.map((color: string) => (
                                        <span
                                            key={color}
                                            className="w-12 h-12 rounded-full border-4 border-[#232326] shadow inline-block"
                                            style={{ backgroundColor: color }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="space-y-3">
                                <h3 className="font-semibold text-white text-lg">Available Sizes</h3>
                                <div className="flex gap-3 flex-wrap">
                                    {product.sizes.map((size: string) => (
                                        <span
                                            key={size}
                                            className="px-5 py-2 rounded-xl border-2 text-lg font-semibold bg-[#232326] text-gray-200 border-[#232326] shadow"
                                        >
                                            {size}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
                            <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-2xl border-2 border-[#ff8800] shadow-lg">
                                <Truck className="w-7 h-7 text-[#ff8800]" />
                                <div>
                                    <p className="font-semibold text-lg">Free Delivery</p>
                                    <p className="text-sm text-gray-400">On orders over ₦10,000</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-2xl border-2 border-[#ff8800] shadow-lg">
                                <RotateCcw className="w-7 h-7 text-[#ff8800]" />
                                <div>
                                    <p className="font-semibold text-lg">Easy Returns</p>
                                    <p className="text-sm text-gray-400">7-day return policy</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-6 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-2xl border-2 border-[#ff8800] shadow-lg">
                                <Shield className="w-7 h-7 text-[#ff8800]" />
                                <div>
                                    <p className="font-semibold text-lg">Secure Payment</p>
                                    <p className="text-sm text-gray-400">100% protected</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {product.detailedDescription && (
                    <div className="mt-12 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-3xl border-2 border-[#ff8800] p-8 shadow-xl">
                        <h2 className="text-3xl font-extrabold text-white mb-6">Description</h2>
                        <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-line">
                            {product.detailedDescription}
                        </p>
                    </div>
                )}
                {product.specifications && product.specifications.length > 0 && (
                    <div className="mt-10 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-3xl border-2 border-[#ff8800] p-8 shadow-xl">
                        <h2 className="text-3xl font-extrabold text-white mb-6">Specifications</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {product.specifications.map((spec: string, index: number) => (
                                <div key={index} className="flex items-center gap-4 p-4 bg-[#18181b] rounded-xl shadow">
                                    <div className="w-3 h-3 bg-[#ff8800] rounded-full"></div>
                                    <span className="text-gray-200 text-lg">{spec}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                {product.tags && product.tags.length > 0 && (
                    <div className="mt-10 bg-gradient-to-br from-[#232326] via-[#232326] to-[#18181b] rounded-3xl border-2 border-[#ff8800] p-8 shadow-xl">
                        <h3 className="text-2xl font-extrabold text-white mb-6">Tags</h3>
                        <div className="flex flex-wrap gap-4">
                            {product.tags.map((tag: string, index: number) => (
                                <span
                                    key={index}
                                    className="px-4 py-2 bg-[#18181b] border-2 border-[#ff8800] rounded-full text-lg text-gray-200 font-semibold shadow hover:bg-[#232326] transition-all duration-200"
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
