import React from 'react';
import { Destination } from '../services/destinationService';

interface TravelCardProps {
  destination: Destination;
  onClick: () => void;
}

const TravelCard = ({ destination, onClick }: TravelCardProps) => {
  return (
    <div 
      className="bg-white dark:bg-[#242424] rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:scale-105 overflow-hidden group"
      onClick={onClick}
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={destination.images[0]}
          alt={destination.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-black dark:text-white mb-3 line-clamp-2">
          {destination.title}
        </h3>
        
        <p className="text-gray-600 dark:text-white mb-4 line-clamp-3 leading-relaxed">
          {destination.description}
        </p>

        {/* Hashtags */}
        <div className="flex flex-wrap gap-2 mb-3">
          {destination.hashtags.map((tag, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-gray-100 dark:bg-[#242424] text-gray-700 dark:text-white text-sm rounded-full font-medium border border-gray-200 dark:border-gray-600"
            >
              #{tag}
            </span>
          ))}
        </div>

        {/* Dev Label */}
        {destination.createdBy?.email === "matbajean@gmail.com" && (
          <div className="mt-3">
            <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium">
              Dev
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelCard;
