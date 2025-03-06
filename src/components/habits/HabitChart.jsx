// Visualization component for habit tracking statistics
import React, { useMemo } from "react";

/**
 * Simple chart component to visualize habit completion over time
 * Uses HTML/CSS rather than a charting library for simplicity
 *
 * @param {Object} props Component props
 * @param {Array} props.history Array of habit completion records
 * @param {number} props.days Number of days to show in the chart (default: 14)
 */
const HabitChart = ({ history, days = 14 }) => {
  // Process history data for the chart
  const chartData = useMemo(() => {
    // Start with an empty array for the last 'days' days
    const result = [];
    const today = new Date();

    // Create array of dates for the chart (most recent first)
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Find if this date exists in history
      const historyEntry = history?.find((entry) => entry.date === dateStr);

      result.unshift({
        date: dateStr,
        completed: historyEntry ? historyEntry.completed : false,
        // Format date as "Mon 01" (abbreviated day name and date)
        display: new Date(dateStr).toLocaleDateString("en-US", {
          weekday: "short",
          day: "2-digit",
        }),
      });
    }

    return result;
  }, [history, days]);

  // Calculate completion percentage
  const completionRate = useMemo(() => {
    if (!chartData.length) return 0;

    const completedDays = chartData.filter((day) => day.completed).length;
    return Math.round((completedDays / chartData.length) * 100);
  }, [chartData]);

  return (
    <div className="habit-chart">
      <div className="chart-header">
        <span className="chart-title">Last {days} Days</span>
        <span className="completion-rate">{completionRate}% Complete</span>
      </div>

      <div className="chart-grid">
        {chartData.map((day, index) => (
          <div
            key={day.date}
            className={`chart-day ${day.completed ? "completed" : "missed"}`}
            title={`${day.display}: ${day.completed ? "Completed" : "Missed"}`}
          >
            <div
              className="day-bar"
              style={{
                height: day.completed ? "100%" : "20%",
              }}
            ></div>
            <div className="day-label">{day.display}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HabitChart;
