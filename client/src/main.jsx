import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
import './i18n/i18n'
import App from './App.jsx'
import { initAnalytics } from './analytics'

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;
if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    tracesSampleRate: 0.2,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

initAnalytics();

// Automatically reload the page when a new deploy changes Vite chunk hashes
if (typeof window !== 'undefined') {
  window.addEventListener('vite:preloadError', (event) => {
    console.warn('Vite chunk preload error detected. Auto-reloading with fresh assets...', event);
    window.location.reload();
  });
}

function ErrorFallback(props) {
  const error = props?.error;
  const resetError = props?.resetError;

  console.error('Critical interface error caught by Sentry ErrorBoundary:', error);

  const isChunkError =
    error?.message?.includes('dynamically imported module') ||
    error?.message?.includes('Failed to fetch') ||
    error?.message?.includes("Unexpected token '<'") ||
    error?.name === 'ChunkLoadError';

  const handleClearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
      if (navigator.serviceWorker) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
    } catch {
      /* ignore */
    }
    if (resetError) resetError();
    window.location.href = window.location.href;
  };

  return (
    <div className="min-h-screen bg-[#071822] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 bg-[#0a2332] p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold tracking-tight">
          {isChunkError ? 'App Update Available' : 'Something went wrong'}
        </h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          {isChunkError
            ? 'A new version of the MARBLEX application has been published. Please reload to sync the latest assets.'
            : 'An unexpected interface error occurred. Our engineering telemetry has been notified.'}
        </p>

        {error?.message && !isChunkError && (
          <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-[11px] text-left font-mono break-all max-h-32 overflow-y-auto">
            <span className="font-bold text-rose-400 block mb-0.5">{error.name || 'Error'}:</span>
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-2.5 justify-center pt-2">
          <button
            onClick={handleClearCacheAndReload}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#e05333] text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Update & Reload App
          </button>
          <button
            onClick={() => {
              if (resetError) resetError();
              window.location.href = '/';
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Sentry.ErrorBoundary fallback={ErrorFallback} showDialog={false}>
      <App />
    </Sentry.ErrorBoundary>
  </StrictMode>,
)
