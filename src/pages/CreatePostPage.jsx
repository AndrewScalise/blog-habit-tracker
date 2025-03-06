// Content creation environment for the digital ecosystem

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import { enhancedPostService } from "../data/enhancedPostService";
import { useMarkdown } from "../hooks/useMarkdown";

/**
 * CreatePostPage Component
 *
 * This component serves as a specialized environment for the creation of new
 * knowledge artifacts (blog posts) in our digital ecosystem.
 *
 * Like a forest clearing where new seeds germinate and grow, this page provides:
 * 1. The necessary inputs for content creation (like soil nutrients)
 * 2. A preview of how the content will appear (like visualizing growth)
 * 3. The mechanism to establish the content in the ecosystem (like rooting)
 *
 * The component implements several key patterns:
 * - Form State Management Pattern (tracks user input)
 * - Preview Synchronization Pattern (shows real-time results)
 * - Content Transformation Pattern (converts markdown to HTML)
 * - Data Persistence Pattern (saves content to storage)
 */
const CreatePostPage = () => {
  // Navigation function (for redirecting after creation)
  const navigate = useNavigate();

  // Form state management (like the seed's developing structure)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    coverImage: "",
  });

  // UI state management (like environmental conditions)
  const [showPreview, setShowPreview] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [touched, setTouched] = useState({
    title: false,
    excerpt: false,
    content: false,
  });

  // Process markdown for preview (like visualizing future growth)
  const { html, metadata } = useMarkdown(formData.content, {
    extractMeta: true,
  });

  // Handle form input changes (like adjusting to environmental factors)
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    if (!touched[name]) {
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));
    }
  };

  // Handle form submission (like the seed establishing roots)
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form data
    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.content.trim()) {
      setError("Content is required");
      return;
    }

    try {
      // Transition to submitting state
      setIsSubmitting(true);
      setError(null);

      // Create the new post using our service
      const newPost = await enhancedPostService.createPost(formData);

      // Redirect to the new post page
      if (newPost && newPost.id) {
        navigate(`/blog/${newPost.id}`);
      } else {
        throw new Error("Failed to create post - no ID returned");
      }
    } catch (err) {
      console.error("Error creating post:", err);
      setError(`Failed to create post: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  // Toggle preview mode (like alternating between examining the seed and imagining the tree)
  const togglePreview = () => {
    setShowPreview((prev) => !prev);
  };

  // Toggle markdown guide (like consulting growth instructions)
  const toggleGuide = () => {
    setShowGuide((prev) => !prev);
  };

  // Auto-generate excerpt if empty (like a seed developing its initial characteristics)
  const handleBlur = () => {
    if (!formData.excerpt && formData.content) {
      // Extract first paragraph or first 150 characters
      const excerpt = formData.content
        .split("\n\n")[0] // Get first paragraph
        .replace(/[#*`[\]()_>-]/g, "") // Remove markdown syntax
        .substring(0, 150); // Limit length

      setFormData((prev) => ({
        ...prev,
        excerpt: excerpt + (excerpt.length >= 150 ? "..." : ""),
      }));
    }
  };

  // Markdown guide component (like a field guide for forest growth)
  const MarkdownGuide = () => {
    return (
      <div className="markdown-guide">
        <h3>Markdown Guide</h3>
        <div className="guide-content">
          <div className="guide-section">
            <h4>Basic Syntax</h4>
            <ul>
              <li>
                <code># Heading 1</code>
              </li>
              <li>
                <code>## Heading 2</code>
              </li>
              <li>
                <code>**Bold**</code>
              </li>
              <li>
                <code>*Italic*</code>
              </li>
              <li>
                <code>[Link](https://example.com)</code>
              </li>
              <li>
                <code>![Image](image-url.jpg)</code>
              </li>
              <li>
                <code>- Bullet point</code>
              </li>
              <li>
                <code>1. Numbered list</code>
              </li>
              <li>
                <code>> Blockquote</code>
              </li>
              <li>
                <code>`Inline code`</code>
              </li>
            </ul>
          </div>

          <div className="guide-section">
            <h4>Extended Syntax</h4>
            <ul>
              <li>
                <code>```language Code block ```</code>
              </li>
              <li>
                <code>
                  | Table | Header | | ----- | ------ | | Cell | Cell |
                </code>
              </li>
              <li>
                <code>- [ ] Task item</code>
              </li>
              <li>
                <code>- [x] Completed item</code>
              </li>
              <li>
                <code>---</code> (Horizontal rule)
              </li>
              <li>
                <code>~~Strikethrough~~</code>
              </li>
            </ul>
          </div>

          <div className="guide-section">
            <h4>Frontmatter</h4>
            <p>Add metadata at the top of your post:</p>
            <pre>
              {`---
author: Your Name
category: Technology
tags: react, markdown, blog
---`}
            </pre>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Layout>
      <div className="create-post-container">
        <div className="create-header">
          <h1>Create New Post</h1>
          <div className="create-actions">
            <button
              type="button"
              className="toggle-guide-button"
              onClick={toggleGuide}
            >
              {showGuide ? "Hide Markdown Guide" : "Show Markdown Guide"}
            </button>
            <button
              type="button"
              className="toggle-preview-button"
              onClick={togglePreview}
            >
              {showPreview ? "Edit Mode" : "Preview Mode"}
            </button>
          </div>
        </div>

        {/* Display error message if any */}
        {error && <div className="error-message">{error}</div>}

        {/* Markdown Guide */}
        {showGuide && <MarkdownGuide />}

        <div
          className={`create-content ${
            showPreview ? "preview-mode" : "edit-mode"
          }`}
        >
          {/* Edit Form */}
          <form
            onSubmit={handleSubmit}
            className={`post-form ${showPreview ? "hidden" : ""}`}
          >
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter a compelling title"
                className={
                  touched.title && !formData.title.trim() ? "error" : ""
                }
              />
              {touched.title && !formData.title.trim() && (
                <div className="field-error">Title is required</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">
                Excerpt{" "}
                <span className="optional">(auto-generated if left empty)</span>
              </label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                placeholder="Brief description of your post (shown in previews)"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="coverImage">
                Cover Image URL <span className="optional">(optional)</span>
              </label>
              <input
                type="url"
                id="coverImage"
                name="coverImage"
                value={formData.coverImage}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Content (Markdown)</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                onBlur={handleBlur}
                required
                rows={20}
                placeholder="Write your post content here using Markdown..."
                className={`content-editor ${
                  touched.content && !formData.content.trim() ? "error" : ""
                }`}
              />
              {touched.content && !formData.content.trim() && (
                <div className="field-error">Content is required</div>
              )}
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Publishing..." : "Publish Post"}
            </button>
          </form>

          {/* Preview Mode */}
          <div className={`post-preview ${!showPreview ? "hidden" : ""}`}>
            <div className="preview-header">
              <h2>Preview</h2>
            </div>

            <article className="post-content">
              <header className="post-header">
                <h1 className="post-title">
                  {formData.title || "Untitled Post"}
                </h1>

                <div className="post-meta">
                  <span className="post-date">
                    {new Date().toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>

                  {metadata.author && (
                    <span className="post-author">By {metadata.author}</span>
                  )}

                  {metadata.category && (
                    <span className="post-category">
                      In {metadata.category}
                    </span>
                  )}

                  {metadata.tags && (
                    <div className="post-tags">
                      {metadata.tags.split(",").map((tag, index) => (
                        <span key={index} className="tag">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </header>

              {formData.coverImage && (
                <div className="post-cover">
                  <img
                    src={formData.coverImage}
                    alt={formData.title || "Post cover"}
                    className="cover-image"
                  />
                </div>
              )}

              <div
                className="post-body"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </article>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatePostPage;
