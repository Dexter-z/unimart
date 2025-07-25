import useDeviceTracking from '@/hooks/useDeviceTracking'
import useLocationTracking from '@/hooks/useLocationTracking'
import useUser from '@/hooks/useUser'
import { useStore } from '@/store'
import React from 'react'

const WishlistPage = () => {
    const { user } = useUser()

    const location = useLocationTracking()
    const deviceInfo = useDeviceTracking()
    const addToCart = useStore((state: any) => state.addToCart);
    const removeFromCart = useStore((state: any) => state.removeFromCart);
    const cart = useStore((state: any) => state.cart);

    const addToWishlist = useStore((state: any) => state.addToWishlist);
    const removeFromWishlist = useStore((state: any) => state.removeFromWishlist);
    const wishlist = useStore((state: any) => state.wishlist);
    
    return (
        <div>

        </div>
    )
}

export default WishlistPage
