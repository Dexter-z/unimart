"use client"

import axiosInstance from '@/utils/axiosInstance'
import { useQuery } from '@tanstack/react-query'
import { Router } from 'express'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'

const Page = () => {
    const router = useRouter()
    const [isProductLoading, setIsProductLoading] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1199]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
    const [selectedColors, setSelectedColors] = useState<string[]>([]);
    const [page, setPage] = useState(1);
    const [products, setProducts] = useState<any[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [tempPriceRange, setTempPriceRange] = useState([0, 1199]);

    const updateURL = () => {
        const params = new URLSearchParams();
        params.set("priceRange", priceRange.join(","));

        if (selectedCategories.length > 0) {
            params.set("categories", selectedCategories.join(","))
        }

        if (selectedSizes.length > 0) {
            params.set("sizes", selectedSizes.join(","))
        }

        if (selectedColors.length > 0) {
            params.set("colors", selectedColors.join(","))
        }

        params.set("page", page.toString())
        router.replace(`/products?${decodeURIComponent(params.toString())}`);
    }

    const fetchFilteredProducts = async () => {
        setIsProductLoading(true);

        try {
            const query = new URLSearchParams()

            query.set("priceRange", priceRange.join(","))
            if (selectedCategories.length > 0) {
                query.set("categories", selectedCategories.join(","))
            }

            if (selectedSizes.length > 0) {
                query.set("sizes", selectedSizes.join(","))
            }

            if (selectedColors.length > 0) {
                query.set("colors", selectedColors.join(","))
            }

            query.set("page", page.toString())
            query.set("limit", "12")

            const res = await axiosInstance.get(`/product/api/get-filtered-products?${query.toString()}`)
            setProducts(res.data.products)
            setTotalPages(res.data.pagination.totalPages)



        } catch (error) {
            console.log("Error fetching filtered products:", error);
        } finally {
            setIsProductLoading(false);
        }
    }

    useEffect(() => {
        updateURL()
        fetchFilteredProducts();
    }, [priceRange, selectedCategories, selectedSizes, selectedColors, page]);

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: async () => {
            const res = await axiosInstance.get("/product/api/get-categories")
            return res.data
        },
        staleTime: 1000 * 60 * 30, //30 minutes
    })
    return (
        <div>

        </div>
    )
}

export default Page
