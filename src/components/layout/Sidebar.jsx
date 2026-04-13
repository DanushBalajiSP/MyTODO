import { CheckSquare, CalendarCheck, CalendarClock, CircleCheckBig, LogOut, Moon, Sun, BarChart3, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { NAV_ITEMS, FILTER_TYPES } from '../../utils/constants';

const iconMap = {
  CalendarCheck,
  CalendarClock,
  CircleCheckBig,
};

const Sidebar = ({ isOpen, onClose, isDark, onToggleTheme, activeView, setActiveView }) => {
  const { user, signOut, requestNotificationPermission } = useAuth();
  const { activeFilter, setFilter, taskCounts, allTags, activeTag, setActiveTag } = useTasks();

  const countMap = {
    [FILTER_TYPES.TODAY]: taskCounts.today,
    [FILTER_TYPES.UPCOMING]: taskCounts.upcoming,
    [FILTER_TYPES.COMPLETED]: taskCounts.completed,
  };

  const handleNavClick = (filterId) => {
    setActiveView('tasks');
    setFilter(filterId);
    onClose?.();
  };

  const handleViewClick = (view) => {
    setActiveView(view);
    onClose?.();
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out failed:', err);
    }
  };

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
          <div className="sidebar__logo">
            <CheckSquare size={20} />
          </div>
          <span className="sidebar__app-name">MyTODO</span>
        </div>

        {/* Navigation */}
        <nav className="sidebar__nav">
          <span className="sidebar__nav-label">Tasks</span>
          {NAV_ITEMS.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = activeView === 'tasks' && activeFilter === item.id;
            return (
              <button
                key={item.id}
                className={`sidebar__nav-item ${isActive ? 'sidebar__nav-item--active' : ''}`}
                onClick={() => handleNavClick(item.id)}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={20} className="sidebar__nav-icon" />
                <span>{item.label}</span>
                <span className="sidebar__nav-badge">{countMap[item.id] || 0}</span>
              </button>
            );
          })}
          
          <div style={{ marginTop: 'var(--space-4)' }}>
            <span className="sidebar__nav-label">Insights</span>
            <button
              className={`sidebar__nav-item ${activeView === 'analytics' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => handleViewClick('analytics')}
            >
              <BarChart3 size={20} className="sidebar__nav-icon" />
              <span>Analytics</span>
            </button>
            <button
              className={`sidebar__nav-item ${activeView === 'profile' ? 'sidebar__nav-item--active' : ''}`}
              onClick={() => handleViewClick('profile')}
            >
              <User size={20} className="sidebar__nav-icon" />
              <span>Profile</span>
            </button>
          </div>
          
          {allTags && allTags.length > 0 && (
            <div style={{ marginTop: 'var(--space-4)' }}>
              <span className="sidebar__nav-label">Tags</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', padding: '0 var(--space-4)', marginTop: 'var(--space-2)' }}>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    className="tag-chip"
                    style={{ 
                      background: activeTag === tag ? 'var(--primary-100)' : undefined, 
                      color: activeTag === tag ? 'var(--primary-700)' : undefined, 
                      border: activeTag === tag ? '1px solid var(--primary-300)' : '1px solid transparent',
                      cursor: 'pointer' 
                    }}
                    onClick={() => { 
                      setActiveTag(activeTag === tag ? null : tag); 
                      // Switch to ALL filter to see all results when selecting a tag
                      if (activeTag !== tag) setFilter(FILTER_TYPES.ALL);
                      onClose?.(); 
                    }}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
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
              style={{ 
                marginBottom: 'var(--space-1)', 
                color: 'var(--primary-500)' 
              }}
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
          <div className="sidebar__user">
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
              onClick={handleSignOut}
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
