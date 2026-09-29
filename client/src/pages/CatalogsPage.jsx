import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";

const catalogs = [
  {
    id: "profile",
    title: "Corporate Profile & Certifications",
    description: "Overview of MARBLEX manufacturing capability, chemical formulations, and quality assurance protocols.",
    pages: Array.from({ length: 10 }, (_, i) => `/assets/brochures/Profile_marblex_page_${i + 1}.jpg`),
  },
  {
    id: "construction",
    title: "Construction & Waterproofing Specs",
    description: "Detailed application guides for termite treatments, cold/hot waterproofing, and bituminous membranes.",
    pages: Array.from({ length: 4 }, (_, i) => `/assets/brochures/real_one_page_${i + 1}.jpg`),
  },
  {
    id: "waterstopper",
    title: "Rubber Waterstop Technical Data",
    description: "Engineered elastomeric profiles for dams, reservoirs, canals, and basement expansion joints.",
    pages: Array.from({ length: 2 }, (_, i) => `/assets/brochures/Water_Stopper_123_page_${i + 1}.jpg`),
  },
];

export const CatalogsPage = () => {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = catalogs.find(c => c.id === tabParam) ? tabParam : catalogs[0].id;
  const [activeCatalog, setActiveCatalog] = useState(initialTab);

  useEffect(() => {
    if (tabParam && catalogs.find(c => c.id === tabParam)) {
      setActiveCatalog(tabParam);
    }
  }, [tabParam]);

  const selectedCatalog = catalogs.find(c => c.id === activeCatalog);

  return (
    <div className="max-w-[1400px] mx-auto min-h-screen pb-20 px-4 md:px-8">
      <div className="text-center mb-10 md:mb-14 pt-6">
        <div className="inline-flex items-center gap-2 py-1.5 px-4 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] font-bold text-xs tracking-widest uppercase mb-4 border border-[#ff6b4a]/20">
          <MenuBookOutlinedIcon sx={{ fontSize: 16 }} /> MARBLEX Documentation
        </div>
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-[#0f1929] tracking-tight mb-3" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73]">Catalogs & Datasheets</span>
        </h1>
        <p className="text-sm md:text-base text-[#565e69] font-normal max-w-2xl mx-auto">
          Explore complete laboratory certifications, product dimensions, and engineering application brochures.
        </p>
      </div>

      {/* Enterprise Metrics Bar */}
      <EnterpriseMetricsBar className="mb-10 sm:mb-14" />

      {/* Mobile Tab Navigation */}
      <div className="md:hidden sticky top-[68px] z-30 bg-white/95 backdrop-blur-md border-b border-[#e0e6ed] mb-6 px-4 py-3 -mx-4 overflow-x-auto flex items-center gap-2 custom-scrollbar">
        {catalogs.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCatalog(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
              activeCatalog === cat.id
                ? "bg-[#0a3d52] text-white shadow-sm"
                : "bg-[#f5f7fa] text-[#565e69]"
            }`}
          >
            {cat.title}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Desktop Sidebar / Tabs */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3">
          <div className="bg-white rounded-3xl p-4 border border-[#e0e6ed] card-shadow sticky top-24 space-y-2">
            <h3 className="text-xs font-bold text-[#0a3d52] uppercase tracking-wider mb-3 px-3 font-subheading">
              Available Catalogs
            </h3>
            <div className="flex flex-col gap-2">
              {catalogs.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCatalog(cat.id)}
                  className={`text-left px-4 py-3.5 rounded-2xl transition-all ${
                    activeCatalog === cat.id
                      ? "bg-[#0a3d52] text-white shadow-md"
                      : "bg-[#f5f7fa] text-[#565e69] hover:bg-[#e0e6ed]/60 hover:text-[#0f1929]"
                  }`}
                >
                  <h4 className="font-bold text-sm mb-1 leading-snug">
                    {cat.title}
                  </h4>
                  <p className={`text-xs line-clamp-2 ${activeCatalog === cat.id ? "text-slate-200" : "text-[#565e69]"}`}>
                    {cat.description}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Viewer */}
        <div className="md:col-span-8 lg:col-span-9">
          <div className="bg-white rounded-3xl border border-[#e0e6ed] card-shadow p-6 sm:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-6 border-b border-[#e0e6ed]">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#0a3d52]" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {selectedCatalog?.title}
                </h2>
                <p className="text-xs sm:text-sm text-[#565e69] mt-1 font-normal">
                  {selectedCatalog?.description}
                </p>
              </div>
              <a
                href={selectedCatalog?.pages[0]}
                download
                className="btn-3d-accent px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 self-start sm:self-auto shrink-0"
              >
                <DownloadOutlinedIcon fontSize="small" /> Download Page 1
              </a>
            </div>

            {/* Pages Stream */}
            <div className="space-y-6">
              {selectedCatalog?.pages.map((pageImg, idx) => (
                <div key={idx} className="rounded-2xl overflow-hidden border border-[#e0e6ed] shadow-sm bg-[#f5f7fa]">
                  <div className="p-3 bg-white border-b border-[#e0e6ed] flex justify-between items-center text-xs font-bold text-[#565e69]">
                    <span>Page {idx + 1} of {selectedCatalog.pages.length}</span>
                    <a href={pageImg} target="_blank" rel="noreferrer" className="text-[#0a3d52] hover:text-[#ff6b4a]">
                      Open Full Size ➔
                    </a>
                  </div>
                  <img
                    src={pageImg}
                    alt={`${selectedCatalog.title} Page ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-auto object-contain"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
