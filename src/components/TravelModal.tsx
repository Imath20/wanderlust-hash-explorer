
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Pin } from 'lucide-react';
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
    }, 4000); // Change image every 4 seconds

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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
        <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] overflow-hidden shadow-2xl relative">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
          >
            <X className="h-6 w-6 text-gray-700" />
          </button>

          <div className="flex flex-col lg:flex-row h-full">
            {/* Image Slider */}
            <div className="lg:w-2/3 relative">
              <div className="relative h-64 lg:h-96 overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${destination.images[currentImageIndex]}?w=1200&h=800&fit=crop&crop=entropy&auto=format&q=75`}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {destination.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                    >
                      <ChevronLeft className="h-6 w-6 text-gray-700" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg"
                    >
                      <ChevronRight className="h-6 w-6 text-gray-700" />
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

            {/* Content */}
            <div className="lg:w-1/3 p-6 flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                  {destination.title}
                </h2>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {destination.description}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2 mb-6">
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

              {/* Map Button */}
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <Pin className="h-5 w-5" />
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
