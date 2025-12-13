import React, { useEffect, useRef, useState } from 'react';

const PDFPage = ({ pdf, pageNumber, scale = 1.5 }) => {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!pdf) return;

    const renderPage = async () => {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      if (!canvas) return;
      const context = canvas.getContext('2d');

      // set đúng kích thước canvas
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // cancel render cũ nếu còn
      if (renderTaskRef.current) renderTaskRef.current.cancel();

      renderTaskRef.current = page.render({
        canvasContext: context,
        viewport,
      });

      try {
        await renderTaskRef.current.promise;
        setLoaded(true);
      } catch (e) {
        if (e.name !== 'RenderingCancelledException') console.error(e);
      }
    };

    renderPage();

    return () => {
      if (renderTaskRef.current) renderTaskRef.current.cancel();
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
