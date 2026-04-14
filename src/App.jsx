import { useState, useCallback } from 'react';
import { HashRouter, Routes, Route } from 'react-router';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import NotFoundPage from './pages/NotFoundPage';

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
            <Route
              index
              element={
                <DashboardPage
                  showTaskForm={showTaskForm}
                  setShowTaskForm={setShowTaskForm}
                />
              }
            />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </HashRouter>
  );
};

export default App;
