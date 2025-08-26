"use client"

import React, { useEffect, useState } from 'react'
import { Suspense } from 'react'
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js'
import { useSearchParams, useRouter } from 'next/navigation';
import axiosInstance from '@/utils/axiosInstance';
import CheckoutForm from '@/components/CheckoutForm';

const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY;

console.log("Stripe Public Key:", stripePublicKey);

if (!stripePublicKey) {
    console.error("NEXT_PUBLIC_STRIPE_PUBLIC_KEY is not defined!");
}

const stripePromise = stripePublicKey ? loadStripe(stripePublicKey) : null;

console.log("Stripe Promise:", stripePromise);

const Page = () => {
    const [clientSecret, setClientSecret] = useState("")
    const [cartItems, setCartItems] = useState<any[]>([])
    const [coupon, setCoupon] = useState()
    const [discountedTotal, setDiscountedTotal] = useState(0)
    const [platformFee, setPlatformFee] = useState(0)
    const [grandTotal, setGrandTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(5)
    const searchParams = useSearchParams()
    const router = useRouter()

    const sessionId = searchParams.get("sessionId")

    // Auto redirect to cart on error
    useEffect(() => {
        if (error) {
            const countdownInterval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(countdownInterval);
                        // Use setTimeout to avoid updating component during render
                        setTimeout(() => router.push('/cart'), 0);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

            return () => clearInterval(countdownInterval);
        }
    }, [error, router]);

    useEffect(() => {
        const fetchSessionAndClientSecret = async () => {
            if (!sessionId) {
                setError("Invalid session, please try again.");
                setLoading(false);
                return;
            }

            try {
                const verifyRes = await axiosInstance.get(`/order/api/verifying-payment-session?sessionId=${sessionId}`);
                const { sellers, cart, coupon } = verifyRes.data.session;

                if (!sellers || sellers.length === 0 || !cart || cart.length === 0) {
                    throw new Error("Invalid Payment session data");
                }

                setCartItems(cart);
                setCoupon(coupon);

                // Calculate discounted total
                let discountedTotal = cart.reduce((sum: number, item: any) => {
                    let price = item.salePrice;
                    if (coupon && coupon.discountType && item.discountCodes && item.discountCodes.includes(coupon.id)) {
                        if (coupon.discountType === "percentage") {
                            price *= (1 - coupon.discountValue / 100);
                        } else if (coupon.discountType === "amount") {
                            price -= coupon.discountValue;
                        }
                    }
                    return sum + price * item.quantity;
                }, 0);
                // Calculate platform fee (10% of discounted total)
                let platformFee = Math.floor(discountedTotal * 0);
                // Calculate grand total
                let grandTotal = discountedTotal + platformFee;

                setDiscountedTotal(discountedTotal);
                setPlatformFee(platformFee);
                setGrandTotal(grandTotal);

                // Send discounted total to backend for payment intent
                const sellerStripeAccountId = sellers[0].stripeAccountId;
                console.log("Sending payment intent payload:", { total: discountedTotal, sellerStripeAccountId, sessionId });
                const intentRes = await axiosInstance.post("/order/api/create-payment-intent", {
                    total: discountedTotal,
                    sellerStripeAccountId,
                    sessionId,
                });

                setClientSecret(intentRes.data.clientSecret);

            } catch (error: any) {
                console.error(error);
                setError("Something went wrong while processing your payment");
            } finally {
                setLoading(false);
            }
        };
        fetchSessionAndClientSecret();
    }, [sessionId, router]);

    // You can customize the Stripe appearance here if needed
    const appearance: Appearance = {
        theme: 'stripe',
    }

    if(loading) {
        return(
            <div className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#0f0f0f] flex items-center justify-center">
                <div className="text-center space-y-4">
                    {/* Loading Spinner */}
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-[#232326] border-t-[#ff8800] rounded-full animate-spin mx-auto"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-[#ff8800]/30 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                    </div>
                    
                    {/* Loading Text */}
                    <div className="space-y-2">
                        <h2 className="text-xl font-bold text-white">Processing Payment</h2>
                        <p className="text-gray-400">Please wait while we prepare your checkout...</p>
                        
                        {/* Loading Dots Animation */}
                        <div className="flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                            <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                            <div className="w-2 h-2 bg-[#ff8800] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    if(error) {
        return(
            <div className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#0f0f0f] flex items-center justify-center">
                <div className="max-w-md mx-auto text-center space-y-6 p-6">
                    {/* Error Icon */}
                    <div className="w-20 h-20 mx-auto bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/20">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    
                    {/* Error Content */}
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">Payment Error</h2>
                        <p className="text-red-400 text-lg font-medium">{error}</p>
                        <p className="text-gray-400">You will be redirected to your cart shortly...</p>
                    </div>
                    
                    {/* Redirect Button */}
                    <button 
                        onClick={() => router.push('/cart')}
                        className="bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-[#18181b] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Return to Cart
                    </button>
                    
                    {/* Auto redirect countdown */}
                    <p className="text-sm text-gray-500">
                        Redirecting automatically in <span className="text-[#ff8800] font-medium">{countdown}</span> seconds...
                    </p>
                </div>
            </div>
        )
    }    

    // Handle case where Stripe is not available
    if (!stripePromise) {
        return(
            <div className="min-h-screen bg-gradient-to-b from-[#18181b] to-[#0f0f0f] flex items-center justify-center">
                <div className="max-w-md mx-auto text-center space-y-6 p-6">
                    <div className="w-20 h-20 mx-auto bg-red-900/20 rounded-full flex items-center justify-center border border-red-500/20">
                        <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-2xl font-bold text-white">Payment System Error</h2>
                        <p className="text-red-400 text-lg font-medium">Payment processing is currently unavailable</p>
                        <p className="text-gray-400">Please contact support or try again later.</p>
                    </div>
                    <button 
                        onClick={() => router.push('/cart')}
                        className="bg-gradient-to-r from-[#ff8800] to-[#ff6600] hover:from-[#ff6600] hover:to-[#ff4400] text-[#18181b] font-bold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        Return to Cart
                    </button>
                </div>
            </div>
        )
    }
    
    return (
        <Suspense>
            {clientSecret && stripePromise && (
                <Elements 
                    stripe={stripePromise}
                    options={{ clientSecret, appearance }}>
                    <CheckoutForm 
                        clientSecret={clientSecret}
                        cartItems={cartItems}
                        coupon={coupon}
                        sessionId={sessionId}
                        discountedTotal={discountedTotal}
                        platformFee={platformFee}
                        grandTotal={grandTotal}
                    />
                </Elements>
            )}
        </Suspense>
    )
}

export default Page
