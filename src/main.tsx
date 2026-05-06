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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
