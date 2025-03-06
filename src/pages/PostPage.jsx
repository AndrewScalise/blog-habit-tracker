// Page component for displaying a single blog post

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PostContent from "../components/blog/PostContent";
import { enhancedPostService } from "../data/enhancedPostService";
import { useDataRefresh } from "../hooks/useLifecycle";

/**
 * PostPage Component
 *
 * This component serves as a dedicated clearing in our forest ecosystem
 * where visitors can deeply engage with a single knowledge artifact (blog post).
 *
 * Just as a forest clearing creates focused attention on specific features
 * (like a remarkable tree or flowering plant), this page creates focus on
 * a single piece of content while maintaining connection to the broader ecosystem.
 *
 * Core responsibilities:
 * 1. Retrieve the specific post data from the data layer
 * 2. Present the content in an optimal reading environment
 * 3. Handle various states (loading, error, content display)
 * 4. Provide navigation pathways back to the broader ecosystem
 */
const PostPage = () => {
  // Get the post ID from URL parameters (like identifying a specific tree by its unique features)
  const { id } = useParams();

  // Navigation function for redirects (like forest pathfinding)
  const navigate = useNavigate();

  // State management (like observing and adapting to local conditions)
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use our custom hook to refresh when data changes
  const refreshData = useDataRefresh("posts");

  // Fetch post data when component mounts or data refreshes
  useEffect(() => {
    const fetchPost = async () => {
      if (!id) {
        setError("No post ID provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Fetch the post by ID from our data service
        const postData = await enhancedPostService.getPostById(id);

        if (!postData) {
          setError("Post not found");
          setPost(null);
        } else {
          setPost(postData);
          setError(null);

          // Optional: Track post view
          // analytics.trackEvent('post_view', { id, title: postData.title });
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        setError(`Failed to load post: ${err.message}`);
        setPost(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [id, refreshData]); // Re-fetch when ID changes or data refreshes

  // Handle navigation back to blog listing
  const handleBackClick = () => {
    navigate("/blog");
  };

  return (
    <Layout>
      {/* Main content area with state-based rendering */}
      <div className="post-page">
        {isLoading ? (
          // Loading state - like watching a plant gradually reveal itself
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading content...</p>
          </div>
        ) : error ? (
          // Error state - like finding a clearing but not the expected plant
          <div className="error-state">
            <h2>Something went wrong</h2>
            <p>{error}</p>
            <button onClick={handleBackClick} className="back-button">
              Return to Blog
            </button>
          </div>
        ) : post ? (
          // Content state - like discovering and observing the plant
          <PostContent post={post} />
        ) : (
          // Empty state - safety fallback for unexpected conditions
          <div className="empty-state">
            <h2>Post not found</h2>
            <p>The content you're looking for doesn't seem to exist.</p>
            <button onClick={handleBackClick} className="back-button">
              Explore Other Posts
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default PostPage;
