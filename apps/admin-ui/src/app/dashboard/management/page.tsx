"use client";

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { UserMinus, UserPlus } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
}

const roles = ["admin", "user"];

export default function ManagementPage() {
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [addEmail, setAddEmail] = useState("");
  const [addRole, setAddRole] = useState(roles[0]);
  const [addError, setAddError] = useState<string | null>(null);
  const [removeError, setRemoveError] = useState<string | null>(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["all-admins"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-all-admins");
      return res?.data?.data || [];
    },
    staleTime: 1000 * 60 * 5,
  });

  const admins: Admin[] = data || [];

  const removeAdminMutation = useMutation({
    mutationFn: async (admin: Admin) => {
      // Workaround: call add-new-admin with role 'user' for the admin's email
      return await axiosInstance.put(`/admin/api/add-new-admin`, {
        email: admin.email,
        role: "user",
      });
    },
    onSuccess: () => {
      setShowRemoveModal(false);
      setSelectedAdmin(null);
      setRemoveError(null);
      refetch();
    },
    onError: (error: any) => {
      setRemoveError(error?.response?.data?.message || "Error removing admin. Please try again.");
    },
  });

  const addAdminMutation = useMutation({
    mutationFn: async () => {
      return await axiosInstance.put(`/admin/api/add-new-admin`, {
        email: addEmail,
        role: addRole,
      });
    },
    onSuccess: () => {
      setShowAddModal(false);
      setAddEmail("");
      setAddRole(roles[0]);
      setAddError(null);
      refetch();
    },
    onError: (error: any) => {
      setAddError(error?.response?.data?.message || "Error adding admin. Please try again.");
    },
  });

  return (
    <div className="p-4 sm:p-6 bg-black min-h-screen">
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white">Team Management</h1>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Manage your admin team</p>
        </div>
        <button
          className="px-4 py-2 rounded bg-blue-600 text-white font-semibold flex items-center gap-2 hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          <UserPlus size={18} /> Add Admin
        </button>
      </div>
      <div className="bg-black rounded-lg shadow border border-gray-800">
        <div className="px-4 sm:px-6 py-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Admins</h2>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-64 bg-black">
            <div className="text-white">Loading Admins...</div>
          </div>
        ) : (
          <>
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-black divide-y divide-gray-800">
                  {admins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No admins found.</td>
                    </tr>
                  ) : (
                    admins.map(admin => (
                      <tr key={admin.id} className="hover:bg-blue-900 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-white font-medium">{admin.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{admin.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-white font-semibold">{admin.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                            title="Remove Admin"
                            onClick={() => { setSelectedAdmin(admin); setShowRemoveModal(true); }}
                          >
                            <UserMinus size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="block sm:hidden">
              {admins.length === 0 ? (
                <div className="px-4 py-8 text-center text-gray-400">No admins found.</div>
              ) : (
                <div className="divide-y divide-gray-800">
                  {admins.map(admin => (
                    <div key={admin.id} className="px-4 py-4 hover:bg-blue-900 transition-colors duration-200">
                      <div className="font-bold text-white text-lg">{admin.name}</div>
                      <div className="text-gray-300 text-sm">{admin.email}</div>
                      <div className="text-white text-sm font-semibold">Role: {admin.role}</div>
                      <div className="flex justify-end items-center pt-3 mt-3 border-t border-gray-800">
                        <button
                          className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2"
                          title="Remove Admin"
                          onClick={() => { setSelectedAdmin(admin); setShowRemoveModal(true); }}
                        >
                          <UserMinus size={18} />
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
      {/* Remove Admin Confirmation Modal */}
      {showRemoveModal && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
            <div className="text-lg md:text-xl text-white font-bold mb-2">Remove Admin</div>
            <div className="text-gray-300 mb-4">
              Are you sure you want to remove <span className="font-semibold text-red-400">{selectedAdmin.name}</span> from the admin team?
            </div>
            {removeError && <div className="text-red-400 mb-2">{removeError}</div>}
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded bg-red-600 text-white font-semibold disabled:opacity-50"
                onClick={() => selectedAdmin && removeAdminMutation.mutate(selectedAdmin)}
                disabled={removeAdminMutation.isPending || !selectedAdmin}
              >
                {removeAdminMutation.isPending ? "Removing..." : "Remove"}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-700 text-gray-300"
                onClick={() => { setShowRemoveModal(false); setSelectedAdmin(null); setRemoveError(null); }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Add Admin Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
          <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
            <div className="text-lg md:text-xl text-white font-bold mb-2">Add New Admin</div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Email</label>
              <input
                type="email"
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={addEmail}
                onChange={e => setAddEmail(e.target.value)}
                placeholder="Enter admin email"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Role</label>
              <select
                className="w-full px-4 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500"
                value={addRole}
                onChange={e => setAddRole(e.target.value)}
              >
                {roles.map(role => (
                  <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
                ))}
              </select>
            </div>
            {addError && <div className="text-red-400 mb-2">{addError}</div>}
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white font-semibold disabled:opacity-50"
                onClick={() => addAdminMutation.mutate()}
                disabled={addAdminMutation.isPending || !addEmail}
              >
                {addAdminMutation.isPending ? "Adding..." : "Add Admin"}
              </button>
              <button
                className="px-4 py-2 rounded bg-gray-700 text-gray-300"
                onClick={() => { setShowAddModal(false); setAddEmail(""); setAddRole(roles[0]); setAddError(null); }}
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

