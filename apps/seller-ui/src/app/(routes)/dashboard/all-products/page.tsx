"use client"

import React, { useMemo, useState } from 'react'

import {
    useReactTable,
    flexRender,
    getCoreRowModel,
    // getSortedRowModel,
    // SortingState,
    // getPaginationRowModel,
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

// Define proper type for Product
interface Product {
    id: string;
    title: string;
    slug: string;
    salePrice: number;
    stock: number;
    category: string;
    ratings?: number;
    deleted?: boolean;
    images: Array<{
        url: string;
    }>;
}

const fetchProducts = async (): Promise<Product[]> => {
    const res = await axiosInstance.get('/product/api/get-shop-products')
    return res?.data?.products || []
}

const ProductList = () => {
    const [globalFilter, setGlobalFilter] = useState('')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)

    // Add a local state to track soft-deleted products (by id)
    const [deletedProducts, setDeletedProducts] = useState<{ [id: string]: boolean }>({})

    const queryClient = useQueryClient()

    // Delete mutation
    const deleteProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            return await axiosInstance.delete(`/product/api/delete-product/${productId}`)
        },
        onSuccess: (_, productId) => {
            setShowDeleteModal(false)
            setSelectedProduct(null)
            setDeletedProducts(prev => ({ ...prev, [productId]: true }))
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
        },
    })

    // Restore mutation
    const restoreProductMutation = useMutation({
        mutationFn: async (productId: string) => {
            return await axiosInstance.put(`/product/api/restore-product/${productId}`)
        },
        onSuccess: (_, productId) => {
            setDeletedProducts(prev => ({ ...prev, [productId]: false }))
            queryClient.invalidateQueries({ queryKey: ['shop-products'] })
        },
    })

    const { data: products = [], isLoading } = useQuery<Product[]>({
        queryKey: ['shop-products'],
        queryFn: fetchProducts,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })

    // Fix: columns should be memoized with products as dependency for correct rendering
    const columns = useMemo(() => [
        {
            accessorKey: 'image',
            header: 'Image',
            cell: ({ row }: { row: { original: Product } }) => {
                return (
                    <Image src={row.original.images[0]?.url || ''}
                        alt={row.original.title}
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
            cell: ({ row }: { row: { original: Product } }) => {
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
            cell: ({ row }: { row: { original: Product } }) => <span>${row.original.salePrice}</span>
        },
        {
            accessorKey: 'stock',
            header: 'Stock',
            cell: ({ row }: { row: { original: Product } }) => (
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
            cell: ({ row }: { row: { original: Product } }) => (
                <div className='flex items-center gap-1 text-yellow-400'>
                    <Star fill='#fde047' size={18} /> {" "}
                    <span className='text-white'>{row.original.ratings || 5}</span>
                </div>
            )
        },
        {
            header: 'Actions',
            cell: ({ row }: { row: { original: Product } }) => {
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
                            title="View Analytics"
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
        <div className='w-full min-h-screen p-4 md:p-8'>
            {/* Header and Actions */}
            <h2 className="text-xl md:text-2xl py-2 font-semibold font-Poppins text-white">All Products</h2>
            
            {/* Breadcrumbs */}
            <div className="flex items-center mb-4 text-sm">
                <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                <ChevronRight size={16} className="opacity-80 text-white mx-1" />
                <span className='text-white'>All Products</span>
            </div>

            {/* Search and Add Button */}
            <div className="flex flex-col gap-4 mb-6">
                {/* Search Bar */}
                <div className='flex items-center bg-gray-900 p-3 rounded-md'>
                    <Search size={18} className='text-gray-400 mr-2 flex-shrink-0' />
                    <input
                        type="text"
                        placeholder="Search products..."
                        className='w-full bg-transparent outline-none text-white placeholder-gray-400'
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                    />
                </div>

                {/* Add Product Button */}
                <div className="flex justify-end">
                    <Link
                        href="/dashboard/create-product"
                        className='bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm md:text-base'
                    >
                        <Plus size={18} /> Add Product
                    </Link>
                </div>
            </div>

            {/* Product Content */}
            <div className='bg-gray-800 rounded-lg overflow-hidden'>
                {isLoading ? (
                    <div className="p-8 text-center text-white">Loading Products...</div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-700">
                                <thead className="bg-gray-700">
                                    {table.getHeaderGroups().map(headerGroup => (
                                        <tr key={headerGroup.id}>
                                            {headerGroup.headers.map(header => (
                                                <th
                                                    key={header.id}
                                                    className="px-4 py-3 text-left font-semibold text-white whitespace-nowrap"
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
                                                        className="px-4 py-3 whitespace-nowrap border-b border-gray-700 align-middle"
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden">
                            {table.getRowModel().rows.length === 0 ? (
                                <div className="text-center text-gray-400 py-8">No products found.</div>
                            ) : (
                                <div className="space-y-4 p-4">
                                    {table.getRowModel().rows.map(row => {
                                        const product: Product = row.original;
                                        const isDeleted = deletedProducts[product.id] || product.deleted;
                                        return (
                                            <div key={row.id} className="bg-gray-700 rounded-lg p-4 space-y-3">
                                                {/* Product Header */}
                                                <div className="flex items-start gap-3">
                                                    <Image 
                                                        src={product.images[0]?.url || ''}
                                                        alt={product.title}
                                                        className='w-16 h-16 rounded-md object-cover flex-shrink-0'
                                                        width={64}
                                                        height={64}
                                                    />
                                                    <div className="flex-1 min-w-0">
                                                        <Link
                                                            href={`${process.env.NEXT_PUBLIC_USER_UI_LINK || ''}/product/${product.slug}`}
                                                            className='text-blue-400 hover:underline font-medium text-sm leading-tight'
                                                            title={product.title}
                                                        >
                                                            {product.title}
                                                        </Link>
                                                        <p className="text-gray-400 text-xs mt-1">{product.category}</p>
                                                    </div>
                                                </div>

                                                {/* Product Details Grid */}
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <span className="text-gray-400">Price:</span>
                                                        <span className="text-white ml-1">${product.salePrice}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-gray-400">Stock:</span>
                                                        <span className={`ml-1 ${product.stock <= 10 ? 'text-red-500' : 'text-white'}`}>
                                                            {product.stock} left
                                                        </span>
                                                    </div>
                                                    <div className="col-span-2">
                                                        <span className="text-gray-400">Rating:</span>
                                                        <div className='inline-flex items-center gap-1 text-yellow-400 ml-1'>
                                                            <Star fill='#fde047' size={14} />
                                                            <span className='text-white text-sm'>{product.ratings || 5}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                                                    <div className="flex gap-3">
                                                        <Link 
                                                            href={`/product/${product.id}`} 
                                                            className='text-blue-400 hover:text-blue-300 transition p-2'
                                                            title="View Product"
                                                        >
                                                            <Eye size={18} />
                                                        </Link>

                                                        <Link 
                                                            href={`/product/edit/${product.id}`} 
                                                            className='text-yellow-400 hover:text-yellow-300 transition p-2'
                                                            title="Edit Product"
                                                        >
                                                            <Pencil size={18} />
                                                        </Link>

                                                        <button
                                                            className='text-green-400 hover:text-green-300 transition p-2'
                                                            title="View Analytics"
                                                        >
                                                            <BarChart size={18} />
                                                        </button>
                                                    </div>

                                                    <div>
                                                        {isDeleted ? (
                                                            <button
                                                                className="text-green-400 hover:text-green-300 transition p-2"
                                                                onClick={() => restoreProductMutation.mutate(product.id)}
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
                                                                className='text-red-400 hover:text-red-300 transition p-2'
                                                                onClick={() => {
                                                                    setSelectedProduct(product)
                                                                    setShowDeleteModal(true)
                                                                }}
                                                                title="Delete Product"
                                                            >
                                                                <Trash size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
            {/* Delete Confirmation Modal */}
            <Sheet open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <SheetContent side="bottom" className="max-w-md mx-auto rounded-t-lg bg-gray-900 md:max-w-lg">
                    <SheetHeader className="text-left pb-4">
                        <SheetTitle className="text-lg md:text-xl text-white">Delete Product</SheetTitle>
                        <SheetDescription className="text-gray-300 text-sm md:text-base">
                            Are you sure you want to delete <span className="font-semibold text-red-400">{selectedProduct?.title}</span>? This Product will be moved to a Temporary storage location and permanently deleted after 24hours. You can restore it within this time.
                        </SheetDescription>
                    </SheetHeader>
                    <SheetFooter className="flex-col gap-3 sm:flex-row sm:gap-2">
                        <button
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded disabled:opacity-60 w-full sm:w-auto text-sm md:text-base"
                            onClick={() => selectedProduct && deleteProductMutation.mutate(selectedProduct.id)}
                            disabled={deleteProductMutation.isPending || !selectedProduct}
                        >
                            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                        </button>
                        <SheetClose asChild>
                            <button
                                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded w-full sm:w-auto text-sm md:text-base"
                                type="button"
                                disabled={deleteProductMutation.isPending}
                            >
                                Cancel
                            </button>
                        </SheetClose>
                    </SheetFooter>
                    {deleteProductMutation.isError && (
                        <div className="text-red-400 mt-3 text-sm">
                            Error deleting product. Please try again.
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    )
}

export default ProductList
