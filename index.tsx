
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * CONFIGURAÇÃO PWA & CACHE (v4.5.7)
 */
async function setupPWA() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          };
        }
      };
    } catch (err) {
      console.error('[AutoIntel] Erro no Service Worker:', err);
    }
  }

  // Controle de Versão e Limpeza
  const VERSION = '4.5.7'; 
  const lastVersion = localStorage.getItem('autointel_version');
  if (lastVersion !== VERSION) {
    localStorage.setItem('autointel_version', VERSION);
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
  }
}

setupPWA();

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
