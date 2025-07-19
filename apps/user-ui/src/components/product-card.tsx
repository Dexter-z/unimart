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
      className={`min-w-[170px] md:min-w-0 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-0 flex flex-col items-center border border-[#232326] shadow-lg relative transition-all duration-200 hover:scale-[1.04] hover:border-[#ff8800] group min-h-[280px] aspect-[3/4] overflow-hidden`}
    >
      {/* OFFER badge for event */}
      {isEvent && (
        <span className="absolute top-3 left-3 bg-[#ff8800] text-[#18181b] text-xs font-bold px-3 py-1 rounded-full shadow group-hover:bg-orange-500 transition">OFFER</span>
      )}
      {/* Limited Stock badge */}
      {isLimited && (
        <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow animate-pulse">Limited Stock</span>
      )}
      <div className="w-full" style={{ height: '66%' }}>
        <img
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-contain rounded-t-2xl bg-[#18181b]"
          style={{ height: '100%' }}
        />
      </div>
      <div className="flex-1 w-full flex flex-col items-center justify-between p-4">
        <div className="w-full min-h-[2.5rem] text-white font-semibold text-center mb-2 break-words line-clamp-2 text-base md:text-lg group-hover:text-[#ff8800] transition">
          {product.title}
        </div>
        <div className="w-full text-[#ff8800] font-extrabold text-lg md:text-xl text-center mb-1 group-hover:text-white transition">
          {product.price ? `₦${product.price}` : ''}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 