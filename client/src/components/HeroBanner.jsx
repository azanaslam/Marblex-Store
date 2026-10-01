import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Optimized High-Resolution Civil & Chemical Infrastructure Images (Desktop & Mobile)
const SLIDES = [
  {
    desktopImage: "/hero/desktop_waterproofing.jpg",
    mobileImage: "/hero/mobile_waterproofing.jpg",
    fallback: "linear-gradient(135deg, #0f3a52, #1d5f7a 60%, #2b7a8c)",
    eyebrow: "Chemical & Rubber Division",
    line1: "Built to last,",
    line2: "sealed to stay dry.",
    sub: "High-performance waterstops, polymer membranes and industrial coatings for dams, basements and modern construction.",
    mobilePos: "bg-center",
    desktopPos: "bg-[center_20%]",
  },
  {
    desktopImage: "/hero/desktop_chemical.jpg",
    mobileImage: "/hero/mobile_chemical.jpg",
    fallback: "linear-gradient(135deg, #09202a, #133847 60%, #1f4f63)",
    eyebrow: "Advanced Chemical Compounding",
    line1: "Engineered polymers,",
    line2: "precision formulated.",
    sub: "State-of-the-art chemical reactors synthesizing advanced elastomeric polymers and ASTM-certified concrete waterproofing compounds.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
  {
    desktopImage: "/hero/desktop_waterstop.jpg",
    mobileImage: "/hero/mobile_waterstop.jpg",
    fallback: "linear-gradient(135deg, #1a2f3a, #2c4a58 60%, #5a6f78)",
    eyebrow: "Vulcanized Joint Technology",
    line1: "High-pressure seals,",
    line2: "zero water ingress.",
    sub: "Heavy-duty vulcanized rubber waterstop profiles engineered for dynamic expansion joints and 100m hydrostatic head containment.",
    mobilePos: "bg-center",
    desktopPos: "bg-[center_30%]",
  },
  {
    desktopImage: "/hero/desktop_flooring.jpg",
    mobileImage: "/hero/mobile_flooring.jpg",
    fallback: "linear-gradient(135deg, #12303f, #215a63 60%, #7a8f86)",
    eyebrow: "Industrial Flooring & Epoxy",
    line1: "Chemical resistant,",
    line2: "heavy-load rated.",
    sub: "High-build seamless industrial epoxy floor coatings engineered for pharmaceutical cleanrooms and heavy forklift durability.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
];

const CATEGORIES = [
  {
    title: "Waterstops",
    desc: "Vulcanized rubber profiles for expansion and construction joints in civil dams & basements.",
    categoryFilter: "Rubber Waterstops",
    icon: (
      <svg className="w-6 h-6 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Membranes",
    desc: "Polymer waterproofing sheets and bituminous barriers for roofs, basements and containment tanks.",
    categoryFilter: "Bituminous Membranes",
    icon: (
      <svg className="w-6 h-6 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
        <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Coatings & Floors",
    desc: "Elastomeric liquid barriers and high-build chemical-resistant epoxy systems for heavy-duty surfaces.",
    categoryFilter: "Industrial Epoxy",
    icon: (
      <svg className="w-6 h-6 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="16" r="1.2" fill="currentColor" />
        <circle cx="14" cy="15" r="1" fill="currentColor" />
      </svg>
    ),
  },
];

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroRef = useRef(null);
  const bgWrapRef = useRef(null);
  const innerRef = useRef(null);
  const videoRef = useRef(null);
  const currentSlideRef = useRef(0);

  // Synchronize video start exactly when BrandSplashPreloader logo animation finishes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set smooth, slow-motion cinematic playback speed
    video.playbackRate = 0.65;
    video.pause();
    video.currentTime = 0;

    let hasStarted = false;
    const startPlayback = () => {
      if (hasStarted || !video) return;
      hasStarted = true;
      video.playbackRate = 0.65;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => { });
      }
    };

    window.addEventListener("marblex:intro_reveal", startPlayback);

    // Fallback: If preloader already finished or user navigated from another page
    const fallbackTimer = setTimeout(() => {
      startPlayback();
    }, 1200);

    return () => {
      window.removeEventListener("marblex:intro_reveal", startPlayback);
      clearTimeout(fallbackTimer);
    };
  }, []);

  const isTransitioningRef = useRef(false);

  const changeSlide = useCallback((nextIdx) => {
    if (isTransitioningRef.current || nextIdx === currentSlideRef.current) return;
    isTransitioningRef.current = true;

    const inner = innerRef.current;
    if (!inner) {
      currentSlideRef.current = nextIdx;
      setActiveSlide(nextIdx);
      isTransitioningRef.current = false;
      return;
    }

    const animTargets = inner.querySelectorAll(
      ".hero-eyebrow, .hero-title .line-mask span, .hero-sub"
    );

    // Phase 1: Ultra-smooth exit (subtle upward shift, soft blur & fade out)
    gsap.to(animTargets, {
      opacity: 0,
      y: -10,
      filter: "blur(5px)",
      duration: 0.35,
      stagger: 0.03,
      ease: "power2.inOut",
      onComplete: () => {
        // Phase 2: Update slide state
        currentSlideRef.current = nextIdx;
        setActiveSlide(nextIdx);

        // Phase 3: Ultra-smooth staggered entrance from below with crystal focus
        requestAnimationFrame(() => {
          if (!innerRef.current) {
            isTransitioningRef.current = false;
            return;
          }
          const newTargets = innerRef.current.querySelectorAll(
            ".hero-eyebrow, .hero-title .line-mask span, .hero-sub"
          );

          gsap.fromTo(
            newTargets,
            { opacity: 0, y: 14, filter: "blur(6px)" },
            {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              duration: 0.72,
              stagger: 0.07,
              ease: "power3.out",
              onComplete: () => {
                isTransitioningRef.current = false;
              },
            }
          );
        });
      },
    });
  }, []);

  // Continuous smooth auto-rotation of headline messages every 6 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      const nextIdx = (currentSlideRef.current + 1) % SLIDES.length;
      changeSlide(nextIdx);
    }, 6000);

    return () => clearInterval(timer);
  }, [changeSlide]);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    // Entrance Animation
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".hero-card", {
        clipPath: "inset(0 0 100% 0 round 28px)",
        duration: 1.1,
        ease: "power4.inOut",
      })
        .from(".hero-eyebrow", { y: 14, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".hero-title .line-mask span", { yPercent: 110, duration: 0.9, stagger: 0.12 }, "-=0.5")
        .from(".hero-sub, .hero-cta", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.5");

      // Scroll Scrub Parallax
      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-bgwrap", { yPercent: 4, ease: "none", scrollTrigger: st });
      gsap.to(".hero-inner", { y: -30, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "bottom 40%" } });
      gsap.to(".hero-card", { scale: 0.99, ease: "none", scrollTrigger: st });
    }, hero);

    return () => ctx.revert();
  }, []);

  const handleScrollToProducts = () => {
    const el = document.getElementById("products-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      navigate("/shop");
    }
  };

  const handleWhatsAppQuote = () => {
    const current = SLIDES[activeSlide];
    const text = encodeURIComponent(
      `Hello MARBLEX, I would like to request an instant quotation and technical data regarding ${current.line1} ${current.line2} (${current.eyebrow}).`
    );
    window.open(`https://wa.me/923481116611?text=${text}`, "_blank");
  };

  const current = SLIDES[activeSlide];

  return (
    <div ref={heroRef} className="w-full">

      {/* ==================== Cinema Hero Card ==================== */}
      <section className="hero-card relative w-full h-[clamp(440px,66vh,540px)] sm:h-[clamp(480px,62vh,620px)] lg:h-[clamp(520px,68vh,660px)] rounded-[22px] sm:rounded-[28px] overflow-hidden text-white shadow-2xl isolation-isolate select-none">

        {/* Background Wrap with High-Definition Construction Video */}
        <div ref={bgWrapRef} className="hero-bgwrap absolute inset-0 -z-20 overflow-hidden bg-[#071822]">
          <video
            ref={videoRef}
            loop
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={(e) => {
              e.currentTarget.playbackRate = 0.65;
            }}
            onPlay={(e) => {
              e.currentTarget.playbackRate = 0.65;
            }}
            className="absolute inset-0 w-full h-full object-cover object-[center_35%] sm:object-center scale-[1.01] contrast-[1.06] brightness-[0.96]"
          >
            <source
              src="/hero/Workers_installing_Marblex_water…_20261001190558.mp4"
              type="video/mp4"
            />
          </video>
        </div>

        {/* Half-cut directional fade overlay: Bottom-fade on mobile, Left-to-Right fade on desktop */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(5,17,25,0.1)_0%,rgba(5,17,25,0.4)_30%,rgba(5,17,25,0.85)_60%,#051119_100%)] sm:bg-[linear-gradient(90deg,#051119_0%,rgba(5,17,25,0.93)_32%,rgba(5,17,25,0.72)_48%,rgba(5,17,25,0.22)_66%,transparent_84%)]"
        />

        {/* Inner Content on Left (Anchored at bottom on mobile, vertically centered on desktop) */}
        <div
          ref={innerRef}
          className="hero-inner absolute left-5 right-5 sm:right-auto sm:left-12 lg:left-16 bottom-6 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 max-w-[580px] z-10 space-y-3 sm:space-y-4.5"
        >
          {/* Eyebrow */}
          <div className="hero-eyebrow inline-flex items-center gap-2 text-[10.5px] sm:text-xs font-bold tracking-[0.14em] uppercase text-[#ff8c73] drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>{current.eyebrow}</span>
          </div>

          {/* Headline with Masked Line Animations */}
          <h1
            className="hero-title text-[24px] sm:text-5xl lg:text-[54px] font-black text-white leading-[1.14] sm:leading-[1.08] tracking-[-0.03em] drop-shadow-md"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            <div className="line-mask block overflow-hidden pb-0.5 sm:pb-1">
              <span className="block">{current.line1}</span>
            </div>
            <div className="line-mask block overflow-hidden pb-0.5 sm:pb-1">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff8c73]">
                {current.line2}
              </span>
            </div>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub text-slate-100/90 text-xs sm:text-sm lg:text-[15px] max-w-[460px] leading-relaxed font-normal drop-shadow-sm">
            {current.sub}
          </p>

          {/* Action CTAs: Side-by-side row on mobile and desktop */}
          <div className="hero-cta flex flex-row items-center gap-2 sm:gap-3 pt-1 sm:pt-2 w-full sm:w-auto">
            <div className="glowing-border-wrap flex-1 sm:flex-initial">
              <div className="glowing-border-beam" />
              <div className="glowing-border-body w-full">
                <button
                  onClick={handleScrollToProducts}
                  className="shimmer-btn w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3.5 sm:px-7 py-2.5 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] text-white font-bold text-[11px] sm:text-sm uppercase tracking-wider shadow-[0_0_24px_rgba(255,107,74,0.4)] transition-all hover:scale-[0.99] active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <span>Shop Products</span>
                  <ArrowForwardIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                </button>
              </div>
            </div>

            <button
              onClick={handleWhatsAppQuote}
              className="shimmer-btn flex-1 sm:flex-initial w-full sm:w-auto inline-flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-[11px] sm:text-sm uppercase tracking-wider border border-white/30 hover:border-white/50 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer whitespace-nowrap"
            >
              <WhatsAppIcon sx={{ fontSize: { xs: 16, sm: 18 }, color: "#10b981" }} />
              <span>Instant Quote</span>
            </button>
          </div>

        </div>

      </section>

    </div>
  );
};
