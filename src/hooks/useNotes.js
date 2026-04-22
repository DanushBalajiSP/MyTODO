import { useContext } from 'react';
import { NoteContext } from '../context/NoteContext';

export const useNotes = () => {
  const ctx = useContext(NoteContext);
  if (!ctx) throw new Error('useNotes must be used within NoteProvider');
  return ctx;
};
