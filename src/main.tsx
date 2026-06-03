import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Suppress recharts and websocket warnings globally at the earliest possible point
const originalWarn = console.warn.bind(console)
console.warn = (...args: any[]) => {
  const msg = args.join(' ')
  if (
    msg.includes('width') ||
    msg.includes('height') ||
    msg.includes('chart') ||
    msg.includes('Chart') ||
    msg.includes('ResponsiveContainer') ||
    msg.includes('WebSocket') ||
    msg.includes('greater than 0')
  ) return
  originalWarn(...args)
}

const originalError = console.error.bind(console)
console.error = (...args: any[]) => {
  const msg = args.join(' ')
  if (
    msg.includes('WebSocket') ||
    msg.includes('width') ||
    msg.includes('height') ||
    msg.includes('greater than 0')
  ) return
  originalError(...args)
}

if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (e) => {
    if (e.reason && e.reason.message && e.reason.message.includes('WebSocket')) {
      e.preventDefault();
    }
    if (e.reason && typeof e.reason === 'string' && e.reason.includes('WebSocket')) {
      e.preventDefault();
    }
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
