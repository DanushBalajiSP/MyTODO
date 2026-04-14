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

const Header = ({ onMenuClick, onAddTask }) => {
  const { activeFilter } = useTasks();

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
          <h1 className="header__title">{filterTitleMap[activeFilter]}</h1>
          <p className="header__subtitle">{filterSubtitleMap[activeFilter]}</p>
        </div>
      </div>
      <div className="header__right">
        <Button variant="primary" size="md" icon={Plus} onClick={onAddTask}>
          Add Task
        </Button>
      </div>
    </header>
  );
};

export default Header;
