"use client"

import React, { useEffect, useState, useTransition } from 'react'
import Link from 'next/link';
import { shops } from '@prisma/client';
import useUser from '@/hooks/useUser';
import useLocationTracking from '@/hooks/useLocationTracking';
import useDeviceTracking from '@/hooks/useDeviceTracking';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/utils/axiosInstance';
import { sendKafkaEvent } from '@/actions/track-user';
import { Users, Package as PackageIcon, Star as StarIcon, UserPlus, UserCheck, Share2, MessageSquare } from 'lucide-react';
import ProductCard from '@/components/product-card';
import { useRouter } from 'next/navigation';
import { isProtected } from '@/utils/protected';

const SellerProfile = ({
    shop,
    followersCount,
}: {
    shop: shops;
    followersCount: number;
}) => {
    console.log("Number of followers: ", followersCount)
    console.log("Shop details: ", shop)
    const TABS = ["Products", "Offers", "Reviews"];
    const [activeTab, setActiveTab] = useState('Products');
    const [followers, setFollowers] = useState(followersCount);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isFollowStatusLoading, setIsFollowStatusLoading] = useState(true);
    const [isPending, setIsPending] = useState(false);

    const { user } = useUser();
    const location = useLocationTracking();
    const deviceInfo = useDeviceTracking();
    const queryClient = useQueryClient();

    const router = useRouter()

    const handleChatClick = async () => {
        if (isPending) {
            return
        }

        setIsPending(true)
        try {
            const res = await axiosInstance.post("/chatting/api/create-user-conversationGroup",
                { sellerId: shop?.sellerId },
                isProtected
            )
            router.push(`/profile?tab=inbox&conversationId=${res.data.conversation.id}`)
        } catch (error) {
            console.log(error)
        } finally {
            setIsPending(false)
        }
    };

    const { data: products, isLoading, isFetching: isFetchingProducts } = useQuery({
        queryKey: ['seller-products', shop.id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/seller/api/get-seller-products/${shop.id}?page=1&limit=10`);
            const raw = res.data?.products;
            if (Array.isArray(raw)) return raw;
            if (raw && Array.isArray(raw.docs)) return raw.docs;
            return [] as any[];
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    useEffect(() => {
        const fetchFollowStatus = async () => {
            if (!shop?.id) {
                setIsFollowStatusLoading(false);
                return;
            }

            try {
                setIsFollowStatusLoading(true);
                const res = await axiosInstance.get(`/seller/api/is-following/${shop?.id}`);
                setIsFollowing(res.data.isFollowing != null);
            } catch (error) {
                console.log("Failed to fetch follow status", error);
            } finally {
                setIsFollowStatusLoading(false);
            }
        }

        fetchFollowStatus();
    }, [shop?.id]);

    const { data: events, isLoading: isEventsLoading, isFetching: isFetchingEvents } = useQuery({
        queryKey: ['seller-events', shop.id],
        queryFn: async () => {
            const res = await axiosInstance.get(`/seller/api/get-seller-events/${shop.id}?page=1&limit=10`)
            const raw = res.data?.products;
            if (Array.isArray(raw)) return raw;
            if (raw && Array.isArray(raw.docs)) return raw.docs;
            return [] as any[];
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Prefetch events shortly after mount to smooth tab switch
    useEffect(() => {
        const t = setTimeout(() => {
            if (!shop?.id) return;
            queryClient.prefetchQuery({
                queryKey: ['seller-events', shop.id],
                queryFn: async () => {
                    const res = await axiosInstance.get(`/seller/api/get-seller-events/${shop.id}?page=1&limit=10`)
                    const raw = res.data?.products;
                    if (Array.isArray(raw)) return raw;
                    if (raw && Array.isArray(raw.docs)) return raw.docs;
                    return [] as any[];
                },
                staleTime: 1000 * 60 * 5,
            })
        }, 600);
        return () => clearTimeout(t);
    }, [shop?.id, queryClient]);

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
            if (isFollowing) {
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
        if (!isLoading) {
            if (!location || !deviceInfo || !user?.id) {
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
    const numberFmt = (n: number | undefined | null) => {
        if (typeof n !== 'number') return 0;
        try { return n.toLocaleString(); } catch { return n; }
    };

    const StatCard = ({
        icon,
        label,
        value,
        isLoading: statLoading,
        isRefreshing,
    }: {
        icon: React.ReactNode;
        label: string;
        value: React.ReactNode;
        isLoading?: boolean;
        isRefreshing?: boolean;
    }) => (
        <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl px-4 py-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#18181b] border border-[#232326] flex items-center justify-center text-[#ff8800]">
                {icon}
            </div>
            <div className="leading-tight">
                <div className="text-xs text-gray-400 flex items-center gap-2">
                    <span>{label}</span>
                    {isRefreshing ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8800]/80 animate-pulse" aria-hidden /> : null}
                </div>
                {statLoading ? (
                    <div className="h-5 w-16 bg-[#2b2b30] rounded animate-pulse" aria-label="loading" />
                ) : (
                    <div className="text-lg font-semibold text-gray-200" aria-live="polite">{value}</div>
                )}
            </div>
        </div>
    );

    const [isTabPending, startTabTransition] = useTransition();

    const TabButton = ({ name }: { name: string }) => (
        <button
            onClick={() => startTabTransition(() => setActiveTab(name))}
            onMouseEnter={() => {
                if (!shop?.id) return;
                if (name === 'Offers') {
                    queryClient.prefetchQuery({
                        queryKey: ['seller-events', shop.id],
                        queryFn: async () => {
                            const res = await axiosInstance.get(`/seller/api/get-seller-events/${shop.id}?page=1&limit=10`)
                            const raw = res.data?.products;
                            if (Array.isArray(raw)) return raw;
                            if (raw && Array.isArray(raw.docs)) return raw.docs;
                            return [] as any[];
                        },
                        staleTime: 1000 * 60 * 5,
                    })
                } else if (name === 'Products') {
                    queryClient.prefetchQuery({
                        queryKey: ['seller-products', shop.id],
                        queryFn: async () => {
                            const res = await axiosInstance.get(`/seller/api/get-seller-products/${shop.id}?page=1&limit=10`);
                            const raw = res.data?.products;
                            if (Array.isArray(raw)) return raw;
                            if (raw && Array.isArray(raw.docs)) return raw.docs;
                            return [] as any[];
                        },
                        staleTime: 1000 * 60 * 5,
                    })
                }
            }}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${activeTab === name
                    ? 'bg-[#ff8800] text-[#18181b] shadow-sm'
                    : 'text-gray-300 hover:text-gray-200'
                }`}
        >
            {name}
        </button>
    );

    // rendering handled by shared ProductCard component

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

    const [copied, setCopied] = useState(false);
    const onShare = async () => {
        try {
            await navigator.clipboard?.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch (e) {
            console.log('Copy failed', e);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Cover + Header */}
            <div className="relative">
                {isProfileLoading ? (
                    <HeaderSkeleton />
                ) : (
                    <>
                        {/* Avatar & Info */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-end px-2 sm:px-4">
                            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#ff8800] border-4 border-[#18181b] overflow-hidden flex items-center justify-center shadow-[0_0_0_3px_#232326]">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                {shop?.avatar ? (
                                    <img src={shop.avatar} alt={shop.name} className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-[#18181b] font-bold text-3xl">{shop?.name?.[0] || '?'}</span>
                                )}
                            </div>

                            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-200">{shop?.name}</h1>
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
                                <div className="flex items-center sm:justify-end gap-3 sm:gap-4">
                                    <div className="hidden sm:grid grid-cols-3 gap-3">
                                        <StatCard icon={<Users className="w-5 h-5" />} label="Followers" value={numberFmt(followers)} isRefreshing={toggleFollowMutation.isPending} />
                                        <StatCard icon={<PackageIcon className="w-5 h-5" />} label="Products" value={numberFmt(Array.isArray(products) ? products.length : 0)} isLoading={isLoading && !Array.isArray(products)} isRefreshing={isFetchingProducts} />
                                        <StatCard icon={<StarIcon className="w-5 h-5" />} label="Rating" value={(shop as any)?.ratings ?? '5.0'} />
                                    </div>
                                    <button
                                        onClick={onShare}
                                        className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 bg-[#232326] text-gray-200 hover:bg-[#2b2b30] border border-[#232326] hover:border-[#ff8800] transition-colors`}
                                        aria-live="polite"
                                        title={copied ? 'Link copied!' : 'Copy profile link'}
                                    >
                                        <Share2 className="w-4 h-4" />
                                        {copied ? 'Copied' : 'Share'}
                                    </button>
                                    <Link
                                        href={`/profile?tab=inbox&shopId=${shop?.id}`}
                                        className={`px-4 py-2 rounded-xl font-semibold inline-flex items-center gap-2 bg-[#232326] text-gray-200 hover:bg-[#2b2b30] border border-[#232326] hover:border-[#ff8800] transition-colors`}
                                    >
                                        <MessageSquare className="w-4 h-4" />
                                        Message
                                    </Link>
                                    {isFollowStatusLoading ? (
                                        <div className="h-10 w-28 rounded-xl bg-[#232326] border border-[#232326] animate-pulse" />
                                    ) : (
                                        <button
                                            onClick={() => toggleFollowMutation.mutate()}
                                            disabled={toggleFollowMutation.isPending}
                                            className={`px-5 py-2 rounded-xl font-semibold inline-flex items-center gap-2 transition-colors ${isFollowing
                                                    ? 'bg-[#232326] text-gray-200 hover:bg-[#2b2b30]'
                                                    : 'bg-[#ff8800] text-[#18181b] hover:bg-[#ffa239]'
                                                } ${toggleFollowMutation.isPending ? 'opacity-60 cursor-not-allowed' : ''}`}
                                        >
                                            {isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                            {isFollowing ? 'Following' : 'Follow'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Stats (mobile) */}
            <div className="sm:hidden grid grid-cols-3 gap-3">
                <StatCard icon={<Users className="w-4 h-4" />} label="Followers" value={numberFmt(followers)} isRefreshing={toggleFollowMutation.isPending} />
                <StatCard icon={<PackageIcon className="w-4 h-4" />} label="Products" value={numberFmt(Array.isArray(products) ? products.length : 0)} isLoading={isLoading && !Array.isArray(products)} isRefreshing={isFetchingProducts} />
                <StatCard icon={<StarIcon className="w-4 h-4" />} label="Rating" value={(shop as any)?.ratings ?? '5.0'} />
            </div>

            {/* Tabs */}
            <div className="bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] rounded-2xl p-3 sm:p-4">
                <div className="w-full overflow-x-auto no-scrollbar">
                    <div className="inline-flex items-center gap-1 bg-[#18181b] border border-[#232326] rounded-xl p-1">
                        {TABS.map((t) => (
                            <TabButton key={t} name={t} />
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="mt-4" aria-busy={isTabPending}>
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
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-gray-200 font-semibold">Products</h3>
                                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                                    {isLoading && !Array.isArray(products) ? (
                                                        <span className="inline-block h-4 w-10 bg-[#2b2b30] rounded animate-pulse" />
                                                    ) : (
                                                        <>{numberFmt(products.length)} items</>
                                                    )}
                                                    {isFetchingProducts ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8800]/80 animate-pulse" aria-hidden /> : null}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {products.map((p: any) => (
                                                    <ProductCard key={p?.id || p?._id || p?.slug || Math.random()} product={p} isEvent={false} />
                                                ))}
                                            </div>
                                        </>
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
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <h3 className="text-gray-200 font-semibold">Offers</h3>
                                                <span className="text-sm text-gray-400 flex items-center gap-2">
                                                    {isEventsLoading && !Array.isArray(events) ? (
                                                        <span className="inline-block h-4 w-10 bg-[#2b2b30] rounded animate-pulse" />
                                                    ) : (
                                                        <>{numberFmt(events.length)} items</>
                                                    )}
                                                    {isFetchingEvents ? <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#ff8800]/80 animate-pulse" aria-hidden /> : null}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {events.map((p: any) => (
                                                    <ProductCard key={p?.id || p?._id || p?.slug || Math.random()} product={p} isEvent={true} />
                                                ))}
                                            </div>
                                        </>
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
        </div>
    )
}

export default SellerProfile
