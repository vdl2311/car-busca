
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * CONFIGURAÇÃO PWA & CACHE
 */
async function setupPWA() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[AutoIntel] Service Worker registrado com sucesso:', registration.scope);
        })
        .catch(err => {
          console.error('[AutoIntel] Falha ao registrar Service Worker:', err);
        });
    });
  }

  // Controle de Versão para recarregamento de assets quando houver update crítico
  const VERSION = '4.5.5'; 
  const lastVersion = localStorage.getItem('autointel_version');
  if (lastVersion !== VERSION) {
    localStorage.setItem('autointel_version', VERSION);
    // Limpa caches antigos mas mantém o registro do worker
    if ('caches' in window) {
      const names = await caches.keys();
      await Promise.all(names.map(name => caches.delete(name)));
    }
    console.log('[AutoIntel] Versão atualizada. Cache limpo.');
  }
}

setupPWA();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
