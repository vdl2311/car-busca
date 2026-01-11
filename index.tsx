
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * CONFIGURAÇÃO PWA & CACHE (v4.5.6)
 */
async function setupPWA() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });
      console.log('[AutoIntel] Service Worker ativo no escopo:', registration.scope);
      
      // Força atualização imediata se houver um novo worker
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        if (installingWorker) {
          installingWorker.onstatechange = () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('[AutoIntel] Nova versão pronta. Reiniciando...');
              window.location.reload();
            }
          };
        }
      };
    } catch (err) {
      console.error('[AutoIntel] Erro Crítico no Service Worker:', err);
    }
  }

  // Armazena o evento de instalação globalmente para ser disparado por qualquer botão
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    (window as any).deferredPrompt = e;
    console.log('[AutoIntel] Evento de instalação capturado e pronto para disparo nativo.');
  });
  
  // Controle de Versão e Limpeza
  const VERSION = '4.5.6'; 
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
