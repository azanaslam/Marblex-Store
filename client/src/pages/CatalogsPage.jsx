import { useState, useEffect, useRef } from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import FullscreenRoundedIcon from "@mui/icons-material/FullscreenRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import NavigateNextRoundedIcon from "@mui/icons-material/NavigateNextRounded";
import NavigateBeforeRoundedIcon from "@mui/icons-material/NavigateBeforeRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import gsap from "gsap";

const CATALOGS_DATA = [
  {
    id: "profile",
    title: "Corporate Profile & ISO Certifications",
    category: "Corporate & Capabilities",
    badge: "10-Page Comprehensive",
    pdfUrl: "/assets/brochures/Profile_marblex_page_1.jpg",
    description:
      "Complete overview of MARBLEX chemical manufacturing plant, laboratory testing rigs, nationwide infrastructure projects, and ISO 9001:2015 quality protocols.",
    pages: Array.from({ length: 10 }, (_, i) => `/assets/brochures/Profile_marblex_page_${i + 1}.jpg`),
  },
  {
    id: "construction",
    title: "Waterproofing & Chemical Application Manual",
    category: "Technical Specifications",
    badge: "Site Application Guide",
    pdfUrl: "/assets/brochures/real_one_page_1.jpg",
    description:
      "Detailed SOPs for cold and hot applied elastomeric coatings, crystalline penetrants, APP modified bituminous torch-on membranes, and termite perimeter barriers.",
    pages: Array.from({ length: 4 }, (_, i) => `/assets/brochures/real_one_page_${i + 1}.jpg`),
  },
  {
    id: "waterstopper",
    title: "Rubber Waterstop Profile Data & Joint Design",
    category: "Hydraulic Engineering",
    badge: "CAD Cross-Sections",
    pdfUrl: "/assets/brochures/Water_Stopper_123_page_1.jpg",
    description:
      "Engineered elastomeric profiles, center-bulb tensile specs, and vulcanization heat-welding SOPs for dams, water reservoirs, wastewater plants, and basement expansion joints.",
    pages: Array.from({ length: 2 }, (_, i) => `/assets/brochures/Water_Stopper_123_page_${i + 1}.jpg`),
  },
];

