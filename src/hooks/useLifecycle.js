// React hooks for the lifecycle event system

import { useState, useEffect, useCallback, useRef } from "react";
import { lifecycleEvents } from "../core/lifecycleEvents";
import { dataChangeObserver } from "../core/dataChangeObserver";

/**
 * Custom hook for subscribing to lifecycle events
 *
 * This hook connects React components to our lifecycle event system,
 * allowing them to respond to application-wide events without direct coupling.
 *
 * @param {string} eventType - Event type to listen for
 * @param {Function} callback - Callback function to handle event
 * @param {Array} deps - Dependencies array for callback
 */
export function useLifecycleEvent(eventType, callback, deps = []) {
  // Use a ref to avoid triggering effect when callback reference changes
  const callbackRef = useRef(callback);

  // Update the ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    // Create listener that calls current callback ref
    const listener = (data) => {
      if (callbackRef.current) {
        callbackRef.current(data);
      }
    };

    // Subscribe to event
    const unsubscribe = lifecycleEvents.on(eventType, listener);

    // Cleanup subscription on unmount
    return unsubscribe;
  }, [eventType, ...deps]);
}

/**
 * Custom hook for tracking route changes
 *
 * @param {Function} callback - Callback to execute on route change
 * @param {Array} deps - Dependencies array for callback
 */
export function useRouteChange(callback, deps = []) {
  useLifecycleEvent(lifecycleEvents.EVENTS.ROUTE_CHANGED, callback, deps);
}

/**
 * Custom hook for tracking application focus state
 *
 * @returns {boolean} Whether application is focused
 */
export function useAppFocus() {
  const [isFocused, setIsFocused] = useState(
    document.visibilityState === "visible"
  );

  useLifecycleEvent(
    lifecycleEvents.EVENTS.FOCUS_GAINED,
    () => {
      setIsFocused(true);
    },
    []
  );

  useLifecycleEvent(
    lifecycleEvents.EVENTS.FOCUS_LOST,
    () => {
      setIsFocused(false);
    },
    []
  );

  return isFocused;
}

/**
 * Custom hook for tracking data changes
 *
 * @param {string} collection - Data collection to watch
 * @param {Function} callback - Callback function for changes
 * @param {Array} deps - Dependencies array for callback
 */
export function useDataChanges(collection, callback, deps = []) {
  useLifecycleEvent(
    lifecycleEvents.EVENTS.DATA_CHANGED,
    (data) => {
      // Only call callback if the change is for the watched collection
      if (data.collection === collection && data.hasChanged) {
        callback(data);
      }
    },
    deps
  );

  // Return function to force refresh
  return useCallback(() => {
    dataChangeObserver.forceRefresh();
  }, []);
}

/**
 * Custom hook that refreshes component when specific data changes
 *
 * @param {string} collection - Data collection to watch
 * @returns {Function} Force refresh function
 */
export function useDataRefresh(collection) {
  const [refreshToken, setRefreshToken] = useState(0);

  useDataChanges(
    collection,
    () => {
      // Update state to trigger re-render
      setRefreshToken((prev) => prev + 1);
    },
    []
  );

  // Return function to force refresh
  return useCallback(() => {
    dataChangeObserver.notifyChange(collection);
    setRefreshToken((prev) => prev + 1);
  }, [collection]);
}

/**
 * Custom hook for application initialization state
 *
 * @returns {Object} Initialization state
 */
export function useAppInitialization() {
  const [initState, setInitState] = useState({
    initialized: false,
    error: null,
  });

  useLifecycleEvent(
    lifecycleEvents.EVENTS.INIT_COMPLETE,
    () => {
      setInitState({
        initialized: true,
        error: null,
      });
    },
    []
  );

  useLifecycleEvent(
    lifecycleEvents.EVENTS.INIT_ERROR,
    (data) => {
      setInitState({
        initialized: false,
        error: data.error,
      });
    },
    []
  );

  return initState;
}

/**
 * Custom hook that tracks time spent on current route
 *
 * @returns {number} Seconds spent on current route
 */
export function useTimeOnRoute() {
  const [seconds, setSeconds] = useState(0);
  const startTimeRef = useRef(Date.now());

  // Reset timer on route change
  useRouteChange(() => {
    startTimeRef.current = Date.now();
    setSeconds(0);
  });

  // Update timer every second
  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
      setSeconds(elapsed);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return seconds;
}
