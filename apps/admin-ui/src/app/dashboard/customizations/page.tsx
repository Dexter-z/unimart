"use client"

import React, { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import axiosInstance from "apps/admin-ui/src/utils/axiosInstance";
import { Pencil, UploadCloud, ImagePlus, Trash2, Loader2 } from "lucide-react";

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
      return await axiosInstance.put("/admin/api/add-category", { category: newCategory });
    },
    onSuccess: () => { setNewCategory(""); refetch(); },
  });

  // Add subcategory
  const addSubCategoryMutation = useMutation({
    mutationFn: async () => {
      return await axiosInstance.put("/admin/api/add-subcategory", { category: selectedCategory, subCategory: newSubCategory });
    },
    onSuccess: () => { setNewSubCategory(""); refetch(); },
  });

  // Delete category
  const deleteCategoryMutation = useMutation({
    mutationFn: async (category: string) => {
      return await axiosInstance.delete(`/admin/api/delete-category/${category}`);
    },
    onSuccess: () => { setEditModal({category: "", open: false}); refetch(); },
  });

  // Delete subcategory
  const deleteSubCategoryMutation = useMutation({
    mutationFn: async ({category, subCategory}: {category: string, subCategory: string}) => {
      return await axiosInstance.delete(`/admin/api/delete-subcategory`, { data: { category, subCategory } });
    },
    onSuccess: () => { refetch(); },
  });

  // Upload logo
  const uploadLogoMutation = useMutation({
    mutationFn: async (base64: string) => {
      return await axiosInstance.put(`/admin/api/upload-logo`, { fileName: base64 });
    },
    onSuccess: () => { setLogoFile(null); refetch(); },
  });

  // Upload banner
  const uploadBannerMutation = useMutation({
    mutationFn: async (base64: string) => {
      return await axiosInstance.put(`/admin/api/upload-banner`, { fileName: base64 });
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
      <div className="flex gap-2 sm:gap-4 mb-8 flex-wrap">
        {TABS.map(tab => (
          <button key={tab} className={`px-3 py-2 sm:px-4 sm:py-2 rounded-t-lg font-semibold text-sm sm:text-base transition-colors duration-200 ${activeTab === tab ? "bg-blue-700 text-white" : "bg-black text-blue-300 hover:bg-blue-900 hover:text-white"}`} onClick={() => setActiveTab(tab)}>{tab}</button>
        ))}
      </div>
      <div className="bg-black rounded-lg shadow p-3 sm:p-6 border border-blue-900">
        {/* Categories Tab */}
        {activeTab === "Categories" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Categories & Subcategories</h2>
            {isLoading ? <div className="text-gray-400">Loading...</div> : (
              <div>
                <div className="mb-6">
                  {(data?.categories || []).map((cat: string) => (
                    <div key={cat} className="mb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-base">{cat}</span>
                        <button className={`p-1 rounded transition-colors duration-200 ${editModal.open ? "bg-blue-900" : "bg-black hover:bg-blue-900"} text-blue-300 hover:text-white`} onClick={() => setEditModal({category: cat, open: true})} disabled={addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                          <Pencil size={16} />
                        </button>
                      </div>
                      {(data?.subCategories?.[cat] || []).length > 0 && (
                        <div className="ml-4 sm:ml-6">
                          {(data?.subCategories?.[cat] || []).map((sub: string) => (
                            <div key={sub} className="flex items-center gap-2 text-blue-200 py-1">
                              <span className="pl-2">{sub}</span>
                              <button className={`p-1 rounded transition-colors duration-200 ${deleteSubCategoryMutation.isPending ? "bg-blue-900" : "bg-black hover:bg-blue-900"} text-blue-300 hover:text-white`} onClick={() => deleteSubCategoryMutation.mutate({category: cat, subCategory: sub})} disabled={addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                                {deleteSubCategoryMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
                  <input type="text" className="px-3 py-2 rounded bg-black text-white border border-blue-900 w-full sm:w-auto" placeholder="Add new category" value={newCategory} onChange={e => setNewCategory(e.target.value)} disabled={addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending} />
                  <button className={`px-4 py-2 rounded font-semibold transition-colors duration-200 w-full sm:w-auto ${addCategoryMutation.isPending ? "bg-blue-900 text-blue-200" : "bg-blue-700 text-white hover:bg-blue-900"}`} onClick={() => addCategoryMutation.mutate()} disabled={!newCategory || addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                    {addCategoryMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Add Category"}
                  </button>
                </div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4 w-full">
                  <select className="px-3 py-2 rounded bg-black text-white border border-blue-900 w-full sm:w-auto" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)} disabled={addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                    <option value="">Select category</option>
                    {(data?.categories || []).map((cat: string) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" className="px-3 py-2 rounded bg-black text-white border border-blue-900 w-full sm:w-auto" placeholder="Add subcategory" value={newSubCategory} onChange={e => setNewSubCategory(e.target.value)} disabled={addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending} />
                  <button className={`px-4 py-2 rounded font-semibold transition-colors duration-200 w-full sm:w-auto ${addSubCategoryMutation.isPending ? "bg-blue-900 text-blue-200" : "bg-blue-700 text-white hover:bg-blue-900"}`} onClick={() => addSubCategoryMutation.mutate()} disabled={!selectedCategory || !newSubCategory || addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                    {addSubCategoryMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Add Subcategory"}
                  </button>
                </div>
                {/* Edit/Delete Modal */}
                {editModal.open && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
                    <div className="bg-black border border-blue-900 rounded-lg shadow-lg p-6 w-full max-w-md mx-auto">
                      <div className="text-lg text-white font-bold mb-2">Edit Category: <span className="text-blue-300">{editModal.category}</span></div>
                      <button className={`px-4 py-2 rounded font-semibold transition-colors duration-200 w-full sm:w-auto mb-2 ${deleteCategoryMutation.isPending ? "bg-blue-900 text-blue-200" : "bg-blue-700 text-white hover:bg-blue-900"}`} onClick={() => deleteCategoryMutation.mutate(editModal.category)} disabled={deleteCategoryMutation.isPending || addCategoryMutation.isPending || addSubCategoryMutation.isPending || deleteSubCategoryMutation.isPending}>
                        {deleteCategoryMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : "Delete Category"}
                      </button>
                      <button className="px-4 py-2 rounded font-semibold transition-colors duration-200 w-full sm:w-auto bg-gray-800 text-blue-300" onClick={() => setEditModal({category: "", open: false})} disabled={deleteCategoryMutation.isPending}>Close</button>
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
            <div className="mb-4 flex flex-col items-center w-full max-w-xs mx-auto">
              {data?.logo ? (
                <img src={data.logo} alt="Site Logo" className="w-32 h-32 object-contain rounded mb-2 border border-blue-900 bg-black" />
              ) : (
                <div className="w-32 h-32 flex items-center justify-center bg-black text-blue-300 rounded mb-2 border border-blue-900">No Logo</div>
              )}
              <input type="file" accept="image/*" className="mb-2 w-full" onChange={e => {
                const file = e.target.files?.[0];
                setLogoFile(file || null);
                if (file) {
                  fileToBase64(file).then(setLogoPreview);
                } else {
                  setLogoPreview("");
                }
              }} disabled={uploadLogoMutation.isPending || uploadBannerMutation.isPending} />
              {logoFile && logoPreview && (
                <img src={logoPreview} alt="Preview" className="w-24 h-24 object-contain rounded mb-2 border border-blue-900 bg-black" />
              )}
              <button className={`px-4 py-2 rounded font-semibold transition-colors duration-200 w-full flex items-center justify-center gap-2 ${uploadLogoMutation.isPending ? "bg-blue-900 text-blue-200" : "bg-blue-700 text-white hover:bg-blue-900"}`} onClick={async () => {
                if (logoFile && logoPreview) await uploadLogoMutation.mutateAsync(logoPreview);
              }} disabled={!logoFile || uploadLogoMutation.isPending || uploadBannerMutation.isPending}>
                {uploadLogoMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <>Upload Logo <UploadCloud size={16} /></>}
              </button>
            </div>
          </div>
        )}
        {/* Banner Tab */}
        {activeTab === "Banner" && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Site Banner</h2>
            <div className="mb-4 flex flex-col items-center w-full max-w-xl mx-auto">
              {data?.banner ? (
                <img src={data.banner} alt="Site Banner" className="w-full max-w-xl h-32 object-cover rounded mb-2 border border-blue-900 bg-black" />
              ) : (
                <div className="w-full max-w-xl h-32 flex items-center justify-center bg-black text-blue-300 rounded mb-2 border border-blue-900">No Banner</div>
              )}
              <input type="file" accept="image/*" className="mb-2 w-full" onChange={e => {
                const file = e.target.files?.[0];
                setBannerFile(file || null);
                if (file) {
                  fileToBase64(file).then(setBannerPreview);
                } else {
                  setBannerPreview("");
                }
              }} disabled={uploadLogoMutation.isPending || uploadBannerMutation.isPending} />
              {bannerFile && bannerPreview && (
                <img src={bannerPreview} alt="Preview" className="w-full max-w-xs h-24 object-cover rounded mb-2 border border-blue-900 bg-black" />
              )}
              <button className={`px-4 py-2 rounded font-semibold transition-colors duration-200 w-full flex items-center justify-center gap-2 ${uploadBannerMutation.isPending ? "bg-blue-900 text-blue-200" : "bg-blue-700 text-white hover:bg-blue-900"}`} onClick={async () => {
                if (bannerFile && bannerPreview) await uploadBannerMutation.mutateAsync(bannerPreview);
              }} disabled={!bannerFile || uploadLogoMutation.isPending || uploadBannerMutation.isPending}>
                {uploadBannerMutation.isPending ? <Loader2 className="animate-spin" size={18} /> : <>Upload Banner <ImagePlus size={16} /></>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
