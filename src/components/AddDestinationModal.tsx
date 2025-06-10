import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import MapModal from './MapModal';
import { Destination } from '../services/destinationService';

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

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImages(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
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
      <div className="bg-white dark:bg-gray-800 w-full h-full sm:h-auto sm:max-h-[90vh] sm:w-full sm:max-w-lg overflow-hidden sm:rounded-lg shadow-2xl">
        <div className="h-full sm:h-auto overflow-y-auto">
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
                placeholder="Introdu titlul destinației"
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
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
                placeholder="Descrie destinația"
                rows={4}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                required
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Imagini <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => document.getElementById('image-upload')?.click()}
                className="w-full px-4 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                Încarcă Imagini
              </button>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                required={images.length === 0}
              />
              
              {images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2 sm:gap-4">
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
              )}
            </div>

            {/* Hashtags Input */}
            <div>
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1 sm:mb-2">
                Hashtag-uri
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyDown={handleHashtagKeyDown}
                  placeholder="Adaugă un hashtag și apasă Enter"
                  className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
                      setHashtags([...hashtags, hashtagInput.trim()]);
                      setHashtagInput('');
                    }
                  }}
                  className="px-3 sm:px-4 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base whitespace-nowrap"
                >
                  Adaugă
                </button>
              </div>
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
                className="w-full px-4 py-2 sm:py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-lg hover:from-blue-600 hover:to-orange-600 transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
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

            {/* Submit Button - Fixed at bottom on mobile */}
            <div className="sticky bottom-0 left-0 right-0 bg-white dark:bg-gray-800 p-4 sm:p-0 -mx-4 sm:mx-0 mt-4 sm:mt-6">
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