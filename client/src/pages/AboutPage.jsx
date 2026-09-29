import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { http } from "../api/http";
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
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".anim-reveal"),
        { opacity: 0, y: 20 },
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
      icon: <WaterDropOutlinedIcon sx={{ fontSize: 32, color: "#ff6b4a" }} />,
      title: "Structural Waterproofing",
      desc: "Monolithic elastomeric liquid membranes, SBS/APP bitumen sheets, and deep crack-bridging barrier systems for basements, roofs, and foundations.",
    },
    {
      icon: <ScienceOutlinedIcon sx={{ fontSize: 32, color: "#10b981" }} />,
      title: "Construction Chemicals",
      desc: "High-build epoxy floor coatings, concrete admixtures, bonding agents, non-shrink structural grouts, and protective primers.",
    },
    {
      icon: <ConstructionOutlinedIcon sx={{ fontSize: 32, color: "#38bdf8" }} />,
      title: "Industrial Rubber Solutions",
      desc: "Engineered vulcanized rubber waterstops, bridge bearing pads, expansion joint profiles, and custom elastomeric seals for hydrostatic load resistance.",
    },
    {
      icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 32, color: "#f59e0b" }} />,
      title: "Certified Engineering Standards",
      desc: "Rigorous quality control adhering to ISO 9001:2015, ASTM D412, and BS 8102 standards with accredited laboratory test verification.",
    },
  ];

  const metrics = [
    { value: "15+", label: "Years of Excellence", sub: "Serving Civil & Industrial Projects" },
    { value: "500+", label: "Mega Projects Completed", sub: "Commercial, Dams & Infrastructure" },
    { value: "100%", label: "Hydrostatic Protection", sub: "Zero Water Ingress Warranty" },
    { value: "50+", label: "Engineered Formulations", sub: "Tested & Certified Products" },
  ];

  return (
    <div ref={containerRef} className="w-full space-y-12 sm:space-y-16 pb-12">
      
      {/* 1. Hero Section (Deep Navy Teal Brand Atmosphere) */}
      <section className="anim-reveal relative rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-[#0a3d52] via-[#0b4860] to-[#082a38] border border-[#0d4e68]/50 text-white overflow-hidden shadow-2xl p-8 sm:p-12 lg:p-16">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-[450px] h-[450px] bg-[#ff6b4a]/20 rounded-full blur-[130px] pointer-events-none -translate-y-1/3" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#0ea5e9]/15 rounded-full blur-[120px] pointer-events-none translate-y-1/3" />

        {/* Subtle Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-[#ff8c73] uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>ESTABLISHED 2010 • MARBLEX PAKISTAN</span>
          </div>

          {/* Main Headline */}
          <h1 
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-[1.15] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineering Durability & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#ffb199]">
              Chemical Excellence
            </span> <br />
            For Civil Infrastructure.
          </h1>

          {/* Subtitle */}
          <p className="text-slate-100 text-sm sm:text-base lg:text-lg leading-relaxed font-normal opacity-95">
            MARBLEX is an industry-leading manufacturer and supplier of advanced construction chemicals, polymer waterproofing membranes, and heavy-duty vulcanized rubber solutions engineered for extreme environmental resilience and hydrostatic load containment.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={() => navigate("/catalogs")}
              className="btn-3d-accent px-7 py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#ff6b4a]/30"
            >
              <span>Explore Technical Catalog</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>

            <a
              href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20would%20like%20to%20consult%20regarding%20a%20construction%20chemical%20project."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-white/20 backdrop-blur-md flex items-center gap-2 transition"
            >
              <WhatsAppIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Direct Engineering WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. Key Metrics Bar */}
      <section className="anim-reveal grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((m, idx) => (
          <div 
            key={idx}
            className="p-6 sm:p-7 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#ff6b4a]/40 transition-all text-center space-y-1.5"
          >
            <div 
              className="text-3xl sm:text-4xl font-black text-[#0a3d52] dark:text-[#38bdf8]"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {m.value}
            </div>
            <div className="font-bold text-slate-800 dark:text-slate-100 text-xs sm:text-sm">
              {m.label}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400">
              {m.sub}
            </div>
          </div>
        ))}
      </section>

      {/* 3. Company Story & Heritage */}
      <section className="anim-reveal grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-white dark:bg-[#0e2735] p-6 sm:p-10 lg:p-12 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        
        {/* Left Column: Story Content */}
        <div className="lg:col-span-7 space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a3d52]/10 dark:bg-white/10 text-[#0a3d52] dark:text-[#38bdf8] text-xs font-bold uppercase tracking-wider">
            <ShieldOutlinedIcon sx={{ fontSize: 15 }} />
            <span>THE MARBLEX HERITAGE</span>
          </div>

          <h2 
            className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-white leading-tight tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Built on Rigorous Chemistry & Structural Integrity.
          </h2>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            Founded with a clear engineering objective, <strong>MARBLEX — Chemical & Rubber</strong> has grown into Pakistan’s premier manufacturer and trusted supplier of specialized construction solutions. We solve critical structural challenges: water seepage, chemical abrasion, concrete deterioration, and joint expansion.
          </p>

          <p className="text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            From high-rise commercial basements in Lahore and Karachi to national dam projects and industrial flooring for pharmaceutical plants, MARBLEX formulations are backed by extensive laboratory testing, certified compliance, and on-site application support.
          </p>

          {/* Quick Value Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Certified ISO 9001:2015 Quality</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Monolithic Joint-Free Seals</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>ASTM D412 Standard Verification</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-bold text-slate-800 dark:text-slate-200">
              <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              <span>Nationwide Technical Logistics</span>
            </div>
          </div>
        </div>

        {/* Right Column: Specimen Image Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-3.5">
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm aspect-[4/5]">
            <img 
              src="/products/Banner1.jpeg" 
              alt="MARBLEX Waterproofing Application" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm aspect-[4/5] mt-6">
            <img 
              src="/products/Banner3.jpeg" 
              alt="MARBLEX Polymer Membrane" 
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </section>

      {/* 4. Core Engineering Capabilities (4 Pillars Grid) */}
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
              className="bg-white dark:bg-[#0e2735] p-7 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:shadow-lg hover:border-[#ff6b4a]/30 transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-transform">
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

      {/* 5. Contact & Technical Project Consultation Form */}
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
                  <CheckCircleRoundedIcon sx={{ fontSize: 32 }} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Technical Inquiry Received</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  Thank you for contacting MARBLEX. Our technical engineering team will review your specifications and get in touch promptly.
                </p>
                <button
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2.5 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider"
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
                  className="w-full btn-3d-accent py-3.5 rounded-xl text-white font-bold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
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
