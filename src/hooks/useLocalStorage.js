// src/hooks/useLocalStorage.js
// A custom hook for persisting data in the browser's localStorage

import { useState, useEffect } from "react";

/**
 * The useLocalStorage Hook
 *
 * This hook creates a persistent memory system for React components,
 * similar to how soil maintains nutrients between seasons in a forest.
 *
 * It provides:
 * 1. A state value that persists between sessions
 * 2. A setter function that updates both state and localStorage
 * 3. Synchronization between multiple components using the same key
 *
 * @param {string} key - The unique identifier for this data in localStorage
 * @param {any} initialValue - The fallback value if no data exists yet
 * @returns {[any, Function]} A stateful value and a function to update it
 */
export function useLocalStorage(key, initialValue) {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState(() => {
    try {
      // Like checking if the soil already contains specific nutrients
      const item = window.localStorage.getItem(key);

      // Parse stored json or return initialValue if nothing stored yet
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error, return initial value (like starting with fresh soil)
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Listen for changes in other components (like how plants detect changes in soil content)
  useEffect(() => {
    const handleStorageChange = (event) => {
      // Only respond to changes in our specific key
      if (event.key === key && event.newValue !== event.oldValue) {
        try {
          // Update state with new value from another component
          const newValue = event.newValue
            ? JSON.parse(event.newValue)
            : initialValue;
          setStoredValue(newValue);
        } catch (error) {
          console.error(
            `Error parsing localStorage change for key "${key}":`,
            error
          );
        }
      }
    };

    // Add storage event listener
    window.addEventListener("storage", handleStorageChange);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [key, initialValue]);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = (value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      // First update React state (like plants updating their internal state)
      setStoredValue(valueToStore);

      // Then update localStorage (like releasing changed nutrients back to soil)
      if (valueToStore === undefined) {
        window.localStorage.removeItem(key);
      } else {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }

      // Dispatch a custom event so other components can listen if they want
      // This is like plants releasing pheromones to signal others
      window.dispatchEvent(
        new CustomEvent("localStorageChange", {
          detail: { key, newValue: valueToStore },
        })
      );
    } catch (error) {
      console.error(`Error writing to localStorage key "${key}":`, error);
    }
  };

  // Like how a plant exposes both internal systems (growth) and
  // external interfaces (leaves, flowers), we return both the
  // current state and the mechanism to change it
  return [storedValue, setValue];
}

/**
 * Clear all data stored by this application in localStorage
 * Similar to a forest fire clearing the accumulated organic matter
 *
 * @returns {number} Number of items cleared
 */
export function clearLocalStorage() {
  let count = 0;

  // Get all keys in localStorage
  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);

    // Only clear keys that belong to our application
    // (You can add a prefix convention to make this more robust)
    if (key) {
      window.localStorage.removeItem(key);
      count++;
    }
  }

  // Dispatch event to notify components
  window.dispatchEvent(new CustomEvent("localStorageCleared"));

  return count;
}

/**
 * Check if localStorage is available
 * Like testing if the soil is suitable for planting
 *
 * @returns {boolean} Whether localStorage is available
 */
export function isLocalStorageAvailable() {
  try {
    const testKey = "__storage_test__";
    window.localStorage.setItem(testKey, "test");
    window.localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
}
