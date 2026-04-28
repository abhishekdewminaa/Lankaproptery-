import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Debug window.fetch overwrite attempt
if (typeof window !== 'undefined') {
  const originalFetch = window.fetch;
  try {
    // If it already has only a getter, this might fail, but let's try to intercept
    const descriptor = Object.getOwnPropertyDescriptor(window, 'fetch');
    if (descriptor && descriptor.configurable) {
      Object.defineProperty(window, 'fetch', {
        get: () => originalFetch,
        set: (v) => {
          console.error('CRITICAL: Someone tried to overwrite window.fetch!', v);
          const stack = new Error().stack;
          console.error('Stack trace:', stack);
        },
        configurable: true
      });
    } else {
      console.warn('window.fetch is not configurable or has no descriptor');
    }
  } catch (e) {
    console.error('Failed to set up fetch debug interceptor:', e);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
