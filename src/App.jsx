import { useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router';
import ProtectedLayout from './components/layout/ProtectedLayout';
import AppLayout from './components/layout/AppLayout';
import LoginPage from './pages/LoginPage';
import MainView from './pages/MainView';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [activeView, setActiveView] = useState('tasks'); // 'tasks', 'analytics', 'profile'

  const handleAddTask = useCallback(() => {
    setActiveView('tasks');
    setShowTaskForm(true);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes */}
        <Route element={<ProtectedLayout />}>
          <Route element={<AppLayout onAddTask={handleAddTask} activeView={activeView} setActiveView={setActiveView} />}>
            <Route
              index
              element={
                <MainView
                  activeView={activeView}
                  setActiveView={setActiveView}
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
