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
        <div className='w-full bg-white'>
            <div className="w-[95%] md:w-[80%] py-3 md:py-5 m-auto flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-0">
                <div className='w-full flex items-center justify-between md:justify-start'>
                    <Link href={"/"}>
                        <span className='text-2xl md:text-3xl font-[500]'>Unimart UNN</span>
                    </Link>
                    {/* Mobile menu button placeholder, can be implemented for mobile nav */}
                </div>
                <div className='w-full md:w-[50%] relative order-3 md:order-none mt-2 md:mt-0'>
                    <input type="text" placeholder='Search For Products...' className='w-full px-4 font-Poppins font-medium border-[2.5px] border-[#3489FF] outline-none h-[45px] md:h-[55px] rounded-md' />
                    <div className='w-[45px] md:w-[60px] cursor-pointer flex items-center justify-center h-[45px] md:h-[55px] bg-[#3489FF] absolute top-0 right-0 rounded-r-md'>
                        <Search color='#ffff' />
                    </div>
                </div>
                {/* Add gap between search and icons */}
                <div className='hidden md:block md:w-8'></div>
                <div className='flex items-center gap-4 md:gap-8 w-full md:w-auto justify-between md:justify-end order-2 md:order-none'>
                    <div className='flex items-center gap-2'>
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
                    </div>
                    <div className='flex items-center gap-3 md:gap-5'>
                        <Link href={"/wishlist"} className='relative'>
                            <HeartIcon />
                            <div className='w-5 md:w-6 h-5 md:h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                <span className='text-white font-medium text-xs md:text-sm'>0</span>
                            </div>
                        </Link>
                    </div>
                    <div className='flex items-center gap-3 md:gap-5'>
                        <Link href={"/cart"} className='relative'>
                            <ShoppingCart />
                            <div className='w-5 md:w-6 h-5 md:h-6 border-2 border-white bg-red-500 rounded-full flex items-center justify-center absolute top-[-10px] right-[-10px]'>
                                <span className='text-white font-medium text-xs md:text-sm'>0</span>
                            </div>
                        </Link>
                    </div>
                </div>
            </div >
            <div className='border-b border-b-[#99999938]' />
            <HeaderBottom />
        </div >
    )
}

export default Header
