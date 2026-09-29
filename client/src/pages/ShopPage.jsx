import { useCallback, useEffect, useState, useRef, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { http } from "../api/http";
import { HeroBanner } from "../components/HeroBanner";
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

// Industrial Solutions Matrix
const industrialDivisions = [
  {
    title: "Liquid Waterproofing",
    subtitle: "Seamless Elastomeric Polymer Barrier",
    desc: "100% seamless, UV-stable liquid membranes that bridge structural micro-cracks and withstand ponding water.",
    icon: WaterDropOutlinedIcon,
    badge: "ASTM D-6083",
    color: "#0a3d52",
    accent: "#ff6b4a",
  },
  {
    title: "Industrial Flooring",
    subtitle: "Heavy-Duty Epoxy & Polyurea",
    desc: "Abrasion-resistant, chemical-proof epoxy systems designed for manufacturing plants, warehouses, and hospitals.",
    icon: FormatPaintOutlinedIcon,
    badge: "Heavy Traffic",
    color: "#0c313d",
    accent: "#38bdf8",
  },
  {
    title: "Rubber Waterstops",
    subtitle: "Hydrostatic Joint Sealing Systems",
    desc: "Vulcanized high-elongation rubber profiles engineered for hydrostatic head pressure in tunnels, dams, and foundations.",
    icon: ConstructionOutlinedIcon,
    badge: "Hydrostatic Head",
    color: "#082a38",
    accent: "#10b981",
  },
  {
    title: "Admixtures & Grouts",
    subtitle: "High-Strength Structural Repair",
    desc: "Non-shrink precision grouts, plasticizers, and waterproofing crystallizers enhancing concrete density.",
    icon: ScienceOutlinedIcon,
    badge: "High Strength",
    color: "#0f3c4b",
    accent: "#f59e0b",
  },
];

// 4-Step Engineering Methodology
const engineeringSteps = [
  {
    step: "01",
    title: "Substrate Diagnostic",
    desc: "Core moisture scanning, tensile surface profiling, and structural crack mapping before any chemical compounding.",
  },
  {
    step: "02",
    title: "Deep Primer Penetration",
    desc: "Application of low-viscosity epoxy or acrylic primer to consolidate porous concrete and ensure 2.5+ MPa adhesion.",
  },
  {
    step: "03",
    title: "Multilayer Formulation",
    desc: "Deployment of seamless elastomeric liquid membranes, vulcanized waterstops, or high-build polyurea coatings.",
  },
  {
    step: "04",
    title: "Hydrostatic Quality Sign-Off",
    desc: "72-hour continuous water flooding test, thermal imaging audit, and official 10-Year MARBLEX warranty issuance.",
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

export const ShopPage = ({ addToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState(() => globalProductsCache || demoProducts);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(() => !globalProductsCache);
  const scrollRef = useScrollReveal();
  
  const catalogHeaderRef = useRef(null);
  const filtersRef = useRef(null);
  const productsGridRef = useRef(null);

  // Material Calculator State
  const [calcArea, setCalcArea] = useState(1500);
  const [calcSurface, setCalcSurface] = useState("roof");

  const handleOpenProduct = useCallback(
    (item) => {
      navigate(`/product/${item._id}`, { state: { product: item } });
    },
    [navigate]
  );

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
            duration: 0.6,
            ease: "power2.out",
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
            duration: 0.5,
            delay: 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: filtersRef.current,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (productsGridRef.current && productsGridRef.current.children.length > 0) {
        gsap.fromTo(
          productsGridRef.current.children,
          { opacity: 0, y: 45, scale: 0.95 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.55,
            stagger: 0.06,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: productsGridRef.current,
              start: "top 85%",
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

      {/* 2. Enterprise Trust & Metrics Marquee Strip */}
      <div className="my-10 sm:my-14 bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-[#0a3d52]/15 border border-[#1b556e]/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b4a]/15 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 divide-y md:divide-y-0 md:divide-x divide-white/10 text-center">
          
          <div className="pt-4 md:pt-0 flex flex-col items-center">
            <span className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              15<span className="text-[#ff6b4a]">+</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 uppercase tracking-wider">
              Years Industrial Mastery
            </span>
            <span className="text-[11px] text-slate-300 font-normal mt-0.5">
              Formulating Since 2011
            </span>
          </div>

          <div className="pt-4 md:pt-0 flex flex-col items-center md:pl-6">
            <span className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              500<span className="text-[#ff6b4a]">+</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 uppercase tracking-wider">
              Mega Projects Sealed
            </span>
            <span className="text-[11px] text-slate-300 font-normal mt-0.5">
              Dams, High-Rises & Plants
            </span>
          </div>

          <div className="pt-4 md:pt-0 flex flex-col items-center md:pl-6">
            <span className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              100<span className="text-[#ff6b4a]">%</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 uppercase tracking-wider">
              ISO-9001 Certified
            </span>
            <span className="text-[11px] text-slate-300 font-normal mt-0.5">
              ASTM Grade Tested Formulations
            </span>
          </div>

          <div className="pt-4 md:pt-0 flex flex-col items-center md:pl-6">
            <span className="text-3xl sm:text-5xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              10<span className="text-[#ff6b4a]"> Yrs</span>
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-200 mt-1 uppercase tracking-wider">
              Warranty Guarantee
            </span>
            <span className="text-[11px] text-slate-300 font-normal mt-0.5">
              Zero Moisture Permeation
            </span>
          </div>

        </div>
      </div>

      {/* 3. Core Industrial Engineering Divisions */}
      <div className="my-14 sm:my-20">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff6b4a]/20">
            <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 16 }} /> Engineering Disciplines
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white font-heading tracking-tight">
            Specialized Chemical & Rubber Capabilities
          </h2>
          <p className="text-[#565e69] dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Tailored industrial chemical compounds engineered to withstand severe thermal expansion, structural hydrostatic load, and corrosive atmospheric conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {industrialDivisions.map((div, i) => {
            const IconComponent = div.icon;
            return (
              <div
                key={i}
                className="group relative bg-white dark:bg-[#0c222e] rounded-3xl p-6 border border-[#e0e6ed] dark:border-slate-800 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-12 h-12 rounded-2xl bg-[#0a3d52]/5 dark:bg-white/10 flex items-center justify-center text-[#0a3d52] dark:text-[#38bdf8] group-hover:bg-[#ff6b4a] group-hover:text-white transition-colors duration-300">
                      <IconComponent sx={{ fontSize: 24 }} />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {div.badge}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-[#0a3d52] dark:text-white font-heading mb-1 group-hover:text-[#ff6b4a] transition-colors">
                    {div.title}
                  </h3>
                  <p className="text-xs font-bold text-[#ff6b4a] mb-2.5">
                    {div.subtitle}
                  </p>
                  <p className="text-xs text-[#565e69] dark:text-slate-300 leading-relaxed font-normal">
                    {div.desc}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-[#0a3d52] dark:text-[#38bdf8] group-hover:text-[#ff6b4a] transition-colors">
                  <span>Explore Formulation</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* 4. Clean Catalog Page Header */}
      <div 
        ref={catalogHeaderRef}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6 pt-6 pb-4 gap-5 border-b border-[#e0e6ed] dark:border-slate-800"
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
      <div ref={productsGridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 items-stretch">
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
            <ProductCard
              key={product._id || idx}
              product={product}
              index={idx}
              onAddToCart={addToCart}
              onOpenProduct={handleOpenProduct}
            />
          ))
        )}
      </div>

      {/* 7. Interactive Material Coverage & Quantity Estimator */}
      <div className="mt-20 sm:mt-28 bg-gradient-to-br from-[#0c2a38] via-[#09222e] to-[#061820] rounded-3xl p-6 sm:p-10 lg:p-12 text-white border border-[#1b4d63] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#ff6b4a]/10 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Calculator Inputs */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/20 text-[#ff8c73] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border border-[#ff6b4a]/30">
              <CalculateOutlinedIcon sx={{ fontSize: 16 }} /> Project Quantity Estimator
            </div>
            
            <h3 className="text-2xl sm:text-4xl font-black text-white font-heading tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Calculate Chemical Coverage For Your Project
            </h3>
            
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
              Select your structural application type and enter the surface area in square feet to instantly compute material requirement and estimated drum packaging.
            </p>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Surface Application Type
                </label>
                <select
                  value={calcSurface}
                  onChange={(e) => setCalcSurface(e.target.value)}
                  className="w-full bg-[#113545] border border-[#1b556e] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold outline-none focus:border-[#ff6b4a] transition"
                >
                  <option value="roof">Concrete Roof / Terrace Waterproofing</option>
                  <option value="basement">Basement & Sub-Structure Retaining Wall</option>
                  <option value="flooring">Industrial Epoxy Heavy-Traffic Floor</option>
                  <option value="tank">Water Reservoir & Swimming Pool</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                  Total Project Area (Sq. Ft)
                </label>
                <input
                  type="number"
                  min={50}
                  step={50}
                  value={calcArea}
                  onChange={(e) => setCalcArea(e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full bg-[#113545] border border-[#1b556e] rounded-xl px-4 py-3 text-xs sm:text-sm text-white font-semibold outline-none focus:border-[#ff6b4a] transition"
                />
              </div>

            </div>
          </div>

          {/* Right Live Computation Card */}
          <div className="lg:col-span-5 bg-white dark:bg-[#0e2735] text-slate-900 dark:text-white rounded-2xl p-6 sm:p-8 border border-white/10 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b4a]">
                Estimated Specification
              </span>
              <span className="text-xs font-extrabold text-[#0a3d52] dark:text-[#38bdf8]">
                Dual-Coat Standard
              </span>
            </div>

            <div className="space-y-3 text-xs sm:text-sm font-semibold">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">System Formula:</span>
                <span className="font-bold text-[#0a3d52] dark:text-white text-right">{calculatedEstimate.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Total Chemical Volume:</span>
                <span className="font-extrabold text-[#ff6b4a] text-base">{calculatedEstimate.chemicalKg.toLocaleString()} Kg / Liters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Substrate Primer:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{calculatedEstimate.primerLiters.toLocaleString()} Liters</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-300">Standard Packaging:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">~{calculatedEstimate.drumsCount} Industrial Drums (20Kg)</span>
              </div>
            </div>

            <a
              href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20calculated%20my%20project%20area%20as%20${calcArea}%20sq.ft%20for%20${calcSurface}%20application.%20Please%20provide%20official%20quotation.`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-3.5 px-4 bg-[#ff6b4a] hover:bg-[#e05333] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-[#ff6b4a]/25 transition-all duration-200"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              <span>Request Official Quotation On WhatsApp</span>
            </a>
          </div>

        </div>
      </div>

      {/* 8. Before & After Transformation Section (Redesigned & Upgraded) */}
      <div className="mt-20 sm:mt-28 scroll-reveal">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff6b4a]/20">
            <CompareArrowsIcon sx={{ fontSize: 16 }} /> Field Proof & Case Studies
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white mb-3 font-heading">
            Proven Industrial Results
          </h3>
          <p className="text-[#565e69] dark:text-slate-300 font-normal text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed">
            Witness how MARBLEX advanced elastomeric coatings and chemical formulations protect concrete infrastructure from severe water ingress and structural degradation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {beforeAfterPairs.map((pair, idx) => (
            <div key={idx} className="group scroll-reveal bg-white dark:bg-[#0c222e] p-5 sm:p-7 rounded-3xl border border-[#e0e6ed] dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              
              <div className="flex flex-col sm:flex-row gap-3.5 mb-5">
                {/* Before Image */}
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner">
                  <img src={pair.before} alt="Before" loading="lazy" decoding="async" className="w-full h-[220px] sm:h-[250px] object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 left-3 bg-[#0a3d52]/90 backdrop-blur-md text-white text-[9.5px] font-extrabold px-3 py-1 rounded-lg uppercase shadow-sm">
                    ⚠️ Unprotected Substrate
                  </div>
                </div>

                {/* After Image */}
                <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-[#ff6b4a]/40 shadow-md">
                  <img src={pair.after} alt="After" loading="lazy" decoding="async" className="w-full h-[220px] sm:h-[250px] object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] text-white text-[9.5px] font-extrabold px-3 py-1 rounded-lg uppercase shadow-md flex items-center gap-1">
                    <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> MARBLEX Treated
                  </div>
                </div>
              </div>

              <div className="space-y-2 px-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-extrabold text-[#0a3d52] dark:text-white group-hover:text-[#ff6b4a] transition-colors font-heading">
                    {pair.title}
                  </h4>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                    +300% Lifespan
                  </span>
                </div>
                <p className="text-[#565e69] dark:text-slate-300 text-xs sm:text-[13px] leading-relaxed font-normal">
                  {pair.description}
                </p>
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* 9. 4-Stage Application Methodology */}
      <div className="mt-20 sm:mt-28 bg-white dark:bg-[#0c222e] rounded-3xl p-6 sm:p-10 lg:p-12 border border-[#e0e6ed] dark:border-slate-800 shadow-sm">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-4 py-1.5 rounded-full text-xs font-bold tracking-widest uppercase mb-3 border border-[#ff6b4a]/20">
            <FactCheckOutlinedIcon sx={{ fontSize: 16 }} /> Standard Operating Procedure
          </div>
          <h3 className="text-2xl sm:text-4xl font-black text-[#0a3d52] dark:text-white font-heading tracking-tight">
            4-Stage Certified Engineering Methodology
          </h3>
          <p className="text-[#565e69] dark:text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
            Every MARBLEX site application adheres to rigorous laboratory testing, moisture content thresholds, and dual-layer quality audit protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {engineeringSteps.map((step, idx) => (
            <div
              key={idx}
              className="bg-slate-50 dark:bg-[#0e2735] p-6 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 relative flex flex-col justify-between hover:border-[#ff6b4a] transition-colors"
            >
              <div>
                <span className="text-4xl font-black text-[#0a3d52]/20 dark:text-white/10 font-heading block mb-3">
                  {step.step}
                </span>
                <h4 className="text-base font-extrabold text-[#0a3d52] dark:text-white font-heading mb-2">
                  {step.title}
                </h4>
                <p className="text-xs text-[#565e69] dark:text-slate-300 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center gap-1.5 text-[11px] font-bold text-[#ff6b4a]">
                <CheckCircleRoundedIcon sx={{ fontSize: 14 }} /> Quality Verified
              </div>
            </div>
          ))}
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
              Critical infrastructure, commercial high-rises, and industrial facilities engineered with MARBLEX.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[#0a3d52] dark:text-[#ff8c73] bg-white dark:bg-[#0c222e] px-4 py-2.5 rounded-xl border border-[#e0e6ed] dark:border-slate-700 font-bold text-xs sm:text-sm shadow-sm shrink-0">
            <WorkspacePremiumOutlinedIcon fontSize="small" />
            <span className="uppercase tracking-wide">500+ Sites Protected</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
          {galleryImages.map((img, idx) => (
            <div key={idx} className={`relative rounded-3xl overflow-hidden group border border-[#e0e6ed] dark:border-slate-800 shadow-sm scroll-reveal ${idx === 0 || idx === 5 ? 'md:col-span-2 md:row-span-2' : ''}`}>
              <img 
                src={img} 
                alt={`Showcase ${idx}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover min-h-[190px] transition-transform duration-700 group-hover:scale-108" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/90 via-[#0a3d52]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white">
                <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#ff8c73]">Site Verification</span>
                <span className="font-extrabold text-sm sm:text-base font-heading">MARBLEX Industrial Project #{idx + 101}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

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
