// Enhanced blog post data service using IndexedDB for persistence
import { v4 as uuidv4 } from "uuid";
import { dbService } from "./dbService";
import { generateExcerpt } from "../utils/mdParser";

// Example initial posts
const initialPosts = [
  {
    id: "1",
    title: "Getting Started with React",
    date: "2025-03-01T12:00:00Z",
    excerpt:
      "Learn the fundamentals of React and start building your first component.",
    content: `
# Getting Started with React

React is a JavaScript library for building user interfaces. It's declarative, efficient, and flexible.

## Creating Your First Component

Here's how to create a simple React component:

\`\`\`jsx
function HelloWorld() {
  return <h1>Hello, world!</h1>;
}
\`\`\`

This component can be rendered into the DOM like this:

\`\`\`jsx
ReactDOM.render(<HelloWorld />, document.getElementById('root'));
\`\`\`
    `,
    coverImage: "https://source.unsplash.com/random/800x400/?react",
    updatedAt: null,
  },
  {
    id: "2",
    title: "Working with State in React",
    date: "2025-03-05T14:30:00Z",
    excerpt:
      "Understand how state works in React and how to manage it effectively.",
    content: `
# Working with State in React

State is a way to manage data that changes over time in your React components.

## Using the useState Hook

The useState hook is the simplest way to add state to a functional component:

\`\`\`jsx
import React, { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);
  
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}
\`\`\`
    `,
    coverImage: "https://source.unsplash.com/random/800x400/?programming",
    updatedAt: null,
  },
];

/**
 * Initialize the posts database if empty
 * @returns {Promise<void>}
 */
async function initializePostsIfEmpty() {
  try {
    const count = await dbService.countRecords(dbService.STORES.POSTS);
    if (count === 0) {
      // No posts exist, add initial posts
      for (const post of initialPosts) {
        await dbService.create(dbService.STORES.POSTS, post);
      }
      console.log("Initialized posts database with sample posts");
    }
  } catch (error) {
    console.error("Error initializing posts:", error);
  }
}

/**
 * Get all blog posts, sorted by date (newest first)
 * @returns {Promise<Array>} Array of posts
 */
async function getPosts() {
  try {
    // Make sure database is initialized
    await initializePostsIfEmpty();

    // Get all posts
    const posts = await dbService.getAll(dbService.STORES.POSTS);

    // Sort by date, newest first
    return posts.sort((a, b) => new Date(b.date) - new Date(a.date));
  } catch (error) {
    console.error("Error getting posts:", error);
    return [];
  }
}

/**
 * Get a single post by ID
 * @param {string} id - Post ID
 * @returns {Promise<Object|null>} Post object or null if not found
 */
async function getPostById(id) {
  try {
    return await dbService.getById(dbService.STORES.POSTS, id);
  } catch (error) {
    console.error(`Error getting post with ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new blog post
 * @param {Object} postData - Post data
 * @returns {Promise<Object>} Created post
 */
async function createPost(postData) {
  try {
    const now = new Date().toISOString();

    // Generate excerpt if not provided
    let excerpt = postData.excerpt;
    if (!excerpt && postData.content) {
      excerpt = generateExcerpt(postData.content, 150);
    }

    const newPost = {
      id: uuidv4(),
      date: now,
      updatedAt: null,
      ...postData,
      excerpt,
    };

    await dbService.create(dbService.STORES.POSTS, newPost);
    return newPost;
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
}

/**
 * Update an existing blog post
 * @param {string} id - Post ID
 * @param {Object} postData - Updated post data
 * @returns {Promise<Object>} Updated post
 */
async function updatePost(id, postData) {
  try {
    // Generate excerpt if content was updated but excerpt wasn't
    let updateData = { ...postData };

    if (postData.content && !postData.excerpt) {
      updateData.excerpt = generateExcerpt(postData.content, 150);
    }

    // Add updated timestamp
    updateData.updatedAt = new Date().toISOString();

    return await dbService.update(dbService.STORES.POSTS, id, updateData);
  } catch (error) {
    console.error(`Error updating post with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a blog post
 * @param {string} id - Post ID
 * @returns {Promise<string>} Deleted post ID
 */
async function deletePost(id) {
  try {
    return await dbService.remove(dbService.STORES.POSTS, id);
  } catch (error) {
    console.error(`Error deleting post with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Search posts by title, content, or excerpt
 * @param {string} query - Search query
 * @returns {Promise<Array>} Matching posts
 */
async function searchPosts(query) {
  try {
    if (!query || query.trim() === "") {
      return await getPosts();
    }

    const posts = await getPosts();
    const normalizedQuery = query.toLowerCase().trim();

    return posts.filter((post) => {
      const titleMatch =
        post.title && post.title.toLowerCase().includes(normalizedQuery);
      const excerptMatch =
        post.excerpt && post.excerpt.toLowerCase().includes(normalizedQuery);
      const contentMatch =
        post.content && post.content.toLowerCase().includes(normalizedQuery);

      return titleMatch || excerptMatch || contentMatch;
    });
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
}

/**
 * Get recent posts
 * @param {number} limit - Maximum number of posts to return
 * @returns {Promise<Array>} Recent posts
 */
async function getRecentPosts(limit = 5) {
  try {
    const posts = await getPosts();
    return posts.slice(0, limit);
  } catch (error) {
    console.error("Error getting recent posts:", error);
    return [];
  }
}

/**
 * Migrate posts from localStorage if available
 * @returns {Promise<void>}
 */
async function migrateFromLocalStorage() {
  try {
    const postsString = localStorage.getItem("blog_posts");
    if (postsString) {
      const posts = JSON.parse(postsString);
      const count = await dbService.countRecords(dbService.STORES.POSTS);

      // Only migrate if IndexedDB is empty to avoid duplicates
      if (count === 0 && posts.length > 0) {
        for (const post of posts) {
          await dbService.create(dbService.STORES.POSTS, post);
        }
        console.log(
          "Successfully migrated posts from localStorage to IndexedDB"
        );
      }
    }
  } catch (error) {
    console.error("Error migrating posts:", error);
  }
}

// Export the enhanced post service
export const enhancedPostService = {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  searchPosts,
  getRecentPosts,
  migrateFromLocalStorage,
};
