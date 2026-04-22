import { useState } from 'react';
import { ListTodo, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useTasks } from '../hooks/useTasks';
import TaskList from '../components/tasks/TaskList';
import TaskForm from '../components/tasks/TaskForm';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import Loader from '../components/common/Loader';
import { FILTER_TYPES } from '../utils/constants';

const DashboardPage = ({ showTaskForm, setShowTaskForm }) => {
  const {
    filteredTasks,
    activeFilter,
    setFilter,
    taskCounts,
    loading,
    addTask,
    editTask,
    removeTask,
    toggleStatus,
    reorderTasks,
    activeTag,
    setActiveTag,
  } = useTasks();

  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  // Open form for creating
  const handleAddTask = () => {
    setEditingTask(null);
    setShowTaskForm(true);
  };

  // Open form for editing
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskForm(true);
  };

  // Submit create/edit form
  const handleFormSubmit = async (formData) => {
    setFormLoading(true);
    try {
      if (editingTask) {
        await editTask(editingTask.id, formData);
      } else {
        await addTask(formData);
      }
      setShowTaskForm(false);
      setEditingTask(null);
    } catch (err) {
      console.error('Task operation failed:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Snooze / Reschedule task
  const handleSnoozeTask = async (taskId, newDate) => {
    try {
      await editTask(taskId, { dueDate: newDate });
    } catch (err) {
      console.error('Snooze failed:', err);
    }
  };

  // Delete task
  const handleDeleteConfirm = async () => {
    if (!deletingTask) return;
    try {
      await removeTask(deletingTask.id);
      setDeletingTask(null);
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  if (loading) {
    return <Loader text="Loading your tasks..." />;
  }

  return (
    <div className="dashboard">
      {/* Stats bar */}
      <div className="stats-bar">
        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--primary">
            <ListTodo size={20} />
          </div>
          <div>
            <p className="stats-card__value">{taskCounts.today}</p>
            <p className="stats-card__label">Today</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--warning">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="stats-card__value">{taskCounts.upcoming}</p>
            <p className="stats-card__label">Upcoming</p>
          </div>
        </div>
        <div className="stats-card">
          <div className="stats-card__icon stats-card__icon--success">
            <CheckCircle size={20} />
          </div>
          <div>
            <p className="stats-card__value">{taskCounts.completed}</p>
            <p className="stats-card__label">Done</p>
          </div>
        </div>
      </div>

      {/* Filter tabs (mobile-friendly inline) */}
      <div className="task-filters">
        {[
          { id: FILTER_TYPES.TODAY, label: 'Today', count: taskCounts.today },
          { id: FILTER_TYPES.UPCOMING, label: 'Upcoming', count: taskCounts.upcoming },
          { id: FILTER_TYPES.COMPLETED, label: 'Completed', count: taskCounts.completed },
        ].map((tab) => (
          <button
            key={tab.id}
            className={`task-filters__tab ${activeFilter === tab.id ? 'task-filters__tab--active' : ''}`}
            onClick={() => setFilter(tab.id)}
          >
            {tab.label}
            <span className="task-filters__count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Active Tag indicator */}
      {activeTag && (
        <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Filtering by tag:</span>
          <span className="tag-chip">
            #{activeTag}
            <button onClick={() => setActiveTag(null)}>✕</button>
          </span>
        </div>
      )}

      {/* Task list */}
      <TaskList
        tasks={filteredTasks}
        activeFilter={activeFilter}
        onToggle={toggleStatus}
        onEdit={handleEditTask}
        onDelete={setDeletingTask}
        onAddTask={handleAddTask}
        onReorder={reorderTasks}
        onSnooze={handleSnoozeTask}
      />



      {/* Create/Edit Modal */}
      <Modal
        isOpen={showTaskForm}
        onClose={() => {
          setShowTaskForm(false);
          setEditingTask(null);
        }}
        title={editingTask ? 'Edit Task' : 'New Task'}
      >
        <TaskForm
          task={editingTask}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowTaskForm(false);
            setEditingTask(null);
          }}
          loading={formLoading}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingTask}
        onClose={() => setDeletingTask(null)}
        title="Delete Task"
      >
        <div className="confirm-dialog">
          <div className="confirm-dialog__icon">
            <AlertTriangle size={28} />
          </div>
          <h3 className="confirm-dialog__title">Are you sure?</h3>
          <p className="confirm-dialog__message">
            This will permanently delete "<strong>{deletingTask?.title}</strong>".
            This action cannot be undone.
          </p>
          <div className="confirm-dialog__actions">
            <Button variant="ghost" size="md" onClick={() => setDeletingTask(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
              Delete Task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DashboardPage;
