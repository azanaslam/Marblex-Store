import { useState, useRef, useEffect, useMemo } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import ArchitectureOutlinedIcon from "@mui/icons-material/ArchitectureOutlined";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import ThermostatOutlinedIcon from "@mui/icons-material/ThermostatOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import PhoneInTalkRoundedIcon from "@mui/icons-material/PhoneInTalkRounded";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import selectedProductsBgImg from "../assets/selected-products-bg.jpg";
import servicesHeroDesktopImg from "../assets/services-hero-desktop.jpg";
import gsap from "gsap";

// Comprehensive Services Dataset
const SERVICES_DATA = [
  {
    id: "crystalline-elastomeric",
    category: "waterproofing",
    title: "Crystalline & Elastomeric Waterproofing",
    subtitle: "Deep Permeation & Seamless Membrane Barrier",
    description:
      "Advanced dual-action waterproofing combining active hydrophilic crystalline technology with high-elongation elastomeric polymer topcoats. Resists continuous hydrostatic water pressure up to 7 bar.",
    image: "/assets/brochures/real_one_page_2.jpg",
    badge: "Most Popular",
    warranty: "15 Years Warranty",
    specs: "ASTM C836 | 7 Bar Hydrostatic Resistance",
    applications: ["Rooftops & Terraces", "Water Reservoirs & Tanks", "Basement Retaining Walls", "Swimming Pools"],
    features: [
      "Self-heals micro-cracks up to 0.4mm dynamically",
      "UV-resistant, weather-tolerant flexible elastomeric layer",
      "Seamless liquid application eliminating joint vulnerabilities",
      "Eco-safe, non-toxic & suitable for potable water storage",
    ],
    approxRate: "PKR 45 - 65 / sq ft",
  },
  {
    id: "torch-on-membrane",
    category: "waterproofing",
    title: "APP & SBS Polymer Membrane Sheets",
    subtitle: "Heavy-Duty Heat-Fused Protection",
    description:
      "High-tensile polyester-reinforced APP (Atactic Polypropylene) modified bituminous sheets. Torch-applied with continuous molten laps for maximum puncture resistance in subterranean structures.",
    image: "/assets/brochures/Water_Stopper_123_page_1.jpg",
    badge: "Heavy Duty",
    warranty: "20 Years Warranty",
    specs: "ASTM D5147 | 4mm Dual Reinforcement",
    applications: ["Basement Rafts", "Podium Slabs", "Underground Parking", "Bridge Decks"],
    features: [
      "Extreme puncture & root-penetration resistance",
      "Superior tensile elongation accommodating structural shifts",
      "Resists aggressive soil chemicals, sulfates, and chlorides",
      "Pre-fabricated uniform thickness guaranteed",
    ],
    approxRate: "PKR 75 - 110 / sq ft",
  },
  {
    id: "pu-injection-grouting",
    category: "structural",
    title: "Polyurethane (PU) High-Pressure Grouting",
    subtitle: "Active Water Leakage Stop & Concrete Repair",
    description:
      "Hydrophobic and hydrophilic polyurethane resins injected under 250+ bar pressure directly into active structural cracks, cold joints, and voids. Reacts with water to create an impenetrable closed-cell foam seal in seconds.",
    image: "/assets/brochures/real_one_page_3.jpg",
    badge: "Emergency Stop",
    warranty: "10 Years Warranty",
    specs: "DIN EN 1504-5 | 250+ Bar Injection",
    applications: ["Active Basement Gushing Leaks", "Lift Pits & Shafts", "Expansion Joint Failures", "Concrete Honeycombing"],
    features: [
      "Instantly stops flowing water under high pressure",
      "Expands up to 30x original volume inside voids",
      "Remains permanently flexible through thermal cycles",
      "No demolition required — minimal site disruption",
    ],
    approxRate: "PKR 850 - 1,400 / running ft",
  },
  {
    id: "thermal-xps-insulation",
    category: "insulation",
    title: "Thermal & Heat Insulation XPS Slabs",
    subtitle: "Extruded Polystyrene High-Density Roof Barrier",
    description:
      "High-performance closed-cell extruded polystyrene (XPS) and polyurethane spray foam insulation. Drastically lowers roof surface temperatures by up to 18°C and cuts building HVAC electricity costs by 35%.",
    image: "/assets/brochures/Profile_marblex_page_4.jpg",
    badge: "Energy Saver",
    warranty: "25 Years Warranty",
    specs: "R-Value 5.0/inch | Compressive 350 kPa",
    applications: ["Commercial Flat Roofs", "Sloped Metal Roofs", "Cold Storage Facilities", "Residential Villas"],
    features: [
      "Reduces indoor temperature by 8°C - 12°C in summer peak",
      "Zero water absorption rate ensuring lifetime thermal R-value",
      "High compressive strength supports heavy pedestrian traffic",
      "CFC/HCFC free eco-friendly formulation",
    ],
    approxRate: "PKR 90 - 135 / sq ft",
  },
  {
    id: "epoxy-pu-flooring",
    category: "flooring",
    title: "Industrial Epoxy & PU Floor Systems",
    subtitle: "Seamless, Chemical & Forklift Resistant",
    description:
      "Heavy-duty self-leveling epoxy and polyurethane resin flooring for manufacturing plants, pharmaceutical cleanrooms, hospital operating theaters, and commercial multi-story parking structures.",
    image: "/assets/brochures/Profile_marblex_page_6.jpg",
    badge: "Industrial Grade",
    warranty: "10 Years Warranty",
    specs: "Shore D 85 | Chemical Resistant ASTM D1308",
    applications: ["Pharma & Food Processing Plants", "Warehouses & Logistics Hubs", "Automotive Workshops", "Commercial Showrooms"],
    features: [
      "100% dust-free, seamless, and mirror-gloss finish",
      "High abrasion resistance withstands heavy forklift traffic",
      "Resistant to acids, alkalis, hydraulic oils, and detergents",
      "Anti-microbial, hygienic & easy to steam sanitize",
    ],
    approxRate: "PKR 110 - 180 / sq ft",
  },
  {
    id: "termite-pest-barrier",
    category: "termite",
    title: "Structural Termite & Pest Soil Impregnation",
    subtitle: "Pre & Post-Construction Protection Barrier",
    description:
      "Deep pressure soil chemical injection and perimeter barrier treatment using premium non-repellent termiticides. Eradicates subterranean termite colonies and establishes an impenetrable perimeter envelope.",
    image: "/assets/brochures/real_one_page_1.jpg",
    badge: "Colony Elimination",
    warranty: "10 Years Warranty",
    specs: "WHO & EPA Approved | Non-Repellent Chemical",
    applications: ["Pre-Construction Foundation Trenches", "Post-Construction Built Slabs", "Timber Frameworks", "Commercial Warehouses"],
    features: [
      "Undetectable chemical barrier carried by workers to queen",
      "10-year official stamped corporate warranty certificate",
      "Odorless, stainless, and safe for occupants & indoor air",
      "Drill & pressure injection methodology with zero structural damage",
    ],
    approxRate: "PKR 18 - 32 / sq ft",
  },
  {
    id: "rubber-waterstops",
    category: "structural",
    title: "Elastomeric Rubber & PVC Waterstops",
    subtitle: "Engineered Construction Joint Seals",
    description:
      "Heavy-duty vulcanized rubber and virgin PVC waterstop profiles designed for civil construction joints, expansion joints, and retaining wall cold joints subjected to continuous water heads.",
    image: "/assets/brochures/Water_Stopper_123_page_2.jpg",
    badge: "Civil Grade",
    warranty: "Lifetime Structural",
    specs: "BS 2782 | Tensile 15+ MPa",
    applications: ["Dams, Canals & Culverts", "Basement Cold Joints", "Water Treatment Plants", "Underground Tunnels"],
    features: [
      "Accommodates high lateral and shear joint movements",
      "Resistant to high hydrostatic water pressure up to 10 bar",
      "Factory-vulcanized cross, tee, and corner pre-formed pieces",
      "Unaffected by alkalis and acids in surrounding ground water",
    ],
    approxRate: "PKR 450 - 950 / running meter",
  },
  {
    id: "concrete-repair-strengthening",
    category: "structural",
    title: "Structural Concrete Repair & Carbon Fiber Wrapping",
    subtitle: "Carbon Fiber (CFRP) Strengthening & Grout Repair",
    description:
      "Specialized rehabilitation of deteriorated reinforced concrete. Incorporates high-strength non-shrink micro-concretes, anti-corrosion rebar passivators, and carbon-fiber-reinforced polymer (CFRP) wraps to increase load capacity.",
    image: "/assets/brochures/Profile_marblex_page_8.jpg",
    badge: "Structural Rebar",
    warranty: "15 Years Warranty",
    specs: "ACI 440.2R | Tensile 3,800+ MPa",
    applications: ["Spalling Beams & Columns", "Seismic Structural Retrofitting", "Overloaded Floor Slabs", "Corroded Rebar Restoration"],
    features: [
      "Increases flexural and shear load capacities by up to 60%",
      "Ultra-lightweight with zero added structural dead weight",
      "Stops active electrochemical rebar corrosion permanently",
      "Engineered design calculations provided per project requirements",
    ],
    approxRate: "Custom Engineering Quote",
  },
];

