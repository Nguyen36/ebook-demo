import React, { useEffect, useRef, useState } from 'react';

const PDFPage = ({ pdf, pageNumber, scale = 1.5 }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pdf) return;

    let pageRef = null;
    let isCancelled = false;

    const renderPage = async () => {
      try {
        pageRef = await pdf.getPage(pageNumber);
        if (isCancelled) {
          pageRef.cleanup();
          return;
        }
        
        const viewport = pageRef.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas || isCancelled) return;
        const context = canvas.getContext('2d', { willReadFrequently: false });

        // Clear canvas before rendering
        context.clearRect(0, 0, canvas.width, canvas.height);

        // set đúng kích thước canvas
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        // cancel render cũ nếu còn
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }

        renderTaskRef.current = pageRef.render({
          canvasContext: context,
          viewport,
        });

        await renderTaskRef.current.promise;
        if (!isCancelled) {
          setLoaded(true);
        }
      } catch (e) {
        if (e.name !== 'RenderingCancelledException' && !isCancelled) {
          console.error(e);
        }
      }
    };

    renderPage();

    return () => {
      isCancelled = true;
      
      // Cancel render task
      if (renderTaskRef.current) {
        try {
          renderTaskRef.current.cancel();
        } catch (e) {
          // Ignore errors during cancellation
        }
        renderTaskRef.current = null;
      }
      
      // Clean up page resources
      if (pageRef) {
        try {
          pageRef.cleanup();
        } catch (e) {
          // Ignore errors during cleanup
        }
        pageRef = null;
      }
      
      // Clear and reset canvas completely
      const canvas = canvasRef.current;
      if (canvas) {
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        // Reset canvas size to free memory
        canvas.width = 0;
        canvas.height = 0;
      }
    };
  }, [pdf, pageNumber, scale]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
      {!loaded && <p style={{ textAlign: 'center', marginTop: '50%' }}>Loading page {pageNumber}...</p>}
    </div>
  );
};

export default PDFPage;










