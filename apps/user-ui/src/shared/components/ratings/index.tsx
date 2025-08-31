import React from "react";
import { Star } from "lucide-react";

type RatingsProps = {
  rating: number; // e.g. 3.5, 4, etc.
  max?: number;   // default = 5
};

const Ratings: React.FC<RatingsProps> = ({ rating, max = 5 }) => {
  const stars = [];

  for (let i = 1; i <= max; i++) {
    if (rating >= i) {
      // full star
      stars.push(
        <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />
      );
    } else if (rating >= i - 0.5) {
      // half star
      stars.push(
        <div key={i} className="relative w-6 h-6">
          <Star className="w-6 h-6 text-gray-300" />
          <Star className="w-6 h-6 fill-yellow-400 text-yellow-400 absolute top-0 left-0 clip-half" />
        </div>
      );
    } else {
      // empty star
      stars.push(
        <Star key={i} className="w-6 h-6 text-gray-300" />
      );
    }
  }

  return <div className="flex gap-1">{stars}</div>;
};

export default Ratings;
