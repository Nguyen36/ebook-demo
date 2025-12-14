import * as pdfjsLib from 'pdfjs-dist';

// ✅ worker local, KHÔNG qua Babel, KHÔNG dynamic import
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Suppress TrueType font warnings
const originalWarn = console.warn;
console.warn = function(...args) {
  if (args[0] && typeof args[0] === 'string' && args[0].includes('TT: undefined function')) {
    return; // Suppress TT warnings
  }
  originalWarn.apply(console, args);
};

/**
 * Process PDF file and extract text + render images for all pages
 * @param {ArrayBuffer} arrayBuffer - PDF file as ArrayBuffer
 * @returns {Promise<{texts: string[], images: string[], numPages: number}>}
 */
export const processPDF = async (file) => {
  try {
    // Load PDF document with configuration to handle font issues
    const loadingTask = pdfjsLib.getDocument({
      data: await file.arrayBuffer(),
      verbosity: 0, // Suppress warnings (0 = ERRORS only)
      standardFontDataUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/standard_fonts/',
    });
    const pdf = await loadingTask.promise;

    const numPages = pdf.numPages;
    const texts = [];

    // Process each page
    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      let page = null;
      try {
        page = await pdf.getPage(pageNum);

        // Extract text content
        const textContent = await page.getTextContent();
        // standardize spaces and line breaks
        const pageText = textContent.items.map(item => item.str)
                                          .join(' ')
                                          .replace(/\s+/g, ' ')
                                          .toLowerCase()
                                          .trim();
        texts.push(pageText);
      } finally {
        // Clean up page immediately after extracting text
        if (page) {
          page.cleanup();
          page = null;
        }
      }
    }

    return { pdf, texts };
  } catch (error) {
    console.error('Error processing PDF:', error);
    throw error;
  }
};

export default pdfjsLib;
