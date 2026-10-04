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
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
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
    applications: ["Roofs", "Terraces", "Podiums"],
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
    applications: ["Plants", "Warehouses", "Hospitals"],
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
    applications: ["Tunnels", "Dams", "Foundations"],
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
    applications: ["Repair", "Columns", "Slabs"],
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
  const capabilitiesTrackRef = useRef(null);
  const capabilityAutoPauseRef = useRef(0);
  const [activeCapability, setActiveCapability] = useState(0);
  const calculatorSectionRef = useRef(null);
  const caseStudiesSectionRef = useRef(null);
  const methodologySectionRef = useRef(null);

  const [previewImage, setPreviewImage] = useState(null);
  const [filterEdges, setFilterEdges] = useState({ left: false, right: true });
  const [clientReviews, setClientReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewForm, setReviewForm] = useState({
    name: "",
    role: "",
    company: "",
    quote: "",
    rating: 5,
    email: "",
    phone: "",
  });
  const [activeReviewIndex, setActiveReviewIndex] = useState(0);
  const reviewsTrackRef = useRef(null);

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

    const isMobile = window.matchMedia("(max-width: 639px)").matches;

    if (isMobile) {
      const mobileObs = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            gsap.fromTo(
              cards,
              { opacity: 0, y: 22 },
              {
                opacity: 1,
                y: 0,
                duration: 0.7,
                stagger: 0.07,
                ease: "power3.out",
                clearProps: "transform",
              }
            );
            mobileObs.unobserve(entry.target);
          });
        },
        { threshold: 0.2 }
      );
      mobileObs.observe(el);
      observers.push(mobileObs);
    } else {
      cards.forEach((card, idx) => {
        const isLeft = idx % 2 === 0;
        const cardObserver = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                const screenW = window.innerWidth || 800;
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
    }

    return () => observers.forEach((obs) => obs.disconnect());
  }, []);

  const scrollToCapability = (index) => {
    const track = capabilitiesTrackRef.current;
    if (!track) return;
    capabilityAutoPauseRef.current = Date.now() + 8000;
    const card = track.querySelectorAll(".capabilities-card-anim")[index];
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
  };

  useEffect(() => {
    const track = capabilitiesTrackRef.current;
    if (!track) return;

    const update = () => {
      if (window.innerWidth >= 640) return;
      const cards = [...track.querySelectorAll(".capabilities-card-anim")];
      if (!cards.length) return;
      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let min = Infinity;
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < min) {
          min = distance;
          closest = i;
        }
      });
      setActiveCapability(closest);
    };

    update();
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      track.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const track = capabilitiesTrackRef.current;
    const section = capabilitiesSectionRef.current;
    if (!track || !section) return;

    const mobileQuery = window.matchMedia("(max-width: 639px)");
    const reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timerId = 0;
    let visible = false;
    let settling = false;

    const advance = () => {
      if (!mobileQuery.matches || reduceQuery.matches || !visible || settling) return;
      if (document.hidden || Date.now() < capabilityAutoPauseRef.current) return;

      const cards = [...track.querySelectorAll(".capabilities-card-anim")];
      if (cards.length < 2) return;

      const center = track.scrollLeft + track.clientWidth / 2;
      let closest = 0;
      let min = Infinity;
      cards.forEach((card, index) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const distance = Math.abs(cardCenter - center);
        if (distance < min) {
          min = distance;
          closest = index;
        }
      });

      const nextCard = cards[(closest + 1) % cards.length];
      const left = nextCard.offsetLeft - (track.clientWidth - nextCard.clientWidth) / 2;
      settling = true;
      track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
      window.setTimeout(() => {
        settling = false;
      }, 900);
    };

    const stop = () => {
      window.clearInterval(timerId);
      timerId = 0;
    };

    const start = () => {
      stop();
      if (!mobileQuery.matches || reduceQuery.matches || !visible) return;
      timerId = window.setInterval(advance, 2800);
    };

    const hold = () => {
      capabilityAutoPauseRef.current = Date.now() + 8000;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        visible = entries.some((entry) => entry.isIntersecting);
        if (visible) start();
        else stop();
      },
      { threshold: 0.45 }
    );

    observer.observe(section);
    track.addEventListener("pointerdown", hold);
    document.addEventListener("visibilitychange", start);
    mobileQuery.addEventListener("change", start);

    return () => {
      stop();
      observer.disconnect();
      track.removeEventListener("pointerdown", hold);
      document.removeEventListener("visibilitychange", start);
      mobileQuery.removeEventListener("change", start);
    };
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

  useEffect(() => {
    let isMounted = true;
    http
      .get("/client-reviews")
      .then((res) => {
        if (!isMounted) return;
        setClientReviews(Array.isArray(res.data) ? res.data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setClientReviews([]);
      })
      .finally(() => {
        if (isMounted) setReviewsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSubmitClientReview = async (e) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewFeedback("");
    try {
      const res = await http.post("/client-reviews/submit", reviewForm);
      setReviewFeedback(res.data?.message || "Review submitted for approval.");
      setReviewForm({ name: "", role: "", company: "", quote: "", rating: 5, email: "", phone: "" });
      setTimeout(() => {
        setShowReviewForm(false);
        setReviewFeedback("");
      }, 2200);
    } catch (err) {
      setReviewFeedback(err?.response?.data?.message || "Could not submit review. Try again.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const reviewsAvgRating = useMemo(() => {
    if (!clientReviews.length) return "0.0";
    const sum = clientReviews.reduce((acc, r) => acc + (Number(r.rating) || 0), 0);
    return (sum / clientReviews.length).toFixed(1);
  }, [clientReviews]);

  const scrollReviewsTo = useCallback((index) => {
    const track = reviewsTrackRef.current;
    if (!track) return;
    const cards = track.querySelectorAll("[data-review-card]");
    const card = cards[index];
    if (!card) return;
    const left = card.offsetLeft - (track.clientWidth - card.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    setActiveReviewIndex(index);
  }, []);

  const handleReviewsScroll = useCallback(() => {
    const track = reviewsTrackRef.current;
    if (!track) return;
    const cards = [...track.querySelectorAll("[data-review-card]")];
    if (!cards.length) return;
    const center = track.scrollLeft + track.clientWidth / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach((card, idx) => {
      const mid = card.offsetLeft + card.clientWidth / 2;
      const dist = Math.abs(mid - center);
      if (dist < bestDist) {
        bestDist = dist;
        best = idx;
      }
    });
    setActiveReviewIndex(best);
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

  useEffect(() => {
    const track = filtersRef.current;
    if (!track) return;

    const syncEdges = () => {
      const max = track.scrollWidth - track.clientWidth;
      setFilterEdges({
        left: max > 8 && track.scrollLeft > 6,
        right: max > 8 && track.scrollLeft < max - 6,
      });
    };

    const active = track.querySelector('[data-active="true"]');
    if (active && track.scrollWidth > track.clientWidth + 8) {
      const left = active.offsetLeft - (track.clientWidth - active.clientWidth) / 2;
      track.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }

    syncEdges();
    track.addEventListener("scroll", syncEdges, { passive: true });
    window.addEventListener("resize", syncEdges);
    return () => {
      track.removeEventListener("scroll", syncEdges);
      window.removeEventListener("resize", syncEdges);
    };
  }, [selectedCategory]);

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
    <div ref={scrollRef} className="pb-16 w-full max-w-[1400px] mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4">
      
      {/* 1. Hero Section */}
      <HeroBanner />

      {/* 2. Enterprise Trust & Metrics Marquee Strip — full viewport width */}
      <EnterpriseMetricsBar />

      {/* Keep horizontal overflow contained below the full-bleed metrics bar */}
      <div className="overflow-x-clip">
      {/* 3. Core Industrial Engineering Divisions */}
      <section
        ref={capabilitiesSectionRef}
        aria-labelledby="capabilities-heading"
        className="relative my-12 sm:my-20"
      >
        <div className="pointer-events-none absolute left-1/2 top-8 h-64 w-[min(100%,42rem)] -translate-x-1/2 rounded-full bg-gradient-to-r from-sky-400/15 via-[#0a3d52]/10 to-transparent blur-3xl" />

        <div className="capabilities-header-anim relative z-10 mx-auto mb-6 max-w-3xl px-1 text-center opacity-0 sm:mb-12">
          <div className="mb-3.5 inline-flex items-center gap-2.5 rounded-full border border-[#0a3d52]/20 bg-white/80 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a3d52] shadow-sm backdrop-blur-sm dark:border-sky-400/30 dark:bg-[#0c222e]/80 dark:text-sky-300 sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-sky-500" />
            </span>
            <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 16 }} />
            <span>Engineering Disciplines</span>
          </div>
          <h2
            id="capabilities-heading"
            className="font-heading text-[1.65rem] font-extrabold leading-[1.15] tracking-tight text-[#0a3d52] dark:text-white sm:text-4xl lg:text-[2.6rem]"
          >
            Specialized Chemical & Rubber Capabilities
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] font-normal leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Tailored industrial chemical compounds engineered to withstand severe thermal expansion, structural hydrostatic load, and corrosive atmospheric conditions.
          </p>
          <p className="mx-auto mt-4 max-w-md text-[11px] font-semibold leading-relaxed tracking-wide text-slate-500 dark:text-slate-400 sm:max-w-none">
            <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[#0a3d52] dark:text-sky-300">
              <span className="h-1.5 w-1.5 rounded-full bg-sky-500" />
              04 Certified Systems
            </span>
            <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span className="whitespace-nowrap">ASTM · DIN · ISO</span>
            <span className="mx-2 text-slate-300 dark:text-slate-600" aria-hidden="true">·</span>
            <span className="whitespace-nowrap">Hydrostatic Rated</span>
          </p>
        </div>

        <p className="relative z-10 mb-3 flex items-center justify-between px-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:hidden">
          <span>Swipe to explore</span>
          <span className="font-mono normal-case tracking-normal text-[#0a3d52] dark:text-sky-300">
            {String(activeCapability + 1).padStart(2, "0")}
            <span className="text-slate-400"> / 04</span>
          </span>
        </p>

        <div
          ref={capabilitiesTrackRef}
          data-lenis-prevent-touch
          className="relative z-10 -mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-1 sm:pb-0 sm:snap-none lg:grid-cols-4 lg:gap-6"
        >
          {industrialDivisions.map((div, i) => {
            const IconComponent = div.icon;
            return (
              <button
                key={div.code}
                type="button"
                onClick={() => handleSelectDivisionCategory(div.categoryId)}
                className="capabilities-card-anim no-shimmer group relative flex h-full w-[min(86vw,21.5rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.6rem] border border-slate-200/90 bg-white text-left opacity-0 shadow-[0_12px_32px_-20px_rgba(10,61,82,0.45)] transition duration-300 hover:border-[#0a3d52]/25 hover:shadow-[0_22px_44px_-24px_rgba(10,61,82,0.5)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3d52]/40 sm:w-auto sm:shrink sm:snap-align-none sm:hover:-translate-y-1.5 dark:border-slate-800 dark:bg-[#0c222e] dark:hover:border-sky-400/35"
              >
                <span className={`h-1 w-full bg-gradient-to-r ${div.accentGradient}`} />
                <span className={`pointer-events-none absolute inset-x-0 top-1 h-24 bg-gradient-to-b ${div.accentGradient} opacity-[0.08]`} />

                <span className="relative flex w-full flex-1 flex-col p-5 sm:p-6">
                  <span className="flex items-start justify-between gap-3">
                    <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${div.accentBg} ${div.accentText} ${div.accentBorder} transition duration-300 group-hover:scale-105`}>
                      <IconComponent />
                    </span>
                    <span className="flex min-w-0 flex-col items-end gap-1.5">
                      <span className="font-mono text-[10px] font-bold tracking-[0.18em] text-slate-400">
                        {div.code}
                      </span>
                      <span className={`max-w-[9.2rem] rounded-full border px-2.5 py-1 text-center text-[10px] font-bold uppercase leading-tight tracking-wide ${div.accentBg} ${div.accentText} ${div.accentBorder}`}>
                        {div.badge}
                      </span>
                    </span>
                  </span>

                  <span className="mt-5 font-mono text-[11px] font-semibold tracking-[0.26em] text-slate-400">
                    SYSTEM {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1.5 font-heading text-[1.15rem] font-bold leading-tight tracking-tight text-[#0a3d52] dark:text-white">
                    {div.title}
                  </span>
                  <span className={`mt-1 text-[13px] font-semibold leading-snug ${div.accentText}`}>
                    {div.subtitle}
                  </span>
                  <span className="mt-3 text-[13px] font-normal leading-relaxed text-slate-600 dark:text-slate-300">
                    {div.desc}
                  </span>

                  <span className="mt-auto flex w-full flex-col pt-5">
                    <span className="grid grid-cols-2 overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-50 dark:border-slate-700/80 dark:bg-slate-900/50">
                      {div.metrics.map((metric, metricIndex) => (
                        <span
                          key={metric.label}
                          className={`px-3 py-2.5 ${metricIndex === 0 ? "border-r border-slate-200/80 dark:border-slate-700/80" : ""}`}
                        >
                          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
                            {metric.label}
                          </span>
                          <span className="mt-0.5 block font-mono text-sm font-bold text-[#0a3d52] dark:text-slate-100">
                            {metric.val}
                          </span>
                        </span>
                      ))}
                    </span>

                    <span className="mt-3 flex flex-wrap gap-1.5">
                      {div.applications.map((application) => (
                        <span
                          key={application}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        >
                          {application}
                        </span>
                      ))}
                    </span>

                    <span className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-[13px] font-bold text-[#0a3d52] dark:border-slate-800 dark:text-sky-100">
                      <span>Explore Formulation</span>
                      <span className={`flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-white transition duration-300 group-hover:translate-x-0.5 ${div.accentGradient}`}>
                        <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                      </span>
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative z-10 mt-4 flex items-center justify-center gap-2 sm:hidden" role="tablist" aria-label="Capability systems">
          {industrialDivisions.map((div, index) => (
            <button
              key={div.code}
              type="button"
              role="tab"
              aria-selected={activeCapability === index}
              aria-label={`Show ${div.title}`}
              onClick={() => scrollToCapability(index)}
              className="no-shimmer flex h-11 w-8 items-center justify-center"
            >
              <span
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  activeCapability === index ? "w-7 bg-[#0a3d52] dark:bg-sky-400" : "w-1.5 bg-slate-300 dark:bg-slate-600"
                }`}
              />
            </button>
          ))}
        </div>
      </section>
      
      {/* 4. Clean Catalog Page Header */}
      <div 
        id="products-section"
        ref={catalogHeaderRef}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pt-6 pb-4 gap-5 border-b border-[#e0e6ed] dark:border-slate-800 scroll-mt-24"
      >
        {/* Left: Eyebrow + Heading + Description */}
        <div className="space-y-1.5 max-w-3xl">
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
      </div>

      {/* 5. Horizontal Category Filters Bar */}
      <div
        ref={filtersRef}
        data-lenis-prevent-touch
        className={`catalog-filters relative -mx-3 mb-8 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-px-3 px-3 py-1 sm:mx-0 sm:snap-none sm:gap-2.5 sm:px-0 ${
          filterEdges.left ? "is-fade-left" : ""
        } ${filterEdges.right ? "is-fade-right" : ""}`}
      >
        {categories.map((cat) => {
          const IconComp = cat.icon;
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              data-active={isActive ? "true" : "false"}
              onClick={() => setSelectedCategory(cat.id)}
              className={`no-shimmer inline-flex h-11 shrink-0 snap-start items-center gap-2 rounded-full border pl-1.5 pr-3.5 text-[13px] font-semibold transition duration-200 ${
                isActive
                  ? "border-[#0a3d52] bg-[#0a3d52] text-white shadow-[0_10px_18px_-14px_rgba(10,61,82,0.95)] dark:border-[#ff6b4a] dark:bg-[#ff6b4a]"
                  : "border-slate-200/90 bg-white text-[#0a3d52] shadow-[0_1px_2px_rgba(15,23,42,0.04)] hover:border-[#0a3d52]/30 dark:border-slate-700 dark:bg-[#0c222e] dark:text-slate-200 dark:hover:border-sky-400/40"
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "bg-slate-100 text-[#0a3d52] dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <IconComp sx={{ fontSize: 16 }} />
              </span>
              <span className="whitespace-nowrap">{cat.label}</span>
            </button>
          );
        })}
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

      </div>{/* end overflow-x-clip (products zone) */}

      {/* 7. Interactive Material Coverage & Quantity Estimator — full bleed */}
      <section
        ref={calculatorSectionRef}
        className="relative left-1/2 mt-16 w-screen max-w-[100vw] -translate-x-1/2 sm:mt-24"
        aria-labelledby="estimator-heading"
      >
        <div className="relative overflow-hidden border-y border-[#1b556e]/40 bg-gradient-to-br from-[#0a3d52] via-[#0c475e] to-[#072836] px-4 py-10 text-white sm:px-8 sm:py-14 lg:px-12 lg:py-16 dark:from-[#091f2a] dark:via-[#071922] dark:to-[#041017]">
          <div className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full bg-sky-400/15 blur-[110px]" />
          <div className="pointer-events-none absolute -bottom-24 -left-16 h-[360px] w-[360px] rounded-full bg-[#ff6b4a]/10 blur-[100px]" />
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.45) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          <div className="relative z-10 mx-auto grid max-w-[1400px] grid-cols-1 items-stretch gap-8 lg:grid-cols-12 lg:gap-10">
            {/* Inputs */}
            <div className="calc-left-anim flex flex-col justify-center space-y-5 lg:col-span-7 lg:space-y-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-sky-100 backdrop-blur-md sm:text-xs">
                <CalculateOutlinedIcon sx={{ fontSize: 15 }} />
                Project Quantity Estimator
              </div>

              <h3
                id="estimator-heading"
                className="font-heading max-w-xl text-[1.55rem] font-extrabold leading-[1.15] tracking-tight text-white sm:text-3xl lg:text-[2.15rem]"
              >
                Calculate Chemical Coverage For Your Project
              </h3>

              <p className="max-w-xl text-[13px] leading-relaxed text-slate-200/90 sm:text-sm">
                Pick the surface type and area — get an instant dual-coat material estimate with primer and drum packaging.
              </p>

              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 sm:gap-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    <LayersOutlinedIcon sx={{ fontSize: 14 }} className="text-sky-300" />
                    Surface Application
                  </label>
                  <div className="relative">
                    <select
                      value={calcSurface}
                      onChange={(e) => setCalcSurface(e.target.value)}
                      className="w-full appearance-none rounded-2xl border border-white/20 bg-[#072431]/90 px-4 py-3.5 pr-10 text-[13px] font-medium text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15 sm:text-sm"
                    >
                      <option value="roof" className="bg-[#0c2a38]">Concrete Roof / Terrace Waterproofing</option>
                      <option value="basement" className="bg-[#0c2a38]">Basement & Sub-Structure Retaining Wall</option>
                      <option value="flooring" className="bg-[#0c2a38]">Industrial Epoxy Heavy-Traffic Floor</option>
                      <option value="tank" className="bg-[#0c2a38]">Water Reservoir & Swimming Pool</option>
                    </select>
                    <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300">▼</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-200">
                    <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 14 }} className="text-sky-300" />
                    Project Area (Sq. Ft)
                  </label>
                  <input
                    type="number"
                    min={50}
                    step={50}
                    value={calcArea}
                    onChange={(e) => setCalcArea(e.target.value)}
                    placeholder="e.g. 1500"
                    className="w-full rounded-2xl border border-white/20 bg-[#072431]/90 px-4 py-3.5 text-[13px] font-medium text-white outline-none transition focus:border-sky-400 focus:ring-4 focus:ring-sky-400/15 sm:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">Quick Size</span>
                <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
                  {[500, 1000, 1500, 2500, 5000].map((size) => {
                    const active = Number(calcArea) === size;
                    return (
                      <button
                        key={size}
                        type="button"
                        onClick={() => setCalcArea(size)}
                        className={`no-shimmer shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition ${
                          active
                            ? "border-sky-300 bg-sky-300 text-[#072431] shadow-md shadow-sky-400/25"
                            : "border-white/15 bg-white/10 text-slate-200 hover:bg-white/20"
                        }`}
                      >
                        {size.toLocaleString()} sq.ft
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Live result card */}
            <div className="calc-card-anim lg:col-span-5">
              <div className="relative flex h-full flex-col overflow-hidden rounded-[1.6rem] border border-white/10 bg-white p-5 text-slate-900 shadow-2xl shadow-black/30 dark:border-slate-700/80 dark:bg-[#0c222f] dark:text-white sm:p-7">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-[#0a3d52]" />

                <div className="mb-4 flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
                      Estimated Specification
                    </span>
                  </div>
                  <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-1 text-[10px] font-extrabold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-400">
                    Dual-Coat
                  </span>
                </div>

                <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50/90 px-3.5 py-3 dark:border-slate-700/50 dark:bg-slate-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Formula</div>
                  <div className="mt-1 text-sm font-bold text-[#0a3d52] dark:text-slate-100">{calculatedEstimate.title}</div>
                </div>

                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  <div className="rounded-2xl border border-sky-100 bg-sky-50/80 p-3 dark:border-sky-800/40 dark:bg-sky-950/30">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-sky-700/80 dark:text-sky-300/80">Chemical</div>
                    <div className="mt-1 font-heading text-xl font-black tracking-tight text-[#0a3d52] dark:text-sky-300 sm:text-2xl">
                      {calculatedEstimate.chemicalKg.toLocaleString()}
                      <span className="ml-1 text-xs font-bold text-slate-500 dark:text-slate-400">Kg</span>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700/50 dark:bg-slate-800/40">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Primer</div>
                    <div className="mt-1 font-heading text-xl font-black tracking-tight text-slate-800 dark:text-slate-100 sm:text-2xl">
                      {calculatedEstimate.primerLiters.toLocaleString()}
                      <span className="ml-1 text-xs font-bold text-slate-500 dark:text-slate-400">L</span>
                    </div>
                  </div>
                </div>

                <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/80 px-3.5 py-3 dark:border-emerald-800/40 dark:bg-emerald-950/30">
                  <span className="text-[12px] font-semibold text-slate-600 dark:text-slate-300">Packaging</span>
                  <span className="text-right text-[13px] font-extrabold text-emerald-700 dark:text-emerald-400">
                    ~{calculatedEstimate.drumsCount} Drums · 20Kg
                  </span>
                </div>

                <a
                  href={`https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20calculated%20my%20project%20area%20as%20${calcArea}%20sq.ft%20for%20${calcSurface}%20application.%20Please%20provide%20official%20quotation.`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-white shadow-lg shadow-emerald-600/25 transition hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] sm:text-xs"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span className="sm:hidden">Get Quote on WhatsApp</span>
                  <span className="hidden sm:inline">Request Official Quotation On WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="overflow-x-clip">

      {/* 8. Before & After Transformation Section */}
      <section ref={caseStudiesSectionRef} className="mt-16 overflow-hidden sm:mt-24">
        <div className="case-studies-header-anim mx-auto mb-8 max-w-3xl px-1 text-center opacity-0 sm:mb-12">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#0a3d52]/20 bg-[#0a3d52]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a3d52] dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300 sm:text-xs">
            <CompareArrowsIcon sx={{ fontSize: 15 }} />
            Field Proof & Case Studies
          </div>
          <h3 className="font-heading text-[1.55rem] font-extrabold leading-tight tracking-tight text-[#0a3d52] dark:text-white sm:text-4xl lg:text-[2.35rem]">
            Proven Industrial Results
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            How MARBLEX elastomeric coatings and chemical systems protect concrete from water ingress and structural degradation.
          </p>
        </div>

        <div className="-mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-6 sm:overflow-visible sm:px-1 sm:pb-0 lg:gap-8">
          {beforeAfterPairs.map((pair, idx) => {
            const isLeft = idx === 0;
            const featureTags = isLeft
              ? ["100% Waterstop Barrier", "UV Reflective Shield", "Severe Load Proof"]
              : ["Termite & Bug Matrix", "Hydrostatic Retaining", "Deep Substrate Cure"];

            return (
              <article
                key={pair.title || idx}
                className={`${
                  isLeft ? "case-study-left-anim" : "case-study-right-anim"
                } group relative flex w-[min(88vw,24rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white opacity-0 shadow-[0_12px_32px_-22px_rgba(10,61,82,0.45)] transition duration-300 hover:-translate-y-1 hover:border-[#0a3d52]/30 hover:shadow-[0_22px_44px_-24px_rgba(10,61,82,0.45)] dark:border-slate-800 dark:bg-[#0c222e] sm:w-auto sm:shrink sm:snap-align-none`}
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#0a3d52] to-transparent opacity-0 transition group-hover:opacity-100 dark:via-sky-400" />

                <div className="relative z-10 flex flex-1 flex-col p-4 sm:p-6">
                  <div className="mb-4 grid grid-cols-2 gap-2 sm:gap-3">
                    <button
                      type="button"
                      onClick={() => setPreviewImage(pair.before)}
                      className="no-shimmer group/img relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-900 dark:border-slate-700"
                    >
                      <img
                        src={pair.before}
                        alt="Unprotected Substrate"
                        loading="lazy"
                        decoding="async"
                        className="h-[140px] w-full object-cover transition duration-500 group-hover/img:scale-105 sm:h-[200px]"
                      />
                      <span className="absolute left-2 top-2 rounded-md border border-amber-400/25 bg-slate-900/85 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-amber-300 backdrop-blur-md sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[9.5px]">
                        Before
                      </span>
                      <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white opacity-0 backdrop-blur-sm transition group-hover/img:opacity-100">
                        <ZoomInOutlinedIcon sx={{ fontSize: 15 }} />
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPreviewImage(pair.after)}
                      className="no-shimmer group/img relative overflow-hidden rounded-2xl border-2 border-emerald-500/45 bg-slate-900 dark:border-emerald-400/45"
                    >
                      <img
                        src={pair.after}
                        alt="MARBLEX Treated"
                        loading="lazy"
                        decoding="async"
                        className="h-[140px] w-full object-cover transition duration-500 group-hover/img:scale-105 sm:h-[200px]"
                      />
                      <span className="absolute right-2 top-2 inline-flex items-center gap-0.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-md sm:right-3 sm:top-3 sm:gap-1 sm:px-2.5 sm:py-1 sm:text-[9.5px]">
                        <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> After
                      </span>
                      <span className="absolute bottom-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-900/60 text-white opacity-0 backdrop-blur-sm transition group-hover/img:opacity-100">
                        <ZoomInOutlinedIcon sx={{ fontSize: 15 }} />
                      </span>
                    </button>
                  </div>

                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-heading text-base font-bold tracking-tight text-[#0a3d52] transition group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-300 sm:text-xl">
                      {pair.title}
                    </h4>
                    <span className="shrink-0 rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[10px] font-extrabold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-400">
                      +300% Life
                    </span>
                  </div>

                  <p className="mt-2 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[13px]">
                    {pair.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {featureTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-slate-200/80 bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:border-slate-700/60 dark:bg-slate-800/80 dark:text-slate-300"
                      >
                        ✓ {tag}
                      </span>
                    ))}
                  </div>

                  <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                    <a
                      href={`https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20saw%20your%20Case%20Study%20on%20${encodeURIComponent(pair.title)}%20and%20want%20to%20know%20more.`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#0a3d52] hover:underline dark:text-sky-400"
                    >
                      Case Study Report
                      <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                    </a>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">ASTM Certified</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 9. 4-Stage Application Methodology */}
      <section ref={methodologySectionRef} className="relative mt-16 overflow-x-clip sm:mt-24">
        <div className="pointer-events-none absolute left-1/2 top-1/2 h-[320px] w-[min(100%,42rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500/10 via-[#0a3d52]/5 to-transparent blur-3xl" />

        <div className="methodology-header-anim relative z-10 mx-auto mb-7 max-w-3xl px-1 text-center opacity-0 sm:mb-12">
          <div className="mb-3.5 inline-flex items-center gap-2.5 rounded-full border border-[#0a3d52]/20 bg-gradient-to-r from-[#0a3d52]/10 via-emerald-500/10 to-[#0a3d52]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a3d52] dark:border-emerald-400/30 dark:from-emerald-400/15 dark:to-teal-400/10 dark:text-emerald-300 sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            <FactCheckOutlinedIcon sx={{ fontSize: 15 }} />
            Standard Operating Procedure
          </div>
          <h3 className="font-heading text-[1.55rem] font-extrabold leading-tight tracking-tight text-[#0a3d52] dark:text-white sm:text-4xl lg:text-[2.4rem]">
            4-Stage Certified Engineering Methodology
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Every site application follows laboratory testing, moisture thresholds, and dual-layer quality audit protocols.
          </p>
        </div>

        <div className="relative z-10 mb-3 hidden grid-cols-4 gap-4 px-1 lg:grid">
          {["01 Diagnostic", "02 Consolidation", "03 Formulation", "04 Certification"].map((phaseLabel, sIdx) => (
            <div key={phaseLabel} className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-50 text-[10px] font-black text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                {sIdx + 1}
              </div>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400">{phaseLabel}</span>
              <div className="h-0.5 flex-1 rounded-full bg-gradient-to-r from-emerald-400/50 to-transparent" />
            </div>
          ))}
        </div>

        <p className="relative z-10 mb-3 flex items-center justify-between px-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:hidden">
          <span>Swipe stages</span>
          <span className="font-mono normal-case tracking-normal text-[#0a3d52] dark:text-emerald-300">01 — 04</span>
        </p>

        <div
          data-lenis-prevent-touch
          className="relative z-10 -mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-1 sm:pb-0 sm:snap-none lg:grid-cols-4 lg:gap-6"
        >
          {engineeringSteps.map((step) => {
            const IconComponent = step.icon;
            return (
              <a
                key={step.step}
                href={`https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20am%20interested%20in%20learning%20more%20about%20Stage%20${step.step}%3A%20${encodeURIComponent(step.title)}.`}
                target="_blank"
                rel="noreferrer"
                className="methodology-card-item no-shimmer group relative flex h-full w-[min(86vw,21rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white opacity-0 shadow-[0_12px_32px_-20px_rgba(10,61,82,0.4)] transition duration-300 hover:-translate-y-1.5 hover:border-[#0a3d52]/30 hover:shadow-[0_22px_44px_-24px_rgba(10,61,82,0.45)] dark:border-slate-800 dark:bg-[#0c222e] sm:w-auto sm:shrink sm:snap-align-none"
              >
                <span className={`h-1 w-full bg-gradient-to-r ${step.accentGradient}`} />
                <span className="relative flex flex-1 flex-col p-5 sm:p-6">
                  <span className="mb-4 flex items-start justify-between gap-3">
                    <span className="flex items-baseline gap-2">
                      <span className="bg-gradient-to-br from-[#0a3d52] to-sky-500 bg-clip-text font-mono text-4xl font-black tracking-tighter text-transparent dark:from-white dark:to-sky-400 sm:text-5xl">
                        {step.step}
                      </span>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-widest text-slate-400">{step.phase}</span>
                    </span>
                    <span className={`flex h-11 w-11 items-center justify-center rounded-2xl border sm:h-12 sm:w-12 ${step.accentBg} ${step.accentText} ${step.accentBorder} transition group-hover:scale-105`}>
                      <IconComponent />
                    </span>
                  </span>

                  <span className={`mb-3 inline-flex w-fit rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${step.accentBg} ${step.accentText} ${step.accentBorder}`}>
                    {step.badge}
                  </span>

                  <span className="font-heading text-base font-bold tracking-tight text-[#0a3d52] dark:text-white sm:text-lg">
                    {step.title}
                  </span>
                  <span className="mt-1 text-[12px] font-semibold text-slate-500 dark:text-slate-400">{step.subtitle}</span>
                  <span className="mt-2.5 text-[12px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xs">
                    {step.desc}
                  </span>

                  <span className="mt-4 flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/90 px-2.5 py-2 dark:border-slate-800/80 dark:bg-slate-900/50">
                    <span className="truncate font-mono text-[10px] font-semibold text-slate-600 dark:text-slate-300">{step.spec}</span>
                    <span className="shrink-0 rounded border border-emerald-200/50 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/60 dark:text-emerald-300">
                      {step.qcGate}
                    </span>
                  </span>

                  <span className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3.5 dark:border-slate-800/80">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Quality Verified
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:bg-slate-800/80 dark:text-slate-500">
                      {step.iso}
                    </span>
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      </section>

      {/* 10. Work Showcase Gallery */}
      <section className="relative mt-16 overflow-hidden scroll-reveal sm:mt-24">
        <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-[min(100%,36rem)] -translate-x-1/2 rounded-full bg-gradient-to-b from-[#0a3d52]/8 to-transparent blur-3xl dark:from-sky-400/10" />

        <div className="relative z-10 mx-auto mb-7 max-w-3xl px-1 text-center sm:mb-12">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#0a3d52]/20 bg-[#0a3d52]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a3d52] dark:border-sky-400/25 dark:bg-sky-400/10 dark:text-sky-300 sm:text-xs">
            <PhotoLibraryIcon sx={{ fontSize: 15 }} />
            On-Site Installations
          </div>
          <h3 className="font-heading text-[1.55rem] font-extrabold leading-tight tracking-tight text-[#0a3d52] dark:text-white sm:text-4xl lg:text-[2.35rem]">
            Project Gallery & Deployments
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Critical infrastructure, commercial towers, and industrial facilities protected with MARBLEX systems. Tap any photo to inspect.
          </p>
          <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-300">
            <WorkspacePremiumOutlinedIcon sx={{ fontSize: 15 }} />
            500+ Sites Protected
          </div>
        </div>

        <p className="relative z-10 mb-3 flex items-center justify-between px-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400 sm:hidden">
          <span>Swipe gallery</span>
          <span className="font-mono normal-case tracking-normal text-[#0a3d52] dark:text-sky-300">
            01 — {String(galleryImages.length).padStart(2, "0")}
          </span>
        </p>

        <div
          data-lenis-prevent-touch
          className="relative z-10 -mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-1 sm:pb-0 sm:snap-none lg:grid-cols-3 lg:gap-5"
        >
          {[
            { title: "PU Waterproofing", tag: "Roof Deck", site: "Industrial Project #101" },
            { title: "Membrane Install", tag: "Terrace Seal", site: "Industrial Project #102" },
            { title: "Waterstop Profile", tag: "Joint System", site: "Industrial Project #103" },
            { title: "Foundation Barrier", tag: "Below Grade", site: "Industrial Project #104" },
            { title: "Protective Coating", tag: "Structural", site: "Industrial Project #105" },
            { title: "Field Deployment", tag: "Multi-Site", site: "Industrial Project #106" },
          ].map((meta, idx) => {
            const img = galleryImages[idx];
            if (!img) return null;

            return (
              <button
                key={img}
                type="button"
                onClick={() => setPreviewImage(img)}
                className="no-shimmer group relative flex w-[min(86vw,22rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.5rem] border border-slate-200/90 bg-white text-left shadow-[0_12px_32px_-20px_rgba(10,61,82,0.4)] transition duration-300 hover:-translate-y-1 hover:border-[#0a3d52]/30 hover:shadow-[0_22px_44px_-24px_rgba(10,61,82,0.45)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0a3d52]/35 dark:border-slate-800 dark:bg-[#0c222e] sm:w-auto sm:shrink sm:snap-align-none"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900 sm:aspect-[5/4]">
                  <img
                    src={img}
                    alt={meta.title}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#061820]/95 via-[#061820]/35 to-transparent" />

                  <span className="absolute left-3 top-3 rounded-md border border-white/15 bg-black/45 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md sm:left-4 sm:top-4">
                    {meta.tag}
                  </span>

                  <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/15 text-white opacity-90 backdrop-blur-md transition group-hover:bg-white/25 sm:right-4 sm:top-4">
                    <ZoomInOutlinedIcon sx={{ fontSize: 16 }} />
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-300/90">
                      {meta.site}
                    </p>
                    <h4 className="mt-1 font-heading text-base font-extrabold tracking-tight text-white sm:text-lg">
                      {meta.title}
                    </h4>
                    <p className="mt-1.5 text-[11px] font-medium text-white/65 sm:text-xs">
                      MARBLEX Construction Chemical · Field verified
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Lightbox Modal for Gallery Images */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 backdrop-blur-md animate-fadeIn sm:p-8"
          onClick={() => setPreviewImage(null)}
        >
          <div
            className="relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-slate-950 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3.5 text-white sm:px-6 sm:py-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-300/90">Site Inspection</p>
                <span className="text-sm font-bold tracking-wide">MARBLEX Project Proof</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
              >
                <CloseRoundedIcon sx={{ fontSize: 20 }} />
              </button>
            </div>
            <div className="flex items-center justify-center overflow-auto bg-black/50 p-2 sm:p-4">
              <img
                src={previewImage}
                alt="Enlarged Project Preview"
                className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-lg"
              />
            </div>
          </div>
        </div>
      )}

      {/* 11. Contractor & Engineer Testimonials */}
      <section className="relative mt-16 overflow-hidden sm:mt-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,_rgba(10,61,82,0.08),_transparent_60%)] dark:bg-[radial-gradient(ellipse_at_top,_rgba(56,189,248,0.08),_transparent_60%)]" />

        <div className="relative z-10 mx-auto mb-6 max-w-3xl px-1 text-center sm:mb-10">
          <div className="mb-3.5 inline-flex items-center gap-2 rounded-full border border-[#0a3d52]/15 bg-gradient-to-r from-[#0a3d52]/10 via-white to-[#ff6b4a]/10 px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#0a3d52] dark:border-sky-400/25 dark:from-sky-400/10 dark:via-transparent dark:to-[#ff6b4a]/10 dark:text-sky-300 sm:text-xs">
            <BusinessOutlinedIcon sx={{ fontSize: 15 }} />
            Client Endorsements
          </div>
          <h3 className="font-heading text-[1.55rem] font-extrabold leading-tight tracking-tight text-[#0a3d52] dark:text-white sm:text-4xl lg:text-[2.35rem]">
            Trusted by Pakistan&apos;s Leading Contractors
          </h3>
          <p className="mx-auto mt-3 max-w-2xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Verified field feedback from directors, consultants, and plant engineers — live from the MARBLEX review database.
          </p>
        </div>

        {!reviewsLoading && clientReviews.length > 0 && (
          <div className="relative z-10 mb-5 flex flex-wrap items-center justify-center gap-2.5 sm:mb-7 sm:gap-3">
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-sm dark:border-slate-700 dark:bg-[#0c222e]">
              <StarRoundedIcon sx={{ fontSize: 18, color: "#ff6b4a" }} />
              <span className="font-heading text-sm font-extrabold text-[#0a3d52] dark:text-white">{reviewsAvgRating}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg rating</span>
            </div>
            <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200/90 bg-white px-3.5 py-2 shadow-sm dark:border-slate-700 dark:bg-[#0c222e]">
              <span className="font-heading text-sm font-extrabold text-[#0a3d52] dark:text-white">{clientReviews.length}</span>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Verified reviews</span>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewForm((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl border border-[#0a3d52]/20 bg-[#0a3d52] px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#0c4a63] dark:border-sky-400/30 dark:bg-sky-600"
            >
              <StarRoundedIcon sx={{ fontSize: 15 }} />
              {showReviewForm ? "Close form" : "Share review"}
            </button>
          </div>
        )}

        {showReviewForm && (
          <form
            onSubmit={handleSubmitClientReview}
            className="relative z-10 mx-auto mb-8 max-w-2xl rounded-[1.5rem] border border-slate-200/90 bg-white p-4 shadow-[0_12px_32px_-20px_rgba(10,61,82,0.35)] dark:border-slate-800 dark:bg-[#0c222e] sm:p-6"
          >
            <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.16em] text-slate-400">
              Submit review · Admin approval required before publish
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["name", "Full name", true],
                ["role", "Role / Title", true],
                ["company", "Company / Project", true],
                ["email", "Email (optional)", false],
                ["phone", "Phone (optional)", false],
              ].map(([key, label, required]) => (
                <input
                  key={key}
                  value={reviewForm[key]}
                  onChange={(e) => setReviewForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={label}
                  required={required}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52] dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
                />
              ))}
              <select
                value={reviewForm.rating}
                onChange={(e) => setReviewForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52] dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
              >
                {[5, 4, 3, 2, 1].map((n) => (
                  <option key={n} value={n}>
                    {n} Star{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={reviewForm.quote}
              onChange={(e) => setReviewForm((f) => ({ ...f, quote: e.target.value }))}
              placeholder="Share your on-site experience with MARBLEX systems..."
              required
              rows={4}
              maxLength={800}
              className="mt-3 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-[#0a3d52] dark:border-slate-700 dark:bg-slate-900/50 dark:text-white"
            />
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] text-slate-400">
                {reviewFeedback || "Reviews appear on this page after admin approval."}
              </p>
              <button
                type="submit"
                disabled={reviewSubmitting}
                className="rounded-xl bg-[#0a3d52] px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white disabled:opacity-60 dark:bg-sky-600"
              >
                {reviewSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        {reviewsLoading ? (
          <div className="-mx-3 flex gap-3.5 overflow-hidden px-3 sm:mx-0 sm:px-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-64 w-[min(86vw,22rem)] shrink-0 animate-pulse rounded-[1.5rem] bg-slate-100 dark:bg-slate-800/60 sm:w-[calc((100%-2.5rem)/3)]" />
            ))}
          </div>
        ) : clientReviews.length ? (
          <div className="relative z-10">
            <div className="mb-3 flex items-center justify-between gap-3 px-0.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                <span className="sm:hidden">Swipe reviews</span>
                <span className="hidden sm:inline">Contractor voice</span>
              </p>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-bold text-[#0a3d52] dark:text-sky-300">
                  {String(activeReviewIndex + 1).padStart(2, "0")} / {String(clientReviews.length).padStart(2, "0")}
                </span>
                <div className="hidden items-center gap-1.5 sm:flex">
                  <button
                    type="button"
                    aria-label="Previous review"
                    onClick={() => scrollReviewsTo(Math.max(0, activeReviewIndex - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0a3d52] transition hover:border-[#0a3d52]/40 dark:border-slate-700 dark:bg-[#0c222e] dark:text-sky-300"
                  >
                    <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next review"
                    onClick={() => scrollReviewsTo(Math.min(clientReviews.length - 1, activeReviewIndex + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-white text-[#0a3d52] transition hover:border-[#0a3d52]/40 dark:border-slate-700 dark:bg-[#0c222e] dark:text-sky-300"
                  >
                    <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                  </button>
                </div>
              </div>
            </div>

            <div
              ref={reviewsTrackRef}
              data-lenis-prevent-touch
              onScroll={handleReviewsScroll}
              className="-mx-3 flex snap-x snap-mandatory gap-3.5 overflow-x-auto overscroll-x-contain scroll-px-3 px-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:scroll-px-1 sm:px-1 lg:gap-5"
            >
              {clientReviews.map((item, idx) => {
                const accent =
                  idx % 3 === 0
                    ? "from-[#0a3d52] to-[#1a6b88]"
                    : idx % 3 === 1
                      ? "from-[#ff6b4a] to-[#e04520]"
                      : "from-emerald-600 to-teal-600";
                return (
                  <article
                    key={item._id}
                    data-review-card
                    className="no-shimmer group relative flex w-[min(88vw,22.5rem)] shrink-0 snap-center flex-col overflow-hidden rounded-[1.6rem] border border-slate-200/90 bg-white p-5 shadow-[0_14px_36px_-22px_rgba(10,61,82,0.45)] transition duration-300 hover:-translate-y-1 hover:border-[#0a3d52]/25 hover:shadow-[0_24px_48px_-24px_rgba(10,61,82,0.5)] dark:border-slate-800 dark:bg-[#0c222e] sm:w-[min(48%,22rem)] lg:w-[calc((100%-2.5rem)/3)]"
                  >
                    <div className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r ${accent}`} />
                    <FormatQuoteRoundedIcon
                      className="pointer-events-none absolute -right-1 top-3 text-slate-100 dark:text-slate-800/80"
                      sx={{ fontSize: 64 }}
                    />

                    <div className="relative mb-4 flex items-start justify-between gap-2">
                      <div className="flex items-center gap-0.5 text-[#ff6b4a]">
                        {Array.from({ length: Math.max(1, Math.min(5, Number(item.rating) || 5)) }).map((_, r) => (
                          <StarRoundedIcon key={r} sx={{ fontSize: 17 }} />
                        ))}
                      </div>
                      <span className="rounded-full border border-emerald-200/80 bg-emerald-50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-700/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                        Verified
                      </span>
                    </div>

                    <p className="relative flex-1 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-[13.5px]">
                      &ldquo;{item.quote}&rdquo;
                    </p>

                    <div className="relative mt-5 flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-sm font-black text-white shadow-md`}
                      >
                        {(item.name || "M").charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <h5 className="truncate font-heading text-[13px] font-extrabold text-[#0a3d52] dark:text-white">
                          {item.name}
                        </h5>
                        <p className="truncate text-[11px] font-bold text-[#ff6b4a]">{item.role}</p>
                        <p className="truncate text-[10px] font-medium text-slate-400">{item.company}</p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5">
              {clientReviews.map((item, idx) => (
                <button
                  key={item._id}
                  type="button"
                  aria-label={`Go to review ${idx + 1}`}
                  onClick={() => scrollReviewsTo(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === activeReviewIndex
                      ? "w-6 bg-[#0a3d52] dark:bg-sky-400"
                      : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-slate-600"
                  }`}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="relative z-10 rounded-[1.5rem] border border-dashed border-slate-200 bg-white/70 px-6 py-12 text-center dark:border-slate-700 dark:bg-[#0c222e]/70">
            <p className="text-sm font-semibold text-[#0a3d52] dark:text-white">No published reviews yet</p>
            <p className="mt-1 text-xs text-slate-500">Be the first contractor to share field performance feedback.</p>
            <button
              type="button"
              onClick={() => setShowReviewForm(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#0a3d52] px-4 py-2 text-[11px] font-bold uppercase tracking-wider text-white"
            >
              Share review
            </button>
          </div>
        )}
      </section>

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
          <div className="glowing-border-wrap-rounded w-full sm:w-auto">
            <div className="glowing-border-beam" />
            <div className="glowing-border-body w-full">
              <a
                href="https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20need%20technical%20consultation%20for%20my%20project."
                target="_blank"
                rel="noreferrer"
                className="shimmer-btn w-full sm:w-auto py-3.5 px-6 bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-[#ff6b4a]/30 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <WhatsAppIcon sx={{ fontSize: 18 }} />
                <span>Consult on WhatsApp</span>
              </a>
            </div>
          </div>

          <a
            href="tel:03084585792"
            className="shimmer-btn w-full sm:w-auto py-3.5 px-6 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl border border-white/20 transition-all duration-200 flex items-center justify-center gap-2"
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

    </div>
  );
};
