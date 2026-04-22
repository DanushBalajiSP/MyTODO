import { Menu, Plus } from 'lucide-react';
import { useLocation } from 'react-router';
import Button from '../common/Button';
import { FocusModeButton } from '../productivity/FocusStreak';

const routeMeta = {
  '/':          { title: 'Notes',        subtitle: 'Your personal idea workspace' },
  '/notes':     { title: 'Notes',        subtitle: 'Your personal idea workspace' },
  '/tasks':     { title: 'Tasks',        subtitle: 'Focus on what matters today' },
  '/analytics': { title: 'Productivity', subtitle: 'Track your streaks and insights' },
  '/profile':   { title: 'Profile',      subtitle: 'Manage your account' },
};

const Header = ({ onMenuClick, onAddTask }) => {
  const location = useLocation();
  const meta = routeMeta[location.pathname] || { title: 'MyTODO', subtitle: '' };
  const isTasks = location.pathname === '/tasks';

  return (
    <header className="header">
      <div className="header__left">
        <button
          className="header__menu-btn"
          onClick={onMenuClick}
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="header__title">{meta.title}</h1>
          {meta.subtitle && <p className="header__subtitle">{meta.subtitle}</p>}
        </div>
      </div>
      <div className="header__right">
        <FocusModeButton />
        {isTasks && (
          <>
            <Button variant="primary" size="md" icon={Plus} onClick={onAddTask} className="header__add-btn">
              Add Task
            </Button>
            <button className="mobile-fab" onClick={onAddTask} aria-label="Add Task">
              <Plus size={24} />
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
