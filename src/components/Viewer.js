import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source for PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `./pdf.worker.js`;

const Viewer = ({ pdfDocument, currentPage, zoomLevel, twoPageView, searchResults, highlightTerm }) => {
  const canvasRef = useRef(null);
  const textLayerRef = useRef(null);
  const [rendering, setRendering] = useState(false);
  const [textItems, setTextItems] = useState([]);

  const renderPage = useCallback(async () => {
    if (!pdfDocument || !canvasRef.current || rendering) {
      return;
    }
    setRendering(true);

    const page = await pdfDocument.getPage(currentPage);
    const viewport = page.getViewport({ scale: zoomLevel });
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Get text content for text layer and search
    const textContent = await page.getTextContent();
    setTextItems(textContent.items);

    // Render text layer
    if (textLayerRef.current) {
      textLayerRef.current.innerHTML = ''; // Clear previous text layer
      pdfjsLib.renderTextLayer({
        textContent: textContent,
        container: textLayerRef.current,
        viewport: viewport,
        textDivs: [],
      });
    }
    setRendering(false);
  }, [pdfDocument, currentPage, zoomLevel, rendering]);

  useEffect(() => {
    renderPage();
  }, [renderPage]);

  return (
    <div className="viewer-container">
      <div className="pdf-page-container">
        <canvas ref={canvasRef} className="pdf-canvas"></canvas>
        <div ref={textLayerRef} className="pdf-text-layer"></div>
      </div>
    </div>
  );
};

export default Viewer;
