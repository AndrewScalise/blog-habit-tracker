// The structural framework of our digital ecosystem

import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useAppContext } from "../../context/AppContext";
import { useLocalStorage } from "../../hooks/useLocalStorage";

/**
 * Layout Component
 *
 * This component provides the consistent structural framework for all pages,
 * similar to how a forest has consistent structural elements (soil, canopy layers,
 * understory) that organize all the living elements within it.
 *
 * The Layout handles:
 * 1. Consistent headers and footers across all pages
 * 2. Theme management (light/dark modes like day/night in a forest)
 * 3. Transition animations between pages (like moving through forest areas)
 * 4. Structural adaptation to different device sizes and orientations
 *
 * @param {Object} props Component props
 * @param {React.ReactNode} props.children Child components to render within layout
 */
const Layout = ({ children }) => {
  // Access shared application context (like the climate of the forest)
  const { theme, toggleTheme } = useAppContext() || { theme: "light" };

  // Track scroll position (like tracking position within the forest)
  const [scrollPosition, setScrollPosition] = useState(0);

  // Track current location (like keeping track of which forest area you're in)
  const location = useLocation();

  // Persist user preferences (like animals creating consistent paths)
  const [layoutPreferences, setLayoutPreferences] = useLocalStorage(
    "layout_preferences",
    {
      reducedMotion: false,
      fontSize: "medium",
    }
  );

  // Handle scroll events (like sensing movement through the forest)
  useEffect(() => {
    const handleScroll = () => {
      setScrollPosition(window.scrollY);
    };

    // Add event listener (like setting up environmental sensors)
    window.addEventListener("scroll", handleScroll);

    // Clean up listener on unmount (like removing sensors when leaving)
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Reset scroll position on page changes (like orienting yourself when entering new areas)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Apply theme class to body (like how the entire forest adapts to day/night)
  useEffect(() => {
    document.body.className = theme || "light";

    // Apply user accessibility preferences
    if (layoutPreferences.reducedMotion) {
      document.body.classList.add("reduced-motion");
    } else {
      document.body.classList.remove("reduced-motion");
    }

    document.body.setAttribute("data-font-size", layoutPreferences.fontSize);
  }, [theme, layoutPreferences]);

  // Toggle accessibility preference - reduced motion
  const toggleReducedMotion = () => {
    setLayoutPreferences((prev) => ({
      ...prev,
      reducedMotion: !prev.reducedMotion,
    }));
  };

  // Change font size preference
  const changeFontSize = (size) => {
    setLayoutPreferences((prev) => ({
      ...prev,
      fontSize: size,
    }));
  };

  return (
    <div className={`layout ${theme}-theme`}>
      {/* Header section - like the canopy of the forest */}
      <Header
        scrollPosition={scrollPosition}
        theme={theme}
        toggleTheme={toggleTheme}
        preferences={layoutPreferences}
        toggleReducedMotion={toggleReducedMotion}
        changeFontSize={changeFontSize}
      />

      {/* Main content area - like the active space within the forest */}
      <main className="content">
        {/* Page animation wrapper - like how forest scenes transition */}
        <div className="page-transition-wrapper">{children}</div>
      </main>

      {/* Footer section - like the forest floor that supports everything */}
      <Footer theme={theme} />

      {/* Accessibility controls - like accommodations for different species' needs */}
      <div
        className={`accessibility-controls ${
          scrollPosition > 100 ? "visible" : ""
        }`}
        aria-hidden="true"
      >
        {scrollPosition > 500 && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="back-to-top"
            aria-label="Back to top"
          >
            ↑
          </button>
        )}
      </div>
    </div>
  );
};

export default Layout;
