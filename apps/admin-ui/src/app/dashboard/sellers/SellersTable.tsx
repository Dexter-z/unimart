"use client"

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Ban } from "lucide-react";

export interface Seller {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    avatar?: string;
    shop_name: string;
    shop_id?: string;
    address: string;
    createdAt: string;
    banned?: boolean;
}

export default function SellersTable() {
    const [showBanModal, setShowBanModal] = useState(false);
    const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);
    const [banError, setBanError] = useState<string | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ["all-sellers"],
        queryFn: async () => {
            const res = await axiosInstance.get("/admin/api/get-all-sellers");
            // Log sellers data for field verification
            console.log("Sellers data:", res?.data?.data);
            // Map each seller to extract shop fields
            const sellersRaw = res?.data?.data || [];
            return sellersRaw.map((seller: any) => ({
                ...seller,
                shop_name: seller.shop?.name || "",
                shop_id: seller.shop?.id || "",
                address: seller.shop?.address || "",
                avatar: seller.shop?.avatar || "",
            }));
        },
        staleTime: 1000 * 60 * 5,
    });

    const sellers: Seller[] = data || [];

    // Ban seller mutation (dummy frontend logic, replace with API if available)
    const banSeller = async (sellerId: string) => {
        try {
            // If you have an API endpoint, use axiosInstance.put(`/admin/api/ban-seller/${sellerId}`)
            // For now, just simulate ban
            setShowBanModal(false);
            setBanError(null);
            // Optionally update local state or refetch
            refetch();
        } catch (error: any) {
            setBanError(error?.response?.data?.message || "Error banning seller. Please try again.");
        }
    };

    return (
        <div className="p-4 sm:p-6 bg-black min-h-screen">
            <div className="mb-4 sm:mb-6">
                <h1 className="text-xl sm:text-2xl font-bold text-white">Sellers</h1>
                <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage and track all sellers</p>
            </div>
            <div className="bg-black rounded-lg shadow border border-gray-800">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
                    <h2 className="text-xl font-semibold text-white">All Sellers</h2>
                </div>
                {isLoading ? (
                    <div className="flex items-center justify-center h-64 bg-black">
                        <div className="text-white">Loading Sellers...</div>
                    </div>
                ) : (
                    <>
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-800">
                                <thead className="bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avatar</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Phone Number</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Shop Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Address</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-black divide-y divide-gray-800">
                                    {sellers.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-6 py-8 text-center text-gray-400">No sellers found.</td>
                                        </tr>
                                    ) : (
                                        sellers.map(seller => (
                                            <tr key={seller.id} className="hover:bg-blue-900 transition-colors duration-200">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {seller.avatar ? (
                                                        <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">?</div>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{seller.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{seller.email}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{seller.phone_number}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">
                                                    {seller.shop_id ? (
                                                        <a href={`/shop/${seller.shop_id}`} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                                                            {seller.shop_name}
                                                        </a>
                                                    ) : seller.shop_name}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-300">{seller.address}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-gray-400">{new Date(seller.createdAt).toLocaleDateString()}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                                                        title="Ban Seller"
                                                        onClick={() => { setSelectedSeller(seller); setShowBanModal(true); }}
                                                        disabled={seller.banned}
                                                    >
                                                        <Ban size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="block sm:hidden">
                            {sellers.length === 0 ? (
                                <div className="px-4 py-8 text-center text-gray-400">No sellers found.</div>
                            ) : (
                                <div className="divide-y divide-gray-800">
                                    {sellers.map(seller => (
                                        <div key={seller.id} className="px-4 py-4 hover:bg-blue-900 transition-colors duration-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                {seller.avatar ? (
                                                    <img src={seller.avatar} alt={seller.name} className="w-10 h-10 rounded-full object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400">?</div>
                                                )}
                                                <div className="font-bold text-white text-lg">{seller.name}</div>
                                            </div>
                                            <div className="text-gray-300 text-sm">{seller.email}</div>
                                            <div className="text-gray-300 text-sm">{seller.phone_number}</div>
                                            <div className="text-white text-sm font-semibold">Shop: {seller.shop_name}</div>
                                            <div className="text-white text-sm font-semibold">
                                                Shop: {seller.shop_id ? (
                                                    <a href={`/shop/${seller.shop_id}`} className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">
                                                        {seller.shop_name}
                                                    </a>
                                                ) : seller.shop_name}
                                            </div>
                                            <div className="text-gray-300 text-sm">Address: {seller.address}</div>
                                            <div className="text-gray-400 text-xs">Joined: {new Date(seller.createdAt).toLocaleDateString()}</div>
                                            <div className="flex justify-end items-center pt-3 mt-3 border-t border-gray-800">
                                                <button
                                                    className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                                                    title="Ban Seller"
                                                    onClick={() => { setSelectedSeller(seller); setShowBanModal(true); }}
                                                    disabled={seller.banned}
                                                >
                                                    <Ban size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* Ban Confirmation Modal */}
            {showBanModal && selectedSeller && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                        <div className="text-lg md:text-xl text-white font-bold mb-2">Ban Seller</div>
                        <div className="text-gray-300 mb-4">
                            Are you sure you want to ban <span className="font-semibold text-red-400">{selectedSeller.name}</span>? This seller will be restricted from accessing the platform.
                        </div>
                        {banError && <div className="text-red-400 mb-2">{banError}</div>}
                        <div className="flex gap-3 justify-end">
                            <button
                                className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-50"
                                onClick={() => selectedSeller && banSeller(selectedSeller.id)}
                                disabled={!selectedSeller}
                            >
                                Ban
                            </button>
                            <button
                                className="px-4 py-2 rounded bg-gray-700 text-gray-300"
                                onClick={() => { setShowBanModal(false); setSelectedSeller(null); setBanError(null); }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
