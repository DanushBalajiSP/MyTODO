import DashboardPage from './DashboardPage';
import AnalyticsView from '../components/analytics/AnalyticsView';
import ProfileView from './ProfileView';

const MainView = ({ activeView, setActiveView, showTaskForm, setShowTaskForm }) => {
  switch (activeView) {
    case 'analytics':
      return <AnalyticsView />;
    case 'profile':
      return <ProfileView onNavigate={setActiveView} />;
    case 'tasks':
    default:
      return (
        <DashboardPage
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
        />
      );
  }
};

export default MainView;
