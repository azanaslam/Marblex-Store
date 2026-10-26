import { useCallback, useRef, useState } from "react";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import { useStandaloneApp } from "../hooks/useStandaloneApp";

/**
 * Lightweight pull-to-refresh for installed app (touch). Reloads the page.
 */
export function PullToRefresh({ children, disabled = false }) {
  const standalone = useStandaloneApp();
  const startY = useRef(0);
  const pulling = useRef(false);
  const [offset, setOffset] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const onTouchStart = useCallback(
    (e) => {
      if (disabled || !standalone || refreshing) return;
      if (window.scrollY > 4) return;
      startY.current = e.touches[0].clientY;
      pulling.current = true;
    },
    [disabled, standalone, refreshing]
  );

  const onTouchMove = useCallback(
    (e) => {
      if (!pulling.current) return;
      const dy = e.touches[0].clientY - startY.current;
      if (dy < 0) {
        setOffset(0);
        return;
      }
      setOffset(Math.min(88, dy * 0.45));
    },
    []
  );

  const onTouchEnd = useCallback(() => {
    if (!pulling.current) return;
    pulling.current = false;
    if (offset > 64) {
      setRefreshing(true);
      setOffset(56);
      window.setTimeout(() => window.location.reload(), 350);
    } else {
      setOffset(0);
    }
  }, [offset]);

  if (!standalone) return children;

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      className="relative"
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-[50] flex justify-center transition-opacity"
        style={{
          height: offset,
          opacity: offset > 8 || refreshing ? 1 : 0,
        }}
      >
        <div className="mt-2 flex h-9 w-9 items-center justify-center rounded-full bg-[#0a3d52] text-white shadow-md">
          <RefreshRoundedIcon
            sx={{ fontSize: 18 }}
            className={refreshing || offset > 64 ? "animate-spin" : ""}
            style={{ transform: `rotate(${offset * 3}deg)` }}
          />
        </div>
      </div>
      <div style={{ transform: offset ? `translateY(${offset}px)` : undefined }}>
        {children}
      </div>
    </div>
  );
}
