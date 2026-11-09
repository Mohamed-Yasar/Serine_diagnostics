import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

import { LabDataProvider } from './context/LabDataContext';
import { AuthProvider } from './context/AuthContext';

import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <LabDataProvider>
        <App />
      </LabDataProvider>
    </AuthProvider>
  </StrictMode>,
);