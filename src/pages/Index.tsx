import React, { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import TravelCard from '../components/TravelCard';
import TravelModal from '../components/TravelModal';
import AddDestinationModal from '../components/AddDestinationModal';
import ThemeToggle from '../components/ThemeToggle';
import { ThemeProvider } from '../components/ThemeProvider';
import { travelDestinations } from '../data/travelData';
import { Plus, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../components/ui/use-toast';
import { Destination, addDestination, getDestinations } from '../services/destinationService';

const Footer = () => (
  <footer className="w-full bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm py-6 mt-8">
    <div className="container mx-auto px-4">
      {/* About Section - Full Width and Centered */}
      <div className="w-full mb-6 text-center">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Despre Noi</h3>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
          Explorează cele mai frumoase destinații din lume cu ajutorul platformei noastre.
          Găsește locuri unice și creează amintiri de neuitat.
        </p>
      </div>

      {/* Contact and Social Media - Side by Side */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Contact</h3>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Email: contact@wanderlust.com
            </span>
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Tel: +40 123 456 789
            </span>
            <span className="text-gray-600 dark:text-gray-300 whitespace-nowrap">
              Adresă: Strada Victoriei 123, București
            </span>
          </div>
        </div>

        {/* Social Media */}
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Social Media</h3>
          <div className="flex flex-col md:flex-row justify-center items-center space-y-2 md:space-y-0 md:space-x-6">
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 whitespace-nowrap">
              Facebook
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 whitespace-nowrap">
              Instagram
            </a>
            <a href="#" className="text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 whitespace-nowrap">
              Twitter
            </a>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        <p className="text-center text-gray-600 dark:text-gray-300">
          © {new Date().getFullYear()} Travelling. Toate drepturile rezervate.
        </p>
        <p className="text-center text-gray-600 dark:text-gray-300">a Ba-Ma creation</p>
      </div>
    </div>
  </footer>
);

const IndexContent = () => {
  const { user, signInWithGoogle, logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [filteredDestinations, setFilteredDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDestinations();
  }, []);

  const loadDestinations = async () => {
    try {
      setLoading(true);
      const loadedDestinations = await getDestinations();
      setDestinations(loadedDestinations);
      setFilteredDestinations(loadedDestinations);
    } catch (error) {
      console.error('Error loading destinations:', error);
      toast({
        title: "Eroare",
        description: "Nu s-au putut încărca destinațiile. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleCardClick = (destination: Destination) => {
    setSelectedDestination(destination);
  };

  const closeModal = () => {
    setSelectedDestination(null);
  };

  const handleAddDestination = async (newDestination: Omit<Destination, 'id'>) => {
    if (!user) {
      toast({
        title: "Autentificare Necesară",
        description: "Te rugăm să te autentifici pentru a adăuga o destinație.",
        variant: "destructive"
      });
      return;
    }

    try {
      const addedDestination = await addDestination(newDestination, user.uid);
      setDestinations(prev => [addedDestination, ...prev]);
      setFilteredDestinations(prev => [addedDestination, ...prev]);
      toast({
        title: "Succes",
        description: "Destinație adăugată cu succes!",
      });
    } catch (error) {
      console.error('Error adding destination:', error);
      toast({
        title: "Eroare",
        description: "Nu s-a putut adăuga destinația. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    }
  };

  const handleLogin = async () => {
    try {
      await signInWithGoogle();
      toast({
        title: "Succes",
        description: "Autentificare reușită!",
      });
    } catch (error) {
      console.error('Login failed:', error);
      toast({
        title: "Autentificare Eșuată",
        description: error instanceof Error ? error.message : "Nu s-a putut face autentificarea cu Google. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Deconectat",
        description: "Ai fost deconectat cu succes.",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Deconectare Eșuată",
        description: error instanceof Error ? error.message : "Nu s-a putut face deconectarea. Te rugăm să încerci din nou.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = () => {
    loadDestinations(); // Reload destinations after deletion
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-50 dark:from-[#242424] dark:via-[#242424] dark:to-[#242424]">
      <div className="w-full px-4 sm:px-6 py-4 sm:py-8">
        {/* Auth and Theme Buttons - Moved to top */}
        <div className="flex justify-end items-center gap-2 sm:gap-4 mb-8">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm sm:text-base"
            >
              <LogOut className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Deconectare</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
            >
              <LogIn className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Conectare cu Google</span>
            </button>
          )}
          <ThemeToggle />
        </div>

        {/* Title Section */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-black dark:text-white mb-2 sm:mb-4">
            Descoperă Lumea
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 dark:text-white">
            Găsește următoarea ta aventură
          </p>
        </div>
        
        {/* Search Bar */}
        <div className="mb-8 sm:mb-12">
          <SearchBar onSearch={handleSearch} searchTerm={searchTerm} />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 dark:text-white">
              Se încarcă destinațiile...
            </p>
          </div>
        ) : (
          <>
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
          </>
        )}

        {/* Floating Add Button - Only show if user is logged in */}
        {user && (
          <button
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-8 right-8 w-16 h-16 bg-gradient-to-r from-blue-500 to-orange-500 text-white rounded-full hover:from-blue-600 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center z-10 hover:scale-110"
          >
            <Plus className="h-8 w-8" />
          </button>
        )}

        {/* Travel Modal */}
        {selectedDestination && (
          <TravelModal
            destination={{
              id: selectedDestination.id,
              userId: selectedDestination.userId,
              title: selectedDestination.title,
              description: selectedDestination.description,
              hashtags: selectedDestination.hashtags,
              location: selectedDestination.location,
              images: selectedDestination.images.map(img => 
                img.startsWith('data:') ? img : `https://images.unsplash.com/${img}?w=1600&h=1200&fit=crop&crop=entropy&auto=format&q=75`
              )
            }}
            onClose={closeModal}
            onDelete={handleDelete}
          />
        )}

        {/* Add Destination Modal */}
        {showAddModal && (
          <AddDestinationModal
            onClose={() => setShowAddModal(false)}
            onAdd={handleAddDestination}
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
