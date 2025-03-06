// Header component with theme toggle integration

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import ThemeToggle from "../system/ThemeToggle";

/**
 * Header Component
 *
 * This component serves as the "canopy" of our application - the top-level
 * structure that provides navigation and context. Just as a forest canopy
 * regulates light and establishes the environment below, our header:
 *
 * 1. Provides navigation to different areas of the application
 * 2. Includes the theme toggle to control the "light" conditions
 * 3. Adapts its appearance as users scroll (like canopy movement)
 * 4. Collapses into a mobile menu on smaller screens (adaptive structure)
 */
const Header = ({ scrollPosition = 0 }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Determine if header should be elevated (like canopy catching more light)
  const isElevated = scrollPosition > 20;

  // Check if current path matches link (for active state)
  const isActivePath = (path) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  return (
    <header className={`site-header ${isElevated ? "elevated" : ""}`}>
      <div className="header-container">
        {/* Logo area - the crown of the tree */}
        <div className="site-logo">
          <Link to="/">
            <span className="logo-icon">🌳</span>
            <span className="logo-text">Forest Blog</span>
          </Link>
        </div>

        {/* Mobile menu toggle - adaptive response */}
        <button
          className="mobile-menu-toggle"
          onClick={toggleMobileMenu}
          aria-expanded={isMobileMenuOpen}
          aria-controls="main-navigation"
        >
          <span className="hamburger-icon">
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
            <span className="hamburger-bar"></span>
          </span>
          <span className="visually-hidden">Menu</span>
        </button>

        {/* Main navigation and actions - the branches */}
        <div
          id="main-navigation"
          className={`navigation-container ${isMobileMenuOpen ? "open" : ""}`}
        >
          {/* Primary navigation */}
          <nav className="site-nav">
            <ul>
              <li>
                <Link
                  to="/"
                  className={
                    isActivePath("/") &&
                    !isActivePath("/blog") &&
                    !isActivePath("/habits")
                      ? "active"
                      : ""
                  }
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/blog"
                  className={isActivePath("/blog") ? "active" : ""}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  to="/habits"
                  className={isActivePath("/habits") ? "active" : ""}
                >
                  Habits
                </Link>
              </li>
              <li>
                <Link
                  to="/create"
                  className={isActivePath("/create") ? "active" : ""}
                >
                  New Post
                </Link>
              </li>
            </ul>
          </nav>

          {/* Theme toggle - the system for regulating "light" */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
