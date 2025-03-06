// Form for creating or editing habits
import React, { useState } from "react";

const HabitForm = ({ habit, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: habit?.name || "",
    description: habit?.description || "",
    targetDays: habit?.targetDays || [0, 1, 2, 3, 4, 5, 6], // Default to every day
    reminderTime: habit?.reminderTime || "",
  });

  const daysOfWeek = [
    { value: 0, label: "Sun" },
    { value: 1, label: "Mon" },
    { value: 2, label: "Tue" },
    { value: 3, label: "Wed" },
    { value: 4, label: "Thu" },
    { value: 5, label: "Fri" },
    { value: 6, label: "Sat" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const targetDays = [...prev.targetDays];
      const index = targetDays.indexOf(day);

      if (index === -1) {
        targetDays.push(day);
      } else {
        targetDays.splice(index, 1);
      }

      return {
        ...prev,
        targetDays,
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form className="habit-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="name">Habit Name</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          placeholder="e.g., Morning Meditation"
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description (optional)</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="e.g., 10 minutes of mindfulness meditation"
        />
      </div>

      <div className="form-group">
        <label>Target Days</label>
        <div className="day-selector">
          {daysOfWeek.map((day) => (
            <button
              key={day.value}
              type="button"
              className={`day-button ${
                formData.targetDays.includes(day.value) ? "selected" : ""
              }`}
              onClick={() => handleDayToggle(day.value)}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="reminderTime">Reminder Time (optional)</label>
        <input
          type="time"
          id="reminderTime"
          name="reminderTime"
          value={formData.reminderTime}
          onChange={handleChange}
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="save-button">
          {habit ? "Update Habit" : "Create Habit"}
        </button>
        {onCancel && (
          <button type="button" className="cancel-button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default HabitForm;
