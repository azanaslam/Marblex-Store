import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, useLocation, Link as RouterLink } from "react-router-dom";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PendingActionsRoundedIcon from "@mui/icons-material/PendingActionsRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { http } from "../api/http";
import { getAuthUser } from "../auth/session";

export const PaymentResultPage = ({ success }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const authUser = getAuthUser();

  const directState = location.state || null;
  const [details, setDetails] = useState(directState);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(Boolean(success && sessionId));

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (sessionId) {
      http
        .get(`/orders/verify-session/${sessionId}`)
        .then((res) => {
          setDetails((prev) => ({ ...prev, ...res.data }));
          try {
            localStorage.setItem("marblex_cart", JSON.stringify([]));
          } catch {}
        })
        .catch(() => setHasError(true))
        .finally(() => setLoading(false));
    }
  }, [sessionId]);

  const isCancelled = !success && !directState;
  const isPaid = details?.paymentStatus === "paid" || (!isCancelled && !directState?.isManual && directState?.paymentMethod === "stripe");
  const isPendingVerification = directState?.isManual || details?.paymentStatus === "pending_verification";
  const isCod = directState?.paymentMethod === "cod" || details?.paymentMethod === "cod";

  const orderNum = details?.orderNumber || (details?.orderId ? `#${String(details.orderId).slice(-6).toUpperCase()}` : "CONFIRMED");

  const fmt = (v) => "PKR " + Number(v || 0).toLocaleString("en-US");

  return (
    <div className="max-w-[720px] mx-auto px-4 py-8 sm:py-14 text-[#0b2f3c] dark:text-[#eaf3f7]">
      <div className="bg-white dark:bg-[#112832] border border-slate-200 dark:border-[#1f3d4a] rounded-[28px] p-6 sm:p-10 shadow-xl shadow-slate-900/5 text-center relative overflow-hidden">
        {/* Subtle Ambient Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-[#0a3d52]/5 dark:bg-sky-500/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Loading State */}
        {loading && (
          <div className="py-12 space-y-4">
            <div className="w-16 h-16 rounded-full border-4 border-[#0a3d52]/20 border-t-[#0a3d52] dark:border-sky-400/20 dark:border-t-sky-400 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-[#0a3d52] dark:text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Verifying Payment with Stripe...
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Please do not close this window.</p>
          </div>
        )}

        {/* Paid / COD / Success State */}
        {!loading && !hasError && !isCancelled && (
          <div className="space-y-6">
            {/* Emblem */}
            <div className={`w-18 h-18 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center shadow-lg ${
              isPendingVerification
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-amber-500/10"
                : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-emerald-500/10"
            }`}>
              {isPendingVerification ? (
                <PendingActionsRoundedIcon sx={{ fontSize: 42 }} />
              ) : (
                <CheckCircleRoundedIcon sx={{ fontSize: 42 }} />
              )}
            </div>

            {/* Title & Headline */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-[#ff6b4a]">
                {isPendingVerification ? "Payment Awaiting Verification" : "Order Successfully Placed"}
              </span>
              <h1
                className="text-2xl sm:text-3xl font-black text-[#0a3d52] dark:text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                {isPaid
                  ? "Payment Received & Order Booked!"
                  : isPendingVerification
                  ? "Order Received — Awaiting Verification"
                  : "Thank You For Your Order!"}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                {isPendingVerification
                  ? "Our financial & dispatch team will verify your transaction reference and confirm delivery schedule."
                  : "We have dispatched your order confirmation details to your email and our logistics department."}
              </p>
            </div>

            {/* Order Info Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-[#081822] border border-slate-200/90 dark:border-slate-800 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 pb-2.5">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Order Reference</span>
                <span className="text-sm font-black font-mono text-[#0a3d52] dark:text-sky-300">
                  {orderNum}
                </span>
              </div>

              {details?.customerName && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Customer Name</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{details.customerName}</span>
                </div>
              )}

              {details?.email && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Confirmation Email</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{details.email}</span>
                </div>
              )}

              {details?.paymentMethod && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Payment Mode</span>
                  <span className="font-bold text-[#0a3d52] dark:text-sky-400 uppercase">
                    {details.paymentMethod.replace("_", " ")}
                  </span>
                </div>
              )}

              {details?.subtotal && (
                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/80 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Amount</span>
                  <span className="text-sm font-black text-[#ff6b4a]">{fmt(details.subtotal)}</span>
                </div>
              )}
            </div>

            {/* Delivery Alert Pill */}
            <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Our logistics team will contact you shortly to confirm site delivery.</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <RouterLink
                to="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <StorefrontOutlinedIcon sx={{ fontSize: 17 }} />
                <span>Continue Shopping</span>
              </RouterLink>

              {authUser ? (
                <RouterLink
                  to="/dashboard"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-[#0c222e] hover:bg-slate-200 dark:hover:bg-[#153444] text-[#0a3d52] dark:text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <span>View in Dashboard</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </RouterLink>
              ) : (
                <a
                  href={`https://wa.me/923084585792?text=${encodeURIComponent(
                    `Hello MARBLEX Support, I have placed Order ${orderNum}. Please provide a delivery update.`
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span>WhatsApp Tracking</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Cancelled State */}
        {!loading && isCancelled && (
          <div className="space-y-6">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center bg-rose-500/10 text-rose-600 border border-rose-500/20 shadow-lg shadow-rose-500/10">
              <CancelOutlinedIcon sx={{ fontSize: 42 }} />
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-widest text-rose-500">
                Payment Incomplete
              </span>
              <h1
                className="text-2xl sm:text-3xl font-black text-[#0a3d52] dark:text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Checkout Was Cancelled
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                You cancelled the Stripe checkout session. Your cart items have been preserved so you can retry with Cash on Delivery or another payment option.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <RouterLink
                to="/cart"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all"
              >
                <span>Return to Cart</span>
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </RouterLink>

              <RouterLink
                to="/"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-100 dark:bg-[#0c222e] text-slate-700 dark:text-slate-200 font-bold text-xs uppercase tracking-wider flex items-center justify-center"
              >
                <span>Go to Store</span>
              </RouterLink>
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && hasError && (
          <div className="space-y-6">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl mx-auto flex items-center justify-center bg-amber-500/10 text-amber-600 border border-amber-500/20 shadow-lg">
              <ErrorOutlineRoundedIcon sx={{ fontSize: 42 }} />
            </div>

            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-black text-[#0a3d52] dark:text-white">
                Unable to Verify Session
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                If your card was charged, your order is recorded in our system. Please reach out to our WhatsApp hotline for immediate verification.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <a
                href="https://wa.me/923084585792"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3 rounded-xl bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2"
              >
                <WhatsAppIcon sx={{ fontSize: 18 }} />
                <span>Contact Hotline</span>
              </a>
              <RouterLink to="/" className="px-6 py-3 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs uppercase">
                Home
              </RouterLink>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
