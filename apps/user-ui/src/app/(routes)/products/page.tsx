"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Filter, X, Grid, List, ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from '@/components/product-card'
import {Range} from "react-range"

const Page = () => {
    const router = useRouter()
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const updateURL = () => {
        const params = new URLSearchParams();
        params.set("priceRange", priceRange.join(","));

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        }

        if (selectedSizes.length > 0) {
            params.set("sizes", selectedSizes.join(","))
        }

        if (selectedColors.length > 0) {
            params.set("colors", selectedColors.join(","))
        }

        params.set("page", page.toString())
        router.replace(`/products?${decodeURIComponent(params.toString())}`);
    }

    const fetchFilteredProducts = async () => {
        setIsProductLoading(true);

        try {
            const query = new URLSearchParams()

            query.set("priceRange", priceRange.join(","))
            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","))
            }

            if (selectedSizes.length > 0) {
                query.set("sizes", selectedSizes.join(","))
            }

            if (selectedColors.length > 0) {
                query.set("colors", selectedColors.join(","))
            }

            query.set("page", page.toString())
            query.set("limit", "12")

            const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`)
            setProducts(res.data.products)
            setTotalPages(res.data.pagination.totalPages)

        } catch (error) {
            console.log("Error fetching filtered products:", error);
        } finally {
            setIsProductLoading(false);
        }
    }

    useEffect(() => {
        updateURL()
        fetchFilteredProducts();
    }, [priceRange, selectedCategories, selectedSizes, selectedColors, page]);

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-categories")
            return res.data
        },
        staleTime: 1000 * 60 * 30, //30 minutes
    })

    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
        setPage(1);
    };

    const handleSizeToggle = (size: string) => {
        setSelectedSizes(prev => 
            prev.includes(size) 
                ? prev.filter(s => s !== size)
                : [...prev, size]
        );
        setPage(1);
    };

    const handleColorToggle = (color: string) => {
        setSelectedColors(prev => 
            prev.includes(color) 
                ? prev.filter(c => c !== color)
                : [...prev, color]
        );
        setPage(1);
    };

    const clearAllFilters = () => {
        setPriceRange([0, 1199]);
        setTempPriceRange([0, 1199]);
        setSelectedCategories([]);
        setSelectedSizes([]);
        setSelectedColors([]);
        setPage(1);
    };

    const applyFilters = () => {
        setPriceRange(tempPriceRange);
        setPage(1);
        setShowFilters(false);
    };

    const generatePageNumbers = () => {
        const pages = [];
        const maxVisible = 5;
        let start = Math.max(1, page - Math.floor(maxVisible / 2));
        let end = Math.min(totalPages, start + maxVisible - 1);
        
        if (end - start < maxVisible - 1) {
            start = Math.max(1, end - maxVisible + 1);
        }
        
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        return pages;
    };

    const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', '42'];
    const availableColors = ['Red', 'Blue', 'Green', 'Yellow', 'Black', 'White', 'Gray', 'Pink', 'Purple', 'Orange'];

    return (
        <div className="min-h-screen bg-[#18181b]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">All Products</h1>
                    <p className="text-gray-400">
                        Showing {products.length} of {totalPages * 12} products
                    </p>
                </div>

                {/* Top Bar - Filters, View Toggle */}
                <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-4 mb-6">
                    <div className="flex items-center justify-end gap-3">
                        {/* Filters Button */}
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 1199) && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {selectedCategories.length + selectedSizes.length + selectedColors.length + (priceRange[0] > 0 || priceRange[1] < 1199 ? 1 : 0)}
                                </span>
                            )}
                        </button>

                        {/* View Mode Toggle */}
                        <div className="flex bg-[#18181b] border border-[#232326] rounded-xl overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-[#ff8800] text-[#18181b]' : 'text-gray-400 hover:text-white'} transition-all duration-200`}
                            >
                                <Grid className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-[#ff8800] text-[#18181b]' : 'text-gray-400 hover:text-white'} transition-all duration-200`}
                            >
                                <List className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Active Filters */}
                    {(selectedCategories.length > 0 || selectedSizes.length > 0 || selectedColors.length > 0 || priceRange[0] > 0 || priceRange[1] < 1199) && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#232326]">
                            {selectedCategories.map(category => (
                                <span key={category} className="inline-flex items-center gap-1 px-3 py-1 bg-[#ff8800] text-[#18181b] rounded-full text-sm font-medium">
                                    {category}
                                    <button onClick={() => handleCategoryToggle(category)} className="hover:bg-orange-600 rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedSizes.map(size => (
                                <span key={size} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium">
                                    Size: {size}
                                    <button onClick={() => handleSizeToggle(size)} className="hover:bg-blue-700 rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedColors.map(color => (
                                <span key={color} className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-full text-sm font-medium">
                                    {color}
                                    <button onClick={() => handleColorToggle(color)} className="hover:bg-green-700 rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {(priceRange[0] > 0 || priceRange[1] < 1199) && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-medium">
                                    ₦{priceRange[0].toLocaleString()} - ₦{priceRange[1].toLocaleString()}
                                    <button onClick={() => setPriceRange([0, 1199])} className="hover:bg-purple-700 rounded-full p-0.5">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-1 text-red-400 hover:text-red-300 text-sm font-medium border border-red-400 hover:border-red-300 rounded-full transition-all duration-200"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Products Grid */}
                {isProductLoading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-2 auto-rows-fr">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="bg-[#232326] rounded-xl flex flex-col items-center animate-pulse border border-[#232326] shadow-sm min-h-[280px] aspect-[3/4] overflow-hidden">
                                <div className="w-full" style={{ height: '66%' }}>
                                    <div className="w-full h-full bg-gray-700" />
                                </div>
                                <div className="flex-1 w-full flex flex-col items-center justify-between p-4">
                                    <div className="w-full min-h-[2.5rem] bg-gray-700 rounded mb-2" />
                                    <div className="w-12 h-3 bg-gray-700 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <div className={`grid ${viewMode === 'grid' 
                        ? 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-2 auto-rows-fr' 
                        : 'grid-cols-1 gap-4'
                    }`}>
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} isEvent={false} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-4">No products found</div>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isProductLoading && (
                    <div className="mt-8 flex justify-center">
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(Math.max(1, page - 1))}
                                disabled={page === 1}
                                className="p-2 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326] text-white hover:border-[#ff8800] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft className="w-4 h-4" />
                            </button>

                            {generatePageNumbers().map(pageNum => (
                                <button
                                    key={pageNum}
                                    onClick={() => setPage(pageNum)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                                        page === pageNum 
                                            ? 'bg-[#ff8800] text-[#18181b]' 
                                            : 'bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] text-white hover:border-[#ff8800]'
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            ))}

                            <button
                                onClick={() => setPage(Math.min(totalPages, page + 1))}
                                disabled={page === totalPages}
                                className="p-2 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-xl border border-[#232326] text-white hover:border-[#ff8800] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Filter Dialog */}
            {showFilters && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] max-w-2xl w-full mx-auto max-h-[80vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#232326]">
                            <h2 className="text-2xl font-bold text-white">Filter Products</h2>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-[#ff8800] hover:text-[#18181b] rounded-xl transition-all duration-200 text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Price Range */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Price Range</h3>
                                <div className="px-4">
                                    <Range
                                        step={1}
                                        min={0}
                                        max={1199}
                                        values={tempPriceRange}
                                        onChange={(values) => setTempPriceRange(values)}
                                        renderTrack={({ props, children }) => (
                                            <div
                                                {...props}
                                                className="h-2 bg-[#18181b] rounded-full"
                                                style={{
                                                    ...props.style,
                                                    background: `linear-gradient(to right, #18181b 0%, #18181b ${((tempPriceRange[0] - 0) / (1199 - 0)) * 100}%, #ff8800 ${((tempPriceRange[0] - 0) / (1199 - 0)) * 100}%, #ff8800 ${((tempPriceRange[1] - 0) / (1199 - 0)) * 100}%, #18181b ${((tempPriceRange[1] - 0) / (1199 - 0)) * 100}%, #18181b 100%)`
                                                }}
                                            >
                                                {children}
                                            </div>
                                        )}
                                        renderThumb={({ props, isDragged }) => (
                                            <div
                                                {...props}
                                                className={`h-5 w-5 bg-[#ff8800] rounded-full shadow-lg focus:outline-none transition-transform duration-150 ${
                                                    isDragged ? 'scale-110' : 'hover:scale-105'
                                                }`}
                                                style={{
                                                    ...props.style
                                                }}
                                            />
                                        )}
                                    />
                                    <div className="flex justify-between mt-2 text-sm text-gray-300">
                                        <span>₦{tempPriceRange[0].toLocaleString()}</span>
                                        <span>₦{tempPriceRange[1].toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Categories */}
                            {data?.categories && data.categories.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {data.categories.map((category: string) => (
                                            <label key={category} className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category)}
                                                    onChange={() => handleCategoryToggle(category)}
                                                    className="w-4 h-4 text-[#ff8800] bg-[#18181b] border-[#232326] rounded focus:ring-[#ff8800] focus:ring-2"
                                                />
                                                <span className="text-gray-300">{category}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Sizes */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Sizes</h3>
                                <div className="flex flex-wrap gap-2">
                                    {availableSizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => handleSizeToggle(size)}
                                            className={`px-3 py-2 rounded-xl border transition-all duration-200 ${
                                                selectedSizes.includes(size)
                                                    ? 'border-[#ff8800] bg-[#ff8800] text-[#18181b] font-semibold'
                                                    : 'border-[#232326] bg-[#18181b] text-white hover:border-[#ff8800]'
                                            }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Colors */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Colors</h3>
                                <div className="flex flex-wrap gap-3">
                                    {availableColors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => handleColorToggle(color)}
                                            className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                                                selectedColors.includes(color)
                                                    ? 'border-[#ff8800] scale-110'
                                                    : 'border-[#232326] hover:border-[#ff8800]'
                                            }`}
                                            style={{ backgroundColor: color.toLowerCase() }}
                                            title={color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex gap-3 p-6 border-t border-[#232326]">
                            <button
                                onClick={clearAllFilters}
                                className="flex-1 py-3 px-4 bg-[#18181b] border border-[#232326] text-white rounded-xl hover:border-[#ff8800] transition-all duration-200"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 py-3 px-4 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default Page
