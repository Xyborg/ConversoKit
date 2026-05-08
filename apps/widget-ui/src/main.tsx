import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

// Mount the root React component.  Vite injects the root element into
// index.html.  StrictMode helps catch subtle bugs in development.
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);