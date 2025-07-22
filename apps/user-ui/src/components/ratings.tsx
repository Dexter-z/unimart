import { Star } from 'lucide-react';
import React from 'react';

interface RatingsProps {
  rating: number;
}

const Ratings: React.FC<RatingsProps> = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<Star key={i} className="w-5 h-5 text-[#ff8800] inline" fill="#ff8800" />);
    } else if (rating >= i - 0.5) {
      stars.push(
        <span key={i} className="relative inline-block w-5 h-5">
          <Star className="w-5 h-5 text-[#ff8800] absolute left-0 top-0" style={{ clipPath: 'inset(0 50% 0 0)' }} fill="#ff8800" />
          <Star className="w-5 h-5 text-gray-400 absolute left-0 top-0" fill="#232326" />
        </span>
      );
    } else {
      stars.push(<Star key={i} className="w-5 h-5 text-gray-400 inline" fill="#232326" />);
    }
  }
  return <div className="flex items-center gap-1">{stars}</div>;
};

export default Ratings; 