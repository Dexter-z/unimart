'use client'

import { navItems } from '@/configs/constants';
import useUser from '@/hooks/useUser';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, UserRound, Home, ShoppingBag, Store, Tag, UserPlus } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

// Icon map for nav items
const navIcons: Record<string, JSX.Element> = {
    Home: <Home className="w-5 h-5 mb-0.5" />, 
    ShoppingBag: <ShoppingBag className="w-5 h-5 mb-0.5" />, 
    Store: <Store className="w-5 h-5 mb-0.5" />, 
    Tag: <Tag className="w-5 h-5 mb-0.5" />, 
    UserPlus: <UserPlus className="w-5 h-5 mb-0.5" />
};

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const { user, isLoading } = useUser();


    return (
        <div className='w-full transition-all duration-300 relative'>
            {/* Desktop nav (top, with All Categories) */}
            <div className='w-full bg-[#2563eb] border-b border-b-[#e5e7eb] hidden md:block'>
                <div className='w-[98%] md:w-[80%] m-auto flex items-center gap-4 py-2 px-2 md:px-4'>
                    {/* All Categories dropdown */}
                    <div className='relative md:w-[200px] flex-shrink-0'>
                        <div className='flex items-center justify-between px-5 h-[45px] bg-[#3489FF] rounded-lg cursor-pointer' onClick={() => setShow(!show)}>
                            <div className='flex items-center gap-2'>
                                <AlignLeft color='white' />
                                <span className='text-white font-medium text-base'>All Categories</span>
                            </div>
                            <ChevronDown color='white' />
                        </div>
                        {show && (
                            <div className='absolute left-0 top-[48px] w-[220px] h-[300px] bg-[#f5f5f5] z-30 rounded-md shadow-md'>
                                {/* Categories dropdown content here */}
                            </div>
                        )}
                    </div>
                    {/* Nav items */}
                    <div className='flex-1 flex items-center gap-4'>
                        {navItems.map((i: NavItemsTypes, index: number) => (
                            <Link
                                className='px-4 py-2 font-semibold text-base md:text-lg text-white hover:bg-[#5aaaff] hover:text-white transition rounded-lg whitespace-nowrap duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5aaaff] focus:ring-offset-2'
                                href={i.href}
                                key={index}
                            >
                                {i.title}
                            </Link>
                        ))}
                    </div>
                </div>
                <div className='w-full border-b border-[#e5e7eb]' />
            </div>
            {/* Mobile All Categories bar (top, only on mobile) */}
            <div className='block md:hidden w-full bg-[#3489FF]'>
                <div className='relative w-full flex items-center justify-between px-5 h-[45px] cursor-pointer' onClick={() => setShow(!show)}>
                    <div className='flex items-center gap-2'>
                        <AlignLeft color='white' />
                        <span className='text-white font-medium text-base'>All Categories</span>
                    </div>
                    <ChevronDown color='white' />
                    {show && (
                        <div className='absolute left-0 top-[45px] w-full h-[300px] bg-[#f5f5f5] z-30 rounded-b-md shadow-md'>
                            {/* Categories dropdown content here */}
                        </div>
                    )}
                </div>
            </div>
            {/* Mobile nav (bottom) */}
            <div className='fixed bottom-0 left-0 w-full bg-[#2563eb] border-t border-[#e5e7eb] flex md:hidden z-[100] safe-area-inset-bottom'>
                <div className='flex-1 flex items-center justify-around py-2'>
                    {navItems.map((i: NavItemsTypes, index: number) => (
                        <Link
                            className='flex flex-col items-center justify-center px-2 py-1 text-xs font-semibold text-white hover:text-[#5aaaff] transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5aaaff] focus:ring-offset-2'
                            href={i.href}
                            key={index}
                        >
                            {i.icon && navIcons[i.icon]}
                            <span>{i.title}</span>
                        </Link>
                    ))}
                </div>
            </div>
            {/* All Categories bar below nav */}
            <div className='w-[95%] md:w-[80%] relative m-auto flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 py-0'>
                {/* Remove nav items from here, they are now always above */}
                <div className='w-full md:w-auto flex justify-end'>
                    {/* Optionally, you can style sticky icons here if needed */}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom
