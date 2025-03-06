// The entrance to our digital forest ecosystem

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import PostCard from "../components/blog/PostCard";
import { enhancedPostService } from "../data/enhancedPostService";
import { enhancedHabitService } from "../data/enhancedHabitService";
import { useDataRefresh } from "../hooks/useLifecycle";

/**
 * Homepage Component
 *
 * Serves as the main entry point to our application, showcasing:
 * 1. A compelling introduction to the ecosystem concept
 * 2. A snapshot of recent blog posts (like flowering plants in a clearing)
 * 3. A summary of habit tracking progress (like seasonal patterns)
 * 4. Clear pathways to explore deeper into the application
 */
const HomePage = () => {
  // State for our dynamic content
  const [recentPosts, setRecentPosts] = useState([]);
  const [habitStats, setHabitStats] = useState({
    total: 0,
    completedToday: 0,
    streakSum: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Use our custom hook to refresh when blog data changes
  const refreshData = useDataRefresh("posts");

  // Fetch data on component mount and when data changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch recent posts (like gathering fresh fruits)
        const posts = await enhancedPostService.getRecentPosts(3);
        setRecentPosts(posts);

        // Fetch habit statistics (like checking the health of the ecosystem)
        const stats = await enhancedHabitService.getHabitStats();
        setHabitStats({
          total: stats.totalHabits || 0,
          completedToday: stats.completedToday || 0,
          streakSum: stats.totalStreak || 0,
        });
      } catch (error) {
        console.error("Error fetching homepage data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [refreshData]); // Refetch when data changes

  // Calculate completion percentage
  const completionPercentage =
    habitStats.total > 0
      ? Math.round((habitStats.completedToday / habitStats.total) * 100)
      : 0;

  return (
    <Layout>
      {/* Hero section - The forest canopy view */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>My Digital Ecosystem</h1>
          <p>A personal space for growth, reflection, and habit cultivation</p>
          <div className="hero-cta">
            <Link to="/blog" className="button primary-button">
              Explore Blog
            </Link>
            <Link to="/habits" className="button secondary-button">
              Track Habits
            </Link>
          </div>
        </div>
      </section>

      {/* Main content area */}
      <div className="home-content">
        {/* Recent posts section - Like new growth in the forest */}
        <section className="home-section recent-posts">
          <div className="section-header">
            <h2>Recent Thoughts</h2>
            <Link to="/blog" className="section-link">
              View all
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-indicator">Loading recent posts...</div>
          ) : recentPosts.length > 0 ? (
            <div className="post-grid">
              {recentPosts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No posts yet. Time to plant some ideas!</p>
              <Link to="/create" className="button">
                Create First Post
              </Link>
            </div>
          )}
        </section>

        {/* Habit summary section - Like seasonal patterns in the forest */}
        <section className="home-section habit-summary">
          <div className="section-header">
            <h2>Habit Cultivation</h2>
            <Link to="/habits" className="section-link">
              Manage habits
            </Link>
          </div>

          {isLoading ? (
            <div className="loading-indicator">Loading habit data...</div>
          ) : habitStats.total > 0 ? (
            <div className="stats-container">
              <div className="stat-card">
                <div className="stat-value">{habitStats.total}</div>
                <div className="stat-label">Active Habits</div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{completionPercentage}%</div>
                <div className="stat-label">Completed Today</div>
                <div
                  className="progress-bar"
                  style={{ width: `${completionPercentage}%` }}
                ></div>
              </div>

              <div className="stat-card">
                <div className="stat-value">{habitStats.streakSum}</div>
                <div className="stat-label">Total Streak Days</div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <p>No habits tracked yet. Ready to nurture some routines?</p>
              <Link to="/habits" className="button">
                Start Tracking
              </Link>
            </div>
          )}
        </section>
      </div>

      {/* Ecosystem concept section - Explaining the forest metaphor */}
      <section className="concept-section">
        <div className="concept-content">
          <h2>The Forest Ecosystem Approach</h2>
          <p>
            Just as a forest thrives through interconnected systems, this
            application helps you cultivate a personal ecosystem of knowledge
            and habits that support each other's growth.
          </p>

          <div className="concept-features">
            <div className="feature">
              <h3>Blog as Knowledge Trees</h3>
              <p>
                Grow and branch your ideas through writing, creating a canopy of
                interconnected thoughts.
              </p>
            </div>
            <div className="feature">
              <h3>Habits as Seasonal Cycles</h3>
              <p>
                Establish consistent patterns that, like seasons, bring reliable
                rhythm to your personal development.
              </p>
            </div>
            <div className="feature">
              <h3>Growth Through Connection</h3>
              <p>
                Discover how your thoughts and habits form a mutually supportive
                ecosystem for personal growth.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HomePage;
