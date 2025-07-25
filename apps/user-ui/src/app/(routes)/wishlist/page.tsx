"use client"

import useDeviceTracking from '@/hooks/useDeviceTracking'
import useLocationTracking from '@/hooks/useLocationTracking'
import useUser from '@/hooks/useUser'
import { useStore } from '@/store'
import React from 'react'
import ProductCard from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import Ratings from '@/components/ratings'
import ShareModal from '@/components/share-modal'
import { useState } from 'react'

const WishlistPage = () => {
    const { user } = useUser()
    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    const wishlist = useStore((state: any) => state.wishlist);

    if (!wishlist || wishlist.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[100vh] bg-[#18181b] px-4 py-12">
                <img src="/empty-wishlist.svg" alt="Empty Wishlist" className="w-40 h-40 mb-6" />
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Wishlist is Empty</h2>
                <p className="text-gray-400 mb-6 text-center max-w-md">Browse products and add your favorites to your wishlist. They’ll show up here for quick access!</p>
                <a href="/" className="px-8 py-3 bg-[#ff8800] text-[#18181b] font-semibold rounded-lg shadow hover:bg-orange-600 hover:text-white transition-all text-base md:text-lg">Continue Shopping</a>
            </div>
        )
    }

    return (
        <div className="w-full min-h-[100vh] bg-[#18181b] py-8 px-2 md:px-0">
            <div className="w-full md:w-[80%] mx-auto">
                <h1 className="text-2xl md:text-4xl font-bold text-[#ff8800] mb-2">My Wishlist</h1>
                <p className="text-gray-300 mb-8">All your favorite products in one place.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {wishlist.map((product: any) => (
                        <ProductCard key={product.id} product={product} isEvent={!!product.endingDate} />
                    ))}
                </div>
            </div>
        </div>
    )
}

export default WishlistPage
