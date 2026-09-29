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

const showcaseProducts = [
  {
    id: 1,
    badge: "ENGINEERED POLYMER",
    code: "WATERPROOFING MEMBRANE",
    title: "APP Bituminous Membrane System",
    desc: "Polymer-modified reinforced bituminous sheet engineered for extreme puncture resistance and high hydrostatic water head containment.",
    tag: "High Tensile",
    image: "/products/Banner3.jpeg",
    card1: { icon: WaterDropOutlinedIcon, title: "100% WATERPROOF", subtitle: "ASTM D-412 Certified" },
    card2: { icon: ShieldOutlinedIcon, title: "EXTREME DURABILITY", subtitle: "Puncture & Tear Proof" },
    card3: { icon: ScienceOutlinedIcon, title: "CHEMICAL RESISTANT", subtitle: "Acid & Alkali Barrier" },
  },
  {
    id: 2,
    badge: "RUBBER INDUSTRIAL DIVISION",
    code: "VULCANIZED RUBBER",
    title: "Heavy-Duty Expansion Waterstops",
    desc: "Engineered vulcanized rubber waterstop profiles designed for structural expansion & construction joints in dams, canals, and basements.",
    tag: "100m Head Seal",
    image: "/products/Banner2.jpeg",
    card1: { icon: ShieldOutlinedIcon, title: "HIGH-PRESSURE SEAL", subtitle: "Up to 5 Bar Resistance" },
    card2: { icon: WaterDropOutlinedIcon, title: "450% ELONGATION", subtitle: "Dynamic Expansion" },
    card3: { icon: ScienceOutlinedIcon, title: "AGEING RESISTANT", subtitle: "50+ Year Lifetime" },
  },
  {
    id: 3,
    badge: "MONOLITHIC BARRIER",
    code: "LIQUID ELASTOMERIC",
    title: "Elastomeric Liquid Waterproof Coating",
    desc: "High-grade liquid polymer membrane providing 100% monolithic joint-free barrier against water ingress with 600% crack-bridging elasticity.",
    tag: "Seamless Shield",
    image: "/products/Banner1.jpeg",
    card1: { icon: WaterDropOutlinedIcon, title: "100% SEAMLESS", subtitle: "Zero Joint Ingress" },
    card2: { icon: ShieldOutlinedIcon, title: "600% ELASTICITY", subtitle: "Crack-Bridging Tech" },
    card3: { icon: ScienceOutlinedIcon, title: "UV & WEATHER PROOF", subtitle: "Tropical Formula" },
  },
  {
    id: 4,
    badge: "FLOOR PROTECTION",
    code: "EPOXY FLOOR SYSTEM",
    title: "High-Build Industrial Epoxy Floor",
    desc: "Seamless, chemical, and heavy forklift abrasion-resistant high-build epoxy coatings for pharmaceutical and manufacturing facilities.",
    tag: "Heavy Duty",
    image: "/products/Banner4.jpeg",
    card1: { icon: ScienceOutlinedIcon, title: "SOLVENT RESISTANT", subtitle: "Resists Acids & Oils" },
    card2: { icon: ShieldOutlinedIcon, title: "HEAVY LOAD RATED", subtitle: "Forklift & Impact Tough" },
    card3: { icon: WaterDropOutlinedIcon, title: "CLEANROOM GRADE", subtitle: "Seamless Hygiene" },
  },
];

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  
  const slideContainerRef = useRef(null);
  const slideImageRef = useRef(null);
  const slideTextRef = useRef(null);
  const cardsRef = useRef(null);
  const progressBarRef = useRef(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % showcaseProducts.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length);
  }, []);

  // Smooth Auto Slide Interval (7.5s) with hover pause
  useEffect(() => {
    if (isHovered) return;
    
    // Reset and animate progress bar
    if (progressBarRef.current) {
      gsap.fromTo(
        progressBarRef.current,
        { width: "0%" },
        { width: "100%", duration: 7.5, ease: "none" }
      );
    }

    const timer = setInterval(() => {
      nextSlide();
    }, 7500);

    return () => clearInterval(timer);
  }, [nextSlide, isHovered, activeSlide]);

  // Silky Smooth, Slow & Cinematic Transition on Slide Change
  useEffect(() => {
    const ctx = gsap.context(() => {
      // 1. Slow, elegant image cross-fade & subtle scale float
      if (slideImageRef.current) {
        gsap.fromTo(
          slideImageRef.current,
          { opacity: 0, scale: 1.06, y: 12 },
          {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 1.1,
            ease: "power2.out",
          }
        );
      }

      // 2. Text fade-in with smooth easing
      if (slideTextRef.current) {
        gsap.fromTo(
          slideTextRef.current,
          { opacity: 0, y: 14 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: 0.15,
            ease: "power2.out",
          }
        );
      }

      // 3. Staggered feature cards entrance
      if (cardsRef.current) {
        gsap.fromTo(
          cardsRef.current.children,
          { opacity: 0, y: 12 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            stagger: 0.08,
            delay: 0.25,
            ease: "power2.out",
          }
        );
      }
    }, slideContainerRef);

    return () => ctx.revert();
  }, [activeSlide]);

  const current = showcaseProducts[activeSlide];

  return (
    <section className="relative mb-10 sm:mb-14 rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#0a3d52] via-[#0b4860] to-[#082a38] border border-[#0d4e68]/60 text-white overflow-hidden shadow-2xl shadow-[#0a3d52]/25">
      
      {/* Soft Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[#ff6b4a]/20 rounded-full blur-[140px] pointer-events-none -translate-y-1/3" />
      <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-[#0ea5e9]/15 rounded-full blur-[130px] pointer-events-none translate-y-1/3" />
      <div className="absolute top-1/2 left-0 w-[400px] h-[400px] bg-[#ff8c73]/15 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />

      {/* Grid Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 p-6 sm:p-10 lg:p-12 xl:p-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 xl:gap-12 items-center">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Top Live Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#ff8c73] uppercase tracking-wider shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>MARBLEX INDUSTRIAL SOLUTIONS</span>
          </div>

          {/* Headline */}
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[52px] font-black text-white leading-[1.1] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineered For <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#ffb199] drop-shadow-sm">
              Absolute Durability
            </span> <br />
            & Waterproofing.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-100 text-sm sm:text-base lg:text-lg max-w-xl leading-relaxed font-normal opacity-95">
            ISO-certified elastomeric coatings, heavy-duty vulcanized rubber waterstops, and polymer membranes engineered for civil infrastructure, dams, basements, and modern construction.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button 
              onClick={() => navigate("/services")}
              className="btn-3d-accent px-7 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/30 cursor-pointer"
            >
              <span>EXPLORE SOLUTIONS</span>
              <ArrowForwardIcon sx={{ fontSize: 18 }} />
            </button>

            <button 
              onClick={() => navigate("/catalogs")}
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 hover:border-white/40 backdrop-blur-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <MenuBookOutlinedIcon sx={{ fontSize: 18, color: "#ff8c73" }} />
              <span>TECHNICAL SPECS</span>
            </button>

            <a 
              href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20need%20technical%20assistance%20and%20quotation."
              target="_blank"
              rel="noreferrer"
              className="px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              <span>WHATSAPP QUOTE</span>
            </a>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-6 border-t border-white/15 grid grid-cols-3 gap-3 sm:gap-4 max-w-lg">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-[#ff8c73] shrink-0">
                <ShieldOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-white leading-tight">15+ Yrs</div>
                <div className="text-[10px] sm:text-xs text-slate-200">Durability Life</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-sky-300 shrink-0">
                <WaterDropOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-white leading-tight">100%</div>
                <div className="text-[10px] sm:text-xs text-slate-200">Hydrostatic Seal</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300 shrink-0">
                <ScienceOutlinedIcon sx={{ fontSize: 20 }} />
              </div>
              <div>
                <div className="text-sm sm:text-base font-black text-white leading-tight">500+</div>
                <div className="text-[10px] sm:text-xs text-slate-200">Major Sites</div>
              </div>
            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (PREMIUM CINEMATIC SHOWCASE) ==================== */}
        <div 
          className="lg:col-span-5"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div 
            ref={slideContainerRef}
            className="bg-[#072430]/85 backdrop-blur-2xl rounded-3xl p-5 sm:p-6 border border-white/20 shadow-2xl shadow-black/40 relative overflow-hidden"
          >
            
            {/* Ambient Background Glow inside Card */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff6b4a]/15 rounded-full blur-[80px] pointer-events-none" />

            {/* Card Header & Counter */}
            <div className="flex items-center justify-between mb-4 relative z-10">
              <span className="px-3 py-1 rounded-full bg-[#ff6b4a]/20 text-[#ff8c73] text-[11px] font-bold uppercase tracking-wider border border-[#ff6b4a]/30 shadow-xs">
                {current.badge}
              </span>
              <span className="text-xs font-mono font-bold text-slate-200 bg-white/10 px-3 py-1 rounded-full border border-white/15 backdrop-blur-md">
                0{activeSlide + 1} <span className="opacity-40">/</span> 0{showcaseProducts.length}
              </span>
            </div>

            {/* Cinematic Image Showcase Stage */}
            <div className="relative rounded-2xl overflow-hidden mb-4 border border-white/15 h-64 sm:h-72 bg-[#051a24] shadow-inner group">
              
              {/* Photo with Ken Burns subtle breathing */}
              <div ref={slideImageRef} className="w-full h-full relative overflow-hidden">
                <img 
                  src={current.image} 
                  alt={current.title}
                  className="w-full h-full object-cover object-center transform transition-transform duration-1000 ease-out group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/products/Banner1.jpeg";
                  }}
                />
                
                {/* Bottom Dark Gradient Scrim Overlay for crisp text contrast */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#051a24] via-[#051a24]/30 to-transparent" />
              </div>

              {/* Code Chip (Top Left) */}
              <div className="absolute top-3.5 left-3.5 bg-[#0a3d52]/90 backdrop-blur-md text-white text-[10.5px] font-mono font-extrabold px-3 py-1 rounded-lg shadow-md border border-white/15">
                {current.code}
              </div>

              {/* Tag Chip (Bottom Right) */}
              <div className="absolute bottom-3.5 right-3.5 bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] text-white text-[10.5px] font-bold px-3 py-1 rounded-lg shadow-lg flex items-center gap-1">
                <CheckCircleRoundedIcon sx={{ fontSize: 13 }} />
                <span>{current.tag}</span>
              </div>
            </div>

            {/* Title and Description */}
            <div ref={slideTextRef} className="space-y-1.5 mb-4 relative z-10">
              <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight font-heading">
                {current.title}
              </h3>
              <p className="text-xs text-slate-200 leading-relaxed line-clamp-2 font-normal">
                {current.desc}
              </p>
            </div>

            {/* 3 Bottom Feature Cards Grid */}
            <div ref={cardsRef} className="grid grid-cols-3 gap-2 pt-3.5 border-t border-white/15 relative z-10">
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

            {/* Slide Navigation Controls & Progress Bar */}
            <div className="mt-4 pt-3.5 border-t border-white/15 space-y-3 relative z-10">
              
              {/* Smooth Animated Progress Bar */}
              <div className="h-1 w-full bg-white/15 rounded-full overflow-hidden">
                <div 
                  ref={progressBarRef}
                  className="h-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] rounded-full" 
                />
              </div>

              <div className="flex items-center justify-between">
                {/* Pagination Dots */}
                <div className="flex items-center gap-1.5">
                  {showcaseProducts.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Slide ${idx + 1}`}
                      className={`cursor-pointer transition-all duration-500 rounded-full ${
                        activeSlide === idx 
                          ? 'w-7 h-2 bg-[#ff6b4a] shadow-xs' 
                          : 'w-2 h-2 bg-white/30 hover:bg-white/60'
                      }`}
                    />
                  ))}
                </div>

                {/* Prev / Next Navigation Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevSlide}
                    aria-label="Previous Slide"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
                  >
                    <KeyboardArrowLeftIcon sx={{ fontSize: 20 }} />
                  </button>
                  <button
                    onClick={nextSlide}
                    aria-label="Next Slide"
                    className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/30 text-white flex items-center justify-center border border-white/15 transition-colors cursor-pointer"
                  >
                    <KeyboardArrowRightIcon sx={{ fontSize: 20 }} />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};