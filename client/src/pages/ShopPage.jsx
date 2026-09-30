import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http } from "../api/http";
import { HeroBanner } from "../components/HeroBanner";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import { ProductCard } from "../components/ProductCard";
import { beforeAfterPairs, galleryImages } from "../config/constants";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EastIcon from "@mui/icons-material/East";
import AppsOutlinedIcon from "@mui/icons-material/AppsOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import FormatPaintOutlinedIcon from "@mui/icons-material/FormatPaintOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import CompareArrowsIcon from "@mui/icons-material/CompareArrows";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import StarRoundedIcon from "@mui/icons-material/StarRounded";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import { ProductCardSkeleton } from "../components/LoaderSkeleton";
import { useScrollReveal } from "../hooks/useScrollReveal";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

let globalProductsCache = (() => {
  try {
    const raw = localStorage.getItem("marblex_cached_products");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
})();

const categories = [
  { id: "all", label: "All Products", icon: AppsOutlinedIcon },
  { id: "waterproofing", label: "Waterproofing", icon: ShieldOutlinedIcon },
  { id: "chemicals", label: "Construction Chemicals", icon: ScienceOutlinedIcon },
  { id: "elastomeric", label: "Elastomeric Coatings", icon: FormatPaintOutlinedIcon },
  { id: "rubber", label: "Rubber Solutions", icon: ConstructionOutlinedIcon },
  { id: "membranes", label: "Membranes & Sheets", icon: LayersOutlinedIcon },
];

const demoProducts = [
  {
    _id: "demo-1",
    name: "Entryway Flooring",
    description: "High durability and moisture seal formulated for heavy foot traffic and aesthetic appeal.",
    price: 4000,
    imageUrl: "/products/Banner1.jpeg",
    category: "elastomeric",
  },
  {
    _id: "demo-2",
    name: "Waterproofing Barrier",
    description: "Polymer-modified liquid membrane impervious to continuous hydrostatic water pressure.",
    price: 3500,
    imageUrl: "/products/Banner2.jpeg",
    category: "waterproofing",
  },
  {
    _id: "demo-3",
    name: "Mosaic Swimming Pool Seal",
    description: "Chlorine and UV resistant elastic sealant for swimming pools and water retaining vessels.",
    price: 650,
    imageUrl: "/products/Banner3.jpeg",
    category: "chemicals",
  },
  {
    _id: "demo-4",
    name: "Termite (Marblex) 2.9c",
    description: "Industrial grade anti-termite chemical soil barrier for foundation and sub-structure safety.",
    price: 2499,
    imageUrl: "/products/Banner4.jpeg",
    category: "chemicals",
  },
  {
    _id: "demo-5",
    name: "Polymer Wall Putty",
    description: "White cement-based water resistant formulation for flawless, crack-bridging wall prep.",
    price: 3000,
    imageUrl: "/products/Banner1.jpeg",
    category: "chemicals",
  },
  {
    _id: "demo-6",
    name: "Interior Emulsion Paint",
    description: "Washable, ultra-durable low-VOC protective coating for commercial interiors.",
    price: 2400,
    imageUrl: "/products/Banner2.jpeg",
    category: "elastomeric",
  },
  {
    _id: "demo-7",
    name: "Bituminous Membrane",
    description: "APP modified polymer sheet with woven polyester reinforcement for extreme puncture resistance.",
    price: 2000,
    imageUrl: "/products/Banner3.jpeg",
    category: "membranes",
  },
  {
    _id: "demo-8",
    name: "Vulcanized Rubber Waterstop",
    description: "Engineered rib profile to seal expansion & construction joints in dams, basements, and reservoirs.",
    price: 4000,
    imageUrl: "/products/Banner4.jpeg",
    category: "rubber",
  },
];

// Specialized Bespoke Engineering SVGs
const LiquidWaterproofingIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path
      d="M20 5C20 5 10 17 10 24C10 29.52 14.48 34 20 34C25.52 34 30 29.52 30 24C30 17 20 5 20 5Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M16 23.5C16 21.5 17.5 19 20 17.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M6 35.5C10 34 14 36 20 36C26 36 30 34 34 35.5"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeDasharray="2 3"
    />
  </svg>
);

const IndustrialFlooringIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path
      d="M5 12L20 4L35 12L20 20L5 12Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.18"
    />
    <path
      d="M5 20L20 28L35 20"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M5 28L20 36L35 28"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="20" cy="12" r="2.5" fill="currentColor" />
  </svg>
);

const RubberWaterstopsIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path
      d="M6 10H34M6 30H34"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
    <path
      d="M12 10V30M28 10V30"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeDasharray="2 2"
    />
    <circle
      cx="20"
      cy="20"
      r="7"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="currentColor"
      fillOpacity="0.2"
    />
    <path
      d="M20 16V24M16 20H24"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const AdmixturesGroutsIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path
      d="M17 5H23V12L29 27C30.5 30.5 28 34 24 34H16C12 34 9.5 30.5 11 27L17 12V5Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M14 23Q20 20 26 23"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
    <circle cx="18" cy="27" r="1.5" fill="currentColor" />
    <circle cx="23" cy="26" r="1.8" fill="currentColor" />
    <circle cx="20" cy="30" r="1.2" fill="currentColor" />
  </svg>
);

// 4-Stage Methodology Bespoke SVGs
const SubstrateDiagnosticIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <rect
      x="6"
      y="6"
      width="28"
      height="28"
      rx="6"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <circle cx="20" cy="20" r="6.5" stroke="currentColor" strokeWidth="1.8" strokeDasharray="3 2" />
    <circle cx="20" cy="20" r="2.2" fill="currentColor" />
    <path d="M10 20H30M20 10V30" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 3" />
    <path d="M12 14L15 11M25 29L28 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const DeepPrimerIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path d="M5 12H35" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
    <path d="M11 12V22M20 12V29M29 12V20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <path d="M9 22L11 25L13 22M18 29L20 32L22 29M27 20L29 23L31 20" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
    <circle cx="20" cy="7" r="2" fill="currentColor" />
    <path d="M8 7C14 9.5 26 4.5 32 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="2 2" />
  </svg>
);

const MultilayerFormulationIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <path
      d="M20 5L32 10V20C32 27.5 20 34 20 34C20 34 8 27.5 8 20V10L20 5Z"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.14"
    />
    <path
      d="M15 19L18.5 22.5L25 16"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M13.5 27C15.5 29.5 18 31 20 32C22 31 24.5 29.5 26.5 27"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
);

const HydrostaticSignOffIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" className="w-6 h-6 text-current">
    <circle
      cx="20"
      cy="17"
      r="11.5"
      stroke="currentColor"
      strokeWidth="2.2"
      fill="currentColor"
      fillOpacity="0.15"
    />
    <path
      d="M15.5 17L18.5 20L24.5 14"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M15 26L12.5 35L20 31L27.5 35L25 26"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinejoin="round"
      fill="currentColor"
      fillOpacity="0.1"
    />
    <circle cx="20" cy="17" r="8.5" stroke="currentColor" strokeWidth="1.2" strokeDasharray="2 2" />
  </svg>
);

// Industrial Solutions Matrix
const industrialDivisions = [
  {
    code: "WPF-01",
    title: "Liquid Waterproofing",
    subtitle: "Seamless Elastomeric Polymer Barrier",
    desc: "100% seamless, UV-stable liquid membranes that bridge structural micro-cracks and withstand continuous ponding water.",
    icon: LiquidWaterproofingIcon,
    badge: "ASTM D-6083",
    color: "#0a3d52",
    accentGradient: "from-cyan-500 to-sky-600",
    accentText: "text-cyan-600 dark:text-cyan-400",
    accentBorder: "border-cyan-500/25 dark:border-cyan-400/30",
    accentBg: "bg-cyan-50 dark:bg-cyan-950/40",
    metrics: [
      { label: "Elongation", val: "650%" },
      { label: "Tensile", val: "4.8 MPa" },
    ],
    categoryId: "waterproofing",
  },
  {
    code: "FLR-02",
    title: "Industrial Flooring",
    subtitle: "Heavy-Duty Epoxy & Polyurea",
    desc: "Abrasion-resistant, chemical-proof epoxy systems designed for manufacturing plants, heavy warehouses, and hospitals.",
    icon: IndustrialFlooringIcon,
    badge: "Heavy Traffic",
    color: "#0c313d",
    accentGradient: "from-amber-500 to-orange-600",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-500/25 dark:border-amber-400/30",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
    metrics: [
      { label: "Hardness", val: "Shore D 85" },
      { label: "Compressive", val: "85 MPa" },
    ],
    categoryId: "elastomeric",
  },
  {
    code: "WST-03",
    title: "Rubber Waterstops",
    subtitle: "Hydrostatic Joint Sealing Systems",
    desc: "Vulcanized high-elongation rubber profiles engineered for extreme hydrostatic head pressure in tunnels, dams, and foundations.",
    icon: RubberWaterstopsIcon,
    badge: "Hydrostatic Head",
    color: "#082a38",
    accentGradient: "from-emerald-500 to-teal-600",
    accentText: "text-emerald-600 dark:text-emerald-400",
    accentBorder: "border-emerald-500/25 dark:border-emerald-400/30",
    accentBg: "bg-emerald-50 dark:bg-emerald-950/40",
    metrics: [
      { label: "Head Press.", val: "50m Head" },
      { label: "Standard", val: "DIN 18541" },
    ],
    categoryId: "rubber",
  },
  {
    code: "GRT-04",
    title: "Admixtures & Grouts",
    subtitle: "High-Strength Structural Repair",
    desc: "Non-shrink precision grouts, plasticizers, and waterproofing crystallizers enhancing concrete density and load capability.",
    icon: AdmixturesGroutsIcon,
    badge: "High Strength",
    color: "#0f3c4b",
    accentGradient: "from-indigo-500 to-blue-600",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBorder: "border-indigo-500/25 dark:border-indigo-400/30",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
    metrics: [
      { label: "Strength", val: "90 MPa" },
      { label: "Expansion", val: "Non-Shrink" },
    ],
    categoryId: "chemicals",
  },
];

// 4-Step Engineering Methodology
const engineeringSteps = [
  {
    step: "01",
    phase: "PHASE 01",
    title: "Substrate Diagnostic",
    subtitle: "Surface Moisture & Crack Mapping",
    desc: "Core moisture scanning, tensile surface profiling, and structural crack mapping before any chemical compounding.",
    badge: "Surface Profiling",
    spec: "ASTM D-4263 • Tensile >1.5 MPa",
    qcGate: "Gate 1 Verified",
    iso: "ISO 9001:2015",
    icon: SubstrateDiagnosticIcon,
    accentGradient: "from-sky-500 to-blue-600",
    accentText: "text-sky-600 dark:text-sky-400",
    accentBorder: "border-sky-500/25 dark:border-sky-400/30",
    accentBg: "bg-sky-50 dark:bg-sky-950/40",
  },
  {
    step: "02",
    phase: "PHASE 02",
    title: "Deep Primer Penetration",
    subtitle: "Capillary Pore Consolidation",
    desc: "Application of low-viscosity epoxy or acrylic primer to consolidate porous concrete and ensure 2.5+ MPa adhesion.",
    badge: "2.5+ MPa Adhesion",
    spec: "Epoxy Primer • ASTM D-4541",
    qcGate: "Gate 2 Verified",
    iso: "ISO 9001:2015",
    icon: DeepPrimerIcon,
    accentGradient: "from-teal-500 to-emerald-600",
    accentText: "text-teal-600 dark:text-teal-400",
    accentBorder: "border-teal-500/25 dark:border-teal-400/30",
    accentBg: "bg-teal-50 dark:bg-teal-950/40",
  },
  {
    step: "03",
    phase: "PHASE 03",
    title: "Multilayer Formulation",
    subtitle: "Seamless Elastomeric Armor",
    desc: "Deployment of seamless elastomeric liquid membranes, vulcanized waterstops, or high-build polyurea coatings.",
    badge: "Seamless Elastomeric",
    spec: "Pure Polyurea / Vulcanized Profile",
    qcGate: "Gate 3 Verified",
    iso: "EN 1504-2",
    icon: MultilayerFormulationIcon,
    accentGradient: "from-indigo-500 to-purple-600",
    accentText: "text-indigo-600 dark:text-indigo-400",
    accentBorder: "border-indigo-500/25 dark:border-indigo-400/30",
    accentBg: "bg-indigo-50 dark:bg-indigo-950/40",
  },
  {
    step: "04",
    phase: "PHASE 04",
    title: "Hydrostatic Quality Sign-Off",
    subtitle: "Flood Testing & Audit Release",
    desc: "72-hour continuous water flooding test, thermal imaging audit, and official 10-Year MARBLEX warranty issuance.",
    badge: "10-Yr Certified Warranty",
    spec: "72H Flood Test • Thermal Imaging",
    qcGate: "Warranty Active",
    iso: "ASTM C-836",
    icon: HydrostaticSignOffIcon,
    accentGradient: "from-amber-500 to-orange-600",
    accentText: "text-amber-600 dark:text-amber-400",
    accentBorder: "border-amber-500/25 dark:border-amber-400/30",
    accentBg: "bg-amber-50 dark:bg-amber-950/40",
  },
];

