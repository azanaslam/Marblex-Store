import { memo } from "react";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import EastIcon from '@mui/icons-material/East';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';

const getBenefitIcon = (iconName) => {
  switch (iconName) {
    case "water":
      return <WaterDropOutlinedIcon sx={{ fontSize: 13 }} className="text-[#0ea5e9]" />;
    case "sun":
      return <WbSunnyOutlinedIcon sx={{ fontSize: 13 }} className="text-amber-500" />;
    case "timer":
      return <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} className="text-slate-500 dark:text-slate-400" />;
    case "check":
      return <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 13 }} className="text-emerald-500" />;
    case "link":
      return <LinkOutlinedIcon sx={{ fontSize: 13 }} className="text-[#ff6b4a]" />;
    case "drop":
      return <WaterDropOutlinedIcon sx={{ fontSize: 13 }} className="text-teal-500" />;
    case "gauge":
      return <SpeedOutlinedIcon sx={{ fontSize: 13 }} className="text-[#0a3d52] dark:text-sky-400" />;
    case "cube":
      return <Inventory2OutlinedIcon sx={{ fontSize: 13 }} className="text-[#0a3d52] dark:text-amber-400" />;
    case "sparkle":
      return <AutoAwesomeOutlinedIcon sx={{ fontSize: 13 }} className="text-[#ff6b4a]" />;
    case "shield":
    default:
      return <ShieldOutlinedIcon sx={{ fontSize: 13 }} className="text-[#0a3d52] dark:text-sky-400" />;
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
    { icon: "shield", line1: "High", line2: "Durability" },
    { icon: "water", line1: "Water", line2: "Resistant" },
    { icon: "sparkle", line1: "Easy to", line2: "Apply" },
  ];

  if (name.includes("waterproofing") || name.includes("waterproof")) {
    benefits = [
      { icon: "sun", line1: "Weather", line2: "Proof" },
      { icon: "timer", line1: "Long", line2: "Lasting" },
      { icon: "link", line1: "High", line2: "Adhesion" },
    ];
  } else if (name.includes("mosaic") || name.includes("pool")) {
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
  const priceLabel = Number(product.price ?? 0).toLocaleString();
  const imageSrc = product.imageUrl?.trim() || "/products/Banner1.jpeg";
  const { leftBadge, rightBadge, benefits } = getProductMeta(product, index);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart({ ...product, quantity: 1 });
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
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
        />

        {/* Top Left Promo / Status Badge */}
        <div className={`absolute top-3.5 left-3.5 px-2.5 py-0.5 rounded-md font-bold text-[9px] tracking-wider uppercase shadow-sm flex items-center gap-1 ${leftBadge.bg}`}>
          <span>{leftBadge.text}</span>
        </div>

        {/* Top Right Brand Badge */}
        <div className={`absolute top-3.5 right-3.5 px-2 py-0.5 rounded font-bold text-[9px] tracking-widest uppercase shadow-sm ${rightBadge.bg}`}>
          <span>{rightBadge.text}</span>
        </div>

        {/* Subtle Hover Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* 2. Content Area */}
      <div className="flex flex-col flex-grow p-4 sm:p-4.5">
        
        {/* Product Title */}
        <h3
          className="text-[15px] sm:text-[16px] font-bold text-[#0f1929] dark:text-white leading-snug mb-1 group-hover:text-[#ff6b4a] transition-colors line-clamp-1 font-heading"
          title={product.name}
        >
          {product.name}
        </h3>

        {/* Short Description (refined size) */}
        <p className="text-[11.5px] text-[#565e69] dark:text-slate-400 leading-relaxed line-clamp-2 mb-3.5 font-normal">
          {product.description || "How to Choose the Right industrial solution for your project when durability is required."}
        </p>

        {/* 3 Compact Benefits Row (Exact 1:1 Match with Client SS) */}
        <div className="grid grid-cols-3 gap-1.5 py-2 mb-3.5 mt-auto border-t border-slate-100 dark:border-slate-800/80">
          {benefits.map((item, idx) => (
            <div key={idx} className="flex items-start gap-1">
              <span className="shrink-0 mt-0.5">{getBenefitIcon(item.icon)}</span>
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

        {/* 3. Price & Add to Cart Footer (Single Line Seamless Layout) */}
        <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-[#e0e6ed] dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
          
          {/* Price (Strictly Single Line, 2px smaller) */}
          <div className="flex items-center shrink-0">
            <span className="text-[13.5px] sm:text-[14px] font-black text-[#0f1929] dark:text-white whitespace-nowrap leading-none font-heading tracking-tight">
              PKR {priceLabel}
            </span>
          </div>

          {/* Action Buttons (Compact to give ample room to Price) */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              className="h-7 px-2.5 sm:px-3 rounded-lg bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-[11px] flex items-center gap-1 shadow-sm transition active:scale-95 shrink-0 whitespace-nowrap"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 13 }} />
              <span>Add to Cart</span>
            </button>

            {/* Circular Detail Arrow Button */}
            <button
              onClick={() => onOpenProduct?.(product)}
              title="View Product Details"
              aria-label="View Product Details"
              className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center transition shrink-0 group/arrow"
            >
              <EastIcon sx={{ fontSize: 12 }} className="group-hover/arrow:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};

export const ProductCard = memo(ProductCardComponent);
