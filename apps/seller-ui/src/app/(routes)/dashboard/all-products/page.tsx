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
    ChevronRight,
    Recycle
} from "lucide-react"

import Link from 'next/link'
import axiosInstance from '@/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'
import { Sheet, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet'

const fetchProducts = async () => {
    const res = await axiosInstance.get('/product/api/get-shop-products')
    return res?.data?.products
}

const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [analyticsData, setAnalyticsData] = useState(null)
    const [showAnalytics, setShowAnalytics] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<any>(null)

    // Add a local state to track soft-deleted products (by id)
    const [deletedProducts, setDeletedProducts] = useState<{ [id: string]: boolean }>({})

    const queryClient = useQueryClient()

    // Delete mutation (stubbed API call)
    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            // TODO: Replace with your actual API endpoint
            return await axiosInstance.delete(`/product/api/delete-product/${productId}`)
        },
        onSuccess: (_, productId) => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
            setDeletedProducts(prev => ({ ...prev, [productId]: true }))
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
        },
    })

    // Restore mutation (stubbed API call)
    const restoreProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            // TODO: Replace with your actual API endpoint
            return await axiosInstance.put(`/product/api/restore-product/${productId}`)
        },
        onSuccess: (_, productId) => {
            setDeletedProducts(prev => ({ ...prev, [productId]: false }))
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
        },
    })

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
            accessorKey: 'title',
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
            cell: ({ row }: any) => {
                const isDeleted = deletedProducts[row.original.id] || row.original.deleted
                return (
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

                        {isDeleted ? (
                            <button
                                className="text-green-400 hover:text-green-300 transition"
                                onClick={() => restoreProductMutation.mutate(row.original.id)}
                                disabled={restoreProductMutation.isPending}
                                title="Restore Product"
                            >
                                <Recycle 
                                    size={18} 
                                    className={restoreProductMutation.isPending ? 'animate-spin' : ''}
                                />
                            </button>
                        ) : (
                            <button
                                className='text-red-400 hover:text-red-300 transition'
                                onClick={() => {
                                    setSelectedProduct(row.original)
                                    setShowDeleteModal(true)
                                }}
                                title="Delete Product"
                            >
                                <Trash size={18} />
                            </button>
                        )}
                    </div>
                )
            }
        }
    ], [deletedProducts, restoreProductMutation.isPending])

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

            {/* Product Tables */}
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
            {/* Delete Confirmation Modal */}
            <Sheet open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <SheetContent side="top" className="max-w-md mx-auto rounded-lg bg-gray-900">
                    <SheetHeader>
                        <SheetTitle className="text-lg text-white">Delete Product</SheetTitle>
                        <SheetDescription className="text-gray-300">
                            Are you sure you want to delete <span className="font-semibold text-red-400">{selectedProduct?.title}</span>? This Product will be moved to a Temporary storage location and permanently deleted after 24hours. You can restore it within this time.
                        </SheetDescription>
                    </SheetHeader>
                    <SheetFooter>
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded mr-2 disabled:opacity-60"
                            onClick={() => deleteProductMutation.mutate(selectedProduct?.id)}
                            disabled={deleteProductMutation.isPending}
                        >
                            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                        <SheetClose asChild>
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded"
                                type="button"
                                disabled={deleteProductMutation.isPending}
                            >
                                Cancel
                            </button>
                        </SheetClose>
                    </SheetFooter>
                    {deleteProductMutation.isError && (
                        <div className="text-red-400 mt-2 text-sm">
                            Error deleting product. Please try again.
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default ProductList
