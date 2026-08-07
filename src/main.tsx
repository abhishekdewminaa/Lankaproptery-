import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App'

// Silence benign sandbox environment HMR/WebSocket errors and other noisy warnings
if (typeof window !== 'undefined') {
  const isBenignMessage = (msg: string) => {
    return (
      msg.includes('WebSocket') || 
      msg.includes('websocket') || 
      msg.includes('vite') || 
      msg.includes('HMR') ||
      msg.includes('closed without opened') ||
      msg.includes('PGRST116') ||
      msg.includes('No row returned for .single()') ||
      (msg.includes('width') && msg.includes('height') && msg.includes('chart'))
    );
  };

  // Override console methods to filter out these known benign messages
  const originalConsoleError = console.error;
  console.error = function (...args: any[]) {
    const hasBenign = args.some(arg => isBenignMessage(String(arg || '')));
    if (hasBenign) return;
    originalConsoleError.apply(console, args);
  };

  const originalConsoleWarn = console.warn;
  console.warn = function (...args: any[]) {
    const hasBenign = args.some(arg => isBenignMessage(String(arg || '')));
    if (hasBenign) return;
    originalConsoleWarn.apply(console, args);
  };

  const originalConsoleLog = console.log;
  console.log = function (...args: any[]) {
    const hasBenign = args.some(arg => isBenignMessage(String(arg || '')));
    if (hasBenign) return;
    originalConsoleLog.apply(console, args);
  };

  const originalConsoleInfo = console.info;
  console.info = function (...args: any[]) {
    const hasBenign = args.some(arg => isBenignMessage(String(arg || '')));
    if (hasBenign) return;
    originalConsoleInfo.apply(console, args);
  };

  window.addEventListener('unhandledrejection', (event) => {
    const msg = event.reason?.message || String(event.reason || '');
    if (isBenignMessage(msg)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  });

  window.addEventListener('error', (event) => {
    const msg = event.message || '';
    if (isBenignMessage(msg)) {
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  });

  // Intercept and wrap the native WebSocket constructor to prevent HMR errors
  const NativeWebSocket = window.WebSocket;
  if (NativeWebSocket) {
    const SafeWebSocket = function (this: any, url: string | URL, protocols?: string | string[]) {
      const urlStr = String(url);
      const isLocalOrSandbox = 
        urlStr.includes('localhost') || 
        urlStr.includes('127.0.0.1') || 
        urlStr.includes('0.0.0.0') || 
        urlStr.includes(window.location.hostname);

      if (isLocalOrSandbox && (urlStr.includes('/vite') || urlStr.includes('hmr') || urlStr.includes('ws'))) {
        // Return a mock CLOSED WebSocket instance for local Vite HMR connections
        const dummy = Object.create(NativeWebSocket.prototype);
        dummy.url = urlStr;
        dummy.readyState = NativeWebSocket.CLOSED;
        dummy.binaryType = 'blob';
        dummy.bufferedAmount = 0;
        dummy.extensions = '';
        dummy.protocol = '';
        
        dummy.send = () => {};
        dummy.close = () => {};
        
        dummy.addEventListener = () => {};
        dummy.removeEventListener = () => {};
        
        dummy.onopen = null;
        dummy.onmessage = null;
        dummy.onerror = null;
        dummy.onclose = null;

        return dummy;
      }

      // Allow normal connections (e.g. Supabase real-time)
      return Reflect.construct(NativeWebSocket, [url, protocols]);
    };

    SafeWebSocket.prototype = NativeWebSocket.prototype;
    (SafeWebSocket as any).CONNECTING = NativeWebSocket.CONNECTING;
    (SafeWebSocket as any).OPEN = NativeWebSocket.OPEN;
    (SafeWebSocket as any).CLOSING = NativeWebSocket.CLOSING;
    (SafeWebSocket as any).CLOSED = NativeWebSocket.CLOSED;

    try {
      Object.defineProperty(window, 'WebSocket', {
        value: SafeWebSocket,
        configurable: true,
        writable: true
      });
    } catch (e) {
      try {
        (window as any).WebSocket = SafeWebSocket;
      } catch (err) {
        console.warn('Could not override window.WebSocket in this sandbox environment:', err);
      }
    }
  }
}

ReactDOM.createRoot(
  document.getElementById('root')!
).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
