
"use client"

import React, { useMemo, useState } from 'react'
import {
  useReactTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel
} from '@tanstack/react-table'
import { Ban } from "lucide-react"
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

interface User {
  id: string;
  name: string;
  email: string;
  phone_number: string;
  role: string;
  createdAt: string;
  banned?: boolean;
}

const UsersPage = () => {
  const [globalFilter, setGlobalFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [showBanModal, setShowBanModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [banError, setBanError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const limit = 10;
  const queryClient = useQueryClient()

  const fetchUsers = async () => {
  const roleParam = roleFilter !== 'all' ? `&role=${roleFilter}` : '';
  const res = await axiosInstance.get(`/admin/api/get-all-users?page=${page}&limit=${limit}${roleParam}`)
    return {
      users: res?.data?.data || [],
      meta: res?.data?.meta || { currentPage: 1, totalPages: 1, totalUsers: 0 }
    }
  }

  const banUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      return await axiosInstance.put(`/admin/api/ban-user/${userId}`)
    },
    onSuccess: (_, userId) => {
      setShowBanModal(false)
      setSelectedUser(null)
      queryClient.invalidateQueries({ queryKey: ['all-users'] })
      setBanError(null)
    },
    onError: (error: any) => {
      setBanError(error?.response?.data?.message || 'Error banning user. Please try again.')
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['all-users', page, limit],
    queryFn: fetchUsers,
    staleTime: 1000 * 60 * 5,
  })
  const users = data?.users || [];
  const meta = data?.meta || { currentPage: 1, totalPages: 1, totalUsers: 0 };

  const columns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Name',
      cell: ({ row }: { row: { original: User } }) => <span className="text-white font-medium">{row.original.name}</span>
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }: { row: { original: User } }) => <span className="text-gray-300">{row.original.email}</span>
    },
    {
      accessorKey: 'phone_number',
      header: 'Phone Number',
      cell: ({ row }: { row: { original: User } }) => <span className="text-gray-300">{row.original.phone_number}</span>
    },
    {
      accessorKey: 'role',
      header: 'Role',
      cell: ({ row }: { row: { original: User } }) => <span className="text-white font-semibold">{row.original.role}</span>
    },
    {
      accessorKey: 'joined',
      header: 'Joined',
      cell: ({ row }: { row: { original: User } }) => <span className="text-gray-300">{new Date(row.original.createdAt).toLocaleDateString()}</span>
    },
    {
      header: 'Actions',
      cell: ({ row }: { row: { original: User } }) => (
        <button
          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
          title="Ban User"
          onClick={() => { setSelectedUser(row.original); setShowBanModal(true); }}
          disabled={row.original.banned}
        >
          <Ban size={18} />
        </button>
      )
    }
  ], [])

  const table = useReactTable({
    data: users,
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
        <h1 className="text-xl sm:text-2xl font-bold text-white">User Management</h1>
        <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage and track all users</p>
      </div>
      <div className="bg-black rounded-lg shadow border border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
            <h2 className="text-xl font-semibold text-white">All Users</h2>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-2">
              <div className="relative">
                <input type="text" placeholder="Search users..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="w-full sm:w-auto pl-4 pr-4 py-2 bg-gray-900 border border-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              </div>
              <div>
                <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1); }} className="bg-gray-900 border border-gray-700 text-white rounded-lg px-4 py-2">
                  <option value="all">All Users</option>
                  <option value="admin">Admins</option>
                  <option value="user">Users</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-black">
            <div className="text-white">Loading Users...</div>
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
                      <td colSpan={columns.length} className="px-6 py-8 text-center text-gray-400">No users found.</td>
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
                <div className="px-4 py-8 text-center text-gray-400">No users found.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {table.getRowModel().rows.map(row => {
                    const user: User = row.original;
                    return (
                      <div key={row.id} className="px-4 py-4 hover:bg-blue-900 transition-colors duration-200">
                        <div className="flex flex-col gap-2">
                          <div className="font-bold text-white text-lg">{user.name}</div>
                          <div className="text-gray-300 text-sm">{user.email}</div>
                          <div className="text-gray-300 text-sm">{user.phone_number}</div>
                          <div className="text-white text-sm font-semibold">Role: {user.role}</div>
                          <div className="text-gray-400 text-xs">Joined: {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex justify-end items-center pt-3 mt-3 border-t border-gray-800">
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                            title="Ban User"
                            onClick={() => { setSelectedUser(user); setShowBanModal(true); }}
                            disabled={user.banned}
                          >
                            <Ban size={18} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
        {!isLoading && (
          <div className="px-4 sm:px-6 py-3 border-t border-gray-800 bg-gray-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="text-sm text-gray-300">Total Users: {meta.totalUsers}</div>
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
      {/* Ban Confirmation Modal */}
      {showBanModal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black bg-opacity-60">
          <div className="w-full max-w-md mx-auto rounded-t-lg bg-black border border-gray-800 p-6">
            <div className="text-left pb-4">
              <div className="text-lg md:text-xl text-white font-bold">Ban User</div>
              <div className="text-gray-400 text-sm md:text-base mt-2">
                Are you sure you want to ban <span className="font-semibold text-red-400">{selectedUser?.name}</span>? This user will be restricted from accessing the platform.
              </div>
            </div>
            <div className="flex-col gap-3 sm:flex-row sm:gap-2 flex mt-4">
              <button
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded disabled:opacity-60 w-full sm:w-auto text-sm md:text-base"
                onClick={() => selectedUser && banUserMutation.mutate(selectedUser.id)}
                disabled={banUserMutation.isPending || !selectedUser}
              >
                {banUserMutation.isPending ? 'Banning...' : 'Ban'}
              </button>
              <button
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-3 rounded w-full sm:w-auto text-sm md:text-base ml-2"
                type="button"
                disabled={banUserMutation.isPending}
                onClick={() => { setShowBanModal(false); setSelectedUser(null); setBanError(null); }}
              >
                Cancel
              </button>
            </div>
            {banUserMutation.isError && (
              <div className="text-red-400 mt-3 text-sm">
                {banError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersPage

