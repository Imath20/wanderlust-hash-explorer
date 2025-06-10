import React, { useState } from 'react';
import SearchBar from '../components/SearchBar';
import TravelCard from '../components/TravelCard';
import TravelModal from '../components/TravelModal';
import AddDestinationModal from '../components/AddDestinationModal';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from '../components/ThemeProvider';
import { travelDestinations } from '../data/travelData';
import { Plus } from 'lucide-react';

const Footer = () => (
  <footer className="w-full bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm py-12 mt-20">
    <div className="max-w-7xl mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* About Section */}
        <div className="col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Despre Noi</h3>
          <p className="text-gray-600 dark:text-gray-300">
            Explorează cele mai frumoase destinații din lume cu ajutorul platformei noastre.
            Găsește locuri unice și creează amintiri de neuitat.
          </p>
        </div>

        {/* Quick Links */}
        <div className="col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Link-uri Rapide</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                Destinații Populare
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                Oferte Speciale
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                Ghiduri de Călătorie
              </a>
            </li>
            <li>
              <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
                Blog
              </a>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
          <ul className="space-y-2">
            <li className="text-gray-600 dark:text-gray-300">
              Email: contact@wanderlust.com
            </li>
            <li className="text-gray-600 dark:text-gray-300">
              Tel: +40 123 456 789
            </li>
            <li className="text-gray-600 dark:text-gray-300">
              Adresă: Strada Victoriei 123, București
            </li>
          </ul>
        </div>

        {/* Social Media */}
        <div className="col-span-1">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Media</h3>
          <div className="flex space-x-4">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Facebook
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Instagram
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400">
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} Wanderlust. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  </footer>
);

const IndexContent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [destinations, setDestinations] = useState(travelDestinations);
  const [filteredDestinations, setFilteredDestinations] = useState(destinations);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === '') {
      setFilteredDestinations(destinations);
    } else {
      const filtered = destinations.filter(destination => 
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

  const handleAddDestination = (newDestination: any) => {
    const destinationWithId = {
      ...newDestination,
      id: destinations.length + 1,
      images: newDestination.images
    };
    const updatedDestinations = [...destinations, destinationWithId];
    setDestinations(updatedDestinations);
    setFilteredDestinations(updatedDestinations);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 dark:from-[#242424] dark:via-[#242424] dark:to-[#242424]">
      <div className="w-full px-6 py-8">
        {/* Header with Logo and Theme Toggle */}
        <div className="flex justify-between items-start mb-12">
          <div className="flex-1 text-center">
            <div className="flex items-center justify-center gap-4 mb-4">
              <h1 className="text-5xl font-bold text-black dark:text-white">
                Descoperă Lumea
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-white mb-8">
              Găsește următoarea ta aventură
            </p>
          </div>
          <ThemeToggle />
        </div>
        
        {/* Search Bar - Full Width */}
        <div className="mb-12">
          <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
        </div>

        {/* Travel Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mb-12">
          {filteredDestinations.map((destination) => (
            <TravelCard
              key={destination.id}
              destination={{
                ...destination,
                images: destination.images.map(img => 
                  img.startsWith('data:') ? img : `https://images.unsplash.com/${img}?w=800&h=600&fit=crop&crop=entropy&auto=format&q=75`
                )
              }}
              onClick={() => handleCardClick(destination)}
            />
          ))}
        </div>

        {/* No results message */}
        {filteredDestinations.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-white">
              Nu am găsit destinații pentru "{searchTerm}"
            </p>
            <p className="text-gray-500 dark:text-white mt-2">
              Încearcă să cauți altceva sau explorează toate destinațiile
            </p>
          </div>
        )}

        {/* Floating Add Button */}
        <button
          onClick={() => setShowAddModal(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-full hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center z-10 hover:scale-110"
        >
          <Plus className="h-8 w-8" />
        </button>

        {/* Travel Modal */}
        {selectedDestination && (
          <TravelModal
            destination={{
              ...selectedDestination,
              images: selectedDestination.images.map(img => 
                img.startsWith('data:') ? img : `https://images.unsplash.com/${img}?w=1600&h=1200&fit=crop&crop=entropy&auto=format&q=75`
              )
            }}
            onClose={closeModal}
          />
        )}

        {/* Add Destination Modal */}
        {showAddModal && (
          <AddDestinationModal
            onClose={() => setShowAddModal(false)}
            onSave={handleAddDestination}
          />
        )}
      </div>

      {/* Footer */}
      <Footer />
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
