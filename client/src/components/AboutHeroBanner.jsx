import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Dedicated About Us Brand Showcase Slides (Separate Desktop 16:9 and Mobile 9:16 Assets)
const ABOUT_SLIDES = [
  {
    desktopImage: "/about/about_desktop_manufacturing.jpg",
    mobileImage: "/about/about_mobile_manufacturing.jpg",
    fallback: "linear-gradient(135deg, #0a3d52, #0d4e68 60%, #156580)",
    eyebrow: "ESTABLISHED 2010 • INDUSTRIAL MASTERY",
    line1: "Engineered Durability,",
    line2: "Chemical Excellence.",
    sub: "Advanced polymer compounding, ISO-certified waterproofing synthesizers, and heavy industrial chemical formulations for civil infrastructure.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
  {
    desktopImage: "/about/about_desktop_lab.jpg",
    mobileImage: "/about/about_mobile_lab.jpg",
    fallback: "linear-gradient(135deg, #082836, #0e3f52 60%, #1b586e)",
    eyebrow: "ACCREDITED ASTM & BS 8102 RIGOR",
    line1: "Precision Tested,",
    line2: "Hydrostatic Proof.",
    sub: "State-of-the-art materials testing laboratory with 5-bar hydrostatic rigs, tensile elongation assays, and climate simulation.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
  {
    desktopImage: "/about/about_desktop_engineering.jpg",
    mobileImage: "/about/about_mobile_engineering.jpg",
    fallback: "linear-gradient(135deg, #09202a, #133847 60%, #1f4f63)",
    eyebrow: "500+ NATIONWIDE MEGA SITES",
    line1: "Dams, Basements &",
    line2: "Heavy Foundations.",
    sub: "Proven monolithic protection across Pakistan's most demanding geotechnical and high-water-table civil engineering landmarks.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
  {
    desktopImage: "/about/about_desktop_headquarters.jpg",
    mobileImage: "/about/about_mobile_headquarters.jpg",
    fallback: "linear-gradient(135deg, #0b3242, #184c5f 60%, #28687e)",
    eyebrow: "HEADQUARTERS • LAHORE, PAKISTAN",
    line1: "Direct Logistics,",
    line2: "Contractor Supply.",
    sub: "Comprehensive nationwide technical support, contractor certifications, and on-site engineering consultations.",
    mobilePos: "bg-center",
    desktopPos: "bg-center",
  },
];

export const AboutHeroBanner = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);

  const heroRef = useRef(null);
  const bgWrapRef = useRef(null);
  const innerRef = useRef(null);
  const dotsRef = useRef(null);
  const currentSlideRef = useRef(0);

  const goToSlide = useCallback((index) => {
    if (!bgWrapRef.current || !dotsRef.current) return;
    const bgElements = bgWrapRef.current.children;
    const barElements = dotsRef.current.querySelectorAll(".dot-bar");

    const prevIndex = currentSlideRef.current;
    currentSlideRef.current = index;
    setActiveSlide(index);

    if (prevIndex !== index && bgElements[prevIndex]) {
      gsap.to(bgElements[prevIndex], { opacity: 0, duration: 1.1, ease: "power2.inOut" });
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
            const nextIdx = (currentSlideRef.current + 1) % ABOUT_SLIDES.length;
            goToSlide(nextIdx);
          },
        }
      );
    }
  }, []);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from(".about-hero-card", {
        clipPath: "inset(0 0 100% 0 round 28px)",
        duration: 1.0,
        ease: "power4.inOut",
      })
        .from(".about-hero-eyebrow", { y: 14, opacity: 0, duration: 0.6 }, "-=0.4")
        .from(".about-hero-title .line-mask span", { yPercent: 110, duration: 0.85, stagger: 0.1 }, "-=0.5")
        .from(".about-hero-sub, .about-hero-cta, .about-hero-dots", { y: 20, opacity: 0, duration: 0.65, stagger: 0.1 }, "-=0.5")
        .add(() => {
          goToSlide(0);
        }, "-=0.3");

      const st = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
      gsap.to(".about-hero-bgwrap", { yPercent: 4, ease: "none", scrollTrigger: st });
      gsap.to(".about-hero-inner", { y: -25, opacity: 0, ease: "none", scrollTrigger: { ...st, end: "bottom 45%" } });
    }, hero);

    return () => ctx.revert();
  }, [goToSlide]);

  const handleWhatsAppConsult = () => {
    const current = ABOUT_SLIDES[activeSlide];
    const text = encodeURIComponent(
      `Hello MARBLEX, I would like to consult regarding a construction chemical & waterproofing project (${current.eyebrow}).`
    );
    window.open(`https://wa.me/923481116611?text=${text}`, "_blank");
  };

  const current = ABOUT_SLIDES[activeSlide];

  return (
    <div ref={heroRef} className="w-full">
      <section className="about-hero-card relative w-full h-[clamp(460px,72vh,660px)] rounded-[24px] sm:rounded-[28px] overflow-hidden text-white shadow-2xl isolation-isolate select-none">
        
        {/* Background Wrap with Dedicated About Us Slides */}
        <div ref={bgWrapRef} className="about-hero-bgwrap absolute inset-0 -z-20 overflow-hidden">
          {ABOUT_SLIDES.map((slide, idx) => (
            <div
              key={idx}
              className="absolute inset-0 transition-opacity opacity-0"
            >
              {/* Dedicated Mobile Asset (Screens < 640px) */}
              <div
                className={`block sm:hidden absolute inset-0 bg-cover ${slide.mobilePos || "bg-center"}`}
                style={{
                  backgroundImage: `url("${slide.mobileImage}"), ${slide.fallback}`,
                }}
              />
              {/* Dedicated Desktop Asset (Screens >= 640px) */}
              <div
                className={`hidden sm:block absolute inset-0 bg-cover ${slide.desktopPos || "bg-center"}`}
                style={{
                  backgroundImage: `url("${slide.desktopImage}"), ${slide.fallback}`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Ambient Dark Scrim Gradient Overlay */}
        <div
          className="absolute inset-0 -z-10 pointer-events-none bg-gradient-to-t from-[#081822]/95 via-[#081822]/60 to-black/25 sm:bg-[linear-gradient(90deg,rgba(8,24,34,0.88)_0%,rgba(8,24,34,0.50)_52%,rgba(8,24,34,0.18)_100%)]"
        />

        {/* Hero Content Left */}
        <div ref={innerRef} className="about-hero-inner absolute left-6 sm:left-12 lg:left-16 bottom-10 sm:bottom-14 right-6 max-w-[600px] z-10 space-y-4 sm:space-y-5">
          
          {/* Eyebrow */}
          <div className="about-hero-eyebrow inline-flex items-center gap-2 text-[11px] sm:text-xs font-bold tracking-[0.14em] uppercase text-[#ff8c73] drop-shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>{current.eyebrow}</span>
          </div>

          {/* Headline */}
          <h1
            className="about-hero-title text-[28px] sm:text-5xl lg:text-[52px] font-black text-white leading-[1.12] sm:leading-[1.08] tracking-[-0.03em] drop-shadow-md"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            <div className="line-mask block overflow-hidden pb-1">
              <span className="block">{current.line1}</span>
            </div>
            <div className="line-mask block overflow-hidden pb-1">
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-white">
                {current.line2}
              </span>
            </div>
          </h1>

          {/* Subtitle */}
          <p className="about-hero-sub text-slate-100/90 text-xs sm:text-sm lg:text-[15px] max-w-[480px] leading-relaxed font-normal">
            {current.sub}
          </p>

          {/* CTAs */}
          <div className="about-hero-cta flex flex-wrap items-center gap-3 pt-2">
            <div className="glowing-border-wrap">
              <div className="glowing-border-beam" />
              <div className="glowing-border-body">
                <button
                  onClick={() => navigate("/catalogs")}
                  className="shimmer-btn inline-flex items-center gap-2 px-6 sm:px-7 py-3 sm:py-3.5 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-[0_0_28px_rgba(255,107,74,0.45)] transition-all hover:scale-[0.99] active:scale-95 cursor-pointer"
                >
                  <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Explore Technical Catalog</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>

            <button
              onClick={handleWhatsAppConsult}
              className="shimmer-btn inline-flex items-center gap-2 px-5 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider border border-white/30 hover:border-white/50 backdrop-blur-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Direct WhatsApp</span>
            </button>
          </div>

        </div>

        {/* Slide Progress Dots */}
        <div ref={dotsRef} className="about-hero-dots absolute right-6 sm:right-10 lg:right-14 bottom-6 sm:bottom-12 z-20 flex items-center gap-2.5">
          {ABOUT_SLIDES.map((_, idx) => (
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
