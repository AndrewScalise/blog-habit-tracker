// Preview card for blog content

import React from "react";
import { Link } from "react-router-dom";
import { formatDate, getRelativeTimeString } from "../../utils/dateFormatter";

/**
 * PostCard Component
 *
 * This component serves as a preview card for blog posts, similar to how
 * a seed packet contains a condensed preview of what might grow from it.
 *
 * PostCard's responsibilities include:
 * 1. Presenting a compact, enticing summary of a blog post
 * 2. Providing visual cues about the post's content and age
 * 3. Creating navigation pathways to the full content
 *
 * The component follows the "information density gradient" pattern,
 * prioritizing different information at different prominence levels.
 *
 * @param {Object} props Component props
 * @param {Object} props.post The post data object
 * @param {boolean} props.compact Whether to display in compact mode
 */
const PostCard = ({ post, compact = false }) => {
  // Destructure post data with fallbacks for potentially missing fields
  const {
    id,
    title = "Untitled Post",
    excerpt = "",
    date,
    coverImage,
    updatedAt,
    metadata = {},
  } = post || {};

  // Use formatted or relative time based on age
  const postDate = date ? new Date(date) : null;
  const now = new Date();
  const isRecent = postDate && now - postDate < 1000 * 60 * 60 * 24 * 7; // 7 days

  const displayDate = postDate
    ? isRecent
      ? getRelativeTimeString(date)
      : formatDate(date)
    : "Unknown date";

  // Check for updated content (like a plant that has gone through changes)
  const wasUpdated = updatedAt && date !== updatedAt;

  // Extract category and tags from metadata if available
  const { category, tags } = metadata;

  return (
    <article className={`post-card ${compact ? "post-card-compact" : ""}`}>
      {/* Post image (like a plant's visual characteristics) */}
      {coverImage && !compact && (
        <Link to={`/blog/${id}`} className="post-card-image-link">
          <div
            className="post-card-image"
            style={{ backgroundImage: `url(${coverImage})` }}
            aria-hidden="true"
          />
        </Link>
      )}

      <div className="post-card-content">
        {/* Category indicator (like plant classification) */}
        {category && <div className="post-card-category">{category}</div>}

        {/* Title (like the plant's primary identifier) */}
        <h2 className="post-card-title">
          <Link to={`/blog/${id}`}>{title}</Link>
        </h2>

        {/* Date and status (like growth timeline) */}
        <div className="post-card-meta">
          <time dateTime={postDate?.toISOString()}>{displayDate}</time>
          {wasUpdated && (
            <span
              className="updated-indicator"
              title={`Updated: ${formatDate(updatedAt)}`}
            >
              (updated)
            </span>
          )}
        </div>

        {/* Excerpt (like a brief taste of the fruit) */}
        {!compact && excerpt && <p className="post-card-excerpt">{excerpt}</p>}

        {/* Tags (like ecological relationships) */}
        {!compact && tags && (
          <div className="post-card-tags">
            {tags.split(",").map((tag) => (
              <span key={tag.trim()} className="post-tag">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Call to action (like an invitation to visit) */}
        {!compact && (
          <Link to={`/blog/${id}`} className="read-more">
            Read more →
          </Link>
        )}
      </div>
    </article>
  );
};

export default PostCard;
