"use client"
import React from 'react';
import Link from 'next/link';

interface ProductCardProps {
  product: any;
  isEvent: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isEvent }) => {
  const isLimited = product.stock !== undefined && product.stock <= 5;
  return (
    <Link
      href={`/product/${product.slug}`}
      className={`min-w-[160px] md:min-w-0 bg-[#232326] rounded-xl p-4 flex flex-col items-center border border-[#232326] shadow-sm relative transition-all duration-200 hover:scale-[1.03] ${isEvent ? 'ring-2 ring-[#ff8800] ring-offset-2' : ''} min-h-[240px] md:min-h-[260px]`}
    >
      {/* OFFER badge for event */}
      {isEvent && (
        <span className="absolute top-2 left-2 bg-[#ff8800] text-[#18181b] text-xs font-bold px-2 py-1 rounded shadow">OFFER</span>
      )}
      {/* Limited Stock badge */}
      {isLimited && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded shadow animate-pulse">Limited Stock</span>
      )}
      <img
        src={product.images?.[0]?.url || '/placeholder.svg'}
        alt={product.title}
        className={`w-24 h-24 object-cover rounded-lg mb-3 bg-gray-800 ${isLimited ? 'ring-2 ring-red-600' : ''}`}
      />
      <div className="h-auto min-h-[2.5rem] w-32 text-white font-semibold text-center mb-2 break-words line-clamp-2">{product.title}</div>
      <div className="h-3 w-12 text-[#ff8800] font-bold text-center">{product.price ? `₦${product.price}` : ''}</div>
    </Link>
  );
};

export default ProductCard; 