// Contractor Testimonials
const contractorTestimonials = [
  {
    quote: "MARBLEX elastomeric membranes eliminated severe basement seepage in our 24-story commercial tower. Zero moisture detected even after monsoon testing.",
    name: "Engr. Salman Qureshi",
    role: "Chief Structural Consultant",
    company: "Apex Infrastructure Ltd.",
    rating: 5,
  },
  {
    quote: "Their vulcanized rubber waterstops and technical support during concrete pouring at the irrigation canal project were flawless. 100% recommended.",
    name: "Tariq Mehmood",
    role: "Project Director",
    company: "National Hydel Works",
    rating: 5,
  },
  {
    quote: "Top quality epoxy flooring with exceptional chemical resistance. Our pharmaceutical manufacturing plant passed all international sterile audits.",
    name: "Dr. Hamza Javed",
    role: "Facilities Operations Lead",
    company: "Pharmatech Bio-Labs",
    rating: 5,
  },
];

const enterpriseMetrics = [
  {
    value: "15",
    suffix: "+",
    title: "Years Industrial Mastery",
    subtitle: "Formulating Since 2011",
  },
  {
    value: "500",
    suffix: "+",
    title: "Mega Projects Sealed",
    subtitle: "Dams, High-Rises & Plants",
  },
  {
    value: "100",
    suffix: "%",
    title: "ISO-9001 Certified",
    subtitle: "ASTM Tested Formulations",
  },
  {
    value: "10",
    suffix: " Yrs",
    title: "Warranty Guarantee",
    subtitle: "Zero Moisture Permeation",
  },
  {
    value: "50",
    suffix: "+",
    title: "Engineered Products",
    subtitle: "Membranes, Epoxy & Sealants",
  },
  {
    value: "100",
    suffix: "%",
    title: "Hydrostatic Head Proof",
    subtitle: "Extreme Chemical Resistance",
  },
];

