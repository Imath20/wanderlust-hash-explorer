import React, { useState } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  searchTerm: string;
}

const SearchBar = ({ onSearch, searchTerm }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchTerm);
  const [suggestions] = useState([
    '#munte', '#mare', '#oraș', '#natură', '#aventură', 
    '#cultură', '#relaxare', '#fotografie', '#istoric', '#gastronomie'
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onSearch(value);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    onSearch(suggestion);
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto">
      {/* Search Input - Full Width */}
      <div className="relative mb-4 sm:mb-6">
        <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 dark:text-white" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Caută destinații sau folosește # pentru hashtag-uri..."
          className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl focus:border-blue-500 dark:focus:border-blue-400 focus:ring-0 outline-none transition-all duration-300 shadow-md hover:shadow-lg sm:shadow-lg sm:hover:shadow-xl bg-white/80 dark:bg-[#242424]/80 backdrop-blur-sm text-gray-800 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
        />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-3 sm:px-4 py-1.5 sm:py-2 bg-white/70 dark:bg-[#242424]/70 backdrop-blur-sm text-gray-700 dark:text-white rounded-full border border-gray-200 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-[#242424] hover:border-blue-300 dark:hover:border-blue-500 hover:text-blue-700 dark:hover:text-white transition-all duration-200 text-xs sm:text-sm font-medium shadow-sm hover:shadow-md"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
