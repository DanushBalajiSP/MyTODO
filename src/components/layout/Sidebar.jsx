import {
  CheckSquare, LogOut, Moon, Sun, BarChart3,
  StickyNote, ListTodo, Tag, LayoutDashboard
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { useNotes } from '../../hooks/useNotes';

const Sidebar = ({ isOpen, onClose, isDark, onToggleTheme }) => {
  const { user, signOut, requestNotificationPermission } = useAuth();
  const { tasks, taskCounts, activeTag, setActiveTag } = useTasks();
  const { notes } = useNotes();

  const allTags = Array.from(new Set([
    ...tasks.flatMap(t => t.tags || []),
    ...notes.flatMap(n => n.tags || [])
  ])).sort();

  const navigate = useNavigate();
  const location = useLocation();

  const isHome     = location.pathname === '/' || location.pathname === '/dashboard';
  const isNotes    = location.pathname === '/notes';
  const isTasks    = location.pathname === '/tasks';
  const isAnalytics = location.pathname === '/analytics';
  const isProfile  = location.pathname === '/profile';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

  const nav = (path) => { navigate(path); onClose?.(); };

  // Pending task count for Tasks badge
  const pendingCount = taskCounts.today + taskCounts.upcoming;

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? 'sidebar-overlay--visible' : ''}`}
        onClick={onClose}
      />

      <aside className={`sidebar ${isOpen ? 'sidebar--open' : ''}`}>
        {/* Brand */}
        <div className="sidebar__brand">
          <div className="sidebar__logo-container">
            <CheckSquare size={22} strokeWidth={2.5} />
          </div>
          <span className="sidebar__app-name">MyTODO</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <span className="sidebar__nav-label">Workspace</span>

          {/* Home */}
          <button
            className={`sidebar__nav-item ${isHome ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => nav('/')}
            aria-current={isHome ? 'page' : undefined}
          >
            <LayoutDashboard size={20} className="sidebar__nav-icon" />
            <span>Home</span>
          </button>

          {/* Notes */}
          <button
            className={`sidebar__nav-item ${isNotes ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => nav('/notes')}
            aria-current={isNotes ? 'page' : undefined}
          >
            <StickyNote size={20} className="sidebar__nav-icon" />
            <span>Notes</span>
            <span className="sidebar__nav-badge">{notes.length || 0}</span>
          </button>

          {/* Tasks */}
          <button
            className={`sidebar__nav-item ${isTasks ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => nav('/tasks')}
            aria-current={isTasks ? 'page' : undefined}
          >
            <ListTodo size={20} className="sidebar__nav-icon" />
            <span>Tasks</span>
            <span className="sidebar__nav-badge">{pendingCount || 0}</span>
          </button>

          <span className="sidebar__nav-label" style={{ marginTop: 'var(--space-4)' }}>Insights</span>
          <button
            className={`sidebar__nav-item ${isAnalytics ? 'sidebar__nav-item--active' : ''}`}
            onClick={() => nav('/analytics')}
          >
            <BarChart3 size={20} className="sidebar__nav-icon" />
            <span>Productivity</span>
          </button>

          {allTags.length > 0 && (
            <>
              <span className="sidebar__nav-label" style={{ marginTop: 'var(--space-4)' }}>Tags</span>
              <div className="sidebar__tags">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className={`sidebar__nav-item ${activeTag === tag ? 'sidebar__nav-item--active' : ''}`}
                    onClick={() => {
                      setActiveTag(activeTag === tag ? null : tag);
                      if (!isNotes && !isTasks) nav('/notes');
                    }}
                  >
                    <Tag size={16} className="sidebar__nav-icon" style={{ opacity: 0.7 }} />
                    <span style={{ fontSize: 'var(--font-size-sm)' }}>#{tag}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
          {/* Notification toggle */}
          {window.Notification?.permission !== 'granted' && (
            <button
              className="sidebar__nav-item"
              onClick={requestNotificationPermission}
              title="Enable Push Notifications"
              style={{ marginBottom: 'var(--space-1)', color: 'var(--primary-500)' }}
            >
              <span style={{ fontSize: '20px', width: '20px', textAlign: 'center' }}>🔔</span>
              <span>Enable Reminders</span>
            </button>
          )}

          {/* Theme toggle */}
          <button
            className="sidebar__nav-item"
            onClick={onToggleTheme}
            style={{ marginBottom: 'var(--space-2)' }}
          >
            {isDark ? <Sun size={20} className="sidebar__nav-icon" /> : <Moon size={20} className="sidebar__nav-icon" />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {/* User section */}
          <div
            className="sidebar__user"
            style={{ cursor: 'pointer', background: isProfile ? 'var(--bg-hover)' : '' }}
            onClick={() => nav('/profile')}
          >
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="sidebar__avatar"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="sidebar__avatar-fallback">
                {user?.displayName?.charAt(0) || '?'}
              </div>
            )}
            <div className="sidebar__user-info">
              <p className="sidebar__user-name">{user?.displayName || 'User'}</p>
              <p className="sidebar__user-email">{user?.email || ''}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleSignOut(); }}
              className="task-card__action-btn"
              title="Sign out"
              style={{ opacity: 1 }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
