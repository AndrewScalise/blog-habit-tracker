// Enhanced Application context provider with theme management

import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// Import core systems
import { lifecycleEvents } from "../core/lifecycleEvents";
import { dataChangeObserver } from "../core/dataChangeObserver";
import { initializeApplication } from "../init/appInitializer";

/**
 * Application Context
 *
 * Just as a forest's atmosphere envelops all organisms within it,
 * this context provides shared state and services to all components
 * in our application. It manages:
 *
 * 1. Theme state (light/dark) - like day/night cycles
 * 2. Navigation capabilities - like pathways through the forest
 * 3. User preferences - like adaptations to environmental conditions
 * 4. Core services - like fundamental ecological processes
 */

// Create context
const AppContext = createContext();

// Theme persistence key for localStorage
const THEME_STORAGE_KEY = "forest_ecosystem_theme";

/**
 * App Context Provider Component
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child elements
 */
export function AppContextProvider({ children }) {
  // Access navigation capabilities from React Router
  const navigate = useNavigate();
  const location = useLocation();

  // Application state
  const [state, setState] = useState({
    initialized: false,
    initializing: true,
    error: null,
    environment: {},
    features: {},
    theme: "light", // Default theme
    debug: false,
  });

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

    if (savedTheme) {
      // Use saved theme if available
      setThemeClass(savedTheme);
      setState((prev) => ({ ...prev, theme: savedTheme }));
    } else {
      // Use system preference if no saved theme
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      const defaultTheme = prefersDark ? "dark-theme" : "light";
      setThemeClass(defaultTheme);
      setState((prev) => ({ ...prev, theme: defaultTheme }));
    }
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    // Only apply system changes if no user preference is saved
    const handleSystemThemeChange = (e) => {
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
      if (!savedTheme) {
        const newTheme = e.matches ? "dark-theme" : "light";
        setThemeClass(newTheme);
        setState((prev) => ({ ...prev, theme: newTheme }));
      }
    };

    // Add listener for theme changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleSystemThemeChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleSystemThemeChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
      } else {
        mediaQuery.removeListener(handleSystemThemeChange);
      }
    };
  }, []);

  // Helper function to apply theme class to document body
  const setThemeClass = (theme) => {
    // Remove any existing theme classes
    document.body.classList.remove("light", "dark-theme");

    // Add new theme class
    document.body.classList.add(theme);
  };

  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newTheme = state.theme === "light" ? "dark-theme" : "light";

    // Update DOM
    setThemeClass(newTheme);

    // Update state
    setState((prev) => ({ ...prev, theme: newTheme }));

    // Save preference
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);

    // Emit theme change event for interested components
    lifecycleEvents.emit("theme:changed", { theme: newTheme });
  };

  // Initialize all systems
  useEffect(() => {
    async function initializeApp() {
      try {
        // First, initialize lifecycle events
        lifecycleEvents.initialize();

        // Set up lifecycle event listeners
        const initCompleteUnsub = lifecycleEvents.on(
          lifecycleEvents.EVENTS.INIT_COMPLETE,
          (data) => {
            setState((prev) => ({
              ...prev,
              initialized: true,
              initializing: false,
              environment: data.environment || {},
              features: data.features || {},
            }));
          }
        );

        const initErrorUnsub = lifecycleEvents.on(
          lifecycleEvents.EVENTS.INIT_ERROR,
          (data) => {
            setState((prev) => ({
              ...prev,
              initialized: false,
              initializing: false,
              error: data.error,
            }));
          }
        );

        // Initialize route observer
        if (window.routeObserverCallback) {
          window.routeObserverCallback(location);
        }

        // Initialize application
        const result = await initializeApplication();

        if (result.success) {
          // Initialize data change observer
          dataChangeObserver.initialize({ interval: 30000 });

          // Emit initialization complete event
          lifecycleEvents.emit(lifecycleEvents.EVENTS.INIT_COMPLETE, {
            timestamp: new Date().toISOString(),
            environment: result.appContext.environment,
            features: result.appContext.features,
          });
        } else {
          // Emit initialization error event
          lifecycleEvents.emit(lifecycleEvents.EVENTS.INIT_ERROR, {
            timestamp: new Date().toISOString(),
            error: result.error || "Unknown initialization error",
          });
        }

        // Clean up event listeners on unmount
        return () => {
          initCompleteUnsub();
          initErrorUnsub();
        };
      } catch (error) {
        console.error("Unhandled error during app initialization:", error);
        lifecycleEvents.emit(lifecycleEvents.EVENTS.INIT_ERROR, {
          timestamp: new Date().toISOString(),
          error: error.message || "Unexpected initialization error",
        });
      }
    }

    initializeApp();
  }, [navigate, location]);

  // Define debug toggler
  const toggleDebug = () => {
    setState((prev) => ({
      ...prev,
      debug: !prev.debug,
    }));
  };

  // Context value
  const contextValue = {
    ...state,
    toggleTheme,
    toggleDebug,
    refresh: dataChangeObserver?.forceRefresh,
    notify: dataChangeObserver?.notifyChange,
    navigate: (path) => navigate(path),
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

/**
 * Custom hook for using the app context
 *
 * @returns {Object} App context values and functions
 */
export function useAppContext() {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error("useAppContext must be used within an AppContextProvider");
  }

  return context;
}

/**
 * Higher-order component to wrap a component with the app context
 *
 * @param {React.Component} WrappedComponent - Component to wrap
 * @returns {React.Component} Wrapped component with app context
 */
export function withAppContext(WrappedComponent) {
  function WithAppContext(props) {
    return (
      <AppContextProvider>
        <WrappedComponent {...props} />
      </AppContextProvider>
    );
  }

  WithAppContext.displayName = `WithAppContext(${
    WrappedComponent.displayName || WrappedComponent.name || "Component"
  })`;

  return WithAppContext;
}
