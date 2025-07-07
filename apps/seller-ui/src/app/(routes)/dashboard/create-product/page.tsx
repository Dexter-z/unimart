'use client'
import React, { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { ChevronRight, Plus } from 'lucide-react'
import Image from 'next/image'
import { HexColorPicker } from "react-colorful"
import { Dialog } from "@headlessui/react"
import { useQuery } from '@tanstack/react-query'
import axiosInstance from '@/utils/axiosInstance'

type ProductForm = {
    images: (File | null)[];
    title: string;
    shortDescription: string;
    tags: string;
    warranty: string;
    slug: string;
    brand: string;
    colors: string[]; // For color picker
    specifications: string[];
    properties: string[];
    cashOnDelivery: string;
    category: string;
    detailedDescription: string;
    videoUrl: string;
    regularPrice: string;
    salePrice: string;
    stock: string;
    sizes: string;
    discountCodes: string[];
};

const CATEGORIES = [
    "Books", "Gadgets", "Clothings and accessories", "Perfumes", "Jewelleries",
    "Kitchen utensils", "Electronics", "Bedroom essentials", "Food and pastries"
]

const frequent_colors = [
    "#ff0000", // Red
    "#0000ff", // Blue
    "#ffff00", // Yellow
    "#00ff00", // Green
    "#ff9900", // Orange
    "#800080", // Purple
    "#000000", // Black
    "#ffffff", // White
    "#808080", // Gray
]

const MAX_IMAGES = 8
const MAX_SHORT_DESC_WORDS = 150

export default function CreateProductPage() {
    const [images, setImages] = useState<(File | null)[]>([null])
    const [shortDescWords, setShortDescWords] = useState(0)
    const [detailedDescWords, setDetailedDescWords] = useState(0)
    const [colorModalOpen, setColorModalOpen] = useState(false)
    const [currentColor, setCurrentColor] = useState("#aabbcc")
    const [selectedColors, setSelectedColors] = useState<string[]>([])
    const [specName, setSpecName] = useState("");
    const [specValue, setSpecValue] = useState("");
    const [showSpecFields, setShowSpecFields] = useState(false);
    const [specError, setSpecError] = useState("");


    const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm<ProductForm>({
        defaultValues: {
            images: [null] as (File | null)[],
            title: "",
            shortDescription: "",
            tags: "",
            warranty: "",
            slug: "",
            brand: "",
            colors: [],
            specifications: [],
            properties: [],
            category: "",
            cashOnDelivery: "",
            detailedDescription: "",
            videoUrl: "",
            regularPrice: "",
            salePrice: "",
            stock: "",
            sizes: "",
            discountCodes: []
        }
    })

    const {data, isLoading, isError} = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            try {
                const res = await axiosInstance.get("/product/api/get-categories")
                return res.data
            } catch (error) {
                console.log(error)
            }
        },
        staleTime: 1000 * 60 * 5,
        retry: 2,
    })

    const categories = data?.categories || []
    const subCategories = data?.subCategories || {}

    const selectedCategory = watch("category");
    //const regularPrice = watch("regular_price")

    console.log(categories, subCategories)

    // Image upload logic
    const handleImageChange = (file: File | null, index: number) => {
        const updated = [...images]
        updated[index] = file
        if (index === images.length - 1 && images.length < MAX_IMAGES) updated.push(null)
        setImages(updated)
        setValue('images', updated)
    }
    const handleRemoveImage = (index: number) => {
        let updated = [...images]
        updated.splice(index, 1)
        if (!updated.includes(null) && updated.length < MAX_IMAGES) updated.push(null)
        setImages(updated)
        setValue('images', updated)
    }

    const addColor = () => {
        if (!selectedColors.includes(currentColor)) {
            setSelectedColors([...selectedColors, currentColor])
            setValue("colors", [...selectedColors, currentColor])
        }
        setColorModalOpen(false)
    }

    // Remove color from list
    const removeColor = (color: string) => {
        const updated = selectedColors.filter(c => c !== color)
        setSelectedColors(updated)
        setValue("colors", updated)
    }

    // Word count handlers
    const handleShortDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const words = e.target.value.trim().split(/\s+/).filter(Boolean).length
        setShortDescWords(words)
        setValue('shortDescription', e.target.value)
    }
    const handleDetailedDescChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const words = e.target.value.trim().split(/\s+/).filter(Boolean).length
        setDetailedDescWords(words)
        setValue('detailedDescription', e.target.value)
    }

    const addSpecification = () => {
        if (!specName.trim()) {
            setSpecError("Specification name is required");
            return;
        }
        setSpecError("");
        const newSpecs = [...watch("specifications"), `${specName.trim()}: ${specValue.trim()}`];
        setValue("specifications", newSpecs);
        setSpecName("");
        setSpecValue("");
        setShowSpecFields(false);
    };

    const removeSpecification = (idx: number) => {
        const newSpecs = [...watch("specifications")];
        newSpecs.splice(idx, 1);
        setValue("specifications", newSpecs);
    };

    const onSubmit = (data: any) => {
        // handle create product
        console.log(data)
    }

    return (
        <form
            className="w-full max-w-3xl mx-auto p-4 md:p-8 bg-background rounded-lg shadow text-white"
            onSubmit={handleSubmit(onSubmit)}
        >
            {/* Breadcrumbs */}
            <h2 className="text-2xl py-2 font-semibold font-Poppins text-white">Create Product</h2>
            <div className="flex items-center mb-4 text-sm">
                <span className="text-[#80Deea] cursor-pointer">Dashboard</span>
                <ChevronRight size={20} className="opacity-80 mx-1" />
                <span>Create Product</span>
            </div>

            {/* Image Upload */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="w-full md:w-1/3 flex flex-col items-center">
                    {/* Main Image */}
                    <label className="block w-full aspect-[9/10] bg-muted/30 rounded-lg flex items-center justify-center cursor-pointer overflow-hidden mb-2 border border-dashed border-gray-400">
                        {images[0] ? (
                            <Image
                                src={URL.createObjectURL(images[0])}
                                alt="Main"
                                width={300}
                                height={350}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-gray-400">Click to upload main image</span>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={e => handleImageChange(e.target.files?.[0] || null, 0)}
                        />
                    </label>
                    {/* Small Images */}
                    <div className="grid grid-cols-4 gap-2 w-full">
                        {Array.from({ length: MAX_IMAGES - 1 }).map((_, i) => (
                            <label
                                key={i + 1}
                                className="aspect-square bg-muted/30 rounded flex items-center justify-center cursor-pointer overflow-hidden border border-dashed border-gray-400"
                            >
                                {images[i + 1] ? (
                                    <Image
                                        src={URL.createObjectURL(images[i + 1]!)}
                                        alt={`Image ${i + 2}`}
                                        width={80}
                                        height={80}
                                        className="object-cover w-full h-full"
                                    />
                                ) : (
                                    <span className="text-gray-400 text-xs">+</span>
                                )}
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={e => handleImageChange(e.target.files?.[0] || null, i + 1)}
                                />
                                {images[i + 1] && (
                                    <button
                                        type="button"
                                        className="absolute top-1 right-1 text-xs text-red-500 bg-white rounded-full px-1"
                                        onClick={e => {
                                            e.preventDefault()
                                            handleRemoveImage(i + 1)
                                        }}
                                    >x</button>
                                )}
                            </label>
                        ))}
                    </div>
                </div>

                {/* Form Inputs */}
                <div className="flex-1 flex flex-col gap-4">
                    {/* Product Title */}
                    <div>
                        <label className="block mb-1 font-medium">Product Title *</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("title", { required: "Title is required" })}
                            placeholder="Enter Product Title"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message as string}</p>}
                    </div>


                    {/* Short Description */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Short Description* <span className="text-xs text-gray-400">(max {MAX_SHORT_DESC_WORDS} words)</span>
                        </label>
                        <textarea
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            maxLength={1000}
                            rows={2}
                            {...register("shortDescription", {
                                required: "Short description is required",
                                validate: v => v.trim().split(/\s+/).filter(Boolean).length <= MAX_SHORT_DESC_WORDS || `Max ${MAX_SHORT_DESC_WORDS} words`
                            })}
                            onChange={handleShortDescChange}
                            placeholder="Enter a short description"
                        />
                        <div className="text-xs text-gray-400 text-right">{shortDescWords} / {MAX_SHORT_DESC_WORDS} words</div>
                        {errors.shortDescription && <p className="text-red-500 text-xs mt-1">{errors.shortDescription.message as string}</p>}
                    </div>


                    {/* Tags */}
                    <div>
                        <label className="block mb-1 font-medium">Tags</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("tags")}
                            placeholder="apple, samsung"
                        />
                    </div>


                    {/* Warranty */}
                    <div>
                        <label className="block mb-1 font-medium">Warranty</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("warranty")}
                            placeholder="e.g. 1 year"
                        />
                    </div>


                    {/* Slug */}
                    <div>
                        <label className="block mb-1 font-medium">Slug *</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("slug", {
                                required: "Slug is required",
                                minLength: {
                                    value: 3,
                                    message: "Slug must be at least 3 characters"
                                },
                                maxLength: {
                                    value: 50,
                                    message: "Slug must be at most 50 characters"
                                },
                                pattern: {
                                    value: /^[a-z0-9-]+$/,
                                    message: "Slug can only contain lowercase letters, numbers, and dashes"
                                }
                            })}
                            placeholder="product-title-slug"
                        />
                        {errors.slug && <p className="text-red-500 text-xs mt-1">{errors.slug.message as string}</p>}
                    </div>

                    {/* Brand */}
                    <div>
                        <label className="block mb-1 font-medium">Brand</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("brand")}
                            placeholder="Samsung, Apple"
                        />
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block mb-1 font-medium flex items-center gap-2">
                            Colors
                            <button
                                type="button"
                                className="ml-2 p-1 rounded bg-muted/30 hover:bg-muted/50"
                                onClick={() => setColorModalOpen(true)}
                            >
                                <Plus size={16} />
                            </button>
                        </label>
                        {/* Selected colors */}
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {selectedColors.map(color => (
                                <div key={color} className="flex items-center gap-1">
                                    <span
                                        className="w-6 h-6 rounded-full border"
                                        style={{ background: color }}
                                        title={color}
                                    />
                                    <button
                                        type="button"
                                        className="text-xs text-red-400"
                                        onClick={() => removeColor(color)}
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                        {/* Color picker modal */}
                        <Dialog open={colorModalOpen} onClose={() => setColorModalOpen(false)} className="fixed z-50 inset-0 flex items-center justify-center">
                            <div className="bg-white p-4 rounded shadow-lg">
                                <div className="flex gap-2 mb-4 flex-wrap">
                                    {frequent_colors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="w-7 h-7 rounded-full border-2 border-gray-300 flex-shrink-0"
                                            style={{ background: color }}
                                            onClick={() => setCurrentColor(color)}
                                            aria-label={`Pick ${color}`}
                                        >
                                            {currentColor === color && (
                                                <span className="block w-full h-full rounded-full border-2 border-blue-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                                <HexColorPicker color={currentColor} onChange={setCurrentColor} />
                                <div className="flex gap-2 mt-4">
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-blue-600 text-white rounded"
                                        onClick={addColor}
                                    >Add</button>
                                    <button
                                        type="button"
                                        className="px-4 py-2 bg-gray-200 rounded"
                                        onClick={() => setColorModalOpen(false)}
                                    >Cancel</button>
                                </div>
                            </div>
                        </Dialog>
                    </div>


                    {/* Custom Specifications */}
                    <div>
                        <label className="block mb-1 font-medium flex items-center gap-2">
                            Custom Specifications
                            <button
                                type="button"
                                className="ml-2 p-1 rounded bg-muted/30 hover:bg-muted/50"
                                onClick={() => setShowSpecFields(true)}
                            >
                                <Plus size={16} />
                            </button>
                        </label>
                        {/* Fields for adding a specification */}
                        {showSpecFields && (
                            <div className="flex gap-2 mb-2 flex-col">
                                <div className="flex gap-2">
                                    <input
                                        className="flex-1 rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                                        placeholder="Specification name (e.g. Weight)"
                                        value={specName}
                                        onChange={e => {
                                            setSpecName(e.target.value);
                                            if (specError) setSpecError(""); // clear error on change
                                        }}
                                        required
                                    />
                                    <input
                                        className="flex-1 rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                                        placeholder="Value (e.g. 5kg)"
                                        value={specValue}
                                        onChange={e => setSpecValue(e.target.value)}
                                    />
                                    <button
                                        type="button"
                                        className="p-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                                        onClick={addSpecification}
                                        //disabled={!specName.trim()}
                                        title="Add specification"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                                {specError && <p className="text-red-500 text-xs mt-1">{specError}</p>}
                            </div>
                        )}
                        {/* Render specifications below */}
                        <div className="flex flex-col gap-1 mt-2">
                            {watch("specifications")?.map((spec, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-muted/10 rounded px-2 py-1">
                                    <span className="flex-1">{spec}</span>
                                    <button
                                        type="button"
                                        className="text-xs text-red-400"
                                        onClick={() => removeSpecification(idx)}
                                        title="Remove"
                                    >✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Cash on delivery */}
                    <div className="mt-4">
                        <label className="block mb-1 font-medium">Cash on Delivery *</label>
                        <select
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("cashOnDelivery", { required: "Please select an option" })}
                        >
                            <option value="">Select option</option>
                            <option value="yes">Yes</option>
                            <option value="no">No</option>
                        </select>
                        {errors.cashOnDelivery && (
                            <p className="text-red-500 text-xs mt-1">{errors.cashOnDelivery.message as string}</p>
                        )}
                    </div>


                    {/* Categories This will be editable by the admin. It is in api gateway */}
                    <div>
                        <label className="block mb-1 font-medium">Category *</label>
                        <select
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("category", { required: "Category is required" })}
                        >
                            <option value="">Select category</option>
                            {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message as string}</p>}
                    </div>


                    {/* Detailed Description */}
                    <div>
                        <label className="block mb-1 font-medium">
                            Detailed Description *
                            <span className="text-xs text-gray-400 ml-2">(min 20 words)</span>
                        </label>
                        <textarea
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            rows={4}
                            {...register("detailedDescription", {
                                required: "Detailed description is required",
                                validate: v => v.trim().split(/\s+/).filter(Boolean).length >= 20 || "Minimum 20 words"
                            })}
                            onChange={handleDetailedDescChange}
                            placeholder="Enter a detailed description"
                        />
                        <div className="text-xs text-gray-400 text-right">{detailedDescWords} words</div>
                        {errors.detailedDescription && <p className="text-red-500 text-xs mt-1">{errors.detailedDescription.message as string}</p>}
                    </div>
                    {/* Video URL */}
                    <div>
                        <label className="block mb-1 font-medium">Video URL</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("videoUrl")}
                            placeholder="https://youtube.com/..."
                        />
                    </div>
                    {/* Regular Price */}
                    <div>
                        <label className="block mb-1 font-medium">Regular Price</label>
                        <input
                            type="number"
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("regularPrice")}
                            placeholder="Regular price"
                        />
                    </div>
                    {/* Sale Price */}
                    <div>
                        <label className="block mb-1 font-medium">Sale Price *</label>
                        <input
                            type="number"
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("salePrice", { required: "Sale price is required" })}
                            placeholder="Sale price"
                        />
                        {errors.salePrice && <p className="text-red-500 text-xs mt-1">{errors.salePrice.message as string}</p>}
                    </div>
                    {/* Stock */}
                    <div>
                        <label className="block mb-1 font-medium">Stock *</label>
                        <input
                            type="number"
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("stock", { required: "Stock is required" })}
                            placeholder="Stock quantity"
                        />
                        {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message as string}</p>}
                    </div>
                    {/* Sizes */}
                    <div>
                        <label className="block mb-1 font-medium">Sizes</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("sizes")}
                            placeholder="e.g. S, M, L, XL"
                        />
                    </div>
                    {/* Discount Codes */}
                    <div>
                        <label className="block mb-1 font-medium">Discount Codes</label>
                        <input
                            className="w-full rounded px-3 py-2 bg-muted/20 text-white border border-gray-600 focus:outline-none"
                            {...register("discountCodes")}
                            placeholder="Enter discount codes (optional)"
                        />
                    </div>
                </div>
            </div>

            {/* Buttons */}
            <div className="flex flex-col md:flex-row gap-4 mt-8">
                <button
                    type="button"
                    className="w-full md:w-auto px-6 py-2 rounded bg-muted/30 text-white border border-gray-600 hover:bg-muted/50 transition"
                >
                    Save Draft
                </button>
                <button
                    type="submit"
                    className="w-full md:w-auto px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
                >
                    Create Product
                </button>
            </div>
        </form>
    )
}