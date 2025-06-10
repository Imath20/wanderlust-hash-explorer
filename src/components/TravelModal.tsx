import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, MapPin, Trash2 } from 'lucide-react';
import MapModal from './MapModal';
import { useAuth } from '../contexts/AuthContext';
import { deleteDestination } from '../services/destinationService';
import { toast } from '../components/ui/use-toast';
import { isAdmin } from '../lib/firebase';

interface TravelModalProps {
  destination: {
    id?: string;
    title: string;
    description: string;
    images: string[];
    hashtags: string[];
    location: {
      lat: number;
      lng: number;
      name: string;
    };
    userId?: string;
    createdBy?: {
      email?: string;
    };
  };
  onClose: () => void;
  onDelete?: () => void;
}

const TravelModal = ({ destination, onClose, onDelete }: TravelModalProps) => {
  const { user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === destination.images.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [destination.images.length]);

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? destination.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === destination.images.length - 1 ? 0 : prev + 1));
  };

  const handleDelete = async () => {
    if (!destination.id) return;
    
    try {
      setIsDeleting(true);
      await deleteDestination(destination.id);
      toast({
        title: "Success",
        description: "Destination deleted successfully!",
      });
      onDelete?.();
      onClose();
    } catch (error) {
      console.error('Error deleting destination:', error);
      toast({
        title: "Error",
        description: "Failed to delete destination. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Allow deletion if user owns the post or is admin
  const canDelete = user && (destination.userId === user.uid || isAdmin(user));

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#242424] rounded-2xl w-full h-full overflow-hidden shadow-2xl relative flex flex-col">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-[#242424]/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-[#242424] transition-all duration-200 shadow-lg"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>

          {/* Delete Button - Only show if user can delete */}
          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-4 right-16 z-10 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="h-6 w-6" />
            </button>
          )}

          <div className="flex flex-col lg:flex-row h-full">
            {/* Image Slider - Takes most of the space */}
            <div className="lg:w-3/4 relative flex-1">
              <div className="relative h-full min-h-[50vh] lg:min-h-full overflow-hidden">
                <img
                  src={destination.images[currentImageIndex]}
                  alt={destination.title}
                  className="w-full h-full object-cover"
                />

                {/* Navigation Arrows */}
                {destination.images.length > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                    >
                      <X className="h-6 w-6 transform rotate-45" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75"
                    >
                      <X className="h-6 w-6 transform -rotate-45" />
                    </button>
                  </>
                )}

                {/* Dots Indicator */}
                {destination.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {destination.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
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
            <div className="lg:w-1/4 p-6 flex flex-col justify-between bg-white dark:bg-[#242424] lg:max-h-full overflow-y-auto">
              <div>
                <h2 className="text-2xl font-bold text-black dark:text-white mb-4">
                  {destination.title}
                </h2>
                
                <p className="text-gray-600 dark:text-white mb-6 leading-relaxed">
                  {destination.description}
                </p>

                {/* Hashtags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {destination.hashtags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-[#242424] text-gray-700 dark:text-white text-sm rounded-full font-medium border border-gray-200 dark:border-gray-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Admin Label */}
                {destination.createdBy?.email === "matbajean@gmail.com" && (
                  <div className="mb-6">
                    <span className="px-3 py-1 bg-blue-500 text-white text-sm rounded-full font-medium">
                      Dev
                    </span>
                  </div>
                )}
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
