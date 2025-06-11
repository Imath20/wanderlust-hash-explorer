import React, { useState, useEffect } from 'react';
import { Modal } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LocationPickerModalProps {
  show: boolean;
  onHide: () => void;
  onLocationSelect: (location: { lat: number; lng: number; name: string }) => void;
  initialLocation?: { lat: number; lng: number; name: string };
}

interface SearchResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

const SearchControl = ({ onLocationSelect }: { onLocationSelect: (location: { lat: number; lng: number; name: string }) => void }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const map = useMap();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`
      );
      const data = await response.json();
      setSearchResults(data);
      setShowResults(true);
    } catch (error) {
      console.error('Error searching location:', error);
    }
  };

  const handleResultClick = (result: SearchResult) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    map.setView([lat, lng], 13);
    onLocationSelect({
      lat,
      lng,
      name: result.display_name
    });
    setShowResults(false);
    setSearchQuery('');
  };

  return (
    <div className="leaflet-control-container">
      <div className="leaflet-top leaflet-left" style={{ top: 60 }}>
        <div className="leaflet-control leaflet-bar bg-white p-2 shadow-lg rounded-lg" style={{ width: '300px' }}>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Caută locația..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              🔍
            </button>
          </div>
          {showResults && searchResults.length > 0 && (
            <div className="absolute mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-auto">
              {searchResults.map((result) => (
                <button
                  key={result.place_id}
                  onClick={() => handleResultClick(result)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 focus:outline-none"
                >
                  {result.display_name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  show,
  onHide,
  onLocationSelect,
  initialLocation = { lat: 45.9432, lng: 24.9668, name: 'România' }
}) => {
  const [selectedLocation, setSelectedLocation] = useState(initialLocation);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    // Reverse geocode to get location name
    fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
      .then(res => res.json())
      .then(data => {
        const newLocation = {
          lat,
          lng,
          name: data.display_name
        };
        setSelectedLocation(newLocation);
      });
  };

  const MapEvents = () => {
    const map = useMap();
    useEffect(() => {
      map.on('click', handleMapClick);
      return () => {
        map.off('click', handleMapClick);
      };
    }, [map]);
    return null;
  };

  const handleSave = () => {
    onLocationSelect(selectedLocation);
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Alege Locația</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <div style={{ height: '500px', width: '100%' }}>
          <MapContainer
            center={[initialLocation.lat, initialLocation.lng]}
            zoom={6}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <SearchControl onLocationSelect={setSelectedLocation} />
            <MapEvents />
            {selectedLocation && (
              <Marker position={[selectedLocation.lat, selectedLocation.lng]} />
            )}
          </MapContainer>
        </div>
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <div className="text-muted">
          {selectedLocation.name}
        </div>
        <button
          onClick={handleSave}
          className="btn btn-success"
        >
          Salvează Locația
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default LocationPickerModal; 