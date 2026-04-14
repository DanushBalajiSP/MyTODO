import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { subscribeToTasks, createTask, updateTask, deleteTask, toggleTaskStatus, updateTaskOrder } from '../services/taskService';
import { isToday, isUpcoming } from '../utils/dateUtils';
import { TASK_STATUS, FILTER_TYPES, TASK_PRIORITY } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { arrayMove } from '@dnd-kit/sortable';

export const TaskContext = createContext(null);

// Reducer for task state management
const taskReducer = (state, action) => {
  switch (action.type) {
    case 'SET_TASKS':
      return { ...state, tasks: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_FILTER':
      return { ...state, activeFilter: action.payload };
    case 'SET_ACTIVE_TAG':
      return { ...state, activeTag: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  tasks: [],
  loading: true,
  error: null,
  activeFilter: FILTER_TYPES.TODAY,
  activeTag: null, // null means no tag filter selected
};

const priorityValue = {
  [TASK_PRIORITY.HIGH]: 3,
  [TASK_PRIORITY.MEDIUM]: 2,
  [TASK_PRIORITY.LOW]: 1
};

export const TaskProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(taskReducer, initialState);

  // Subscribe to real-time task updates
  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: 'SET_TASKS', payload: [] });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    const unsubscribe = subscribeToTasks(user.uid, (tasks) => {
      // Robust sorting: order || createdAt timestamp
      const sorted = [...tasks].sort((a, b) => {
        const orderA = a.order ?? a.createdAt.getTime();
        const orderB = b.order ?? b.createdAt.getTime();
        
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Fallback to priority
        return (priorityValue[b.priority] || 0) - (priorityValue[a.priority] || 0);
      });
      dispatch({ type: 'SET_TASKS', payload: sorted });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Apply Tag Filter first
  const tagFilteredTasks = useMemo(() => {
    if (!state.activeTag) return state.tasks;
    return state.tasks.filter(t => t.tags && t.tags.includes(state.activeTag));
  }, [state.tasks, state.activeTag]);

  // Computed task groups
  const todayTasks = useMemo(() =>
    tagFilteredTasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        (isToday(task.dueDate) || (!task.dueDate))
    ),
    [tagFilteredTasks]
  );

  const overdueTasks = useMemo(() =>
    tagFilteredTasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        task.dueDate &&
        !isToday(task.dueDate) &&
        !isUpcoming(task.dueDate)
    ),
    [tagFilteredTasks]
  );

  const upcomingTasks = useMemo(() =>
    tagFilteredTasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        task.dueDate &&
        isUpcoming(task.dueDate)
    ),
    [tagFilteredTasks]
  );

  const completedTasks = useMemo(() =>
    tagFilteredTasks.filter((task) => task.status === TASK_STATUS.COMPLETED),
    [tagFilteredTasks]
  );

  // Get filtered tasks based on active filter
  const filteredTasks = useMemo(() => {
    switch (state.activeFilter) {
      case FILTER_TYPES.TODAY:
        return [...overdueTasks, ...todayTasks];
      case FILTER_TYPES.UPCOMING:
        return upcomingTasks;
      case FILTER_TYPES.COMPLETED:
        return completedTasks;
      case FILTER_TYPES.ALL:
        return tagFilteredTasks;
      default:
        return [...overdueTasks, ...todayTasks];
    }
  }, [state.activeFilter, overdueTasks, todayTasks, upcomingTasks, completedTasks, tagFilteredTasks]);

  // Task counts for badges
  const taskCounts = useMemo(() => ({
    today: todayTasks.length + overdueTasks.length,
    upcoming: upcomingTasks.length,
    completed: completedTasks.length,
    total: tagFilteredTasks.length,
  }), [todayTasks, overdueTasks, upcomingTasks, completedTasks, tagFilteredTasks]);

  // Extract all unique tags for the sidebar
  const allTags = useMemo(() => {
    const tags = new Set();
    state.tasks.forEach(t => t.tags?.forEach(tag => tags.add(tag)));
    return Array.from(tags).sort();
  }, [state.tasks]);

  // CRUD actions
  const addTask = useCallback(async (taskData) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      // Add order relative to current tasks
      // Add order relative to current timestamp so new tasks appear at the bottom by default
      const newTaskData = {
        ...taskData,
        order: Date.now()
      };
      const taskId = await createTask(user.uid, newTaskData);
      return taskId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid, state.tasks.length]);

  const editTask = useCallback(async (taskId, updates) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await updateTask(user.uid, taskId, updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const removeTask = useCallback(async (taskId) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await deleteTask(user.uid, taskId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const toggleStatus = useCallback(async (taskId, currentStatus) => {
    if (!user?.uid) return;
    try {
      const taskObj = state.tasks.find(t => t.id === taskId);
      if (!taskObj) return;

      dispatch({ type: 'CLEAR_ERROR' });
      await toggleTaskStatus(user.uid, taskObj);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid, state.tasks]);

  const reorderTasks = useCallback(async (activeId, overId) => {
    if (!user?.uid || activeId === overId) return;
    
    // Find indices based on the filtered view we are looking at!
    const oldIndex = filteredTasks.findIndex(t => t.id === activeId);
    const newIndex = filteredTasks.findIndex(t => t.id === overId);
    
    if (oldIndex === -1 || newIndex === -1) return;

    // Calculate new order value
    let newOrderVal = 0;
    if (newIndex === 0) {
      const nextOrder = reorderedList[1]?.order ?? reorderedList[1]?.createdAt?.getTime() ?? Date.now();
      newOrderVal = nextOrder - 100000; // Large gap
    } else if (newIndex === reorderedList.length - 1) {
      const prevOrder = reorderedList[reorderedList.length - 2]?.order ?? reorderedList[reorderedList.length - 2]?.createdAt?.getTime() ?? Date.now();
      newOrderVal = prevOrder + 100000;
    } else {
      const prevOrder = reorderedList[newIndex - 1]?.order ?? reorderedList[newIndex - 1]?.createdAt?.getTime() ?? Date.now();
      const nextOrder = reorderedList[newIndex + 1]?.order ?? reorderedList[newIndex + 1]?.createdAt?.getTime() ?? Date.now();
      newOrderVal = (prevOrder + nextOrder) / 2;
    }

    // Optimistic Update: prevent snap-back by updating local state immediately
    dispatch({ type: 'SET_TASKS', payload: arrayMove(state.tasks, state.tasks.findIndex(t => t.id === activeId), state.tasks.findIndex(t => t.id === overId)) });

    try {
      await editTask(activeId, { order: newOrderVal });
    } catch (error) {
      console.error('Failed to reorder', error);
      // Wait for Firebase listener to resync if it fails
    }
  }, [user?.uid, filteredTasks, editTask]);

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const setActiveTag = useCallback((tag) => {
    dispatch({ type: 'SET_ACTIVE_TAG', payload: tag });
  }, []);

  const value = {
    ...state,
    filteredTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    overdueTasks,
    taskCounts,
    allTags,
    addTask,
    editTask,
    removeTask,
    toggleStatus,
    reorderTasks,
    setFilter,
    setActiveTag,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
