import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

// Bespoke SVG Vector Icon Components
const SvgWaterproof = () => (
  <svg className="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SvgDurability = () => (
  <svg className="w-4 h-4 text-[#ff8c73]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SvgChemical = () => (
  <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="10" cy="16" r="1" fill="currentColor"/>
    <circle cx="14" cy="15" r="0.8" fill="currentColor"/>
  </svg>
);

const SvgExpansion = () => (
  <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

const SvgCleanroom = () => (
  <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="1.75"/>
    <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
  </svg>
);

const showcaseProducts = [
  {
    id: 1,
    shortName: "Membrane",
    badge: "ENGINEERED POLYMER",
    code: "WATERPROOFING MEMBRANE",
    title: "APP Bituminous Membrane System",
    desc: "Polymer-modified reinforced bituminous sheet engineered for extreme puncture resistance and high hydrostatic water head containment.",
    tag: "High Tensile",
    image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
    card1: { icon: SvgWaterproof, title: "100% WATERPROOF", subtitle: "ASTM D-412 Certified" },
    card2: { icon: SvgDurability, title: "EXTREME DURABILITY", subtitle: "Puncture & Tear Proof" },
    card3: { icon: SvgChemical, title: "CHEMICAL RESISTANT", subtitle: "Acid & Alkali Barrier" },
  },
  {
    id: 2,
    shortName: "Rubber Joint",
    badge: "RUBBER INDUSTRIAL DIVISION",
    code: "VULCANIZED RUBBER",
    title: "Heavy-Duty Expansion Waterstops",
    desc: "Engineered vulcanized rubber waterstop profiles designed for structural expansion & construction joints in dams, canals, and basements.",
    tag: "100m Head Seal",
    image: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1200&q=80",
    card1: { icon: SvgDurability, title: "HIGH-PRESSURE SEAL", subtitle: "Up to 5 Bar Resistance" },
    card2: { icon: SvgExpansion, title: "450% ELONGATION", subtitle: "Dynamic Expansion" },
    card3: { icon: SvgChemical, title: "AGEING RESISTANT", subtitle: "50+ Year Lifetime" },
  },
  {
    id: 3,
    shortName: "Elastomeric",
    badge: "MONOLITHIC BARRIER",
    code: "LIQUID ELASTOMERIC",
    title: "Elastomeric Liquid Waterproof Coating",
    desc: "High-grade liquid polymer membrane providing 100% monolithic joint-free barrier against water ingress with 600% crack-bridging elasticity.",
    tag: "Seamless Shield",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=1200&q=80",
    card1: { icon: SvgWaterproof, title: "100% SEAMLESS", subtitle: "Zero Joint Ingress" },
    card2: { icon: SvgExpansion, title: "600% ELASTICITY", subtitle: "Crack-Bridging Tech" },
    card3: { icon: SvgChemical, title: "UV & WEATHER PROOF", subtitle: "Tropical Formula" },
  },
  {
    id: 4,
    shortName: "Epoxy Floor",
    badge: "FLOOR PROTECTION",
    code: "EPOXY FLOOR SYSTEM",
    title: "High-Build Industrial Epoxy Floor",
    desc: "Seamless, chemical, and heavy forklift abrasion-resistant high-build epoxy coatings for pharmaceutical and manufacturing facilities.",
    tag: "Heavy Duty",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
    card1: { icon: SvgChemical, title: "SOLVENT RESISTANT", subtitle: "Resists Acids & Oils" },
    card2: { icon: SvgDurability, title: "HEAVY LOAD RATED", subtitle: "Forklift & Impact Tough" },
    card3: { icon: SvgCleanroom, title: "CLEANROOM GRADE", subtitle: "Seamless Hygiene" },
  },
];

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  
  const sectionRef = useRef(null);
  const liveBadgeRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const actionsRef = useRef(null);
  const metricsRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % showcaseProducts.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  }, []);

  const runEntranceAnimation = useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.fromTo(sectionRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.9 });
    tl.fromTo([liveBadgeRef.current, headlineRef.current, subtitleRef.current, actionsRef.current, metricsRef.current], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 }, "-=0.5");
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;

    const context = gsap.context(() => {
      gsap.fromTo(section, { backgroundPosition: "50% 0%" }, {
        backgroundPosition: "50% 100%",
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
      gsap.to(".hero-copy", {
        yPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 1.2 },
      });
    }, section);

    return () => context.revert();
  }, []);

  // Listen for intro reveal event from splash screen or trigger after safety delay
  useEffect(() => {
    const handleIntroReveal = () => {
      runEntranceAnimation();
    };

    window.addEventListener("marblex:intro_reveal", handleIntroReveal);

    // Safety fallback (in case user reloads or navigates directly)
    const safetyTimer = setTimeout(() => {
      runEntranceAnimation();
    }, 400);

    return () => {
      window.removeEventListener("marblex:intro_reveal", handleIntroReveal);
      clearTimeout(safetyTimer);
    };
  }, [runEntranceAnimation]);

  // Continuous Smooth Auto-Slide Interval (5s)
  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [nextSlide]);

  const current = showcaseProducts[activeSlide];

  return (
    <section
      ref={sectionRef}
      className="relative isolate mb-8 overflow-hidden rounded-[1.5rem] bg-[#163d3a] text-white shadow-xl shadow-[#163d3a]/15 sm:rounded-[2rem]"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(13, 39, 37, .96) 0%, rgba(20, 62, 58, .82) 48%, rgba(20, 62, 58, .26) 100%), url(${current.image})`, backgroundSize: "cover", backgroundPosition: "50% 50%" }}
    >
      <div className="absolute inset-0 bg-black/10" aria-hidden="true" />
      <div className="relative z-10 grid min-h-[440px] grid-cols-1 items-center px-6 py-12 sm:px-10 sm:py-14 lg:min-h-[500px] lg:grid-cols-12 lg:px-14">
        <div className="hero-copy lg:col-span-7">
          <div ref={liveBadgeRef} className="mb-5 inline-flex items-center gap-2 border-b border-white/30 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75 sm:text-xs">
            <span className="size-1.5 rounded-full bg-[#f2a06f]" />
            MARBLEX INDUSTRIAL SOLUTIONS
          </div>
          <h1 ref={headlineRef} className="max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.04em] text-white sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
            Built to keep water out.
          </h1>
          <p ref={subtitleRef} className="mt-5 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
            High-performance waterproofing systems for structures that need to last.
          </p>
          <div ref={actionsRef} className="mt-8 flex flex-wrap items-center gap-3">
            <button onClick={() => navigate("/services")} className="inline-flex items-center gap-2 rounded-full bg-[#f2a06f] px-5 py-3 text-sm font-semibold text-[#163d3a] transition hover:bg-[#ffc19a]">
              Explore solutions <ArrowForwardIcon sx={{ fontSize: 17 }} />
            </button>
            <button onClick={() => navigate("/catalogs")} className="inline-flex items-center gap-2 rounded-full border border-white/35 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
              Technical specs <MenuBookOutlinedIcon sx={{ fontSize: 17 }} />
            </button>
          </div>
          <div ref={metricsRef} className="mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/20 pt-5 text-xs text-white/70 sm:gap-x-10">
            <span><strong className="mr-1 text-white">15+ yrs</strong> durability</span>
            <span><strong className="mr-1 text-white">100%</strong> seal</span>
            <span><strong className="mr-1 text-white">500+</strong> sites</span>
          </div>
        </div>

        <div className="hidden lg:col-span-5 lg:block" aria-hidden="true" />
      </div>

      <div className="absolute bottom-5 right-6 z-20 flex items-center gap-2 sm:right-10">
        <span className="text-xs font-medium text-white/70">0{activeSlide + 1} / 0{showcaseProducts.length}</span>
        <button onClick={prevSlide} aria-label="Previous slide" className="grid size-8 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/15"><KeyboardArrowLeftIcon sx={{ fontSize: 18 }} /></button>
        <button onClick={nextSlide} aria-label="Next slide" className="grid size-8 place-items-center rounded-full border border-white/30 text-white transition hover:bg-white/15"><KeyboardArrowRightIcon sx={{ fontSize: 18 }} /></button>
      </div>
    </section>
          
  );
};
