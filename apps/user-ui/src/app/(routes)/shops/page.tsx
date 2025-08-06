"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { Filter, X, Grid, List, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { SHOP_CATEGORIES, getCategoryLabel } from '@/configs/categories'

const Page = () => {
    const router = useRouter()
    const searchParams = useSearchParams()
    const [isShopLoading, setIsShopLoading] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [shops, setShops] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize search query from URL parameters
    useEffect(() => {
        const q = searchParams.get('q');
        if (q) {
            setSearchQuery(q);
        }
    }, [searchParams]);

    const updateURL = () => {
        const params = new URLSearchParams();

        if (searchQuery.trim()) {
            params.set("q", searchQuery);
        }

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        }

        if (selectedCountries.length > 0) {
            params.set("countries", selectedCountries.join(","))
        }

        params.set("page", page.toString())
        router.replace(`/shops?${decodeURIComponent(params.toString())}`);
    }

    const fetchFilteredShops = async () => {
        setIsShopLoading(true);

        try {
            const query = new URLSearchParams()

            if (searchQuery.trim()) {
                query.set("q", searchQuery);
            }

            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","))
            }

            if (selectedCountries.length > 0) {
                query.set("countries", selectedCountries.join(","))
            }

            query.set("page", page.toString())
            query.set("limit", "12")

            const res = await axiosInstance.get(`/product/api/get-filtered-shops?${query.toString()}`)
            setShops(res.data.shops)
            setTotalPages(res.data.pagination.totalPages)

        } catch (error) {
            console.log("Error fetching filtered shops:", error);
        } finally {
            setIsShopLoading(false);
        }
    }

    const debouncedFetch = () => {
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        debounceTimerRef.current = setTimeout(() => {
            updateURL();
            fetchFilteredShops();
        }, 500); // 500ms delay
    };

    // Cleanup function
    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        // For immediate actions like pagination, category selection, etc.
        if (page !== 1 || selectedCategories.length > 0 || selectedCountries.length > 0) {
            updateURL();
            fetchFilteredShops();
        } else {
            // For search queries, use debouncing
            debouncedFetch();
        }
    }, [selectedCategories, selectedCountries, page, searchQuery]);

    const handleSearchSubmit = () => {
        setPage(1);
        updateURL();
        fetchFilteredShops();
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchSubmit();
        }
    };

    const availableCountries = ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Egypt', 'Morocco', 'Uganda', 'Tanzania'];


    const handleCategoryToggle = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
        setPage(1);
    };

    const handleCountryToggle = (country: string) => {
        setSelectedCountries(prev => 
            prev.includes(country) 
                ? prev.filter(c => c !== country)
                : [...prev, country]
        );
        setPage(1);
    };

    const clearAllFilters = () => {
        setSelectedCategories([]);
        setSelectedCountries([]);
        setPage(1);
    };

    const applyFilters = () => {
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

    // const { data, isLoading } = useQuery({
    //     queryKey: ["categories"],
    //     queryFn: async () => {
    //         const res = await axiosInstance.get("/product/api/get-categories")
    //         return res.data
    //     },
    //     staleTime: 1000 * 60 * 30, //30 minutes
    // })


    return (
        <div className="min-h-[130vh] bg-[#18181b]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">All Shops</h1>
                    <p className="text-gray-400">
                        Showing {shops.length} of {totalPages * 12} shops
                    </p>
                </div>

                {/* Search Bar */}
                <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-4 mb-6">
                    <div className="relative flex items-center max-w-2xl mx-auto">
                        <input
                            type="text"
                            placeholder='Search shops...'
                            className='w-full px-4 pr-12 font-medium border-2 border-[#ff8800] outline-none h-12 rounded-full shadow-sm focus:ring-2 focus:ring-orange-200 transition bg-[#232326] text-white placeholder-gray-300'
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <button
                            className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center bg-[#ff8800] rounded-full shadow-md hover:bg-orange-600 transition'
                            onClick={handleSearchSubmit}
                        >
                            <Search color='#18181b' size={20} />
                        </button>
                    </div>
                </div>

                {/* Top Bar - Filters, View Toggle */}
                <div className="bg-gradient-to-r from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-4 mb-6">
                    <div className="flex items-center justify-between gap-3">
                        {/* Filters Button */}
                        <button
                            onClick={() => setShowFilters(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
                        >
                            <Filter className="w-4 h-4" />
                            Filters
                            {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
                                <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                    {selectedCategories.length + selectedCountries.length}
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
                    {(selectedCategories.length > 0 || selectedCountries.length > 0) && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-[#232326]">
                            {selectedCategories.map(category => (
                                <span key={category} className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#232326] to-[#18181b] border border-[#ff8800] text-white rounded-full text-sm font-medium">
                                    Category: {getCategoryLabel(category)}
                                    <button onClick={() => handleCategoryToggle(category)} className="text-[#ff8800] hover:text-red-400 rounded-full p-0.5 transition-colors duration-200">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            {selectedCountries.map(country => (
                                <span key={country} className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-[#232326] to-[#18181b] border border-[#ff8800] text-white rounded-full text-sm font-medium">
                                    Country: {country}
                                    <button onClick={() => handleCountryToggle(country)} className="text-[#ff8800] hover:text-red-400 rounded-full p-0.5 transition-colors duration-200">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            ))}
                            <button
                                onClick={clearAllFilters}
                                className="px-3 py-1 text-[#ff8800] hover:text-orange-400 text-sm font-medium border border-[#ff8800] hover:border-orange-400 rounded-full transition-all duration-200"
                            >
                                Clear All
                            </button>
                        </div>
                    )}
                </div>

                {/* Shops Grid */}
                {isShopLoading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {Array.from({ length: 12 }).map((_, index) => (
                            <div key={index} className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6 animate-pulse">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-16 h-16 bg-gray-700 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-700 rounded mb-2" />
                                        <div className="h-3 bg-gray-700 rounded w-3/4" />
                                    </div>
                                </div>
                                <div className="h-3 bg-gray-700 rounded mb-2" />
                                <div className="h-3 bg-gray-700 rounded w-2/3 mb-4" />
                                <div className="flex justify-between items-center">
                                    <div className="h-4 bg-gray-700 rounded w-20" />
                                    <div className="h-6 bg-gray-700 rounded w-16" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : shops.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {shops.map((shop: any) => (
                            <div key={shop.id} className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] hover:border-[#ff8800] transition-all duration-200 p-6 cursor-pointer group">
                                <div className="flex items-center space-x-4 mb-4">
                                    <img 
                                        src={shop.avatar || '/api/placeholder/64/64'} 
                                        alt={shop.name}
                                        className="w-16 h-16 rounded-xl object-cover border-2 border-[#232326] group-hover:border-[#ff8800] transition-all duration-200"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-white font-semibold text-2xl truncate group-hover:text-[#ff8800] transition-colors duration-200">
                                            {shop.name}
                                        </h3>
                                        <p className="text-[#ff8800] text-base font-medium">
                                            {getCategoryLabel(shop.category)}
                                        </p>
                                    </div>
                                </div>
                                
                                <p className="text-gray-400 text-base mb-4 line-clamp-2">
                                    {shop.bio || 'No description available'}
                                </p>
                                
                                <div className="flex items-center justify-between text-base">
                                    <div className="flex items-center space-x-4">
                                        <div className="flex items-center space-x-1">
                                            <span className="text-yellow-500">★</span>
                                            <span className="text-white">{shop.ratings || '5.0'}</span>
                                        </div>
                                        <div className="text-gray-400">
                                            {shop.followers?.length || 0} followers
                                        </div>
                                    </div>
                                    <div className="text-gray-400">
                                        {shop.products?.length || 0} products
                                    </div>
                                </div>
                                
                                <div className="mt-4 pt-4 border-t border-[#232326]">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-400 text-sm truncate flex-1 mr-4">
                                            📍 {shop.address}
                                        </p>
                                        <Link
                                            href={`/shop/${shop.id}`}
                                            className="px-4 py-2 bg-[#ff8800] text-[#18181b] rounded-lg text-sm font-semibold hover:bg-orange-600 transition-all duration-200 whitespace-nowrap"
                                        >
                                            Visit Shop
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg mb-4">No shops found</div>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isShopLoading && (
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
                            <h2 className="text-2xl font-bold text-white">Filter Shops</h2>
                            <button
                                onClick={() => setShowFilters(false)}
                                className="p-2 hover:bg-[#ff8800] hover:text-[#18181b] rounded-xl transition-all duration-200 text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Categories */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Categories</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {SHOP_CATEGORIES.map((category) => (
                                        <label key={category.value} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCategories.includes(category.value)}
                                                onChange={() => handleCategoryToggle(category.value)}
                                                className="w-4 h-4 text-[#ff8800] bg-[#18181b] border-[#232326] rounded focus:ring-[#ff8800] focus:ring-2"
                                            />
                                            <span className="text-gray-300">{category.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Countries */}
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-4">Countries</h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {availableCountries.map((country: string) => (
                                        <label key={country} className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedCountries.includes(country)}
                                                onChange={() => handleCountryToggle(country)}
                                                className="w-4 h-4 text-[#ff8800] bg-[#18181b] border-[#232326] rounded focus:ring-[#ff8800] focus:ring-2"
                                            />
                                            <span className="text-gray-300">{country}</span>
                                        </label>
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
