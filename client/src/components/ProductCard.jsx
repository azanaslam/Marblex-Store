import { memo, useState } from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import ArrowOutwardIcon from "@mui/icons-material/ArrowOutward";

// 1. Bespoke Vector Icons matching User Reference Images 1:1
const WaterproofShieldIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Outer Dark Shield */}
    <path
      d="M24 4C15 8.5 7 7.5 4 6.5C4 22 7.5 37 24 44C40.5 37 44 22 44 6.5C41 7.5 33 8.5 24 4Z"
      stroke="#1e293b"
      strokeWidth="3.5"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Vibrant Blue Droplet */}
    <path
      d="M24 16C24 16 16 26.5 16 31.5C16 35.64 19.58 39 24 39C28.42 39 32 35.64 32 31.5C32 26.5 24 16 24 16Z"
      fill="#0ea5e9"
    />
    <path
      d="M21 28C20 30 20.5 33 22 34"
      stroke="#ffffff"
      strokeWidth="2"
      strokeLinecap="round"
    />
    {/* Green Badge with Checkmark on top-right */}
    <circle cx="36" cy="12" r="9" fill="#16a34a" stroke="#ffffff" strokeWidth="2" />
    <path
      d="M32.5 12L35 14.5L39.5 9.5"
      stroke="#ffffff"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EcoHeartCycleIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* Green Circular Arrow Ring */}
    <path
      d="M24 6C33.94 6 42 14.06 42 24C42 33.94 33.94 42 24 42C14.06 42 6 33.94 6 24C6 17.5 9.5 11.8 14.7 8.7"
      stroke="#559900"
      strokeWidth="5"
      strokeLinecap="round"
    />
    {/* Arrow Head */}
    <path
      d="M9 14L15 8L18 16"
      fill="#559900"
      stroke="#559900"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Center Heart */}
    <path
      d="M24 31.5C24 31.5 16 25 16 20C16 17 18.5 14.5 21.5 14.5C23.2 14.5 24 15.5 24 15.5C24 15.5 24.8 14.5 26.5 14.5C29.5 14.5 32 17 32 20C32 25 24 31.5 24 31.5Z"
      fill="#559900"
    />
  </svg>
);

const MultiLayerAdhesionIcon = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    <circle cx="24" cy="24" r="22" stroke="url(#cardAdhesionGrad)" strokeWidth="2.5" fill="none" />
    <defs>
      <linearGradient id="cardAdhesionGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
        <stop stopColor="#a3e635" />
        <stop offset="0.5" stopColor="#06b6d4" />
        <stop offset="1" stopColor="#0ea5e9" />
      </linearGradient>
    </defs>
    {/* Multi-layer substrate */}
    <path d="M10 26L24 19L38 26L24 33L10 26Z" fill="#1e293b" />
    <path d="M12 28L24 22L36 28L24 34L12 28Z" fill="#334155" />
    <path
      d="M13 29C15 28 17 31 19 29C21 27 23 30 25 28C27 26 29 29 31 27C33 25 35 28 36 28"
      stroke="#ffffff"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path d="M10 32L24 39L38 32L36 30L24 36L12 30L10 32Z" fill="#0f172a" />
    {/* Dual Upward Arrows */}
    <path
      d="M20 20C18 16 15 15 11 16M11 16L14 13M11 16L15 18"
      stroke="#1e293b"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M28 17C26 13 23 12 19 13M19 13L22 10M19 13L23 15"
      stroke="#1e293b"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const getBenefitIcon = (iconName) => {
  switch (iconName) {
    case "shield":
    case "water":
    case "sun":
      return <WaterproofShieldIcon className="w-4 h-4 shrink-0" />;
    case "timer":
    case "heart":
    case "check":
      return <EcoHeartCycleIcon className="w-4 h-4 shrink-0" />;
    case "link":
    case "cube":
    case "gauge":
    case "sparkle":
    default:
      return <MultiLayerAdhesionIcon className="w-4 h-4 shrink-0" />;
  }
};

