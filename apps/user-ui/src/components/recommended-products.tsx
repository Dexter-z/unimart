"use client";

import React from 'react';
import ProductCard from '@/components/product-card';

interface Product {
  id: string;
  title: string;
  salePrice: number;
  regularPrice?: number;
  images: { url: string }[];
  ratings?: number;
  totalSales?: number;
  stock: number;
  Shop?: {
    name: string;
  };
}

interface RecommendedProductsProps {
  recommendedProducts?: Product[];
}

const RecommendedProducts: React.FC<RecommendedProductsProps> = ({ recommendedProducts }) => {
  // Don't render if no recommendations
  if (!recommendedProducts || recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
      <h3 className="text-xl font-bold text-white mb-6">You may also like</h3>
      {/* Use the exact same grid layout as home page suggested products */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 pb-2 auto-rows-fr">
        {recommendedProducts.map((product: Product) => (
          <ProductCard key={product.id} product={product} isEvent={false} />
        ))}
      </div>
    </div>
  );
};

export default RecommendedProducts;
