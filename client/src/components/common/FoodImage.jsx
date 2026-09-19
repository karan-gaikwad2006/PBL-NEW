import React, { useState } from 'react';
import { Utensils } from 'lucide-react';
import { getFoodImageUrl } from '../../utils/foodImageMap';

export default function FoodImage({ foodName, className = '' }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = getFoodImageUrl(foodName);

  if (!imageUrl || failed) {
    return (
      <div className={`flex items-center justify-center bg-[#EEF1EE] text-[#64707A] ${className}`} aria-label={`${foodName} image unavailable`}>
        <Utensils className="h-8 w-8 opacity-50" aria-hidden="true" />
      </div>
    );
  }

  return <img src={imageUrl} alt={`${foodName} food`} className={`object-cover ${className}`} onError={() => setFailed(true)} />;
}