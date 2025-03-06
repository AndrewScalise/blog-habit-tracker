// Enhanced custom hook for processing markdown content
import { useState, useEffect } from "react";
import {
  processMarkdown,
  extractFrontmatter,
  generateTableOfContents,
  generateExcerpt,
} from "../utils/mdParser";

/**
 * Custom hook for processing markdown with advanced features
 *
 * @param {string} markdownText - Raw markdown text
 * @param {Object} options - Configuration options
 * @param {boolean} options.extractMeta - Whether to extract frontmatter
 * @param {boolean} options.generateToc - Whether to generate table of contents
 * @param {boolean} options.generateExcerpt - Whether to generate an excerpt
 * @param {number} options.excerptLength - Maximum length of excerpt
 * @returns {Object} - Processed markdown data
 */
export function useMarkdown(markdownText, options = {}) {
  const {
    extractMeta = false,
    generateToc = false,
    generateExcerpt: shouldGenerateExcerpt = false,
    excerptLength = 150,
  } = options;

  const [markdownData, setMarkdownData] = useState({
    html: "",
    metadata: {},
    toc: [],
    excerpt: "",
    isProcessing: true,
  });

  useEffect(() => {
    if (!markdownText) {
      setMarkdownData({
        html: "",
        metadata: {},
        toc: [],
        excerpt: "",
        isProcessing: false,
      });
      return;
    }

    // Process the markdown in the next event loop tick
    // This prevents blocking the UI for large documents
    const timerId = setTimeout(() => {
      let content = markdownText;
      let metadata = {};

      // Extract frontmatter if requested
      if (extractMeta) {
        const extracted = extractFrontmatter(markdownText);
        content = extracted.content;
        metadata = extracted.metadata;
      }

      // Generate table of contents if requested
      const toc = generateToc ? generateTableOfContents(content) : [];

      // Generate excerpt if requested
      const excerpt = shouldGenerateExcerpt
        ? generateExcerpt(content, excerptLength)
        : "";

      // Process markdown to HTML
      const html = processMarkdown(content);

      setMarkdownData({
        html,
        metadata,
        toc,
        excerpt,
        isProcessing: false,
      });
    }, 0);

    // Clean up timer on unmount or when markdownText changes
    return () => clearTimeout(timerId);
  }, [
    markdownText,
    extractMeta,
    generateToc,
    shouldGenerateExcerpt,
    excerptLength,
  ]);

  return markdownData;
}