const getProductMeta = (product, index) => {
  const name = (product.name || "").toLowerCase();

  // Badges matching Client Reference Screenshot:
  let leftBadge = { text: "BEST SELLER", bg: "bg-[#ff6b4a] text-white" };
  let rightBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };

  if (name.includes("entryway") || index === 0) {
    leftBadge = { text: "BEST SELLER", bg: "bg-[#ff6b4a] text-white" };
    rightBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
  } else if (name.includes("waterproof") || index === 1) {
    leftBadge = { text: "NEW", bg: "bg-[#10b981] text-white" };
    rightBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
  } else if (name.includes("mosaic") || name.includes("pool") || index === 2) {
    leftBadge = { text: "PREMIUM", bg: "bg-[#0a3d52] text-white" };
    rightBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
  } else if (name.includes("termite") || index === 3) {
    leftBadge = { text: "TRENDING", bg: "bg-[#10b981] text-white" };
    rightBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
  } else if (name.includes("putty") || index === 4) {
    leftBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
    rightBadge = { text: "TRENDING", bg: "bg-[#10b981] text-white" };
  } else if (name.includes("emulsion") || name.includes("paint") || index === 5) {
    leftBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
    rightBadge = { text: "SPECIAL OFFER", bg: "bg-[#ff6b4a] text-white" };
  } else if (name.includes("bituminous") || name.includes("membrane") || index === 6) {
    leftBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
    rightBadge = { text: "NEW", bg: "bg-[#10b981] text-white" };
  } else if (name.includes("waterstop") || name.includes("rubber") || index === 7) {
    leftBadge = { text: "MARBLEX", bg: "bg-black/70 backdrop-blur-md text-white" };
    rightBadge = { text: "PREMIUM", bg: "bg-[#0a3d52] text-white" };
  }

  // 3 Compact Benefits matching Client Reference Screenshot:
  let benefits = [
    { icon: "shield", line1: "Weather", line2: "Proof" },
    { icon: "timer", line1: "Long", line2: "Lasting" },
    { icon: "link", line1: "High", line2: "Adhesion" },
  ];

  if (name.includes("mosaic") || name.includes("pool")) {
    benefits = [
      { icon: "sun", line1: "UV", line2: "Resistant" },
      { icon: "shield", line1: "Anti", line2: "Slip" },
      { icon: "sparkle", line1: "Premium", line2: "Finish" },
    ];
  } else if (name.includes("termite")) {
    benefits = [
      { icon: "shield", line1: "Long", line2: "Protection" },
      { icon: "check", line1: "Safe for", line2: "Use" },
      { icon: "cube", line1: "High", line2: "Coverage" },
    ];
  } else if (name.includes("putty")) {
    benefits = [
      { icon: "check", line1: "Smooth", line2: "Finish" },
      { icon: "shield", line1: "Crack", line2: "Resistant" },
      { icon: "timer", line1: "Long", line2: "Lasting" },
    ];
  } else if (name.includes("emulsion") || name.includes("paint")) {
    benefits = [
      { icon: "check", line1: "Washable", line2: "" },
      { icon: "drop", line1: "Low", line2: "VOC" },
      { icon: "check", line1: "Rich", line2: "Colours" },
    ];
  } else if (name.includes("bituminous") || name.includes("membrane")) {
    benefits = [
      { icon: "cube", line1: "High", line2: "Strength" },
      { icon: "shield", line1: "Waterproof", line2: "" },
      { icon: "sun", line1: "UV", line2: "Resistant" },
    ];
  } else if (name.includes("waterstop") || name.includes("rubber")) {
    benefits = [
      { icon: "gauge", line1: "High", line2: "Elasticity" },
      { icon: "shield", line1: "Pressure", line2: "Resistant" },
      { icon: "timer", line1: "Long", line2: "Life" },
    ];
  }

  return { leftBadge, rightBadge, benefits };
};

