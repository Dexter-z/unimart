"use client"

import React, { useMemo, useState } from 'react'

import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    getPaginationRowModel,
    getFilteredRowModel
} from '@tanstack/react-table'

import {
    Search,
    Pencil,
    Trash,
    Eye,
    Plus,
    BarChart,
    Star,
    ChevronRight
} from "lucide-react"

import Link from 'next/link'
import axiosInstance from '@/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

const fetchProducts = async () => {
    const res = await axiosInstance.get('/product/api/get-shop-products')
    return res?.data?.products
}

const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [analyticsData, setAnalyticsData] = useState(null)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>()

    const queryClient = useQueryClient()

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['shop-products'],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Fix: columns should be memoized with products as dependency for correct rendering
    const columns = useMemo(() => [
        {
            accessorKey: 'image',
            header: 'Image',
            cell: ({ row }: any) => {
                console.log(row.original)
                return (
                    <Image src={row.original.images[0]?.url}
                        alt={row.original.images[0]?.url}
                        className='w-12 h-12 rounded-md object-cover'
                        width={48}
                        height={48}
                    />
                )
            }
        },
        {
            accessorKey: 'name',
            header: 'Product Name',
            cell: ({ row }: any) => {
                const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
                return (
                    <Link
                        href={`${process.env.NEXT_PUBLIC_USER_UI_LINK || ''}/product/${row.original.slug}`}
                        className='text-blue-400 hover:underline'
                        title={row.original.title}
                    >
                        {truncatedTitle}
                    </Link>
                )
            }
        },
        {
            accessorKey: 'price',
            header: 'Price',
            cell: ({ row }: any) => <span>${row.original.salePrice}</span>
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
            cell: ({ row }: any) => (
                <span className={row.original.stock <= 10 ? 'text-red-500' : 'text-white'}>
                    {row.original.stock} left
                </span>
            )
        },
        {
            accessorKey: 'category',
            header: 'Category',
        },
        {
            accessorKey: 'rating',
            header: 'Rating',
            cell: ({ row }: any) => (
                <div className='flex items-center gap-1 text-yellow-400'>
                    <Star fill='#fde047' size={18} /> {" "}
                    <span className='text-white'>{row.original.ratings || 5}</span>
                </div>
            )
        },
        {
            header: 'Actions',
            cell: ({ row }: any) => (
                <div className="flex gap-3">
                    <Link href={`/product/${row.original.id}`} className='text-blue-400 hover:text-blue-300 transition'>
                        <Eye size={18} />
                    </Link>

                    <Link href={`/product/edit/${row.original.id}`} className='text-yellow-400 hover:text-yellow-300 transition'>
                        <Pencil size={18} />
                    </Link>

                    <button
                        className='text-green-400 hover:text-green-300 transition'
                    //onClick={() => openAnalytics(row.original)}
                    >
                        <BarChart size={18} />
                    </button>

                    <button
                        className='text-red-400 hover:text-red-300 transition'
                    //onClick={() => openDeleteModal(row.original)}
                    >
                        <Trash size={18} />
                    </button>
                </div>
            )
        }
    ], [])

    const table = useReactTable({
        data: products,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        globalFilterFn: "includesString",
        state: { globalFilter },
        onGlobalFilterChange: setGlobalFilter,
    })

    return (
        <div className='w-full min-h-screen p-8'>
            {/* Header and Actions */}
            <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">All Products</h2>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                {/* Breadcrumbs */}
                <div className="flex items-center mb-4 text-sm">
                    <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                    <ChevronRight size={20} className="opacity-80 text-white mx-1" />
                    <span className='text-white'>All Products</span>
                </div>

                <Link
                    href="/dashboard/create-product"
                    className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2'
                >
                    <Plus size={18} /> Add Product
                </Link>
            </div>
            {/* Search Bar */}
            <div className='mb-4 flex items-center bg-gray-900 p-2 rounded-md flex-1'>
                <Search size={18} className='text-gray-400 mr-2' />
                <input
                    type="text"
                    placeholder="Search products..."
                    className='w-full bg-transparent outline-none text-white'
                    value={globalFilter}
                    onChange={(e) => setGlobalFilter(e.target.value)}
                />
            </div>

            {/* Product Table */}
            <div className='bg-gray-800 rounded-lg overflow-x-auto'>
                {isLoading ? (
                    <div className="p-8 text-center text-white">Loading Products...</div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-700 text-sm md:text-base">
                        <thead className="bg-gray-700">
                            {table.getHeaderGroups().map(headerGroup => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map(header => (
                                        <th
                                            key={header.id}
                                            className="px-3 py-3 text-left font-semibold text-white whitespace-nowrap"
                                            style={{ minWidth: 100 }}
                                        >
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                                        </th>
                                    ))}
                                </tr>
                            ))}
                        </thead>
                        <tbody>
                            {table.getRowModel().rows.length === 0 ? (
                                <tr>
                                    <td colSpan={columns.length} className="text-center text-gray-400 py-8">No products found.</td>
                                </tr>
                            ) : (
                                table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="hover:bg-gray-700 transition">
                                        {row.getVisibleCells().map(cell => (
                                            <td
                                                key={cell.id}
                                                className="px-3 py-3 whitespace-nowrap border-b border-gray-700 align-middle"
                                            >
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}

export default ProductList
