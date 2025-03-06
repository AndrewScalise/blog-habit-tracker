// Component for displaying a list of blog posts
import React from "react";
import PostCard from "./PostCard";

const PostList = ({ posts }) => {
  if (!posts || posts.length === 0) {
    return (
      <div className="no-posts">
        <p>No posts found. Why not create one?</p>
      </div>
    );
  }

  return (
    <div className="post-list">
      <div className="post-grid">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default PostList;
