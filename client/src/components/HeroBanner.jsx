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
  const dotsRef = useRef(null);
  const currentSlideRef = useRef(0);
  const isTransitioningRef = useRef(false);

  const goToSlide = useCallback((index) => {
    if (!bgWrapRef.current || !dotsRef.current) return;
    const bgElements = bgWrapRef.current.children;
    const barElements = dotsRef.current.querySelectorAll(".dot-bar");

    const prevIndex = currentSlideRef.current;
    currentSlideRef.current = index;
    setActiveSlide(index);

    if (prevIndex !== index && bgElements[prevIndex]) {
      gsap.to(bgElements[prevIndex], { opacity: 0, duration: 1.2, ease: "power2.inOut" });
      if (barElements[prevIndex]) {
        gsap.killTweensOf(barElements[prevIndex]);
        gsap.to(barElements[prevIndex], { scaleX: 0, duration: 0.3 });
      }
    }

    if (bgElements[index]) {
      gsap.fromTo(
        bgElements[index],
        { opacity: 0, scale: 1 },
        { opacity: 1, scale: 1, duration: 1.2, ease: "power2.out" }
      );
    }

    if (barElements[index]) {
      gsap.killTweensOf(barElements[index]);
      gsap.fromTo(
        barElements[index],
        { scaleX: 0 },
        {
          scaleX: 1,
          duration: 6,
          ease: "none",
          onComplete: () => {
            const nextIdx = (currentSlideRef.current + 1) % SLIDES.length;
            goToSlide(nextIdx);
          },
        }
      );
    }
  }, []);

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
        .from(".hero-sub, .hero-cta, .hero-dots", { y: 20, opacity: 0, duration: 0.7, stagger: 0.1 }, "-=0.5")
        .add(() => {
          goToSlide(0);
        }, "-=0.3");

      // Scroll Scrub Parallax
      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".hero-bgwrap", { yPercent: 4, ease: "none", scrollTrigger: st });
      gsap.to(".hero-inner", { y: -30, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "bottom 40%" } });
      gsap.to(".hero-card", { scale: 0.99, ease: "none", scrollTrigger: st });
    }, hero);

    return () => ctx.revert();
  }, [goToSlide]);

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
      <section className="hero-card relative w-full h-[clamp(460px,72vh,660px)] rounded-[24px] sm:rounded-[28px] overflow-hidden text-white shadow-2xl isolation-isolate select-none">

        {/* Background Wrap with Multiple Slides (Desktop & Mobile Responsive) */}
        <div ref={bgWrapRef} className="hero-bgwrap absolute inset-0 -z-20 overflow-hidden">
          {SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity opacity-0"
            >
              {/* Mobile Hero Background (Screens < 640px) */}
              <div
                className={`block sm:hidden absolute inset-0 bg-cover ${slide.mobilePos || "bg-center"}`}
                style={{
                  backgroundImage: `url("${slide.mobileImage}"), ${slide.fallback}`,
                }}
              />
              {/* Desktop Hero Background (Screens >= 640px) */}
              <div
                className={`hidden sm:block absolute inset-0 bg-cover ${slide.desktopPos || "bg-center"}`}
                style={{
                  backgroundImage: `url("${slide.desktopImage}"), ${slide.fallback}`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Ambient Dark Gradient Scrim Overlay */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-t from-[#081822]/95 via-[#081822]/60 to-black/20 sm:bg-[linear-gradient(90deg,rgba(8,24,34,0.85)_0%,rgba(8,24,34,0.45)_50%,rgba(8,24,34,0.15)_100%)]"
        />

        {/* Inner Content on Left */}
        <div ref={innerRef} className="hero-inner absolute left-6 sm:left-12 lg:left-16 bottom-10 sm:bottom-14 right-6 max-w-[580px] z-10 space-y-4 sm:space-y-5">

          {/* Eyebrow */}
          <div className="hero-eyebrow inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase text-[#ff8c73] drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>{current.eyebrow}</span>
          </div>

          {/* Headline with Masked Line Animations */}
          <h1
            className="hero-title text-[28px] sm:text-5xl lg:text-[54px] font-black text-white leading-[1.12] sm:leading-[1.08] tracking-[-0.03em] drop-shadow-md"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            <div className="line-mask block overflow-hidden pb-1">
              <span className="block">{current.line1}</span>
            </div>
            <div className="line-mask block overflow-hidden pb-1">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-300">
                {current.line2}
              </span>
            </div>
          </h1>

          {/* Subtitle */}
          <p className="hero-sub text-slate-100/90 text-xs sm:text-sm lg:text-[15px] max-w-[440px] leading-relaxed font-normal">
            {current.sub}
          </p>

          {/* CTA Buttons */}
          <div className="hero-cta flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleScrollToProducts}
              className="inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-white/20 hover:bg-white/30 active:bg-white/35 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider border border-white/40 hover:border-white/60 backdrop-blur-md shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>Shop Products</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>

            <button
              onClick={handleWhatsAppQuote}
              className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider border border-white/30 hover:border-white/50 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Instant Quote</span>
            </button>
          </div>

        </div>

        {/* Progress Dots / Timer Bars at Bottom Right */}
        <div ref={dotsRef} className="hero-dots absolute right-6 sm:right-10 lg:right-14 bottom-6 sm:bottom-12 z-20 flex items-center gap-2.5">
          {SLIDES.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goToSlide(idx)}
              aria-label={`Slide ${idx + 1}`}
              className="w-7 sm:w-9 h-1 sm:h-1.5 rounded-full bg-white/35 relative overflow-hidden transition-all cursor-pointer hover:bg-white/50"
            >
              <i className="dot-bar absolute inset-0 bg-white origin-left scale-x-0" />
            </button>
          ))}
        </div>

      </section>

    </div>
  );
};