export const CatalogsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get("tab");
  const initialTab = CATALOGS_DATA.find((c) => c.id === tabParam) ? tabParam : CATALOGS_DATA[0].id;
  const [activeCatalogId, setActiveCatalogId] = useState(initialTab);

  // Lightbox modal state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxPageIndex, setLightboxPageIndex] = useState(0);

  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".catalog-hero-anim",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        ".catalog-page-card",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.15, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [activeCatalogId]);

  useEffect(() => {
    if (tabParam && CATALOGS_DATA.find((c) => c.id === tabParam)) {
      setActiveCatalogId(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (catId) => {
    setActiveCatalogId(catId);
    setSearchParams({ tab: catId });
  };

  const selectedCatalog = CATALOGS_DATA.find((c) => c.id === activeCatalogId) || CATALOGS_DATA[0];

  const openLightbox = (index) => {
    setLightboxPageIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const nextLightboxPage = (e) => {
    e?.stopPropagation();
    setLightboxPageIndex((prev) => (prev + 1) % selectedCatalog.pages.length);
  };

  const prevLightboxPage = (e) => {
    e?.stopPropagation();
    setLightboxPageIndex((prev) => (prev - 1 + selectedCatalog.pages.length) % selectedCatalog.pages.length);
  };

  // Keyboard navigation in lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightboxOpen) return;
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") nextLightboxPage();
      if (e.key === "ArrowLeft") prevLightboxPage();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, selectedCatalog]);

  const scrollToPage = (idx) => {
    const el = document.getElementById(`catalog-page-${idx}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  };

  return (
    <div ref={containerRef} className="min-h-screen text-[#0b2f3c] dark:text-[#eaf3f7] pb-24 overflow-x-hidden">
      
      {/* ==================== 1. HERO SECTION (SPLIT MODERN HERO) ==================== */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-[#1f3d4a] overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-100/60 dark:from-[#091b24] dark:via-[#0c222e] dark:to-[#091b24]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff6b4a]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0a3d52]/10 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto relative z-10 catalog-hero-anim">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 font-medium flex items-center gap-1.5">
            <RouterLink to="/" className="hover:text-[#0a3d52] dark:hover:text-sky-400 transition-colors">
              Home
            </RouterLink>
            <span>/</span>
            <span className="text-[#0a3d52] dark:text-white font-semibold">Technical Catalogs & Documentation</span>
          </div>

          {/* Split Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 sm:px-4 rounded-full bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/20 text-[#ff6b4a] dark:text-[#ff8c73] font-bold text-xs tracking-wider uppercase mb-4 sm:mb-5 border border-[#ff6b4a]/30 backdrop-blur-md shadow-2xs">
                <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />
                <span>ASTM C836 • DIN EN 1504 • ISO 9001:2015 CERTIFIED</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#0a3d52] dark:text-white tracking-tight mb-4 sm:mb-6 leading-[1.15]"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Technical Catalogs &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#0a3d52] dark:to-sky-400">
                  Engineering Manuals.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
                Download official corporate profiles, high-pressure waterproofing chemical manuals, rubber waterstop CAD cross-sections, and ASTM certified laboratory test reports for consultant submittals.
              </p>

              {/* Action CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-8">
                <a
                  href="#catalog-viewer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#0a3d52]/25 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <PictureAsPdfOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Browse Document Hub</span>
                </a>

                <a
                  href="https://wa.me/923084585792?text=Hello%20MARBLEX%20Engineering%2C%20I%20need%20the%20complete%20stamped%20submittal%20package."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/20 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span>Request Stamped Package</span>
                </a>
              </div>

              {/* 3 Value Pillars */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-200/90 dark:border-[#1f3d4a]/80 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">100% Vector & HD</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">High Resolution</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <ShieldOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">ISO 9001:2015</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Accredited Data</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-[#ff6b4a] flex items-center justify-center shrink-0">
                    <EngineeringOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">CAD Drawings</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Joint Cross-Sections</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#0a3d52] to-[#ff6b4a] rounded-3xl sm:rounded-[36px] opacity-20 blur-xl group-hover:opacity-30 transition duration-700 pointer-events-none" />

              <div className="relative rounded-2xl sm:rounded-[30px] overflow-hidden border-2 border-white/80 dark:border-slate-700/80 shadow-2xl bg-slate-100 dark:bg-[#0c222e]">
                <img
                  src="/assets/brochures/Profile_marblex_page_1.jpg"
                  alt="MARBLEX Corporate Catalog & Technical Brochure Cover"
                  className="w-full h-[280px] sm:h-[380px] lg:h-[420px] object-cover object-top group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/85 via-transparent to-black/20 pointer-events-none" />

                {/* Floating HUD Card 1 */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md border border-white/40 dark:border-slate-700 shadow-lg flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0a3d52] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <PictureAsPdfOutlinedIcon sx={{ fontSize: 19, color: "#38bdf8" }} />
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#0a3d52] dark:text-white block">
                      16 Total Pages
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      Print-Ready PDF Specs
                    </span>
                  </div>
                </div>

                {/* Floating HUD Card 2 */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-2.5 sm:p-3 rounded-2xl bg-[#0a3d52]/95 dark:bg-[#081822]/95 backdrop-blur-md border border-white/20 shadow-xl text-white flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ff6b4a] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <VerifiedOutlinedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white">Official Submittals</div>
                    <div className="text-[9.5px] sm:text-[10px] text-slate-300 font-medium">NESPAK & CDA Compliant</div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ==================== 2. ENTERPRISE METRICS BAR ==================== */}
      <div className="-mt-7 sm:-mt-8 relative z-20">
        <EnterpriseMetricsBar />
      </div>

      {/* ==================== 3. INTERACTIVE CATALOG VIEWER & STREAM ==================== */}
      <section id="catalog-viewer" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
        
        {/* Mobile Catalog Selector Tabs */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pb-3 mb-6 custom-scrollbar">
          {CATALOGS_DATA.map((cat) => {
            const isSelected = activeCatalogId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleTabChange(cat.id)}
                className={`flex-shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? "bg-[#0a3d52] dark:bg-[#ff6b4a] text-white border-[#0a3d52] dark:border-[#ff6b4a] shadow-sm"
                    : "bg-white dark:bg-[#0e2735] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                }`}
              >
                {cat.title.split("&")[0]}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (4 Cols): Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-4 space-y-4 sticky top-24">
            <div className="rounded-3xl p-5 bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-md">
              <div className="flex items-center gap-2 text-[#0a3d52] dark:text-white font-bold text-xs uppercase tracking-wider mb-4 px-2">
                <MenuBookOutlinedIcon sx={{ fontSize: 18, color: "#ff6b4a" }} />
                <span>Available Technical Manuals</span>
              </div>

              <div className="space-y-3">
                {CATALOGS_DATA.map((cat) => {
                  const isSelected = activeCatalogId === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleTabChange(cat.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all border ${
                        isSelected
                          ? "bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] text-white border-[#0a3d52] shadow-md dark:from-[#ff6b4a] dark:to-[#f35231] dark:border-[#ff6b4a]"
                          : "bg-slate-50 dark:bg-[#0c222e] text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                            isSelected
                              ? "bg-white/20 text-white"
                              : "bg-[#0a3d52]/10 dark:bg-sky-500/20 text-[#0a3d52] dark:text-sky-300"
                          }`}
                        >
                          {cat.badge}
                        </span>
                        <span className={`text-[11px] font-semibold ${isSelected ? "text-white/80" : "text-slate-400"}`}>
                          {cat.pages.length} Pages
                        </span>
                      </div>

                      <h4 className="font-bold text-sm leading-snug mb-1">
                        {cat.title}
                      </h4>
                      <p
                        className={`text-xs line-clamp-2 leading-relaxed ${
                          isSelected ? "text-slate-200" : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {cat.description}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Page Jump Thumbnail Strip */}
            <div className="rounded-3xl p-5 bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#0a3d52] dark:text-white mb-3">
                Page Index Navigation ({selectedCatalog.pages.length} Pages)
              </h4>
              <div className="grid grid-cols-5 gap-2">
                {selectedCatalog.pages.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => scrollToPage(idx)}
                    className="aspect-[3/4] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 hover:border-[#ff6b4a] hover:scale-105 transition-all relative group bg-slate-100 dark:bg-slate-800"
                  >
                    <img src={p} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                    <span className="absolute bottom-0 inset-x-0 bg-black/70 text-white text-[9px] font-bold text-center py-0.5">
                      P.{idx + 1}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Stamped Package WhatsApp Help Box */}
            <div className="rounded-3xl p-5 bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg">
              <h4 className="font-black text-sm uppercase tracking-wider mb-1">Need Stamped Submittal?</h4>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Our materials directorate can issue officially stamped and signed technical submittal sets for tender bidding.
              </p>
              <a
                href="https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20need%20an%20official%20stamped%20submittal%20set%20for%20a%20tender."
                target="_blank"
                rel="noreferrer"
                className="w-full py-2.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <WhatsAppIcon sx={{ fontSize: 16 }} />
                <span>WhatsApp Submittals</span>
              </a>
            </div>

          </div>

          {/* Right Column (8 Cols): High-Definition Multi-Page Stream */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Catalog Info Header Bar */}
            <div className="rounded-2xl sm:rounded-3xl p-5 sm:p-7 bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="py-0.5 px-2.5 rounded-md bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/20 text-[#ff6b4a] dark:text-[#ff8c73] font-bold text-[10.5px] uppercase tracking-wider border border-[#ff6b4a]/20">
                    {selectedCatalog.category}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    • {selectedCatalog.pages.length} Total Pages
                  </span>
                </div>
                <h2
                  className="text-xl sm:text-2xl font-black text-[#0a3d52] dark:text-white"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {selectedCatalog.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                  {selectedCatalog.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openLightbox(0)}
                  className="px-4 py-2.5 rounded-xl bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <FullscreenRoundedIcon sx={{ fontSize: 18 }} />
                  <span>Fullscreen</span>
                </button>

                <a
                  href={selectedCatalog.pages[0]}
                  download
                  className="px-4 py-2.5 rounded-xl bg-[#ff6b4a] hover:bg-[#f35231] text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md transition-all active:scale-95"
                >
                  <DownloadRoundedIcon sx={{ fontSize: 17 }} />
                  <span>Download</span>
                </a>
              </div>
            </div>

            {/* Pages Stream Cards */}
            <div className="space-y-6">
              {selectedCatalog.pages.map((pageImg, idx) => (
                <div
                  id={`catalog-page-${idx}`}
                  key={idx}
                  className="catalog-page-card rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-[#0e2735] shadow-md group transition-all"
                >
                  {/* Page Top Bar */}
                  <div className="px-4 py-3 bg-slate-50 dark:bg-[#0c222e] border-b border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-[#0a3d52] text-white flex items-center justify-center font-black text-[11px]">
                        {idx + 1}
                      </span>
                      <span>Page {idx + 1} of {selectedCatalog.pages.length}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openLightbox(idx)}
                        className="text-xs font-bold text-[#0a3d52] dark:text-sky-300 hover:text-[#ff6b4a] flex items-center gap-1 transition-colors"
                      >
                        <FullscreenRoundedIcon sx={{ fontSize: 16 }} />
                        <span>Enlarge</span>
                      </button>

                      <a
                        href={pageImg}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-bold text-slate-500 hover:text-[#0a3d52] dark:hover:text-white flex items-center gap-1 transition-colors"
                      >
                        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                        <span>Full Resolution</span>
                      </a>

                      <a
                        href={pageImg}
                        download={`MARBLEX_${selectedCatalog.id}_page_${idx + 1}.jpg`}
                        className="text-xs font-bold text-[#ff6b4a] hover:underline flex items-center gap-1"
                      >
                        <DownloadRoundedIcon sx={{ fontSize: 15 }} />
                        <span>Save</span>
                      </a>
                    </div>
                  </div>

                  {/* Page Image */}
                  <div
                    onClick={() => openLightbox(idx)}
                    className="p-3 sm:p-6 bg-slate-100 dark:bg-[#091b24] flex items-center justify-center cursor-zoom-in relative"
                  >
                    <img
                      src={pageImg}
                      alt={`${selectedCatalog.title} - Page ${idx + 1}`}
                      loading="lazy"
                      className="w-full h-auto max-h-[850px] object-contain rounded-xl shadow-md group-hover:scale-[1.01] transition-transform duration-300"
                    />
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>
      </section>

      {/* ==================== 4. LIGHTBOX MODAL VIEWER ==================== */}
      {lightboxOpen && (
        <div
          onClick={closeLightbox}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200"
        >
          {/* Modal Content Box */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-5xl w-full max-h-[95vh] flex flex-col rounded-2xl overflow-hidden bg-[#0c222e] border border-white/20 shadow-2xl"
          >
            {/* Modal Header */}
            <div className="p-3 sm:p-4 bg-[#081822] border-b border-white/10 flex items-center justify-between text-white">
              <div className="flex items-center gap-2.5">
                <span className="py-0.5 px-2 rounded bg-[#ff6b4a] text-white font-black text-xs">
                  {lightboxPageIndex + 1} / {selectedCatalog.pages.length}
                </span>
                <span className="text-xs sm:text-sm font-bold truncate max-w-[240px] sm:max-w-md">
                  {selectedCatalog.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedCatalog.pages[lightboxPageIndex]}
                  download
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                >
                  <DownloadRoundedIcon sx={{ fontSize: 16 }} />
                  <span className="hidden sm:inline">Download</span>
                </a>

                <button
                  onClick={closeLightbox}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-[#ff6b4a] text-white transition-colors"
                >
                  <CloseRoundedIcon sx={{ fontSize: 20 }} />
                </button>
              </div>
            </div>

            {/* Main Lightbox Image Viewport */}
            <div className="flex-1 overflow-auto p-4 flex items-center justify-center relative bg-[#091b24] min-h-[400px]">
              <img
                src={selectedCatalog.pages[lightboxPageIndex]}
                alt={`Full View Page ${lightboxPageIndex + 1}`}
                className="max-h-[80vh] w-auto object-contain rounded-lg shadow-2xl"
              />

              {/* Prev Button */}
              <button
                onClick={prevLightboxPage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff6b4a] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
              >
                <NavigateBeforeRoundedIcon sx={{ fontSize: 28 }} />
              </button>

              {/* Next Button */}
              <button
                onClick={nextLightboxPage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-[#ff6b4a] text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg"
              >
                <NavigateNextRoundedIcon sx={{ fontSize: 28 }} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== 5. BOTTOM MASTER CTA ==================== */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#072431] text-white shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b4a]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl z-10">
            <span className="inline-block py-1 px-3.5 rounded-full bg-[#ff6b4a]/20 text-[#ff8c73] font-bold text-xs uppercase tracking-widest mb-3 border border-[#ff6b4a]/30">
              Architectural & Tender Submittals
            </span>
            <h3
              className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Need Custom CAD Details or Technical Support?
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Our polymer and geotechnical civil engineers provide custom joint drawings, chemical compatibility matrices, and direct consultation for your project.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 z-10 w-full lg:w-auto">
            <a
              href="tel:03084585792"
              className="px-7 py-4 rounded-xl bg-[#ff6b4a] hover:bg-[#f35231] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all text-center"
            >
              Call 0348-1116611
            </a>
            <a
              href="https://wa.me/923084585792?text=Hello%20MARBLEX%20Engineering%2C%20I%20need%20custom%20CAD%20drawings%20and%20technical%20data."
              target="_blank"
              rel="noreferrer"
              className="px-7 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

    </div>
  );
};
