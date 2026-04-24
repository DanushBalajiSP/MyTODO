import { useEffect, useRef } from 'react';
import { useTasks } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';
import { sendNotification } from '../../context/FocusContext';

const NOTIFIED_KEY = 'mytodo_notified_triggers';

const getNotified = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '[]'));
  } catch { return new Set(); }
};

const saveNotified = (set) => {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify(Array.from(set)));
};

/**
 * Background component that monitors tasks and notes to trigger local notifications.
 */
const NotificationScheduler = () => {
  const { tasks } = useTasks();
  const { notes } = useNotes();
  const notifiedRef = useRef(getNotified());

  useEffect(() => {
    const checkTriggers = () => {
      const now = new Date();
      const notified = notifiedRef.current;
      let changed = false;

      // 1. Pending Tasks - 10 Minute Reminder
      tasks.forEach(task => {
        if (task.status === 'pending' && task.dueDate) {
          const due = new Date(task.dueDate);
          const diffMs = due.getTime() - now.getTime();
          const diffMins = Math.floor(diffMs / 60000);

          // If due in 9-11 minutes (to catch it in the 1min interval)
          if (diffMins === 10 && !notified.has(`due10m_${task.id}`)) {
            sendNotification(
              '⏰ Task starting soon',
              `"${task.title}" is due in 10 minutes.`
            );
            notified.add(`due10m_${task.id}`);
            changed = true;
          }
        }
      });

      // 2. Draft Reminders (Keyword "draft" in title or content)
      tasks.forEach(task => {
        const isDraft = task.title?.toLowerCase().includes('draft') || 
                        task.description?.toLowerCase().includes('draft');
        if (isDraft && !notified.has(`draft_task_${task.id}`)) {
          sendNotification(
            '📝 Finish your draft',
            `You have an unfinished draft task: "${task.title}"`
          );
          notified.add(`draft_task_${task.id}`);
          changed = true;
        }
      });

      notes.forEach(note => {
        const isDraft = note.title?.toLowerCase().includes('draft') || 
                        note.content?.toLowerCase().includes('draft');
        if (isDraft && !notified.has(`draft_note_${note.id}`)) {
          sendNotification(
            '🗒️ Finish your draft note',
            `You have an unfinished draft note: "${note.title}"`
          );
          notified.add(`draft_note_${note.id}`);
          changed = true;
        }
      });

      if (changed) {
        saveNotified(notified);
      }
    };

    // Run every minute
    const interval = setInterval(checkTriggers, 60000);
    
    // Initial check after a short delay
    const timeout = setTimeout(checkTriggers, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [tasks, notes]);

  return null; // Silent background component
};

export default NotificationScheduler;
