import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { subscribeToTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from '../services/taskService';
import { isToday, isUpcoming } from '../utils/dateUtils';
import { TASK_STATUS, FILTER_TYPES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

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
      dispatch({ type: 'SET_TASKS', payload: tasks });
    });

    return () => unsubscribe();
  }, [user?.uid]);

  // Computed task groups
  const todayTasks = useMemo(() =>
    state.tasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        (isToday(task.dueDate) || (!task.dueDate))
    ),
    [state.tasks]
  );

  const overdueTasks = useMemo(() =>
    state.tasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        task.dueDate &&
        !isToday(task.dueDate) &&
        !isUpcoming(task.dueDate)
    ),
    [state.tasks]
  );

  const upcomingTasks = useMemo(() =>
    state.tasks.filter(
      (task) =>
        task.status === TASK_STATUS.PENDING &&
        task.dueDate &&
        isUpcoming(task.dueDate)
    ),
    [state.tasks]
  );

  const completedTasks = useMemo(() =>
    state.tasks.filter((task) => task.status === TASK_STATUS.COMPLETED),
    [state.tasks]
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
        return state.tasks;
      default:
        return [...overdueTasks, ...todayTasks];
    }
  }, [state.activeFilter, overdueTasks, todayTasks, upcomingTasks, completedTasks, state.tasks]);

  // Task counts for badges
  const taskCounts = useMemo(() => ({
    today: todayTasks.length + overdueTasks.length,
    upcoming: upcomingTasks.length,
    completed: completedTasks.length,
    total: state.tasks.length,
  }), [todayTasks, overdueTasks, upcomingTasks, completedTasks, state.tasks]);

  // CRUD actions
  const addTask = useCallback(async (taskData) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const taskId = await createTask(user.uid, taskData);
      return taskId;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

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
      dispatch({ type: 'CLEAR_ERROR' });
      await toggleTaskStatus(user.uid, taskId, currentStatus);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const setFilter = useCallback((filter) => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  }, []);

  const value = {
    ...state,
    filteredTasks,
    todayTasks,
    upcomingTasks,
    completedTasks,
    overdueTasks,
    taskCounts,
    addTask,
    editTask,
    removeTask,
    toggleStatus,
    setFilter,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
