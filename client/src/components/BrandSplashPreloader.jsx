import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

const isIntroDone = () => {
  try {
    if (typeof window === "undefined") return false;
    if (window.__MARBLEX_INTRO_DONE__ === true) return true;
  } catch {
    /* ignore */
  }
  return false;
};

export const BrandSplashPreloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const curtainRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const glowRingRef = useRef(null);
  const shineSweepRef = useRef(null);
  const marLettersRef = useRef([]);
  const blexLettersRef = useRef([]);
  const accentLineRef = useRef(null);
  const subtitleRef = useRef(null);
  const badgeRef = useRef(null);
  const [visible, setVisible] = useState(() => !isIntroDone());

  const marLetters = ["M", "A", "R"];
  const blexLetters = ["B", "L", "E", "X"];

  const handleFinish = useCallback(() => {
    window.__MARBLEX_INTRO_DONE__ = true;
    try {
      localStorage.removeItem("marblex_intro_ts");
      sessionStorage.removeItem("marblex_intro_done");
    } catch {
      /* ignore */
    }
    // Broadcast event so Navbar, Hero Banner & Landing Page initiate their entrance seamlessly
    window.dispatchEvent(new CustomEvent("marblex:intro_reveal"));
    onComplete?.();

    if (!containerRef.current) {
      setVisible(false);
      return;
    }

    try {
      gsap.to(containerRef.current, {
        opacity: 0,
        duration: 0.45,
        ease: "power2.inOut",
        onComplete: () => {
          setVisible(false);
        },
      });
    } catch {
      setVisible(false);
    }
  }, [onComplete]);

  useEffect(() => {
    // If intro already ran, immediately notify listeners & exit
    try {
      if (isIntroDone()) {
        window.__MARBLEX_INTRO_DONE__ = true;
        window.dispatchEvent(new CustomEvent("marblex:intro_reveal"));
        onComplete?.();
        setVisible(false);
        return;
      }
    } catch {
      /* ignore */
    }

    // Hand off from HTML boot splash → animated BrandSplash
    try {
      document.getElementById("marblex-boot-splash")?.remove();
    } catch {
      /* ignore */
    }

    // Safety fallback: auto-dismiss after sufficient duration
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 3800);

    const ctx = gsap.context(() => {
      try {
        const activeMarLetters = marLettersRef.current.filter(Boolean);
        const activeBlexLetters = blexLettersRef.current.filter(Boolean);
        const allLetters = [...activeMarLetters, ...activeBlexLetters];

        // --- 1. Initial State (Clean Crisp Reset) ---
        if (logoWrapperRef.current) gsap.set(logoWrapperRef.current, { scale: 0.82, opacity: 0, y: 16 });
        if (glowRingRef.current) gsap.set(glowRingRef.current, { scale: 0.6, opacity: 0 });
        if (shineSweepRef.current) gsap.set(shineSweepRef.current, { xPercent: -160 });
        if (allLetters.length) gsap.set(allLetters, { opacity: 0, y: 14, filter: "blur(6px)" });
        if (accentLineRef.current) gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: "center center" });
        if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 0, y: 8, filter: "blur(3px)" });
        if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 0, scale: 0.9, y: 6 });

        // --- 2. Smooth Master Timeline ---
        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.delayedCall(0.7, handleFinish);
          },
        });

        // Ambient radial glow expansion
        if (glowRingRef.current) {
          tl.to(glowRingRef.current, { scale: 1.35, opacity: 0.9, duration: 0.9, ease: "power2.out" }, 0);
        }

        // Emblem card smooth elevation
        if (logoWrapperRef.current) {
          tl.to(logoWrapperRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }, 0.08);
        }

        // Emblem glass shine reflection
        if (shineSweepRef.current) {
          tl.to(shineSweepRef.current, { xPercent: 220, duration: 0.8, ease: "power1.inOut" }, 0.35);
        }

        // MAR Letters Smooth Cascade
        if (activeMarLetters.length) {
          tl.to(activeMarLetters, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.06, ease: "power3.out" }, 0.45);
        }

        // BLEX Letters Smooth Cascade
        if (activeBlexLetters.length) {
          tl.to(activeBlexLetters, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, stagger: 0.06, ease: "power3.out" }, 0.62);
        }

        // Gradient line expansion
        if (accentLineRef.current) {
          tl.to(accentLineRef.current, { scaleX: 1, duration: 0.6, ease: "power2.out" }, 0.8);
        }

        // Subtitle text reveal
        if (subtitleRef.current) {
          tl.to(subtitleRef.current, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.5, ease: "power2.out" }, 0.95);
        }

        // Certified badge pop
        if (badgeRef.current) {
          tl.to(badgeRef.current, { opacity: 1, scale: 1, y: 0, duration: 0.45, ease: "back.out(1.3)" }, 1.1);
        }
      } catch {
        handleFinish();
      }
    }, containerRef);

    return () => {
      clearTimeout(safetyTimer);
      ctx.revert();
    };
  }, [handleFinish]);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape" || e.key === "Enter" || e.key === " ") {
        handleFinish();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleFinish]);

  if (!visible) return null;

  const content = (
    <div
      ref={containerRef}
      onClick={handleFinish}
      role="button"
      tabIndex={0}
      aria-label="Skip brand animation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999,
        background: "#f5f7fa",
        overflow: "hidden",
      }}
      className="select-none cursor-pointer"
    >
      {/* Clean Light Studio Canvas */}
      <div
        ref={curtainRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "100vh",
          background: "#f5f7fa",
          perspective: "1000px",
        }}
        className="flex flex-col items-center justify-center relative px-4 sm:px-6"
      >
        {/* Soft Radial Gradient Glow */}
        <div 
          ref={glowRingRef}
          className="absolute w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full pointer-events-none opacity-0"
          style={{
            background: "radial-gradient(circle, rgba(255,107,74,0.12) 0%, rgba(10,61,82,0.08) 50%, transparent 70%)",
            filter: "blur(45px)",
          }}
        />

        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#0a3d52 1px, transparent 1px), linear-gradient(90deg, #0a3d52 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        {/* Centered Brand Composition */}
        <div className="relative z-10 flex flex-col items-center text-center max-w-sm sm:max-w-md md:max-w-lg w-full">
          
          {/* Logo Emblem Card */}
          <div
            ref={logoWrapperRef}
            className="relative mb-5 sm:mb-6 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white border border-[#e0e6ed] shadow-2xl shadow-[#0a3d52]/10 flex items-center justify-center overflow-hidden opacity-0"
            style={{
              boxShadow: "0 20px 45px -15px rgba(10, 61, 82, 0.15), 0 0 0 1px rgba(224, 230, 237, 0.8)",
              transform: "scale(0.7) translateY(25px)",
            }}
          >
            {/* Shimmer Light Sweep */}
            <div
              ref={shineSweepRef}
              className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/70 to-transparent skew-x-[-25deg] pointer-events-none"
            />
            
            <img
              src="/logo-icon-transparent.png"
              alt="MARBLEX Emblem"
              className="w-24 h-20 sm:w-32 sm:h-26 md:w-36 md:h-28 object-contain drop-shadow-sm"
            />
          </div>

          {/* Typography */}
          <div className="flex items-center justify-center gap-0.5 sm:gap-1 mb-2.5 sm:mb-3">
            {/* MAR Letters */}
            <div className="flex">
              {marLetters.map((char, i) => (
                <span
                  key={`mar-${i}`}
                  ref={(el) => (marLettersRef.current[i] = el)}
                  className="inline-block text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#0a3d52] opacity-0"
                  style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
                >
                  {char}
                </span>
              ))}
            </div>

            {/* BLEX Letters */}
            <div className="flex">
              {blexLetters.map((char, i) => (
                <span
                  key={`blex-${i}`}
                  ref={(el) => (blexLettersRef.current[i] = el)}
                  className="inline-block text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#ff6b4a] opacity-0"
                  style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
                >
                  {char}
                </span>
              ))}
            </div>
          </div>

          {/* Accent Divider Line */}
          <div className="w-full max-w-[200px] sm:max-w-[260px] h-[2px] sm:h-[2.5px] bg-[#e0e6ed] rounded-full overflow-hidden mb-3">
            <div
              ref={accentLineRef}
              className="h-full bg-gradient-to-r from-[#0a3d52] via-[#ff6b4a] to-[#ff8c73] rounded-full"
              style={{ transform: "scaleX(0)", transformOrigin: "center center" }}
            />
          </div>

          {/* Subtitle - Fully Responsive */}
          <p
            ref={subtitleRef}
            className="text-[9px] sm:text-[11px] md:text-xs font-bold text-[#565e69] uppercase tracking-[0.14em] sm:tracking-[0.22em] mb-3.5 sm:mb-4 font-subheading max-w-[290px] sm:max-w-none leading-relaxed opacity-0"
          >
            Construction Chemical & Rubber Industry
          </p>

          {/* Engineered Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white border border-[#e0e6ed] text-[9px] sm:text-[10px] font-bold text-[#0a3d52] uppercase tracking-wider sm:tracking-widest shadow-sm opacity-0"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] -ml-2.5 sm:-ml-3.5" />
            <span>Industrial Grade Certified</span>
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : content;
};
