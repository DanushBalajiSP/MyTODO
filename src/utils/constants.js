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
