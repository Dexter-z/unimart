import { ValidationError } from "@packages/error-handler";
import prisma from "@packages/libs/prisma";
import redis from "@packages/libs/redis";
import { NextFunction, Request, Response } from "express";
import Stripe from 'stripe';
import crypto from 'crypto';
import { Prisma } from "@prisma/client";
import { sendEmail } from "../utils/sendEmail";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!,
    {
        apiVersion: '2025-05-28.basil',
    }
)

const urlHead = process.env.NODE_ENV === "production" ? "unimart.com" : "localhost:3000"

//Create payment intent
export const createPaymentIntent = async (req: any, res: Response, next: NextFunction) => {
    try {
        const { total, sellerStripeAccountId, sessionId } = req.body;
        console.log("[OrderService] Received payment intent payload:", {
            total,
            sellerStripeAccountId,
            sessionId
        });

        // Validate required fields
        if (!total || !sellerStripeAccountId || !sessionId) {
            throw new ValidationError("Missing required fields: total, sellerStripeAccountId, or sessionId");
        }

        if (!req.user?.id) {
            throw new ValidationError("User not authenticated");
        }

        const customerAmount = Math.round(total * 100); // Convert to cents
        const platformFeeCents = Math.floor(customerAmount * 0.1); // 10% platform fee

        console.log("createPaymentIntent - Creating payment intent with:", {
            customerAmount,
            platformFeeCents,
            sellerStripeAccountId
        });

        const paymentIntent = await stripe.paymentIntents.create({
            amount: customerAmount,
            currency: 'usd',
            payment_method_types: ['card'],
            application_fee_amount: platformFeeCents,
            transfer_data: {
                destination: sellerStripeAccountId, // Seller's Stripe account ID
            },
            metadata: {
                sessionId, // Optional metadata
                userId: req.user.id, // User ID from request
            }
        });

        console.log("createPaymentIntent - Payment intent created successfully:", paymentIntent.id);

        res.send({
            clientSecret: paymentIntent.client_secret
        });
    } catch (error) {
        console.error("createPaymentIntent - Error:", error);
        next(error);
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

        if (uniqueShopsIds.length === 0) {
            return next(new ValidationError("No shops found in cart items"));
        }

        // Filter out undefined/null shopIds
        const validShopIds = uniqueShopsIds.filter(id => id);
        if (validShopIds.length === 0) {
            return next(new ValidationError("Cart contains items with invalid shop IDs"));
        }

        const shops = await prisma.shops.findMany({
            where: {
                id: { in: validShopIds }
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

        if (shops.length === 0) {
            return next(new ValidationError("No shops found for cart items"));
        }

        // Check if all shopIds have corresponding shops
        const foundShopIds = shops.map(shop => shop.id);
        const missingShopIds = validShopIds.filter(id => !foundShopIds.includes(id));
        if (missingShopIds.length > 0) {
            return next(new ValidationError(`Shops not found: ${missingShopIds.join(', ')}`));
        }

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
        console.log("[OrderService] Sending session to checkout page:", session);
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

                    const currentActions = Array.isArray(existingAnalytics?.actions) 
                        ? (existingAnalytics.actions as Prisma.InputJsonValue[])
                        : [];

                    if(existingAnalytics) {
                        await prisma.userAnalytics.update({
                            where: { userId },
                            data: {
                                lastVisited: new Date(),
                                actions: [...currentActions, newAction] as Prisma.InputJsonValue[]
                            }
                        })
                    } else {
                        await prisma.userAnalytics.create({
                            data: {
                                userId,
                                lastVisited: new Date(),
                                actions: [newAction] as Prisma.InputJsonValue[]
                            }
                        })
                    }
                }

                //Send email notification to user
                await sendEmail(
                    email,
                    "Your Order has been placed",
                    "order-confirmation",
                    {
                        name,
                        cart,
                        totalAmount: coupon?.discountAmount ? totalAmount - coupon.discountAmount : totalAmount,
                        trackingUrl: `https://${urlHead}/order/${sessionId}`,
                    }
                )

                //Notify shop owner via email
                const createdShopIds = Object.keys(shopGrouped);
                const sellerShops = await prisma.shops.findMany({
                    where: {
                        id: { in: createdShopIds }
                    },
                    include: {
                        sellers: {
                            select: {
                                id: true,
                                name: true,
                                email: true
                            }
                        }
                    }
                })

                for (const shop of sellerShops) {
                    const shopItems = shopGrouped[shop.id];
                    const shopTotal = shopItems.reduce((sum: number, item: any) => sum + (item.salePrice * item.quantity), 0);
                    
                    // Check if seller exists and has email
                    if (shop.sellers && shop.sellers.email) {
                        try {
                            // Send email to seller
                            await sendEmail(
                                shop.sellers.email,
                                "New Order Received - UniMart",
                                "seller-order-notification",
                                {
                                    sellerName: shop.sellers.name,
                                    customerName: name,
                                    shopName: shop.name,
                                    orderItems: shopItems,
                                    totalAmount: shopTotal,
                                    manageOrderUrl: `https://${urlHead}/seller/orders/${sessionId}`,
                                    dashboardUrl: `https://${urlHead}/seller/dashboard`,
                                }
                            )
                        } catch (emailError) {
                            console.error(`Failed to send seller email to ${shop.sellers.email}:`, emailError);
                        }
                    }

                    const firstProduct = shopItems[0];
                    const productTitle = firstProduct?.title || "new item";

                    await prisma.notifications.create({
                        data: {
                            title: `New Order Received`,
                            message: `You have received a new order for ${productTitle}.`,
                            creatorId: userId,
                            receiverId: shop.sellerId,
                            redirect_link: `https://${urlHead}/order/${sessionId}`,
                        }
                    })
                }

                // Send email notifications to all active admins
                try {
                    const activeAdmins = await prisma.admins.findMany({
                        where: {
                            isActive: true
                        },
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    })

                    for (const admin of activeAdmins) {
                        try {
                            await sendEmail(
                                admin.email,
                                "New Order Alert - UniMart Admin",
                                "admin-order-notification",
                                {
                                    customerName: name,
                                    shopName: sellerShops[0]?.name || "Unknown Shop",
                                    sellerName: sellerShops[0]?.sellers?.name || "Unknown Seller",
                                    orderItems: cart,
                                    totalAmount: coupon?.discountAmount ? totalAmount - coupon.discountAmount : totalAmount,
                                    adminOrderUrl: `https://${urlHead}/admin/orders/${sessionId}`,
                                    adminDashboardUrl: `https://${urlHead}/admin/dashboard`,
                                }
                            )
                        } catch (emailError) {
                            console.error(`Failed to send admin email to ${admin.email}:`, emailError);
                        }
                    }
                } catch (adminError) {
                    console.error("Failed to fetch admins or send admin notifications:", adminError);
                }

                //Create notification for admin
                try {
                    await prisma.notifications.create({
                        data: {
                            title: `New Order Placed`,
                            message: `A new order has been placed by ${name}.`,
                            creatorId: userId,
                            receiverId: "admin", // Assuming admin ID is "admin"
                            redirect_link: `https://${urlHead}/order/${sessionId}`,
                        }
                    })
                } catch (notificationError) {
                    console.error("Failed to create admin notification:", notificationError);
                }

                //Delete session
                await redis.del(sessionKey);
            }
        }

        res.status(200).json({received: true})

    } catch (error) {
        console.log(error)
        return next(error);
    }
}