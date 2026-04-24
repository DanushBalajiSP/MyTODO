import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnalyticsView from './components/analytics/AnalyticsView';
import ProfileView from './pages/ProfileView';
import NotesPage from './pages/NotesPage';
import HomeWidgetPage from './pages/HomeWidgetPage';
import NotFoundPage from './pages/NotFoundPage';
import { Navigate } from 'react-router';

const IndexRedirect = () => {
  const lastPage = localStorage.getItem('mytodo_last_page');
  if (lastPage === '/tasks') return <Navigate to="/tasks" replace />;
  if (lastPage === '/notes') return <Navigate to="/notes" replace />;
  return <Navigate to="/" replace />; // default to home (widgets)
};

const App = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);

  const handleAddTask = useCallback(() => {
    setShowTaskForm(true);
  }, []);

  return (
    <HashRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout onAddTask={handleAddTask} />}>
            {/* Root - Home Screen with Widgets */}
            <Route index element={<HomeWidgetPage />} />
            <Route path="/dashboard" element={<HomeWidgetPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route
              path="/tasks"
              element={
                <DashboardPage
                  showTaskForm={showTaskForm}
                  setShowTaskForm={setShowTaskForm}
                />
              }
            />
            <Route path="/analytics" element={<AnalyticsView />} />
            <Route path="/profile" element={<ProfileView />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
