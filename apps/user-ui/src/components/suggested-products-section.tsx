"use client"
import React from 'react';
import ProductCard from './product-card';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const dummyProducts = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const SuggestedProductsSection = () => {
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      // const res = await axiosInstance.get("/product/api/get-all-products?page=1&limit=10");
      // return res.data.products;

      //To use recommendation service
      const res = await axiosInstance.get("/recommendation/api/get-recommendation-products");
      return res.data.recommendations;
    },
    staleTime: 1000 * 60 * 2,
  });

  console.log("Products: ",products)

  const showSkeleton = isLoading || isError || !products || products.length === 0;

  return (
    <section className="w-full py-8 md:py-12 bg-[#18181b]">
      <div className="w-[95%] md:w-[80%] mx-auto">
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ff8800] mb-4">Suggested Products</h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-2 auto-rows-fr">
          {showSkeleton
            ? dummyProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-[#232326] rounded-xl flex flex-col items-center animate-pulse border border-[#232326] shadow-sm min-h-[280px] aspect-[3/4] overflow-hidden"
                >
                  <div className="w-full" style={{ height: '66%' }}>
                    <div className="w-full h-full bg-gray-700" />
                  </div>
                  <div className="flex-1 w-full flex flex-col items-center justify-between p-4">
                    <div className="w-full min-h-[2.5rem] bg-gray-700 rounded mb-2" />
                    <div className="w-12 h-3 bg-gray-700 rounded" />
                  </div>
                </div>
              ))
            : products.map((product: any) => (
                <ProductCard key={product.id} product={product} isEvent={false} />
              ))}
        </div>
      </div>
    </section>
  );
};

export default SuggestedProductsSection; 