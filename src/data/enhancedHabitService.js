// Enhanced habit tracking data service using IndexedDB for persistence
import { v4 as uuidv4 } from "uuid";
import { dbService } from "./dbService";

// Example initial habits
const initialHabits = [
  {
    id: "1",
    name: "Morning Meditation",
    description: "10 minutes of mindfulness meditation",
    created: "2025-03-01T08:00:00Z",
    streak: 5,
    targetDays: [0, 1, 2, 3, 4, 5, 6], // Every day
    completedToday: false,
    lastCompleted: "2025-03-04T08:15:00Z",
    history: [
      { date: "2025-03-04", completed: true },
      { date: "2025-03-03", completed: true },
      { date: "2025-03-02", completed: true },
      { date: "2025-03-01", completed: true },
      { date: "2025-02-28", completed: true },
    ],
  },
  {
    id: "2",
    name: "Read for 30 minutes",
    description: "Fiction or non-fiction reading for personal growth",
    created: "2025-03-01T08:00:00Z",
    streak: 3,
    targetDays: [1, 2, 3, 4, 5], // Weekdays only
    completedToday: true,
    lastCompleted: "2025-03-05T07:30:00Z",
    history: [
      { date: "2025-03-05", completed: true },
      { date: "2025-03-04", completed: true },
      { date: "2025-03-03", completed: true },
      { date: "2025-03-02", completed: false },
      { date: "2025-03-01", completed: false },
    ],
  },
];

