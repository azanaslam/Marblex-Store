import { http } from "../api/http";

const GIS_SRC = "https://accounts.google.com/gsi/client";
const MODAL_ID = "mx-google-auth-modal";

let gisLoadPromise = null;
let cachedClientId = null;
let stylesInjected = false;

function injectModalStyles() {
  if (stylesInjected || document.getElementById("mx-google-auth-styles")) {
    stylesInjected = true;
    return;
  }
  stylesInjected = true;
  const style = document.createElement("style");
  style.id = "mx-google-auth-styles";
  style.textContent = `
    #${MODAL_ID} {
      position: fixed; inset: 0; z-index: 99999;
      display: flex; align-items: flex-end; justify-content: center;
      padding: 0; margin: 0;
      background: rgba(6, 22, 30, 0.55);
      -webkit-backdrop-filter: blur(10px); backdrop-filter: blur(10px);
      animation: mxGBg .18s ease-out;
      font-family: "Segoe UI", system-ui, -apple-system, sans-serif;
    }
    @media (min-width: 640px) {
      #${MODAL_ID} { align-items: center; padding: 20px; }
    }
    #${MODAL_ID} .mx-g-card {
      position: relative; width: 100%; max-width: 420px;
      border-radius: 24px 24px 0 0;
      overflow: hidden;
      background: linear-gradient(165deg, #0a3d52 0%, #0d4e68 42%, #f4f7fa 42.2%);
      box-shadow: 0 -8px 40px rgba(9,27,36,.35), 0 24px 64px rgba(9,27,36,.28);
      border: 1px solid rgba(255,255,255,.12);
      animation: mxGUp .22s cubic-bezier(.22,1,.36,1);
    }
    @media (min-width: 640px) {
      #${MODAL_ID} .mx-g-card {
        border-radius: 22px;
        animation: mxGPop .2s cubic-bezier(.22,1,.36,1);
      }
    }
    #${MODAL_ID} .mx-g-handle {
      display: block; width: 40px; height: 4px; border-radius: 99px;
      background: rgba(255,255,255,.35); margin: 10px auto 0;
    }
    @media (min-width: 640px) { #${MODAL_ID} .mx-g-handle { display: none; } }
    #${MODAL_ID} .mx-g-head {
      padding: 18px 20px 16px; color: #fff;
      display: flex; align-items: flex-start; gap: 12px;
    }
    #${MODAL_ID} .mx-g-logo {
      width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
      background: #fff; display: grid; place-items: center;
      box-shadow: 0 8px 20px rgba(0,0,0,.18);
    }
    #${MODAL_ID} .mx-g-title {
      margin: 0; font-size: 16px; font-weight: 800; letter-spacing: -.02em; line-height: 1.25;
    }
    #${MODAL_ID} .mx-g-sub {
      margin: 4px 0 0; font-size: 12px; font-weight: 500; color: rgba(255,255,255,.72); line-height: 1.4;
    }
    #${MODAL_ID} .mx-g-close {
      margin-left: auto; width: 34px; height: 34px; border-radius: 10px;
      border: none; cursor: pointer; flex-shrink: 0;
      background: rgba(255,255,255,.12); color: #fff;
      display: grid; place-items: center; transition: background .15s ease;
    }
    #${MODAL_ID} .mx-g-close:hover { background: rgba(255,255,255,.2); }
    #${MODAL_ID} .mx-g-body {
      background: linear-gradient(180deg, #f8fafc 0%, #eef3f6 100%);
      padding: 20px 18px calc(18px + env(safe-area-inset-bottom, 0px));
    }
    #${MODAL_ID} .mx-g-panel {
      background: #fff; border-radius: 16px;
      border: 1px solid rgba(10,61,82,.08);
      box-shadow: 0 10px 28px rgba(10,61,82,.07);
      padding: 18px 16px; text-align: center;
    }
    #${MODAL_ID} .mx-g-panel-title {
      margin: 0 0 4px; font-size: 14px; font-weight: 800; color: #0a3d52;
    }
    #${MODAL_ID} .mx-g-panel-copy {
      margin: 0 0 16px; font-size: 12px; color: #64748b; line-height: 1.45; font-weight: 500;
    }
    #${MODAL_ID} .mx-g-btn-wrap {
      display: flex; justify-content: center; min-height: 44px; align-items: center;
    }
    #${MODAL_ID} .mx-g-loading {
      display: inline-flex; align-items: center; gap: 10px;
      color: #0a3d52; font-size: 12px; font-weight: 700;
    }
    #${MODAL_ID} .mx-g-spin {
      width: 16px; height: 16px; border-radius: 50%;
      border: 2px solid rgba(10,61,82,.15); border-top-color: #ff6b4a;
      animation: mxGSpin .55s linear infinite;
    }
    #${MODAL_ID} .mx-g-steps {
      display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px;
    }
    #${MODAL_ID} .mx-g-step {
      border-radius: 12px; padding: 10px 8px;
      background: rgba(10,61,82,.04); border: 1px solid rgba(10,61,82,.06);
      text-align: left;
    }
    #${MODAL_ID} .mx-g-step b {
      display: block; font-size: 11px; color: #0a3d52; font-weight: 800; margin-bottom: 2px;
    }
    #${MODAL_ID} .mx-g-step span {
      font-size: 10px; color: #64748b; font-weight: 600; line-height: 1.35;
    }
    #${MODAL_ID} .mx-g-foot {
      margin-top: 12px; text-align: center;
      font-size: 10px; color: #94a3b8; font-weight: 600; letter-spacing: .02em;
    }
    @keyframes mxGBg { from { opacity: 0 } to { opacity: 1 } }
    @keyframes mxGUp {
      from { transform: translateY(28px); opacity: .6 }
      to { transform: translateY(0); opacity: 1 }
    }
    @keyframes mxGPop {
      from { transform: translateY(10px) scale(.97); opacity: 0 }
      to { transform: none; opacity: 1 }
    }
    @keyframes mxGSpin { to { transform: rotate(360deg) } }
  `;
  document.head.appendChild(style);
}

