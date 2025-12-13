import React, { useState } from 'react';

const SearchBar = ({ onSearch, searchResults, goToSearchResult }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleInputChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSearchClick = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search in book..."
        value={searchTerm}
        onChange={handleInputChange}
        onKeyPress={(e) => { if (e.key === 'Enter') handleSearchClick(); }}
        aria-label="Search text in PDF"
      />
      <button onClick={handleSearchClick}>Search</button>
      {searchResults.length > 0 && (
        <div className="search-results-info">
          <span>{searchResults.length} matches found.</span>
          {/* Navigation through results could be added here */}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