// Helper function to check if today is a target day for the habit
const isTodayTargetDay = (targetDays) => {
  const today = new Date().getDay(); // 0-6, where 0 is Sunday
  return targetDays.includes(today);
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayFormatted = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// Helper function to check if a habit was completed on a specific date
const wasCompletedOnDate = (history, date) => {
  return history.some((record) => record.date === date && record.completed);
};

// Helper function to calculate streak based on history
const calculateStreak = (history, targetDays) => {
  // Sort history by date (most recent first)
  const sortedHistory = [...history].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  let streak = 0;
  let currentDate = new Date(getTodayFormatted());
  currentDate.setDate(currentDate.getDate() - 1); // Start from yesterday

  // Check consecutive days
  while (true) {
    const dateStr = currentDate.toISOString().split("T")[0];
    const dayOfWeek = currentDate.getDay();

    // If it's a target day, it should be completed
    if (targetDays.includes(dayOfWeek)) {
      if (wasCompletedOnDate(sortedHistory, dateStr)) {
        streak++;
      } else {
        break; // Streak ends
      }
    }

    // Move to previous day
    currentDate.setDate(currentDate.getDate() - 1);
  }

  return streak;
};

/**
 * Initialize the habits database if empty
 * @returns {Promise<void>}
 */
async function initializeHabitsIfEmpty() {
  try {
    const count = await dbService.countRecords(dbService.STORES.HABITS);
    if (count === 0) {
      // No habits exist, add initial habits
      for (const habit of initialHabits) {
        await dbService.create(dbService.STORES.HABITS, habit);
      }
      console.log("Initialized habits database with sample habits");
    }
  } catch (error) {
    console.error("Error initializing habits:", error);
  }
}

/**
 * Get all habits from IndexedDB
 * @returns {Promise<Array>} Array of habits
 */
async function getHabits() {
  try {
    // Make sure database is initialized
    await initializeHabitsIfEmpty();

    // Get all habits
    const habits = await dbService.getAll(dbService.STORES.HABITS);

    // Check if completedToday needs to be reset
    const today = getTodayFormatted();
    const updatedHabits = [];
    let needsUpdate = false;

    for (const habit of habits) {
      // Get the date from lastCompleted
      const lastCompletedDate = habit.lastCompleted
        ? habit.lastCompleted.split("T")[0]
        : null;

      // If lastCompleted is not today, reset completedToday
      if (lastCompletedDate !== today && habit.completedToday) {
        const updatedHabit = {
          ...habit,
          completedToday: false,
        };

        // Update in database
        await dbService.update(dbService.STORES.HABITS, habit.id, updatedHabit);
        updatedHabits.push(updatedHabit);
        needsUpdate = true;
      } else {
        updatedHabits.push(habit);
      }
    }

    if (needsUpdate) {
      console.log("Reset completedToday for habits");
    }

    return updatedHabits;
  } catch (error) {
    console.error("Error getting habits:", error);
    return [];
  }
}

/**
 * Get a single habit by ID
 * @param {string} id - Habit ID
 * @returns {Promise<Object|null>} Habit object or null if not found
 */
async function getHabitById(id) {
  try {
    return await dbService.getById(dbService.STORES.HABITS, id);
  } catch (error) {
    console.error(`Error getting habit with ID ${id}:`, error);
    return null;
  }
}

/**
 * Create a new habit
 * @param {Object} habitData - Habit data
 * @returns {Promise<Object>} Created habit
 */
async function createHabit(habitData) {
  try {
    const now = new Date().toISOString();

    const newHabit = {
      id: uuidv4(),
      created: now,
      streak: 0,
      completedToday: false,
      lastCompleted: null,
      history: [],
      ...habitData,
    };

    await dbService.create(dbService.STORES.HABITS, newHabit);
    return newHabit;
  } catch (error) {
    console.error("Error creating habit:", error);
    throw error;
  }
}

/**
 * Update an existing habit
 * @param {string} id - Habit ID
 * @param {Object} habitData - Updated habit data
 * @returns {Promise<Object>} Updated habit
 */
async function updateHabit(id, habitData) {
  try {
    // Get the current habit to preserve certain fields
    const currentHabit = await getHabitById(id);
    if (!currentHabit) {
      throw new Error(`Habit with ID ${id} not found`);
    }

    // Preserve fields that shouldn't be overwritten
    const { streak, completedToday, lastCompleted, history, created } =
      currentHabit;

    const updatedHabit = {
      ...habitData,
      streak,
      completedToday,
      lastCompleted,
      history,
      created,
    };

    return await dbService.update(dbService.STORES.HABITS, id, updatedHabit);
  } catch (error) {
    console.error(`Error updating habit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Delete a habit
 * @param {string} id - Habit ID
 * @returns {Promise<string>} Deleted habit ID
 */
async function deleteHabit(id) {
  try {
    return await dbService.remove(dbService.STORES.HABITS, id);
  } catch (error) {
    console.error(`Error deleting habit with ID ${id}:`, error);
    throw error;
  }
}

/**
 * Toggle habit completion for today
 * @param {string} id - Habit ID
 * @returns {Promise<Object>} Updated habit
 */
async function toggleHabitCompletion(id) {
  try {
    // Get the current habit
    const habit = await getHabitById(id);
    if (!habit) {
      throw new Error(`Habit with ID ${id} not found`);
    }

    const today = getTodayFormatted();
    const now = new Date().toISOString();

    // Toggle completion status
    const newCompletedStatus = !habit.completedToday;

    // Update history
    let history = [...habit.history];
    const todayHistoryIndex = history.findIndex(
      (record) => record.date === today
    );

    if (todayHistoryIndex !== -1) {
      // Update existing record for today
      history[todayHistoryIndex].completed = newCompletedStatus;
    } else {
      // Add new record for today
      history.unshift({
        date: today,
        completed: newCompletedStatus,
      });
    }

    // Calculate new streak
    let streak = habit.streak;
    if (newCompletedStatus) {
      // If completing, increment streak if eligible
      if (isTodayTargetDay(habit.targetDays)) {
        streak = calculateStreak(
          [{ date: today, completed: true }, ...habit.history],
          habit.targetDays
        );
      }
    } else {
      // If un-completing, recalculate streak
      streak = calculateStreak(history, habit.targetDays);
    }

    const updatedHabit = {
      ...habit,
      completedToday: newCompletedStatus,
      lastCompleted: newCompletedStatus ? now : habit.lastCompleted,
      history,
      streak,
    };

    return await dbService.update(dbService.STORES.HABITS, id, updatedHabit);
  } catch (error) {
    console.error(`Error toggling habit completion for ID ${id}:`, error);
    throw error;
  }
}

/**
 * Get habit statistics
 * @returns {Promise<Object>} Habit statistics
 */
async function getHabitStats() {
  try {
    const habits = await getHabits();

    if (!habits || habits.length === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        totalStreak: 0,
        longestStreak: 0,
        mostConsistentHabit: null,
      };
    }

    const stats = {
      totalHabits: habits.length,
      completedToday: habits.filter((h) => h.completedToday).length,
      completionRate: Math.round(
        (habits.filter((h) => h.completedToday).length / habits.length) * 100
      ),
      totalStreak: habits.reduce((sum, h) => sum + h.streak, 0),
      longestStreak: Math.max(...habits.map((h) => h.streak), 0),
      mostConsistentHabit: null,
    };

    // Find most consistent habit
    if (habits.length > 0) {
      const mostConsistent = habits.reduce((prev, current) => {
        // Calculate completion rate
        const prevCompletionRate =
          prev.history.filter((h) => h.completed).length /
          (prev.history.length || 1);
        const currentCompletionRate =
          current.history.filter((h) => h.completed).length /
          (current.history.length || 1);

        return prevCompletionRate > currentCompletionRate ? prev : current;
      });

      stats.mostConsistentHabit = mostConsistent.name;
    }

    return stats;
  } catch (error) {
    console.error("Error getting habit stats:", error);
    return {
      totalHabits: 0,
      completedToday: 0,
      completionRate: 0,
      totalStreak: 0,
      longestStreak: 0,
      mostConsistentHabit: null,
    };
  }
}

/**
 * Migrate habits from localStorage if available
 * @returns {Promise<void>}
 */
async function migrateFromLocalStorage() {
  try {
    const habitsString = localStorage.getItem("habit_tracker_data");
    if (habitsString) {
      const habits = JSON.parse(habitsString);
      const count = await dbService.countRecords(dbService.STORES.HABITS);

      // Only migrate if IndexedDB is empty to avoid duplicates
      if (count === 0 && habits.length > 0) {
        for (const habit of habits) {
          await dbService.create(dbService.STORES.HABITS, habit);
        }
        console.log(
          "Successfully migrated habits from localStorage to IndexedDB"
        );
      }
    }
  } catch (error) {
    console.error("Error migrating habits:", error);
  }
}

// Export the enhanced habit service
export const enhancedHabitService = {
  getHabits,
  getHabitById,
  createHabit,
  updateHabit,
  deleteHabit,
  toggleHabitCompletion,
  getHabitStats,
  migrateFromLocalStorage,
};
