import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ShareIcon from "@mui/icons-material/Share";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { http } from "../api/http";
import {
  calculateTotalQuantity,
  calculateBestPacks,
  estimatePacksCost,
  convertArea,
} from "../utils/coverageCalculator";
import { track } from "../analytics";

export const CalculatorPage = ({ cart = [], setCart }) => {
  const [searchParams] = useSearchParams();
  const preSelectedId = searchParams.get("product");

  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Inputs
  const [dimensionType, setDimensionType] = useState("area"); // 'area' | 'length'
  const [unit, setUnit] = useState("sqft"); // 'sqft' | 'sqm' | 'lm'
  const [dimensionValue, setDimensionValue] = useState(500); // 500 sq ft by default
  const [coats, setCoats] = useState(2);
  const [wastagePercent, setWastagePercent] = useState(10);
  const [addedToast, setAddedToast] = useState(false);

  useEffect(() => {
    http
      .get("/products")
      .then((res) => {
        const prods = Array.isArray(res.data) ? res.data : res.data?.products || [];
        setProducts(prods);
        if (preSelectedId) {
          const matched = prods.find((p) => p._id === preSelectedId);
          if (matched) setSelectedProduct(matched);
        } else if (prods.length > 0) {
          setSelectedProduct(prods[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [preSelectedId]);

  // Adjust default coats and unit when product changes
  useEffect(() => {
    if (!selectedProduct) return;
    const cov = selectedProduct.coverage;
    if (cov?.coats) setCoats(cov.coats);
    if (cov?.wastagePercent !== undefined) setWastagePercent(cov.wastagePercent);
    if (cov?.unit === "lm") {
      setDimensionType("length");
      setUnit("lm");
    } else {
      setDimensionType("area");
      if (cov?.unit) setUnit(cov.unit);
    }
  }, [selectedProduct]);

  // Calculations
  const coverageData = useMemo(() => {
    if (!selectedProduct) return null;
    const cov = selectedProduct.coverage || {};
    const perUnit = cov.perUnit || 0.25; // default fallback 0.25 kg/sqft
    const coverageUnit = cov.unit || "sqft";
    const packSizes = cov.packSizes?.length ? cov.packSizes : [5, 20];

    const totalQty = calculateTotalQuantity({
      area: dimensionValue,
      inputUnit: unit,
      coverageUnit,
      perUnit,
      coats,
      wastagePercent,
    });

    const packs = calculateBestPacks(totalQty, packSizes);
    const estimatedCost = estimatePacksCost(packs, selectedProduct);

    return {
      perUnit,
      coverageUnit,
      packSizes,
      totalQty,
      packs,
      estimatedCost,
    };
  }, [selectedProduct, dimensionValue, unit, coats, wastagePercent]);

  const handleAddToCart = () => {
    if (!selectedProduct || !coverageData) return;
    track("calculator_used", {
      product_id: selectedProduct._id,
      product_name: selectedProduct.name,
      total_qty: coverageData.totalQty,
      estimated_cost: coverageData.estimatedCost,
    });

    // Add required packs as cart line items
    const nextCart = [...cart];
    coverageData.packs.forEach((p) => {
      // Find matching variant if any
      const matchedVariant = (selectedProduct.variants || []).find(
        (v) =>
          String(v.label || "").toLowerCase().includes(String(p.size)) ||
          String(v.sku || "").toLowerCase().includes(String(p.size))
      );

      const cartId = matchedVariant
        ? `${selectedProduct._id}-${matchedVariant.sku}`
        : `${selectedProduct._id}-${p.size}`;

      const existingIdx = nextCart.findIndex(
        (item) => item.cartId === cartId || (item.productId === selectedProduct._id && !item.variantSku)
      );

      const itemPrice = matchedVariant ? Number(matchedVariant.price) : Number(selectedProduct.price) * p.size;

      if (existingIdx !== -1) {
        nextCart[existingIdx].quantity = (nextCart[existingIdx].quantity || 1) + p.count;
      } else {
        nextCart.push({
          cartId,
          productId: selectedProduct._id,
          name: `${selectedProduct.name} (${p.size} ${coverageData.coverageUnit === "lm" ? "m" : "kg/L"})`,
          variantSku: matchedVariant?.sku,
          variantLabel: matchedVariant?.label || `${p.size} units pack`,
          price: itemPrice,
          quantity: p.count,
          imageUrl: selectedProduct.imageUrl,
          stock: matchedVariant ? matchedVariant.stock : selectedProduct.stock,
        });
      }
    });

    setCart(nextCart);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const shareOnWhatsApp = () => {
    if (!selectedProduct || !coverageData) return;
    const msg =
      `*🟩 MARBLEX COVERAGE CALCULATION ESTIMATE*\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `*Product:* ${selectedProduct.name}\n` +
      `*Target Area/Length:* ${dimensionValue} ${unit}\n` +
      `*Coats:* ${coats} | *Safety Wastage:* ${wastagePercent}%\n` +
      `*Required Quantity:* ${coverageData.totalQty} kg/litres\n` +
      `*Recommended Packs:* ` +
      coverageData.packs.map((p) => `${p.count}x (${p.size})`).join(" + ") +
      `\n*Estimated Cost:* PKR ${coverageData.estimatedCost.toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
      `_Calculated via MARBLEX Contractor Suite_`;

    window.open(`https://wa.me/923084585792?text=${encodeURIComponent(msg)}`, "_blank");
    track("generate_lead", {
      lead_type: "calculator_share",
      product_name: selectedProduct.name,
      value: coverageData.estimatedCost,
      currency: "PKR",
    });
  };

  const handleWebShare = async () => {
    if (!selectedProduct || !coverageData) return;
    const shareData = {
      title: `${selectedProduct.name} - Coverage Calculation`,
      text: `Calculated ${coverageData.totalQty} kg/L for ${dimensionValue} ${unit}. Estimated: PKR ${coverageData.estimatedCost.toLocaleString()}.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`);
        alert("Estimation copied to clipboard!");
      }
    } catch {
      /* user dismissed share dialog */
    }
  };

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 sm:py-10 text-[#0b2f3c] dark:text-[#eaf3f7]">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <div className="inline-flex items-center gap-2 mb-1.5">
          <CalculateOutlinedIcon sx={{ fontSize: 20, color: "#ff6b4a" }} />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff6b4a]">
            Contractor Tools
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0a3d52] dark:text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Material Coverage & Consumption Calculator
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
          Accurately calculate chemical consumption, membrane quantity, and commercial package requirements with zero material shortage on-site.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 sm:gap-8 items-start">
        {/* Left Inputs Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] p-5 sm:p-7 shadow-sm space-y-5">
          {/* 1. Select Product */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              1. Select Chemical Coating / Membrane
            </label>
            <select
              value={selectedProduct?._id || ""}
              onChange={(e) => {
                const found = products.find((p) => p._id === e.target.value);
                setSelectedProduct(found || null);
              }}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0e222b] text-sm font-bold text-[#0a3d52] dark:text-white outline-none focus:border-[#ff6b4a]"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} — PKR {Number(p.price || 0).toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Target Dimensions & Unit */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                2. Enter Site Dimension
              </label>
              {dimensionType === "area" && (
                <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-[#0e222b]">
                  <button
                    type="button"
                    onClick={() => {
                      if (unit !== "sqft") {
                        setDimensionValue(Math.round(convertArea(dimensionValue, "sqm", "sqft")));
                        setUnit("sqft");
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                      unit === "sqft"
                        ? "bg-[#0a3d52] text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    Sq Ft
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (unit !== "sqm") {
                        setDimensionValue(Math.round(convertArea(dimensionValue, "sqft", "sqm")));
                        setUnit("sqm");
                      }
                    }}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition cursor-pointer ${
                      unit === "sqm"
                        ? "bg-[#0a3d52] text-white"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                    }`}
                  >
                    Sq Metres
                  </button>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="number"
                min="1"
                value={dimensionValue}
                onChange={(e) => setDimensionValue(Math.max(1, Number(e.target.value)))}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0e222b] text-base font-extrabold text-[#0a3d52] dark:text-white outline-none focus:border-[#ff6b4a]"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                {unit.toUpperCase()}
              </span>
            </div>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-2 mt-2">
              {[200, 500, 1000, 2500, 5000].map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setDimensionValue(preset)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                    dimensionValue === preset
                      ? "bg-[#ff6b4a] text-white border-[#ff6b4a]"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400"
                  }`}
                >
                  {preset.toLocaleString()} {unit}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Coats & Wastage */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Application Coats
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3].map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setCoats(c)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      coats === c
                        ? "bg-[#0a3d52] text-white border-[#0a3d52]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    {c} {c === 1 ? "Coat" : "Coats"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Site Safety Wastage
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15].map((w) => (
                  <button
                    type="button"
                    key={w}
                    onClick={() => setWastagePercent(w)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                      wastagePercent === w
                        ? "bg-[#0a3d52] text-white border-[#0a3d52]"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                  >
                    +{w}%
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/40 text-xs text-sky-900 dark:text-sky-200">
            <strong>Standard Consumption Spec:</strong> {coverageData?.perUnit} kg/L per {coverageData?.coverageUnit} per coat.
          </div>
        </div>

        {/* Right Output & Action Card */}
        <div className="rounded-2xl sm:rounded-3xl border border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] p-5 sm:p-7 shadow-lg space-y-6">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Calculation Breakdown
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                Material Required
              </span>
              <span className="text-2xl sm:text-3xl font-black text-[#ff6b4a]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {coverageData?.totalQty} <span className="text-sm font-semibold">{coverageData?.coverageUnit === "lm" ? "m" : "kg / L"}</span>
              </span>
            </div>
          </div>

          {/* Recommended Pack Combination */}
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-3">
              Best Commercial Pack Combination
            </h4>
            <div className="space-y-2">
              {coverageData?.packs.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#0e222b] flex items-center justify-between"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-lg bg-[#0a3d52] text-white font-black text-xs flex items-center justify-center">
                      {p.count}x
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">
                      {p.size} {coverageData.coverageUnit === "lm" ? "Metre roll" : "Kg / L Drum"}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-slate-500">
                    Total: {p.count * p.size} units
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Estimate */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-[#081822] border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 block">Estimated Cost</span>
              <strong className="text-xl sm:text-2xl font-black text-[#0a3d52] dark:text-sky-400" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                PKR {coverageData?.estimatedCost.toLocaleString()}
              </strong>
            </div>
            <span className="text-[11px] text-slate-400">Excl. Delivery</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] text-white font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0a3d52]/20"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
              <span>{addedToast ? "Added to Cart!" : "Add Recommended Packs to Cart"}</span>
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={shareOnWhatsApp}
                className="py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <WhatsAppIcon sx={{ fontSize: 18 }} />
                <span>WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={handleWebShare}
                className="py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <ShareIcon sx={{ fontSize: 18 }} />
                <span>Share Result</span>
              </button>
            </div>

            <Link
              to={`/contact?subject=${encodeURIComponent(`RFQ for ${selectedProduct?.name} (${coverageData?.totalQty} units)`)}`}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-[#0a3d52] dark:text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <AssignmentOutlinedIcon sx={{ fontSize: 16 }} />
              <span>Request Custom Contractor Quotation (RFQ)</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
