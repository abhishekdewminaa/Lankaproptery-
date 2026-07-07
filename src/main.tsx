import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx';

// Suppress Vite HMR WebSocket errors in development/hosted environments
window.addEventListener('error', (e) => {
  const msg = String(e.message || '');
  if (
    msg.includes('WebSocket') || 
    msg.includes('ws://') || 
    msg.includes('wss://') ||
    msg.includes('closed without opened')
  ) {
    e.preventDefault();
    e.stopPropagation();
  }
});

window.addEventListener('unhandledrejection', (e) => {
  const reasonStr = String(e.reason?.message || e.reason || '');
  if (
    reasonStr.includes('WebSocket') || 
    reasonStr.includes('ws://') || 
    reasonStr.includes('wss://') ||
    reasonStr.includes('closed without opened')
  ) {
    e.preventDefault();
  }
});

const rootElement = document.getElementById('root');

if (!rootElement) {
  document.body.innerHTML = '<h1 style="color:red;padding:20px">ERROR: No root element found</h1>';
} else {
  try {
    createRoot(rootElement).render(
      <StrictMode>
        <AppErrorBoundary>
          <App />
        </AppErrorBoundary>
      </StrictMode>
    );
  } catch (err) {
    rootElement.innerHTML = `<div style="color:red;padding:20px;font-family:monospace">
      <h2>CRASH ERROR:</h2>
      <pre>${String(err)}</pre>
    </div>`;
    console.error('App mount crash:', err);
  }
}
