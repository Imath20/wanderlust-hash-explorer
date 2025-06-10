
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
    <div className="max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-6 w-6 text-gray-400" />
        </div>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder="Caută destinații sau folosește # pentru hashtag-uri..."
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-0 outline-none transition-all duration-300 shadow-lg hover:shadow-xl bg-white/80 backdrop-blur-sm"
        />
      </div>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => handleSuggestionClick(suggestion)}
            className="px-4 py-2 bg-white/70 backdrop-blur-sm text-gray-700 rounded-full border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-200 text-sm font-medium shadow-sm hover:shadow-md"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
