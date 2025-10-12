"use client"

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState, useRef, useEffect } from 'react'
import { HeartIcon, Search, ShoppingCart, UserRound } from 'lucide-react';
import HeaderBottom from './header-bottom';
import useUser from '@/hooks/useUser';
import axiosInstance from '@/utils/axiosInstance';
import { useStore } from '@/store';
import useLayout from '@/hooks/useLayout';

const Header = () => {
    const router = useRouter()
    const { user, isLoading } = useUser()
    //const { layout } = useLayout();
    //For a dynamic logo, you can use layout?.logo

    const [searchQuery, setSearchQuery] = useState("")
    const [suggestions, setSuggestions] = useState<any[]>([])
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)
    const debounceTimeout = useRef<NodeJS.Timeout | null>(null)
    const searchRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)
    const cart = useStore((state: any) => state.cart);
    const wishlist = useStore((state: any) => state.wishlist);

    // Dynamic suggestions as user types (debounced)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSuggestions([])
            setLoadingSuggestions(false)
            setShowSuggestions(false)
            return
        }
        setLoadingSuggestions(true)
        setShowSuggestions(true)
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        debounceTimeout.current = setTimeout(async () => {
            try {
                const res = await axiosInstance.get(`/product/api/search-products?q=${encodeURIComponent(searchQuery)}`)
                setSuggestions(res.data.products.slice(0, 10))
            } catch (error) {
                setSuggestions([])
            } finally {
                setLoadingSuggestions(false)
            }
        }, 300)
        // Cleanup on unmount
        return () => {
            if (debounceTimeout.current) clearTimeout(debounceTimeout.current)
        }
    }, [searchQuery])

    // Close suggestions on outside click
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setShowSuggestions(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    console.log(user)

    const handleSearchClick = async () => {
        if (!searchQuery.trim()) return;
        
        // Redirect to products page with search query
        router.push(`/products?q=${encodeURIComponent(searchQuery)}`);
        setShowSuggestions(false);
        setSearchQuery("");
    }

    const handleSearchKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearchClick();
        }
    }

    // Helper to get initials from user name
    const getInitials = (name?: string) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className='w-full bg-[#18181b] shadow-sm sticky top-0 z-50'>
            <div className="w-full md:w-[80%] py-2 md:py-4 px-3 md:px-0 m-auto flex items-center justify-between gap-2 md:gap-0">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className='text-xl md:text-3xl font-bold tracking-tight text-[#ff8800]'>Unimart</span>
                    <span className='text-lg font-semibold text-white'>UNN</span>
                </Link>
                {/* Search Bar */}
                <div className='flex-1 mx-2 md:mx-8 max-w-[220px] md:max-w-[500px]'>
                    <div className="relative flex items-center" ref={searchRef}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder='Search for products...'
                            className='w-full px-4 pr-12 font-Poppins font-medium border-2 border-[#ff8800] outline-none h-10 md:h-12 rounded-full shadow-sm focus:ring-2 focus:ring-orange-200 transition bg-[#232326] text-white placeholder-gray-300'
                            value={searchQuery}
                            onChange={e => {
                                setSearchQuery(e.target.value)
                                setShowSuggestions(true)
                            }}
                            onFocus={() => {
                                if (searchQuery.trim()) setShowSuggestions(true)
                            }}
                            onKeyDown={handleSearchKeyDown}
                        />
                        <button
                            className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#ff8800] rounded-full shadow-md hover:bg-orange-600 transition'
                            onClick={handleSearchClick}
                            disabled={loadingSuggestions}
                        >
                            <Search color='#18181b' size={20} />
                        </button>
                        {/* Suggestions Dropdown */}
                        {showSuggestions && (suggestions.length > 0 || loadingSuggestions) && (
                            <div className="absolute left-0 top-12 w-full bg-[#232326] border border-[#ff8800] rounded-lg shadow-lg z-50 max-h-[36rem] min-h-[12rem] overflow-y-auto" style={{ fontSize: '1.25rem' }}>
                                {suggestions.map((product) => (
                                    <Link
                                        href={`/product/${product.slug}`}
                                        key={product.id}
                                        className="flex items-center gap-4 px-6 py-4 hover:bg-[#18181b] transition cursor-pointer"
                                        onClick={() => setShowSuggestions(false)}
                                    >
                                        {product.images && product.images[0]?.url && (
                                            <img src={product.images[0].url} alt={product.title} className="w-16 h-16 object-cover rounded" />
                                        )}
                                        <span className="text-white font-semibold">{product.title}</span>
                                    </Link>
                                ))}
                                {loadingSuggestions && (
                                    <div className="px-6 py-4 text-gray-400 text-lg">Loading...</div>
                                )}
                                {!loadingSuggestions && suggestions.length === 0 && searchQuery.trim() && (
                                    <div className="px-6 py-4 text-gray-400 text-lg">No products found.</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Icons */}
                <div className='flex items-center gap-4 md:gap-7'>
                    {/* Wishlist */}
                    <Link href="/wishlist" className='relative group'>
                        <HeartIcon className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:text-[#ff8800] transition" />
                        <div className='w-5 h-5 border-2 border-[#18181b] bg-[#ff8800] rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>{wishlist?.length}</span>
                        </div>
                    </Link>
                    {/* Cart */}
                    <Link href="/cart" className='relative group'>
                        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:text-[#ff8800] transition" />
                        <div className='w-5 h-5 border-2 border-[#18181b] bg-[#ff8800] rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>{cart?.length}</span>
                        </div>
                    </Link>
                    {/* Profile */}
                    {user ? (
                        <Link href="/profile" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#ff8800] bg-[#ff8800] hover:bg-orange-600 transition ml-1 md:ml-0'>
                            <span className="text-[#18181b] font-bold text-base md:text-lg select-none">{getInitials(user?.name)}</span>
                        </Link>
                    ) : (
                        <Link href="/login" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#ff8800] bg-[#18181b] hover:bg-orange-900 transition ml-1 md:ml-0'>
                            <UserRound className="w-6 h-6 md:w-7 md:h-7 text-[#ff8800]" />
                        </Link>
                    )}
                </div>
            </div>
            <div className='border-b border-b-[#232326]' />
            {/* Nav always below All Categories on mobile */}
            <HeaderBottom />
        </div>
    )
}

export default Header
