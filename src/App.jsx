import React, { useState, useRef } from 'react';
import PDFBookWithControls from './components/PDFBookWithControl';

function App() {
  const [file, setFile] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const bookRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setCurrentPage(1); // reset page
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>React PDF FlipBook Demo</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && (
        <PDFBookWithControls
          ref={bookRef}
          file={file}
          pageNum={currentPage}          // trang hiện tại
          onPageChange={setCurrentPage}  // nhận thông báo khi user flip
          onTotalPages={setTotalPages}   // nhận tổng số trang
        />
      )}
    </div>
  );
}

export default App;
