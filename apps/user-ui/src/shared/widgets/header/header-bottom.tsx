'use client'

import { navItems } from '@/configs/constants';
import useUser from '@/hooks/useUser';
import { AlignLeft, ChevronDown, HeartIcon, ShoppingCart, UserRound } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'

const HeaderBottom = () => {
    const [show, setShow] = useState(false);
    const [isSticky, setIsSticky] = useState(false);
    const { user, isLoading } = useUser();


    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 100) {
                setIsSticky(true);
            }
            else {
                setIsSticky(false);
            }
        }

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);

    }, []);

    return (
        <div className={`w-full transition-all duration-300 ${isSticky ? 'fixed top-0 left-0 z-[100] bg-white shadow-lg' : 'relative'}`}>
            <div className={`w-[95%] md:w-[80%] relative m-auto flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0 ${isSticky ? 'pt-3' : 'py-0'}`}>
                <div className={`w-full md:w-[260px] ${isSticky && '-mb-2'} cursor-pointer flex items-center justify-between px-4 md:px-5 h-[45px] md:h-[50px] bg-[#3489FF] mb-2 md:mb-0`} onClick={() => setShow(!show)}>
                    <div className='flex items-center gap-2'>
                        <AlignLeft color='white' />
                        <span className='text-white font-medium text-sm md:text-base'>All Categories</span>
                    </div>
                    <ChevronDown color='white' />
                </div>
                {show && (
                    <div className={`absolute left-0 ${isSticky ? 'top-[55px] md:top-[70px]' : 'top-[45px] md:top-[50px]'} w-[80vw] md:w-[260px] h-[300px] md:h-[400px] bg-[#f5f5f5] z-50 rounded-md shadow-md`}>
                        {/* Categories dropdown content here */}
                    </div>
                )}

                <div className='hidden md:flex items-center'>
                    {navItems.map((i: NavItemsTypes, index: number) => (
                        <Link className='px-2 md:px-5 font-medium text-base md:text-lg' href={i.href} key={index}>
                            {i.title}
                        </Link>
                    ))}
                </div>
                {/* Mobile nav items dropdown */}
                <div className='flex md:hidden w-full'>
                    {show && (
                        <div className='flex flex-col w-full bg-white rounded shadow-md absolute top-[55px] left-0 z-40'>
                            {navItems.map((i: NavItemsTypes, index: number) => (
                                <Link className='px-4 py-2 font-medium text-base border-b last:border-b-0' href={i.href} key={index} onClick={() => setShow(false)}>
                                    {i.title}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
                <div className='w-full md:w-auto flex justify-end'>
                    {isSticky && (
                        <div className='flex items-center gap-4 md:gap-8 pb-2'>
                            {isLoading ? (
                                <>
                                    <div className='border-2 w-[40px] md:w-[50px] h-[40px] md:h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a] animate-pulse bg-gray-200'>
                                        <UserRound className="opacity-50" />
                                    </div>
                                    <div>
                                        <span className='block font-medium text-xs md:text-base'>Hello,</span>
                                        <span className='font-semibold inline-block h-4 md:h-5 w-14 md:w-20 bg-gray-200 rounded animate-pulse'></span>
                                    </div>
                                </>
                            ) : user ? (
                                <>
                                    <Link href={"/profile"} className='border-2 w-[40px] md:w-[50px] h-[40px] md:h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                                        <UserRound />
                                    </Link>
                                    <Link href={"/profile"}>
                                        <span className='block font-medium text-xs md:text-base'>Hello,</span>
                                        <span className='font-semibold'>{user?.name?.split(" ")[0]}</span>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={"/login"} className='border-2 w-[40px] md:w-[50px] h-[40px] md:h-[50px] flex items-center justify-center rounded-full border-[#010f1c1a]'>
                                        <UserRound />
                                    </Link>
                                    <Link href={"/login"}>
                                        <span className='block font-medium text-xs md:text-base'>Hello,</span>
                                        <span className='font-semibold'>Sign in</span>
                                    </Link>
                                </>
                            )}
                            <div className='flex items-center gap-2 md:gap-5'>
                                <Link href={"/wishlist"} className='relative'>
                                    <HeartIcon />
                                    <div className='w-5 md:w-6 h-5 md:h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                        <span className='text-white font-medium text-xs md:text-sm'>0</span>
                                    </div>
                                </Link>
                            </div>
                            <div className='flex items-center gap-2 md:gap-5'>
                                <Link href={"/cart"} className='relative'>
                                    <ShoppingCart />
                                    <div className='w-5 md:w-6 h-5 md:h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                        <span className='text-white font-medium text-xs md:text-sm'>0</span>
                                    </div>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default HeaderBottom
