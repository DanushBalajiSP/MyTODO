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
 */
export const toggleTaskStatus = async (userId, taskId, currentStatus) => {
  const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
  const updates = {
    status: newStatus,
    updatedAt: serverTimestamp(),
    completedAt: newStatus === 'completed' ? serverTimestamp() : null,
  };

  await updateTask(userId, taskId, updates);
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
