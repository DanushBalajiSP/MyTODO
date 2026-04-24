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

const TaskList = ({ tasks, overdueTasks, todayTasks, activeFilter, onToggle, onEdit, onDelete, onAddTask, onReorder, onSnooze }) => {
  const [activeTask, setActiveTask] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
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

  const isTodayFilter = activeFilter === FILTER_TYPES.TODAY;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="task-list">
        {isTodayFilter ? (
          <>
            {/* 1. Overdue Section */}
            {overdueTasks?.length > 0 && (
              <div className="task-section task-section--overdue">
                <h3 className="task-section__title">
                  Overdue
                  <span className="task-section__count">{overdueTasks.length}</span>
                </h3>
                <div className="task-section__list">
                  <SortableContext items={overdueTasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {overdueTasks.map((task) => (
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
              </div>
            )}

            {/* 2. Today Section */}
            <div className="task-section">
              <h3 className="task-section__title">
                {overdueTasks?.length > 0 ? "Today's Tasks" : "Tasks"}
                <span className="task-section__count">{todayTasks?.length || 0}</span>
              </h3>
              <div className="task-section__list">
                <SortableContext items={todayTasks?.map(t => t.id) || []} strategy={verticalListSortingStrategy}>
                  {todayTasks?.map((task) => (
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
            </div>
          </>
        ) : (
          /* Default flat list for other filters */
          <div className="task-section">
            <div className="task-section__list">
              <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
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
          </div>
        )}
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
