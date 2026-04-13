import { useState, useEffect } from 'react';
import Button from '../common/Button';
import { formatForInput } from '../../utils/dateUtils';

const TaskForm = ({ task, onSubmit, onCancel, loading }) => {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
  });

  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? formatForInput(task.dueDate) : '',
      });
    } else {
      // Default due date: today at next hour
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setFormData({
        title: '',
        description: '',
        dueDate: formatForInput(now),
      });
    }
  }, [task]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
    });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {/* Title */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="task-title">
          Title <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="task-title"
          type="text"
          className="task-form__input"
          placeholder="What needs to be done?"
          value={formData.title}
          onChange={handleChange('title')}
          autoFocus
          maxLength={200}
        />
        {errors.title && <span className="task-form__error">{errors.title}</span>}
      </div>

      {/* Description */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="task-description">
          Description
        </label>
        <textarea
          id="task-description"
          className="task-form__textarea"
          placeholder="Add details about this task..."
          value={formData.description}
          onChange={handleChange('description')}
          maxLength={1000}
        />
      </div>

      {/* Due Date */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="task-due-date">
          Due Date & Time <span style={{ color: 'var(--danger)' }}>*</span>
        </label>
        <input
          id="task-due-date"
          type="datetime-local"
          className="task-form__input"
          value={formData.dueDate}
          onChange={handleChange('dueDate')}
        />
        {errors.dueDate && <span className="task-form__error">{errors.dueDate}</span>}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-2)' }}>
        <Button type="button" variant="ghost" size="md" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="md" loading={loading}>
          {isEditing ? 'Save Changes' : 'Create Task'}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
