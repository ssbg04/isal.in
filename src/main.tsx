import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';

const adsenseClient = import.meta.env.VITE_ADSENSE_CLIENT;
if (adsenseClient && typeof document !== 'undefined' && !document.querySelector('script[src*="adsbygoogle.js"]')) {
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(adsenseClient)}`;
  script.crossOrigin = 'anonymous';
  document.head.appendChild(script);
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Register service worker for offline PWA support
if ('serviceWorker' in navigator && typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .catch((err) => {
        console.warn('Service worker registration failed:', err);
      });
  });
}
