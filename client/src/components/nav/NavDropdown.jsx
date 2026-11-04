import { useEffect, useRef, useState, useCallback } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import EastRoundedIcon from "@mui/icons-material/EastRounded";

export const NavDropdown = ({
  item,
  isOpen = false,
  onToggle,
  onClose,
  isDark = false,
}) => {
  const { t } = useTranslation();
  const location = useLocation();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const [focusedIndex, setFocusedIndex] = useState(-1);

  const isChildActive = Boolean(
    item.children?.some((child) => location.pathname === child.path)
  );

  const clearTimers = useCallback(() => {
    if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
  }, []);

  const handleMouseEnter = () => {
    clearTimers();
    if (!isOpen) {
      hoverTimerRef.current = setTimeout(() => {
        onToggle(true);
      }, 150);
    }
  };

  const handleMouseLeave = () => {
    clearTimers();
    if (isOpen) {
      closeTimerRef.current = setTimeout(() => {
        onClose();
      }, 200);
    }
  };

  const handleTriggerClick = (e) => {
    e.preventDefault();
    clearTimers();
    onToggle(!isOpen);
  };

  // Keyboard accessibility
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onToggle(true);
        setFocusedIndex(0);
      }
      return;
    }

    const count = item.children?.length || 0;
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      triggerRef.current?.focus();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev + 1) % count);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((prev) => (prev - 1 + count) % count);
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusedIndex(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusedIndex(count - 1);
    } else if (e.key === "Tab") {
      // Let tab navigate naturally, close if tabbing away
      onClose();
    }
  };

  // Focus item when focusedIndex changes via keyboard
  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && panelRef.current) {
      const items = panelRef.current.querySelectorAll("[role='menuitem']");
      if (items[focusedIndex]) {
        items[focusedIndex].focus();
      }
    }
  }, [isOpen, focusedIndex]);

  // Reset focus index when closed
  useEffect(() => {
    if (!isOpen) {
      setFocusedIndex(-1);
    }
  }, [isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(e.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target)
      ) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen, onClose]);

  // Close on route change
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={triggerRef}
        type="button"
        id={`nav-trigger-${item.id}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={`nav-menu-${item.id}`}
        onClick={handleTriggerClick}
        onKeyDown={handleKeyDown}
        className={`group relative flex items-center gap-1.5 px-3.5 py-2 text-[13.5px] font-semibold font-subheading rounded-full transition-all duration-150 whitespace-nowrap cursor-pointer touch-manipulation outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
          isChildActive
            ? isDark
              ? "text-white font-bold"
              : "text-[#0a3d52] font-bold"
            : isDark
            ? "text-slate-300 hover:text-white hover:bg-white/5"
            : "text-slate-700 hover:text-[#0a3d52] hover:bg-slate-100/70"
        }`}
      >
        <span>{t(item.labelKey, item.defaultLabel)}</span>
        <KeyboardArrowDownIcon
          sx={{ fontSize: 16 }}
          className={`transition-transform duration-200 text-slate-400 group-hover:text-current ${
            isOpen ? "rotate-180 text-[#ff6b4a]" : ""
          }`}
        />
        {/* Subtle orange indicator if child route active */}
        {isChildActive && (
          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#ff6b4a] rounded-full shadow-xs" />
        )}
      </button>

      {/* Dropdown Panel Card */}
      {isOpen && (
        <div
          ref={panelRef}
          id={`nav-menu-${item.id}`}
          role="menu"
          aria-labelledby={`nav-trigger-${item.id}`}
          className={`absolute start-0 top-[calc(100%+8px)] z-[85] w-72 sm:w-80 rounded-2xl border p-2 shadow-xl transition-all duration-200 ease-out origin-top backdrop-blur-md animate-in fade-in-0 zoom-in-95 ${
            isDark
              ? "bg-[#0c222f]/95 border-slate-700/80 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.65)]"
              : "bg-white/95 border-slate-200/90 shadow-[0_20px_45px_-15px_rgba(10,61,82,0.18)]"
          }`}
        >
          <div className="space-y-1">
            {item.children?.map((child) => {
              const ChildIcon = child.icon;
              const isSelected = location.pathname === child.path;

              return (
                <RouterLink
                  key={child.id}
                  to={child.path}
                  role="menuitem"
                  tabIndex={0}
                  
                  className={`group flex items-center gap-3 rounded-xl p-2.5 transition-all duration-150 outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
                    isSelected
                      ? isDark
                        ? "bg-[#ff6b4a]/15 text-[#ff8c73]"
                        : "bg-[#0a3d52]/5 text-[#0a3d52]"
                      : isDark
                      ? "text-slate-200 hover:bg-white/5"
                      : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      isSelected
                        ? isDark
                          ? "bg-[#ff6b4a]/25 text-[#ff8c73]"
                          : "bg-[#0a3d52] text-white"
                        : isDark
                        ? "bg-slate-800/90 text-slate-300 group-hover:bg-[#ff6b4a]/20 group-hover:text-[#ff8c73]"
                        : "bg-slate-100 text-[#0a3d52] group-hover:bg-[#0a3d52]/10 group-hover:text-[#0a3d52]"
                    }`}
                  >
                    <ChildIcon sx={{ fontSize: 20 }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="block text-[13.5px] font-bold leading-snug truncate">
                        {t(child.labelKey, child.defaultLabel)}
                      </span>
                      <EastRoundedIcon
                        sx={{ fontSize: 14 }}
                        className={`transition-transform duration-150 rtl:rotate-180 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 ${
                          isSelected ? "opacity-100 text-[#ff6b4a]" : "opacity-0 group-hover:opacity-70"
                        }`}
                      />
                    </div>
                    <span
                      className={`block text-[11px] leading-tight truncate mt-0.5 ${
                        isDark ? "text-slate-400" : "text-slate-500"
                      }`}
                    >
                      {t(child.descKey, child.defaultDesc)}
                    </span>
                  </div>
                </RouterLink>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
