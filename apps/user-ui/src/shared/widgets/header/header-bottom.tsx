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
            {/* Nav bar: top on desktop, bottom on mobile */}
            {/* Desktop nav (top) */}
            <div className='w-full bg-[#2563eb] border-b border-b-[#e5e7eb] hidden md:block'>
                <div className='w-[98%] md:w-[80%] m-auto flex items-center justify-center gap-2 md:gap-6 py-2 overflow-x-auto rounded-xl bg-[#2563eb] mt-2 mb-2 px-2 md:px-4'>
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
                <div className='w-full border-b border-[#e5e7eb]' />
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
                <div className='relative w-full md:w-[260px] cursor-pointer flex items-center justify-between px-4 md:px-5 h-[45px] md:h-[50px] bg-[#3489FF] mb-2 md:mb-0' onClick={() => setShow(!show)}>
                    <div className='flex items-center gap-2'>
                        <AlignLeft color='white' />
                        <span className='text-white font-medium text-sm md:text-base'>All Categories</span>
                    </div>
                    <ChevronDown color='white' />
                    {show && (
                        <div className='absolute left-0 top-[45px] md:top-[50px] w-[80vw] md:w-[260px] h-[300px] md:h-[400px] bg-[#f5f5f5] z-30 rounded-md shadow-md' style={{minWidth: '200px'}}>
                            {/* Categories dropdown content here */}
                        </div>
                    )}
                </div>
                {/* Remove nav items from here, they are now always above */}
                <div className='w-full md:w-auto flex justify-end'>
                    {/* Optionally, you can style sticky icons here if needed */}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom
