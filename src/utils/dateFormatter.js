// Utility functions for consistent date formatting

/**
 * Format a date string to a readable format (e.g., "March 5, 2025")
 *
 * @param {string} dateString - ISO date string (e.g., "2025-03-05T12:00:00Z")
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString(undefined, options);
};

/**
 * Format a date string to include time (e.g., "March 5, 2025 at 2:30 PM")
 *
 * @param {string} dateString - ISO date string (e.g., "2025-03-05T14:30:00Z")
 * @returns {string} Formatted date with time
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  const dateOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const timeOptions = {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  };

  const formattedDate = date.toLocaleDateString(undefined, dateOptions);
  const formattedTime = date.toLocaleTimeString(undefined, timeOptions);

  return `${formattedDate} at ${formattedTime}`;
};

/**
 * Get a relative time string (e.g., "2 days ago", "just now")
 *
 * @param {string} dateString - ISO date string (e.g., "2025-03-05T14:30:00Z")
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (dateString) => {
  if (!dateString) return "";

  const date = new Date(dateString);

  // Check if date is valid
  if (isNaN(date.getTime())) {
    return "";
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  // Less than a minute
  if (diffInSeconds < 60) {
    return "just now";
  }

  // Less than an hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  // Less than a day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  // Less than a week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }

  // Less than a month
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }

  // Less than a year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }

  // More than a year
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years === 1 ? "" : "s"} ago`;
};
