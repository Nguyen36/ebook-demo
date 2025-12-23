// WordBookWithControls.jsx
import React, { useEffect, useState, useRef, useCallback } from "react";
import HTMLFlipBook from "react-pageflip";
import mammoth from "mammoth";

// Kích thước 1 trang
const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 800;

const WordBookWithControls = ({ file }) => {
  const [pages, setPages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchState, setSearchState] = useState({ results: [], targetPage: null });
  const bookRef = useRef(null);

  // Load file Word
  useEffect(() => {
    if (!file) return;

    const loadWord = async () => {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const { value: html } = await mammoth.convertToHtml({ arrayBuffer });
        const doc = new DOMParser().parseFromString(html, 'text/html');

        // Tìm tất cả các thẻ <img> trong tài liệu HTML
        const images = doc.querySelectorAll('img');

        // Duyệt qua tất cả các ảnh và thêm CSS để scale ảnh
        images.forEach(img => {
          img.style.maxWidth = '100%';
          img.style.height = 'auto';
          img.style.display = 'block'; // Đảm bảo ảnh không bị lỗi canh lề
          img.style.margin = '0 auto'; // Nếu muốn canh giữa ảnh

          // Đảm bảo phần tử cha của ảnh có thể chứa ảnh
          let parent = img.parentElement;
          if (parent) {
            parent.style.width = '100%';
            parent.style.overflow = 'hidden'; // Đảm bảo không bị tràn ra ngoài
          }
        });
        // Lấy lại HTML đã được cập nhật
        const updatedHtml = doc.documentElement.outerHTML;
        const splitPages = splitHtmlToPages(updatedHtml, PAGE_WIDTH, PAGE_HEIGHT);
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

  const nextPage = () => bookRef.current?.pageFlip().flipNext();
  const prevPage = () => bookRef.current?.pageFlip().flipPrev();

  // Search từ khóa
  const handleSearch = useCallback(
    (keyword) => {
      if (!keyword.trim() || pages.length === 0) {
        setSearchState({ results: [], targetPage: null });
        return;
      }

      const results = [];
      pages.forEach((html, index) => {
        const text = html.replace(/<[^>]+>/g, ""); // loại bỏ thẻ HTML
        const lowerText = text.toLowerCase();
        const lowerKeyword = keyword.toLowerCase();

        if (lowerText.includes(lowerKeyword)) {
          const keywordIndex = lowerText.indexOf(lowerKeyword);
          const start = Math.max(0, keywordIndex - 40);
          const end = Math.min(text.length, keywordIndex + keyword.length + 40);
          const preview = (start > 0 ? "..." : "") + text.substring(start, end) + (end < text.length ? "..." : "");

          results.push({
            pageNumber: index + 1,
            preview,
          });
        }
      });

      if (results.length === 0) {
        alert("Không tìm thấy từ khóa!");
        setSearchState({ results: [], targetPage: null });
      } else {
        setSearchState({ results, targetPage: results[0].pageNumber });
      }
    },
    [pages]
  );

  // Flip đến page tìm thấy
  useEffect(() => {
    if (searchState.targetPage && bookRef.current) {
      bookRef.current.pageFlip().flip(searchState.targetPage - 1);
    }
  }, [searchState.targetPage]);

  if (!file) return <p>Chọn file Word (.docx) để xem</p>;
  if (pages.length === 0) return <p>Đang load Word...</p>;

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

      <Controls
        currentPage={currentPage}
        totalPages={pages.length}
        prevPage={prevPage}
        nextPage={nextPage}
        bookRef={bookRef}
        searchKeyword={searchKeyword}
        setSearchKeyword={setSearchKeyword}
        searchState={searchState}
        handleSearch={handleSearch}
      />
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
        background: "white",
        color: "black",
      }}
    />
  );
};

// Controls component
const Controls = ({
  currentPage,
  totalPages,
  prevPage,
  nextPage,
  bookRef,
  searchKeyword,
  setSearchKeyword,
  searchState = { results: [], targetPage: null },
  handleSearch,
}) => {
  const [inputValue, setInputValue] = useState(currentPage);
  const [searchValue, setSearchValue] = useState(searchKeyword);

  useEffect(() => setInputValue(currentPage), [currentPage]);

  const handleInputChange = (e) => setInputValue(e.target.value);

  const handleGo = (e) => {
    e.preventDefault();
    const pageNumber = Number(inputValue);
    if (pageNumber > 0 && pageNumber <= totalPages) {
      bookRef.current?.pageFlip().flip(pageNumber - 1);
    }
  };

  const handleSearchInputChange = (e) => setSearchValue(e.target.value);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(searchValue);
    handleSearch(searchValue);
  };

  return (
    <div style={{ marginTop: 10 }}>
      <span>
        Page {currentPage} / {totalPages}
      </span>

      <div style={{ marginTop: "20px" }}>
        <button onClick={prevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <form style={{ display: "inline-block", margin: "0 10px" }} onSubmit={handleGo}>
          <input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            min="1"
            max={totalPages}
            style={{ width: 50, textAlign: "center" }}
          />
          <button type="submit">Go</button>
        </form>
        <button onClick={nextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div style={{ marginTop: 10 }}>
        <form onSubmit={handleSearchSubmit}>
          <input
            type="text"
            placeholder="Tìm từ khóa..."
            value={searchValue}
            onChange={handleSearchInputChange}
            style={{ width: 200, marginRight: 5 }}
          />
          <button type="submit">Search</button>
        </form>

        {searchState?.results?.length > 0 && (
          <div style={{ marginTop: 5, maxHeight: 200, overflowY: "auto" }}>
            <p>Kết quả: {searchState.results.length}</p>
            {searchState.results.map((res, idx) => (
              <div key={idx}>
                <button
                  style={{
                    backgroundColor: currentPage === res.pageNumber ? "yellow" : "white",
                    marginBottom: 2,
                    padding: "5px 10px",
                    cursor: "pointer",
                    width: "100%",
                    textAlign: "left",
                    border: "1px solid #ccc",
                  }}
                  onClick={() => bookRef.current?.pageFlip().flip(res.pageNumber - 1)}
                >
                  <div style={{ fontWeight: "bold" }}>Trang {res.pageNumber}</div>
                  <div style={{ fontSize: "12px", color: "#666" }}>{res.preview}</div>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
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

    const tmpDiv = document.createElement("div");
    tmpDiv.style.position = "absolute";
    tmpDiv.style.visibility = "hidden";
    tmpDiv.style.width = pageWidth + "px";
    tmpDiv.appendChild(clone.cloneNode(true));
    document.body.appendChild(tmpDiv);
    const nodeHeight = tmpDiv.offsetHeight;
    document.body.removeChild(tmpDiv);

    if (currentHeight + nodeHeight > pageHeight) {
      pages.push(page.innerHTML);
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

function createPage(pageHeight) {
  const div = document.createElement("div");
  div.style.height = pageHeight + "px";
  div.style.boxSizing = "border-box";
  div.style.padding = "20px";
  div.style.overflow = "hidden";
  div.style.background = "white";
  return div;
}
