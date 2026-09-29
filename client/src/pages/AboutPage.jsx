import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { http } from "../api/http";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import gsap from "gsap";

export const AboutPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeHeroTab, setActiveHeroTab] = useState(0);
  const containerRef = useRef(null);

  const heroPreviews = [
    {
      title: "Automated Polymer Compounding Plant",
      category: "Industrial Manufacturing",
      image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
      fallback: "/products/Banner3.jpeg",
      stat: "ISO 9001:2015 Certified",
      badge: "High-Capacity Reactor",
    },
    {
      title: "Accredited ASTM D412 Testing Lab",
      category: "R&D & Quality Control",
      image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80",
      fallback: "/products/Banner1.jpeg",
      stat: "5 Bar Pressure Rig",
      badge: "Lab Validated",
    },
    {
      title: "Civil Infrastructure & Dam Sealing",
      category: "Site Engineering",
      image: "https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1200&q=80",
      fallback: "/products/Banner4.jpeg",
      stat: "100% Hydrostatic Seal",
      badge: "Mega Projects",
    },
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".anim-reveal"),
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power2.out" }
      );
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.post("/contact", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again later or contact us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const pillars = [
    {
      icon: (
        <svg className="w-7 h-7 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 18.5V13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
      ),
      title: "Structural Waterproofing",
      desc: "Monolithic elastomeric liquid membranes, SBS/APP bitumen sheets, and deep crack-bridging barrier systems for basements, roofs, and foundations.",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <circle cx="10" cy="16" r="1.2" fill="currentColor"/>
          <circle cx="14" cy="15" r="1" fill="currentColor"/>
        </svg>
      ),
      title: "Construction Chemicals",
      desc: "High-build epoxy floor coatings, concrete admixtures, bonding agents, non-shrink structural grouts, and protective chemical primers.",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8V4H8M16 4H20V8M20 16V20H16M8 20H4V16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
        </svg>
      ),
      title: "Industrial Rubber Solutions",
      desc: "Engineered vulcanized rubber waterstops, bridge bearing pads, expansion joint profiles, and custom elastomeric seals for hydrostatic load containment.",
    },
    {
      icon: (
        <svg className="w-7 h-7 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75"/>
          <path d="M15.5 13.5L18 21L12 18.5L6 21L8.5 13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M9.5 8.5L11 10L14.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
      title: "Certified Engineering Standards",
      desc: "Rigorous quality control adhering to ISO 9001:2015, ASTM D412, and BS 8102 standards with accredited laboratory test verification.",
    },
  ];

  const milestones = [
    {
      year: "2010",
      title: "Founding & Waterproofing Breakthrough",
      desc: "Established in Lahore with a dedicated focus on formulating advanced bituminous membranes and waterproofing coatings for high-water-table civil foundations.",
    },
    {
      year: "2015",
      title: "Industrial Rubber Division Launch",
      desc: "Expanded manufacturing to vulcanized rubber expansion waterstops, hydro-joints, and elastomeric bridge bearing pads for national infrastructure projects.",
    },
    {
      year: "2020",
      title: "ISO 9001 & ASTM Standards Certification",
      desc: "Achieved international quality management compliance and expanded automated high-build epoxy chemical production for industrial pharmaceutical cleanrooms.",
    },
    {
      year: "2026",
      title: "500+ Mega Projects & Direct Logistics",
      desc: "Operating Pakistan's largest direct contractor supply logistics, delivering certified formulations to high-rises, dams, tunnels, and commercial complexes.",
    },
  ];

  const testingFacilities = [
    {
      title: "Hydrostatic Head Pressure Rig",
      metric: "Up to 5 Bar / 50m Head",
      desc: "Continuous hydrostatic load validation simulating deep basement foundations and reservoir water containment pressure.",
      tag: "BS 8102 Certified",
    },
    {
      title: "ASTM D412 Tensile Dynamics",
      metric: "> 12.5 MPa Load",
      desc: "Precision electronic stress-strain testing verifying crack-bridging elongation from 350% to 600% under structural deflection.",
      tag: "Lab Validated",
    },
    {
      title: "Thermal & UV Climate Simulator",
      metric: "-20°C to +85°C Range",
      desc: "Accelerated weatherometer aging chambers ensuring polymer elasticity without embrittlement under intense solar radiation.",
      tag: "Tropicalized",
    },
    {
      title: "Chemical & Acid Immersion Assay",
      metric: "Zero VOC Formulation",
      desc: "Total resistance against aggressive chlorides, sulfates, oils, and industrial alkalis present in groundwater and concrete.",
      tag: "Eco-Engineered",
    },
  ];

  return (
    <div ref={containerRef} className="w-full space-y-12 sm:space-y-16 pb-12">
      
      {/* ==================== 1. Hero Section (Balanced 2-Column with Visual Showcase) ==================== */}
      <section className="anim-reveal relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#0a3d52] via-[#0b4860] to-[#082a38] border border-[#0d4e68]/50 text-white overflow-hidden shadow-2xl p-6 sm:p-10 lg:p-12">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#ff6b4a]/20 rounded-full blur-[130px] pointer-events-none -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0ea5e9]/15 rounded-full blur-[120px] pointer-events-none translate-y-1/3" />

        {/* Subtle Engineering Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
          
          {/* Left Column: Brand Story & CTAs */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Top Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#ff8c73] uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
              <span>ESTABLISHED 2010 • MARBLEX PAKISTAN</span>
            </div>

            {/* Main Headline */}
            <h1 
              className="text-2xl sm:text-4xl lg:text-[42px] font-black text-white leading-[1.15] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Engineering Durability & <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#ffb199]">
                Chemical Excellence
              </span> <br />
              For Civil Infrastructure.
            </h1>

            {/* Subtitle */}
            <p className="text-slate-100 text-xs sm:text-base leading-relaxed font-normal opacity-95 max-w-xl">
              MARBLEX is an industry-leading manufacturer and supplier of advanced construction chemicals, polymer waterproofing membranes, and heavy-duty vulcanized rubber solutions engineered for extreme environmental resilience and hydrostatic load containment.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => navigate("/catalogs")}
                className="btn-3d-accent px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ff6b4a]/30 cursor-pointer"
              >
                <span>Explore Technical Catalog</span>
                <ArrowForwardIcon sx={{ fontSize: 16 }} />
              </button>

              <a
                href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20would%20like%20to%20consult%20regarding%20a%20construction%20chemical%20project."
                target="_blank"
                rel="noreferrer"
                className="px-5 sm:px-6 py-3 sm:py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 backdrop-blur-md flex items-center gap-2 transition cursor-pointer"
              >
                <WhatsAppIcon sx={{ fontSize: 18, color: "#10b981" }} />
                <span>Direct Engineering WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges Row */}
            <div className="pt-3 border-t border-white/15 grid grid-cols-3 gap-2 sm:gap-4 max-w-lg">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#ff8c73] shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-200 leading-tight">
                  <b className="text-white block font-bold">15+ Years</b> Experience
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-sky-300 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-200 leading-tight">
                  <b className="text-white block font-bold">500+ Sites</b> Completed
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-emerald-300 shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="text-[11px] sm:text-xs text-slate-200 leading-tight">
                  <b className="text-white block font-bold">ISO 9001</b> Certified
                </div>
              </div>
            </div>

          </div>

          {/* Right Column: High-End Cinematic Showcase Card */}
          <div className="lg:col-span-5 relative">
            
            <div className="relative rounded-3xl overflow-hidden border border-white/25 bg-[#051a24] shadow-2xl group">
              
              {/* Main Image Stage */}
              <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                <img
                  src={heroPreviews[activeHeroTab].image}
                  alt={heroPreviews[activeHeroTab].title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
                  onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#051a24] via-transparent to-black/30" />
                
                {/* Top Category Badge */}
                <div className="absolute top-3.5 left-3.5 bg-[#0a3d52]/90 backdrop-blur-md text-white text-[10.5px] font-mono font-extrabold px-3 py-1 rounded-lg shadow-md border border-white/15">
                  {heroPreviews[activeHeroTab].category}
                </div>

                {/* Top Right Live ISO Seal */}
                <div className="absolute top-3.5 right-3.5 bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-emerald-400/30">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span>Lab Tested</span>
                </div>

                {/* Bottom Stat Chip */}
                <div className="absolute bottom-3.5 right-3.5 bg-[#ff6b4a] text-white text-[11px] font-black px-3 py-1 rounded-lg shadow-lg">
                  {heroPreviews[activeHeroTab].stat}
                </div>
              </div>

              {/* Card Footer Details */}
              <div className="p-4 bg-[#072430] border-t border-white/15 space-y-2">
                <div className="text-xs font-mono text-slate-300 uppercase tracking-wider">
                  Featured Industrial Solution:
                </div>
                <h4 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                  {heroPreviews[activeHeroTab].title}
                </h4>

                {/* 3 Interactive Solution Tabs */}
                <div className="grid grid-cols-3 gap-1.5 pt-2">
                  {heroPreviews.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveHeroTab(idx)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all cursor-pointer truncate ${
                        activeHeroTab === idx
                          ? "bg-[#ff6b4a] text-white shadow-xs"
                          : "bg-white/10 text-slate-300 hover:bg-white/20"
                      }`}
                    >
                      {item.category.split(" ")[0]}
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Floating Glassmorphic Verification Card (Bottom Left Offset) */}
            <div className="hidden sm:flex items-center gap-3 absolute -bottom-5 -left-5 bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl shadow-black/20 text-slate-900 dark:text-white z-20">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="text-left">
                <div className="text-xs font-black leading-tight">ASTM & BS 8102 Certified</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">10-Year Structural Guarantee</div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 2. Enterprise Trust Marquee Strip ==================== */}
      <EnterpriseMetricsBar className="my-8 sm:my-12" />

      {/* ==================== 3. Company Heritage & Structural Chemistry ==================== */}
      <section className="anim-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white dark:bg-[#0e2735] p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Left Column: Story Content */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a3d52]/10 dark:bg-white/10 text-[#0a3d52] dark:text-[#38bdf8] text-xs font-bold uppercase tracking-wider">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="1.75"/>
            </svg>
            <span>THE MARBLEX HERITAGE</span>
          </div>

          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Built on Rigorous Chemistry & Structural Integrity.
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            Founded with a clear engineering objective, <strong>MARBLEX — Chemical & Rubber</strong> has grown into Pakistan’s premier manufacturer and trusted supplier of specialized construction solutions. We solve critical structural challenges: water seepage, chemical abrasion, concrete deterioration, and joint expansion.
          </p>

          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
            From high-rise commercial basements in Lahore, Islamabad, and Karachi to national dam projects and industrial flooring for pharmaceutical plants, MARBLEX formulations are backed by extensive laboratory testing, certified compliance, and on-site application support.
          </p>

          {/* Quick Value Highlights with Custom SVGs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Certified ISO 9001:2015 Quality</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Monolithic Joint-Free Seals</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>ASTM D412 Standard Verification</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span>Nationwide Technical Logistics</span>
            </div>
          </div>
        </div>

        {/* Right Column: 3-Image Specimen Engineering Mosaic */}
        <div className="lg:col-span-5 space-y-3.5">
          {/* Main Top Showcase Image */}
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm h-48 sm:h-52 bg-slate-100 dark:bg-slate-800 group relative">
            <img 
              src="https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=1000&q=80" 
              alt="MARBLEX Civil Concrete Deck Waterproofing" 
              className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
              onError={(e) => { e.currentTarget.src = "/products/Banner3.jpeg"; }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-90" />
            <div className="absolute top-3 left-3 bg-[#ff6b4a] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
              Primary Civil Site
            </div>
            <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white">
              <span className="text-xs font-bold">Bituminous Deck & Foundation Sealing</span>
              <span className="text-[10.5px] font-mono opacity-80">Phase I</span>
            </div>
          </div>

          {/* Dual Bottom Side-by-Side Images (Image 2 & Image 3) */}
          <div className="grid grid-cols-2 gap-3.5">
            {/* Image 2: Precision Compounding Lab */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm aspect-[4/3] bg-slate-100 dark:bg-slate-800 group relative">
              <img 
                src="https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80" 
                alt="MARBLEX Chemical Compounding Lab" 
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <div className="text-[11px] font-bold leading-tight">Polymer Lab</div>
                <div className="text-[9.5px] text-slate-300 font-normal">ISO Compounding</div>
              </div>
            </div>

            {/* Image 3: Dam & Heavy Infrastructure Joint */}
            <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm aspect-[4/3] bg-slate-100 dark:bg-slate-800 group relative">
              <img 
                src="https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=800&q=80" 
                alt="MARBLEX Dam Expansion Waterstops" 
                className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = "/products/Banner2.jpeg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-85" />
              <div className="absolute bottom-2.5 left-2.5 right-2.5 text-white">
                <div className="text-[11px] font-bold leading-tight">Hydro Barrier</div>
                <div className="text-[9.5px] text-slate-300 font-normal">5 Bar Head Seal</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 4. Strategic Milestones & Evolution Timeline ==================== */}
      <section className="anim-reveal space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b4a]">
            STRATEGIC EVOLUTION
          </span>
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            The MARBLEX Engineering Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Over a decade of scientific compounding, international standard compliance, and nation-building projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0e2735] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-[#ff6b4a]/30 transition-all flex flex-col justify-between space-y-4 group relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span 
                  className="text-2xl sm:text-3xl font-black text-[#ff6b4a]"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {m.year}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Phase 0{idx + 1}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                  {m.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {m.desc}
                </p>
              </div>

              <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#0a3d52] to-[#ff6b4a] group-hover:w-full transition-all duration-500" 
                  style={{ width: `${(idx + 1) * 25}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 5. Core Engineering Capabilities (4 Pillars Grid) ==================== */}
      <section className="anim-reveal space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b4a]">
            OUR CORE COMPETENCIES
          </span>
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineering Pillars of MARBLEX
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Comprehensive solutions tailored for architects, civil engineers, structural consultants, and industrial contractors.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p, idx) => (
            <div 
              key={idx}
              className="bg-white dark:bg-[#0e2735] p-7 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-[#ff6b4a]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform shadow-inner">
                {p.icon}
              </div>
              <div className="space-y-2">
                <h3 className="font-bold text-slate-900 dark:text-white text-base">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 6. Advanced Testing & QC Laboratory ==================== */}
      <section className="anim-reveal bg-gradient-to-br from-[#0a3d52]/5 via-white to-slate-50 dark:from-[#0c222e] dark:via-[#091b24] dark:to-[#0c222e] p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200/80 dark:border-slate-800 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
              <span>ACCREDITED TESTING METRICS</span>
            </div>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f1929] dark:text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              State-of-the-Art Formulation Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-xl mt-1">
              Every batch produced at MARBLEX undergoes rigorous laboratory validation to ensure zero-failure structural waterproofing in demanding geotechnical environments.
            </p>
          </div>

          <a
            href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20please%20send%20the%20complete%20Technical%20Data%20Sheet%20(TDS)%20and%20lab%20certification%20reports."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#0a3d52] hover:bg-[#082e3e] text-white px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <span>Request Lab Certification Reports</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testingFacilities.map((t, idx) => (
            <div 
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200/90 dark:border-slate-700 shadow-2xs space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#ff6b4a] uppercase tracking-wider bg-[#ff6b4a]/10 px-2 py-0.5 rounded-md">
                  {t.tag}
                </span>
                <span className="text-xs font-bold text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {t.title}
              </h3>
              <div className="text-xs font-extrabold text-[#0a3d52] dark:text-sky-400">
                {t.metric}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. Contact & Technical Project Consultation Form ==================== */}
      <section className="anim-reveal bg-white dark:bg-[#0e2735] p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Office & Direct Info */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#ff6b4a]">
                TECHNICAL CONSULTATION
              </span>
              <h2 
                className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Discuss Your Construction Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Connect directly with our chemical engineers and technical product specialists for material datasheets, site testing, and tailored quotations.
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-[#0a3d52] dark:text-[#38bdf8]">
                  <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Headquarters</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">40-Ferozpur Road, Lahore, Pakistan</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-[#ff6b4a]">
                  <MailOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Direct Sales & Support</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">Marblexpak@gmail.com</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0 text-[#10b981]">
                  <LocalPhoneOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Engineering Hotline</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">+92 348 1116611</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-800/60 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-700">
            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Technical Inquiry Received</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for contacting MARBLEX. Our technical engineering team will review your specifications and get in touch promptly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Your Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Engr. Ahmad Hassan"
                      className="w-full bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. ahmad@construction.com"
                      className="w-full bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0348-1116611"
                    className="w-full bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Project Requirements / Specifications</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Provide details about your project, chemical specs, or required rubber profiles..."
                    className="w-full bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a] resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-3d-accent py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {loading ? "Processing..." : (
                    <>
                      <span>Submit Technical Inquiry</span>
                      <SendRoundedIcon sx={{ fontSize: 16 }} />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>
      </section>

    </div>
  );
};
