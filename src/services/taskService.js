import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

/**
 * Get reference to a user's tasks subcollection
 */
const getTasksRef = (userId) => collection(db, 'users', userId, 'tasks');

/**
 * Get reference to a specific task document
 */
const getTaskDocRef = (userId, taskId) => doc(db, 'users', userId, 'tasks', taskId);

/**
 * Create a new task
 * @returns {Promise<string>} The new task ID
 */
export const createTask = async (userId, taskData) => {
  const tasksRef = getTasksRef(userId);

  const newTask = {
    title: taskData.title.trim(),
    description: taskData.description?.trim() || '',
    dueDate: taskData.dueDate instanceof Date
      ? Timestamp.fromDate(taskData.dueDate)
      : taskData.dueDate,
    status: 'pending',
    priority: taskData.priority || 'medium',
    tags: taskData.tags || [],
    isRecurring: false,
    recurringPattern: null,
    order: taskData.order || 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    completedAt: null,
  };

  const docRef = await addDoc(tasksRef, newTask);
  return docRef.id;
};

/**
 * Update an existing task
 */
export const updateTask = async (userId, taskId, updates) => {
  const taskRef = getTaskDocRef(userId, taskId);

  const cleanUpdates = { ...updates };

  if (cleanUpdates.title) {
    cleanUpdates.title = cleanUpdates.title.trim();
  }
  if (cleanUpdates.description !== undefined) {
    cleanUpdates.description = cleanUpdates.description.trim();
  }
  if (cleanUpdates.dueDate instanceof Date) {
    cleanUpdates.dueDate = Timestamp.fromDate(cleanUpdates.dueDate);
  }

  cleanUpdates.updatedAt = serverTimestamp();

  await updateDoc(taskRef, cleanUpdates);
};

/**
 * Delete a task
 */
export const deleteTask = async (userId, taskId) => {
  const taskRef = getTaskDocRef(userId, taskId);
  await deleteDoc(taskRef);
};

/**
 * Toggle task between pending and completed
 * Also handles recurring logic
 */
export const toggleTaskStatus = async (userId, task) => {
  const newStatus = task.status === 'pending' ? 'completed' : 'pending';
  const isCompleting = newStatus === 'completed';
  const taskRef = getTaskDocRef(userId, task.id);
  
  const updates = {
    status: newStatus,
    updatedAt: serverTimestamp(),
    completedAt: isCompleting ? serverTimestamp() : null,
  };

  // If completing a recurring task, clone it for the next occurrence
  if (isCompleting && task.isRecurring && task.recurringPattern !== 'none') {
    const nextDueDate = new Date(task.dueDate || new Date());
    
    // Add time based on pattern
    if (task.recurringPattern === 'daily') {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (task.recurringPattern === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    }
    
    // Create new spawn task
    const cloneData = {
      ...task,
      dueDate: nextDueDate,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      completedAt: null,
    };
    // remove the id so it creates a new doc
    delete cloneData.id;
    
    await createTask(userId, cloneData);
  }

  await updateDoc(taskRef, updates);
};

/**
 * Update the order of tasks (reordering hook)
 */
export const updateTaskOrder = async (userId, taskIds) => {
  // To keep it simple without full batched writes, loop through and update.
  // In production, we'd use writeBatch
  const promises = taskIds.map((taskId, index) => {
    const taskRef = getTaskDocRef(userId, taskId);
    return updateDoc(taskRef, { order: index, updatedAt: serverTimestamp() });
  });
  await Promise.all(promises);
};

/**
 * Subscribe to real-time task updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTasks = (userId, callback) => {
  const tasksRef = getTasksRef(userId);
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore Timestamps to JS Dates for easier handling
      dueDate: doc.data().dueDate?.toDate?.() || null,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
      completedAt: doc.data().completedAt?.toDate?.() || null,
    }));
    callback(tasks);
  });
};
