import React, { useEffect, useRef } from 'react';

const PDFPage = ({ pdf, pageNumber }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const renderPage = async () => {
      if (!pdf) return;

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1.0 });

      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      await page.render({
        canvasContext: context,
        viewport,
      }).promise;
    };

    renderPage();
  }, [pdf, pageNumber]);

  return (
    <div className="page">
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PDFPage;
