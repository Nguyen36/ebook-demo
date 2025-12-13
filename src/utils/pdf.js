import * as pdfjsLib from 'pdfjs-dist';

// ✅ worker local, KHÔNG qua Babel, KHÔNG dynamic import
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default pdfjsLib;
