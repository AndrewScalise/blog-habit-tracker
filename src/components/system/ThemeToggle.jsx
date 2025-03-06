// A toggle component for switching between light and dark themes

import React from "react";
import { useAppContext } from "../../context/AppContext";

/**
 * ThemeToggle Component
 *
 * This component provides a user interface for switching between light and dark themes.
 * Just as forests adapt to day and night cycles, our application adapts its appearance
 * to different lighting conditions.
 *
 * The component follows these key patterns:
 * 1. Context Consumer Pattern - It consumes theme state from the AppContext
 * 2. Toggle State Pattern - It provides a clear visual indication of the current state
 * 3. Accessibility Pattern - It includes proper ARIA attributes and keyboard navigation
 */
const ThemeToggle = () => {
  // Get theme state and toggle function from context
  const { theme, toggleTheme } = useAppContext();

  // Determine if currently in dark mode
  const isDarkMode = theme === "dark-theme";

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-pressed={isDarkMode}
      aria-label={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
      title={`Switch to ${isDarkMode ? "light" : "dark"} mode`}
    >
      {/* Sun icon for light mode */}
      <svg
        className={`theme-toggle-icon ${!isDarkMode ? "active" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>

      {/* Moon icon for dark mode */}
      <svg
        className={`theme-toggle-icon ${isDarkMode ? "active" : ""}`}
        xmlns="http://www.w3.org/2000/svg"
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>

      <span className="theme-toggle-text">{isDarkMode ? "Light" : "Dark"}</span>
    </button>
  );
};

export default ThemeToggle;
