// Controls.jsx
import React, { useState, useEffect } from "react";

const Controls = ({
  currentPage,
  totalPages,
  bookRef,
  prevPage,
  nextPage,
  searchKeyword,
  setSearchKeyword,
  searchState,
  handleSearch
}) => {
  const [inputValue, setInputValue] = useState(currentPage);
  const [searchValue, setSearchValue] = useState(searchKeyword);

  useEffect(() => setInputValue(currentPage), [currentPage]);

  const handleInputChange = (e) => setInputValue(e.target.value);
  const handleGo = (e) => {
    e.preventDefault();
    const pageNumber = Number(inputValue);
    if (pageNumber > 0 && pageNumber <= totalPages) {
      bookRef.current.pageFlip().flip(pageNumber - 1);
    }
  };

  const handleSearchInputChange = (e) => setSearchValue(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(searchValue);
    handleSearch(searchValue);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <span>Page {currentPage} / {totalPages}</span>
      <div style={{ marginTop: "20px" }}>
        <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
        <form style={{ display: 'inline-block', margin: '0 10px' }} onSubmit={handleGo}>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min="1"
            max={totalPages}
            style={{ width: 50, textAlign: 'center' }}
          />
          <button type="submit">Go</button>
        </form>
        <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
      </div>

      <div style={{ marginTop: 10 }}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm từ khóa..."
            value={searchValue}
            onChange={handleSearchInputChange}
            style={{ width: 200, marginRight: 5 }}
          />
          <button type="submit">Search</button>
        </form>

        {searchState.results.length > 0 && (
          <div style={{ marginTop: 5, maxHeight: 200, overflowY: 'auto' }}>
            <p>Kết quả: {searchState.results.length}</p>
            {searchState.results.map((res, idx) => (
              <div key={idx}>
                <button
                  style={{
                    backgroundColor: currentPage === res.pageNumber ? 'yellow' : 'white',
                    marginBottom: 2,
                    padding: '5px 10px',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    border: '1px solid #ccc'
                  }}
                  onClick={() => bookRef.current.pageFlip().flip(res.pageNumber - 1)}
                >
                  <div style={{ fontWeight: 'bold' }}>Trang {res.pageNumber}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>{res.preview}</div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Controls;
