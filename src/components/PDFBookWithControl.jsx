import React, { useState, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import PDFPage from './PDFPage';
import pdfjsLib from '../utils/pdf';

const PDFBookWithControls = ({ file, pageNum, onPageChange, onTotalPages }) => {
  const [pdf, setPdf] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]); // { page, matches: [text] }
  const [highlightPage, setHighlightPage] = useState(null);

  // Load PDF
  useEffect(() => {
    if (!file) return;

    const loadPdf = async () => {
      const url = URL.createObjectURL(file);
      const pdfDoc = await pdfjsLib.getDocument(url).promise;
      setPdf(pdfDoc);
      setTotalPages(pdfDoc.numPages);
      onTotalPages?.(pdfDoc.numPages);
    };

    loadPdf();

    return () => file && URL.revokeObjectURL(file);
  }, [file, onTotalPages]);

  if (!pdf) return <p style={{ textAlign: 'center' }}>Loading PDF...</p>;

  // Control handlers
  const goToPage = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    onPageChange?.(pageNumber);
    setHighlightPage(pageNumber); // highlight khi click
  };

  const nextPage = () => goToPage(Math.min(pageNum + 1, totalPages));
  const prevPage = () => goToPage(Math.max(pageNum - 1, 1));

  // Search handler
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchKeyword || !pdf) return;

    const results = [];
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const text = content.items.map(item => item.str).join(' ');
      const regex = new RegExp(searchKeyword, 'gi');
      const matches = text.match(regex);
      if (matches && matches.length > 0) {
        results.push({ page: i, matches });
      }
    }

    if (results.length === 0) {
      alert('Không tìm thấy từ khóa!');
    }
    setSearchResults(results);
  };

  // Controls component
  const Controls = () => {
    const [inputValue, setInputValue] = useState(pageNum);
    const [searchValue, setSearchValue] = useState(searchKeyword);

    useEffect(() => setInputValue(pageNum), [pageNum]);

    const handleInputChange = (e) => setInputValue(e.target.value);
    const handleGo = (e) => {
      e.preventDefault();
      const pageNumber = Number(inputValue);
      if (pageNumber > 0 && pageNumber <= totalPages) goToPage(pageNumber);
    };

    const handleSearchInputChange = (e) => setSearchValue(e.target.value);
    const handleSearchSubmit = (e) => {
      e.preventDefault();
      setSearchKeyword(searchValue);
      handleSearch(e);
    };

    return (
      <div style={{ marginTop: 10 }}>
        <div>
          <button onClick={prevPage} disabled={pageNum === 1}>Previous</button>
          <form style={{ display: 'inline-block', margin: '0 10px' }}>
            <input
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              min="1"
              max={totalPages}
              style={{ width: 50, textAlign: 'center' }}
            />
            <button onClick={handleGo}>Go</button>
          </form>
          <span> / {totalPages}</span>
          <button onClick={nextPage} disabled={pageNum === totalPages}>Next</button>
        </div>

        {/* Tìm kiếm */}
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
          {searchResults.length > 0 && (
            <div style={{ marginTop: 5, maxHeight: 200, overflowY: 'auto' }}>
              {searchResults.map((res, idx) => (
                <div key={idx}>
                  <button
                    style={{
                      backgroundColor: highlightPage === res.page ? 'yellow' : 'white',
                      marginBottom: 2
                    }}
                    onClick={() => goToPage(res.page)}
                  >
                    Trang {res.page}: {res.matches.length} kết quả
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render spreads
  const spreads = [];
  spreads.push(
    <div key="cover" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <PDFPage pdf={pdf} pageNumber={1} highlight={highlightPage === 1 ? searchKeyword : null} />
    </div>
  );
  for (let i = 2; i <= totalPages; i += 2) {
    spreads.push(
      <div key={i} style={{ display: 'flex' }}>
        <PDFPage pdf={pdf} pageNumber={i} highlight={highlightPage === i ? searchKeyword : null} />
        {i + 1 <= totalPages && <PDFPage pdf={pdf} pageNumber={i + 1} highlight={highlightPage === i+1 ? searchKeyword : null} />}
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <HTMLFlipBook
        width={1200}
        height={1600}
        size="stretch"
        showCover={true}
        startPage={pageNum - 1}
        onFlip={(e) => onPageChange?.(e.data + 1)}
        className="flipbook"
      >
        {spreads}
      </HTMLFlipBook>
      <Controls />
    </div>
  );
};

export default PDFBookWithControls;
