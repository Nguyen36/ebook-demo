import React from "react";
import ReactDOM from "react-dom/client"; // sử dụng react-dom/client cho React 18
import { BrowserRouter } from "react-router-dom"; // import BrowserRouter từ react-router-dom
import App from "./App"; // Giả sử App.js là nơi chứa EbookViewer

const rootElement = document.getElementById("root");
const root = ReactDOM.createRoot(rootElement); // Tạo root mới

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
