import {
  isToday as isTodayFns,
  isTomorrow,
  isYesterday,
  isPast,
  isFuture,
  format,
  startOfDay,
  endOfDay,
  isWithinInterval,
  addDays,
} from 'date-fns';

/**
 * Check if a date is today
 */
export const isToday = (date) => {
  if (!date) return false;
  return isTodayFns(date);
};

/**
 * Check if a date is overdue (past and not today)
 */
export const isOverdue = (date) => {
  if (!date) return false;
  const now = new Date();
  return isPast(date) && !isTodayFns(date);
};

/**
 * Check if a date is upcoming (future, not today)
 */
export const isUpcoming = (date) => {
  if (!date) return false;
  return isFuture(endOfDay(date)) && !isTodayFns(date);
};

/**
 * Check if a date is within the next 7 days
 */
export const isThisWeek = (date) => {
  if (!date) return false;
  const now = new Date();
  return isWithinInterval(date, {
    start: startOfDay(now),
    end: endOfDay(addDays(now, 7)),
  });
};

/**
 * Format a due date for display
 * Returns "Today", "Tomorrow", "Yesterday", or a formatted date
 */
export const formatDueDate = (date) => {
  if (!date) return 'No date';

  if (isTodayFns(date)) return 'Today';
  if (isTomorrow(date)) return 'Tomorrow';
  if (isYesterday(date)) return 'Yesterday';

  const now = new Date();
  const daysDiff = Math.ceil((date - now) / (1000 * 60 * 60 * 24));

  if (daysDiff > 0 && daysDiff <= 7) {
    return format(date, 'EEEE'); // "Monday", "Tuesday", etc.
  }

  if (date.getFullYear() === now.getFullYear()) {
    return format(date, 'MMM d'); // "Apr 15"
  }

  return format(date, 'MMM d, yyyy'); // "Apr 15, 2026"
};

/**
 * Format time for display
 */
export const formatTime = (date) => {
  if (!date) return '';
  return format(date, 'h:mm a'); // "2:30 PM"
};

/**
 * Format date for datetime-local input
 */
export const formatForInput = (date) => {
  if (!date) return '';
  return format(date, "yyyy-MM-dd'T'HH:mm");
};

/**
 * Get a human-readable relative date string
 */
export const getRelativeDateLabel = (date) => {
  if (!date) return 'No date';

  if (isOverdue(date)) return 'Overdue';
  if (isTodayFns(date)) return 'Due today';
  if (isTomorrow(date)) return 'Due tomorrow';

  return `Due ${formatDueDate(date)}`;
};

/**
 * Get the urgency level for color coding
 * Returns: 'overdue' | 'today' | 'soon' | 'normal'
 */
export const getDateUrgency = (date) => {
  if (!date) return 'normal';
  if (isOverdue(date)) return 'overdue';
  if (isTodayFns(date)) return 'today';
  if (isThisWeek(date)) return 'soon';
  return 'normal';
};
