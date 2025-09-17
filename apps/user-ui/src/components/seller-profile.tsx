"use client"

import React, { useEffect } from 'react'
import { shops } from '@prisma/client';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import { sendKafkaEvent } from '@/actions/track-user';

const SellerProfile = ({
    shop,
    followersCount,
}: {
    shop: shops;
    followersCount: number;
}) => {
    const TABS = ["Products", "Offers", "Reviews"];
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

    // UI helpers
    const Stat = ({ label, value }: { label: string; value: React.ReactNode }) => (
        <div className="flex flex-col">
            <span className="text-sm text-gray-400">{label}</span>
            <span className="text-lg font-semibold text-white">{value}</span>
        </div>
    );

    const TabButton = ({ name }: { name: string }) => (
        <button
            onClick={() => setActiveTab(name)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                activeTab === name
                    ? 'bg-[#ff8800] text-[#18181b]'
                    : 'bg-[#232326] text-gray-300 hover:bg-[#2b2b30]'
            }`}
        >
            {name}
        </button>
    );

    const ProductCard = ({ p }: { p: any }) => {
        const image = p?.images?.[0]?.url || p?.image || shop?.avatar || '/placeholder.png';
        const title = p?.title || p?.name || 'Product';
        const price = p?.salePrice ?? p?.price ?? 0;
        const regular = p?.regularPrice ?? undefined;
        return (
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl overflow-hidden hover:border-[#ff8800] transition-colors">
                <div className="aspect-square w-full bg-[#1d1d21] overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={image} alt={title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                    <div className="text-white font-semibold truncate" title={title}>{title}</div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="text-[#ff8800] font-bold">${price}</div>
                        {regular && (
                            <div className="text-gray-400 line-through text-sm">${regular}</div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const ProductCardSkeleton = () => (
        <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl overflow-hidden animate-pulse">
            <div className="aspect-square w-full bg-[#232326]" />
            <div className="p-4 space-y-2">
                <div className="h-4 bg-[#2b2b30] rounded w-3/4" />
                <div className="h-4 bg-[#2b2b30] rounded w-1/2" />
            </div>
        </div>
    );

    const HeaderSkeleton = () => (
        <div className="w-full">
            <div className="h-40 sm:h-56 md:h-64 w-full rounded-2xl bg-[#232326] animate-pulse" />
            <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-8 sm:-mt-10 px-2 sm:px-4">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#232326] border-4 border-[#18181b] animate-pulse" />
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="h-6 bg-[#232326] rounded w-48 animate-pulse" />
                    <div className="h-10 bg-[#232326] rounded w-40 animate-pulse" />
                </div>
            </div>
        </div>
    );

    const isProfileLoading = !shop; // if shop prop missing, treat as loading

    return (
        <div className="space-y-6">
            {/* Cover + Header */}
            <div className="relative">
                {isProfileLoading ? (
                    <HeaderSkeleton />
                ) : (
                <>
                <div className="h-40 sm:h-56 md:h-64 w-full rounded-2xl overflow-hidden border border-[#232326] bg-[#18181b]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {shop?.coverBanner ? (
                        <img src={shop.coverBanner} alt="Shop cover" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-[linear-gradient(135deg,#232326,transparent)]" />
                    )}
                </div>

                {/* Avatar & Info */}
                <div className="flex flex-col sm:flex-row gap-4 sm:items-end -mt-8 sm:-mt-10 px-2 sm:px-4">
                    <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#ff8800] border-4 border-[#18181b] overflow-hidden flex items-center justify-center">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {shop?.avatar ? (
                            <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                        ) : (
                            <span className="text-[#18181b] font-bold text-3xl">{shop?.name?.[0] || '?'}</span>
                        )}
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">{shop?.name}</h1>
                            <p className="text-gray-400 mt-1">{shop?.bio || 'No bio provided.'}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                {shop?.category && (
                                    <span className="px-3 py-1 rounded-full text-xs bg-[#232326] text-gray-300 border border-[#232326]">{shop.category}</span>
                                )}
                                {Array.isArray(shop?.socialLinks) && shop.socialLinks.slice(0, 3).map((_, idx) => (
                                    <span key={idx} className="px-3 py-1 rounded-full text-xs bg-[#232326] text-gray-300 border border-[#232326]">Social {idx + 1}</span>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center sm:justify-end gap-4">
                            <div className="hidden sm:flex items-center gap-6">
                                <Stat label="Followers" value={followers} />
                                <Stat label="Products" value={Array.isArray(products) ? products.length : 0} />
                                <Stat label="Rating" value={(shop as any)?.ratings ?? '5.0'} />
                            </div>
                            <button
                                onClick={() => toggleFollowMutation.mutate()}
                                disabled={toggleFollowMutation.isPending}
                                className={`px-5 py-2 rounded-xl font-semibold transition-colors ${
                                    isFollowing
                                        ? 'bg-[#232326] text-gray-200 hover:bg-[#2b2b30]'
                                        : 'bg-[#ff8800] text-[#18181b] hover:bg-[#ffa239]'
                                } ${toggleFollowMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                            >
                                {isFollowing ? 'Following' : 'Follow'}
                            </button>
                        </div>
                    </div>
                </div>
                </>
                )}
            </div>

            {/* Stats (mobile) */}
            <div className="sm:hidden grid grid-cols-3 gap-4">
                <Stat label="Followers" value={followers} />
                <Stat label="Products" value={Array.isArray(products) ? products.length : 0} />
                <Stat label="Rating" value={(shop as any)?.ratings ?? '5.0'} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {TABS.map((t) => (
                    <TabButton key={t} name={t} />
                ))}
            </div>

            {/* Content */}
            <div>
                {activeTab === 'Products' && (
                    <div>
                        {isLoading ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {Array.isArray(products) && products.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                        {products.map((p: any) => (
                                            <ProductCard key={p?.id || p?._id || p?.slug || Math.random()} p={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-12">No products found.</div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'Offers' && (
                    <div>
                        {isEventsLoading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({ length: 6 }).map((_, i) => (
                                    <ProductCardSkeleton key={i} />
                                ))}
                            </div>
                        ) : (
                            <>
                                {Array.isArray(events) && events.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {events.map((p: any) => (
                                            <ProductCard key={p?.id || p?._id || p?.slug || Math.random()} p={p} />
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center text-gray-400 py-12">No offers right now. Check back later!</div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {activeTab === 'Reviews' && (
                    <div className="space-y-4">
                        <div className="bg-[#18181b] border border-[#232326] rounded-2xl p-6 text-gray-400">
                            Reviews coming soon.
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SellerProfile
