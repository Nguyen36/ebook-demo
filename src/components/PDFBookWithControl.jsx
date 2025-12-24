// PDFBookWithControls.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import PDFPage from "./PDFPage"; // component render 1 page
import Controls from "./Controls";
import { processPDF } from "../utils/pdf"; // giả sử bạn có hàm trích text + pdf object

const PDFBookWithControls = ({ file }) => {
  const [pdf, setPdf] = useState(null);
  const [pageTexts, setPageTexts] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchState, setSearchState] = useState({ results: [], targetPage: null });
  const [error, setError] = useState(null);

  const bookRef = useRef(null);
  const pdfRef = useRef(null);

  const loadPdf = useCallback(async (fileToLoad) => {
    try {
      if (pdfRef.current) {
        try { pdfRef.current.destroy(); } catch (e) {}
        pdfRef.current = null;
      }

      setPdf(null);
      setPageTexts([]);
      setTotalPages(0);
      setCurrentPage(1);
      setSearchKeyword("");
      setSearchState({ results: [], targetPage: null });
      setError(null);

      const { pdf, texts } = await processPDF(fileToLoad);
      pdfRef.current = pdf;
      setPdf(pdf);
      setPageTexts(texts);
      setTotalPages(pdf.numPages);
      setCurrentPage(1);
    } catch (err) {
      setError(err.message || "Failed to load PDF");
      pdfRef.current = null;
      setPdf(null);
    }
  }, []);

  useEffect(() => {
    if (!file) return;
    loadPdf(file);

    return () => {
      if (pdfRef.current) {
        try { pdfRef.current.destroy(); } catch (e) {}
        pdfRef.current = null;
      }
      setPdf(null);
      setPageTexts([]);
    };
  }, [file, loadPdf]);

  const onFlip = useCallback((e) => setCurrentPage(e.data + 1), []);

  useEffect(() => {
    if (searchState.targetPage && bookRef.current) {
      bookRef.current.pageFlip().flip(searchState.targetPage - 1);
    }
  }, [searchState.targetPage]);

  const nextPage = () => bookRef.current?.pageFlip().flipNext();
  const prevPage = () => bookRef.current?.pageFlip().flipPrev();

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
        const idx = lowerText.indexOf(lowerKeyword);
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + lowerKeyword.length + 40);
        const preview = (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");
        results.push({ pageNumber: index + 1, preview });
      }
    });

    if (results.length === 0) {
      alert("Không tìm thấy từ khóa!");
      setSearchState({ results: [], targetPage: null });
    } else {
      setSearchState({ results, targetPage: results[0].pageNumber });
    }
  };

  if (error) return <div style={{ textAlign: "center", color: "red" }}>{error}</div>;
  if (!pdf) return <p style={{ textAlign: "center" }}>Loading PDF...</p>;

  const pages = [];
  for (let i = 0; i < totalPages; i++) {
    pages.push(
      <div key={i} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
        <PDFPage pdf={pdf} pageNumber={i + 1} />
      </div>
    );
  }
  return (
    <div style={{ textAlign: "center" }}>
      <HTMLFlipBook
        width={470}
        height={500}
        size="stretch"
        showCover={true}
        startPage={0}
        onFlip={onFlip}
        className="flipbook"
        ref={bookRef}
      >
        {pages}
      </HTMLFlipBook>

      <Controls
        currentPage={currentPage}
        totalPages={totalPages}
        prevPage={prevPage}
        nextPage={nextPage}
        bookRef={bookRef}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        searchState={searchState}
        handleSearch={handleSearch}
      />
    </div>
  );
};

export default PDFBookWithControls;
