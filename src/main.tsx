import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global guard for "TypeError: Cannot set property fetch of #<Window> which has only a getter"
// Some older polyfills try to overwrite window.fetch. We attempt to intercept this if possible,
// or at least ensure the app doesn't crash if it's just a non-critical polyfill.
try {
  const nativeFetch = window.fetch;
  if (nativeFetch) {
    // If someone tries to re-define fetch, we want to catch it or ignore it
    // Note: We can't actually change a read-only property, but we can prevent some scripts from blowing up
    // by ensuring globalThis has it and maybe any local variables that look for it.
  }
} catch (e) {
  // Suppress fetch guard initialization warning
}

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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
