import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
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
    <BrowserRouter>
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
    </BrowserRouter>
  );
};

export default App;
