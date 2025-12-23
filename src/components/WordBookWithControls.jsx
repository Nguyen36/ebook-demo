// WordBookWithControls.jsx
import React, { useEffect, useState, useRef } from "react";
import HTMLFlipBook from "react-pageflip";
import mammoth from "mammoth";

// Kích thước 1 trang
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;

const WordBookWithControls = ({ file }) => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const bookRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const loadWord = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        const splitPages = splitHtmlToPages(html, PAGE_WIDTH, PAGE_HEIGHT);
        setPages(splitPages);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading Word file:", err);
        setPages([]);
      }
    };

    loadWord();
  }, [file]);

  const onFlip = (e) => setCurrentPage(e.data + 1);

  if (!file) return <p>Chọn file Word (.docx) để xem</p>;
  if (pages.length === 0) return <p>Đang load Word...</p>;

  const nextPage = () => bookRef.current.pageFlip().flipNext();
  const prevPage = () => bookRef.current.pageFlip().flipPrev();

  return (
    <div style={{ textAlign: "center" }}>
      <HTMLFlipBook
        width={PAGE_WIDTH}
        height={PAGE_HEIGHT}
        ref={bookRef}
        onFlip={onFlip}
        showCover
      >
        {pages.map((html, idx) => (
          <div key={idx}>
            <WordPage html={html} />
          </div>
        ))}
      </HTMLFlipBook>

      <div style={{ marginTop: 10 }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: "0 10px" }}>
          Page {currentPage} / {pages.length}
        </span>
        <button onClick={nextPage} disabled={currentPage === pages.length}>
          Next
        </button>
      </div>
    </div>
  );
};

export default WordBookWithControls;

// Component hiển thị 1 page
const WordPage = ({ html }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, [html]);

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: "100%",
        padding: 20,
        boxSizing: "border-box",
        overflow: "hidden",
        background: "white"
      }}
    />
  );
};

// Hàm chia HTML Word thành nhiều page
function splitHtmlToPages(html, pageWidth, pageHeight) {
  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.width = pageWidth + "px";
  container.style.position = "absolute";
  container.style.left = "-9999px";
  document.body.appendChild(container);

  const pages = [];
  let page = createPage(pageHeight);
  let currentHeight = 0;

  Array.from(container.children).forEach((node) => {
    const clone = node.cloneNode(true);

    // Tạm đo chiều cao node
    const tmpDiv = document.createElement("div");
    tmpDiv.style.position = "absolute";
    tmpDiv.style.visibility = "hidden";
    tmpDiv.style.width = pageWidth + "px";
    tmpDiv.appendChild(clone.cloneNode(true));
    document.body.appendChild(tmpDiv);
    const nodeHeight = tmpDiv.offsetHeight;
    document.body.removeChild(tmpDiv);

    if (currentHeight + nodeHeight > pageHeight) {
      // Push page hiện tại
      pages.push(page.innerHTML);

      // Tạo page mới
      page = createPage(pageHeight);
      page.appendChild(clone.cloneNode(true));
      currentHeight = nodeHeight;
    } else {
      page.appendChild(clone);
      currentHeight += nodeHeight;
    }
  });

  if (page.innerHTML.trim()) pages.push(page.innerHTML);
  document.body.removeChild(container);

  return pages;
}

// Tạo 1 page mới
function createPage(pageHeight) {
  const div = document.createElement("div");
  div.style.height = pageHeight + "px";
  div.style.boxSizing = "border-box";
  div.style.padding = "20px";
  div.style.overflow = "hidden";
  div.style.background = "white";
  return div;
}
