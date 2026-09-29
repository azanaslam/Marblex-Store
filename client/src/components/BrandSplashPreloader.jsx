import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

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
  const [visible, setVisible] = useState(true);

  const marLetters = ["M", "A", "R"];
  const blexLetters = ["B", "L", "E", "X"];

  const handleFinish = useCallback(() => {
    // Broadcast event so Navbar, Hero Banner & Landing Page initiate their entrance immediately
    window.dispatchEvent(new CustomEvent("marblex:intro_reveal"));
    onComplete?.();

    if (!containerRef.current) {
      setVisible(false);
      return;
    }

    try {
      const tl = gsap.timeline({
        onComplete: () => {
          setVisible(false);
        },
      });

      if (logoWrapperRef.current) {
        tl.to(logoWrapperRef.current, {
          scale: 1.05,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.35,
          ease: "power2.inOut",
        });
      }

      if (curtainRef.current) {
        tl.to(
          curtainRef.current,
          {
            opacity: 0,
            duration: 0.45,
            ease: "power2.inOut",
          },
          "-=0.2"
        );
      }
    } catch {
      setVisible(false);
    }
  }, [onComplete]);

  useEffect(() => {
    // Safety fallback: auto-dismiss quickly so page is never blocked
    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 1200);

    const ctx = gsap.context(() => {
      try {
        const tl = gsap.timeline({
          onComplete: () => {
            gsap.delayedCall(0.2, handleFinish);
          },
        });

        const activeMarLetters = marLettersRef.current.filter(Boolean);
        const activeBlexLetters = blexLettersRef.current.filter(Boolean);
        const allLetters = [...activeMarLetters, ...activeBlexLetters];

        // --- 1. Initial State ---
        if (logoWrapperRef.current) gsap.set(logoWrapperRef.current, { scale: 0.7, opacity: 0, y: 20 });
        if (glowRingRef.current) gsap.set(glowRingRef.current, { scale: 0.5, opacity: 0 });
        if (shineSweepRef.current) gsap.set(shineSweepRef.current, { xPercent: -150 });
        if (allLetters.length) gsap.set(allLetters, { opacity: 0, y: 20, filter: "blur(4px)" });
        if (accentLineRef.current) gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: "center center" });
        if (subtitleRef.current) gsap.set(subtitleRef.current, { opacity: 0, y: 8 });
        if (badgeRef.current) gsap.set(badgeRef.current, { opacity: 0, scale: 0.85 });

        // --- 2. Smooth Motion Sequence ---
        if (glowRingRef.current) {
          tl.to(glowRingRef.current, { scale: 1.2, opacity: 0.7, duration: 0.45, ease: "power2.out" });
        }
        if (logoWrapperRef.current) {
          tl.to(logoWrapperRef.current, { scale: 1, opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, "-=0.3");
        }
        if (shineSweepRef.current) {
          tl.to(shineSweepRef.current, { xPercent: 200, duration: 0.45, ease: "power2.inOut" }, "-=0.15");
        }
        if (activeMarLetters.length) {
          tl.to(activeMarLetters, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, stagger: 0.03, ease: "power3.out" }, "-=0.2");
        }
        if (activeBlexLetters.length) {
          tl.to(activeBlexLetters, { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.35, stagger: 0.03, ease: "power3.out" }, "-=0.2");
        }
        if (accentLineRef.current) {
          tl.to(accentLineRef.current, { scaleX: 1, duration: 0.35, ease: "power2.out" }, "-=0.15");
        }
        if (subtitleRef.current) {
          tl.to(subtitleRef.current, { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }, "-=0.15");
        }
        if (badgeRef.current) {
          tl.to(badgeRef.current, { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.4)" }, "-=0.15");
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

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[999999] overflow-hidden select-none"
    >
      {/* Clean Light Studio Canvas */}
      <div
        ref={curtainRef}
        className="w-full h-full bg-[#f5f7fa] flex flex-col items-center justify-center relative px-4 sm:px-6"
        style={{ perspective: "1000px" }}
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
};
