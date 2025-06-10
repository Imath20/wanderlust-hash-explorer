import React, { useState } from 'react';
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
    name: 'București'
  });

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-[#242424] rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-black dark:text-white">Adaugă o Destinație Nouă</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Titlu
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Description Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Descriere
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-600 dark:text-white"
                required
              />
            </div>

            {/* Image Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Imagini
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full"
                required={images.length === 0}
              />
              {images.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setImages(images.filter((_, i) => i !== index))}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Hashtags Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Hashtag-uri
              </label>
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="Apasă Enter pentru a adăuga"
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-[#1a1a1a] dark:border-gray-600 dark:text-white"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-[#1a1a1a] text-gray-700 dark:text-white text-sm rounded-full flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeHashtag(tag)}
                      className="text-gray-500 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location Selection */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                Locație
              </label>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <input
                    type="text"
                    value={location.name}
                    readOnly
                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 dark:bg-[#1a1a1a] dark:border-gray-600 dark:text-white cursor-pointer"
                    onClick={() => setShowMap(true)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowMap(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Alege pe Hartă
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-[#1a1a1a]"
              >
                Anulează
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Adaugă Destinația
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Map Modal */}
      {showMap && (
        <MapModal
          location={location}
          onClose={() => setShowMap(false)}
          onLocationSelect={(newLocation) => {
            setLocation(newLocation);
            setShowMap(false);
          }}
        />
      )}
    </div>
  );
};

export default AddDestinationModal; 