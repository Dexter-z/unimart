"use client"
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Ratings from './ratings';

interface ProductCardProps {
  product: any;
  isEvent: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, isEvent }) => {
  // Countdown logic
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  useEffect(() => {
    if (!product.endingDate) return;
    const interval = setInterval(() => {
      const end = new Date(product.endingDate).getTime();
      const now = Date.now();
      const diff = end - now;
      if (diff <= 0) {
        setTimeLeft('Ended');
        clearInterval(interval);
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);
      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
    }, 1000);
    return () => clearInterval(interval);
  }, [product.endingDate]);

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`min-w-[170px] md:min-w-0 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl p-0 flex flex-col items-center border border-[#232326] shadow-lg relative transition-all duration-200 hover:scale-[1.04] hover:border-[#ff8800] group min-h-[280px] aspect-[3/4.4] overflow-hidden`}
    >
      {/* OFFER badge for event */}
      {isEvent && (
        <span className="absolute top-3 left-3 bg-[#ff8800] text-[#18181b] text-xs font-bold px-3 py-1 rounded-full shadow group-hover:bg-orange-500 transition">OFFER</span>
      )}
      <div className="w-full" style={{ height: '66%' }}>
        <img
          src={product.images?.[0]?.url || '/placeholder.svg'}
          alt={product.title}
          className="w-full h-full object-contain rounded-t-2xl bg-[#18181b]"
          style={{ height: '100%' }}
        />
      </div>
      <div className="flex-1 w-full flex flex-col items-center justify-between p-2">
        <div className="w-full min-h-[1rem] text-white font-semibold text-center break-words line-clamp-2 text-base md:text-lg group-hover:text-[#ff8800] transition mb-0">
          {product.title}
        </div>
        <div className="w-full flex flex-col items-center gap-0 -mt-2">
          <span className="text-[#ff8800] font-extrabold text-lg md:text-xl text-center">₦{product.salePrice?.toLocaleString()}</span>
          {product.Shop?.id && (
            <div className="flex flex-col items-center gap-0 w-full">
              <Ratings rating={typeof product.ratings === 'number' ? product.ratings : 0} />
              <span className="text-xs text-gray-400">{product.totalSales} sold</span>
            </div>
          )}
          {product.endingDate && timeLeft && (
            <span className="mt-1 bg-[#18181b] text-[#ff8800] text-xs font-semibold px-3 py-1 rounded-full shadow border border-[#ff8800]">{timeLeft}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard; 