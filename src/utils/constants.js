export const TASK_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
};

export const TASK_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

export const FILTER_TYPES = {
  TODAY: 'today',
  UPCOMING: 'upcoming',
  COMPLETED: 'completed',
  ALL: 'all',
};

export const RECURRING_PATTERN = {
  NONE: 'none',
  DAILY: 'daily',
  WEEKLY: 'weekly',
};

export const NAV_ITEMS = [
  {
    id: FILTER_TYPES.TODAY,
    label: 'Today',
    icon: 'CalendarCheck',
  },
  {
    id: FILTER_TYPES.UPCOMING,
    label: 'Upcoming',
    icon: 'CalendarClock',
  },
  {
    id: FILTER_TYPES.COMPLETED,
    label: 'Completed',
    icon: 'CircleCheckBig',
  },
];

// Smart tag keyword rules — used in TaskForm for suggestions
export const TAG_RULES = [
  { keywords: ['meet', 'call', 'work', 'email', 'prep', 'project'], tag: 'work' },
  { keywords: ['buy', 'shop', 'grocer', 'order', 'purchase'], tag: 'shopping' },
  { keywords: ['study', 'read', 'assign', 'class', 'homework', 'exam', 'lecture'], tag: 'college' },
  { keywords: ['gym', 'health', 'workout', 'run', 'doctor', 'exercise', 'yoga'], tag: 'health' },
  { keywords: ['pay', 'bill', 'bank', 'finance', 'tax', 'budget'], tag: 'finance' },
  { keywords: ['home', 'clean', 'fix', 'repair', 'cook', 'laundry'], tag: 'home' },
];

export const DEFAULT_TAGS = ['personal', 'urgent', 'ideas', 'review'];