// 4-Step Certified Methodology
const METHODOLOGY_STEPS = [
  {
    step: "01",
    title: "Precision Moisture & Thermal Audit",
    desc: "Our senior civil engineers deploy infrared thermography, electronic moisture meters, and crack depth gauges to pinpoint root-cause seepage paths.",
    icon: <SpeedRoundedIcon sx={{ fontSize: 28 }} />,
  },
  {
    step: "02",
    title: "Mechanical Substrate Preparation",
    desc: "Concrete surfaces undergo diamond grinding, high-pressure washing (350+ bar), and V-groove crack chasing to ensure optimal chemical bond tenacity.",
    icon: <ConstructionOutlinedIcon sx={{ fontSize: 28 }} />,
  },
  {
    step: "03",
    title: "Multi-Coat Certified Application",
    desc: "Factory-trained applicators install primers, reinforcement scrim fabrics, and specified elastomer/membrane coats with calibrated micron thickness meters.",
    icon: <LayersOutlinedIcon sx={{ fontSize: 28 }} />,
  },
  {
    step: "04",
    title: "72-Hour Flood Test & Stamped Warranty",
    desc: "Treated areas undergo rigorous 72-hour water ponding tests followed by the issuance of a certified 10-20 Year Corporate Warranty document.",
    icon: <WorkspacePremiumOutlinedIcon sx={{ fontSize: 28 }} />,
  },
];

