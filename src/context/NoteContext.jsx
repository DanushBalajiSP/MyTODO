import { createContext, useReducer, useEffect, useCallback, useMemo } from 'react';
import { subscribeToNotes, createNote, updateNote, deleteNote } from '../services/noteService';
import { useAuth } from '../hooks/useAuth';

export const NoteContext = createContext(null);

const noteReducer = (state, action) => {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.payload, loading: false };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  notes: [],
  loading: true,
  error: null,
};

export const NoteProvider = ({ children }) => {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(noteReducer, initialState);

  useEffect(() => {
    if (!user?.uid) {
      dispatch({ type: 'SET_NOTES', payload: [] });
      return;
    }
    dispatch({ type: 'SET_LOADING', payload: true });
    const unsubscribe = subscribeToNotes(user.uid, (notes) => {
      dispatch({ type: 'SET_NOTES', payload: notes });
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const addNote = useCallback(async (noteData) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      const id = await createNote(user.uid, noteData);
      return id;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const editNote = useCallback(async (noteId, updates) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await updateNote(user.uid, noteId, updates);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const removeNote = useCallback(async (noteId) => {
    if (!user?.uid) return;
    try {
      dispatch({ type: 'CLEAR_ERROR' });
      await deleteNote(user.uid, noteId);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  }, [user?.uid]);

  const pinnedNotes = useMemo(() => state.notes.filter(n => n.pinned), [state.notes]);
  const unpinnedNotes = useMemo(() => state.notes.filter(n => !n.pinned), [state.notes]);

  const value = {
    ...state,
    pinnedNotes,
    unpinnedNotes,
    addNote,
    editNote,
    removeNote,
  };

  return (
    <NoteContext.Provider value={value}>
      {children}
    </NoteContext.Provider>
  );
};
