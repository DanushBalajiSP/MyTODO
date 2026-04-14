import { Check, Clock, Pencil, Trash2, GripVertical, Repeat } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { formatDueDate, formatTime, getDateUrgency } from '../../utils/dateUtils';
import { TASK_PRIORITY } from '../../utils/constants';

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const urgency = getDateUrgency(task.dueDate);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition: isDragging ? 'none' : transition,
    opacity: isDragging ? 0.4 : undefined,
    zIndex: isDragging ? 2 : undefined,
    position: isDragging ? 'relative' : undefined,
  };

  const handleToggle = (e) => {
    // Stop BOTH change and click from reaching parent card
    e.stopPropagation();
    onToggle(task.id, task.status);
  };

  const stopClick = (e) => {
    e.stopPropagation();
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task);
  };

  const getPriorityClass = () => {
    switch (task.priority) {
      case TASK_PRIORITY.HIGH: return 'priority-high';
      case TASK_PRIORITY.MEDIUM: return 'priority-medium';
      case TASK_PRIORITY.LOW: return 'priority-low';
      default: return 'priority-medium';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`task-card ${isCompleted ? 'task-card--completed' : ''}`}
      onClick={handleEdit}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      {/* Drag Handle */}
      {/* Exclude drag handle from Edit trigger by stopping propagation, though dnd-kit handles it */}
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
          
          {/* Tags */}
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
      <div className="task-card__actions">
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
