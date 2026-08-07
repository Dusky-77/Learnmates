
import { HelmetProvider } from 'react-helmet-async';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { preloadBlobMapping } from './utils/blobUrl';

// Preload blob mapping for faster file access
preloadBlobMapping();

createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
