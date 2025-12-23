import React, { useState, useEffect, useRef, useCallback } from 'react';
import HTMLFlipBook from 'react-pageflip';
import PDFPage from './PDFPage';
import { processPDF } from '../utils/pdf';
import '../styles.css';

const PDFBookWithControls = ({ file }) => {
  const [pdf, setPdf] = useState(null);
  const [pageTexts, setPageTexts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchState, setSearchState] = useState({ results: [], targetPage: null }); // Combined state
  const [error, setError] = useState(null);
  const bookRef = useRef(null);
  const pdfRef = useRef(null); // Track current PDF for cleanup

  // Separate loadPdf function
  const loadPdf = useCallback(async (fileToLoad) => {
    try {
      // Clean up old PDF before loading new one
      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying PDF:', e);
        }
        pdfRef.current = null;
      }
      
      // Reset state
      setPdf(null);
      setPageTexts([]);
      setTotalPages(0);
      setCurrentPage(1);
      setSearchKeyword('');
      setSearchState({ results: [], targetPage: null });
      setError(null);
      
      // Force garbage collection hint
      if (window.gc) {
        window.gc();
      }
      
      const { pdf, texts } = await processPDF(fileToLoad);
      pdfRef.current = pdf;
      setPdf(pdf);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
      setPageTexts(texts);
    } catch (error) {
      setError(error.message || 'Failed to load PDF');
      // Clean up on error
      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying PDF:', e);
        }
        pdfRef.current = null;
      }
      setPdf(null);
    }
  }, []);

  // Load PDF
  useEffect(() => {
    if (!file) return;

    loadPdf(file);

    return () => {
      // Cleanup on unmount
      if (pdfRef.current) {
        try {
          pdfRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying PDF on unmount:', e);
        }
        pdfRef.current = null;
      }
      // Clear state to help garbage collection
      setPdf(null);
      setPageTexts([]);
    };
  }, [file, loadPdf]);


  useEffect(() => {
    if (searchState.targetPage && bookRef.current) {
      bookRef.current.pageFlip().flip(searchState.targetPage - 1);
    }
  }, [searchState.targetPage]);

  const onFlip = useCallback((e) => {
    setCurrentPage(e.data + 1);
  }, []);

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p style={{ color: 'red', fontWeight: 'bold' }}>Error loading PDF</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!pdf) return <p style={{ textAlign: 'center' }}>Loading PDF...</p>;

  const nextPage = () => bookRef.current.pageFlip().flipNext();
  const prevPage = () => bookRef.current.pageFlip().flipPrev();

  // Search handler using pageTexts
  const handleSearch = (keyword) => {
    if (!keyword.trim() || pageTexts.length === 0) {
      setSearchState({ results: [], targetPage: null });
      return;
    }

    const results = [];
    pageTexts.forEach((text, index) => {
      const lowerText = text.toLowerCase();
      const lowerKeyword = keyword.toLowerCase();
      
      if (lowerText.includes(lowerKeyword)) {
        const keywordIndex = lowerText.indexOf(lowerKeyword);
        const start = Math.max(0, keywordIndex - 40);
        const end = Math.min(text.length, keywordIndex + keyword.length + 40);
        const preview = (start > 0 ? '...' : '') + 
                       text.substring(start, end) + 
                       (end < text.length ? '...' : '');
        
        results.push({
          pageNumber: index + 1,
          preview: preview,
          matches: [keyword]
        });
      }
    });

    if (results.length === 0) {
      alert('Không tìm thấy từ khóa!');
      setSearchState({ results: [], targetPage: null });
    } else {
      setSearchState({ results, targetPage: results[0].pageNumber });
    }
  };

  // Controls component
  const Controls = () => {
    const [inputValue, setInputValue] = useState(currentPage);
    const [searchValue, setSearchValue] = useState(searchKeyword);

    useEffect(() => setInputValue(currentPage), [currentPage]);

    const handleInputChange = (e) => setInputValue(e.target.value);
    const handleGo = (e) => {
      e.preventDefault();
      const pageNumber = Number(inputValue);
      if (pageNumber > 0 && pageNumber <= totalPages) bookRef.current.pageFlip().flip(pageNumber - 1);
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
          <button onClick={nextPage} disabled={currentPage === totalPages}>Next</button>
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
                    onClick={() => {
                      bookRef.current.pageFlip().flip(res.pageNumber - 1);
                    }}
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

  // Render each page individually
  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(
      <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <PDFPage pdf={pdf} pageNumber={i+1} />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center' }}>
        <HTMLFlipBook
        width={600}
        height={800}
        size="stretch"
        showCover={true}
        startPage={0}
        onFlip={onFlip}
        className="flipbook"
        ref={bookRef}
      >
        {pages}
      </HTMLFlipBook>
     
      <Controls />
    </div>
  );
};

export default PDFBookWithControls;


