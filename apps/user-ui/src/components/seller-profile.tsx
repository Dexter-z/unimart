"use client"

import React, { useEffect } from 'react'
import { shops } from '@prisma/client';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import { sendKafkaEvent } from '@/actions/track-user';

const TABS = ["Products", "Offers", "Reviews"]

const SellerProfile = ({
    shop,
    followersCount,
}: {
    shop: shops;
    followersCount: number;
}) => {
    const [activeTab, setActiveTab] = React.useState('Products');
    const [followers, setFollowers] = React.useState(followersCount);
    const [isFollowing, setIsFollowing] = React.useState(false);

    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const queryClient = useQueryClient();

    const { data: products, isLoading } = useQuery({
        queryKey: ['seller-products'],
        queryFn: async () => {
            const res = await axiosInstance.get(`/seller/api/get-seller-products/${shop.id}?page=1&limit=10`);
            return res.data.products
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!shop?.id) {
                return;
            }

            try {
                const res = await axiosInstance.get(`/seller/api/isFollowing/${shop?.id}`);
                setIsFollowing(res.data.isFollowing != null);
            } catch (error) {
                console.log("Failed to fetch follow status", error);
            }
        }

        fetchFollowStatus();
    }, [shop?.id]);

    const { data: events, isLoading: isEventsLoading } = useQuery({
        queryKey: ['seller-events'],
        queryFn: async () => {
            const res = await axiosInstance.get(`/seller/api/get-seller-events/${shop.id}?page=1&limit=10`)
            return res.data.products;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    const toggleFollowMutation = useMutation({
        mutationFn: async () => {
            if (isFollowing) {
                await axiosInstance.post(`/seller/api/unfollow-shop`, {
                    shopId: shop?.id,
                })
            } else {
                await axiosInstance.post(`/seller/api/follow-shop`, {
                    shopId: shop?.id,
                })
            }
        },
        onSuccess: () => {
            if(isFollowing){
                setFollowers(followers - 1)
            } else {
                setFollowers(followers + 1)
            }

            setIsFollowing((prev) => !prev);
            queryClient.invalidateQueries({
                queryKey: ["isFollowing", shop?.id],
            })
        },
        onError: () => {
            console.log("Failed to follow/unfollow shop");
        }
    })

    useEffect(() => {
        if(!isLoading){
            if(!location || !deviceInfo || !user?.id){
                return;
            }

            sendKafkaEvent({
                userId: user?.id,
                shopId: shop?.id,
                action: "shop_visit",
                country: location?.country || "Unknown",
                city: location?.city || "Unknown",
                device: deviceInfo || "Unknown Device"
            })
        }
    }, [location, deviceInfo, isLoading])

    return (
        <div>

        </div>
    )
}

export default SellerProfile
