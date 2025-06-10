
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import MapModal from './MapModal';

interface TravelModalProps {
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
  onClose: () => void;
}

const TravelModal = ({ destination, onClose }: TravelModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === destination.images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [destination.images.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === destination.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? destination.images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentImageIndex(index);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-white dark:bg-gray-800 rounded-2xl w-full h-full overflow-hidden shadow-2xl relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-gray-200" />
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Image Slider - Takes most of the space */}
            <div className="lg:w-3/4 relative flex-1">
              <div className="relative h-full min-h-[50vh] lg:min-h-full overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${destination.images[currentImageIndex]}?w=1600&h=1200&fit=crop&crop=entropy&auto=format&q=75`}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {destination.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-gray-800 transition-all duration-200 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700 dark:text-gray-200" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {destination.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {destination.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => goToImage(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-200 ${
                          index === currentImageIndex 
                            ? 'bg-white shadow-lg' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Content Sidebar */}
            <div className="lg:w-1/4 p-6 flex flex-col justify-between bg-white dark:bg-gray-800 lg:max-h-full overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-[#242424] mb-4">
                  {destination.title}
                </h2>
                
                <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                  {destination.description}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {destination.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full font-medium border border-gray-200 dark:border-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Map Button */}
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <MapPin className="h-5 w-5" />
                Vezi pe hartă
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          location={destination.location}
          onClose={() => setShowMap(false)}
        />
      )}
    </>
  );
};

export default TravelModal;
