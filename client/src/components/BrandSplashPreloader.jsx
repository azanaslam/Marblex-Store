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
    if (!containerRef.current) return;
    const tl = gsap.timeline({
      onComplete: () => {
        setVisible(false);
        onComplete?.();
      },
    });

    tl.to(logoWrapperRef.current, {
      scale: 1.06,
      opacity: 0,
      filter: "blur(6px)",
      duration: 0.4,
      ease: "power2.inOut",
    })
    .to(
      curtainRef.current,
      {
        opacity: 0,
        scale: 1.02,
        duration: 0.5,
        ease: "power2.inOut",
      },
      "-=0.2"
    );
  }, [onComplete]);

  useEffect(() => {
    // Safety fallback: guaranteed auto-dismiss after 2 seconds
    const safetyTimer = setTimeout(() => {
      setVisible(false);
      onComplete?.();
    }, 2200);

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.delayedCall(0.5, handleFinish);
        },
      });

      // --- 1. Initial State ---
      gsap.set(logoWrapperRef.current, { scale: 0.7, opacity: 0, y: 25, rotationX: 10 });
      gsap.set(glowRingRef.current, { scale: 0.5, opacity: 0 });
      gsap.set(shineSweepRef.current, { xPercent: -150 });
      gsap.set([...marLettersRef.current, ...blexLettersRef.current], {
        opacity: 0,
        y: 24,
        filter: "blur(6px)",
      });
      gsap.set(accentLineRef.current, { scaleX: 0, transformOrigin: "center center" });
      gsap.set(subtitleRef.current, { opacity: 0, y: 10 });
      gsap.set(badgeRef.current, { opacity: 0, scale: 0.85 });

      // --- 2. Smooth Motion Sequence ---
      
      // Ambient glow
      tl.to(glowRingRef.current, {
        scale: 1.3,
        opacity: 0.7,
        duration: 0.75,
        ease: "power2.out",
      })
      // Logo 3D Floating Rise
      .to(
        logoWrapperRef.current,
        {
          scale: 1,
          opacity: 1,
          y: 0,
          rotationX: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.5"
      )
      // Shimmer sweep across emblem
      .to(
        shineSweepRef.current,
        {
          xPercent: 200,
          duration: 0.65,
          ease: "power2.inOut",
        },
        "-=0.2"
      )
      // Staggered MAR Letters Drop (Navy Teal)
      .to(
        marLettersRef.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.out",
        },
        "-=0.3"
      )
      // Staggered BLEX Letters Drop (Red-Orange)
      .to(
        blexLettersRef.current,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          stagger: 0.04,
          ease: "power3.out",
        },
        "-=0.25"
      )
      // Accent Divider Line Expansion
      .to(
        accentLineRef.current,
        {
          scaleX: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.2"
      )
      // Subtitle Reveal
      .to(
        subtitleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.45,
          ease: "power2.out",
        },
        "-=0.25"
      )
      // Badge Reveal
      .to(
        badgeRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: "back.out(1.4)",
        },
        "-=0.2"
      );

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
          className="absolute w-[320px] sm:w-[500px] h-[320px] sm:h-[500px] rounded-full pointer-events-none"
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
            className="relative mb-5 sm:mb-6 p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] bg-white border border-[#e0e6ed] shadow-2xl shadow-[#0a3d52]/10 flex items-center justify-center overflow-hidden"
            style={{
              boxShadow: "0 20px 45px -15px rgba(10, 61, 82, 0.15), 0 0 0 1px rgba(224, 230, 237, 0.8)",
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
                  className="inline-block text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#0a3d52]"
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
                  className="inline-block text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-[#ff6b4a]"
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
            />
          </div>

          {/* Subtitle - Fully Responsive */}
          <p
            ref={subtitleRef}
            className="text-[9px] sm:text-[11px] md:text-xs font-bold text-[#565e69] uppercase tracking-[0.14em] sm:tracking-[0.22em] mb-3.5 sm:mb-4 font-subheading max-w-[290px] sm:max-w-none leading-relaxed"
          >
            Construction Chemical & Rubber Industry
          </p>

          {/* Engineered Badge */}
          <div
            ref={badgeRef}
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1 rounded-full bg-white border border-[#e0e6ed] text-[9px] sm:text-[10px] font-bold text-[#0a3d52] uppercase tracking-wider sm:tracking-widest shadow-sm"
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
