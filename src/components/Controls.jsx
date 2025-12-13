import React, { useState, useEffect } from 'react';

const Controls = ({ currentPage, totalPages, goToPage, nextPage, prevPage }) => {
  const [inputValue, setInputValue] = useState(currentPage);

  useEffect(() => setInputValue(currentPage), [currentPage]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleGo = (e) => {
    e.preventDefault();
    const pageNumber = Number(inputValue);
    if (pageNumber > 0 && pageNumber <= totalPages) {
      goToPage(pageNumber);
    }
  };

  return (
    <div style={{ marginTop: 10 }}>
      <button onClick={prevPage} disabled={currentPage === 1}>Previous</button>
      <form style={{ display: 'inline-block', margin: '0 10px' }}>
        <input type="number" value={inputValue} onChange={handleInputChange} min="1" max={totalPages} style={{ width: 50, textAlign: 'center' }} />
        <button onClick = {handleGo}>Go</button>
      </form>
      <span> / {totalPages}</span>
      <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
    </div>
  );
};

export default Controls;
