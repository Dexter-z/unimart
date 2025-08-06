"use client"
import React from 'react';
import ProductCard from './product-card';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';

const dummyProducts = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const TopOffersSection = () => {
  const { data: products, isLoading, isError, error } = useQuery({
    queryKey: ["top-offers"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/get-filtered-events?page=1&limit=10");
      return res.data.products;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes cache
    retry: 3, // Retry 3 times on failure
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });

  console.log("Top Offers: ", products);
  console.log("Top Offers Error: ", error);

  const showSkeleton = isLoading;
  const hasNoOffers = !isLoading && (!products || products.length === 0);
  const hasError = isError && !isLoading;

  return (
    <section className="w-full py-8 md:py-12 bg-[#18181b]">
      <div className="w-[95%] md:w-[80%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ff8800]">Top Offers</h2>
          <div className="flex items-center text-gray-400 text-sm md:text-base">
            <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
            Limited Time
          </div>
        </div>
        
        {hasError ? (
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">Unable to load offers</div>
            <p className="text-gray-500 text-sm">Database connection issue. Please try refreshing the page.</p>
          </div>
        ) : hasNoOffers ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No offers available</div>
            <p className="text-gray-500 text-sm">Check back later for exciting deals and offers</p>
          </div>
        ) : (
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
                  <ProductCard key={product.id} product={product} isEvent={true} />
                ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopOffersSection;
