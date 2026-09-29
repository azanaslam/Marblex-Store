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
import { http } from "../api/http";
import { ProductDetailSkeleton } from "../components/LoaderSkeleton";
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

  const galleryImages = product?.imageUrl 
    ? [product.imageUrl, ...(product.extraImages || []), ...defaultGallery].filter((v, i, a) => a.indexOf(v) === i).slice(0, 4)
    : defaultGallery;

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
    <div ref={containerRef} className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* 1. Top Main Page Title (Exact Match: "Carrara Elegance Entryway System") */}
      <div className="anim-reveal flex items-center justify-between flex-wrap gap-4 pt-2">
        <h1 
          className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#0f1929] dark:text-white tracking-tight leading-none"
          style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
        >
          {productName.toLowerCase().includes("system") ? productName : `Carrara Elegance ${productName} System`}
        </h1>

        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-[#0a3d52] dark:text-slate-200 hover:text-[#ff6b4a] bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 rounded-lg shadow-xs transition-all active:scale-95"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} /> Back
        </button>
      </div>

      {/* 2. Main Two-Column Showcase (Exact Match with Client Screenshot) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* ==================== LEFT COLUMN: Images & Gallery & Technical Specs ==================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Dual Preview Hero Stage (Portrait Scene + Main Showcase) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
            
            {/* Left Portrait Application Scene */}
            <div className="sm:col-span-5 bg-slate-100 dark:bg-slate-800 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs relative min-h-[300px] sm:min-h-[420px]">
              <img
                src={galleryImages[1] || galleryImages[0]}
                alt="Architectural Application"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
              />
            </div>

            {/* Right Main Perspective Room Preview */}
            <div className="sm:col-span-7 bg-white dark:bg-[#0e2735] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs relative min-h-[300px] sm:min-h-[420px] flex items-center justify-center">
              <img
                src={currentImage}
                alt={productName}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
              />
            </div>
          </div>

          {/* Gallery (4) Thumbnails Bar */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
              Gallery ({galleryImages.length})
            </h4>
            <div className="grid grid-cols-4 gap-2.5">
              {galleryImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 bg-white dark:bg-[#0e2735] transition-all p-0.5 relative group ${
                    selectedImageIndex === idx
                      ? "border-[#ff6b4a] shadow-md ring-2 ring-[#ff6b4a]/20"
                      : "border-slate-200 dark:border-slate-700 hover:border-slate-400 opacity-80 hover:opacity-100"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-200"
                    onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Left Bottom: Technical Specifications Table (Exact Match) */}
          <div className="border-t border-slate-200 dark:border-slate-800 pt-5 space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Technical Specifications
            </h4>
            
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div>
                <span className="block text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Material</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedMaterial}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Color</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedColor}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Color</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedColor}</span>
              </div>
              <div>
                <span className="block text-slate-400 dark:text-slate-500 font-semibold mb-0.5">Size</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">8mm</span>
              </div>
            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN: Details, CTAs, Cards, Accordion, Related ==================== */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Brand & Title */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              MARBLEX
            </span>
            <h2 
              className="text-xl sm:text-2xl lg:text-[26px] font-black text-slate-900 dark:text-white leading-tight tracking-tight"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              MARBLEX {displayTitle}
            </h2>

            {/* Reviews Rating */}
            <div className="flex items-center gap-2 pt-0.5 text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 15 }} />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">4.9</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 dark:text-slate-400 underline cursor-pointer">128 reviews</span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              PKR {Number(product?.price ?? 4000).toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              / sq ft
            </span>
          </div>

          {/* Short Pitch Description */}
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            {product?.description || "Redefine your home's entrance with the sophisticated look of natural stone."}
          </p>

          {/* Dropdown Selectors (Material & Color) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            {/* Material Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Material</label>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:border-[#ff6b4a]"
                >
                  <option value="Polished Marble Composite">Polished Marble Composite</option>
                  <option value="High-Build Elastomeric">High-Build Elastomeric</option>
                  <option value="Reinforced Vulcanized Compound">Reinforced Vulcanized Compound</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Color Selector */}
            <div className="space-y-1">
              <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Color</label>
              <div className="relative">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-lg px-3.5 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-none focus:border-[#ff6b4a]"
                >
                  <option value="Carrara White">Carrara White</option>
                  <option value="Basalt Grey">Basalt Grey</option>
                  <option value="Desert Sand">Desert Sand</option>
                  <option value="Slate Black">Slate Black</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons Row (Exact Match) */}
          <div className="space-y-2 pt-1">
            <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">Quantity</label>
            
            {/* Quantity Stepper */}
            <div className="inline-flex items-center bg-slate-50 dark:bg-[#0e2735] border border-slate-300 dark:border-slate-700 rounded-lg overflow-hidden h-9 w-28 mb-3">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-9 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <RemoveIcon sx={{ fontSize: 14 }} />
              </button>
              <div className="flex-1 text-center font-bold text-xs text-slate-900 dark:text-white">
                {quantity}
              </div>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-9 h-full flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </button>
            </div>

            {/* Buttons Row: Add to Cart (Slate) + Instant WhatsApp Quote (Crimson) */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              <button
                onClick={handleAddToCart}
                className="sm:col-span-5 bg-[#565e69] hover:bg-[#475569] active:bg-[#334155] text-white py-3 px-5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleWhatsAppInquiry}
                className="sm:col-span-7 bg-[#b91c1c] hover:bg-[#991b1b] active:bg-[#7f1d1d] text-white py-2.5 px-4 rounded-xl shadow-sm transition-all flex items-center gap-2.5 text-left active:scale-95"
              >
                <WhatsAppIcon sx={{ fontSize: 22 }} className="shrink-0 text-white" />
                <div className="flex flex-col leading-tight">
                  <span className="font-bold text-xs">Instant WhatsApp Quote</span>
                  <span className="text-[9.5px] text-red-100 font-normal">Discuss requirements with an expert</span>
                </div>
              </button>
            </div>

            {/* Added to Cart Notification Toast */}
            {addedToast && (
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold animate-fadeIn">
                <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> Added {quantity} unit(s) to cart successfully!
              </div>
            )}
          </div>

          {/* 3 Value Proposition Cards (Exact Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            
            {/* Card 1: Durability 15+ Years */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e2735] flex flex-col items-center text-center space-y-1.5 shadow-xs">
              <ShieldOutlinedIcon sx={{ fontSize: 24, color: "#0a3d52" }} className="dark:text-[#38bdf8]" />
              <span className="font-bold text-slate-900 dark:text-white text-xs">Durability 15+ Years</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Built for heavy traffic, residential & commercial use
              </p>
            </div>

            {/* Card 2: ASTM Certified */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e2735] flex flex-col items-center text-center space-y-1.5 shadow-xs">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 24, color: "#0a3d52" }} className="dark:text-[#38bdf8]" />
              <span className="font-bold text-slate-900 dark:text-white text-xs">ASTM Certified</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Meets ASTM F1700 standard for slip resistance & wear
              </p>
            </div>

            {/* Card 3: Waterproof & Stain Resistant */}
            <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e2735] flex flex-col items-center text-center space-y-1.5 shadow-xs">
              <WaterDropOutlinedIcon sx={{ fontSize: 24, color: "#0a3d52" }} className="dark:text-[#38bdf8]" />
              <span className="font-bold text-slate-900 dark:text-white text-xs">Waterproof & Stain Resistant</span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                Easy to clean, resistant to spills and dirt
              </p>
            </div>

          </div>

          {/* Technical Specifications Expandable Accordion (Exact Match) */}
          <div className="border-t border-b border-slate-200 dark:border-slate-800 py-3">
            <button
              onClick={() => setSpecsOpen(!specsOpen)}
              className="w-full flex items-center justify-between text-xs sm:text-sm font-bold text-slate-900 dark:text-white py-1"
            >
              <span>Technical Specifications</span>
              {specsOpen ? (
                <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
              ) : (
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
              )}
            </button>

            {specsOpen && (
              <div className="pt-3 pb-1 text-xs text-slate-600 dark:text-slate-300 space-y-2 animate-fadeIn">
                <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div><strong>Tensile Strength:</strong> &gt; 12.5 MPa</div>
                  <div><strong>Elongation:</strong> 350% - 450%</div>
                  <div><strong>Hydrostatic:</strong> Up to 5 Bar</div>
                  <div><strong>Temperature:</strong> -20°C to +85°C</div>
                  <div><strong>Application:</strong> Roller / Squeegee</div>
                  <div><strong>Standard:</strong> ASTM D412 / BS 8102</div>
                </div>
              </div>
            )}
          </div>

          {/* Related Products 4-Card Mini Row (Exact Match with Red Badges) */}
          <div className="space-y-3 pt-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">
              Related Products
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {moreProducts.map((item, idx) => (
                <div
                  key={item._id || idx}
                  onClick={() => navigate(`/product/${item._id}`, { state: { product: item } })}
                  className="group cursor-pointer bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-800 rounded-xl p-2 shadow-2xs hover:shadow-md transition-all space-y-1.5"
                >
                  {/* Square Image with Red Number Badge */}
                  <div className="relative aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                    <span className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#b91c1c] text-white text-[9px] font-bold flex items-center justify-center z-10">
                      {idx + 1}
                    </span>
                    <img
                      src={item.imageUrl || defaultGallery[idx % defaultGallery.length]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      onError={(e) => { e.currentTarget.src = "/products/Banner1.jpeg"; }}
                    />
                  </div>

                  {/* Title */}
                  <h5 className="font-bold text-slate-900 dark:text-white text-[11px] truncate leading-tight">
                    {item.name}
                  </h5>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-[10px]">
                    <div className="flex text-amber-400">
                      {[...Array(5)].map((_, starIdx) => (
                        <StarIcon key={starIdx} sx={{ fontSize: 11 }} />
                      ))}
                    </div>
                    <span className="text-slate-400">({item.reviewsCount || 128})</span>
                  </div>

                  {/* Price */}
                  <div className="font-bold text-slate-900 dark:text-white text-xs">
                    PKR {Number(item.price ?? 4000).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
