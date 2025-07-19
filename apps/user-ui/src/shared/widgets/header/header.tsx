"use client"

import Link from 'next/link'
import React from 'react'
import { HeartIcon, Search, ShoppingCart, UserRound } from 'lucide-react';
import HeaderBottom from './header-bottom';
import useUser from '@/hooks/useUser';

const Header = () => {
    const { user, isLoading } = useUser()

    console.log(user)

    return (
        <div className='w-full bg-white shadow-sm sticky top-0 z-50'>
            <div className="w-full md:w-[80%] py-2 md:py-4 px-3 md:px-0 m-auto flex items-center justify-between gap-2 md:gap-0">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 shrink-0">
                    <span className='text-xl md:text-3xl font-bold tracking-tight text-[#3489FF]'>Unimart</span>
                    <span className='hidden md:inline text-lg font-semibold text-gray-700'>UNN</span>
                </Link>
                {/* Search Bar */}
                <div className='flex-1 mx-2 md:mx-8 max-w-[500px]'>
                    <div className="relative">
                        <input type="text" placeholder='Search for products...'
                            className='w-full px-4 font-Poppins font-medium border-2 border-[#3489FF] outline-none h-10 md:h-12 rounded-full shadow-sm focus:ring-2 focus:ring-blue-200 transition' />
                        <button className='w-10 h-10 md:w-12 md:h-12 flex items-center justify-center bg-[#3489FF] rounded-full absolute top-1/2 right-1 -translate-y-1/2 shadow-md hover:bg-blue-700 transition'>
                            <Search color='#fff' size={22} />
                        </button>
                    </div>
                </div>
                {/* Icons */}
                <div className='flex items-center gap-2 md:gap-5'>
                    {/* Wishlist */}
                    <Link href="/wishlist" className='relative group'>
                        <HeartIcon className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#3489FF] transition" />
                        <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>0</span>
                        </div>
                    </Link>
                    {/* Cart */}
                    <Link href="/cart" className='relative group'>
                        <ShoppingCart className="w-6 h-6 md:w-7 md:h-7 text-gray-600 group-hover:text-[#3489FF] transition" />
                        <div className='w-5 h-5 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute -top-2 -right-2'>
                            <span className='text-white font-medium text-xs'>0</span>
                        </div>
                    </Link>
                    {/* Profile */}
                    {isLoading ? (
                        <div className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#3489FF] animate-pulse bg-gray-200 ml-1 md:ml-0'>
                            <UserRound className="opacity-50 w-6 h-6 md:w-7 md:h-7" />
                        </div>
                    ) : user ? (
                        <Link href="/profile" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#3489FF] bg-white hover:bg-blue-50 transition ml-1 md:ml-0'>
                            <UserRound className="w-6 h-6 md:w-7 md:h-7 text-[#3489FF]" />
                            <span className='hidden md:inline ml-2 text-sm font-semibold text-gray-700'>{user?.name?.split(" ")[0]}</span>
                        </Link>
                    ) : (
                        <Link href="/login" className='border-2 w-9 h-9 md:w-12 md:h-12 flex items-center justify-center rounded-full border-[#3489FF] bg-white hover:bg-blue-50 transition ml-1 md:ml-0'>
                            <UserRound className="w-6 h-6 md:w-7 md:h-7 text-[#3489FF]" />
                            <span className='hidden md:inline ml-2 text-sm font-semibold text-gray-700'>Sign in</span>
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
