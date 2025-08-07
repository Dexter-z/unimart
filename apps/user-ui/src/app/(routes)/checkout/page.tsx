import React, { useEffect, useState } from 'react'
import { loadStripe, Appearance } from '@stripe/stripe-js';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/router';
import axiosInstance from '@/utils/axiosInstance';

const sripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

const Page = () => {
    const [clientSecret, setClientSecret] = useState("")
    const [cartItems, setCartItems] = useState<any[]>([])
    const [coupon, setCoupon] = useState()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const searchParams = useSearchParams()
    const router = useRouter()

    const sessionId = searchParams.get("sessionId")

    useEffect(() => {
        const fetchSessionAndClientSecret = async () => {
            if (!sessionId) {
                setError("Invalid sessiion, please try again.")
                setLoading(false)
                return
            }

            try {
                const verifyRes = await axiosInstance.get(`/order/api/verifying-payment-session?sessionId=${sessionId}`);

                const {totalAmount, sellers, cart, coupon} = verifyRes.data.session;

                if(!sellers || sellers.length === 0 || totalAmount === undefined || totalAmount === null) {
                    throw new Error("Invalid Payment session data");
                }

                setCartItems(cart);
                setCoupon(coupon);

                const sellerStripeAccountId = sellers[0].stripeAccountId;

                const intentRes = await axiosInstance.post("/order/api/create-payment-intent", {
                    amount: coupon?.discountAmount ? totalAmount - coupon?.discountAmount : totalAmount,
                    sellerStripeAccountId,
                    sessionId,
                })

                setClientSecret(intentRes.data.clientSecret);

            } catch (error: any) {
                console.error(error);
                setError("Something went wrong while processing your payment");
            } finally{
                setLoading(false);
            }
        }

        fetchSessionAndClientSecret()
    }, [sessionId])

    const appearance: Appearance = {
        theme: 'stripe',
    }

    if(loading) {
        return(
            <div>
                
            </div>
        )
    }

    return (
        <div>

        </div>
    )
}

export default Page
