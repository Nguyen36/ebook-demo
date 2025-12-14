// import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
// import HTMLFlipBook from 'react-pageflip';
// import PDFPage from './PDFPage';
// import pdfjsLib from '../utils/pdf';

// const PDFBook = forwardRef(({ file, onTotalPages, onPageChange, pageNum }, ref) => {
//   const [pdf, setPdf] = useState(null);
//   const [totalPages, setTotalPages] = useState(0);
//   const [bookReady, setBookReady] = useState(false);
//   const bookRef = useRef(null);

//   useEffect(() => {
//     if (!file) return;

//     const loadPdf = async () => {
//       const url = URL.createObjectURL(file);
//       const pdfDoc = await pdfjsLib.getDocument(url).promise;
//       setPdf(pdfDoc);
//       setTotalPages(pdfDoc.numPages);
//       onTotalPages?.(pdfDoc.numPages);
//     };

//     loadPdf();

//     return () => file && URL.revokeObjectURL(file);
//   }, [file, onTotalPages]);

//   // expose method flipTo cho parent
// // expose flip method cho parent
// useImperativeHandle(ref, () => ({
//   flipTo: (pageIndex) => {
//     if (
//       bookRef.current &&
//       bookRef.current.pageFlip &&
//       typeof bookRef.current.pageFlip.flip === 'function'
//     ) {
//       bookRef.current.pageFlip.flip(pageIndex);
//     }
//   }
// }));


//   if (!pdf) return <p style={{ textAlign: 'center' }}>Loading PDF...</p>;

//   return (
//     <HTMLFlipBook
//       width={600}
//       height={800}
//       ref={bookRef}
//       showCover
//       size="stretch"
//       onInit={() => setBookReady(true)}
//       onFlip={(e) => {
//         const index = e.data; // zero-based
//         onPageChange?.(index + 1); // thông báo cho parent
//       }}
//       startPage={pageNum - 1} // sync với parent
//     >
//       {Array.from({ length: totalPages }, (_, i) => (
//         <div key={i} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
//           <PDFPage pdf={pdf} pageNumber={i + 1} />
//         </div>
//       ))}
//     </HTMLFlipBook>
//   );
// });

// export default PDFBook;
