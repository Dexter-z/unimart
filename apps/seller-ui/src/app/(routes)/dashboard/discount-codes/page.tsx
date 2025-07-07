"use client"

import { Button } from '@/components/ui/button'
import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight, Trash } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const Page = () => {
    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes")
            return res?.data?.discount_codes || []
        }
    })

    const handleDeleteClick = async (discount: any) => { }
    return (
        <div className="w-full mx-auto p-4 md:p-8">
            {/* Header and Actions */}
            <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">Discount Codes</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Breadcrumbs */}
                <div className="flex items-center mb-4 text-sm">
                    <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                    <ChevronRight size={20} className="opacity-80 text-white mx-1" />
                    <span className='text-white'>Discount Codes</span>
                </div>
                <Button
                    className="self-start md:self-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                    + Create Discount Code
                </Button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-zinc-900 rounded-lg shadow">
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="bg-zinc-800 text-gray-300">
                            <th className="py-3 px-4 text-left">Title</th>
                            <th className="py-3 px-4 text-left">Type</th>
                            <th className="py-3 px-4 text-left">Value</th>
                            <th className="py-3 px-4 text-left">Code</th>
                            <th className="py-3 px-4 text-left">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr>
                                <td colSpan={5} className="py-6 px-4 text-center text-gray-400">Loading...</td>
                            </tr>
                        ) : discountCodes.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="py-6 px-4 text-center text-gray-400">No discount codes found.</td>
                            </tr>
                        ) : (
                            discountCodes.map((discount: any) => (
                                <tr key={discount?.id} className="border-b border-zinc-800 hover:bg-zinc-800 transition">
                                    <td className="py-3 px-4">{discount?.public_name}</td>
                                    <td className="py-3 px-4 capitalize">{discount?.discountType === "percentage" ? "Percentage (%)" : "Flat ($)"}</td>
                                    <td className="py-3 px-4">{discount?.discountType === "percentage" ? `${discount.discountValue}%` : `$${discount.discountValue}`}</td>
                                    <td className="py-3 px-4 font-mono">{discount?.discountCode}</td>
                                    <td className="py-3 px-4">
                                        {/* Actions placeholder */}
                                        <button
                                            className="text-blue-500 hover:underline text-xs"
                                            onClick={() => handleDeleteClick(discount)}>
                                            <Trash size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Discount Modal */}

        </div>
    )
}

export default Page
