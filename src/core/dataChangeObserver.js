// System for tracking data changes across the application

import { lifecycleEvents } from "./lifecycleEvents";
import { enhancedPostService } from "../data/enhancedPostService";
import { enhancedHabitService } from "../data/enhancedHabitService";

/**
 * Data Change Observer Pattern
 *
 * In a forest ecosystem, changes in one component affect others:
 * - Rainfall changes soil moisture, affecting plant growth
 * - Temperature shifts trigger behavioral changes in animals
 * - Seasonal light changes initiate flowering or leaf drop
 *
 * These environmental signals propagate through the ecosystem,
 * causing cascading adaptations across interdependent species.
 *
 * Similarly, our application's data changes should trigger
 * appropriate responses throughout the system:
 * - Blog posts being created/updated should refresh post lists
 * - Habit completions should update streaks and visualizations
 * - User preferences changes should adjust UI components
 *
 * This observer centralizes data change detection and broadcasts
 * these changes through the lifecycle event system, allowing
 * components to efficiently respond without direct coupling.
 */

// Last known states of different data collections
const dataStates = {
  posts: {
    lastUpdated: null,
    count: 0,
    checksum: null, // Optional: For more sophisticated change detection
  },
  habits: {
    lastUpdated: null,
    count: 0,
    checksum: null,
  },
  settings: {
    lastUpdated: null,
    checksum: null,
  },
};

/**
 * Generate a simple checksum for an array of objects
 * Used to detect changes in collections without deep comparison
 *
 * @param {Array} items - Array of objects to generate checksum for
 * @returns {string} Simple checksum
 */
function generateChecksum(items) {
  if (!items || !items.length) return "0";

  // For simplicity, we'll just hash the stringified IDs and update timestamps
  // In a real app, you might use a more sophisticated hashing algorithm
  const idString = items
    .map((item) => {
      return `${item.id}:${item.updatedAt || item.lastCompleted || "0"}`;
    })
    .join("|");

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < idString.length; i++) {
    const char = idString.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  return hash.toString();
}

/**
 * Check for changes in blog posts
 *
 * @returns {Promise<Object>} Change information
 */
async function checkPostChanges() {
  try {
    const posts = await enhancedPostService.getPosts();
    const newChecksum = generateChecksum(posts);
    const newCount = posts.length;
    const now = new Date().toISOString();

    // Check if posts have changed
    const hasChanged =
      dataStates.posts.checksum !== newChecksum ||
      dataStates.posts.count !== newCount;

    // Update stored state
    if (hasChanged) {
      const oldState = { ...dataStates.posts };

      dataStates.posts = {
        lastUpdated: now,
        count: newCount,
        checksum: newChecksum,
      };

      return {
        collection: "posts",
        hasChanged,
        oldState,
        newState: dataStates.posts,
        changes: {
          countDiff: newCount - oldState.count,
        },
      };
    }

    return { collection: "posts", hasChanged: false };
  } catch (error) {
    console.error("Error checking post changes:", error);
    return { collection: "posts", hasChanged: false, error };
  }
}

/**
 * Check for changes in habits
 *
 * @returns {Promise<Object>} Change information
 */
async function checkHabitChanges() {
  try {
    const habits = await enhancedHabitService.getHabits();
    const newChecksum = generateChecksum(habits);
    const newCount = habits.length;
    const now = new Date().toISOString();

    // Calculate additional metrics
    const completedToday = habits.filter((h) => h.completedToday).length;
    const totalStreaks = habits.reduce((sum, h) => sum + h.streak, 0);

    // Check if habits have changed
    const hasChanged =
      dataStates.habits.checksum !== newChecksum ||
      dataStates.habits.count !== newCount;

    // Update stored state
    if (hasChanged) {
      const oldState = { ...dataStates.habits };

      dataStates.habits = {
        lastUpdated: now,
        count: newCount,
        checksum: newChecksum,
        metrics: {
          completedToday,
          totalStreaks,
        },
      };

      return {
        collection: "habits",
        hasChanged,
        oldState,
        newState: dataStates.habits,
        changes: {
          countDiff: newCount - (oldState.count || 0),
          metrics: {
            completedToday,
            totalStreaks,
          },
        },
      };
    }

    return { collection: "habits", hasChanged: false };
  } catch (error) {
    console.error("Error checking habit changes:", error);
    return { collection: "habits", hasChanged: false, error };
  }
}

/**
 * Check for changes in all data collections
 *
 * @returns {Promise<Array>} Array of change results
 */
async function checkAllChanges() {
  const results = await Promise.all([checkPostChanges(), checkHabitChanges()]);

  // Emit events for changed collections
  results.forEach((result) => {
    if (result.hasChanged) {
      lifecycleEvents.emit(lifecycleEvents.EVENTS.DATA_CHANGED, result);
    }
  });

  return results;
}

/**
 * Initialize polling for data changes
 *
 * @param {Object} options - Configuration options
 * @param {number} options.interval - Polling interval in milliseconds
 */
function initializePolling({ interval = 30000 } = {}) {
  // Perform initial check
  checkAllChanges();

  // Set up polling
  const pollerId = setInterval(checkAllChanges, interval);

  // Set up event listeners
  lifecycleEvents.on(lifecycleEvents.EVENTS.FOCUS_GAINED, () => {
    // Check for changes when app regains focus
    checkAllChanges();
  });

  lifecycleEvents.on(lifecycleEvents.EVENTS.ROUTE_CHANGED, () => {
    // Check for changes on route change
    checkAllChanges();
  });

  // Return function to stop polling
  return () => clearInterval(pollerId);
}

/**
 * Force a data refresh check
 *
 * @returns {Promise<Array>} Change results
 */
function forceRefresh() {
  return checkAllChanges();
}

/**
 * Notify the system about a change to trigger updates
 *
 * @param {string} collection - Name of changed collection
 * @param {Object} data - Optional change data
 */
function notifyChange(collection, data = {}) {
  lifecycleEvents.emit(lifecycleEvents.EVENTS.DATA_CHANGED, {
    collection,
    hasChanged: true,
    manual: true,
    ...data,
  });
}

// Export the data change observer
export const dataChangeObserver = {
  initialize: initializePolling,
  forceRefresh,
  notifyChange,
  getDataState: () => ({ ...dataStates }),
};
