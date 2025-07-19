"use client"

import Link from 'next/link'
import React from 'react'
import { HeartIcon, Search, ShoppingCart, UserRound } from 'lucide-react';
import HeaderBottom from './header-bottom';
import useUser from '@/hooks/useUser';

const Header = () => {
    const { user, isLoading } = useUser()

    console.log(user)

    // Helper to get initials from user name
    const getInitials = (name?: string) => {
        if (!name) return '';
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <div className='w-full bg-[#2563eb] shadow-sm sticky top-0 z-50'>
            <div className="w-full md:w-[80%] py-2 md:py-4 px-3 md:px-0 m-auto flex items-center justify-between gap-2 md:gap-0">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className='text-xl md:text-3xl font-bold tracking-tight text-white'>Unimart</span>
                    <span className='text-lg font-semibold text-white'>UNN</span>
                </Link>
                {/* Search Bar */}
                <div className='flex-1 mx-2 md:mx-8 max-w-[220px] md:max-w-[500px]'>
                    <div className="relative flex items-center">
                        <input type="text" placeholder='Search for products...'
                            className='w-full px-4 pr-12 font-Poppins font-medium border-2 border-[#5aaaff] outline-none h-10 md:h-12 rounded-full shadow-sm focus:ring-2 focus:ring-blue-200 transition bg-[#f3f6fa] text-gray-800 placeholder-gray-500' />
                        <button className='absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-[#5aaaff] rounded-full shadow-md hover:bg-[#3489FF] transition'>
                            <Search color='#fff' size={20} />
                        </button>
                    </div>
                </div>
                {/* Icons */}
                <div className='flex items-center gap-4 md:gap-7'>
                    {/* Wishlist */}
                    <Link href="/wishlist" className='relative group'>
                        <HeartIcon className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:text-[#5aaaff] transition" />
                        <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>0</span>
                        </div>
                    </Link>
                    {/* Cart */}
                    <Link href="/cart" className='relative group'>
                        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-white group-hover:text-[#5aaaff] transition" />
                        <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>0</span>
                        </div>
                    </Link>
                    {/* Profile */}
                    {isLoading ? (
                        <div className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#5aaaff] animate-pulse bg-gray-200 ml-1 md:ml-0'>
                            <UserRound className="opacity-50 w-6 h-6 md:w-7 md:h-7 text-white" />
                        </div>
                    ) : user ? (
                        <Link href="/profile" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#5aaaff] bg-[#5aaaff] hover:bg-[#3489FF] transition ml-1 md:ml-0'>
                            <span className="text-white font-bold text-base md:text-lg select-none">{getInitials(user?.name)}</span>
                        </Link>
                    ) : (
                        <Link href="/login" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#5aaaff] bg-white hover:bg-blue-50 transition ml-1 md:ml-0'>
                            <UserRound className="w-6 h-6 md:w-7 md:h-7 text-[#5aaaff]" />
                        </Link>
                    )}
                </div>
            </div>
            <div className='border-b border-b-[#e5e7eb]' />
            {/* Nav always below All Categories on mobile */}
            <HeaderBottom />
        </div>
    )
}

export default Header
