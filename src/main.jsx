import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { TaskProvider } from './context/TaskContext';
import { NoteProvider } from './context/NoteContext';
import { FocusProvider } from './context/FocusContext';
import App from './App';

import './styles/index.css';
import './styles/components.css';
import './styles/pages.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <TaskProvider>
        <NoteProvider>
          <FocusProvider>
            <App />
          </FocusProvider>
        </NoteProvider>
      </TaskProvider>
    </AuthProvider>
  </StrictMode>
);
