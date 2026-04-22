import { useState } from 'react';
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
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

const emptyStateConfig = {
  [FILTER_TYPES.TODAY]: {
    icon: ClipboardList,
    title: 'No tasks for today',
    description: "You're all caught up! Add a new task or enjoy your free time.",
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

const TaskList = ({ tasks, activeFilter, onToggle, onEdit, onDelete, onAddTask, onReorder, onSnooze }) => {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Require at least 8px of movement before drag starts — prevents
        // accidental drags when clicking checkboxes or edit buttons.
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const found = tasks.find(t => t.id === active.id);
    setActiveTask(found ?? null);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveTask(null);
    if (active.id !== over?.id && onReorder) {
      onReorder(active.id, over.id);
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
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

  const taskIds = tasks.map(t => t.id);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="task-list">
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggle={onToggle}
              onEdit={onEdit}
              onDelete={onDelete}
              onSnooze={onSnooze}
            />
          ))}
        </SortableContext>
      </div>

      {/* DragOverlay renders the floating "ghost" card that follows your cursor */}
      <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
        {activeTask ? (
          <div style={{ boxShadow: '0 20px 40px rgba(0,0,0,0.25)', borderRadius: '1rem', opacity: 0.95, rotate: '1.5deg', cursor: 'grabbing' }}>
            <TaskCard
              task={activeTask}
              onToggle={() => {}}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskList;
