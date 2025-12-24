import React, { useState } from "react";
import PDFBookWithControls from "./components/PDFBookWithControl";
import WordBookWithControls from "./components/WordBookWithControls";
import Snowfall from "react-snowfall";
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
    <div
      style={{
        textAlign: "center",
        minHeight: "100vh",
        backgroundImage: "url('https://images.careerviet.vn/content/images/hinh-nen-Noel-CareerBuilder-51.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        transition: "background-image 0.3s ease",

      }}
    >
      <div
        style={{
          color: "white",
          backgroundColor: "rgba(0,0,0,0.45)",
          padding: "32px 40px",
          borderRadius: "14px" 
        }}
      >
        <h1>Ebook</h1>

        <input
          type="file"
          accept=".pdf,.docx"
          onChange={handleFileChange}
        />
   <Snowfall
      color="white"
      snowflakeCount={200}
      style={{ position: "absolute", width: "100%", height: "100%", zIndex: 1000, pointerEvents: "none" }}
    />

        <div style={{ marginTop: 20 }}>
          {file && fileType === "pdf" && (
            <PDFBookWithControls file={file} />
          )}
          {file && fileType === "word" && (
            <WordBookWithControls file={file} />
          )}
        </div>
      </div>

    </div>
  );
};

export default EbookViewer;
