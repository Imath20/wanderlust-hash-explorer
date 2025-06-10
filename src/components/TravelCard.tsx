
import React from 'react';

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
    <div 
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden group"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={`https://images.unsplash.com/${destination.images[0]}?w=800&h=600&fit=crop&crop=entropy&auto=format&q=75`}
          alt={destination.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
          {destination.title}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {destination.description}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2">
          {destination.hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-orange-100 text-blue-700 text-sm rounded-full font-medium border border-blue-200"
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TravelCard;
