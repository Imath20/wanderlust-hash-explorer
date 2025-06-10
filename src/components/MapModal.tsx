import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapModalProps {
  location: {
    lat: number;
    lng: number;
    name: string;
  };
  onClose: () => void;
  onLocationSelect?: (location: { lat: number; lng: number; name: string }) => void;
}

const MapModal = ({ location, onClose, onLocationSelect }: MapModalProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selectedLocation, setSelectedLocation] = useState(location);
  const [locationName, setLocationName] = useState(location.name);

  // Ensure body remains non-scrollable when map modal is opened
  useEffect(() => {
    // We don't need to set overflow: hidden here because the parent modal already did
    return () => {
      // We don't want to reset overflow here because the parent modal should handle it
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    mapInstanceRef.current = L.map(mapRef.current).setView([location.lat, location.lng], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(mapInstanceRef.current);

    // Add marker
    markerRef.current = L.marker([location.lat, location.lng], { draggable: !!onLocationSelect })
      .addTo(mapInstanceRef.current)
      .bindPopup(location.name)
      .openPopup();

    // Add click handler if onLocationSelect is provided
    if (onLocationSelect) {
      mapInstanceRef.current.on('click', (e) => {
        const { lat, lng } = e.latlng;
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          setSelectedLocation({ ...selectedLocation, lat, lng });
        }
      });

      // Add drag end handler for marker
      markerRef.current.on('dragend', () => {
        const newLatLng = markerRef.current?.getLatLng();
        if (newLatLng) {
          setSelectedLocation({ ...selectedLocation, lat: newLatLng.lat, lng: newLatLng.lng });
        }
      });
    }

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [location, onLocationSelect]);

  const handleSaveLocation = () => {
    if (onLocationSelect) {
      onLocationSelect({
        ...selectedLocation,
        name: locationName
      });
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#242424] rounded-3xl max-w-4xl w-full max-h-[80vh] overflow-hidden shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-white/90 dark:bg-[#242424]/90 backdrop-blur-sm rounded-full hover:bg-white dark:hover:bg-[#242424] transition-all duration-200 shadow-lg"
        >
          <X className="h-6 w-6 text-gray-700 dark:text-white" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {onLocationSelect ? 'Alege Locația' : `Locația: ${location.name}`}
          </h3>
          {onLocationSelect && (
            <div className="flex gap-4">
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Numele locației"
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#242424] text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSaveLocation}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Salvează
              </button>
            </div>
          )}
        </div>

        {/* Map */}
        <div 
          ref={mapRef} 
          className="w-full h-96"
        />

        {onLocationSelect && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
            Click pe hartă sau trage marker-ul pentru a alege locația
          </div>
        )}
      </div>
    </div>
  );
};

export default MapModal;
