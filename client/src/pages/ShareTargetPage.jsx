import { useEffect, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShareRoundedIcon from "@mui/icons-material/ShareRounded";

/**
 * PWA share_target landing — receives shared text/url from other apps (GET).
 */
export function ShareTargetPage() {
  const [params] = useSearchParams();
  const title = params.get("title") || "";
  const text = params.get("text") || "";
  const url = params.get("url") || "";

  const message = useMemo(() => {
    const parts = [
      "*Shared to MARBLEX App*",
      title && `Title: ${title}`,
      text && text,
      url && `Link: ${url}`,
      "",
      "_Please review / quote._",
    ].filter(Boolean);
    return parts.join("\n");
  }, [title, text, url]);

  const wa = `https://wa.me/923084585792?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    document.title = "Share · MARBLEX";
  }, []);

  return (
    <div className="mx-auto max-w-lg px-4 py-10">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-[#0c222e]">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0a3d52]/10 text-[#0a3d52] dark:text-emerald-300">
          <ShareRoundedIcon />
        </div>
        <h1 className="font-heading mt-3 text-xl font-extrabold text-[#0a3d52] dark:text-white">
          Shared to MARBLEX
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Content dusri app se aaya hai — WhatsApp desk pe bhejo ya shop continue karo.
        </p>
        <pre className="mt-4 max-h-48 overflow-auto whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-[12px] text-slate-700 dark:bg-[#071620] dark:text-slate-300">
          {message}
        </pre>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <a
            href={wa}
            target="_blank"
            rel="noreferrer"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 py-3 text-sm font-bold text-white"
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} />
            Send to WhatsApp
          </a>
          <Link
            to="/"
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 py-3 text-sm font-bold text-[#0a3d52] dark:border-slate-700 dark:text-white"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
