import { Check, Clock, Pencil, Trash2 } from 'lucide-react';
import { formatDueDate, formatTime, getDateUrgency } from '../../utils/dateUtils';

const TaskCard = ({ task, onToggle, onEdit, onDelete }) => {
  const isCompleted = task.status === 'completed';
  const urgency = getDateUrgency(task.dueDate);

  const handleToggle = (e) => {
    e.stopPropagation();
    onToggle(task.id, task.status);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(task);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(task);
  };

  return (
    <div
      className={`task-card ${isCompleted ? 'task-card--completed' : ''}`}
      onClick={handleEdit}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
    >
      {/* Checkbox */}
      <div className="task-card__checkbox">
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
        <h3 className="task-card__title">{task.title}</h3>
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
