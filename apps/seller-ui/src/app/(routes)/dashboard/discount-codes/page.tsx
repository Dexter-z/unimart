"use client"

import { Button } from '@/components/ui/button'
import axiosInstance from '@/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Trash } from 'lucide-react'
import Link from 'next/link'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'

const Page = () => {
    const [showModal, setShowModal] = useState(false)
    const queryClient = useQueryClient()

    const { data: discountCodes = [], isLoading } = useQuery({
        queryKey: ["shop-discounts"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-discount-codes")
            return res?.data?.discount_codes || []
        }
    })

    const handleDeleteClick = async (discount: any) => { }
    
    const onSubmit = (data: any) => {
        if(discountCodes.length >= 8){
            toast.error("You can only create up to 8 discount codes.")
            return;
        }
    }

    const {
        register,
        handleSubmit,
        control,
        reset,
        formState: {errors},
    } = useForm({
        defaultValues: {
            public_name: "",
            discountType: "percentage",
            discountValue: "",
            discountCode: ""
        }
    })

    const createDiscountCodeMutation = useMutation({
        mutationFn: async (data) => {
            await axiosInstance.post("/product/api/create-discount-code", data)
        },
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey: ["shop-discounts"]})
            reset()
            toast.success("Discount code created successfully!")
            setShowModal(false)
        },
    })


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
                    onClick={() => setShowModal(true)}
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
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-2">
                        <h3 className="text-lg font-semibold mb-4 text-white">Create Discount Code</h3>
                        <form
                            className="flex flex-col gap-4"
                            onSubmit={handleSubmit(onSubmit)}
                        >
                            <input
                                className="rounded px-3 py-2 bg-zinc-800 text-white border border-gray-600 focus:outline-none"
                                placeholder="Title"
                                required
                            />
                            <select
                                className="rounded px-3 py-2 bg-zinc-800 text-white border border-gray-600 focus:outline-none"
                                required
                            >
                                <option value="">Select Type</option>
                                <option value="percentage">Percentage (%)</option>
                                <option value="flat">Flat ($)</option>
                            </select>
                            <input
                                type="number"
                                className="rounded px-3 py-2 bg-zinc-800 text-white border border-gray-600 focus:outline-none"
                                placeholder="Value"
                                required
                            />
                            <input
                                className="rounded px-3 py-2 bg-zinc-800 text-white border border-gray-600 focus:outline-none"
                                placeholder="Code"
                                required
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    type="button"
                                    className="px-4 py-2 rounded bg-gray-700 text-white hover:bg-gray-600"
                                    onClick={() => setShowModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}

export default Page
