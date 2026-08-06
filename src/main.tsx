import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Silence benign sandbox environment HMR/WebSocket errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('HMR') ||
      msg.includes('closed without opened')
    ) {
      event.preventDefault();
      console.log('Silenced expected sandbox environment HMR warning:', msg);
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('HMR') ||
      msg.includes('closed without opened')
    ) {
      event.preventDefault();
    }
  });
}

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