const ProductCardComponent = ({ product, index = 0, onAddToCart, onOpenProduct }) => {
  const [quantity, setQuantity] = useState(1);
  const priceLabel = Number(product.price ?? 0).toLocaleString();
  const imageSrc = product.imageUrl?.trim() || "/products/Banner1.jpeg";
  const { leftBadge, rightBadge, benefits } = getProductMeta(product, index);

  const handleDecrement = (e) => {
    e.stopPropagation();
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const handleIncrement = (e) => {
    e.stopPropagation();
    setQuantity((prev) => prev + 1);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart({ ...product, quantity });
  };

  return (
    <div
      onClick={() => onOpenProduct?.(product)}
      className="group relative flex w-full flex-col bg-white dark:bg-[#0c222e] rounded-[22px] overflow-hidden border border-[#e0e6ed] dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(10,61,82,0.12)] dark:hover:shadow-black/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
    >
      {/* 1. Image Area (~42% Card Height) */}
      <div className="relative h-[195px] sm:h-[205px] shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-t-[22px]">
        <img
          src={imageSrc}
          alt={product.name || "Product"}
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/products/Banner1.jpeg";
          }}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
        />

        {/* Top Left Promo / Status Badge */}
        <div className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-md font-bold text-[9px] tracking-wider uppercase shadow-sm flex items-center gap-1 ${leftBadge.bg}`}>
          <span>{leftBadge.text}</span>
        </div>

        {/* Top Right Brand Badge */}
        <div className={`absolute top-3.5 right-3.5 px-2 py-0.5 rounded font-bold text-[9px] tracking-widest uppercase shadow-sm ${rightBadge.bg}`}>
          <span>{rightBadge.text}</span>
        </div>

        {/* Quick View / Explore Details Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center pointer-events-none">
          <span className="translate-y-2 group-hover:translate-y-0 transition-transform duration-300 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md text-[#0a3d52] dark:text-white font-bold text-xs shadow-lg border border-white/20">
            <span>View Details</span>
            <ArrowOutwardIcon sx={{ fontSize: 13 }} className="text-[#ff6b4a]" />
          </span>
        </div>
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-col flex-grow p-4 sm:p-4.5">
        
        {/* Product Title + Subtle Hover Arrow */}
        <div className="flex items-start justify-between gap-1 mb-1">
          <h3
            className="text-[15px] sm:text-[16px] font-bold text-[#0f1929] dark:text-white leading-snug group-hover:text-[#ff6b4a] transition-colors line-clamp-1 font-heading"
            title={product.name}
          >
            {product.name}
          </h3>
          <ArrowOutwardIcon
            sx={{ fontSize: 15 }}
            className="text-slate-400 group-hover:text-[#ff6b4a] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-0.5 opacity-60 group-hover:opacity-100"
          />
        </div>

        {/* Short Description */}
        <p className="text-[11.5px] text-[#565e69] dark:text-slate-400 leading-relaxed line-clamp-2 mb-3.5 font-normal">
          {product.description || "High-performance engineered solutions for waterproofing and industrial durability."}
        </p>

        {/* 3 Compact Benefits Row (Custom Visual Icons) */}
        <div className="grid grid-cols-3 gap-1.5 py-2 mb-3.5 mt-auto border-t border-slate-100 dark:border-slate-800/80">
          {benefits.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="shrink-0">{getBenefitIcon(item.icon)}</span>
              <div className="flex flex-col leading-[1.12]">
                <span className="text-[9.5px] font-semibold text-slate-700 dark:text-slate-300">
                  {item.line1}
                </span>
                {item.line2 && (
                  <span className="text-[9px] font-normal text-slate-500 dark:text-slate-400">
                    {item.line2}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* 3. Price & Add to Cart Footer (Clean, balanced layout) */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#e0e6ed] dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
          
          {/* Ultra-Modern Luxury Price Display */}
          <div className="flex items-center gap-1.5 shrink-0 min-w-0">
            <span className="text-[9px] sm:text-[9.5px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded-md bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20 leading-none">
              PKR
            </span>
            <span className="text-[17px] sm:text-[18.5px] font-black text-[#0a3d52] dark:text-white font-heading tracking-tight leading-none">
              {priceLabel}
            </span>
          </div>

          {/* Action Controls: Quantity Stepper + Add to Cart */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quantity Stepper */}
            <div className="flex items-center h-7 rounded-lg border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 px-0.5 overflow-hidden shrink-0">
              <button
                type="button"
                onClick={handleDecrement}
                disabled={quantity <= 1}
                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-[#ff6b4a] dark:text-slate-400 dark:hover:text-[#ff6b4a] disabled:opacity-25 disabled:hover:text-slate-500 transition-colors font-bold text-xs"
                title="Decrease quantity"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="w-5 text-center text-[11px] font-bold text-[#0a3d52] dark:text-slate-200 select-none">
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleIncrement}
                className="w-5 h-full flex items-center justify-center text-slate-500 hover:text-[#ff6b4a] dark:text-slate-400 dark:hover:text-[#ff6b4a] transition-colors font-bold text-xs"
                title="Increase quantity"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="shimmer-btn h-7 px-2.5 sm:px-3 rounded-lg bg-[#0a3d52] hover:bg-[#0d4e68] active:bg-[#082a38] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 whitespace-nowrap"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 13 }} />
              <span>Add to Cart</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);
