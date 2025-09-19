import SellerProfile from '@/components/seller-profile';
import axiosInstance from '@/utils/axiosInstance'
import { Metadata } from 'next';
import React from 'react'

async function fetchSellerDetails(id: string){
    const res = await axiosInstance.get(`/seller/api/get-seller/${id}`);
    return res.data;
}

//Generate meta data
export async function generateMetadata({
    params,
} : {
    params: { id: string };
}) : Promise<Metadata> {
    const data = await fetchSellerDetails(params.id);
    return {
        title: `${data?.shop?.name} | UniMart`,
        description: data?.shop?.bio || `Welcome to ${data?.shop?.name} on UniMart. Explore our wide range of products and enjoy seamless shopping experience.`,
        openGraph: {
            title: `${data?.shop?.name} | UniMart`,
            description: data?.shop?.bio || `Welcome to ${data?.shop?.name} on UniMart. Explore our wide range of products and enjoy seamless shopping experience.`,
            type: "website",
            images: [
                {
                    url: data?.shop?.avatar,
                    width: 800,
                    height: 600,
                    alt: data?.shop?.name,
                }
            ]
        },
        twitter: {
            card: "summary_large_image",
            title: `${data?.shop?.name} | UniMart`,
            description: data?.shop?.bio || `Welcome to ${data?.shop?.name} on UniMart. Explore our wide range of products and enjoy seamless shopping experience.`,
            images: [data?.shop?.avatar]
        }
    }
}

const ShopPage = async ({params}: {params: {id: string}}) => {
    const data = await fetchSellerDetails(params.id);

    console.log(data)
    
  return (
    <div>
      <SellerProfile shop={data?.shop}  followersCount={data?.followersCount} />
    </div>
  )
}

export default ShopPage
