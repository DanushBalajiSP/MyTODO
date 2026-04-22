import { useState, useRef, useEffect } from 'react';
import { Check, Clock, Pencil, Trash2, GripVertical, Repeat, AlarmClock, ChevronDown } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDueDate, formatTime, getDateUrgency } from '../../utils/dateUtils';
import { TASK_PRIORITY } from '../../utils/constants';

/* ------------------------------------------------------------------
   Snooze dropdown options
------------------------------------------------------------------- */
const snoozeOptions = [
  { label: '1 hour',     getValue: () => { const d = new Date(); d.setHours(d.getHours() + 1, 0, 0, 0); return d; } },
  { label: 'Tonight 9pm', getValue: () => { const d = new Date(); d.setHours(21, 0, 0, 0); return d; } },
  { label: 'Tomorrow',   getValue: () => { const d = new Date(); d.setDate(d.getDate() + 1); d.setHours(9, 0, 0, 0); return d; } },
  { label: 'Next week',  getValue: () => { const d = new Date(); d.setDate(d.getDate() + 7); d.setHours(9, 0, 0, 0); return d; } },
];

const SnoozeMenu = ({ onSnooze, onClose }) => {
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="snooze-menu" ref={ref}>
      <div className="snooze-menu__header">
        <AlarmClock size={13} /> Snooze / Reschedule
      </div>
      {snoozeOptions.map(opt => (
        <button
          key={opt.label}
          className="snooze-menu__item"
          onClick={(e) => { e.stopPropagation(); onSnooze(opt.getValue()); onClose(); }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------
   TaskCard
------------------------------------------------------------------- */
const TaskCard = ({ task, onToggle, onEdit, onDelete, onSnooze }) => {
  const isCompleted = task.status === 'completed';
  const urgency = getDateUrgency(task.dueDate);

  const [animState, setAnimState] = useState(null);
  const [showSnooze, setShowSnooze] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition,
    opacity: isDragging ? 0 : 1,
  };

  const handleToggle = (e) => {
    e.stopPropagation();
    if (isCompleted) {
      onToggle(task.id, task.status);
      return;
    }
    setAnimState('completing');
    setTimeout(() => {
      setAnimState('exiting');
      setTimeout(() => {
        setAnimState(null);
        onToggle(task.id, task.status);
      }, 450);
    }, 350);
  };

  const stopClick = (e) => e.stopPropagation();

  const handleEdit = (e) => { e.stopPropagation(); onEdit(task); };
  const handleDelete = (e) => { e.stopPropagation(); onDelete(task); };
  const handleSnoozeClick = (e) => { e.stopPropagation(); setShowSnooze(s => !s); };

  const handleSnooze = (newDate) => {
    if (onSnooze) onSnooze(task.id, newDate);
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case TASK_PRIORITY.HIGH: return 'priority-high';
      case TASK_PRIORITY.MEDIUM: return 'priority-medium';
      case TASK_PRIORITY.LOW: return 'priority-low';
      default: return 'priority-medium';
    }
  };

  const cardClass = [
    'task-card',
    isCompleted ? 'task-card--completed' : '',
    animState === 'completing' ? 'task-card--completing' : '',
    animState === 'exiting' ? 'task-card--exiting' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cardClass}
      onClick={handleEdit}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      {/* Drag Handle */}
      <div
        className="task-card__drag-handle"
        {...attributes}
        {...listeners}
        onClick={e => e.stopPropagation()}
        tabIndex={-1}
      >
        <GripVertical size={16} />
      </div>

      {/* Checkbox */}
      <div className="task-card__checkbox" onClick={stopClick}>
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={handleToggle}
          aria-label={`Mark "${task.title}" as ${isCompleted ? 'pending' : 'completed'}`}
        />
        <div className="task-card__checkmark">
          <Check size={14} className="task-card__checkmark-icon" />
        </div>
      </div>

      {/* Content */}
      <div className="task-card__content">
        <h3 className="task-card__title">
          <span className={`priority-indicator ${getPriorityClass()}`} />
          {task.title}
          {task.isRecurring && (
            <span style={{ marginLeft: '6px', color: 'var(--text-tertiary)', display: 'inline-flex', verticalAlign: 'text-bottom' }} title={`Recurs ${task.recurringPattern}`}>
              <Repeat size={14} />
            </span>
          )}
        </h3>
        
        {task.description && (
          <p className="task-card__description">{task.description}</p>
        )}
        
        <div className="task-card__meta">
          {task.dueDate && (
            <span className={`task-card__due-badge task-card__due-badge--${urgency}`}>
              <Clock size={12} />
              {formatDueDate(task.dueDate)}
              {' · '}
              {formatTime(task.dueDate)}
            </span>
          )}
          
          {task.tags && task.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
              {task.tags.map(tag => (
                <span key={tag} className="tag-chip">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="task-card__actions" onClick={stopClick} style={{ position: 'relative' }}>
        {/* Snooze button — only for pending tasks */}
        {!isCompleted && (
          <>
            <button
              className="task-card__action-btn"
              onClick={handleSnoozeClick}
              aria-label="Snooze task"
              title="Snooze / Reschedule"
            >
              <AlarmClock size={15} />
              <ChevronDown size={11} />
            </button>
            {showSnooze && (
              <SnoozeMenu onSnooze={handleSnooze} onClose={() => setShowSnooze(false)} />
            )}
          </>
        )}
        <button
          className="task-card__action-btn"
          onClick={handleEdit}
          aria-label="Edit task"
          title="Edit"
        >
          <Pencil size={16} />
        </button>
        <button
          className="task-card__action-btn task-card__action-btn--delete"
          onClick={handleDelete}
          aria-label="Delete task"
          title="Delete"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
