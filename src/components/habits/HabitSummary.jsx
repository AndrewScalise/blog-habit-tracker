// Summary component showing overall habit statistics
import React from "react";

/**
 * Summary component to display overall habit tracking statistics
 *
 * @param {Object} props Component props
 * @param {Array} props.habits Array of habit objects
 */
const HabitSummary = ({ habits }) => {
  // Calculate summary statistics
  const stats = React.useMemo(() => {
    if (!habits || habits.length === 0) {
      return {
        totalHabits: 0,
        completedToday: 0,
        completionRate: 0,
        totalStreak: 0,
        averageStreak: 0,
      };
    }

    const totalHabits = habits.length;
    const completedToday = habits.filter(
      (habit) => habit.completedToday
    ).length;
    const completionRate = Math.round((completedToday / totalHabits) * 100);
    const totalStreak = habits.reduce((sum, habit) => sum + habit.streak, 0);
    const averageStreak = Math.round(totalStreak / totalHabits);

    return {
      totalHabits,
      completedToday,
      completionRate,
      totalStreak,
      averageStreak,
    };
  }, [habits]);

  // Define color based on completion rate
  const getCompletionColor = (rate) => {
    if (rate < 30) return "#e74c3c"; // Red - needs improvement
    if (rate < 60) return "#f39c12"; // Orange - getting there
    if (rate < 90) return "#3498db"; // Blue - good progress
    return "#2ecc71"; // Green - excellent
  };

  const completionColor = getCompletionColor(stats.completionRate);

  return (
    <div className="habit-summary">
      <div className="summary-header">
        <h2>Habit Summary</h2>
        <div className="today-date">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      <div className="summary-stats">
        <div className="stat-progress">
          <svg viewBox="0 0 36 36" className="circular-chart">
            <path
              className="circle-bg"
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="circle"
              strokeDasharray={`${stats.completionRate}, 100`}
              style={{ stroke: completionColor }}
              d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.35" className="percentage">
              {stats.completionRate}%
            </text>
          </svg>
          <div className="progress-label">Today's Progress</div>
        </div>

        <div className="stat-details">
          <div className="stat-item">
            <div className="stat-value">
              {stats.completedToday}/{stats.totalHabits}
            </div>
            <div className="stat-label">Habits Completed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.totalStreak}</div>
            <div className="stat-label">Total Streak Days</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{stats.averageStreak}</div>
            <div className="stat-label">Average Streak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HabitSummary;
