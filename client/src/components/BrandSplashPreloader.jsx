import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

export const BrandSplashPreloader = ({ onComplete }) => {
  const containerRef = useRef(null);
  const curtainRef = useRef(null);
  const logoWrapperRef = useRef(null);
  const glowRingRef = useRef(null);
  const [visible, setVisible] = useState(true);

  const handleFinish = useCallback(() => {
    try {
      sessionStorage.setItem("marblex_intro_done", "1");
    } catch {
      /* ignore */
    }
    window.__MARBLEX_INTRO_DONE__ = true;
    window.dispatchEvent(new CustomEvent("marblex:intro_reveal"));
    onComplete?.();

    if (!containerRef.current) {
      setVisible(false);
      return;
    }

    try {
      const tl = gsap.timeline({
        onComplete: () => setVisible(false),
      });

      if (logoWrapperRef.current) {
        tl.to(logoWrapperRef.current, {
          scale: 1.02,
          opacity: 0,
          y: -8,
          duration: 0.4,
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
          "-=0.25"
        );
      }
    } catch {
      setVisible(false);
    }
  }, [onComplete]);

  useEffect(() => {
    try {
      document.getElementById("marblex-boot-splash")?.remove();
    } catch {
      /* ignore */
    }

    const safetyTimer = setTimeout(() => {
      handleFinish();
    }, 2800);

    const ctx = gsap.context(() => {
      try {
        if (logoWrapperRef.current) {
          gsap.set(logoWrapperRef.current, { scale: 0.94, opacity: 0, y: 12 });
        }
        if (glowRingRef.current) {
          gsap.set(glowRingRef.current, { scale: 0.7, opacity: 0 });
        }

        const tl = gsap.timeline({
          defaults: { ease: "power3.out" },
          onComplete: () => {
            gsap.delayedCall(0.85, handleFinish);
          },
        });

        if (glowRingRef.current) {
          tl.to(glowRingRef.current, { scale: 1.2, opacity: 0.7, duration: 0.7 }, 0);
        }
        if (logoWrapperRef.current) {
          tl.to(
            logoWrapperRef.current,
            { scale: 1, opacity: 1, y: 0, duration: 0.65, ease: "power3.out" },
            0.05
          );
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
    <div ref={containerRef} className="fixed inset-0 z-[999999] overflow-hidden select-none">
      <div
        ref={curtainRef}
        className="relative flex h-full w-full flex-col items-center justify-center bg-[#f5f7fa] px-6"
      >
        <div
          ref={glowRingRef}
          className="pointer-events-none absolute h-[340px] w-[340px] rounded-full opacity-0 sm:h-[480px] sm:w-[480px]"
          style={{
            background:
              "radial-gradient(circle, rgba(255,107,74,0.12) 0%, rgba(10,61,82,0.08) 50%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        <div
          ref={logoWrapperRef}
          className="relative z-10 flex w-full max-w-[340px] items-center justify-center opacity-0 sm:max-w-[420px]"
        >
          <img
            src="/logo.png"
            alt="MARBLEX — Construction Chemical & Rubber Industry"
            width={1000}
            height={812}
            decoding="async"
            fetchPriority="high"
            className="h-auto w-full object-contain"
            style={{ imageRendering: "auto" }}
            draggable={false}
          />
        </div>
      </div>
    </div>
  );
};
