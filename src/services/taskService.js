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
  writeBatch,
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
      : taskData.dueDate || null,
    status: 'pending',
    priority: taskData.priority || 'medium',
    tags: taskData.tags || [],
    isRecurring: taskData.isRecurring || false,
    recurringPattern: taskData.recurringPattern || null,
    order: taskData.order ?? 0,
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
 * Toggle task between pending and completed.
 * If the task is recurring, automatically spawns the next occurrence.
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
  if (isCompleting && task.isRecurring && task.recurringPattern && task.recurringPattern !== 'none') {
    const nextDueDate = new Date(task.dueDate || new Date());

    if (task.recurringPattern === 'daily') {
      nextDueDate.setDate(nextDueDate.getDate() + 1);
    } else if (task.recurringPattern === 'weekly') {
      nextDueDate.setDate(nextDueDate.getDate() + 7);
    }

    // Build a clean clone — omit id and Firestore-managed timestamps
    const { id: _id, createdAt: _ca, updatedAt: _ua, completedAt: _co, ...rest } = task;
    const cloneData = {
      ...rest,
      dueDate: nextDueDate,
      status: 'pending',
    };

    await createTask(userId, cloneData);
  }

  await updateDoc(taskRef, updates);
};

/**
 * Atomically update the display order of a set of tasks using a write batch.
 * Much more efficient than N individual updateDoc calls.
 */
export const updateTaskOrder = async (userId, taskIds) => {
  const batch = writeBatch(db);
  taskIds.forEach((taskId, index) => {
    const taskRef = getTaskDocRef(userId, taskId);
    batch.update(taskRef, { order: index, updatedAt: serverTimestamp() });
  });
  await batch.commit();
};

/**
 * Subscribe to real-time task updates, ordered by custom sort order.
 * @returns {Function} Unsubscribe function
 */
export const subscribeToTasks = (userId, callback) => {
  const tasksRef = getTasksRef(userId);
  // Only order by createdAt to avoid requiring a composite Firestore index.
  // The local TaskContext handles the actual visual sorting (by order -> priority -> etc).
  const q = query(tasksRef, orderBy('createdAt', 'desc'));

  return onSnapshot(q, (snapshot) => {
    const tasks = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      // Normalize all Firestore Timestamps to JS Dates in one place
      dueDate: docSnap.data().dueDate?.toDate?.() || null,
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
      completedAt: docSnap.data().completedAt?.toDate?.() || null,
    }));
    callback(tasks);
  });
};
