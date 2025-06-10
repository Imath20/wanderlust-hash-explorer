import React, { useState, useEffect, useRef } from 'react';
import { X, Search, Loader2 } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Location {
  lat: number;
  lng: number;
  name: string;
}

interface SearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

interface MapModalProps {
  onClose: () => void;
  onLocationSelect?: (location: Location) => void;
  initialLocation?: Location;
  location?: Location; // For view-only mode
}

const MapModal = ({ onClose, onLocationSelect, initialLocation, location }: MapModalProps) => {
  const startLocation = location || initialLocation || {
    lat: 44.4268,
    lng: 26.1025,
    name: 'România'
  };

  const [selectedPosition, setSelectedPosition] = useState<[number, number]>([
    startLocation.lat,
    startLocation.lng
  ]);
  const [map, setMap] = useState<L.Map | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [marker, setMarker] = useState<L.Marker | null>(null);

  // Click outside handler for search results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ro`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      console.log('Search results:', data); // Debug log
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query);
    }, 500);
  };

  const handleSearchResultClick = (result: SearchResult) => {
    const newLat = parseFloat(result.lat);
    const newLng = parseFloat(result.lon);
    
    if (map && marker) {
      map.setView([newLat, newLng], 13);
      marker.setLatLng([newLat, newLng]);
      
      if (onLocationSelect) {
        onLocationSelect({
          lat: newLat,
          lng: newLng,
          name: result.display_name.split(',')[0]
        });
      }
    }
    
    setSelectedPosition([newLat, newLng]);
    setSearchQuery(result.display_name.split(',')[0]);
    setShowResults(false);
  };

  useEffect(() => {
    if (!map) {
      const mapInstance = L.map('map', {
        center: selectedPosition,
        zoom: 13,
        zoomControl: true,
        scrollWheelZoom: true,
        wheelDebounceTime: 100,
        wheelPxPerZoomLevel: 100,
        zoomSnap: 0.5,
        zoomDelta: 0.5,
        dragging: true,
        doubleClickZoom: true,
        bounceAtZoomLimits: true,
        maxBounds: [[-90, -180], [90, 180]],
        minZoom: 3,
        maxZoom: 18,
      });
      
      mapInstance.options.easeLinearity = 0.35;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        updateWhenIdle: true,
        updateWhenZooming: false,
        updateInterval: 200,
      }).addTo(mapInstance);

      const newMarker = L.marker(selectedPosition, {
        draggable: !!onLocationSelect
      }).addTo(mapInstance);

      setMarker(newMarker);

      if (onLocationSelect) {
        newMarker.on('dragend', async () => {
          const position = newMarker.getLatLng();
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${position.lat}&lon=${position.lng}&format=json`
            );
            const data = await response.json();
            const locationName = data.display_name.split(',')[0];
            setSelectedPosition([position.lat, position.lng]);
            onLocationSelect({ lat: position.lat, lng: position.lng, name: locationName });
          } catch (error) {
            console.error('Error getting location name:', error);
            onLocationSelect({ lat: position.lat, lng: position.lng, name: 'Location' });
          }
        });

        mapInstance.on('click', async (e) => {
          const { lat, lng } = e.latlng;
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
            );
            const data = await response.json();
            const locationName = data.display_name.split(',')[0];
            
            newMarker.setLatLng([lat, lng]);
            setSelectedPosition([lat, lng]);
            onLocationSelect({ lat, lng, name: locationName });

            mapInstance.panTo([lat, lng], {
              animate: true,
              duration: 0.5,
              easeLinearity: 0.25
            });
          } catch (error) {
            console.error('Error getting location name:', error);
            onLocationSelect({ lat, lng, name: 'Location' });
          }
        });
      }

      mapInstance.zoomControl.setPosition('topright');

      setMap(mapInstance);
    }

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [map]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#1a1a1a] rounded-lg w-full max-w-4xl overflow-hidden shadow-2xl">
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">
            {onLocationSelect ? 'Selectează Locația' : 'Vezi Locația'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {onLocationSelect && (
          <div className="p-4 border-b border-gray-700" ref={searchContainerRef}>
            <div className="relative">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0) {
                      setShowResults(true);
                    }
                  }}
                  placeholder="Caută după oraș, adresă sau punct de interes..."
                  className="w-full px-4 py-2 pl-10 bg-[#242424] border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Search Results Dropdown */}
              {showResults && searchResults.length > 0 && (
                <div className="absolute z-[1000] w-full mt-2 bg-[#242424] border border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {searchResults.map((result, index) => (
                    <button
                      key={index}
                      onClick={() => handleSearchResultClick(result)}
                      className="w-full px-4 py-2 text-left text-white hover:bg-gray-700 focus:outline-none focus:bg-gray-700 border-b border-gray-600 last:border-0"
                    >
                      {result.display_name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="relative h-[600px]">
          <div id="map" className="h-full w-full" />
        </div>

        <div className="p-4 border-t border-gray-700">
          <p className="text-gray-400 text-sm">
            {onLocationSelect 
              ? 'Click pe hartă pentru a selecta locația sau trage markerul pentru a-l muta'
              : `Locație: ${startLocation.name}`
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
