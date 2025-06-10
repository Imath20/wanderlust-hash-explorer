import React, { useState, useEffect } from 'react';
import { X, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useTheme } from './ThemeProvider';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface MapModalProps {
  onClose: () => void;
  onLocationSelect?: (location: Location) => void;
  initialLocation: Location;
  viewOnly?: boolean;
}

const MapEvents = ({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click: (e) => {
      onMapClick?.(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Component to handle map center updates
const MapCenterUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);

  return null;
};

const MapModal = ({ onClose, onLocationSelect, initialLocation, viewOnly = false }: MapModalProps) => {
  const [selectedLocation, setSelectedLocation] = useState<Location>(initialLocation);
  const [locationName, setLocationName] = useState(initialLocation.name);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { theme } = useTheme();

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      
      const results = data.map((item: any) => ({
        lat: parseFloat(item.lat),
        lng: parseFloat(item.lon),
        name: item.display_name
      }));
      
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleResultClick = (result: Location) => {
    setSelectedLocation(result);
    setLocationName(result.name);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleMapClick = async (lat: number, lng: number) => {
    if (viewOnly) return;
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      
      if (data.display_name) {
        setLocationName(data.display_name);
        setSelectedLocation({ lat, lng, name: data.display_name });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleSave = () => {
    onLocationSelect?.(selectedLocation);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="min-h-screen p-2 sm:p-4 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-lg shadow-2xl flex flex-col relative">
          {/* Close Button - Moved to top-right corner with better mobile visibility */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 z-50 p-2 bg-white/90 dark:bg-gray-800/90 rounded-full shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            <X className="h-6 w-6 text-gray-700 dark:text-white" />
          </button>

          <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white pr-8">
              {viewOnly ? 'Locație' : 'Selectează Locația'}
            </h2>
          </div>

          <div className="p-4 bg-white dark:bg-gray-800">
            {!viewOnly && (
              <div className="relative mb-4 z-[1000]">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Caută o locație..."
                    className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                  {isSearching && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
                
                {/* Search Results */}
                {searchResults.length > 0 && (
                  <div className="absolute z-[1000] w-full mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <button
                        key={index}
                        onClick={() => handleResultClick(result)}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-900 dark:text-white text-sm"
                      >
                        {result.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="h-[300px] sm:h-[400px] w-full rounded-lg overflow-hidden mb-4 relative z-0">
              <MapContainer
                center={[selectedLocation.lat, selectedLocation.lng]}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
                <MapEvents onMapClick={handleMapClick} />
                <MapCenterUpdater center={[selectedLocation.lat, selectedLocation.lng]} />
              </MapContainer>
            </div>

            {!viewOnly && (
              <div className="flex justify-end gap-2 mt-4">
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
