/**
 * Application Entry Point
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProvider } from './context';
import App from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </StrictMode>
);
