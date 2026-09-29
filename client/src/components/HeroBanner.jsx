import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import gsap from "gsap";

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
  const [isHovered, setIsHovered] = useState(false);
  
  const sectionRef = useRef(null);
  const liveBadgeRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const actionsRef = useRef(null);
  const metricsRef = useRef(null);
  const rightCardRef = useRef(null);

  const slideContainerRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % showcaseProducts.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  }, []);

  // Grand Initial Entrance Animation
  const runEntranceAnimation = useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (sectionRef.current) {
      tl.fromTo(
        sectionRef.current,
        { opacity: 0, y: 35, scale: 0.98, filter: "blur(10px)" },
        { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 1.4 }
      );
    }

    if (liveBadgeRef.current) {
      tl.fromTo(
        liveBadgeRef.current,
        { opacity: 0, y: -16, filter: "blur(4px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.9 },
        "-=0.95"
      );
    }

    if (headlineRef.current) {
      tl.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 1.15 },
        "-=0.7"
      );
    }

    if (subtitleRef.current) {
      tl.fromTo(
        subtitleRef.current,
        { opacity: 0, y: 22 },
        { opacity: 1, y: 0, duration: 1.0 },
        "-=0.75"
      );
    }

    if (actionsRef.current) {
      tl.fromTo(
        actionsRef.current.children,
        { opacity: 0, y: 18, scale: 0.94 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, stagger: 0.12 },
        "-=0.6"
      );
    }

    if (metricsRef.current) {
      tl.fromTo(
        metricsRef.current.children,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.9, stagger: 0.12 },
        "-=0.5"
      );
    }

    if (rightCardRef.current) {
      tl.fromTo(
        rightCardRef.current,
        { opacity: 0, x: 35, scale: 0.95, filter: "blur(6px)" },
        { opacity: 1, x: 0, scale: 1, filter: "blur(0px)", duration: 1.3 },
        "-=1.05"
      );
    }
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
      className="relative mb-8 sm:mb-12 md:mb-14 rounded-2xl sm:rounded-3xl md:rounded-[2.5rem] bg-gradient-to-br from-[#0a3d52] via-[#0b4860] to-[#082a38] border border-[#0d4e68]/60 text-white overflow-hidden shadow-2xl shadow-[#0a3d52]/25"
    >
      
      {/* Soft Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[350px] sm:w-[500px] h-[350px] sm:h-[500px] bg-[#ff6b4a]/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[300px] sm:w-[450px] h-[300px] sm:h-[450px] bg-[#0ea5e9]/15 rounded-full blur-[130px] pointer-events-none translate-y-1/3" />
      <div className="absolute top-1/2 left-0 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] bg-[#ff8c73]/15 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 p-5 sm:p-8 md:p-10 lg:p-12 xl:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="lg:col-span-7 space-y-5 sm:space-y-6">
          
          {/* Top Live Badge */}
          <div 
            ref={liveBadgeRef}
            className="inline-flex items-center gap-2 px-3 sm:px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] sm:text-xs font-bold text-[#ff8c73] uppercase tracking-wider shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse shrink-0" />
            <span>MARBLEX INDUSTRIAL SOLUTIONS</span>
          </div>

          {/* Headline */}
          <h1 
            ref={headlineRef}
            className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] xl:text-[52px] font-black text-white leading-[1.12] sm:leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineered For <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#ffb199] drop-shadow-sm">
              Absolute Durability
            </span> <br />
            & Waterproofing.
          </h1>

          {/* Subtitle */}
          <p 
            ref={subtitleRef}
            className="text-slate-100 text-xs sm:text-base lg:text-lg max-w-xl leading-relaxed font-normal opacity-95"
          >
            ISO-certified elastomeric coatings, heavy-duty vulcanized rubber waterstops, and polymer membranes engineered for civil infrastructure, dams, basements, and modern construction.
          </p>

          {/* Action Buttons */}
          <div 
            ref={actionsRef}
            className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-2"
          >
            <button 
              onClick={() => navigate("/services")}
              className="btn-3d-accent w-full sm:w-auto px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/30 cursor-pointer"
            >
              <span>EXPLORE SOLUTIONS</span>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </button>

            <button 
              onClick={() => navigate("/catalogs")}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 hover:border-white/40 backdrop-blur-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MenuBookOutlinedIcon sx={{ fontSize: 18, color: "#ff8c73" }} />
              <span>TECHNICAL SPECS</span>
            </button>

            <a 
              href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20need%20technical%20assistance%20and%20quotation."
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto px-5 py-3 sm:py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              <span>WHATSAPP QUOTE</span>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div 
            ref={metricsRef}
            className="pt-4 sm:pt-6 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg"
          >
            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#ff8c73] shrink-0 shadow-inner">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-base font-black text-white leading-tight">15+ Yrs</div>
                <div className="text-[9px] sm:text-xs text-slate-200">Durability Life</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300 shrink-0 shadow-inner">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-base font-black text-white leading-tight">100%</div>
                <div className="text-[9px] sm:text-xs text-slate-200">Hydrostatic Seal</div>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-2.5">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 21V9L12 3L20 9V21M9 21V12H15V21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div className="text-xs sm:text-base font-black text-white leading-tight">500+</div>
                <div className="text-[9px] sm:text-xs text-slate-200">Major Sites</div>
              </div>
            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (PREMIUM CINEMATIC SHOWCASE) ==================== */}
        <div 
          ref={rightCardRef}
          className="lg:col-span-5"
        >
          <div 
            ref={slideContainerRef}
            className="bg-[#072430]/85 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl shadow-black/40 relative overflow-hidden"
          >
            
            {/* Ambient Background Glow inside Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b4a]/15 rounded-full blur-[80px] pointer-events-none" />

            {/* Card Header & Controls */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <div className="transition-all duration-500 ease-out">
                <span className="px-3 py-1 rounded-full bg-[#ff6b4a]/20 text-[#ff8c73] text-[11px] font-bold uppercase tracking-wider border border-[#ff6b4a]/30 shadow-xs inline-block">
                  {current.badge}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 backdrop-blur-md">
                  0{activeSlide + 1} <span className="opacity-40">/</span> 0{showcaseProducts.length}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                  >
                    <KeyboardArrowLeftIcon sx={{ fontSize: 17 }} />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/15 transition-all cursor-pointer"
                  >
                    <KeyboardArrowRightIcon sx={{ fontSize: 17 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* Cinematic Image Showcase Stage (Silky Smooth Stacked Cross-Fade) */}
            <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/15 h-64 sm:h-72 bg-[#051a24] shadow-inner group">
              {showcaseProducts.map((prod, idx) => {
                const isActive = activeSlide === idx;
                return (
                  <div
                    key={prod.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      isActive
                        ? "opacity-100 scale-100 z-10 pointer-events-auto"
                        : "opacity-0 scale-[1.04] z-0 pointer-events-none"
                    }`}
                  >
                    <img 
                      src={prod.image} 
                      alt={prod.title}
                      className={`w-full h-full object-cover object-center transition-transform duration-1000 ease-out ${
                        isActive ? "scale-100 group-hover:scale-105" : "scale-105"
                      }`}
                      onError={(e) => {
                        e.currentTarget.src = "/products/Banner1.jpeg";
                      }}
                    />
                    
                    {/* Bottom Dark Gradient Scrim Overlay for crisp text contrast */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#051a24] via-[#051a24]/30 to-transparent" />

                    {/* Code Chip (Top Left) */}
                    <div className="absolute top-3.5 left-3.5 bg-[#0a3d52]/90 backdrop-blur-md text-white text-[10.5px] font-mono font-extrabold px-3 py-1 rounded-lg shadow-md border border-white/15">
                      {prod.code}
                    </div>

                    {/* Tag Chip (Bottom Right) */}
                    <div className="absolute bottom-3.5 right-3.5 bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] text-white text-[10.5px] font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                      <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
                      <span>{prod.tag}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Title and Description */}
            <div className="space-y-1.5 mb-4 relative z-10 min-h-[64px]">
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-heading transition-all duration-400">
                {current.title}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed line-clamp-2 font-normal transition-all duration-400">
                {current.desc}
              </p>
            </div>

            {/* 3 Bottom Feature Cards Grid */}
            <div className="grid grid-cols-3 gap-2 pt-3.5 border-t border-white/15 relative z-10">
              {[current.card1, current.card2, current.card3].map((card, idx) => {
                const IconComponent = card.icon;
                return (
                  <div 
                    key={idx}
                    className="p-2 sm:p-2.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 transition-all duration-300 flex flex-col items-start gap-1 backdrop-blur-sm"
                  >
                    <IconComponent sx={{ fontSize: 17, color: "#ff8c73" }} />
                    <span className="text-[10px] font-bold text-white leading-tight uppercase font-heading">
                      {card.title}
                    </span>
                    <span className="text-[8.5px] text-slate-300 leading-tight">
                      {card.subtitle}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* 4 Responsive Grid Solution Pills (100% Width Fit - Zero Scrollbar) */}
            <div className="mt-4 pt-3.5 border-t border-white/15 relative z-10">
              <div className="grid grid-cols-4 gap-1.5 w-full">
                {showcaseProducts.map((prod, idx) => {
                  const isActive = activeSlide === idx;
                  return (
                    <button
                      key={prod.id}
                      onClick={() => setActiveSlide(idx)}
                      className={`w-full py-2 px-1 rounded-xl text-[10.5px] sm:text-[11.5px] font-bold transition-all duration-300 flex items-center justify-center gap-1 text-center truncate cursor-pointer ${
                        isActive
                          ? "bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] text-white shadow-md shadow-[#ff6b4a]/30 scale-[1.02]"
                          : "bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white border border-white/10"
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isActive ? "bg-white animate-pulse" : "bg-white/40"}`} />
                      <span className="truncate">{prod.shortName}</span>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};