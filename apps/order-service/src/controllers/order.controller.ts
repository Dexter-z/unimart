import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { NextFunction, Request, Response } from "express";
import Stripe from 'stripe';
import crypto from 'crypto';
import { timeStamp } from "console";
import { Prisma } from "@prisma/client";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
    {
        apiVersion: '2025-05-28.basil',
    }
)

//Create payment intent
export const createPaymentIntent = async (req: any, res: Response, next: NextFunction) => {
    const { amount, sellerStripeAccountId, sessionId } = req.body;
    const customerAmount = Math.round(amount * 100); // Convert to cents
    const platformFee = Math.floor(customerAmount * 0.1); // 10% platform fee

    try {
        const paymentIntent = await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: 'usd',
            payment_method_types: ['card'],
            application_fee_amount: platformFee,
            transfer_data: {
                destination: sellerStripeAccountId, // Seller's Stripe account ID
            },
            metadata: {
                sessionId, // Optional metadata
                userId: req.user.id, // User ID from request
            }
        })

        res.send({
            clientSecret: paymentIntent.client_secret
        })
    } catch (error) {
        next(error)
    }
}

//Create payment session
export const createPaymentSession = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { cart, selectedAddressId, coupon } = req.body;
        const userId = req.user.id;

        if (!cart || !Array.isArray(cart) || cart.length === 0) {
            return next(new ValidationError("Cart is empty or invalid"));
        }

        const normalizedCart = JSON.stringify(
            cart.map((item: any) => ({
                id: item.id,
                quantity: item.quantity,
                salePrice: item.salePrice,
                shopId: item.shopId,
                selectedOptions: item.selectedOptions || {},
            })).sort((a, b) => a.id.localeCompare(b.id))
        )

        const keys = await redis.keys("payment-session:*");

        for (const key of keys) {
            const data = await redis.get(key);
            if (data) {
                const session = JSON.parse(data);
                if (session.userId === userId) {
                    const existingCart = JSON.stringify(
                        session.cart.map((item: any) => ({
                            id: item.id,
                            quantity: item.quantity,
                            salePrice: item.salePrice,
                            shopId: item.shopId,
                            selectedOptions: item.selectedOptions || {},
                        })).sort((a: any, b: any) => a.id.localeCompare(b.id))
                    );
                    if (existingCart === normalizedCart) {
                        // If an existing session with the same cart is found, use it
                        return res.status(200).json({ sessionId: key.split(":")[1] });
                    } else {
                        // If cart is different, delete the old session
                        await redis.del(key);
                    }
                }
            }
        }

        // Fetch Sellers and their stripe accounts
        const uniqueShopsIds = [...new Set(cart.map((item: any) => item.shopId))]

        const shops = await prisma.shops.findMany({
            where: {
                id: { in: uniqueShopsIds }
            },
            select: {
                id: true,
                sellerId: true,
                sellers: {
                    select: {
                        stripeId: true
                    }
                }
            }
        })

        const sellerData = shops.map((shop) => ({
            shopId: shop.id,
            sellerId: shop.sellerId,
            stripeAccountId: shop?.sellers?.stripeId
        }))

        //Calculate total amount and create line items
        const totalAmount = cart.reduce((total: number, item: any) => {
            return total + (item.salePrice * item.quantity);
        }, 0)

        //Create session payload
        const sessionId = crypto.randomUUID()
        const sessionData = {
            userId,
            cart,
            sellers: sellerData,
            totalAmount,
            shippingAddressId: selectedAddressId,
            coupon: coupon || null,
        }

        await redis.setex(
            `payment-session:${sessionId}`,
            60 * 10, // 10 minutes expiration
            JSON.stringify(sessionData)
        )

        return res.status(201).json({ sessionId });
    } catch (error) {
        next(error);
    }
}

export const verifyingPaymentSession = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const sessionId = req.query.sessionId as string;

        if (!sessionId) {
            return res.status(400).json({ message: "Session ID is required" });
        }

        //Fetch session from redis
        const sessionKey = `payment-session:${sessionId}`;
        const sessionData = await redis.get(sessionKey);

        if (!sessionData) {
            return res.status(404).json({ message: "Payment session not found" });
        }

        const session = JSON.parse(sessionData);

        return res.status(200).json({
            success: true,
            session
        })

    } catch (error) {
        return next(error);
    }
}

