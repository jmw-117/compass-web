import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('react-enhancement');

if (!rootElement) {
  throw new Error('Missing React enhancement mount point.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