export const ShopPage = ({ addToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => globalProductsCache || demoProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [calcSurface, setCalcSurface] = useState("roof");
  const [calcArea, setCalcArea] = useState(1500);
  const [loading, setLoading] = useState(() => !globalProductsCache);
  const scrollRef = useScrollReveal();
  
  const catalogHeaderRef = useRef(null);
  const filtersRef = useRef(null);
  const productsGridRef = useRef(null);
  const capabilitiesSectionRef = useRef(null);
  const calculatorSectionRef = useRef(null);
  const caseStudiesSectionRef = useRef(null);
  const methodologySectionRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);

  const handleSelectDivisionCategory = (catId) => {
    setSelectedCategory(catId);
    if (catalogHeaderRef.current) {
      catalogHeaderRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenProduct = useCallback(
    (item) => {
      navigate(`/product/${item._id}`, { state: { product: item } });
    },
    [navigate]
  );

  // Material Calculator Scroll Reveal (Animates whole section & children smoothly from BOTTOM to TOP)
  useEffect(() => {
    if (!calculatorSectionRef.current) return;

    const el = calculatorSectionRef.current;
    const leftEl = el.querySelector(".calc-left-anim");
    const rightEl = el.querySelector(".calc-card-anim");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Main container animates from bottom
            gsap.fromTo(
              el,
              { opacity: 0, y: 65, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 1.1, ease: "power3.out" }
            );

            // Left content slide up
            if (leftEl) {
              gsap.fromTo(
                leftEl,
                { opacity: 0, y: 30 },
                { opacity: 1, y: 0, duration: 1.0, delay: 0.12, ease: "power3.out" }
              );
            }

            // Right live calculation card entrance
            if (rightEl) {
              gsap.fromTo(
                rightEl,
                { opacity: 0, y: 35, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 1.05, delay: 0.22, ease: "power3.out" }
              );
            }

            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Specialized Capabilities Scroll Reveal Animation (Alternating Left & Right from Screen Edges)
  useEffect(() => {
    if (!capabilitiesSectionRef.current) return;

    const el = capabilitiesSectionRef.current;
    const headerEl = el.querySelector(".capabilities-header-anim");
    const cards = el.querySelectorAll(".capabilities-card-anim");

    const observers = [];

    // Header Observer
    if (headerEl) {
      const headerObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                headerEl,
                { opacity: 0, y: -45 },
                { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }
              );
              headerObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -35px 0px" }
      );
      headerObs.observe(headerEl);
      observers.push(headerObs);
    }

    // Individual Cards: Alternating from Left & Right Screen Edges
    cards.forEach((card, idx) => {
      const isLeft = idx % 2 === 0;
      const cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const screenW = typeof window !== "undefined" ? window.innerWidth : 800;
              const dist = Math.min(screenW * 0.95, 550);
              gsap.fromTo(
                card,
                {
                  opacity: 0,
                  x: isLeft ? -dist : dist,
                  scale: 0.94,
                },
                {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 1.1,
                  ease: "power3.out",
                  clearProps: "transform",
                }
              );
              cardObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
      );
      cardObserver.observe(card);
      observers.push(cardObserver);
    });

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  // Field Proof & Case Studies Scroll Reveal (Card 1 from Left Screen Edge, Card 2 from Right Screen Edge)
  useEffect(() => {
    if (!caseStudiesSectionRef.current) return;

    const el = caseStudiesSectionRef.current;
    const headerEl = el.querySelector(".case-studies-header-anim");
    const leftCard = el.querySelector(".case-study-left-anim");
    const rightCard = el.querySelector(".case-study-right-anim");

    const observers = [];

    // Header Observer
    if (headerEl) {
      const headerObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                headerEl,
                { opacity: 0, y: -45 },
                { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }
              );
              headerObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -35px 0px" }
      );
      headerObs.observe(headerEl);
      observers.push(headerObs);
    }

    // Left Card Observer (Animates from LEFT screen edge)
    if (leftCard) {
      const leftObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const screenW = typeof window !== "undefined" ? window.innerWidth : 800;
              const dist = Math.min(screenW * 0.95, 550);
              gsap.fromTo(
                leftCard,
                {
                  opacity: 0,
                  x: -dist,
                  scale: 0.94,
                },
                {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 1.15,
                  ease: "power3.out",
                  clearProps: "transform",
                }
              );
              leftObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
      );
      leftObs.observe(leftCard);
      observers.push(leftObs);
    }

    // Right Card Observer (Animates from RIGHT screen edge)
    if (rightCard) {
      const rightObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const screenW = typeof window !== "undefined" ? window.innerWidth : 800;
              const dist = Math.min(screenW * 0.95, 550);
              gsap.fromTo(
                rightCard,
                {
                  opacity: 0,
                  x: dist,
                  scale: 0.94,
                },
                {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 1.15,
                  ease: "power3.out",
                  clearProps: "transform",
                }
              );
              rightObs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
      );
      rightObs.observe(rightCard);
      observers.push(rightObs);
    }

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  // 4-Stage Certified Engineering Methodology Scroll Reveal (Cards from Left & Right Screen Edges)
  useEffect(() => {
    if (!methodologySectionRef.current) return;

    const el = methodologySectionRef.current;
    const headerEl = el.querySelector(".methodology-header-anim");
    const cards = el.querySelectorAll(".methodology-card-item");

    // Header Observer
    if (headerEl) {
      const headerObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              gsap.fromTo(
                headerEl,
                { opacity: 0, y: -45 },
                { opacity: 1, y: 0, duration: 1.05, ease: "power3.out" }
              );
              headerObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
      );
      headerObserver.observe(headerEl);
    }

    // Individual Card Observers (Animates each card from Left or Right Screen Edge)
    const cardObservers = [];
    cards.forEach((card, idx) => {
      const isLeft = idx % 2 === 0;
      const cardObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const screenW = typeof window !== "undefined" ? window.innerWidth : 800;
              const dist = Math.min(screenW * 0.95, 550);
              gsap.fromTo(
                card,
                {
                  opacity: 0,
                  x: isLeft ? -dist : dist,
                  scale: 0.94,
                },
                {
                  opacity: 1,
                  x: 0,
                  scale: 1,
                  duration: 1.1,
                  ease: "power3.out",
                  clearProps: "transform",
                }
              );
              cardObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -35px 0px" }
      );
      cardObserver.observe(card);
      cardObservers.push(cardObserver);
    });

    return () => {
      cardObservers.forEach((obs) => obs.disconnect());
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    http
      .get("/products")
      .then((res) => {
        if (!isMounted) return;
        const data = Array.isArray(res.data) && res.data.length ? res.data : demoProducts;
        globalProductsCache = data;
        try {
          localStorage.setItem("marblex_cached_products", JSON.stringify(data));
        } catch {}
        setProducts(data);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        if (!globalProductsCache) {
          setProducts(demoProducts);
        }
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Filtered Products Logic
  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return products;
    return products.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const desc = (item.description || "").toLowerCase();
      const cat = (item.category || "").toLowerCase();
      
      switch (selectedCategory) {
        case "waterproofing":
          return name.includes("waterproof") || desc.includes("waterproof") || cat.includes("waterproof");
        case "chemicals":
          return name.includes("putty") || name.includes("termite") || name.includes("mosaic") || name.includes("pool") || name.includes("chemical") || desc.includes("cement");
        case "elastomeric":
          return name.includes("paint") || name.includes("emulsion") || name.includes("flooring") || name.includes("coating") || name.includes("elastomeric") || desc.includes("coating");
        case "rubber":
          return name.includes("rubber") || name.includes("waterstop") || name.includes("joint") || desc.includes("rubber");
        case "membranes":
          return name.includes("membrane") || name.includes("bitumen") || name.includes("sheet") || desc.includes("bitumen");
        default:
          return true;
      }
    });
  }, [products, selectedCategory]);

  // Calculator Estimates
  const calculatedEstimate = useMemo(() => {
    const area = Math.max(Number(calcArea) || 0, 0);
    let coverageRate = 1.2;
    let primerRate = 0.2;
    let title = "Waterproofing Polymer System";

    if (calcSurface === "roof") {
      coverageRate = 1.4;
      primerRate = 0.25;
      title = "UV-Reflective Roof Membrane";
    } else if (calcSurface === "basement") {
      coverageRate = 2.0;
      primerRate = 0.35;
      title = "Heavy Hydrostatic Basement Barrier";
    } else if (calcSurface === "flooring") {
      coverageRate = 1.6;
      primerRate = 0.3;
      title = "High-Traffic Epoxy & Polyurea Floor";
    } else if (calcSurface === "tank") {
      coverageRate = 2.2;
      primerRate = 0.4;
      title = "Potable Water Reservoir Coating";
    }

    const chemicalKg = Math.round(area * coverageRate);
    const primerLiters = Math.round(area * primerRate);
    const drumsCount = Math.ceil(chemicalKg / 20);

    return { chemicalKg, primerLiters, drumsCount, title };
  }, [calcArea, calcSurface]);

  // GSAP ScrollTrigger Smooth Stagger Animation
  useEffect(() => {
    if (loading || filteredProducts.length === 0) return;

    const ctx = gsap.context(() => {
      if (catalogHeaderRef.current) {
        gsap.fromTo(
          catalogHeaderRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            scrollTrigger: {
              trigger: catalogHeaderRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (filtersRef.current) {
        gsap.fromTo(
          filtersRef.current,
          { opacity: 0, y: 20 },
          {
            opacity: 1,
            y: 0,
            duration: 0.85,
            delay: 0.12,
            ease: "power3.out",
            scrollTrigger: {
              trigger: filtersRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, [loading, filteredProducts]);



  return (
    <div ref={scrollRef} className="pb-16 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 overflow-x-clip">
      
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Enterprise Trust & Metrics Marquee Strip */}
      <EnterpriseMetricsBar />

      {/* 3. Core Industrial Engineering Divisions */}
      <div ref={capabilitiesSectionRef} className="my-14 sm:my-20 relative overflow-x-clip">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-full h-[320px] bg-gradient-to-r from-sky-500/10 via-[#0a3d52]/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Content Header (Animates from TOP) */}
        <div className="capabilities-header-anim opacity-0 text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4 relative z-10">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0a3d52]/10 via-sky-500/10 to-[#0a3d52]/10 dark:from-sky-400/15 dark:to-cyan-400/10 text-[#0a3d52] dark:text-sky-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3.5 border border-[#0a3d52]/20 dark:border-sky-400/30 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Engineering Disciplines</span>
          </div>
          <h2 
            className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0a3d52] dark:text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Specialized Chemical & Rubber Capabilities
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed font-normal max-w-2xl mx-auto">
            Tailored industrial chemical compounds engineered to withstand severe thermal expansion, structural hydrostatic load, and corrosive atmospheric conditions.
          </p>
        </div>

        {/* Cards Grid (Animates from BOTTOM with Stagger) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 px-1 relative z-10">
          {industrialDivisions.map((div, i) => {
            const IconComponent = div.icon;
            return (
              <div
                key={i}
                onClick={() => handleSelectDivisionCategory(div.categoryId)}
                className="capabilities-card-anim opacity-0 group relative bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(10,61,82,0.06)] hover:shadow-2xl hover:shadow-[#0a3d52]/15 dark:hover:shadow-black/70 hover:-translate-y-2 hover:border-[#0a3d52]/40 dark:hover:border-sky-500/40 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                {/* Top Subtle Hover Sheen Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${div.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm`} />
                
                {/* Ambient Card Background Tint on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                {/* Subtle Background Discipline Code Watermark */}
                <div className="absolute top-4 right-5 text-3xl font-black font-mono tracking-tighter text-slate-900/[0.04] dark:text-white/[0.05] group-hover:text-slate-900/[0.09] dark:group-hover:text-white/[0.09] transition-colors pointer-events-none select-none">
                  {div.code}
                </div>

                <div className="relative z-10">
                  {/* Card Header: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className={`w-12 h-12 rounded-2xl ${div.accentBg} ${div.accentText} border ${div.accentBorder} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 relative`}>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${div.accentGradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity`} />
                      <div className="relative z-10">
                        <IconComponent />
                      </div>
                    </div>
                    
                    <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg ${div.accentBg} ${div.accentText} border ${div.accentBorder} shadow-xs`}>
                      {div.badge}
                    </span>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 
                    className="text-lg font-bold text-[#0a3d52] dark:text-white mb-1 group-hover:text-[#0a3d52] dark:group-hover:text-sky-300 transition-colors duration-200 tracking-tight"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {div.title}
                  </h3>
                  
                  <p className={`text-xs font-semibold ${div.accentText} mb-2.5 transition-colors`}>
                    {div.subtitle}
                  </p>
                  
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                    {div.desc}
                  </p>

                  {/* Technical Metrics Strip */}
                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 dark:border-slate-800/80 mb-2 bg-slate-50/70 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                    {div.metrics.map((m, mi) => (
                      <div key={mi} className="flex flex-col">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500">{m.label}</span>
                        <span className="text-xs font-extrabold font-mono text-slate-800 dark:text-slate-200">{m.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 group-hover:text-[#0a3d52] dark:group-hover:text-sky-300 transition-colors duration-200">
                  <span className="tracking-wide">Explore Formulation</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-[#0a3d52] dark:group-hover:bg-sky-500 text-slate-600 dark:text-slate-300 group-hover:text-white flex items-center justify-center transition-all duration-200 shadow-xs">
                    <ArrowForwardRoundedIcon sx={{ fontSize: 15 }} className="group-hover:translate-x-0.5 transition-transform duration-200" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 4. Clean Catalog Page Header */}
      <div 
        id="products-section"
        ref={catalogHeaderRef}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pt-6 pb-4 gap-5 border-b border-[#e0e6ed] dark:border-slate-800 scroll-mt-24"
      >
        {/* Left: Eyebrow + Heading + Description */}
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-[#ff6b4a]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b4a] animate-pulse" />
            <span>HIGH GRADE PRODUCT CATALOG</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight font-heading">
            <span className="text-[#0a3d52] dark:text-white">Engineered </span>
            <span className="text-[#ff6b4a]">Products & Materials</span>
          </h2>

          <p className="text-[#565e69] dark:text-slate-300 text-xs sm:text-sm leading-relaxed font-normal">
            Certified industrial solutions engineered for waterproofing, structural integrity, and long-term durability.
          </p>
        </div>

        {/* Right: Products In Catalog Pill Card */}
        <div className="flex items-center gap-3 bg-[#0a3d52] dark:bg-[#0c2432] text-white px-4 sm:px-5 py-3 rounded-2xl shadow-md border border-slate-700/60 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-slate-200 shrink-0">
            <MenuBookOutlinedIcon sx={{ fontSize: 20 }} />
          </div>
          <div className="flex flex-col text-left pr-2">
            <span className="text-xs sm:text-sm font-extrabold text-white leading-tight font-heading">
              {products.length || 12} Products In Catalog
            </span>
            <span className="text-[10px] text-slate-300 font-medium">
              Explore our complete range
            </span>
          </div>
          <div className="w-7 h-7 rounded-full bg-[#ff6b4a] flex items-center justify-center text-white shrink-0 shadow-sm">
            <EastIcon sx={{ fontSize: 15 }} />
          </div>
        </div>
      </div>

      {/* 5. Horizontal Category Filters Bar */}
      <div ref={filtersRef} className="mb-8 overflow-x-auto no-scrollbar py-1">
        <div className="flex items-center gap-2 sm:gap-2.5 min-w-max">
          {categories.map((cat) => {
            const IconComp = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-[13px] font-bold transition-all duration-200 border cursor-pointer ${
                  isActive
                    ? "bg-[#0a3d52] dark:bg-[#ff6b4a] text-white border-[#0a3d52] dark:border-[#ff6b4a] shadow-sm"
                    : "bg-white dark:bg-[#0c222e] text-[#0a3d52] dark:text-slate-300 border-[#e0e6ed] dark:border-slate-800 hover:border-[#0a3d52]/50 hover:bg-slate-50 dark:hover:bg-[#0f2a38]"
                }`}
              >
                <IconComp sx={{ fontSize: 16 }} className={isActive ? "text-white" : "text-[#0a3d52] dark:text-slate-400"} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 6. Products Grid (4 Col Desktop, 2 Col Tablet, 1 Col Mobile) */}
      <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch overflow-x-clip px-1 py-1">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center bg-white dark:bg-[#0c222e] rounded-3xl border border-[#e0e6ed] dark:border-slate-800 p-8">
            <p className="text-[#565e69] dark:text-slate-400 font-medium text-sm">No products found in this category.</p>
            <button
              onClick={() => setSelectedCategory("all")}
              className="mt-3 px-4 py-2 bg-[#0a3d52] text-white rounded-xl text-xs font-bold"
            >
              View All Products
            </button>
          </div>
        ) : (
          filteredProducts.map((product, idx) => (
            <div
              key={product._id || idx}
              className="w-full flex"
            >
              <ProductCard
                product={product}
                index={idx}
                onAddToCart={addToCart}
                onOpenProduct={handleOpenProduct}
              />
            </div>
          ))
        )}
      </div>

      {/* 7. Interactive Material Coverage & Quantity Estimator */}
      <div 
        ref={calculatorSectionRef}
        className="mt-20 sm:mt-28 bg-gradient-to-br from-[#0a3d52] via-[#0c475e] to-[#072836] dark:from-[#091f2a] dark:via-[#071922] dark:to-[#041017] rounded-3xl p-6 sm:p-10 lg:p-12 text-white border border-[#1b556e]/50 dark:border-slate-800/90 shadow-2xl shadow-[#0a3d52]/15 dark:shadow-black/60 relative overflow-hidden transition-all duration-300"
      >
        {/* Ambient Radial Highlights */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-sky-400/15 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Subtle Background Blueprint Grid */}
        <div 
          className="absolute inset-0 opacity-[0.035] pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* Left Calculator Inputs */}
          <div className="calc-left-anim lg:col-span-7 space-y-5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 dark:bg-sky-400/10 text-sky-200 dark:text-sky-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-white/15 dark:border-sky-400/20 shadow-xs backdrop-blur-md">
              <CalculateOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Project Quantity Estimator</span>
            </div>
            
            <h3 
              className="text-2xl sm:text-3xl lg:text-[36px] font-extrabold text-white tracking-tight leading-tight"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Calculate Chemical Coverage For Your Project
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-200/90 dark:text-slate-300 leading-relaxed font-normal max-w-xl">
              Select your structural application type and enter the surface area in square feet to instantly compute material requirement and estimated drum packaging.
            </p>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <LayersOutlinedIcon sx={{ fontSize: 15 }} className="text-sky-300" />
                  <span>Surface Application Type</span>
                </label>
                <div className="relative">
                  <select
                    value={calcSurface}
                    onChange={(e) => setCalcSurface(e.target.value)}
                    className="w-full bg-[#072431]/85 dark:bg-[#05161f] border border-white/20 dark:border-slate-700/80 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white font-medium outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15 transition-all shadow-inner cursor-pointer appearance-none"
                  >
                    <option value="roof" className="bg-[#0c2a38] text-white">Concrete Roof / Terrace Waterproofing</option>
                    <option value="basement" className="bg-[#0c2a38] text-white">Basement & Sub-Structure Retaining Wall</option>
                    <option value="flooring" className="bg-[#0c2a38] text-white">Industrial Epoxy Heavy-Traffic Floor</option>
                    <option value="tank" className="bg-[#0c2a38] text-white">Water Reservoir & Swimming Pool</option>
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300">
                    ▼
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 15 }} className="text-sky-300" />
                  <span>Total Project Area (Sq. Ft)</span>
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={calcArea}
                  onChange={(e) => setCalcArea(e.target.value)}
                  placeholder="e.g. 1500"
                  className="w-full bg-[#072431]/85 dark:bg-[#05161f] border border-white/20 dark:border-slate-700/80 rounded-xl px-4 py-3.5 text-xs sm:text-sm text-white font-medium outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15 transition-all shadow-inner"
                />
              </div>

            </div>

            {/* Quick Presets Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mr-1">Quick Size:</span>
              {[500, 1000, 1500, 2500, 5000].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCalcArea(size)}
                  className={`text-xs px-3 py-1 rounded-lg border font-semibold transition-all duration-200 cursor-pointer ${
                    Number(calcArea) === size
                      ? "bg-sky-400 text-[#072431] border-sky-400 font-bold shadow-md shadow-sky-400/20 scale-105"
                      : "bg-white/10 dark:bg-slate-800/60 text-slate-200 border-white/15 dark:border-slate-700/60 hover:bg-white/20 hover:text-white"
                  }`}
                >
                  {size.toLocaleString()} sq.ft
                </button>
              ))}
            </div>
          </div>

          {/* Right Live Computation Card */}
          <div className="calc-card-anim lg:col-span-5 bg-white dark:bg-[#0c222f] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 border border-slate-100 dark:border-slate-700/80 shadow-2xl shadow-black/25 space-y-4.5 transition-all duration-300 relative overflow-hidden">
            {/* Top Subtle Sheen Border */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-[#0a3d52]" />

            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
                  Estimated Specification
                </span>
              </div>
              <span className="text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-md border border-emerald-200/80 dark:border-emerald-800/40">
                Dual-Coat Standard
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-semibold">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-slate-600 dark:text-slate-400 font-normal">System Formula:</span>
                <span className="font-bold text-[#0a3d52] dark:text-slate-100 text-right">{calculatedEstimate.title}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100/80 dark:border-sky-800/30">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Total Chemical Volume:</span>
                <span 
                  className="font-extrabold text-[#0a3d52] dark:text-sky-400 text-lg sm:text-xl"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {calculatedEstimate.chemicalKg.toLocaleString()} Kg / Liters
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700/40">
                <span className="text-slate-600 dark:text-slate-400 font-normal">Substrate Primer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{calculatedEstimate.primerLiters.toLocaleString()} Liters</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100/80 dark:border-emerald-800/30">
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Standard Packaging:</span>
                <span className="font-extrabold text-emerald-700 dark:text-emerald-400">~{calculatedEstimate.drumsCount} Industrial Drums (20Kg)</span>
              </div>
            </div>

            <a
              href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20calculated%20my%20project%20area%20as%20${calcArea}%20sq.ft%20for%20${calcSurface}%20application.%20Please%20provide%20official%20quotation.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:shadow-emerald-600/35 active:scale-[0.98] transition-all duration-200 cursor-pointer text-center"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              <span>Request Official Quotation On WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* 8. Before & After Transformation Section (Redesigned & Upgraded) */}
      <div ref={caseStudiesSectionRef} className="mt-20 sm:mt-28 overflow-hidden">
        {/* Header (Animates from TOP) */}
        <div className="case-studies-header-anim opacity-0 text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4">
          <div className="inline-flex items-center gap-2 bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3.5 border border-[#0a3d52]/20 dark:border-sky-400/20 shadow-xs">
            <CompareArrowsIcon sx={{ fontSize: 16 }} />
            <span>Field Proof & Case Studies</span>
          </div>
          <h3 
            className="text-2xl sm:text-4xl lg:text-[38px] font-extrabold text-[#0a3d52] dark:text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Proven Industrial Results
          </h3>
          <p className="text-slate-600 dark:text-slate-300 font-normal text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed mt-3">
            Witness how MARBLEX advanced elastomeric coatings and chemical formulations protect concrete infrastructure from severe water ingress and structural degradation.
          </p>
        </div>

        {/* Comparison Cards Grid (Left Card from Left, Right Card from Right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 px-1">
          {beforeAfterPairs.map((pair, idx) => {
            const isLeft = idx === 0;
            const featureTags = isLeft
              ? ["100% Waterstop Barrier", "UV Reflective Shield", "Severe Load Proof"]
              : ["Termite & Bug Matrix", "Hydrostatic Retaining", "Deep Substrate Cure"];

            return (
              <div
                key={idx}
                className={`${
                  isLeft ? "case-study-left-anim" : "case-study-right-anim"
                } opacity-0 group relative bg-white dark:bg-[#0c222e] p-5 sm:p-7 rounded-3xl border border-slate-200/85 dark:border-slate-800/90 shadow-sm hover:shadow-2xl hover:shadow-[#0a3d52]/15 dark:hover:shadow-black/70 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1.5 hover:border-[#0a3d52]/40 dark:hover:border-sky-500/40`}
              >
                {/* Top Subtle Hover Accent Line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#0a3d52] dark:via-sky-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Ambient Subtle Card Tint on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#0a3d52]/5 dark:from-sky-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  {/* Images Comparison Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-5">
                    
                    {/* Before Image */}
                    <div 
                      onClick={() => setPreviewImage(pair.before)}
                      className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700/80 shadow-inner bg-slate-900 group/img cursor-pointer"
                    >
                      <img
                        src={pair.before}
                        alt="Unprotected Substrate"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-[200px] sm:h-[220px] object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md text-amber-300 text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-md border border-amber-400/25 tracking-wider">
                        ⚠️ Before: Untreated
                      </div>
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <ZoomInOutlinedIcon sx={{ fontSize: 16 }} />
                      </div>
                    </div>

                    {/* After Image */}
                    <div 
                      onClick={() => setPreviewImage(pair.after)}
                      className="relative rounded-2xl overflow-hidden border-2 border-emerald-500/50 dark:border-emerald-400/50 shadow-md bg-slate-900 group/img cursor-pointer"
                    >
                      <img
                        src={pair.after}
                        alt="MARBLEX Treated"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-[200px] sm:h-[220px] object-cover group-hover/img:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-lg uppercase shadow-lg shadow-emerald-600/30 flex items-center gap-1 tracking-wider">
                        <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> After: MARBLEX
                      </div>
                      <div className="absolute bottom-2 right-2 w-7 h-7 rounded-full bg-emerald-900/60 backdrop-blur-sm text-white flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <ZoomInOutlinedIcon sx={{ fontSize: 16 }} />
                      </div>
                    </div>

                  </div>

                  {/* Title & Badge */}
                  <div className="space-y-2 px-1">
                    <div className="flex items-center justify-between gap-2">
                      <h4 
                        className="text-lg sm:text-xl font-bold text-[#0a3d52] dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors tracking-tight"
                        style={{ fontFamily: "'Poppins', sans-serif" }}
                      >
                        {pair.title}
                      </h4>
                      <span className="text-[10px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/40 whitespace-nowrap">
                        +300% Lifespan
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed font-normal">
                      {pair.description}
                    </p>

                    {/* Feature Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {featureTags.map((tag, tagIdx) => (
                        <span
                          key={tagIdx}
                          className="text-[10px] font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-md border border-slate-200/80 dark:border-slate-700/60"
                        >
                          ✓ {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="relative z-10 mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <a
                    href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20saw%20your%20Case%20Study%20on%20${encodeURIComponent(pair.title)}%20and%20want%20to%20know%20more.`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#0a3d52] dark:text-sky-400 hover:underline inline-flex items-center gap-1"
                  >
                    <span>Request Case Study Report</span>
                    <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                  </a>
                  <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    ASTM Certified
                  </span>
                </div>

              </div>
            );
          })}
        </div>
      </div>

      {/* 9. 4-Stage Application Methodology */}
      <div ref={methodologySectionRef} className="mt-20 sm:mt-28 relative overflow-x-clip">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] max-w-full h-[350px] bg-gradient-to-r from-emerald-500/8 via-[#0a3d52]/5 to-transparent blur-3xl pointer-events-none rounded-full" />

        {/* Header (Animates from TOP) */}
        <div className="methodology-header-anim opacity-0 text-center max-w-3xl mx-auto mb-10 sm:mb-14 px-4 relative z-10">
          <div className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0a3d52]/10 via-emerald-500/10 to-[#0a3d52]/10 dark:from-emerald-400/15 dark:to-teal-400/10 text-[#0a3d52] dark:text-emerald-300 px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3.5 border border-[#0a3d52]/20 dark:border-emerald-400/30 shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Standard Operating Procedure</span>
          </div>
          <h3 
            className="text-2xl sm:text-4xl lg:text-[40px] font-extrabold text-[#0a3d52] dark:text-white tracking-tight leading-tight"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            4-Stage Certified Engineering Methodology
          </h3>
          <p className="text-slate-600 dark:text-slate-300 text-xs sm:text-sm mt-3 leading-relaxed font-normal max-w-2xl mx-auto">
            Every MARBLEX site application adheres to rigorous laboratory testing, moisture content thresholds, and dual-layer quality audit protocols.
          </p>
        </div>

        {/* Desktop Progress Sequence Track */}
        <div className="hidden lg:grid grid-cols-4 gap-6 px-1 mb-4 pointer-events-none relative z-10">
          {["01 Diagnostic", "02 Consolidation", "03 Formulation", "04 Certification"].map((phaseLabel, sIdx) => (
            <div key={sIdx} className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/40 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-[10px] font-mono font-black shadow-xs">
                {sIdx + 1}
              </div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {phaseLabel}
              </span>
              <div className="flex-1 h-0.5 bg-gradient-to-r from-emerald-400/50 via-emerald-400/20 to-transparent rounded-full" />
            </div>
          ))}
        </div>

        {/* Cards Grid: 1 & 3 from Left, 2 & 4 from Right */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 px-1 relative z-10">
          {engineeringSteps.map((step, idx) => {
            const IconComponent = step.icon;

            return (
              <a
                key={idx}
                href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20am%20interested%20in%20learning%20more%20about%20Stage%20${step.step}%3A%20${encodeURIComponent(step.title)}.`}
                target="_blank"
                rel="noreferrer"
                className="methodology-card-item opacity-0 group relative bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(10,61,82,0.06)] hover:shadow-2xl hover:shadow-[#0a3d52]/15 dark:hover:shadow-black/70 hover:-translate-y-2 hover:border-[#0a3d52]/40 dark:hover:border-sky-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
              >
                {/* Top Subtle Hover Sheen Line */}
                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.accentGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-sm`} />

                {/* Ambient Card Background Tint on Hover */}
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative z-10">
                  {/* Step Header: Big Gradient Number & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-baseline gap-2">
                      <span 
                        className="text-4xl sm:text-5xl font-black font-mono tracking-tighter bg-clip-text text-transparent bg-gradient-to-br from-[#0a3d52] to-sky-500 dark:from-white dark:to-sky-400 group-hover:scale-105 transition-transform duration-300"
                      >
                        {step.step}
                      </span>
                      <span className="text-[9px] font-mono font-bold tracking-widest uppercase text-slate-400 dark:text-slate-500">
                        {step.phase}
                      </span>
                    </div>

                    <div className={`w-12 h-12 rounded-2xl ${step.accentBg} ${step.accentText} border ${step.accentBorder} flex items-center justify-center group-hover:scale-110 group-hover:shadow-lg transition-all duration-300 relative`}>
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${step.accentGradient} opacity-0 group-hover:opacity-20 blur-md transition-opacity`} />
                      <div className="relative z-10">
                        <IconComponent />
                      </div>
                    </div>
                  </div>

                  {/* Step Badge */}
                  <div className="mb-3">
                    <span className={`text-[10px] font-mono font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-md ${step.accentBg} ${step.accentText} border ${step.accentBorder} inline-block shadow-xs`}>
                      {step.badge}
                    </span>
                  </div>

                  {/* Step Title */}
                  <h4 
                    className="text-base sm:text-lg font-bold text-[#0a3d52] dark:text-white mb-1 group-hover:text-[#0a3d52] dark:group-hover:text-sky-300 transition-colors duration-200 tracking-tight"
                    style={{ fontFamily: "'Poppins', sans-serif" }}
                  >
                    {step.title}
                  </h4>

                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">
                    {step.subtitle}
                  </p>

                  {/* Step Description */}
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-4">
                    {step.desc}
                  </p>

                  {/* Technical Spec Box */}
                  <div className="bg-slate-50/80 dark:bg-slate-900/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/80 mb-2 flex items-center justify-between text-[11px]">
                    <span className="font-mono font-semibold text-slate-600 dark:text-slate-300 text-[10px] truncate max-w-[62%]">{step.spec}</span>
                    <span className="text-[9px] font-bold uppercase text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/40 shrink-0">{step.qcGate}</span>
                  </div>
                </div>

                {/* Card Footer: Verified Badge */}
                <div className="relative z-10 mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span>Quality Verified</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded">
                    {step.iso}
                  </span>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      {/* 10. Work Showcase Gallery */}
      <div className="mt-20 sm:mt-28 scroll-reveal">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-5">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-2 border border-[#ff6b4a]/20">
              <PhotoLibraryIcon sx={{ fontSize: 16 }} /> On-Site Installations
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white font-heading">
              Project Gallery & Deployments
            </h3>
            <p className="text-[#565e69] dark:text-slate-300 font-normal text-xs sm:text-sm mt-1">
              Critical infrastructure, commercial high-rises, and industrial facilities engineered with MARBLEX. Click any photo to preview.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[#0a3d52] dark:text-[#ff8c73] bg-white dark:bg-[#0c222e] px-4 py-2.5 rounded-xl border border-[#e0e6ed] dark:border-slate-700 font-bold text-xs sm:text-sm shadow-sm shrink-0">
            <WorkspacePremiumOutlinedIcon fontSize="small" />
            <span className="uppercase tracking-wide">500+ Sites Protected</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {galleryImages.map((img, idx) => (
            <div 
              key={idx} 
              onClick={() => setPreviewImage(img)}
              className={`relative rounded-3xl overflow-hidden group border border-[#e0e6ed] dark:border-slate-800 shadow-sm cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${idx === 0 || idx === 5 ? 'md:col-span-2 md:row-span-2' : ''}`}
            >
              <img 
                src={img} 
                alt={`Showcase ${idx}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover min-h-[190px] transition-transform duration-700 group-hover:scale-108" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/90 via-[#0a3d52]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#ff8c73] block">Site Verification</span>
                    <span className="font-extrabold text-sm sm:text-base font-heading">MARBLEX Industrial Project #{idx + 101}</span>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                    <ZoomInOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal for Gallery Images */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 animate-fadeIn"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="relative max-w-4xl w-full max-h-[90vh] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-white/10 text-white">
              <span className="font-bold text-sm tracking-wide">MARBLEX Project Inspection & Proof</span>
              <button 
                onClick={() => setPreviewImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors text-white"
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="p-2 sm:p-4 flex items-center justify-center bg-black/40 overflow-auto">
              <img 
                src={previewImage} 
                alt="Enlarged Project Preview" 
                className="max-h-[75vh] w-auto object-contain rounded-2xl shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 11. Contractor & Engineer Testimonials */}
      <div className="mt-20 sm:mt-28">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff6b4a]/20">
            <BusinessOutlinedIcon sx={{ fontSize: 16 }} /> Client Endorsements
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white font-heading tracking-tight">
            Trusted by Pakistan's Leading Contractors
          </h3>
          <p className="text-[#565e69] dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Real feedback from project directors, structural consultants, and industrial engineers on site performance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contractorTestimonials.map((item, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-[#0c222e] p-6 sm:p-7 rounded-3xl border border-[#e0e6ed] dark:border-slate-800 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#ff6b4a]">
                  {[...Array(item.rating)].map((_, r) => (
                    <StarRoundedIcon key={r} sx={{ fontSize: 20 }} />
                  ))}
                </div>
                <p className="text-xs sm:text-[13px] text-[#565e69] dark:text-slate-300 leading-relaxed italic font-normal">
                  "{item.quote}"
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0a3d52] to-[#ff6b4a] text-white flex items-center justify-center font-black text-sm shrink-0">
                  {item.name.charAt(0)}
                </div>
                <div>
                  <h5 className="text-xs font-extrabold text-[#0a3d52] dark:text-white font-heading">{item.name}</h5>
                  <p className="text-[10.5px] text-[#ff6b4a] font-bold">{item.role}</p>
                  <p className="text-[10px] text-slate-400 font-medium">{item.company}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 12. Direct Technical Hotline & Instant Consultation CTA Banner */}
      <div className="mt-20 sm:mt-28 bg-gradient-to-br from-[#0a3d52] via-[#0b4860] to-[#082a38] rounded-3xl p-8 sm:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 border border-white/10">
        <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff6b4a]/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-3 text-center md:text-left">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff8c73] block">
            Direct Technical Hotline
          </span>
          <h3 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Planning a Commercial or Industrial Project?
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal opacity-95">
            Get technical data sheets (TDS), customized chemical formulation quotes, or on-site engineering consultations directly from our senior specialists.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full md:w-auto">
          <a
            href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20need%20technical%20consultation%20for%20my%20project."
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto py-3.5 px-6 bg-[#ff6b4a] hover:bg-[#d94826] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-[#ff6b4a]/30 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} />
            <span>Consult on WhatsApp</span>
          </a>

          <a
            href="tel:03481116611"
            className="w-full sm:w-auto py-3.5 px-6 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl border border-white/20 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <LocalPhoneOutlinedIcon sx={{ fontSize: 18 }} />
            <span>Call Hotline</span>
          </a>
        </div>
      </div>

      {/* 13. Bottom Brand Ribbon */}
      <div className="mt-20 pt-6 border-t border-[#e0e6ed] dark:border-slate-800/80 text-center">
        <span className="text-[11px] font-bold text-[#565e69] dark:text-slate-400 tracking-[0.25em] uppercase">
          QUALITY PRODUCTS &nbsp;/&nbsp; CERTIFIED FORMULATIONS &nbsp;/&nbsp; BUILT TO LAST
        </span>
      </div>

    </div>
  );
};
