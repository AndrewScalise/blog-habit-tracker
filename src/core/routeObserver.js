// Route observer for tracking navigation changes

import { lifecycleEvents } from "./lifecycleEvents";

/**
 * Route Observer Pattern
 *
 * In a forest, animals create trails based on their movement patterns.
 * These trails serve multiple purposes:
 * - They provide efficient navigation paths through the forest
 * - They connect different ecological zones (water sources, food areas, shelter)
 * - They create interaction points where different species might encounter each other
 *
 * Similarly, our application's navigation system:
 * - Provides paths between different functional areas
 * - Connects data sources with presentation layers
 * - Creates opportunities for components to interact based on route changes
 *
 * This observer tracks route changes and broadcasts them through the lifecycle
 * event system, allowing decoupled components to respond to navigation events.
 */

// Previous route state
let currentRoute = {
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
  timestamp: Date.now(),
};

/**
 * Initialize route observer
 * @param {Object} routerTools - React Router navigation tools
 * @param {Function} routerTools.navigate - React Router navigate function
 * @param {Object} routerTools.location - React Router location object
 */
function initializeRouteObserver({ navigate, location }) {
  // Set initial route from current location
  if (location) {
    currentRoute = {
      pathname: location.pathname,
      search: location.search,
      hash: location.hash,
      timestamp: Date.now(),
    };
  }

  // Also handle browser back/forward navigation
  window.addEventListener("popstate", () => {
    const newRoute = {
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      timestamp: Date.now(),
    };

    // Emit only if route actually changed
    if (
      newRoute.pathname !== currentRoute.pathname ||
      newRoute.search !== currentRoute.search ||
      newRoute.hash !== currentRoute.hash
    ) {
      const timeSpent = newRoute.timestamp - currentRoute.timestamp;

      lifecycleEvents.emit(lifecycleEvents.EVENTS.ROUTE_CHANGED, {
        previous: { ...currentRoute, timeSpent },
        current: newRoute,
        navigationType: "popstate",
      });

      currentRoute = newRoute;
    }
  });
}

/**
 * Get current route information
 * @returns {Object} Current route data
 */
function getCurrentRoute() {
  return { ...currentRoute };
}

/**
 * React component that monitors route changes and provides
 * current route information to the lifecycle system
 */
function RouteObserverComponent({ children }) {
  // Get location from React Router
  const location = useLocation();

  // Initialize on component mount and track location changes
  React.useEffect(() => {
    // Call the callback when location changes
    if (window.routeObserverCallback) {
      window.routeObserverCallback(location);
    }

    // Emit initial route if this is first mount
    if (location && location.pathname === currentRoute.pathname) {
      lifecycleEvents.emit(lifecycleEvents.EVENTS.ROUTE_CHANGED, {
        previous: null,
        current: currentRoute,
        isInitial: true,
      });
    }
  }, [location]); // Re-run when location changes

  // This component doesn't render anything itself
  return children;
}

// Export the route observer
export const routeObserver = {
  initialize: initializeRouteObserver,
  getCurrentRoute,
  RouteObserverComponent,
};
