// Main component for habit tracking functionality

import React, { useState, useEffect, useCallback } from "react";
import HabitCard from "./HabitCard";
import HabitForm from "./HabitForm";
import HabitChart from "./HabitChart";
import HabitSummary from "./HabitSummary";
import { enhancedHabitService } from "../../data/enhancedHabitService";
import { useDataRefresh } from "../../hooks/useLifecycle";

/**
 * HabitTracker Component
 *
 * This component serves as the coordination center for habit tracking,
 * similar to how seasonal cycles coordinate activities in a forest ecosystem.
 *
 * Just as forest cycles trigger different behaviors (growth, conservation, dormancy),
 * this component orchestrates:
 * 1. The display of current habits and their status
 * 2. The creation and modification of habits
 * 3. The visualization of habit data over time
 * 4. The tracking of completion and streaks
 *
 * Core operational patterns:
 * - Cyclical Data Refresh Pattern: Regular data synchronization
 * - State Transition Pattern: Clear boundaries between UI states
 * - Completion Toggle Pattern: Binary state changes with cascading effects
 * - Visual Summary Pattern: Aggregating individual data into meaningful overviews
 */
const HabitTracker = () => {
  // Core state management (like the forest's current condition)
  const [habits, setHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // UI state management (like the forest's visible appearance)
  const [isCreating, setIsCreating] = useState(false);
  const [editingHabitId, setEditingHabitId] = useState(null);
  const [habitStats, setHabitStats] = useState({
    total: 0,
    completedToday: 0,
    streakSum: 0,
    longestStreak: 0,
  });

  // Get refresh trigger from lifecycle hook
  const refreshData = useDataRefresh("habits");

  // Fetch habits data (like gathering environmental data from the forest)
  const fetchHabits = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch habits from data service
      const userHabits = await enhancedHabitService.getHabits();

      // Verify we received an array (defensive programming)
      if (Array.isArray(userHabits)) {
        setHabits(userHabits);

        // Calculate summary statistics
        const stats = await enhancedHabitService.getHabitStats();
        setHabitStats({
          total: stats.totalHabits || 0,
          completedToday: stats.completedToday || 0,
          streakSum: stats.totalStreak || 0,
          longestStreak: stats.longestStreak || 0,
        });
      } else {
        console.error("Expected array of habits, got:", userHabits);
        setHabits([]);
        throw new Error("Invalid data format received");
      }
    } catch (err) {
      console.error("Error fetching habits:", err);
      setError(`Failed to load habits: ${err.message}`);
      // Keep existing habits if any (resilience pattern)
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load habits on component mount and when data refreshes
  useEffect(() => {
    fetchHabits();
  }, [fetchHabits, refreshData]);

  // Handle habit creation (like introducing a new species to the forest)
  const handleCreateHabit = async (habitData) => {
    try {
      setIsLoading(true);

      // Create habit through service
      const newHabit = await enhancedHabitService.createHabit(habitData);

      // Update local state with new habit
      setHabits((prev) => [newHabit, ...prev]);

      // Update summary statistics
      setHabitStats((prev) => ({
        ...prev,
        total: prev.total + 1,
      }));

      // Reset UI state
      setIsCreating(false);
    } catch (error) {
      console.error("Error creating habit:", error);
      setError(`Failed to create habit: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle habit update (like adaptation of existing species)
  const handleUpdateHabit = async (habitData) => {
    if (!editingHabitId) return;

    try {
      setIsLoading(true);

      // Update habit through service
      const updatedHabit = await enhancedHabitService.updateHabit(
        editingHabitId,
        habitData
      );

      // Update local state with modified habit
      setHabits((prev) =>
        prev.map((habit) =>
          habit.id === editingHabitId ? updatedHabit : habit
        )
      );

      // Reset UI state
      setEditingHabitId(null);
    } catch (error) {
      console.error("Error updating habit:", error);
      setError(`Failed to update habit: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle habit deletion (like species leaving the ecosystem)
  const handleDeleteHabit = async (id) => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      try {
        setIsLoading(true);

        // Delete habit through service
        await enhancedHabitService.deleteHabit(id);

        // Update local state by removing habit
        setHabits((prev) => prev.filter((habit) => habit.id !== id));

        // Update summary statistics
        setHabitStats((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
      } catch (error) {
        console.error("Error deleting habit:", error);
        setError(`Failed to delete habit: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // Handle habit completion toggle (like seasonal behavior changes)
  const handleToggleCompletion = async (id) => {
    try {
      setIsLoading(true);

      // Find the habit to toggle
      const habitToToggle = habits.find((h) => h.id === id);
      if (!habitToToggle) {
        throw new Error(`Habit with ID ${id} not found`);
      }

      // Toggle completion through service
      const updatedHabit = await enhancedHabitService.toggleHabitCompletion(id);

      // Update local state with toggled habit
      setHabits((prev) =>
        prev.map((habit) => (habit.id === id ? updatedHabit : habit))
      );

      // Update summary statistics
      const completionDelta = updatedHabit.completedToday ? 1 : -1;
      const streakDelta = updatedHabit.streak - habitToToggle.streak;

      setHabitStats((prev) => ({
        ...prev,
        completedToday: prev.completedToday + completionDelta,
        streakSum: prev.streakSum + streakDelta,
        longestStreak: Math.max(prev.longestStreak, updatedHabit.streak),
      }));
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      setError(`Failed to update habit: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate completion percentage
  const completionPercentage =
    habits.length > 0
      ? Math.round((habitStats.completedToday / habits.length) * 100)
      : 0;

  return (
    <div className="habit-tracker">
      {/* Header section - like the forest canopy */}
      <div className="habit-header">
        <h1>Habit Tracker</h1>
        <button
          className="create-habit-button"
          onClick={() => setIsCreating(true)}
          disabled={isLoading}
        >
          Add New Habit
        </button>
      </div>

      {/* Error display - like warning signals in the ecosystem */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      {/* Summary section - like the forest overview */}
      <HabitSummary habits={habits} />

      {/* Stats section - like seasonal indicators */}
      <div className="habit-stats">
        <div className="stat-card">
          <span className="stat-value">{habitStats.total}</span>
          <span className="stat-label">Total Habits</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{completionPercentage}%</span>
          <span className="stat-label">Completed Today</span>
          <div
            className="progress-bar"
            style={{ width: `${completionPercentage}%` }}
          ></div>
        </div>

        <div className="stat-card">
          <span className="stat-value">{habitStats.streakSum}</span>
          <span className="stat-label">Total Streak Days</span>
        </div>

        <div className="stat-card">
          <span className="stat-value">{habitStats.longestStreak}</span>
          <span className="stat-label">Longest Streak</span>
        </div>
      </div>

      {/* Habit creation form - like a new seed being planted */}
      {isCreating && (
        <div className="habit-form-container">
          <h2>Create New Habit</h2>
          <HabitForm
            onSave={handleCreateHabit}
            onCancel={() => setIsCreating(false)}
            isSubmitting={isLoading}
          />
        </div>
      )}

      {/* Habit editing form - like adapting an existing species */}
      {editingHabitId && (
        <div className="habit-form-container">
          <h2>Edit Habit</h2>
          <HabitForm
            habit={habits.find((h) => h.id === editingHabitId)}
            onSave={handleUpdateHabit}
            onCancel={() => setEditingHabitId(null)}
            isSubmitting={isLoading}
          />
        </div>
      )}

      {/* Main habits display - like the diverse species in the forest */}
      <div className="habits-container">
        {isLoading && habits.length === 0 ? (
          // Loading state - like waiting for visibility in a foggy forest
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading habits...</p>
          </div>
        ) : habits.length === 0 ? (
          // Empty state - like a clearing awaiting new growth
          <div className="no-habits">
            <p>You haven't created any habits yet.</p>
            {!isCreating && (
              <button
                className="start-button"
                onClick={() => setIsCreating(true)}
              >
                Start Tracking
              </button>
            )}
          </div>
        ) : (
          // Display habits - like showcasing the forest's diverse species
          habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggleCompletion={handleToggleCompletion}
              onEdit={() => setEditingHabitId(habit.id)}
              onDelete={() => handleDeleteHabit(habit.id)}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default HabitTracker;
