import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import * as Sentry from '@sentry/react'
import './index.css'
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

function ErrorFallback({ resetError }) {
  return (
    <div className="min-h-screen bg-[#071822] text-white flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-4 bg-[#0a2332] p-8 rounded-2xl border border-slate-700 shadow-xl">
        <div className="w-16 h-16 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center text-2xl font-bold">
          !
        </div>
        <h1 className="text-xl font-bold tracking-tight">Something went wrong</h1>
        <p className="text-xs text-slate-400 leading-relaxed">
          An unexpected interface error occurred. Our engineering telemetry has been notified.
        </p>
        <button
          onClick={() => {
            if (resetError) resetError();
            window.location.href = '/';
          }}
          className="px-6 py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#e05333] text-white text-xs font-bold uppercase tracking-wider transition"
        >
          Return to Home
        </button>
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