function loadGisScript() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (gisLoadPromise) return gisLoadPromise;

  gisLoadPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google Sign-In")));
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google Sign-In"));
    document.head.appendChild(script);
  });

  return gisLoadPromise;
}

export async function getGoogleClientId() {
  if (cachedClientId) return cachedClientId;
  const fromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  if (fromEnv) {
    cachedClientId = String(fromEnv).trim();
    return cachedClientId;
  }
  const res = await http.get("/auth/config");
  cachedClientId = String(res.data?.googleClientId || "").trim();
  return cachedClientId;
}

/** Call on LoginPage mount so click feels instant */
export function preloadGoogleIdentity() {
  injectModalStyles();
  getGoogleClientId().catch(() => {});
  loadGisScript().catch(() => {});
}

function removeExistingModal() {
  document.getElementById(MODAL_ID)?.remove();
}

function openAuthModalShell() {
  injectModalStyles();
  removeExistingModal();

  const host = document.createElement("div");
  host.id = MODAL_ID;
  host.setAttribute("role", "dialog");
  host.setAttribute("aria-modal", "true");
  host.setAttribute("aria-label", "Sign in with Google");
  host.innerHTML = `
    <div class="mx-g-card">
      <div class="mx-g-handle" aria-hidden="true"></div>
      <div class="mx-g-head">
        <div class="mx-g-logo" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
        </div>
        <div style="min-width:0;flex:1">
          <h3 class="mx-g-title">Sign in with Google</h3>
          <p class="mx-g-sub">Secure industrial access · then Marblex email 2FA</p>
        </div>
        <button type="button" class="mx-g-close" id="mx-google-cancel" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M6 6l12 12M18 6L6 18"/></svg>
        </button>
      </div>
      <div class="mx-g-body">
        <div class="mx-g-panel">
          <p class="mx-g-panel-title">Choose your Google account</p>
          <p class="mx-g-panel-copy">Accounts signed in on this device will appear after you continue.</p>
          <div class="mx-g-btn-wrap" id="mx-google-btn-mount">
            <div class="mx-g-loading" id="mx-google-loading">
              <span class="mx-g-spin" aria-hidden="true"></span>
              Preparing Google…
            </div>
          </div>
          <div class="mx-g-steps">
            <div class="mx-g-step"><b>1 · Google</b><span>Pick the account you want</span></div>
            <div class="mx-g-step"><b>2 · 2FA</b><span>6-digit code to your inbox</span></div>
          </div>
        </div>
        <p class="mx-g-foot">MARBLEX Chemical &amp; Rubber · Encrypted sign-in</p>
      </div>
    </div>
  `;
  document.body.appendChild(host);
  return host;
}

/**
 * Instant Marblex modal + Google button (preloaded script makes this fast).
 * Returns GIS ID token credential string.
 */
export async function promptGoogleSignIn() {
  const host = openAuthModalShell();

  return new Promise((resolve, reject) => {
    let settled = false;

    const cleanup = () => {
      host.remove();
    };

    const finish = (err, credential) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (err) reject(err);
      else resolve(credential);
    };

    host.querySelector("#mx-google-cancel")?.addEventListener("click", () => {
      finish(new Error("Google sign-in cancelled."));
    });

    host.addEventListener("click", (e) => {
      if (e.target === host) finish(new Error("Google sign-in cancelled."));
    });

    const onKey = (e) => {
      if (e.key === "Escape") {
        window.removeEventListener("keydown", onKey);
        finish(new Error("Google sign-in cancelled."));
      }
    };
    window.addEventListener("keydown", onKey);

    (async () => {
      try {
        const [clientId] = await Promise.all([getGoogleClientId(), loadGisScript()]);
        if (!clientId) {
          finish(
            new Error(
              "Google Sign-In is not configured. Add GOOGLE_CLIENT_ID (server) or VITE_GOOGLE_CLIENT_ID (client)."
            )
          );
          return;
        }
        if (settled) return;

        const mount = host.querySelector("#mx-google-btn-mount");
        if (!mount) {
          finish(new Error("Google Sign-In UI failed to mount."));
          return;
        }
        mount.innerHTML = "";

        const btnWidth = Math.min(320, Math.max(240, Math.floor((mount.clientWidth || 280) - 4)));

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            window.removeEventListener("keydown", onKey);
            if (!response?.credential) {
              finish(new Error("Google did not return a credential."));
              return;
            }
            finish(null, response.credential);
          },
          auto_select: false,
          cancel_on_tap_outside: true,
          use_fedcm_for_prompt: false,
        });

        window.google.accounts.id.renderButton(mount, {
          theme: "filled_blue",
          size: "large",
          text: "continue_with",
          shape: "pill",
          logo_alignment: "left",
          width: btnWidth,
        });
      } catch (err) {
        window.removeEventListener("keydown", onKey);
        finish(err instanceof Error ? err : new Error("Google Sign-In failed to start."));
      }
    })();
  });
}
