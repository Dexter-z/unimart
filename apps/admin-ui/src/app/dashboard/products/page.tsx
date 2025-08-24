
"use client"

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'
import {
  Pencil,
  Trash,
  Eye,
  Plus,
  BarChart,
  Star,
  Recycle
} from "lucide-react"
import Link from 'next/link'
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import Image from 'next/image'

interface Product {
  id: string;
  title: string;
  slug: string;
  salePrice: number;
  stock: number;
  category: string;
  ratings?: number;
  deleted?: boolean;
  images: Array<{ url: string }>;
}



const ProductList = () => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [deletedProducts, setDeletedProducts] = useState<{ [id: string]: boolean }>({})
  const queryClient = useQueryClient()
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10;

  const fetchProducts = async () => {
    const res = await axiosInstance.get(`/admin/api/get-all-products?page=${page}&limit=${limit}`)
    // The API returns { success, data, meta }
    return {
      products: res?.data?.data || [],
      meta: res?.data?.meta || { currentPage: 1, totalPages: 1, totalProducts: 0 }
    }
  }

  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await axiosInstance.delete(`/product/api/delete-product/${productId}`)
    },
    onSuccess: (_, productId) => {
      setShowDeleteModal(false)
      setSelectedProduct(null)
      setDeletedProducts(prev => ({ ...prev, [productId]: true }))
      queryClient.invalidateQueries({ queryKey: ['all-products'] })
      setDeleteError(null)
    },
    onError: (error: any) => {
      setDeleteError(error?.response?.data?.message || 'Error deleting product. Please try again.')
    },
  })

  const restoreProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return await axiosInstance.put(`/product/api/restore-product/${productId}`)
    },
    onSuccess: (_, productId) => {
      setDeletedProducts(prev => ({ ...prev, [productId]: false }))
      queryClient.invalidateQueries({ queryKey: ['all-products'] })
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['all-products', page, limit],
    queryFn: fetchProducts,
    staleTime: 1000 * 60 * 5,
  })
  const products = data?.products || [];
  const meta = data?.meta || { currentPage: 1, totalPages: 1, totalProducts: 0 };

  const columns = useMemo(() => [
    {
      accessorKey: 'image',
      header: 'Image',
      cell: ({ row }: { row: { original: Product } }) => (
        <Image src={row.original.images[0]?.url || ''}
          alt={row.original.title}
          className='w-12 h-12 rounded-md object-cover'
          width={48}
          height={48}
        />
      )
    },
    {
      accessorKey: 'title',
      header: 'Product Name',
      cell: ({ row }: { row: { original: Product } }) => {
        const truncatedTitle = row.original.title.length > 25 ? `${row.original.title.substring(0, 25)}...` : row.original.title;
        return (
          <div>
            <Link
              href={`/product/${row.original.slug}`}
              className='text-blue-400 hover:text-blue-300 transition-colors duration-200 font-medium'
              title={row.original.title}
            >
              {truncatedTitle}
            </Link>
            <div className="text-sm text-gray-400 mt-1">{row.original.category}</div>
          </div>
        )
      }
    },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }: { row: { original: Product } }) => <span className="text-white font-medium">${row.original.salePrice}</span>
    },
    {
      accessorKey: 'stock',
      header: 'Stock',
      cell: ({ row }: { row: { original: Product } }) => (
        <span className={row.original.stock <= 10 ? 'text-red-400' : 'text-white'}>
          {row.original.stock} left
        </span>
      )
    },
    {
      accessorKey: 'category',
      header: 'Category',
      cell: ({ row }: { row: { original: Product } }) => <span className="text-white">{row.original.category}</span>
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
            <Link href={`/product/${row.original.id}`} className='text-blue-400 hover:text-blue-300 transition-colors duration-200'>
              <Eye size={18} />
            </Link>
            <button className='text-green-400 hover:text-green-300 transition-colors duration-200' title="View Analytics">
              <BarChart size={18} />
            </button>
            {isDeleted ? (
              <button className="text-green-400 hover:text-green-300 transition-colors duration-200" onClick={() => restoreProductMutation.mutate(row.original.id)} disabled={restoreProductMutation.isPending} title="Restore Product">
                <Recycle size={18} className={restoreProductMutation.isPending ? 'animate-spin' : ''} />
              </button>
            ) : (
              <button className='text-red-400 hover:text-red-300 transition-colors duration-200' onClick={() => { setSelectedProduct(row.original); setShowDeleteModal(true); }} title="Delete Product">
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
    <div className="p-4 sm:p-6 bg-black min-h-screen">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-white">Product Management</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage and track all products</p>
      </div>
      <div className="bg-black rounded-lg shadow border border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-white">All Products</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="relative">
                <input type="text" placeholder="Search products..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full sm:w-auto pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
            </div>
          </div>
        </div>
        {/* Loading skeleton for products */}
        {isLoading ? (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Image</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Product Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-gray-800">
                  {[...Array(limit)].map((_, i) => (
                    <tr key={i}>
                      {[...Array(7)].map((_, j) => (
                        <td key={j} className="px-6 py-4 whitespace-nowrap">
                          <div className="h-6 bg-gray-800 rounded animate-pulse" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="block sm:hidden">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="px-4 py-4 border-b border-gray-800">
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-md bg-gray-800 animate-pulse" />
                    <div className="flex-1 min-w-0">
                      <div className="h-4 bg-gray-800 rounded w-2/3 mb-2 animate-pulse" />
                      <div className="h-3 bg-gray-800 rounded w-1/3 animate-pulse" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                    <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
                    <div className="h-3 bg-gray-800 rounded w-1/2 animate-pulse" />
                    <div className="col-span-2 h-3 bg-gray-800 rounded w-1/3 animate-pulse" />
                  </div>
                  <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-800">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
                      <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
                    </div>
                    <div>
                      <div className="w-8 h-8 bg-gray-800 rounded animate-pulse" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : null}
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-black">
            <div className="text-white">Loading Products...</div>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="bg-black divide-y divide-gray-800">
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">No products found.</td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className="hover:bg-blue-900 transition-colors duration-200">
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="block sm:hidden">
              {table.getRowModel().rows.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400">No products found.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {table.getRowModel().rows.map(row => {
                    const product: Product = row.original;
                    const isDeleted = deletedProducts[product.id] || product.deleted;
                    return (
                      <div key={row.id} className="px-4 py-4 hover:bg-blue-900 transition-colors duration-200">
                        <div className="flex items-start gap-3">
                          <Image src={product.images[0]?.url || ''} alt={product.title} className='w-16 h-16 rounded-md object-cover flex-shrink-0' width={64} height={64} />
                          <div className="flex-1 min-w-0">
                            <Link href={`/product/${product.slug}`} className='text-blue-400 hover:underline font-medium text-sm leading-tight' title={product.title}>{product.title}</Link>
                            <p className="text-gray-400 text-xs mt-1">{product.category}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                          <div><span className="text-gray-400">Price:</span> <span className="text-white ml-1">${product.salePrice}</span></div>
                          <div><span className="text-gray-400">Stock:</span> <span className={`ml-1 ${product.stock <= 10 ? 'text-red-400' : 'text-white'}`}>{product.stock} left</span></div>
                          <div className="col-span-2"><span className="text-gray-400">Rating:</span> <div className='inline-flex items-center gap-1 text-yellow-400 ml-1'><Star fill='#fde047' size={14} /><span className='text-white text-sm'>{product.ratings || 5}</span></div></div>
                        </div>
                        <div className="flex justify-between items-center pt-3 mt-3 border-t border-gray-800">
                          <div className="flex gap-3">
                            <Link href={`/product/${product.slug}`} className='text-blue-400 hover:text-blue-300 transition-colors duration-200 p-2' title="View Product"><Eye size={18} /></Link>
                            {/* Edit button removed */}
                            <button className='text-green-400 hover:text-green-300 transition-colors duration-200 p-2' title="View Analytics"><BarChart size={18} /></button>
                          </div>
                          <div>
                            {isDeleted ? (
                              <button className="text-green-400 hover:text-green-300 transition-colors duration-200 p-2" onClick={() => restoreProductMutation.mutate(product.id)} disabled={restoreProductMutation.isPending} title="Restore Product"><Recycle size={18} className={restoreProductMutation.isPending ? 'animate-spin' : ''} /></button>
                            ) : (
                              <button className='text-red-400 hover:text-red-300 transition-colors duration-200 p-2' onClick={() => { setSelectedProduct(product); setShowDeleteModal(true); }} title="Delete Product"><Trash size={18} /></button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
              <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-60">
                <div className="w-full max-w-md mx-auto rounded-t-lg bg-black border border-gray-800 p-6">
                  <div className="text-left pb-4">
                    <div className="text-lg md:text-xl text-white font-bold">Delete Product</div>
                    <div className="text-gray-400 text-sm md:text-base mt-2">
                      Are you sure you want to delete <span className="font-semibold text-red-400">{selectedProduct?.title}</span>? This Product will be moved to a Temporary storage location and permanently deleted after 24 hours. You can restore it within this time.
                    </div>
                  </div>
                  <div className="flex-col gap-3 sm:flex-row sm:gap-2 flex mt-4">
                    <button
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded disabled:opacity-60 w-full sm:w-auto text-sm md:text-base"
                      onClick={() => selectedProduct && deleteProductMutation.mutate(selectedProduct.id)}
                      disabled={deleteProductMutation.isPending || !selectedProduct}
                    >
                      {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
                    </button>
                    <button
                      className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded w-full sm:w-auto text-sm md:text-base ml-2"
                      type="button"
                      disabled={deleteProductMutation.isPending}
                      onClick={() => { setShowDeleteModal(false); setSelectedProduct(null); setDeleteError(null); }}
                    >
                      Cancel
                    </button>
                  </div>
                  {deleteProductMutation.isError && (
                    <div className="text-red-400 mt-3 text-sm">
                      {deleteError}
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
        {!isLoading && (
          <div className="px-4 sm:px-6 py-3 border-t border-gray-800 bg-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-gray-300">Total Products: {meta.totalProducts}</div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
                disabled={meta.currentPage === 1}
                onClick={() => setPage(page - 1)}
              >
                Previous
              </button>
              <span className="text-gray-400">Page {meta.currentPage} of {meta.totalPages}</span>
              <button
                className="px-3 py-1 rounded bg-gray-800 text-gray-300 disabled:opacity-50"
                disabled={meta.currentPage === meta.totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList
