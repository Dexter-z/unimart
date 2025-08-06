"use client"
import React from 'react';
import Link from 'next/link';
import axiosInstance from '@/utils/axiosInstance';
import { useQuery } from '@tanstack/react-query';
import { getCategoryLabel } from '@/configs/categories';

const dummyShops = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));

const TopShopsSection = () => {
  const { data: shops, isLoading, isError } = useQuery({
    queryKey: ["top-shops"],
    queryFn: async () => {
      const res = await axiosInstance.get("/product/api/top-shops");
      return res.data.shops;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  console.log("Top Shops: ", shops);

  const showSkeleton = isLoading;
  const hasNoShops = !isLoading && (!shops || shops.length === 0 || isError);

  return (
    <section className="w-full py-8 md:py-12 bg-[#18181b]">
      <div className="w-[95%] md:w-[80%] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#ff8800]">Top Performing Shops</h2>
          <div className="flex items-center text-gray-400 text-sm md:text-base">
            <span className="w-2 h-2 bg-orange-500 rounded-full mr-2 animate-pulse"></span>
            Highest Sales
          </div>
        </div>
        
        {hasNoShops ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-4">No top shops yet</div>
            <p className="text-gray-500 text-sm">Shops will appear here once they start making sales</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {showSkeleton
              ? dummyShops.map((shop) => (
                <div
                  key={shop.id}
                  className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] animate-pulse p-6 min-h-[280px]"
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-16 h-16 bg-gray-700 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-6 bg-gray-700 rounded mb-2" />
                      <div className="h-4 bg-gray-700 rounded w-3/4" />
                    </div>
                  </div>
                  <div className="h-4 bg-gray-700 rounded mb-2" />
                  <div className="h-4 bg-gray-700 rounded w-2/3 mb-4" />
                  <div className="flex justify-between items-center mb-4">
                    <div className="h-4 bg-gray-700 rounded w-20" />
                    <div className="h-4 bg-gray-700 rounded w-16" />
                  </div>
                  <div className="pt-4 border-t border-[#232326]">
                    <div className="flex justify-between items-center">
                      <div className="h-3 bg-gray-700 rounded flex-1 mr-4" />
                      <div className="h-8 bg-gray-700 rounded w-20" />
                    </div>
                  </div>
                </div>
              ))
            : shops.map((shop: any) => (
                <div key={shop.id} className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] hover:border-[#ff8800] transition-all duration-200 p-6 cursor-pointer group">
                  <div className="flex items-center space-x-4 mb-4">
                    <img 
                      src={shop.avatar || '/api/placeholder/64/64'} 
                      alt={shop.name}
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#232326] group-hover:border-[#ff8800] transition-all duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-lg truncate group-hover:text-[#ff8800] transition-colors duration-200">
                        {shop.name}
                      </h3>
                      <p className="text-[#ff8800] text-sm font-medium">
                        {getCategoryLabel(shop.category)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <span className="text-yellow-500">★</span>
                        <span className="text-white">{shop.ratings || '5.0'}</span>
                      </div>
                      <div className="text-gray-400">
                        {shop.followers?.length || 0} followers
                      </div>
                    </div>
                  </div>

                  {/* Total Sales Badge */}
                  <div className="mb-4">
                    <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full">
                      💰 ₦{shop.totalSales?.toLocaleString() || '0'} sales
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-[#232326]">
                    <div className="flex items-center justify-between">
                      <p className="text-gray-400 text-xs truncate flex-1 mr-4">
                        📍 {shop.address}
                      </p>
                      <Link
                        href={`/shop/${shop.id}`}
                        className="px-3 py-1.5 bg-[#ff8800] text-[#18181b] rounded-lg text-xs font-semibold hover:bg-orange-600 transition-all duration-200 whitespace-nowrap"
                      >
                        Visit Shop
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopShopsSection;