//Create order
export const createOrder = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const stripeSignature = req.headers['stripe-signature']

        if (!stripeSignature) {
            return res.status(400).send("Stripe signature is required");
        }

        const rawBody = (req as any).rawBody

        let event;

        try {
            event = stripe.webhooks.constructEvent(
                rawBody,
                stripeSignature as string,
                process.env.STRIPE_WEBHOOK_SECRET!
            );
        } catch (error: any) {
            console.error("Webhook signature verification failed:", error.message);
            return res.status(400).send(`Webhook Error: ${error.message}`);
        }

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent;
            const sessionId = paymentIntent.metadata.sessionId;
            const userId = paymentIntent.metadata.userId;

            const sessionKey = `payment-session:${sessionId}`;
            const sessionData = await redis.get(sessionKey);

            if (!sessionData) {
                console.warn("Payment session not found for sessionId:", sessionId);
                return res.status(200).send("Payment session not found, skipping order creation");
            }


            const { cart, totalAmount, shippingAddressId, coupon } = JSON.parse(sessionData);
            const user = await prisma.users.findUnique({ where: { id: userId } })
            const name = user?.name!
            const email = user?.email!

            const shopGrouped = cart.reduce((acc: any, item: any) => {
                if(!acc[item.shopId]) acc[item.shopId] = [];
                acc[item.shopId].push(item);
                return acc;
            }, {})

            for (const shopId in shopGrouped) {
                const orderItems = shopGrouped[shopId];

                let orderTotal = orderItems.reduce((sum: number, p: any) => sum + (p.salePrice * p.quantity), 0)
                if (coupon && coupon.discountedProductId && orderItems.some((item: any) => item.id === coupon.discountedProductId)) {
                    const discountedItem = orderItems.find((item: any) => item.id === coupon.discountedProductId);

                    if (discountedItem) {
                        const discount = coupon.discountPercent > 0 ? (
                            discountedItem.salePrice * discountedItem.quantity * (coupon.discountPercent / 100)
                        ) : coupon.discountAmount
                        orderTotal -= discount;
                    }
                }
                
                //Create Order
                await prisma.orders.create({
                    data: {
                        userId,
                        shopId,
                        total: orderTotal,
                        status: "paid",
                        shippingAddressId: shippingAddressId || null,
                        couponCode: coupon?.code || null,
                        discountAmount: coupon?.discountAmount || null,
                        items: {
                            create: orderItems.map((item: any) => ({
                                productId: item.id,
                                quantity: item.quantity,
                                price: item.salePrice,
                                selectedOptions: item.selectedOptions || {}
                            }))
                        }
                    }
                })

                //Update Product Analytics
                for (const item of orderItems) {
                    const {id: productId, quantity} = item

                    await prisma.products.update({
                        where: { id: productId },
                        data: {
                            totalSales: { increment: quantity },
                            stock: { decrement: quantity }
                        }
                    })

                    await prisma.productAnalytics.upsert({
                        where: { productId },
                        create: {
                            productId,
                            shopId,
                            purchases: quantity,
                            lastViewedAt: new Date()
                        },
                        update: {
                            purchases: { increment: quantity },
                        }
                    })

                    const existingAnalytics = await prisma.userAnalytics.findUnique({
                        where: { userId }
                    })

                    const newAction = {
                        productId,
                        shopId,
                        action: "purchase",
                        timestamp: Date.now()
                    }

                    const currentActions = Array.isArray(existingAnalytics?.actions) ? (existingAnalytics.actions as Prisma.JsonArray) : [];

                    if(existingAnalytics) {
                        await prisma.userAnalytics.update({
                            where: { userId },
                            data: {
                                lastVisited: new Date(),
                                actions: [...currentActions, newAction]
                            }
                        })
                    } else {
                        await prisma.userAnalytics.create({
                            data: {
                                userId,
                                lastVisited: new Date(),
                                actions: [newAction]
                            }
                        })
                    }
                }

                //Send email notification
                await sendEmail(
                    email,
                    "Your Order has been placed",
                    "order-confirmation",
                    {
                        name,
                        cart,
                        totalAmount: coupon?.discountAmount ? totalAmount - coupon.discountAmount : totalAmount,
                        trackingUrl: `https://unimart.com/order/${sessionId}`,
                    }
                )
            }
        }

    } catch (error) {
        next(error);
    }
}