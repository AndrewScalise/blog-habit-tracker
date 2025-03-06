// Enhanced Markdown parser with code syntax highlighting and other features
import { marked } from "marked";
import DOMPurify from "dompurify"; // You'll need to install this

/**
 * This utility enhances the marked library with additional features:
 * 1. Syntax highlighting for code blocks
 * 2. HTML sanitization to prevent XSS attacks
 * 3. Auto-linking of URLs
 * 4. Support for task lists
 */

// Configure marked options
marked.setOptions({
  gfm: true, // GitHub Flavored Markdown
  breaks: true, // Convert line breaks to <br>
  headerIds: true, // Add IDs to headers for linking
  sanitize: false, // We'll use DOMPurify instead for better control
  smartLists: true, // Use smarter list behavior than the original
  smartypants: true, // Use "smart" typographic punctuation
  xhtml: false, // Self-close HTML tags
  highlight: function (code, lang) {
    // Simple syntax highlighting with CSS classes
    // In a production app, you might use a library like Prism or highlight.js
    return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`;
  },
});

// Custom renderer to support additional features
const renderer = new marked.Renderer();

// Custom rendering for task lists
renderer.listitem = function (text, task, checked) {
  if (task) {
    return `<li class="task-list-item">
      <input type="checkbox" ${checked ? "checked" : ""} disabled />
      ${text}
    </li>`;
  }
  return `<li>${text}</li>`;
};

// Custom link renderer to add target="_blank" to external links
renderer.link = function (href, title, text) {
  const isExternal = href && !href.startsWith("/") && !href.startsWith("#");
  const attributes = isExternal
    ? 'target="_blank" rel="noopener noreferrer"'
    : "";

  title = title ? ` title="${title}"` : "";

  return `<a href="${href}"${title} ${attributes}>${text}</a>`;
};

// Custom image renderer to add responsive classes
renderer.image = function (href, title, text) {
  title = title ? ` title="${title}"` : "";

  return `<img src="${href}" alt="${text}"${title} class="responsive-image" loading="lazy" />`;
};

// Apply the custom renderer
marked.use({ renderer });

/**
 * Process markdown text into sanitized HTML
 *
 * @param {string} markdown - Raw markdown text
 * @returns {string} - Sanitized HTML
 */
export const processMarkdown = (markdown) => {
  if (!markdown) return "";

  // Convert markdown to HTML
  const rawHtml = marked(markdown);

  // Sanitize HTML to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    USE_PROFILES: { html: true },
    ADD_ATTR: ["target", "loading"], // Allow target="_blank" and loading="lazy"
    ADD_CLASS: { "*": ["responsive-*"] }, // Allow responsive classes
  });

  return sanitizedHtml;
};

/**
 * Extract metadata from a markdown document with frontmatter
 * Supports YAML-style frontmatter between --- markers
 *
 * @param {string} markdown - Markdown text with potential frontmatter
 * @returns {Object} - { content, metadata }
 */
export const extractFrontmatter = (markdown) => {
  if (!markdown) {
    return { content: "", metadata: {} };
  }

  // Check for frontmatter
  const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
  const match = markdown.match(frontmatterRegex);

  if (!match) {
    return { content: markdown, metadata: {} };
  }

  // Extract frontmatter and content
  const [, frontmatter, content] = match;

  // Parse frontmatter
  const metadata = {};
  const lines = frontmatter.split("\n");

  lines.forEach((line) => {
    const colonIndex = line.indexOf(":");
    if (colonIndex !== -1) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      // Remove quotes if they exist
      metadata[key] = value.replace(/^["'](.*)["']$/, "$1");
    }
  });

  return { content, metadata };
};

/**
 * Generate a table of contents from markdown headings
 *
 * @param {string} markdown - Markdown text
 * @returns {Array} - Array of TOC items with { level, text, id, children }
 */
export const generateTableOfContents = (markdown) => {
  if (!markdown) return [];

  // Extract headings using regex
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings = [];
  let match;

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special chars
      .replace(/\s+/g, "-"); // Replace spaces with hyphens

    headings.push({ level, text, id });
  }

  // Convert flat list to nested structure
  const toc = [];
  const lastByLevel = {};

  headings.forEach((heading) => {
    // Create TOC item
    const item = { ...heading, children: [] };

    if (heading.level === 1) {
      // Top level heading
      toc.push(item);
      lastByLevel[1] = item;
    } else {
      // Find the nearest parent
      let parentLevel = heading.level - 1;
      while (parentLevel > 0 && !lastByLevel[parentLevel]) {
        parentLevel--;
      }

      if (parentLevel === 0) {
        // No parent found, add to root
        toc.push(item);
      } else {
        // Add as child to parent
        lastByLevel[parentLevel].children.push(item);
      }
    }

    lastByLevel[heading.level] = item;

    // Clear any lower levels
    for (let i = heading.level + 1; i <= 6; i++) {
      delete lastByLevel[i];
    }
  });

  return toc;
};

/**
 * Generate an excerpt from markdown content
 *
 * @param {string} markdown - Markdown text
 * @param {number} length - Maximum length of excerpt
 * @returns {string} - Plain text excerpt
 */
export const generateExcerpt = (markdown, length = 150) => {
  if (!markdown) return "";

  // Extract content without frontmatter
  const { content } = extractFrontmatter(markdown);

  // Convert to plain text by removing all markdown syntax
  let plainText = content
    .replace(/#+\s+(.*)/g, "$1") // Remove headings
    .replace(/\*\*(.*)\*\*/g, "$1") // Remove bold
    .replace(/\*(.*)\*/g, "$1") // Remove italic
    .replace(/\[(.*?)\]\(.*?\)/g, "$1") // Remove links
    .replace(/!\[(.*?)\]\(.*?\)/g, "") // Remove images
    .replace(/```[\s\S]*?```/g, "") // Remove code blocks
    .replace(/`(.*?)`/g, "$1") // Remove inline code
    .replace(/\n/g, " ") // Replace newlines with spaces
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .trim();

  // Truncate to specified length
  if (plainText.length > length) {
    plainText = plainText.substring(0, length).trim() + "...";
  }

  return plainText;
};
