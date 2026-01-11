
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

/**
 * LIMPEZA FORÇADA DE CACHE (ANTI-CACHE AGRESSIVO)
 * Corrigido para evitar erro "The document is in an invalid state" aguardando o carregamento da janela.
 */
async function clearAllCaches() {
  const executeLimpeza = async () => {
    try {
      // 1. Desregistrar Service Workers com tratamento de erro específico
      if ('serviceWorker' in navigator) {
        try {
          const registrations = await navigator.serviceWorker.getRegistrations();
          for (const registration of registrations) {
            await registration.unregister();
            console.log('[AutoIntel] Service Worker removido com sucesso.');
          }
        } catch (swErr) {
          // Ignora erros de estado do documento ou permissão para não travar o app
          console.warn('[AutoIntel] Aviso ao acessar Service Workers:', swErr);
        }
      }

      // 2. Limpar todo o Cache Storage
      if ('caches' in window) {
        try {
          const cacheNames = await caches.keys();
          for (const name of cacheNames) {
            await caches.delete(name);
            console.log('[AutoIntel] Cache deletado:', name);
          }
        } catch (cacheErr) {
          console.warn('[AutoIntel] Aviso ao limpar Cache Storage:', cacheErr);
        }
      }

      // 3. Controle de Versão para recarregamento forçado
      const VERSION = '4.5.3'; // Incremento para forçar novo ciclo
      const lastVersion = localStorage.getItem('autointel_version');
      if (lastVersion !== VERSION) {
        localStorage.setItem('autointel_version', VERSION);
        console.log('[AutoIntel] Nova versão detectada. Reiniciando para aplicar mudanças de UI...');
        // Reload apenas se não houver erro crítico anterior
        setTimeout(() => window.location.reload(), 100);
      }
    } catch (err) {
      console.error('[AutoIntel] Erro geral na rotina de limpeza:', err);
    }
  };

  // Executa após a janela estar pronta para evitar "Invalid State"
  if (document.readyState === 'complete') {
    executeLimpeza();
  } else {
    window.addEventListener('load', executeLimpeza);
  }
}

// Inicia processo de limpeza em background
clearAllCaches();

console.log('%c AutoIntel Pro v4.5.3 - ENGINE LARANJA ATIVA ', 'background: #f97316; color: white; font-weight: bold; padding: 4px; border-radius: 4px;');

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
