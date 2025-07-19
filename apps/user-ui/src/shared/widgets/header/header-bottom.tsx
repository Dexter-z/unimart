'use client'

import { navItems } from '@/configs/constants';
import useUser from '@/hooks/useUser';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, UserRound } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react'

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const { user, isLoading } = useUser();


    return (
        <div className='w-full transition-all duration-300 relative'>
            {/* Nav bar always visible above All Categories */}
            <div className='w-full bg-[#f3f6fa] border-b border-b-[#e5e7eb]'>
                <div className='w-[95%] md:w-[80%] m-auto flex items-center justify-center gap-2 md:gap-6 py-2 overflow-x-auto'>
                    {navItems.map((i: NavItemsTypes, index: number) => (
                        <Link className='px-3 py-1 font-medium text-base md:text-lg text-gray-700 hover:text-[#3489FF] transition whitespace-nowrap' href={i.href} key={index}>
                            {i.title}
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
