
import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import TravelCard from '../components/TravelCard';
import TravelModal from '../components/TravelModal';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from '../components/ThemeProvider';
import { travelDestinations } from '../data/travelData';

const IndexContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [filteredDestinations, setFilteredDestinations] = useState(travelDestinations);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredDestinations(travelDestinations);
    } else {
      const filtered = travelDestinations.filter(destination => 
        destination.title.toLowerCase().includes(term.toLowerCase()) ||
        destination.description.toLowerCase().includes(term.toLowerCase()) ||
        destination.hashtags.some(tag => tag.toLowerCase().includes(term.toLowerCase().replace('#', '')))
      );
      setFilteredDestinations(filtered);
    }
  };

  const handleCardClick = (destination: any) => {
    setSelectedDestination(destination);
  };

  const closeModal = () => {
    setSelectedDestination(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-orange-50 to-rose-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="w-full px-6 py-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex-1 text-center">
            <h1 className="text-5xl font-bold text-black dark:text-[#242424] mb-4">
              Descoperă Lumea
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Găsește următoarea ta aventură
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Search Bar - Full Width */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
        </div>

        {/* Travel Cards Grid - Full Width with smaller gap */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-12">
          {filteredDestinations.map((destination) => (
            <TravelCard
              key={destination.id}
              destination={destination}
              onClick={() => handleCardClick(destination)}
            />
          ))}
        </div>

        {/* No results message */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Nu am găsit destinații pentru "{searchTerm}"
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Încearcă să cauți altceva sau explorează toate destinațiile
            </p>
          </div>
        )}

        {/* Travel Modal */}
        {selectedDestination && (
          <TravelModal
            destination={selectedDestination}
            onClose={closeModal}
          />
        )}
      </div>
    </div>
  );
};

const Index = () => {
  return (
    <ThemeProvider>
      <IndexContent />
    </ThemeProvider>
  );
};

export default Index;
