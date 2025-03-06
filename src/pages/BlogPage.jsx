// The knowledge grove in our digital forest

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PostList from "../components/blog/PostList";
import { enhancedPostService } from "../data/enhancedPostService";
import { useDataRefresh } from "../hooks/useLifecycle";

/**
 * BlogPage Component
 *
 * Acts as a specialized clearing in our forest ecosystem where:
 * 1. Knowledge artifacts (blog posts) are collected and displayed
 * 2. Users can discover and explore content through different patterns
 * 3. New content creation is encouraged
 *
 * This is like a diverse section of forest with many types of plants (posts)
 * organized in ways that invite exploration and discovery.
 */
const BlogPage = () => {
  // State management - like the soil conditions in this section of forest
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOption, setSortOption] = useState("newest");

  // Get refresh trigger from our lifecycle hook
  const refreshData = useDataRefresh("posts");

  // Fetch posts - like gathering nutrients from the soil
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const allPosts = await enhancedPostService.getPosts();
        setPosts(allPosts);
        setFilteredPosts(allPosts);
      } catch (error) {
        console.error("Error fetching blog posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [refreshData]); // Re-fetch when data changes

  // Search and filter logic - like how animals search for specific plants
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const normalized = searchTerm.toLowerCase().trim();
    const filtered = posts.filter((post) => {
      const titleMatch =
        post.title && post.title.toLowerCase().includes(normalized);
      const excerptMatch =
        post.excerpt && post.excerpt.toLowerCase().includes(normalized);
      const contentMatch =
        post.content && post.content.toLowerCase().includes(normalized);

      return titleMatch || excerptMatch || contentMatch;
    });

    setFilteredPosts(filtered);
  }, [searchTerm, posts]);

  // Sort logic - like organizing plants by different characteristics
  useEffect(() => {
    const sorted = [...filteredPosts];

    switch (sortOption) {
      case "newest":
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case "oldest":
        sorted.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case "title":
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        // Default to newest
        sorted.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilteredPosts(sorted);
  }, [sortOption, posts, searchTerm]);

  // Handle search input - like developing sensitivity to different plant traits
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle sort change - like changing how you organize foraged plants
  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  // Clear search - like resetting your search pattern to see all plants
  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <Layout>
      {/* Blog header - The canopy of this forest section */}
      <div className="blog-header">
        <div className="blog-header-content">
          <h1>Knowledge Collection</h1>
          <p>Thoughts, ideas, and discoveries from my digital ecosystem</p>
        </div>

        <Link to="/create" className="create-button">
          New Post
        </Link>
      </div>

      {/* Controls - Like tools for forest navigation */}
      <div className="blog-controls">
        <div className="search-container">
          <input
            type="text"
            placeholder="Search posts..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="clear-search"
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>

        <div className="sort-container">
          <label htmlFor="sort-select">Sort by:</label>
          <select
            id="sort-select"
            value={sortOption}
            onChange={handleSortChange}
            className="sort-select"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Main content - The plants in this forest section */}
      <div className="blog-content">
        {isLoading ? (
          <div className="loading-state">
            <div className="loading-indicator"></div>
            <p>Gathering knowledge artifacts...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <>
            {/* Post count - Like a species count in this area */}
            <div className="post-count">
              {filteredPosts.length === posts.length ? (
                <span>Showing all {posts.length} posts</span>
              ) : (
                <span>
                  Showing {filteredPosts.length} of {posts.length} posts
                </span>
              )}
            </div>

            {/* Post list - The collection of plant species */}
            <PostList posts={filteredPosts} />
          </>
        ) : (
          <div className="empty-state">
            {posts.length > 0 ? (
              <>
                <h2>No matching posts</h2>
                <p>Try adjusting your search criteria</p>
                <button onClick={clearSearch} className="button">
                  Show All Posts
                </button>
              </>
            ) : (
              <>
                <h2>Your knowledge grove is empty</h2>
                <p>Start planting ideas by creating your first blog post</p>
                <Link to="/create" className="button">
                  Create First Post
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default BlogPage;
