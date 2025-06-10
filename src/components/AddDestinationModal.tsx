import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, MapPin } from 'lucide-react';
import MapModal from './MapModal';

interface AddDestinationModalProps {
  onClose: () => void;
  onSave: (destination: {
    title: string;
    description: string;
    images: string[];
    hashtags: string[];
    location: {
      lat: number;
      lng: number;
      name: string;
    };
  }) => void;
}

const AddDestinationModal = ({ onClose, onSave }: AddDestinationModalProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [hashtagInput, setHashtagInput] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [showMap, setShowMap] = useState(false);
  const [location, setLocation] = useState<{lat: number; lng: number; name: string}>({
    lat: 45.9432,
    lng: 24.9668,
    name: 'România'
  });
  const [images, setImages] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Disable body scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleAddHashtag = () => {
    if (hashtagInput.trim() && !hashtags.includes(hashtagInput.trim())) {
      setHashtags([...hashtags, hashtagInput.trim()]);
      setHashtagInput('');
    }
  };

  const handleRemoveHashtag = (tagToRemove: string) => {
    setHashtags(hashtags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setImages(prev => [...prev, e.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (imageToRemove: string) => {
    setImages(images.filter(img => img !== imageToRemove));
  };

  const handleSubmit = () => {
    if (!title || !description || images.length === 0) {
      alert('Te rugăm să completezi toate câmpurile obligatorii (titlu, descriere și cel puțin o imagine)');
      return;
    }

    onSave({
      title,
      description,
      images,
      hashtags,
      location
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm">
        <div className="bg-white dark:bg-[#242424] rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl relative p-6">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/90 dark:bg-[#242424]/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-[#242424] transition-all duration-200 shadow-lg"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>

          <h2 className="text-2xl font-bold text-black dark:text-white mb-6">
            Adaugă o Nouă Destinație
          </h2>

          {/* Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Titlu *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Introdu titlul destinației"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Descriere *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Descrie destinația"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Imagini *
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <Upload className="h-5 w-5" />
                  Încarcă Imagini
                </button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="group relative aspect-[4/3] rounded-lg overflow-hidden"
                  >
                    <img
                      src={image}
                      alt={`Imagine ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => handleRemoveImage(image)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Hashtags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Hashtag-uri
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={hashtagInput}
                  onChange={(e) => setHashtagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddHashtag()}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="Adaugă un hashtag și apasă Enter"
                />
                <button
                  onClick={handleAddHashtag}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Adaugă
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-[#242424] text-gray-700 dark:text-white text-sm rounded-full font-medium border border-gray-200 dark:border-gray-600 flex items-center gap-2"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveHashtag(tag)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">
                Locație
              </label>
              <button
                onClick={() => setShowMap(true)}
                className="flex items-center justify-center gap-2 w-full py-3 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-xl hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <MapPin className="h-5 w-5" />
                Alege pe hartă
              </button>
              {location && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                  Locație selectată: {location.name}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-200 shadow-lg hover:shadow-xl font-medium mt-8"
            >
              Salvează Destinația
            </button>
          </div>
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
    </>
  );
};

export default AddDestinationModal; 