// Interactive FAQs
const FAQS = [
  {
    q: "How long does your waterproofing warranty last and what does it cover?",
    a: "Our waterproofing systems carry an official stamped corporate warranty ranging from 10 to 20 years, depending on the system selected (Crystalline, Bituminous Torch-on, or Heavy-Duty Polyurea). The warranty covers material performance, adhesion integrity, and leak-free performance with free re-inspection and repair support.",
  },
  {
    q: "Can you stop active water leakage in basements without excavating the outside?",
    a: "Yes! With our high-pressure Polyurethane (PU) Injection Grouting technology, we inject fast-reacting hydrophobic resins directly from the inside of the basement into the leaking cracks. The resin expands inside the concrete and stops gushing water within 30 to 60 seconds without any external excavation.",
  },
  {
    q: "How does Marblex thermal XPS roof insulation lower electricity bills?",
    a: "Marblex Extruded Polystyrene (XPS) slabs provide an ultra-high R-value barrier (R-5 per inch) on the roof surface. This stops up to 90% of radiant solar heat transfer into the building, reducing the top floor ceiling temperature by 12°C - 16°C and lowering air conditioning power consumption by 30% to 40%.",
  },
  {
    q: "Do you offer free on-site inspection and moisture testing in Pakistan?",
    a: "Yes. Our engineering teams provide comprehensive on-site inspections, dampness mapping, and technical material specification estimates across Lahore, Karachi, Islamabad/Rawalpindi, Faisalabad, Multan, and surrounding industrial hubs.",
  },
  {
    q: "Are your chemicals and waterproofing membranes ASTM and ISO certified?",
    a: "All Marblex materials comply strictly with international standards including ASTM C836 (Elastomeric), ASTM D5147 (Bituminous Sheets), BS EN 12390, and ISO 9001:2015 quality management benchmarks with laboratory test reports provided on demand.",
  },
];

