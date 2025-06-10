import React, { useState } from 'react';
import { X } from 'lucide-react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapModalProps {
  onClose: () => void;
  onLocationSelect: (location: Location) => void;
  initialLocation: Location;
}

const MapModal = ({ onClose, onLocationSelect, initialLocation }: MapModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(initialLocation);
  const [locationName, setLocationName] = useState(initialLocation.name);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'YOUR_API_KEY_HERE'
  });

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });
      
      if (result.results[0]) {
        setLocationName(result.results[0].formatted_address);
        setSelectedLocation({ lat, lng, name: result.results[0].formatted_address });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSave = () => {
    onLocationSelect(selectedLocation);
    onClose();
  };

  if (!isLoaded) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selectează Locația</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4">
          <div className="h-[400px] w-full rounded-lg overflow-hidden mb-4">
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={selectedLocation}
              zoom={13}
              onClick={handleMapClick}
              options={{
                styles: [
                  {
                    featureType: 'all',
                    elementType: 'all',
                    stylers: [
                      { 
                        invert_lightness: window.matchMedia('(prefers-color-scheme: dark)').matches,
                        saturation: window.matchMedia('(prefers-color-scheme: dark)').matches ? 100 : 0
                      }
                    ]
                  }
                ]
              }}
            >
              <Marker position={selectedLocation} />
            </GoogleMap>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Locație Selectată
            </label>
            <input
              type="text"
              value={locationName}
              onChange={(e) => {
                setLocationName(e.target.value);
                setSelectedLocation(prev => ({ ...prev, name: e.target.value }));
              }}
              className="w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Introdu numele locației"
            />
          </div>

          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
            >
              Anulează
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Salvează Locația
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
