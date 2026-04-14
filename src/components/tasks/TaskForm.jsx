import { useState, useEffect, useMemo } from 'react';
import { X, Plus } from 'lucide-react';
import Button from '../common/Button';
import { formatForInput } from '../../utils/dateUtils';
import { TASK_PRIORITY, TAG_RULES, DEFAULT_TAGS, RECURRING_PATTERN } from '../../utils/constants';



const TaskForm = ({ task, onSubmit, onCancel, loading }) => {
  const isEditing = !!task;

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: TASK_PRIORITY.MEDIUM,
    isRecurring: false,
    recurringPattern: RECURRING_PATTERN.NONE,
    tags: [],
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState({});

  // Populate form when editing
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        dueDate: task.dueDate ? formatForInput(task.dueDate) : '',
        priority: task.priority || TASK_PRIORITY.MEDIUM,
        isRecurring: task.isRecurring || false,
        recurringPattern: task.recurringPattern || RECURRING_PATTERN.NONE,
        tags: task.tags || [],
      });
    } else {
      // Default due date: today at next hour
      const now = new Date();
      now.setHours(now.getHours() + 1, 0, 0, 0);
      setFormData({
        title: '',
        description: '',
        dueDate: formatForInput(now),
        priority: TASK_PRIORITY.MEDIUM,
        isRecurring: false,
        recurringPattern: RECURRING_PATTERN.NONE,
        tags: [],
      });
    }
  }, [task]);

  // Compute smart suggested tags based on title
  const suggestedTags = useMemo(() => {
    const titleLower = formData.title.toLowerCase();
    const suggestions = new Set();
    
    // Check keywords
    TAG_RULES.forEach(rule => {
      if (rule.keywords.some(kw => titleLower.includes(kw))) {
        suggestions.add(rule.tag);
      }
    });

    // Add some randomized defaults if we don't have enough
    const randomizedDefaults = [...DEFAULT_TAGS].sort(() => 0.5 - Math.random());
    for (const tag of randomizedDefaults) {
      if (suggestions.size >= 4) break;
      suggestions.add(tag);
    }

    // Filter out tags already added
    return Array.from(suggestions).filter(tag => !formData.tags.includes(tag));
  }, [formData.title, formData.tags]);

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
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error on change
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Tag management
  const addTag = (tagToAdd) => {
    const cleanTag = tagToAdd.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (cleanTag && !formData.tags.includes(cleanTag) && formData.tags.length < 5) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, cleanTag] }));
      setTagInput('');
    }
  };

  const handleTagInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Recurring logic setup
  const handleRecurringChange = (e) => {
    const pattern = e.target.value;
    setFormData(prev => ({
      ...prev,
      recurringPattern: pattern,
      isRecurring: pattern !== RECURRING_PATTERN.NONE
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    // Flush any pending tag before submitting if tagInput has text
    let finalTags = formData.tags;
    if (tagInput.trim()) {
       const cleanTag = tagInput.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
       if (cleanTag && !finalTags.includes(cleanTag) && finalTags.length < 5) {
          finalTags = [...finalTags, cleanTag];
       }
    }

    onSubmit({
      title: formData.title,
      description: formData.description,
      dueDate: new Date(formData.dueDate),
      priority: formData.priority,
      isRecurring: formData.isRecurring,
      recurringPattern: formData.recurringPattern,
      tags: finalTags,
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-4)' }}>
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

        {/* Priority */}
        <div className="task-form__group">
          <label className="task-form__label" htmlFor="task-priority">
            Priority
          </label>
          <select
            id="task-priority"
            className="task-form__input"
            value={formData.priority}
            onChange={handleChange('priority')}
          >
            <option value={TASK_PRIORITY.LOW}>Low</option>
            <option value={TASK_PRIORITY.MEDIUM}>Medium</option>
            <option value={TASK_PRIORITY.HIGH}>High</option>
          </select>
        </div>

        {/* Recurring */}
        <div className="task-form__group">
          <label className="task-form__label" htmlFor="task-recurring">
            Repeat
          </label>
          <select
            id="task-recurring"
            className="task-form__input"
            value={formData.recurringPattern}
            onChange={handleRecurringChange}
          >
            <option value={RECURRING_PATTERN.NONE}>Does not repeat</option>
            <option value={RECURRING_PATTERN.DAILY}>Daily</option>
            <option value={RECURRING_PATTERN.WEEKLY}>Weekly</option>
          </select>
        </div>
      </div>

      {/* Tags */}
      <div className="task-form__group">
        <label className="task-form__label" htmlFor="task-tags">
          Tags (max 5)
        </label>
        
        {/* Active Tags */}
        {formData.tags.length > 0 && (
          <div className="task-form__tags-list">
            {formData.tags.map(tag => (
              <span key={tag} className="tag-chip">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label="Remove tag">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag Input */}
        {formData.tags.length < 5 && (
          <div className="task-form__tag-input-container">
            <input
              id="task-tags"
              type="text"
              className="task-form__input"
              placeholder="Type a tag and press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagInputKeyDown}
              maxLength={20}
            />
            <button 
              type="button" 
              className="tag-add-btn"
              onClick={() => addTag(tagInput)}
              disabled={!tagInput.trim()}
            >
              <Plus size={18} />
            </button>
          </div>
        )}

        {/* Suggested Tags */}
        {suggestedTags.length > 0 && formData.tags.length < 5 && (
          <div className="task-form__suggestions">
            <span className="suggestions-label">Suggested:</span>
            {suggestedTags.map(tag => (
              <button 
                type="button" 
                key={tag} 
                className="tag-suggestion-chip"
                onClick={() => addTag(tag)}
              >
                +{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-color)' }}>
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
