import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

export const NavLogo = ({ isDark = false, showBackOnMobile = true, onNavigate }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex shrink-0 items-center gap-1.5 sm:gap-2.5">
      {showBackOnMobile && !isHomePage && (
        <button
          type="button"
          onClick={() => navigate(-1)}
          className={`lg:hidden flex h-9 w-9 items-center justify-center rounded-xl border transition-colors shrink-0 touch-manipulation cursor-pointer ${
            isDark
              ? "border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-800"
              : "border-slate-200 bg-slate-100 text-[#0a3d52] hover:bg-slate-200"
          }`}
          aria-label="Go Back"
        >
          <ArrowBackIosNewIcon sx={{ fontSize: 14 }} className="rtl:rotate-180" />
        </button>
      )}

      <RouterLink
        to="/"
        onClick={onNavigate}
        className="group flex items-center gap-2 sm:gap-2.5 min-w-0 outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] rounded-xl"
        aria-label="MARBLEX Home"
      >
        <div
          className={`h-9 w-9 sm:h-11 sm:w-11 rounded-xl sm:rounded-2xl border p-1 sm:p-1.5 flex items-center justify-center shrink-0 shadow-xs transition-transform duration-200 group-hover:scale-105 overflow-hidden ${
            isDark ? "bg-[#0e2735] border-slate-700/80" : "bg-white border-slate-200"
          }`}
        >
          <img
            src="/logo-icon-transparent.png"
            alt="MARBLEX Emblem"
            className="h-full w-full object-contain pointer-events-none"
            loading="eager"
          />
        </div>

        <div className="flex flex-col justify-center min-w-0 leading-none">
          <span
            className={`text-[1.15rem] sm:text-[1.38rem] font-black tracking-tight font-heading leading-none whitespace-nowrap ${
              isDark ? "text-white" : "text-[#0a3d52]"
            }`}
          >
            MAR<span className="text-[#ff6b4a]">BLEX</span>
          </span>
          <span
            className={`text-[7.5px] sm:text-[9px] font-bold tracking-[0.14em] sm:tracking-[0.18em] uppercase font-subheading mt-0.5 whitespace-nowrap ${
              isDark ? "text-slate-400" : "text-[#475569]"
            }`}
          >
            CHEMICAL & RUBBER
          </span>
        </div>
      </RouterLink>
    </div>
  );
};
