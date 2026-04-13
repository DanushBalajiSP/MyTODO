import { Menu, Plus } from 'lucide-react';
import Button from '../common/Button';
import { useTasks } from '../../hooks/useTasks';
import { FILTER_TYPES } from '../../utils/constants';

const filterTitleMap = {
  [FILTER_TYPES.TODAY]: "Today's Tasks",
  [FILTER_TYPES.UPCOMING]: 'Upcoming Tasks',
  [FILTER_TYPES.COMPLETED]: 'Completed Tasks',
  [FILTER_TYPES.ALL]: 'All Tasks',
};

const filterSubtitleMap = {
  [FILTER_TYPES.TODAY]: 'Focus on what matters now',
  [FILTER_TYPES.UPCOMING]: 'Plan ahead and stay organized',
  [FILTER_TYPES.COMPLETED]: 'Review your accomplishments',
  [FILTER_TYPES.ALL]: 'Everything in one place',
};

const Header = ({ onMenuClick, onAddTask, activeView }) => {
  const { activeFilter, activeTag } = useTasks();

  const getTitle = () => {
    if (activeView === 'analytics') return 'Analytics';
    if (activeView === 'profile') return 'Profile & Settings';
    if (activeTag) return `Tag: #${activeTag}`;
    return filterTitleMap[activeFilter];
  };

  const getSubtitle = () => {
    if (activeView === 'analytics') return 'Your productivity insights';
    if (activeView === 'profile') return 'Manage your account';
    if (activeTag) return `Viewing tasks tagged with #${activeTag}`;
    return filterSubtitleMap[activeFilter];
  };

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
          <h1 className="header__title">{getTitle()}</h1>
          <p className="header__subtitle">{getSubtitle()}</p>
        </div>
      </div>
      <div className="header__right">
        {activeView === 'tasks' && (
          <Button variant="primary" size="md" icon={Plus} onClick={onAddTask}>
            Add Task
          </Button>
        )}
      </div>
    </header>
  );
};

export default Header;
