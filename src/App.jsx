import React, { useState } from "react";
import PDFBookWithControls from "./components/PDFBookWithControl";
import WordBookWithControls from "./components/WordBookWithControls";

const EbookViewer = () => {
  const [file, setFile] = useState(null);
  const [fileType, setFileType] = useState(null); // "pdf" | "word"

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Xác định loại file
    const ext = selectedFile.name.split(".").pop().toLowerCase();
    if (ext === "pdf") setFileType("pdf");
    else if (ext === "docx") setFileType("word");
    else {
      alert("Chỉ hỗ trợ PDF hoặc DOCX");
      setFile(null);
      setFileType(null);
    }
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h1>Ebook Viewer</h1>
      <input type="file" accept=".pdf,.docx" onChange={handleFileChange} />
      
      <div style={{ marginTop: 20 }}>
        {file && fileType === "pdf" && (
          <PDFBookWithControls file={file} />
        )}
        {file && fileType === "word" && (
          <WordBookWithControls file={file} />
        )}
      </div>
    </div>
  );
};

export default EbookViewer;
