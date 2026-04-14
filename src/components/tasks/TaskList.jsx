import TaskCard from './TaskCard';
import EmptyState from '../common/EmptyState';
import { ClipboardList, CheckCircle2, CalendarRange, Inbox } from 'lucide-react';
import { FILTER_TYPES } from '../../utils/constants';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors 
} from '@dnd-kit/core';
import { 
  SortableContext, 
  sortableKeyboardCoordinates,
  verticalListSortingStrategy 
} from '@dnd-kit/sortable';

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

const TaskList = ({ tasks, activeFilter, onToggle, onEdit, onDelete, onAddTask, onReorder }) => {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Raised from 5 → 8px for better mobile touch accuracy
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over?.id && onReorder) {
      onReorder(active.id, over?.id);
    }
  };

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

  // We only allow reordering if we are in the 'TODAY' or general lists, maybe disabled in Completed.
  // Actually dnd-kit can manage list of IDs.
  const taskIds = tasks.map(t => t.id);

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="task-list">
        <SortableContext 
          items={taskIds}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};

export default TaskList;
