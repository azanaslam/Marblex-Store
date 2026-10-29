import { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import ExploreOutlinedIcon from "@mui/icons-material/ExploreOutlined";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CalculateOutlinedIcon from "@mui/icons-material/CalculateOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import { http } from "../api/http";
import { track } from "../analytics";

const APPLICATIONS = [
  { id: "roof", title: "Roof & Terrace", desc: "Exposed slabs, rainproofing, solar reflectance", icon: "🏠" },
  { id: "basement", title: "Basement & Retaining Wall", desc: "Negative side water pressure, damp proofing", icon: "🏢" },
  { id: "water-tank", title: "Water Tank / Swimming Pool", desc: "Submerged, non-toxic, potable water certified", icon: "💧" },
  { id: "bathroom", title: "Bathroom & Wet Areas", desc: "Under-tile waterproofing, sunken slabs", icon: "🚿" },
  { id: "floor", title: "Industrial Flooring", desc: "Epoxy screed, wear & chemical resistance", icon: "🏗️" },
  { id: "joint", title: "Expansion & Construction Joints", desc: "PVC / Rubber waterstop seals", icon: "⚡" },
];

const EXPOSURES = [
  { id: "exterior", title: "Exterior / Direct Sunlight", desc: "UV resistant, elastomeric weatherproofing", icon: "☀️" },
  { id: "interior", title: "Interior / Concealed", desc: "Low odor, crack-bridging under screed", icon: "🚪" },
  { id: "submerged", title: "Submerged in Water", desc: "Continuous water pressure retention", icon: "🌊" },
];

const SURFACES = [
  { id: "concrete", title: "Concrete / Screed", icon: "🧱" },
  { id: "tiles", title: "Existing Tiles / Marble", icon: "🔲" },
  { id: "metal", title: "Metal / GI Sheet / Corrugated", icon: "🔩" },
  { id: "brick", title: "Brick Masonry / Plaster", icon: "🧱" },
];

export const ProductFinderPage = ({ cart = [], setCart }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedApp, setSelectedApp] = useState("roof");
  const [selectedExposure, setSelectedExposure] = useState("exterior");
  const [selectedSurface, setSelectedSurface] = useState("concrete");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    http.get("/products").then((res) => {
      const prods = Array.isArray(res.data) ? res.data : res.data?.products || [];
      setProducts(prods);
    }).catch(() => {});
  }, []);

  const recommendedProducts = useMemo(() => {
    if (!products.length) return [];

    // Filter by applications tag if present
    const matched = products.filter((p) => {
      const apps = p.applications || [];
      if (apps.includes(selectedApp)) return true;
      // Fallback search in product name or description
      const text = `${p.name} ${p.description} ${p.category}`.toLowerCase();
      return text.includes(selectedApp.replace("-", " "));
    });

    return matched.length ? matched : products.slice(0, 3);
  }, [products, selectedApp]);

  const handleFinish = () => {
    track("finder_completed", {
      application: selectedApp,
      exposure: selectedExposure,
      surface: selectedSurface,
      recommended_count: recommendedProducts.length,
    });
    setStep(4);
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-6 sm:py-12 text-[#0b2f3c] dark:text-[#eaf3f7]">
      {/* Header */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 mb-2">
          <ExploreOutlinedIcon sx={{ fontSize: 20, color: "#ff6b4a" }} />
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#ff6b4a]">
            Interactive Product Selector
          </span>
        </div>
        <h1
          className="text-2xl sm:text-3xl md:text-4xl font-black text-[#0a3d52] dark:text-white"
          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Find the Right Solution for Your Site
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
          Answer 3 quick questions to identify the exact industrial waterproofing chemical or rubber seal suited for your project.
        </p>

        {/* Step Progress Bar */}
        <div className="flex items-center justify-center gap-2 mt-5">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === s
                  ? "w-8 bg-[#ff6b4a]"
                  : step > s
                  ? "w-4 bg-[#0a3d52] dark:bg-sky-400"
                  : "w-4 bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Application Area */}
      {step === 1 && (
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-center text-[#0a3d52] dark:text-white">
            Step 1: What part of your structure do you want to protect?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {APPLICATIONS.map((app) => (
              <div
                key={app.id}
                onClick={() => setSelectedApp(app.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedApp === app.id
                    ? "border-[#ff6b4a] bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-[#ff6b4a]/20"
                    : "border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] hover:border-slate-300"
                }`}
              >
                <div>
                  <span className="text-3xl block mb-2">{app.icon}</span>
                  <h3 className="font-bold text-sm sm:text-base text-[#0a3d52] dark:text-white mb-1">
                    {app.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {app.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#ff6b4a]">
                  <span>Select</span>
                  {selectedApp === app.id && <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-6 py-3 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#0d4e68] cursor-pointer shadow-md"
            >
              <span>Next: Exposure & Environment</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Exposure */}
      {step === 2 && (
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-center text-[#0a3d52] dark:text-white">
            Step 2: What environment will it be exposed to?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {EXPOSURES.map((exp) => (
              <div
                key={exp.id}
                onClick={() => setSelectedExposure(exp.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedExposure === exp.id
                    ? "border-[#ff6b4a] bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-[#ff6b4a]/20"
                    : "border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] hover:border-slate-300"
                }`}
              >
                <div>
                  <span className="text-3xl block mb-2">{exp.icon}</span>
                  <h3 className="font-bold text-sm sm:text-base text-[#0a3d52] dark:text-white mb-1">
                    {exp.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    {exp.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center justify-between text-xs font-bold text-[#ff6b4a]">
                  <span>Select</span>
                  {selectedExposure === exp.id && <CheckCircleOutlineRoundedIcon sx={{ fontSize: 18 }} />}
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-6 py-3 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-[#0d4e68] cursor-pointer shadow-md"
            >
              <span>Next: Surface Substrate</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Substrate */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-lg sm:text-xl font-bold text-center text-[#0a3d52] dark:text-white">
            Step 3: What is the existing substrate or surface?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5">
            {SURFACES.map((surf) => (
              <div
                key={surf.id}
                onClick={() => setSelectedSurface(surf.id)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer text-center ${
                  selectedSurface === surf.id
                    ? "border-[#ff6b4a] bg-orange-50/50 dark:bg-orange-950/20 shadow-md ring-2 ring-[#ff6b4a]/20"
                    : "border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] hover:border-slate-300"
                }`}
              >
                <span className="text-3xl block mb-2">{surf.icon}</span>
                <h3 className="font-bold text-sm text-[#0a3d52] dark:text-white">
                  {surf.title}
                </h3>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-2 cursor-pointer"
            >
              <ArrowBackIcon sx={{ fontSize: 16 }} />
              <span>Back</span>
            </button>
            <button
              type="button"
              onClick={handleFinish}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff8460] to-[#ff6a45] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md shadow-[#ff6a45]/20"
            >
              <span>View Recommendations</span>
              <ArrowForwardIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Results */}
      {step === 4 && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-center text-xs text-emerald-800 dark:text-emerald-200">
            <strong>Recommended Solutions</strong> based on your selections:{" "}
            <span className="capitalize font-bold">{selectedApp}</span> •{" "}
            <span className="capitalize font-bold">{selectedExposure}</span> •{" "}
            <span className="capitalize font-bold">{selectedSurface}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {recommendedProducts.map((p) => (
              <div
                key={p._id}
                className="rounded-2xl border border-slate-200 dark:border-[#1f3d4a] bg-white dark:bg-[#112832] p-4 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <img
                    src={p.imageUrl || "/products/Banner1.jpeg"}
                    alt={p.name}
                    className="w-full h-40 object-cover rounded-xl mb-3"
                    onError={(e) => {
                      e.currentTarget.src = "/products/Banner1.jpeg";
                    }}
                  />
                  <h3 className="font-bold text-sm sm:text-base text-[#0a3d52] dark:text-white line-clamp-2 mb-1">
                    {p.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                    {p.description}
                  </p>
                  <div className="mt-3 font-black text-sm text-[#0a3d52] dark:text-sky-400">
                    PKR {Number(p.price || 0).toLocaleString()}
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <Link
                    to={`/calculator?product=${p._id}`}
                    className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#ff6b4a] border border-orange-200 dark:border-orange-800/40 font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-orange-100 transition-colors"
                  >
                    <CalculateOutlinedIcon sx={{ fontSize: 16 }} />
                    <span>Calculate Material Required</span>
                  </Link>

                  <Link
                    to={`/product/${p._id}`}
                    className="w-full py-2 px-3 rounded-xl bg-[#0a3d52] text-white font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#0d4e68] transition-colors"
                  >
                    <span>View Product Details</span>
                    <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white underline cursor-pointer"
            >
              Start Over with Different Criteria
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
