import ProductPage from '@/components/product-page';
import axiosInstance from 'apps/admin-ui/src/utils/axiosInstance';
import { Metadata } from 'next';
import React from 'react'

async function fetchProductDetails(slug: string) {
    const response = await axiosInstance.get(`/product/api/get-product/${slug}`);
    return response.data.product;
}

export async function generateMetadata({params}: {params: {slug: string}}) : Promise<Metadata> {
    const product = await fetchProductDetails(params?.slug);
    return {
        title: `${product?.title} | UniMart`,
        description: product?.shortDescription || "Discover the best products at UniMart. Shop now for quality and value.",
        openGraph: {
            title: product?.title,
            description: product?.shortDescription || "",
            images: [product?.images[0]?.url || "default-image-url.jpg"],
            type: "website"
        },
        twitter: {
            card: "summary_large_image",
            title: product?.title,
            description: product?.shortDescription || "",
            images: [product?.images[0]?.url || "default-image-url.jpg"]
        }
    }
}

const Page = async ({params}: {params: {slug: string}}) => {
    const productDetails = await fetchProductDetails(params?.slug);
    //console.log(productDetails)
  return (
    <div>
      <ProductPage product={productDetails} />
    </div>
  )
}

export default Page
