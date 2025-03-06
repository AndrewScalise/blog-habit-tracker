// Component for displaying an individual habit
import React from 'react';
import { formatDate } from '../../utils/dateFormatter';
import HabitChart from './HabitChart';

const HabitCard = ({ habit, onToggleCompletion }) => {
  const { id, name, description, streak, lastCompleted, completedToday, history } = habit;
  
  // Calculate streak color based on length (visual motivation)
  const getStreakColor = (streak) => {
    if (streak < 3) return '#3498db'; // Blue - starting out
    if (streak < 7) return '#2ecc71'; // Green - gaining momentum
    if (streak < 14) return '#f39c12'; // Orange - getting consistent
    return '#e74c3c'; // Red - high streak
  };
  
  return (
    <div className="habit-card">
      <div className="habit-info">
        <h3 className="habit-name">{name}</h3>
        {description && <p className="habit-description">{description}</p>}
        <div className="habit-streak" style={{ color: getStreakColor(streak) }}>
          <span className="streak-count">{streak}</span>
          <span className="streak-label">day streak</span>
        </div>
      </div>
      
      {/* Add the habit chart */}
      <HabitChart history={history} days={7} />
      
      <div className="habit-completion">
        <button 
          className={`completion-button ${completedToday ? 'completed' : ''}`}
          onClick={() => onToggleCompletion(id)}
        >
          {completedToday ? 'Completed' : 'Complete'}
        </button>
        
        {lastCompleted && (
          <div className="last-completed">
            Last: {formatDate(lastCompleted)}
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitCard;
