// Full content display component for blog posts

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { formatDate } from "../../utils/dateFormatter";
import { useMarkdown } from "../../hooks/useMarkdown";
import { useDataRefresh } from "../../hooks/useLifecycle";

/**
 * PostContent Component
 *
 * This component displays the full content of a blog post, similar to how
 * a mature plant displays its complete structure, characteristics, and beauty.
 *
 * PostContent's responsibilities include:
 * 1. Converting markdown content to formatted HTML
 * 2. Presenting the post with proper typography and layout
 * 3. Providing contextual metadata and navigation options
 * 4. Creating an optimal reading experience
 *
 * The component follows the "progressive disclosure" pattern,
 * building the reading experience from title to content to related materials.
 *
 * @param {Object} props Component props
 * @param {Object} props.post The post data object
 */
const PostContent = ({ post }) => {
  // Get refresh trigger from lifecycle hook
  const refreshPost = useDataRefresh("posts");

  // Track reading progress (like tracing a path through the plant)
  const [readingProgress, setReadingProgress] = useState(0);

  // Track if table of contents is visible
  const [tocVisible, setTocVisible] = useState(false);

  // Set up scroll tracking for reading progress
  useEffect(() => {
    const updateReadingProgress = () => {
      const scrollPosition = window.scrollY;
      const articleElement = document.querySelector(".post-body");

      if (articleElement) {
        const { top, height } = articleElement.getBoundingClientRect();
        const startPosition = window.scrollY + top;
        const endPosition = startPosition + height - window.innerHeight;
        const progress = Math.min(
          100,
          Math.max(
            0,
            ((scrollPosition - startPosition) / (endPosition - startPosition)) *
              100
          )
        );

        setReadingProgress(progress);
      }
    };

    window.addEventListener("scroll", updateReadingProgress);
    return () => window.removeEventListener("scroll", updateReadingProgress);
  }, [post]);

  // Destructure post data with fallbacks for potentially missing fields
  const {
    title = "Untitled Post",
    content = "",
    date,
    updatedAt,
    coverImage,
  } = post || {};

  // Process markdown content with our custom hook
  const { html, metadata, toc } = useMarkdown(content, {
    extractMeta: true,
    generateToc: true,
  });

  // Calculate estimated reading time (like estimating the time to explore a plant)
  const estimateReadingTime = (text) => {
    const wordsPerMinute = 200; // Average reading speed
    const wordCount = text.trim().split(/\s+/).length;
    return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
  };

  const readingTime = estimateReadingTime(content);

  // Extract metadata from frontmatter or use defaults
  const { author, category, tags } = metadata || {};

  // Check for updated content
  const wasUpdated = updatedAt && date !== updatedAt;

  // Toggle table of contents visibility
  const toggleToc = () => {
    setTocVisible(!tocVisible);
  };

  // Return early if no post data
  if (!post) {
    return <div className="post-content-error">Post not found</div>;
  }

  return (
    <article className="post-content">
      {/* Reading progress indicator (like watching a plant's growth) */}
      <div
        className="reading-progress-bar"
        style={{ width: `${readingProgress}%` }}
      />

      {/* Post header (like the identifying features of a plant) */}
      <header className="post-header">
        {/* Category (like plant family) */}
        {category && (
          <div className="post-category">
            <Link to={`/blog/category/${category}`}>{category}</Link>
          </div>
        )}

        {/* Title (like species name) */}
        <h1 className="post-title">{title}</h1>

        {/* Post metadata (like plant characteristics) */}
        <div className="post-meta">
          {/* Author info */}
          {author && (
            <div className="post-author">
              By <span className="author-name">{author}</span>
            </div>
          )}

          {/* Publication date */}
          <div className="post-date">
            <time dateTime={new Date(date).toISOString()}>
              {formatDate(date)}
            </time>
            {wasUpdated && (
              <span className="updated-indicator" title={formatDate(updatedAt)}>
                (Updated)
              </span>
            )}
          </div>

          {/* Reading time estimate */}
          <div className="reading-time">{readingTime} min read</div>
        </div>
      </header>

      {/* Cover image (like a plant's most visible feature) */}
      {coverImage && (
        <div className="post-cover">
          <img src={coverImage} alt={title} className="cover-image" />
        </div>
      )}

      {/* Post content container */}
      <div className="post-container">
        {/* Table of contents (like a map of the plant's structure) */}
        {toc && toc.length > 0 && (
          <aside className={`table-of-contents ${tocVisible ? "visible" : ""}`}>
            <div className="toc-header">
              <h2>Contents</h2>
              <button
                className="toc-toggle"
                onClick={toggleToc}
                aria-expanded={tocVisible}
                aria-controls="toc-list"
              >
                {tocVisible ? "Hide" : "Show"}
              </button>
            </div>

            <nav id="toc-list" className={tocVisible ? "" : "hidden"}>
              <ul className="toc-list">
                {toc.map((item, index) => (
                  <li
                    key={index}
                    className={`toc-item toc-level-${item.level}`}
                  >
                    <a href={`#${item.id}`}>{item.text}</a>
                    {item.children && item.children.length > 0 && (
                      <ul>
                        {item.children.map((child, childIndex) => (
                          <li
                            key={`${index}-${childIndex}`}
                            className={`toc-item toc-level-${child.level}`}
                          >
                            <a href={`#${child.id}`}>{child.text}</a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main body content (like the plant's full structure) */}
        <div className="post-body" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Post footer with tags (like ecological relationships) */}
      <footer className="post-footer">
        {tags && (
          <div className="post-tags">
            <h3>Tags:</h3>
            <div className="tags-container">
              {tags.split(",").map((tag) => (
                <Link
                  key={tag.trim()}
                  to={`/blog/tag/${tag.trim()}`}
                  className="post-tag"
                >
                  {tag.trim()}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Post actions */}
        <div className="post-actions">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="back-to-top"
          >
            Back to top
          </button>

          <Link to="/blog" className="back-to-blog">
            ← Back to all posts
          </Link>
        </div>
      </footer>
    </article>
  );
};

export default PostContent;
