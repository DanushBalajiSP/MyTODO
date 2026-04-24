import { useMemo } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useNotes } from '../hooks/useNotes';
import { useFocus } from '../context/FocusContext';
import { Clock, CheckCircle2, StickyNote, Flame, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { StreakWidget } from '../components/productivity/FocusStreak';

const HomeWidgetPage = () => {
  const { user } = useAuth();
  const { todayTasks, taskCounts } = useTasks();
  const { pinnedNotes } = useNotes();
  const navigate = useNavigate();

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  }, []);

  return (
    <div className="home-widgets">
      {/* 1. Header Greeting Widget */}
      <div className="widget widget--hero">
        <div className="widget__hero-content">
          <p className="widget__greeting">{greeting},</p>
          <h1 className="widget__user-name">{user?.displayName?.split(' ')[0] || 'Friend'}!</h1>
          <p className="widget__subtitle">You have {taskCounts.today} tasks for today.</p>
        </div>
        <div className="widget__clock">
           <Clock size={40} strokeWidth={1.5} opacity={0.4} />
        </div>
      </div>

      <div className="widgets-grid">
        {/* 2. Streak Widget (Crazy 3D) */}
        <div className="widget widget--streak" onClick={() => navigate('/analytics')}>
           <div className="widget__header">
             <Flame size={16} className="text-orange" />
             <span>Active Streak</span>
           </div>
           <StreakWidget isMinimal />
        </div>

        {/* 3. Pinned Notes Widget (Horizontal) */}
        <div className="widget widget--notes">
          <div className="widget__header">
             <div className="flex items-center gap-2">
               <StickyNote size={16} />
               <span>Pinned Ideas</span>
             </div>
             <button className="widget__action-btn" onClick={() => navigate('/notes')}>
               See All <ArrowRight size={14} />
             </button>
          </div>
          <div className="widget__horizontal-scroll">
            {pinnedNotes.length > 0 ? (
              pinnedNotes.map(note => (
                <div 
                  key={note.id} 
                  className="mini-note-card"
                  onClick={() => navigate('/notes')}
                  style={{ background: note.color !== 'default' ? 'var(--note-bg)' : 'var(--bg-hover)' }}
                >
                  <h4>{note.title}</h4>
                  <p>{note.content?.replace(/<[^>]+>/g, '').slice(0, 40)}...</p>
                </div>
              ))
            ) : (
              <div className="widget__empty">No pinned notes</div>
            )}
          </div>
        </div>

        {/* 4. Quick Tasks Widget */}
        <div className="widget widget--tasks">
           <div className="widget__header">
             <div className="flex items-center gap-2">
               <CheckCircle2 size={16} />
               <span>Up Next</span>
             </div>
             <button className="widget__action-btn" onClick={() => navigate('/tasks')}>
               Go to Tasks <ArrowRight size={14} />
             </button>
           </div>
           <div className="widget__task-stack">
             {todayTasks.slice(0, 3).map((task, idx) => (
               <div key={task.id} className="mini-task-item" style={{ '--idx': idx }}>
                 <div className={`mini-task-priority priority-${task.priority}`} />
                 <span className="mini-task-title">{task.title}</span>
               </div>
             ))}
             {todayTasks.length === 0 && <div className="widget__empty">All caught up!</div>}
             {todayTasks.length > 3 && (
               <p className="widget__more">+{todayTasks.length - 3} more tasks</p>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default HomeWidgetPage;
