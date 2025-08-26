"use client"

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Pencil, UploadCloud, ImagePlus } from "lucide-react";

const TABS = ["Categories", "Logo", "Banner"];

export default function CustomizationsPage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [newCategory, setNewCategory] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [editModal, setEditModal] = useState<{category: string, open: boolean}>({category: "", open: false});
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");

  // Fetch all customizations
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["customizations"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/api/get-all-customizations");
      return res.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Add category
  const addCategoryMutation = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post("/admin/api/customizations/category", { category: newCategory });
    },
    onSuccess: () => { setNewCategory(""); refetch(); },
  });

  // Add subcategory
  const addSubCategoryMutation = useMutation({
    mutationFn: async () => {
      return await axiosInstance.post("/admin/api/customizations/subcategory", { category: selectedCategory, subCategory: newSubCategory });
    },
    onSuccess: () => { setNewSubCategory(""); refetch(); },
  });

  // Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return await axiosInstance.delete(`/admin/api/customizations/category/${category}`);
    },
    onSuccess: () => { setEditModal({category: "", open: false}); refetch(); },
  });

  // Delete subcategory
  const deleteSubCategoryMutation = useMutation({
    mutationFn: async ({category, subCategory}: {category: string, subCategory: string}) => {
      return await axiosInstance.delete(`/admin/api/customizations/subcategory`, { data: { category, subCategory } });
    },
    onSuccess: () => { refetch(); },
  });

  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (base64: string) => {
      return await axiosInstance.post(`/admin/api/customizations/logo`, { fileName: base64 });
    },
    onSuccess: () => { setLogoFile(null); refetch(); },
  });

  // Upload banner
  const uploadBannerMutation = useMutation({
    mutationFn: async (base64: string) => {
      return await axiosInstance.post(`/admin/api/customizations/banner`, { fileName: base64 });
    },
    onSuccess: () => { setBannerFile(null); refetch(); },
  });

  // Helpers
  function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // UI
  return (
    <div className="p-4 sm:p-8 min-h-screen bg-black">
      <h1 className="text-2xl font-bold text-white mb-6">Site Customizations</h1>
      <div className="flex gap-4 mb-8">
        {TABS.map(tab => (
          <button key={tab} className={`px-4 py-2 rounded-t-lg font-semibold ${activeTab === tab ? "bg-[#ff8800] text-white" : "bg-gray-900 text-gray-300"}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>
      <div className="bg-gray-900 rounded-lg shadow p-6">
        {/* Categories Tab */}
        {activeTab === "Categories" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Categories & Subcategories</h2>
            {isLoading ? <div className="text-gray-400">Loading...</div> : (
              <div>
                <ul className="mb-6">
                  {(data?.categories || []).map((cat: string) => (
                    <li key={cat} className="flex items-center gap-2 mb-2">
                      <span className="text-white font-semibold">{cat}</span>
                      <button className="p-1 text-blue-400 hover:text-blue-300" onClick={() => setEditModal({category: cat, open: true})}><Pencil size={16} /></button>
                      <ul className="ml-6 mt-2">
                        {(data?.subCategories?.[cat] || []).map((sub: string) => (
                          <li key={sub} className="flex items-center gap-2 text-gray-300">
                            {sub}
                            <button className="p-1 text-red-400 hover:text-red-300" onClick={() => deleteSubCategoryMutation.mutate({category: cat, subCategory: sub})}>Delete</button>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
                <div className="flex gap-2 mb-4">
                  <input type="text" className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Add new category" value={newCategory} onChange={e => setNewCategory(e.target.value)} />
                  <button className="px-4 py-2 bg-[#ff8800] text-white rounded" onClick={() => addCategoryMutation.mutate()} disabled={!newCategory}>Add Category</button>
                </div>
                <div className="flex gap-2 mb-4">
                  <select className="px-3 py-2 rounded bg-gray-800 text-white" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                    <option value="">Select category</option>
                    {(data?.categories || []).map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" className="px-3 py-2 rounded bg-gray-800 text-white" placeholder="Add subcategory" value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)} />
                  <button className="px-4 py-2 bg-[#ff8800] text-white rounded" onClick={() => addSubCategoryMutation.mutate()} disabled={!selectedCategory || !newSubCategory}>Add Subcategory</button>
                </div>
                {/* Edit/Delete Modal */}
                {editModal.open && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                    <div className="bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                      <div className="text-lg text-white font-bold mb-2">Edit Category: {editModal.category}</div>
                      <button className="px-4 py-2 bg-red-600 text-white rounded" onClick={() => deleteCategoryMutation.mutate(editModal.category)}>Delete Category</button>
                      <button className="px-4 py-2 bg-gray-700 text-gray-300 ml-2" onClick={() => setEditModal({category: "", open: false})}>Close</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
        {/* Logo Tab */}
        {activeTab === "Logo" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Site Logo</h2>
            <div className="mb-4 flex flex-col items-center">
              {data?.logo ? (
                <img src={data.logo} alt="Site Logo" className="w-32 h-32 object-contain rounded mb-2 border border-gray-700" />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-gray-800 text-gray-400 rounded mb-2 border border-gray-700">No Logo</div>
              )}
              <input type="file" accept="image/*" className="mb-2" onChange={e => {
                const file = e.target.files?.[0];
                setLogoFile(file || null);
                if (file) {
                  fileToBase64(file).then(setLogoPreview);
                } else {
                  setLogoPreview("");
                }
              }} />
              {logoFile && logoPreview && (
                <img src={logoPreview} alt="Preview" className="w-24 h-24 object-contain rounded mb-2" />
              )}
              <button className="px-4 py-2 bg-[#ff8800] text-white rounded flex items-center gap-2" onClick={async () => {
                if (logoFile && logoPreview) await uploadLogoMutation.mutateAsync(logoPreview);
              }} disabled={!logoFile}>Upload Logo <UploadCloud size={16} /></button>
            </div>
          </div>
        )}
        {/* Banner Tab */}
        {activeTab === "Banner" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Site Banner</h2>
            <div className="mb-4 flex flex-col items-center">
              {data?.banner ? (
                <img src={data.banner} alt="Site Banner" className="w-full max-w-xl h-32 object-cover rounded mb-2 border border-gray-700" />
              ) : (
                <div className="w-full max-w-xl h-32 flex items-center justify-center bg-gray-800 text-gray-400 rounded mb-2 border border-gray-700">No Banner</div>
              )}
              <input type="file" accept="image/*" className="mb-2" onChange={e => {
                const file = e.target.files?.[0];
                setBannerFile(file || null);
                if (file) {
                  fileToBase64(file).then(setBannerPreview);
                } else {
                  setBannerPreview("");
                }
              }} />
              {bannerFile && bannerPreview && (
                <img src={bannerPreview} alt="Preview" className="w-full max-w-xs h-24 object-cover rounded mb-2" />
              )}
              <button className="px-4 py-2 bg-[#ff8800] text-white rounded flex items-center gap-2" onClick={async () => {
                if (bannerFile && bannerPreview) await uploadBannerMutation.mutateAsync(bannerPreview);
              }} disabled={!bannerFile}>Upload Banner <ImagePlus size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
