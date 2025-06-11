import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Destination } from '../services/destinationService';
import MapModal from './MapModal';

interface AddDestinationModalProps {
  onClose: () => void;
  onAdd: (destination: Omit<Destination, 'id'>) => void;
}

const AddDestinationModal = ({ onClose, onAdd }: AddDestinationModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<Destination['location']>({
    lat: 44.4268,
    lng: 26.1025,
    name: 'România'
  });
  const [isCompressing, setIsCompressing] = useState(false);

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          const maxDimension = 800;
          if (width > height && width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          // Compress to JPEG with quality 0.7 (70%)
          const compressedImage = canvas.toDataURL('image/jpeg', 0.7);
          resolve(compressedImage);
        };
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        img.src = event.target?.result as string;
      };
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setIsCompressing(true);
      try {
        const compressedImages = await Promise.all(
          Array.from(files).map(file => compressImage(file))
        );
        setImages(prev => [...prev, ...compressedImages]);
      } catch (error) {
        console.error('Error compressing images:', error);
        // You might want to show a toast or alert here
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleHashtagKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
        setHashtags([...hashtags, hashtagInput.trim()]);
        setHashtagInput('');
      }
    }
  };

  const removeHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || images.length === 0) {
      return;
    }

    const newDestination: Omit<Destination, 'id'> = {
      title,
      description,
      hashtags,
      images,
      location
    };

    onAdd(newDestination);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg sm:rounded-lg shadow-2xl flex flex-col">
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Adaugă o Nouă Destinație</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5 sm:h-6 sm:w-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
          <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Titlu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Introdu titlul destinației"
                required
              />
            </div>

            {/* Description Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Descriere <span className="text-red-500">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px] sm:min-h-[120px] resize-y"
                placeholder="Descrie destinația"
                required
              />
            </div>

            {/* Images Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Imagini <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="file"
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                  id="image-upload"
                  disabled={isCompressing}
                />
                <label
                  htmlFor="image-upload"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-white bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 cursor-pointer transition-colors duration-200"
                >
                  {isCompressing ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Se comprimă imaginile...
                    </span>
                  ) : (
                    'Încarcă imagini'
                  )}
                </label>
              </div>
              
              {images.length > 0 && (
                <div className="mt-3 max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
                  <div className="grid grid-cols-3 gap-2 sm:gap-4 p-1">
                    {images.map((image, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={image}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => setImages(images.filter((_, i) => i !== index))}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hashtags Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Hashtag-uri
              </label>
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                className="w-full px-3 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Apasă Enter pentru a adăuga un hashtag"
              />
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 sm:px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs sm:text-sm rounded-full flex items-center gap-1 sm:gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-500 p-0.5"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Locație
              </label>
              <button
                type="button"
                onClick={() => setShowMap(true)}
                className="w-full px-4 py-2 sm:py-3 bg-white dark:bg-gradient-to-r dark:from-blue-500 dark:to-orange-500 text-gray-900 dark:text-white border border-gray-300 dark:border-transparent rounded-lg hover:bg-gray-50 dark:hover:from-blue-600 dark:hover:to-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Alege pe hartă
              </button>
              <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Locație selectată: {location.name}
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white dark:bg-gray-800 p-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                className="w-full px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium text-sm sm:text-base"
              >
                Salvează Destinația
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          onClose={() => setShowMap(false)}
          onLocationSelect={(newLocation) => {
            setLocation(newLocation);
            setShowMap(false);
          }}
          initialLocation={location}
        />
      )}
    </div>
  );
};

export default AddDestinationModal; 