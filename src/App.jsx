import React, { useState } from 'react';
import PDFBookWithControls from './components/PDFBookWithControl';

function App() {
  const [file, setFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      // Clean up old file reference
      if (file && typeof file === 'string' && file.startsWith('blob:')) {
        URL.revokeObjectURL(file);
      }
      setFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <h1>React PDF FlipBook Demo</h1>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {file && <PDFBookWithControls file={file} />}
    </div>
  );
}

export default App;