export const ServicesPage = () => {
  const navigate = useNavigate();
  const pageRef = useRef(null);

  // Filter State
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeFaq, setActiveFaq] = useState(null);

  // Estimator Interactive State
  const [estService, setEstService] = useState("crystalline-elastomeric");
  const [estArea, setEstArea] = useState("2000");
  const [estCondition, setEstCondition] = useState("normal");
  const [estCity, setEstCity] = useState("Lahore");

  // Booking Form State
  const [bookingForm, setBookingForm] = useState({
    name: "",
    phone: "",
    city: "Lahore",
    service: "Crystalline & Elastomeric Waterproofing",
    date: "",
    notes: "",
  });
  const [bookingSubmitted, setBookingSubmitted] = useState(false);

  // Filtered Services List
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return SERVICES_DATA;
    return SERVICES_DATA.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  // Dynamic Estimate Calculator
  const estimatedCost = useMemo(() => {
    const area = Number(estArea) || 0;
    let baseRate = 55; // default rate per sq ft

    if (estService === "crystalline-elastomeric") baseRate = 55;
    else if (estService === "torch-on-membrane") baseRate = 90;
    else if (estService === "pu-injection-grouting") baseRate = 120;
    else if (estService === "thermal-xps-insulation") baseRate = 110;
    else if (estService === "epoxy-pu-flooring") baseRate = 145;
    else if (estService === "termite-pest-barrier") baseRate = 25;

    // Condition multiplier
    let conditionMult = 1.0;
    if (estCondition === "moderate") conditionMult = 1.15;
    if (estCondition === "severe") conditionMult = 1.35;

    const minTotal = Math.round(area * baseRate * 0.9 * conditionMult);
    const maxTotal = Math.round(area * baseRate * 1.15 * conditionMult);

    return { minTotal, maxTotal, baseRate };
  }, [estService, estArea, estCondition]);

  // Entrance Animations
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!pageRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".serv-anim-hero",
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.85, ease: "power2.out" }
      );
      gsap.fromTo(
        ".serv-anim-card",
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, delay: 0.2, ease: "power2.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleBookingSubmit = (e) => {
    e.preventDefault();
    if (!bookingForm.name || !bookingForm.phone) return;

    setBookingSubmitted(true);
    const msg = `*New On-Site Inspection Booking - MARBLEX*%0A%0A*Name:* ${encodeURIComponent(
      bookingForm.name
    )}%0A*Phone:* ${encodeURIComponent(bookingForm.phone)}%0A*City:* ${encodeURIComponent(
      bookingForm.city
    )}%0A*Service:* ${encodeURIComponent(
      bookingForm.service
    )}%0A*Preferred Date:* ${encodeURIComponent(
      bookingForm.date || "As soon as possible"
    )}%0A*Notes:* ${encodeURIComponent(bookingForm.notes || "None")}`;

    setTimeout(() => {
      window.open(`https://wa.me/923481116611?text=${msg}`, "_blank");
    }, 400);
  };

  const handleWhatsAppEstimator = () => {
    const matchedService = SERVICES_DATA.find((s) => s.id === estService)?.title || estService;
    const msg = `*MARBLEX Engineering - Project Estimate Inquiry*%0A%0A*Service:* ${encodeURIComponent(
      matchedService
    )}%0A*Project Area:* ${estArea} sq ft%0A*Surface Condition:* ${encodeURIComponent(
      estCondition
    )}%0A*City:* ${encodeURIComponent(
      estCity
    )}%0A*Estimated Range:* PKR ${estimatedCost.minTotal.toLocaleString()} - PKR ${estimatedCost.maxTotal.toLocaleString()}%0A%0APlease arrange a technical engineer consultation for site verification.`;

    window.open(`https://wa.me/923481116611?text=${msg}`, "_blank");
  };

  return (
    <div ref={pageRef} className="min-h-screen text-[#0b2f3c] dark:text-[#eaf3f7] pb-24 overflow-x-hidden">
      {/* ==================== 1. HERO SECTION (SPLIT MODERN HERO) ==================== */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-[#1f3d4a] overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-100/60 dark:from-[#091b24] dark:via-[#0c222e] dark:to-[#091b24]">
        {/* Ambient background glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff6b4a]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0a3d52]/10 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto relative z-10 serv-anim-hero">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 font-medium flex items-center gap-1.5">
            <RouterLink to="/" className="hover:text-[#0a3d52] dark:hover:text-sky-400 transition-colors">
              Home
            </RouterLink>
            <span>/</span>
            <span className="text-[#0a3d52] dark:text-white font-semibold">Services & Solutions</span>
          </div>

          {/* Split Hero Grid: Left Content, Right Featured Image Frame with HUD cards */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-center">
            
            {/* Left Column: Heading, Badges, Subtitle & Action CTAs */}
            <div>
              {/* Verified Header Pill */}
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 sm:px-4 rounded-full bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/20 text-[#ff6b4a] dark:text-[#ff8c73] font-bold text-xs tracking-wider uppercase mb-4 sm:mb-5 border border-[#ff6b4a]/30 backdrop-blur-md shadow-2xs">
                <ShieldOutlinedIcon sx={{ fontSize: 16 }} />
                <span>ISO 9001:2015 & ASTM Certified Solutions</span>
              </div>

              {/* Dynamic Responsive Title */}
              <h1
                className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#0a3d52] dark:text-white tracking-tight mb-4 sm:mb-6 leading-[1.15]"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Industrial Grade{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#0a3d52] dark:to-sky-400">
                  Waterproofing & Structural
                </span>{" "}
                Protection.
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
                Engineered elastomeric coatings, high-pressure PU crack grouting, APP torch-on membranes, and thermal XPS insulation backed by a 15-Year Certified Corporate Warranty for commercial mega-structures and civil projects.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-8">
                <div className="glowing-border-wrap-rounded">
                  <div className="glowing-border-beam" />
                  <div className="glowing-border-body">
                    <a
                      href="#service-estimator"
                      className="shimmer-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#0a3d52]/25 hover:shadow-xl active:scale-95 transition-all cursor-pointer w-full"
                    >
                      <CalculateOutlinedIcon sx={{ fontSize: 18 }} />
                      <span>Calculate Cost Estimate</span>
                    </a>
                  </div>
                </div>

                <a
                  href="https://wa.me/923481116611?text=Hello%20MARBLEX%20Engineering%2C%20I%20need%20expert%20consultation%20for%20my%20construction%20project."
                  target="_blank"
                  rel="noreferrer"
                  className="shimmer-btn inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span>Chat with Site Engineer</span>
                </a>

                <a
                  href="#booking-section"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#112832] hover:bg-slate-100 dark:hover:bg-[#163544] text-[#0a3d52] dark:text-white font-bold text-xs sm:text-sm transition-all shadow-2xs"
                >
                  <span>Book Inspection</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                </a>
              </div>

              {/* 3 Value Pillars Mini Bar */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-200/90 dark:border-[#1f3d4a]/80 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">15-Yr Warranty</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Stamped Certificate</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <WaterDropOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">7+ Bar Proof</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Zero Water Ingress</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-[#ff6b4a] flex items-center justify-center shrink-0">
                    <EngineeringOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">Site Audit</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Thermal Moisture Scan</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Hero Visual Showcase with Floating Interactive HUD Badges */}
            <div className="relative group">
              {/* Glow Behind Card */}
              <div className="absolute -inset-2 bg-gradient-to-r from-[#0a3d52] to-[#ff6b4a] rounded-3xl sm:rounded-[36px] opacity-20 blur-xl group-hover:opacity-30 transition duration-700 pointer-events-none" />

              {/* Main Image Frame */}
              <div className="relative rounded-2xl sm:rounded-[30px] overflow-hidden border-2 border-white/80 dark:border-slate-700/80 shadow-2xl bg-slate-100 dark:bg-[#0c222e]">
                <img
                  src={servicesHeroDesktopImg}
                  alt="MARBLEX Certified Chemical Waterproofing on Mega Infrastructure"
                  className="w-full h-[280px] sm:h-[400px] lg:h-[440px] object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/80 via-transparent to-black/20 pointer-events-none" />

                {/* Floating HUD Card 1: Top Left */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md border border-white/40 dark:border-slate-700 shadow-lg flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="w-9 h-9 rounded-xl bg-[#0a3d52] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <WaterDropOutlinedIcon sx={{ fontSize: 19, color: "#38bdf8" }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] sm:text-xs font-bold text-[#0a3d52] dark:text-white">
                        7+ Bar Hydrostatic
                      </span>
                    </div>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      ASTM C836 Compliant
                    </span>
                  </div>
                </div>

                {/* Floating HUD Card 2: Bottom Right */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-2.5 sm:p-3 rounded-2xl bg-[#0a3d52]/95 dark:bg-[#081822]/95 backdrop-blur-md border border-white/20 shadow-xl text-white flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ff6b4a] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <VerifiedOutlinedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white">500+ Mega Sites Sealed</div>
                    <div className="text-[9.5px] sm:text-[10px] text-slate-300 font-medium">100% Leakproof Record</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 2. ENTERPRISE METRICS BAR ==================== */}
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 -mt-7 sm:-mt-8 relative z-20">
        <EnterpriseMetricsBar />
      </div>

      {/* ==================== 3. CATEGORY FILTERS & ALL SERVICES GRID ==================== */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 sm:mb-10 pb-4 border-b border-slate-200 dark:border-[#1f3d4a]">
          <div>
            <div className="text-xs font-bold text-[#ff6b4a] uppercase tracking-wider mb-1">
              Engineered Capabilities
            </div>
            <h2
              className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Our Industrial & Commercial Services
            </h2>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
            {[
              { id: "all", label: "All Solutions" },
              { id: "waterproofing", label: "Waterproofing" },
              { id: "structural", label: "Structural & Repair" },
              { id: "insulation", label: "Thermal XPS" },
              { id: "flooring", label: "Epoxy Flooring" },
              { id: "termite", label: "Termite Barrier" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-[#0a3d52] text-white dark:bg-[#0ea5e9] dark:text-white shadow-md shadow-[#0a3d52]/20"
                    : "bg-white dark:bg-[#112832] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-[#1f3d4a] hover:border-[#0a3d52]/50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Services Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredServices.map((serv) => (
            <div
              key={serv.id}
              className="serv-anim-card group rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] flex flex-col transition-all duration-300 hover:border-[#ff6b4a]/60 hover:shadow-xl hover:shadow-[#0a3d52]/10"
            >
              {/* Card Image Banner */}
              <div className="h-[210px] sm:h-[230px] overflow-hidden relative bg-slate-100 dark:bg-[#0c222e]">
                <img
                  src={serv.image}
                  alt={serv.title}
                  className="w-full h-full object-cover object-top group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/90 via-[#0a3d52]/30 to-transparent" />

                {/* Top Badge */}
                <div className="absolute top-3 right-3 bg-white/95 dark:bg-[#0e222b]/95 backdrop-blur-md text-[#ff6b4a] text-[10.5px] font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-sm border border-[#ff6b4a]/20">
                  {serv.badge}
                </div>

                {/* Bottom Spec Badge */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white text-xs font-semibold">
                  <span className="bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/20 truncate">
                    {serv.specs}
                  </span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/60 backdrop-blur-md px-2.5 py-1 rounded-lg border border-emerald-500/30 whitespace-nowrap">
                    {serv.warranty}
                  </span>
                </div>
              </div>

              {/* Card Content Body */}
              <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[11px] font-bold text-[#ff6b4a] uppercase tracking-wider mb-1">
                    {serv.subtitle}
                  </div>
                  <h3
                    className="text-lg sm:text-xl font-bold text-[#0a3d52] dark:text-white mb-2.5 leading-snug group-hover:text-[#ff6b4a] transition-colors"
                    style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
                  >
                    {serv.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                    {serv.description}
                  </p>

                  {/* Feature Checkpoints */}
                  <div className="space-y-1.5 mb-5 pt-3 border-t border-slate-100 dark:border-[#1f3d4a]">
                    {serv.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircleOutlineRoundedIcon
                          sx={{ fontSize: 15, color: "#10b981" }}
                          className="shrink-0 mt-0.5"
                        />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#1f3d4a] flex items-center justify-between gap-3 mt-auto">
                  <div>
                    <div className="text-[10.5px] text-slate-400">Typical Estimate</div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-sky-300 font-mono">
                      {serv.approxRate}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setEstService(serv.id);
                        document.getElementById("service-estimator")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-[#0a3d52] dark:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      Estimate
                    </button>

                    <a
                      href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20want%20to%20inquire%20about%20${encodeURIComponent(
                        serv.title
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
                      title="WhatsApp Inquiry"
                    >
                      <WhatsAppIcon sx={{ fontSize: 16 }} />
                      <span className="hidden sm:inline">Inquire</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 4. INTERACTIVE PROJECT COST ESTIMATOR TOOL ==================== */}
      <section
        id="service-estimator"
        className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 scroll-mt-24"
      >
        <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 dark:border-[#1f3d4a] bg-gradient-to-br from-white via-slate-50 to-orange-50/40 dark:from-[#0c222e] dark:via-[#091b24] dark:to-[#112832] p-6 sm:p-10 lg:p-12 shadow-md shadow-slate-900/5">
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b4a]/15 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full bg-[#0a3d52]/10 dark:bg-sky-500/20 text-[#0a3d52] dark:text-sky-300 font-bold text-xs tracking-wider uppercase mb-2">
                <CalculateOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Instant Cost Estimator</span>
              </div>
              <h2
                className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Estimate Your Project Investment
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                Select your engineering requirement and area dimensions for real-time market-tested budgeting.
              </p>
            </div>

            {/* Estimator Form & Result Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-8 items-center">
              {/* Left Form Inputs */}
              <div className="space-y-4 sm:space-y-5 bg-white/90 dark:bg-[#112832]/90 p-5 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-[#1f3d4a] backdrop-blur-md shadow-xs">
                {/* 1. Service Type */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Select Required System *
                  </label>
                  <select
                    value={estService}
                    onChange={(e) => setEstService(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#0a3d52]/10 font-medium"
                  >
                    {SERVICES_DATA.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.title} ({s.approxRate})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Area Size */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      Approximate Surface Area (Square Feet) *
                    </label>
                    <span className="text-xs font-bold text-[#ff6b4a] font-mono">
                      {Number(estArea).toLocaleString()} sq ft
                    </span>
                  </div>
                  <input
                    type="range"
                    min="200"
                    max="50000"
                    step="100"
                    value={estArea}
                    onChange={(e) => setEstArea(e.target.value)}
                    className="w-full accent-[#ff6b4a] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>200 sq ft</span>
                    <span>10,000 sq ft</span>
                    <span>50,000+ sq ft</span>
                  </div>
                </div>

                {/* 3. Surface Condition */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Concrete Surface Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: "normal", label: "New / Normal" },
                      { id: "moderate", label: "Minor Leaks" },
                      { id: "severe", label: "Severe Cracks" },
                    ].map((cond) => (
                      <button
                        key={cond.id}
                        type="button"
                        onClick={() => setEstCondition(cond.id)}
                        className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                          estCondition === cond.id
                            ? "border-[#0a3d52] bg-[#0a3d52]/10 text-[#0a3d52] dark:border-sky-400 dark:bg-sky-400/20 dark:text-white"
                            : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {cond.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Project City */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1.5">
                    Project City / Region
                  </label>
                  <select
                    value={estCity}
                    onChange={(e) => setEstCity(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                  >
                    <option value="Lahore">Lahore (Central Logistics)</option>
                    <option value="Karachi">Karachi (Coastal & Port Zone)</option>
                    <option value="Islamabad">Islamabad / Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Multan">Multan & South Punjab</option>
                    <option value="Peshawar">Peshawar & KPK</option>
                  </select>
                </div>
              </div>

              {/* Right Output Card */}
              <div className="rounded-2xl border border-orange-200 dark:border-[#1f3d4a] bg-gradient-to-b from-[#0a3d52] to-[#0d4e68] text-white p-6 sm:p-8 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/15">
                    <span className="text-xs uppercase tracking-wider text-slate-300 font-bold">
                      Calculated Project Range
                    </span>
                    <span className="text-xs bg-[#ff6b4a] text-white px-2.5 py-0.5 rounded-full font-bold">
                      15-Yr Warranty
                    </span>
                  </div>

                  <div className="my-6">
                    <div className="text-xs text-slate-300 mb-1">Estimated Budget Range</div>
                    <div
                      className="text-2xl sm:text-4xl font-black text-white"
                      style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                    >
                      PKR {estimatedCost.minTotal.toLocaleString()}{" "}
                      <span className="text-lg font-normal text-slate-300">to</span> PKR{" "}
                      {estimatedCost.maxTotal.toLocaleString()}
                    </div>
                    <p className="text-xs text-slate-300 mt-2">
                      Includes certified primer coats, high-build chemical applications, and testing inspection.
                    </p>
                  </div>

                  <div className="space-y-2 py-3 border-t border-white/15 text-xs text-slate-200">
                    <div className="flex justify-between">
                      <span>Area Dimension:</span>
                      <b className="text-white font-mono">{Number(estArea).toLocaleString()} sq ft</b>
                    </div>
                    <div className="flex justify-between">
                      <span>Selected System:</span>
                      <b className="text-white truncate max-w-[200px]">
                        {SERVICES_DATA.find((s) => s.id === estService)?.title}
                      </b>
                    </div>
                    <div className="flex justify-between">
                      <span>Logistics Zone:</span>
                      <b className="text-white">{estCity}</b>
                    </div>
                  </div>
                </div>

                <div className="pt-5 mt-4 border-t border-white/15">
                  <button
                    onClick={handleWhatsAppEstimator}
                    className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <WhatsAppIcon sx={{ fontSize: 18 }} />
                    <span>Send Estimate to Senior Engineer</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 5. 4-STEP CERTIFIED APPLICATION METHODOLOGY ==================== */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-xs font-bold text-[#ff6b4a] uppercase tracking-wider mb-1">
            Standard Operating Procedure
          </div>
          <h2
            className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            How Our Engineers Execute Projects
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
            Zero shortcuts. Every square foot follows international ASTM & DIN engineering guidelines.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {METHODOLOGY_STEPS.map((step, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl sm:rounded-3xl border border-slate-200/90 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] flex flex-col justify-between hover:border-[#ff6b4a]/60 hover:shadow-lg transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-[#0a3d52]/30 dark:text-sky-400/30 font-mono">
                    {step.step}
                  </span>
                  <div className="w-12 h-12 rounded-2xl bg-[#0a3d52]/10 dark:bg-sky-500/20 text-[#0a3d52] dark:text-sky-400 flex items-center justify-center">
                    {step.icon}
                  </div>
                </div>
                <h3
                  className="text-base sm:text-lg font-bold text-[#0a3d52] dark:text-white mb-2"
                  style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
                >
                  {step.title}
                </h3>
                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {step.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== 6. ON-SITE INSPECTION BOOKING FORM ==================== */}
      <section
        id="booking-section"
        className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24 scroll-mt-24"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] rounded-3xl overflow-hidden border border-slate-200/90 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] shadow-xl">
          {/* Left Visual Info Banner */}
          <div className="p-8 sm:p-12 bg-gradient-to-br from-[#0a3d52] via-[#0c3142] to-[#081822] text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute -bottom-10 -right-10 w-72 h-72 bg-[#ff6b4a]/20 rounded-full blur-[90px] pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-block px-3.5 py-1 rounded-full bg-white/10 text-[#ff8c73] text-xs font-bold uppercase tracking-wider mb-4 border border-white/10">
                Direct Engineering Desk
              </div>
              <h2
                className="text-2xl sm:text-4xl font-black mb-4 leading-tight"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Schedule an On-Site Technical Inspection
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 font-normal">
                Our certified chemical applicators and civil consultants will visit your site, conduct electronic moisture
                testing, and generate a customized BOQ specification report.
              </p>

              <div className="space-y-3 text-xs sm:text-sm text-slate-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span>Electronic Thermal & Moisture Scanning</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span>Detailed ASTM-Compliant BOQ Formulation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <span>Official Stamped Warranty Guarantee</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/15 relative z-10 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-slate-400 uppercase tracking-wider">Direct Hotline</div>
                <a
                  href="tel:+923481116611"
                  className="text-sm sm:text-base font-bold text-white hover:text-[#ff8c73] transition-colors"
                >
                  +92 348 1116611
                </a>
              </div>
              <a
                href="https://wa.me/923481116611"
                target="_blank"
                rel="noreferrer"
                className="p-3 rounded-full bg-emerald-500 text-white hover:scale-105 transition-all shadow-md"
              >
                <WhatsAppIcon sx={{ fontSize: 20 }} />
              </a>
            </div>
          </div>

          {/* Right Form */}
          <div className="p-6 sm:p-10 lg:p-12">
            <h3
              className="text-xl sm:text-2xl font-bold text-[#0a3d52] dark:text-white mb-2"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Request Inspection Appointment
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6">
              Fill out the details below for guaranteed same-day response from our engineering coordinator.
            </p>

            <form onSubmit={handleBookingSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Full Name / Contractor Name *
                </label>
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Engr. Asim Rauf"
                    value={bookingForm.name}
                    onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                  />
                </div>
              </div>

              {/* Phone & City */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <PhoneOutlinedIcon sx={{ fontSize: 18 }} />
                    </div>
                    <input
                      type="tel"
                      required
                      placeholder="0348-1116611"
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    City / Site Location *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <LocationOnOutlinedIcon sx={{ fontSize: 18 }} />
                    </div>
                    <select
                      value={bookingForm.city}
                      onChange={(e) => setBookingForm({ ...bookingForm, city: e.target.value })}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                    >
                      <option value="Lahore">Lahore</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Islamabad / Rawalpindi">Islamabad / Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Other City">Other Industrial Zone</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Service & Preferred Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Target Engineering Service
                  </label>
                  <select
                    value={bookingForm.service}
                    onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                  >
                    {SERVICES_DATA.map((s) => (
                      <option key={s.id} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Preferred Inspection Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-xs sm:text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400"
                    />
                  </div>
                </div>
              </div>

              {/* Project Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Project Notes / Specific Seepage Issues
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Active seepage in basement retaining wall, roof leakage over 3,000 sq ft..."
                  value={bookingForm.notes}
                  onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#081822] text-sm text-slate-800 dark:text-white outline-none focus:border-[#0a3d52] dark:focus:border-sky-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#0a3d52]/20 hover:shadow-xl active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <CalendarMonthOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Confirm & Send to WhatsApp Desk</span>
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ==================== 7. INTERACTIVE FAQ ACCORDION ==================== */}
      <section className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="text-center mb-10">
          <div className="text-xs font-bold text-[#ff6b4a] uppercase tracking-wider mb-1">
            Frequently Answered
          </div>
          <h2
            className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            Engineering FAQs & Warranties
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = activeFaq === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-[#1f3d4a] rounded-2xl bg-white dark:bg-[#112832] overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setActiveFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm sm:text-base text-[#0a3d52] dark:text-white flex items-center justify-between gap-3 cursor-pointer hover:text-[#ff6b4a] transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <HelpOutlineOutlinedIcon sx={{ fontSize: 18, color: "#ff6b4a" }} className="shrink-0" />
                    <span>{faq.q}</span>
                  </span>
                  <KeyboardArrowDownRoundedIcon
                    sx={{ fontSize: 20 }}
                    className={`transform transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-[#1f3d4a] animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ==================== 8. BOTTOM MASTER CALL TO ACTION ==================== */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0a3d52] via-[#0d4e68] to-[#0a3d52] text-white p-8 sm:p-14 text-center border border-[#0a3d52] shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b4a]/25 rounded-full blur-[120px] pointer-events-none" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-block py-1 px-4 rounded-full bg-white/10 text-[#ff8c73] text-xs font-bold uppercase tracking-widest mb-4 border border-white/10">
              Corporate & Civil Inquiries
            </div>
            <h2
              className="text-3xl sm:text-5xl font-black mb-4 tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Need Certified Materials & Application Contractors?
            </h2>
            <p className="text-slate-200 text-xs sm:text-base mb-8 leading-relaxed font-normal">
              From commercial high-rises to residential basements, connect with Marblex engineering consultants for
              guaranteed leakproof performance.
            </p>

            <div className="flex flex-wrap gap-3.5 justify-center">
              <button
                onClick={() => navigate("/catalogs")}
                className="px-6 sm:px-8 py-3.5 rounded-xl bg-white text-[#0a3d52] hover:bg-slate-100 font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all cursor-pointer flex items-center gap-2"
              >
                <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                <span>Technical Specifications</span>
              </button>

              <div className="glowing-border-wrap-rounded">
                <div className="glowing-border-beam" />
                <div className="glowing-border-body">
                  <button
                    onClick={() => navigate("/contact")}
                    className="shimmer-btn px-6 sm:px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#ff6b4a]/30 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <PhoneInTalkRoundedIcon sx={{ fontSize: 18 }} />
                    <span>Contact Engineering Desk</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
