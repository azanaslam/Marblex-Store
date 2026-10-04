import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { http } from "../api/http";
import { AboutHeroBanner } from "../components/AboutHeroBanner";
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
  const [openFaq, setOpenFaq] = useState(0);
  const containerRef = useRef(null);

  const engineeringFaqs = [
    {
      q: "What international standards do MARBLEX chemical and rubber solutions comply with?",
      a: "All MARBLEX formulations strictly comply with accredited ASTM D412 (tensile elongation dynamics), ASTM C836 (high-solids liquid elastomeric membranes), DIN 18541 (elastomeric expansion waterstop profiles), and BS 8102 (Code of Practice for protection of below-ground structures against water)."
    },
    {
      q: "Can MARBLEX formulate custom chemical compounds for project-specific site conditions?",
      a: "Yes. Our Lahore compounding facility features specialized chemical synthesis reactors that allow our engineers to tailor viscosity, pot life, shore hardness, and chemical resistance profiles for aggressive soils, extreme temperature deflection, or high saline groundwater."
    },
    {
      q: "How can contractors request on-site substrate testing and technical supervision?",
      a: "Contractors, consultants, and project engineers can request on-site inspection directly via our WhatsApp Engineering Hotline (+92 308 4585792) or online inquiry form. We provide moisture scanning, pull-off tensile testing, and joint profiling."
    },
    {
      q: "What warranty coverage is provided on MARBLEX commercial and mega civil installations?",
      a: "MARBLEX issues standard 10-Year certified structural performance warranties for full-system applications under certified application guidelines with accredited QC hydrostatic sign-off."
    }
  ];

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!containerRef.current) return;

    const sections = containerRef.current.querySelectorAll(".scroll-section");
    const observers = [];

    sections.forEach((section) => {
      // Set initial state for smooth scroll entrance
      gsap.set(section, { opacity: 0, y: 28 });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.to(entry.target, {
                opacity: 1,
                y: 0,
                duration: 0.7,
                ease: "power2.out",
                clearProps: "opacity,transform",
              });
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.06,
          rootMargin: "0px 0px -25px 0px",
        }
      );

      observer.observe(section);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
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
      
      {/* ==================== 1. Dedicated About Us Hero Banner ==================== */}
      <AboutHeroBanner />

      {/* ==================== 2. Enterprise Trust Marquee Strip ==================== */}
      <EnterpriseMetricsBar className="my-8 sm:my-12" />

      {/* ==================== 3. Company Heritage & Structural Chemistry ==================== */}
      <section className="scroll-section relative overflow-hidden bg-white dark:bg-[#0c222e] p-6 sm:p-10 lg:p-12 rounded-[28px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_25px_-5px_rgba(10,61,82,0.07)] dark:shadow-2xl dark:shadow-black/50 transition-all duration-300">
        
        {/* Ambient Subtle Glow Accents */}
        <div className="absolute top-0 right-1/3 w-[500px] h-[500px] bg-sky-400/[0.04] dark:bg-sky-500/[0.06] rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#ff6b4a]/[0.03] dark:bg-[#ff6b4a]/[0.05] rounded-full blur-[100px] pointer-events-none" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Left Column: Story Content & 4 Interactive Value Cards */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Pill Tag */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a3d52]/10 dark:bg-sky-400/10 border border-[#0a3d52]/15 dark:border-sky-400/20 text-[#0a3d52] dark:text-sky-300 text-xs font-bold uppercase tracking-wider shadow-xs">
              <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
              <span>THE MARBLEX HERITAGE • 15+ YEARS MASTERY</span>
            </div>

            {/* Main Headline */}
            <h2 
              className="text-2xl sm:text-3xl lg:text-[38px] font-black text-slate-900 dark:text-white leading-[1.18] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Built on Rigorous Chemistry &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#0a3d52] dark:to-sky-300">
                Structural Integrity.
              </span>
            </h2>

            {/* Paragraphs */}
            <div className="space-y-3 text-slate-600 dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
              <p>
                Founded with a clear engineering vision, <strong className="text-slate-900 dark:text-white font-bold">MARBLEX — Chemical & Rubber</strong> has grown into Pakistan’s premier manufacturer and trusted supplier of specialized construction solutions. We eliminate critical structural risks: concrete water seepage, chemical abrasion, foundation degradation, and dynamic joint expansion.
              </p>
              <p>
                From commercial high-rise basements in Lahore, Islamabad, and Karachi to national hydel dams and sterile pharmaceutical cleanroom flooring, MARBLEX formulations are backed by accredited ASTM testing, rigorous ISO compliance, and certified on-site technical support.
              </p>
            </div>

            {/* 4 Advanced Interactive Feature Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              
              {/* Card 1 */}
              <div className="group p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#0e2a38]/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 hover:shadow-md flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Certified ISO 9001:2015</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Automated batch compounding & QA</div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="group p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#0e2a38]/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 hover:shadow-md flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Monolithic Hydro-Armor</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">Seamless joint-free foundation barrier</div>
                </div>
              </div>

              {/* Card 3 */}
              <div className="group p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#0e2a38]/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 hover:shadow-md flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#ff6b4a]/10 text-[#ff6b4a] flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">ASTM D412 Standard</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">600% elongation & crack bridging</div>
                </div>
              </div>

              {/* Card 4 */}
              <div className="group p-3.5 rounded-2xl bg-slate-50/90 dark:bg-[#0e2a38]/80 border border-slate-200/80 dark:border-slate-700/80 hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 hover:shadow-md flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-110 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">Nationwide Direct Logistics</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-normal">On-site technical application support</div>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: High-End Interactive Engineering Specimen Gallery */}
          <div className="lg:col-span-5 space-y-4 relative">
            
            {/* Main Showcase Specimen Card */}
            <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-lg bg-slate-900 group relative h-56 sm:h-60">
              <img 
                src="/hero/desktop_waterproofing.jpg" 
                alt="MARBLEX Civil Concrete Deck Waterproofing" 
                className="w-full h-full object-cover object-[center_25%] group-hover:scale-105 transition-transform duration-700"
                onError={(e) => { e.currentTarget.src = "/products/Banner3.jpeg"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 opacity-90 transition-opacity duration-300" />
              
              {/* Top Badges */}
              <div className="absolute top-3.5 left-3.5 flex items-center gap-2">
                <span className="bg-[#ff6b4a] text-white text-[10px] font-black px-2.5 py-0.5 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                  <span>Primary Civil Site</span>
                </span>
              </div>

              <div className="absolute top-3.5 right-3.5 bg-black/60 backdrop-blur-md text-white border border-white/20 text-[10px] font-mono px-2 py-0.5 rounded-md">
                Phase I Construction
              </div>

              {/* Bottom Caption */}
              <div className="absolute bottom-3.5 left-4 right-4 text-white">
                <div className="text-[13px] sm:text-sm font-bold leading-tight">Bituminous Deck & Sub-Structure Sealing</div>
                <div className="text-[10.5px] text-slate-300 font-normal mt-0.5 flex items-center gap-2">
                  <span>Monolithic Barrier</span>
                  <span>•</span>
                  <span>ASTM D-6083 Compliance</span>
                </div>
              </div>
            </div>

            {/* Dual Bottom Specimen Cards */}
            <div className="grid grid-cols-2 gap-3.5">
              
              {/* Image 2: Precision Compounding Lab */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-md bg-slate-900 group relative aspect-[4/3]">
                <img 
                  src="/hero/desktop_chemical.jpg" 
                  alt="MARBLEX Chemical Compounding Lab" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <div className="text-xs font-bold leading-tight">Polymer Lab</div>
                  <div className="text-[10px] text-slate-300 font-normal mt-0.5">ISO 9001 Compounding</div>
                </div>
              </div>

              {/* Image 3: Dam & Heavy Infrastructure Joint */}
              <div className="rounded-2xl overflow-hidden border border-slate-200/90 dark:border-slate-700/80 shadow-md bg-slate-900 group relative aspect-[4/3]">
                <img 
                  src="/hero/desktop_waterstop.jpg" 
                  alt="MARBLEX Dam Expansion Waterstops" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => { e.currentTarget.src = "/products/Banner2.jpeg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent opacity-90" />
                <div className="absolute bottom-2.5 left-3 right-3 text-white">
                  <div className="text-xs font-bold leading-tight">Hydro Barrier</div>
                  <div className="text-[10px] text-slate-300 font-normal mt-0.5">5 Bar Head Sealing</div>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* ==================== 4. Strategic Milestones & Evolution Timeline ==================== */}
      <section className="scroll-section space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] text-xs font-bold uppercase tracking-wider border border-[#ff6b4a]/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>STRATEGIC EVOLUTION & HERITAGE</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            The MARBLEX Engineering Journey
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
            Over a decade of scientific compounding, international standard compliance, and nation-building mega civil infrastructure projects.
          </p>
        </div>

        {/* Timeline Grid (4 Connected Milestone Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {milestones.map((m, idx) => (
            <div
              key={idx}
              className="group relative bg-white dark:bg-[#0c222e] p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_2px_15px_-3px_rgba(10,61,82,0.05)] hover:shadow-xl hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 flex flex-col justify-between space-y-5 overflow-hidden hover:-translate-y-1"
            >
              {/* Top Milestone Badge & Phase */}
              <div className="flex items-center justify-between">
                <span 
                  className="text-3xl sm:text-4xl font-black text-[#0a3d52] dark:text-sky-300 group-hover:text-[#ff6b4a] transition-colors"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {m.year}
                </span>
                <span className="text-[10px] font-black px-2.5 py-1 rounded-full bg-slate-100 dark:bg-[#081822] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700/60 uppercase tracking-widest">
                  Phase 0{idx + 1}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5 flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-[#ff6b4a] transition-colors">
                  {m.title}
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {m.desc}
                </p>
              </div>

              {/* Milestone Progress Indicator Bar */}
              <div className="pt-2">
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-[#0a3d52] via-[#ff6b4a] to-emerald-400 group-hover:w-full transition-all duration-700" 
                    style={{ width: `${(idx + 1) * 25}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 5. Core Engineering Capabilities (4 Pillars Grid) ==================== */}
      <section className="scroll-section space-y-8 sm:space-y-10">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 text-xs font-bold uppercase tracking-wider border border-[#0a3d52]/15 dark:border-sky-400/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>CORE COMPETENCIES & FORMULATIONS</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineering Pillars of MARBLEX
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
            Comprehensive high-performance solutions tailored for civil engineers, structural consultants, and industrial contractors.
          </p>
        </div>

        {/* 4 Pillars Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {pillars.map((p, idx) => (
            <div 
              key={idx}
              className="group relative bg-white dark:bg-[#0c222e] p-6 sm:p-7 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(10,61,82,0.06)] hover:shadow-2xl hover:border-[#ff6b4a]/40 dark:hover:border-sky-400/40 transition-all duration-300 flex flex-col justify-between space-y-5 overflow-hidden hover:-translate-y-1.5 cursor-pointer"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#ff6b4a] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Icon & Discipline Number */}
              <div className="flex items-center justify-between">
                <div className="w-13 h-13 rounded-2xl bg-slate-50 dark:bg-[#081822] flex items-center justify-center border border-slate-200/80 dark:border-slate-700/60 group-hover:scale-110 group-hover:border-[#ff6b4a]/40 transition-all shadow-inner">
                  {p.icon}
                </div>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  0{idx + 1}
                </span>
              </div>

              {/* Title & Description */}
              <div className="space-y-2.5 flex-grow">
                <h3 className="font-bold text-slate-900 dark:text-white text-base leading-snug group-hover:text-[#ff6b4a] transition-colors">
                  {p.title}
                </h3>
                <p className="text-[12px] text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {p.desc}
                </p>
              </div>

              {/* Verified Standard Pill */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] font-bold text-[#0a3d52] dark:text-sky-300">
                <span>ASTM & ISO Verified</span>
                <ArrowForwardIcon sx={{ fontSize: 14 }} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 6. Advanced Testing & QC Laboratory ==================== */}
      <section className="scroll-section bg-gradient-to-br from-[#0a3d52]/5 via-white to-slate-50 dark:from-[#091b24] dark:via-[#0c222e] dark:to-[#08161e] p-6 sm:p-10 lg:p-12 rounded-[28px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-lg space-y-8">
        
        {/* Header with Direct TDS CTA */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5 border-b border-slate-200/80 dark:border-slate-800/80 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2.5 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>ACCREDITED TESTING METRICS • ASTM & BS STANDARDS</span>
            </div>
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0f1929] dark:text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              State-of-the-Art Formulation Testing
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mt-1.5 font-normal leading-relaxed">
              Every chemical compound produced at MARBLEX undergoes rigorous laboratory validation to ensure zero-failure structural waterproofing in severe geotechnical environments.
            </p>
          </div>

          <a
            href="https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20please%20send%20the%20complete%20Technical%20Data%20Sheet%20(TDS)%20and%20lab%20certification%20reports."
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#ff6b4a] hover:bg-[#ff5530] text-white px-6 py-3.5 rounded-2xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#ff6b4a]/20 transition-all shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Request Lab Certification Reports</span>
            <ArrowForwardIcon sx={{ fontSize: 16 }} />
          </a>
        </div>

        {/* 4 Laboratory Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {testingFacilities.map((t, idx) => (
            <div 
              key={idx}
              className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#071922] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-3 hover:border-sky-400/40 transition-all group"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-[#ff6b4a] uppercase tracking-wider bg-[#ff6b4a]/10 px-2.5 py-1 rounded-md border border-[#ff6b4a]/20">
                  {t.tag}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">0{idx + 1}</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                {t.title}
              </h3>
              <div className="text-sm font-black text-[#0a3d52] dark:text-sky-300 font-mono">
                {t.metric}
              </div>
              <p className="text-[11.5px] text-slate-500 dark:text-slate-400 leading-relaxed font-normal">
                {t.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 7. Contact & Technical Project Consultation Form ==================== */}
      <section className="scroll-section bg-white dark:bg-[#0c222e] p-6 sm:p-10 lg:p-12 rounded-[28px] sm:rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Office & Direct Engineering Hotline */}
          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#ff6b4a]">
                <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
                <span>DIRECT TECHNICAL CONSULTATION</span>
              </div>
              <h2 
                className="text-2xl sm:text-3xl lg:text-[34px] font-black text-slate-900 dark:text-white tracking-tight leading-tight"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Discuss Your Construction Specifications
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Connect directly with our chemical formulation engineers for material data sheets (TDS), site testing, and customized supply quotes.
              </p>
            </div>

            {/* Direct Channel Cards */}
            <div className="space-y-3.5 pt-1">
              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081822] border border-slate-200/80 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-[#0a3d52]/10 dark:bg-sky-400/10 border border-[#0a3d52]/20 dark:border-sky-400/20 flex items-center justify-center shrink-0 text-[#0a3d52] dark:text-sky-300">
                  <LocationOnOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Manufacturing & HQ</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">40-Ferozpur Road, Lahore, Pakistan</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 dark:bg-[#081822] border border-slate-200/80 dark:border-slate-800">
                <div className="w-10 h-10 rounded-xl bg-[#ff6b4a]/10 border border-[#ff6b4a]/20 flex items-center justify-center shrink-0 text-[#ff6b4a]">
                  <MailOutlineOutlinedIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Direct Engineering Support</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">Marblexpak@gmail.com</div>
                </div>
              </div>

              <a 
                href="https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20would%20like%20to%20consult%20regarding%20a%20project."
                target="_blank"
                rel="noreferrer"
                className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/50 hover:bg-emerald-100/80 transition-colors cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <WhatsAppIcon sx={{ fontSize: 20 }} />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">Fast Engineering Hotline</div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-0.5">+92 308 4585792 (WhatsApp Instant)</div>
                </div>
              </a>
            </div>
          </div>

          {/* Right Column: Interactive Inquiry Form */}
          <div className="lg:col-span-7 bg-slate-50/90 dark:bg-[#081822] p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
            {success ? (
              <div className="text-center py-8 space-y-4">
                <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800">
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Technical Inquiry Received</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for contacting MARBLEX. Our chemical engineering team will review your specifications and get in touch promptly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-sm transition"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Your Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Engr. Ahmad Hassan"
                      className="w-full bg-white dark:bg-[#0c222e] border border-slate-300/90 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a] shadow-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="e.g. ahmad@construction.com"
                      className="w-full bg-white dark:bg-[#0c222e] border border-slate-300/90 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a] shadow-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Phone / WhatsApp Number</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="e.g. 0348-1116611"
                    className="w-full bg-white dark:bg-[#0c222e] border border-slate-300/90 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a] shadow-xs"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Project Requirements / Specifications</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows={4}
                    placeholder="Provide details about your project, chemical specs, or required rubber profiles..."
                    className="w-full bg-white dark:bg-[#0c222e] border border-slate-300/90 dark:border-slate-700 rounded-xl px-4 py-3 text-xs text-slate-800 dark:text-slate-200 outline-none focus:border-[#ff6b4a] resize-none shadow-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-xl bg-[#ff6b4a] hover:bg-[#ff5530] text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/25 disabled:opacity-50 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
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

      {/* ==================== 8. Contractor & Engineering FAQ Accordion ==================== */}
      <section className="scroll-section space-y-6 sm:space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5 px-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 text-xs font-bold uppercase tracking-wider border border-[#0a3d52]/15 dark:border-sky-400/20 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CONTRACTOR & CONSULTANT INQUIRIES</span>
          </div>
          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Frequently Asked Engineering Questions
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal max-w-xl mx-auto leading-relaxed">
            Essential specifications, ASTM standards, laboratory audits, and warranty terms for MARBLEX formulations.
          </p>
        </div>

        <div className="max-w-4xl mx-auto space-y-3 px-1">
          {engineeringFaqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white dark:bg-[#0c222e] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? -1 : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/70 dark:hover:bg-[#0e2735] transition-colors"
                >
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {faq.q}
                  </span>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                    isOpen ? "rotate-180 bg-[#ff6b4a] text-white" : "bg-slate-100 dark:bg-[#081822] text-slate-500 dark:text-slate-400"
                  }`}>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </button>
                
                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-[12.5px] text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

    </div>
  );
};
