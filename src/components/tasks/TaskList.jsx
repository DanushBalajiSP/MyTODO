import TaskCard from './TaskCard';
import EmptyState from '../common/EmptyState';
import { ClipboardList, CheckCircle2, CalendarRange, Inbox } from 'lucide-react';
import { FILTER_TYPES } from '../../utils/constants';

const emptyStateConfig = {
  [FILTER_TYPES.TODAY]: {
    icon: ClipboardList,
    title: 'No tasks for today',
    description: 'You\'re all caught up! Add a new task or enjoy your free time.',
  },
  [FILTER_TYPES.UPCOMING]: {
    icon: CalendarRange,
    title: 'No upcoming tasks',
    description: 'Plan ahead by creating tasks with future due dates.',
  },
  [FILTER_TYPES.COMPLETED]: {
    icon: CheckCircle2,
    title: 'No completed tasks yet',
    description: 'Start checking off tasks to see them here.',
  },
  [FILTER_TYPES.ALL]: {
    icon: Inbox,
    title: 'No tasks yet',
    description: 'Create your first task and get started!',
  },
};

const TaskList = ({ tasks, activeFilter, onToggle, onEdit, onDelete, onAddTask }) => {
  if (tasks.length === 0) {
    const config = emptyStateConfig[activeFilter] || emptyStateConfig[FILTER_TYPES.ALL];
    return (
      <EmptyState
        icon={config.icon}
        title={config.title}
        description={config.description}
        actionLabel={activeFilter !== FILTER_TYPES.COMPLETED ? 'Add Task' : undefined}
        onAction={activeFilter !== FILTER_TYPES.COMPLETED ? onAddTask : undefined}
      />
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskCard
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        </div>
      ))}
    </div>
  );
};

export default TaskList;
