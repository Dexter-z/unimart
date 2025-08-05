"use client";

import React from 'react';
import Ratings from '@/components/ratings';

interface Review {
  user?: {
    name?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
  verified?: boolean;
  images?: string[];
  helpful?: number;
}

interface ProductReviewsProps {
  reviews?: Review[];
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ reviews }) => {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
        <h3 className="text-xl font-bold text-white mb-4">Customer Reviews</h3>
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4-8 9-8s9 3.582 9 8z" />
          </svg>
          <p className="text-gray-400 text-lg mb-2">No reviews available yet</p>
          <p className="text-gray-500 text-sm">Be the first to review this product!</p>
          <button className="mt-4 px-6 py-2 bg-[#ff8800] text-[#18181b] rounded-xl font-semibold hover:bg-orange-600 transition-all duration-200">
            Write a Review
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-[#232326] to-[#18181b] rounded-2xl border border-[#232326] p-6">
      <h3 className="text-xl font-bold text-white mb-6">Customer Reviews</h3>
      <div className="space-y-6">
        {reviews.map((review: Review, index: number) => (
          <div key={index} className="border-b border-[#232326] last:border-b-0 pb-6 last:pb-0">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-gradient-to-b from-[#232326] to-[#18181b] rounded-full border border-[#232326] flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {review.user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-semibold text-white">
                      {review.user?.name || 'Anonymous User'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Ratings rating={review.rating || 0} />
                      <span className="text-xs text-gray-400">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {review.verified && (
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-3">
                  {review.comment}
                </p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto">
                    {review.images.map((image: string, imgIndex: number) => (
                      <img
                        key={imgIndex}
                        src={image}
                        alt={`Review image ${imgIndex + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-[#232326]"
                      />
                    ))}
                  </div>
                )}
                {review.helpful && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-[#232326]">
                    <button className="text-xs text-gray-400 hover:text-[#ff8800] transition-colors">
                      👍 Helpful ({review.helpful})
                    </button>
                    <button className="text-xs text-gray-400 hover:text-[#ff8800] transition-colors">
                      Reply
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-6 border-t border-[#232326]">
        <button className="w-full py-3 px-4 bg-gradient-to-b from-[#232326] to-[#18181b] border border-[#232326] text-white rounded-xl hover:border-[#ff8800] transition-all duration-200">
          Load More Reviews
        </button>
      </div>
    </div>
  );
};

export default ProductReviews;
