import { CheckSquare, CalendarCheck, CalendarClock, CircleCheckBig, LogOut, Moon, Sun } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTasks } from '../../hooks/useTasks';
import { NAV_ITEMS, FILTER_TYPES } from '../../utils/constants';

const iconMap = {
  CalendarCheck,
  CalendarClock,
  CircleCheckBig,
};

const Sidebar = ({ isOpen, onClose, isDark, onToggleTheme }) => {
  const { user, signOut } = useAuth();
  const { activeFilter, setFilter, taskCounts } = useTasks();

  const countMap = {
    [FILTER_TYPES.TODAY]: taskCounts.today,
    [FILTER_TYPES.UPCOMING]: taskCounts.upcoming,
    [FILTER_TYPES.COMPLETED]: taskCounts.completed,
  };

  const handleNavClick = (filterId) => {
    setFilter(filterId);
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
            const isActive = activeFilter === item.id;
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
        </nav>

        {/* Footer */}
        <div className="sidebar__footer">
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
