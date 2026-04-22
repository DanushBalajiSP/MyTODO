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
} from 'firebase/firestore';
import { db } from '../lib/firebase';

const getNotesRef = (userId) => collection(db, 'users', userId, 'notes');
const getNoteDocRef = (userId, noteId) => doc(db, 'users', userId, 'notes', noteId);

/**
 * Create a new note
 * @returns {Promise<string>} The new note ID
 */
export const createNote = async (userId, noteData) => {
  const notesRef = getNotesRef(userId);
  const newNote = {
    title: noteData.title?.trim() || 'Untitled',
    content: noteData.content || '',
    color: noteData.color || 'default',
    pinned: noteData.pinned || false,
    tags: noteData.tags || [],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  const docRef = await addDoc(notesRef, newNote);
  return docRef.id;
};

/**
 * Update a note
 */
export const updateNote = async (userId, noteId, updates) => {
  const noteRef = getNoteDocRef(userId, noteId);
  const cleanUpdates = { ...updates };
  if (cleanUpdates.title !== undefined) {
    cleanUpdates.title = cleanUpdates.title.trim() || 'Untitled';
  }
  cleanUpdates.updatedAt = serverTimestamp();
  await updateDoc(noteRef, cleanUpdates);
};

/**
 * Delete a note
 */
export const deleteNote = async (userId, noteId) => {
  const noteRef = getNoteDocRef(userId, noteId);
  await deleteDoc(noteRef);
};

/**
 * Subscribe to real-time note updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToNotes = (userId, callback) => {
  const notesRef = getNotesRef(userId);
  const q = query(notesRef, orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const notes = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...docSnap.data(),
      createdAt: docSnap.data().createdAt?.toDate?.() || new Date(),
      updatedAt: docSnap.data().updatedAt?.toDate?.() || new Date(),
    }));
    callback(notes);
  });
};
