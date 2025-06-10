
import React from 'react';
import { MapPin } from 'lucide-react';

interface TravelCardProps {
  destination: {
    id: number;
    title: string;
    description: string;
    images: string[];
    hashtags: string[];
    location: {
      lat: number;
      lng: number;
      name: string;
    };
  };
  onClick: () => void;
}

const TravelCard = ({ destination, onClick }: TravelCardProps) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden group">
      {/* Image */}
      <div className="relative h-64 overflow-hidden" onClick={onClick}>
        <img
          src={`https://images.unsplash.com/${destination.images[0]}?w=800&h=600&fit=crop&crop=entropy&auto=format&q=75`}
          alt={destination.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div onClick={onClick}>
          <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-3 line-clamp-2">
            {destination.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
            {destination.description}
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {destination.hashtags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gradient-to-r from-blue-100 to-orange-100 dark:from-blue-900/30 dark:to-orange-900/30 text-blue-700 dark:text-blue-300 text-sm rounded-full font-medium border border-blue-200 dark:border-blue-700"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Map Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            // This will be handled by opening the map modal
            onClick();
          }}
          className="flex items-center justify-center gap-2 w-full py-2 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium text-sm"
        >
          <MapPin className="h-4 w-4" />
          Vezi pe hartă
        </button>
      </div>
    </div>
  );
};

export default TravelCard;
