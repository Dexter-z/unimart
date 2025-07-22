import { Star, StarHalf } from 'lucide-react';
import React from 'react';

interface RatingsProps {
  rating: number;
}

const Ratings: React.FC<RatingsProps> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Star key={i} className="w-5 h-5 text-[#ff8800] inline" fill="#ff8800" />);
    } else if (rating > i - 1 && rating < i) {
      // Fractional part
      if (rating - Math.floor(rating) >= 0.75) {
        stars.push(<Star key={i} className="w-5 h-5 text-[#ff8800] inline" fill="#ff8800" />);
      } else if (rating - Math.floor(rating) >= 0.25) {
        stars.push(<StarHalf key={i} className="w-5 h-5 text-[#ff8800] inline" fill="#ff8800" />);
      } else {
        stars.push(<Star key={i} className="w-5 h-5 text-gray-400 inline" fill="#232326" />);
      }
    } else {
      stars.push(<Star key={i} className="w-5 h-5 text-gray-400 inline" fill="#232326" />);
    }
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};

export default Ratings; 