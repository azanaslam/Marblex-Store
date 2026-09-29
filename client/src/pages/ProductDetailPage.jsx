import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import StarIcon from "@mui/icons-material/Star";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import { http } from "../api/http";
import { ProductDetailSkeleton } from "../components/LoaderSkeleton";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import gsap from "gsap";

export const ProductDetailPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [moreProducts, setMoreProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [selectedMaterial, setSelectedMaterial] = useState("Polished Marble Composite");
  const [selectedColor, setSelectedColor] = useState("Carrara White");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [specsOpen, setSpecsOpen] = useState(false);
  const [loading, setLoading] = useState(!location.state?.product);
  const [addedToast, setAddedToast] = useState(false);
  const containerRef = useRef(null);

  // High-res gallery images
  const defaultGallery = [
    "/products/Banner1.jpeg",
    "/products/Banner2.jpeg",
    "/products/Banner3.jpeg",
    "/products/Banner4.jpeg",
  ];

  const galleryImages = (product?.imageUrl 
    ? [product.imageUrl, ...(product.extraImages || []), ...defaultGallery]
    : defaultGallery
  ).filter((v, i, a) => typeof v === "string" && v.trim() && a.indexOf(v) === i).slice(0, 4);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setQuantity(1);
    setSelectedImageIndex(0);

    if (location.state?.product && location.state.product._id === id) {
      setProduct(location.state.product);
      setLoading(false);
      return () => { mounted = false; };
    }

    if (!id || product?._id === id) {
      setLoading(false);
      return () => { mounted = false; };
    }

    setLoading(true);
    http
      .get(`/products/${id}`)
      .then((res) => {
        if (mounted) {
          setProduct(res.data || null);
        }
      })
      .catch(() => {
        if (mounted) setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => { mounted = false; };
  }, [id, product?._id, location.state]);

  useEffect(() => {
    http
      .get("/products")
      .then((res) => {
        const list = Array.isArray(res.data) ? res.data : [];
        const filtered = list.filter((x) => String(x._id) !== String(id));
        if (filtered.length >= 4) {
          setMoreProducts(filtered.slice(0, 4));
        } else {
          // Fallback demo related items if less than 4 in DB
          setMoreProducts([
            ...filtered,
            { _id: "rel-1", name: "Basalt Grey Tiles", price: 4000, reviewsCount: 518, rating: 4.9, imageUrl: "/products/Banner4.jpeg" },
            { _id: "rel-2", name: "Oak Wood-Effect Flooring", price: 4000, reviewsCount: 128, rating: 4.9, imageUrl: "/products/Banner1.jpeg" },
            { _id: "rel-3", name: "Installation Kit", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner2.jpeg" },
            { _id: "rel-4", name: "Maintenance Solution", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner3.jpeg" },
          ].slice(0, 4));
        }
      })
      .catch(() => {
        setMoreProducts([
          { _id: "rel-1", name: "Basalt Grey Tiles", price: 4000, reviewsCount: 518, rating: 4.9, imageUrl: "/products/Banner4.jpeg" },
          { _id: "rel-2", name: "Oak Wood-Effect Flooring", price: 4000, reviewsCount: 128, rating: 4.9, imageUrl: "/products/Banner1.jpeg" },
          { _id: "rel-3", name: "Installation Kit", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner2.jpeg" },
          { _id: "rel-4", name: "Maintenance Solution", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner3.jpeg" },
        ]);
      });
  }, [id]);

  useEffect(() => {
    if (!loading && product && containerRef.current) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".anim-reveal"),
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power2.out" }
      );
    }
  }, [loading, product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity, selectedMaterial, selectedColor });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello MARBLEX, I would like to inquire about ${product?.name || "Entryway Flooring System"} (Material: ${selectedMaterial}, Color: ${selectedColor}, Qty: ${quantity}, Price: PKR ${product?.price || 4000}). Please provide an instant quotation.`
    );
    window.open(`https://wa.me/923481116611?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  const productName = product?.name || "Entryway Flooring";
  const displayTitle = productName.toLowerCase().includes("system")
    ? productName
    : `${productName} System - Carrara Elegance (8mm)`;

  return (
    <div ref={containerRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* 1. Top Navigation & Breadcrumb Header */}
      <div className="anim-reveal flex items-center justify-between flex-wrap gap-4 pt-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-semibold">
            <Link to="/" className="hover:text-[#ff6b4a] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-[#0a3d52] dark:text-sky-400 uppercase tracking-wider">{product?.category || "Engineered Solutions"}</span>
          </div>
          <h1 
            className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0f1929] dark:text-white tracking-tight leading-none"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            {productName.toLowerCase().includes("system") ? productName : `Carrara Elegance ${productName} System`}
          </h1>
        </div>

        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0a3d52] dark:text-slate-200 hover:text-[#ff6b4a] bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> Back to Catalog
        </button>
      </div>

      {/* 2. Main Two-Column Product Hero Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* ==================== LEFT COLUMN: Dual Image Stage + Thumbnails + Quality Seal ==================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Dual Preview Hero Stage (Portrait Scene + Main Showcase) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Left Portrait Application Scene */}
            <div className="sm:col-span-5 bg-slate-100 dark:bg-slate-800 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs relative min-h-[280px] sm:min-h-[400px] group">
              <img
                src={galleryImages[1] || galleryImages[0]}
                alt="Architectural Application"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
              />
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-[9.5px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
                Site Application
              </div>
            </div>

            {/* Right Main Perspective Room Preview */}
            <div className="sm:col-span-7 bg-white dark:bg-[#0c222e] rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs relative min-h-[280px] sm:min-h-[400px] flex items-center justify-center group">
              <img
                src={currentImage}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
              />
              <div className="absolute top-3 right-3 bg-emerald-700/80 backdrop-blur-md text-white text-[9.5px] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> Verified Quality
              </div>
            </div>
          </div>

          {/* Gallery Thumbnails Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Product Perspectives ({galleryImages.length})</span>
              <span className="text-slate-400 font-normal text-[11px]">Click to inspect angle</span>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden border-2 bg-white dark:bg-[#0c222e] transition-all p-0.5 relative group cursor-pointer ${
                    selectedImageIndex === idx
                      ? "border-[#ff6b4a] shadow-md ring-2 ring-[#ff6b4a]/20 scale-102"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Left Column Bottom: MARBLEX Quality Assurance Box (Balanced & Enhanced with Rich SVG Vector Badges) */}
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#0a3d52]/5 via-white to-slate-50/80 dark:from-[#0c222e] dark:via-[#091b24] dark:to-[#0c222e] border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
                <div className="w-7 h-7 rounded-lg bg-[#0a3d52]/10 dark:bg-sky-400/10 flex items-center justify-center text-[#0a3d52] dark:text-sky-400">
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 17 }} />
                </div>
                <span>MARBLEX Engineering Assurance</span>
              </div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Industrial Standard
              </span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* 1. 10-Year Certified Warranty */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-emerald-500/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L3 6V12C3 17.5228 6.84278 22.5028 12 23.95C17.1572 22.5028 21 17.5228 21 12V6L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-xs leading-tight">10-Year Warranty</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">Certified structural life</span>
                </div>
              </div>

              {/* 2. ASTM D412 Lab Tested */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-sky-500/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M7 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2"/>
                    <circle cx="9.5" cy="17.5" r="1" fill="currentColor" />
                    <circle cx="14" cy="16.5" r="0.8" fill="currentColor" />
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-xs leading-tight">ASTM D412 Tested</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">Lab certified metrics</span>
                </div>
              </div>

              {/* 3. Zero-VOC Eco Formulation */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-emerald-500/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20.24 12.24C21.09 7.74 18.06 4.14 13.9 3.09C9.74 2.04 5.34 3.73 3.5 7.5C1.66 11.27 2.76 16.35 6.13 18.97C9.5 21.59 14.54 21.24 17.5 18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    <path d="M4 20L11.5 12.5C13.5 10.5 16.5 9.5 19.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-xs leading-tight">Zero-VOC Eco Safe</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">Odorless & non-toxic</span>
                </div>
              </div>

              {/* 4. Fast Nationwide Dispatch */}
              <div className="flex items-center gap-3 p-2.5 rounded-2xl bg-white dark:bg-[#0e2735] border border-slate-200/80 dark:border-slate-700/60 shadow-2xs hover:border-[#ff6b4a]/40 transition-colors group">
                <div className="w-9 h-9 rounded-xl bg-[#ff6b4a]/10 text-[#ff6b4a] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 4H15V16H1V4Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 8H19L22 11V16H15V8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    <circle cx="5.5" cy="18.5" r="2.2" stroke="currentColor" strokeWidth="1.75"/>
                    <circle cx="18.5" cy="18.5" r="2.2" stroke="currentColor" strokeWidth="1.75"/>
                  </svg>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white text-xs leading-tight">Express Dispatch</span>
                  <span className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">Nationwide safe transit</span>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN: Product Info, Variants, Pricing & Buy CTAs ==================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Brand & Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[#ff6b4a]/10 text-[#ff6b4a] px-3 py-1 rounded-full text-[10.5px] font-extrabold uppercase tracking-wider border border-[#ff6b4a]/20">
              <ShieldOutlinedIcon sx={{ fontSize: 13 }} />
              <span>Industrial Certified Grade</span>
            </div>

            <h2 
              className="text-2xl sm:text-3xl lg:text-[30px] font-black text-slate-900 dark:text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              MARBLEX {displayTitle}
            </h2>

            {/* Reviews Rating & Stock Status */}
            <div className="flex items-center gap-3 pt-0.5 text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 16 }} />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">4.9</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 dark:text-slate-400 underline cursor-pointer">128 contractor reviews</span>
              <span className="ml-auto inline-flex items-center gap-1 text-[10.5px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/80 dark:border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> In Stock & Ready
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2 p-4 rounded-2xl bg-slate-50 dark:bg-[#0c222e] border border-slate-200/80 dark:border-slate-800">
            <span className="text-2xl sm:text-3xl font-black text-[#0a3d52] dark:text-sky-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              PKR {Number(product?.price ?? 4000).toLocaleString()}
            </span>
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              / standard unit (Dual-Coat Coverage)
            </span>
          </div>

          {/* Short Pitch Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {product?.description || "High-performance engineered polymer and chemical formulation providing exceptional hydrostatic sealing, chemical barrier protection, and high-impact structural resilience."}
          </p>

          {/* Dropdown Selectors (Material & Color) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* Material Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Material Specification</label>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#0c222e] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:border-[#ff6b4a] cursor-pointer"
                >
                  <option value="Polished Marble Composite">Polished Marble Composite</option>
                  <option value="High-Build Elastomeric">High-Build Elastomeric Liquid</option>
                  <option value="Reinforced Vulcanized Compound">Reinforced Vulcanized Compound</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Color Tone</label>
              <div className="relative">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#0c222e] border border-slate-300 dark:border-slate-700 rounded-xl px-4 py-3 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:border-[#ff6b4a] cursor-pointer"
                >
                  <option value="Carrara White">Carrara White</option>
                  <option value="Basalt Grey">Basalt Grey</option>
                  <option value="Desert Sand">Desert Sand</option>
                  <option value="Slate Black">Slate Black</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons Row */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity:</span>
              
              {/* Quantity Stepper */}
              <div className="inline-flex items-center bg-white dark:bg-[#0c222e] border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden h-10 w-32 shadow-2xs">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-10 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </button>
                <div className="flex-1 text-center font-bold text-sm text-slate-900 dark:text-white">
                  {quantity}
                </div>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-10 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            {/* Buttons Row: Add to Cart (Slate Navy) + Instant WhatsApp Quote (Crimson) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 pt-1">
              <button
                onClick={handleAddToCart}
                className="sm:col-span-5 bg-[#0a3d52] hover:bg-[#082e3e] active:bg-[#06212d] text-white py-3.5 px-5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0a3d52]/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="sm:col-span-7 bg-[#ff6b4a] hover:bg-[#e05333] active:bg-[#c94528] text-white py-3 px-5 rounded-2xl shadow-md shadow-[#ff6b4a]/25 transition-all flex items-center gap-3 text-left active:scale-95 cursor-pointer"
              >
                <WhatsAppIcon sx={{ fontSize: 24 }} className="shrink-0 text-white" />
                <div className="flex flex-col leading-tight">
                  <span className="font-extrabold text-xs uppercase tracking-wide">Instant WhatsApp Quote</span>
                  <span className="text-[10px] text-white/90 font-normal">Technical consultation & pricing</span>
                </div>
              </button>
            </div>

            {/* Added to Cart Notification Toast */}
            {addedToast && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold animate-fadeIn shadow-sm">
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> Added {quantity} unit(s) to cart successfully!
              </div>
            )}
          </div>

          {/* 3 Value Proposition Cards (Custom High-End SVG Vector Badges) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3">
            
            {/* Card 1: Durability 15+ Years */}
            <div className="group relative p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c222e] flex flex-col items-center text-center space-y-2 shadow-xs hover:shadow-lg hover:border-[#10b981]/40 transition-all duration-300 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-xs tracking-tight">Durability 15+ Years</span>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Engineered for heavy traffic & extreme weather resilience
                </p>
              </div>
            </div>

            {/* Card 2: ASTM Certified */}
            <div className="group relative p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c222e] flex flex-col items-center text-center space-y-2 shadow-xs hover:shadow-lg hover:border-[#ff6b4a]/40 transition-all duration-300 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-[#ff6b4a]/10 text-[#ff6b4a] flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75"/>
                  <path d="M15.5 13.5L18 21L12 18.5L6 21L8.5 13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9.5 8.5L11 10L14.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-xs tracking-tight">ASTM & ISO Certified</span>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Meets ASTM F1700 / D412 international lab standards
                </p>
              </div>
            </div>

            {/* Card 3: Waterproof & Stain Resistant */}
            <div className="group relative p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c222e] flex flex-col items-center text-center space-y-2 shadow-xs hover:shadow-lg hover:border-sky-400/40 transition-all duration-300 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18V13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                </svg>
              </div>
              <div>
                <span className="block font-bold text-slate-900 dark:text-white text-xs tracking-tight">100% Waterproof Seal</span>
                <p className="text-[10.5px] text-slate-500 dark:text-slate-400 leading-tight mt-1">
                  Hydrostatic barrier against moisture, spills & chemical stains
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* ==================== 3. Full-Width Dedicated Technical Specifications & Engineering Matrix ==================== */}
      <div className="w-full pt-4">
        <div className="bg-white dark:bg-[#0c222e] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
          
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#0a3d52]/10 dark:bg-sky-400/10 text-[#0a3d52] dark:text-sky-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-[#0a3d52]/20 dark:border-sky-400/20">
                <FactCheckOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Engineering Data Sheet</span>
              </div>
              <h3 
                className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0f1929] dark:text-white tracking-tight"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Technical Specifications & Material Properties
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-normal mt-1">
                Rigorous chemical thresholds, physical dimensions, and application parameters verified by certified laboratory testing.
              </p>
            </div>

            <a
              href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20please%20send%20the%20official%20Technical%20Data%20Sheet%20(TDS)%20for%20${encodeURIComponent(productName)}.`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#0a3d52] hover:bg-[#082e3e] text-white px-5 py-3 rounded-2xl text-xs font-extrabold uppercase tracking-wider shadow-sm transition-all shrink-0"
            >
              <ScienceOutlinedIcon sx={{ fontSize: 18 }} />
              <span>Request Official TDS / Lab Report</span>
            </a>
          </div>

          {/* 2-Column Full Width Specifications Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            
            {/* Panel A: Physical & Material Formulation */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400 pb-1">
                <LayersOutlinedIcon sx={{ fontSize: 17 }} />
                <span>Physical Attributes & Composition</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                      <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                      <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Base Compound:</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-sky-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
                      <circle cx="9" cy="10" r="1.5" fill="currentColor"/>
                      <circle cx="15" cy="10" r="1.5" fill="currentColor"/>
                      <circle cx="12" cy="15" r="1.5" fill="currentColor"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Color Formulation:</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{selectedColor}</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 6H21M3 18H21M7 6V18M17 6V18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Standard Thickness / Profile:</span>
                  </div>
                  <span className="font-bold text-[#0a3d52] dark:text-sky-400">8mm - 12mm Dual-Coat</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-purple-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M21 8V16C21 18.7614 16.9706 21 12 21C7.02944 21 3 18.7614 3 16V8M21 8C21 10.7614 16.9706 13 12 13C7.02944 13 3 10.7614 3 8M21 8C21 5.23858 16.9706 3 12 3C7.02944 3 3 5.23858 3 8" stroke="currentColor" strokeWidth="1.75"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Packaging Unit:</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">20Kg / 200L Industrial Drum</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20.24 12.24C21.09 7.74 18.06 4.14 13.9 3.09C9.74 2.04 5.34 3.73 3.5 7.5C1.66 11.27 2.76 16.35 6.13 18.97C9.5 21.59 14.54 21.24 17.5 18.5" stroke="currentColor" strokeWidth="1.75"/>
                      <path d="M4 20L11.5 12.5" stroke="currentColor" strokeWidth="1.75"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">VOC Emissions:</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">Zero VOC / Low Odor Eco-Safe</span>
                </div>
              </div>
            </div>

            {/* Panel B: Mechanical & Hydrostatic Performance */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400 pb-1">
                <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 17 }} />
                <span>Mechanical & Hydrostatic Matrix</span>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-rose-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Tensile Strength:</span>
                  </div>
                  <span className="font-bold text-[#0a3d52] dark:text-sky-400">&gt; 12.5 MPa (ASTM D412)</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-amber-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M7 16L3 12M3 12L7 8M3 12H21M17 8L21 12M21 12L17 16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Elongation Capacity:</span>
                  </div>
                  <span className="font-bold text-[#0a3d52] dark:text-sky-400">350% - 450% Crack-Bridging</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-cyan-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" stroke="currentColor" strokeWidth="1.75"/>
                      <path d="M12 18.5V14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Hydrostatic Pressure Seal:</span>
                  </div>
                  <span className="font-bold text-[#0a3d52] dark:text-sky-400">Up to 5 Bar (50m Head Pressure)</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 14.76V3.5C14 2.67 13.33 2 12.5 2C11.67 2 11 2.67 11 3.5V14.76C9.79 15.47 9 16.78 9 18.25C9 20.46 10.79 22.25 13 22.25C15.21 22.25 17 20.46 17 18.25C17 16.78 16.21 15.47 15 14.76Z" stroke="currentColor" strokeWidth="1.75"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Service Temperature Range:</span>
                  </div>
                  <span className="font-bold text-slate-800 dark:text-slate-200">-20°C to +85°C Thermal Stability</span>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 text-xs">
                  <div className="flex items-center gap-2.5">
                    <svg className="w-4 h-4 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75"/>
                      <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span className="text-slate-500 dark:text-slate-400 font-medium">Standard Compliance:</span>
                  </div>
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-400">ASTM D412 / BS 8102 / ISO 9001</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* ==================== 4. Full-Width Enterprise Trust & Metrics Marquee Strip ==================== */}
      <div className="w-full pt-2">
        <EnterpriseMetricsBar className="my-6 sm:my-10 w-full" />
      </div>

      {/* ==================== 5. Full-Width Related Products Section ==================== */}
      <div className="w-full pt-2 pb-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b4a]">
              Recommended Solutions
            </span>
            <h3 
              className="text-xl sm:text-2xl font-black text-[#0f1929] dark:text-white tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Related Industrial Formulations & Materials
            </h3>
          </div>
          <button
            onClick={() => navigate("/")}
            className="text-xs font-bold text-[#0a3d52] dark:text-sky-400 hover:underline self-start sm:self-auto cursor-pointer"
          >
            View Complete Catalog →
          </button>
        </div>

        {/* 4-Card Full Width Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {moreProducts.map((item, idx) => (
            <div
              key={item._id || idx}
              onClick={() => {
                navigate(`/product/${item._id}`, { state: { product: item } });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="group cursor-pointer bg-white dark:bg-[#0c222e] border border-slate-200/90 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-2xl hover:border-[#ff6b4a]/40 dark:hover:border-sky-500/40 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
            >
              {/* Product Image Stage with Rank Badge */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 mb-3.5">
                <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#ff6b4a] text-white text-[11px] font-extrabold flex items-center justify-center z-10 shadow-md shadow-[#ff6b4a]/30">
                  {idx + 1}
                </span>
                <img
                  src={item.imageUrl || defaultGallery[idx % defaultGallery.length]}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                  onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Product Details */}
              <div className="space-y-1.5">
                <h5 
                  className="font-bold text-slate-900 dark:text-white text-sm sm:text-base group-hover:text-[#ff6b4a] dark:group-hover:text-sky-400 transition-colors line-clamp-1"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  {item.name}
                </h5>

                {/* Rating & Reviews */}
                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, starIdx) => (
                      <StarIcon key={starIdx} sx={{ fontSize: 13 }} />
                    ))}
                  </div>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[11px]">4.9</span>
                  <span className="text-slate-400 text-[10px]">({item.reviewsCount || 128})</span>
                </div>

                {/* Price & Action */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80">
                  <span className="font-black text-slate-900 dark:text-white text-sm sm:text-base">
                    PKR {Number(item.price ?? 4000).toLocaleString()}
                  </span>
                  <span className="text-[11px] font-bold text-[#ff6b4a] dark:text-sky-400 uppercase tracking-wider group-hover:translate-x-1 transition-transform">
                    Inspect →
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};


