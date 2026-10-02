import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import FlashOnRoundedIcon from "@mui/icons-material/FlashOnRounded";
import { http } from "../api/http";
import { BlogCardSkeleton } from "../components/LoaderSkeleton";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import gsap from "gsap";

// Curated default technical articles if backend has limited entries
const DEFAULT_FALLBACK_BLOGS = [
  {
    _id: "crystalline-vs-membrane",
    title: "Hydrophilic Crystalline vs Bituminous Torch-On: Geotechnical Basement Waterproofing Analysis",
    slug: "crystalline-vs-bituminous-waterproofing",
    summary:
      "A comprehensive structural comparison of hydrophilic crystalline chemical penetration versus multi-ply APP torch-on membranes under high hydrostatic water table conditions in South Asian subsoils.",
    content: `When designing subterranean civil foundations and retaining walls subject to sustained hydrostatic head pressure, civil structural engineers must choose between monolithic active crystalline waterproofing and physical elastomeric torch-on membranes.

Crystalline chemical formulations penetrate deep into the concrete's capillary tract, reacting with free lime and unhydrated cement particles to precipitate insoluble needle-like crystals. These crystals effectively block pores up to 0.4mm in diameter and remain dormant until reactivated by future moisture ingress.

Conversely, APP modified bituminous membranes provide a continuous puncture-resistant flexible sheet barrier. In this technical article, we evaluate ASTM C836 elongation standards, crack-bridging metrics, and cost per square foot for deep foundations across Pakistan.`,
    coverImage: "/about/about_desktop_lab.jpg",
    tags: ["Waterproofing", "ASTM Standards", "Foundation Engineering"],
    author: "Engr. Muhammad Tariq (Chief Materials Consultant)",
    authorRole: "Structural Chemical Specialist",
    createdAt: "2026-03-15T10:00:00Z",
    readTime: "6 min read",
    views: "3.4k",
  },
  {
    _id: "rubber-waterstop-welding",
    title: "Expansion Joint Integrity: Correct Heat Welding & Placement SOPs for Hydro-Structure Rubber Waterstops",
    slug: "rubber-waterstop-heat-welding-sops",
    summary:
      "Field engineering guide on avoiding honeycomb voids, center-bulb misalignment, and joint tearing in high-tensile neoprene and natural rubber waterstops for water reservoirs and spillways.",
    content: `Rubber waterstops are the critical defense line against high-pressure water passage through construction and expansion joints in massive concrete hydraulic structures such as dams, water treatment facilities, and underground parking rafts.

Improper placement or flawed field vulcanization/heat-welding represents over 78% of all joint leakage failures reported post-commissioning. This technical paper details the exact temperature curves required for thermoplastic welding irons, proper tie-wire fixing to rebar cages, and the ASTM D412 tensile testing requirements to ensure zero leakage under 5+ bar head pressure.`,
    coverImage: "/about/about_desktop_manufacturing.jpg",
    tags: ["Rubber Waterstops", "Joint Design", "Hydraulic Civil"],
    author: "MARBLEX Technical Advisory Desk",
    authorRole: "Polymer & Compounding Division",
    createdAt: "2026-03-02T14:30:00Z",
    readTime: "8 min read",
    views: "2.8k",
  },
  {
    _id: "thermal-insulation-xps",
    title: "Thermal Bridging Mitigation: Extruded Polystyrene (XPS) vs Polyurethane Spray for Commercial Roof Slabs",
    slug: "xps-vs-pu-thermal-insulation-pakistan",
    summary:
      "Energy modeling and HVAC load calculations demonstrating how 50mm high-density XPS slabs reduce roof heat flux by up to 82% during extreme 45°C summer ambient temperatures.",
    content: `In arid and sub-tropical climates with summer peak temperatures exceeding 45°C, uninsulated concrete roof slabs act as massive thermal radiators, transferring immense conductive heat into building interiors.

By deploying high-density closed-cell Extruded Polystyrene (XPS) insulation boards with a declared thermal conductivity (k-value) of 0.028 W/m·K beneath elastomeric reflective topcoats, building envelopes achieve dramatic reductions in cooling loads. We review lifecycle cost payback periods and compressive strength requirements for pedestrian rooftop terraces.`,
    coverImage: "/about/about_desktop_engineering.jpg",
    tags: ["Thermal Insulation", "Energy Efficiency", "Roof Protection"],
    author: "Dr. Salman Qureshi (Energy & Building Physics)",
    authorRole: "Senior Building Envelope Consultant",
    createdAt: "2026-02-18T09:15:00Z",
    readTime: "5 min read",
    views: "4.1k",
  },
  {
    _id: "pu-injection-grouting-leak-stop",
    title: "High-Pressure Polyurethane (PU) Injection Grouting: Active Gushing Water Leak Arrest SOP",
    slug: "pu-injection-grouting-active-leak-arrest",
    summary:
      "Step-by-step applicator protocol for drilling 45-degree angled injection ports, installing steel mechanical packers, and pumping dual-component hydrophobic PU resins under 250 bar pressure.",
    content: `Active high-volume water leaks occurring through basement cold joints, honeycomb voids, or structural settlement cracks cannot be resolved through external surface coatings. High-pressure polyurethane grouting provides an immediate hydraulic seal by utilizing water-reactive resins that foam and expand up to 30 times their original liquid volume in seconds.

This engineering manual outlines the essential packer spacing geometry, pump pressure regulation, and resin viscosity selection for stopping live leaks in elevator pits and subterranean chambers.`,
    coverImage: "/assets/brochures/real_one_page_3.jpg",
    tags: ["PU Injection", "Concrete Repair", "Active Leak Stop"],
    author: "Engr. Bilal Hashmi",
    authorRole: "Site Injection Lead Specialist",
    createdAt: "2026-01-29T11:45:00Z",
    readTime: "7 min read",
    views: "5.2k",
  },
  {
    _id: "epoxy-flooring-chemical-plants",
    title: "Industrial Floor Screeds: Selecting Epoxy vs Polyurethane Concrete for Heavy Chemical & Forklift Traffic",
    slug: "industrial-epoxy-vs-pu-flooring-specifications",
    summary:
      "Material durability guide covering compressive strength, chemical splash resistance, thermal shock endurance, and anti-slip textures for pharmaceutical, automotive, and food processing plants.",
    content: `Manufacturing environments subject concrete substrates to aggressive chemical spills, heavy forklift tire abrasion, and rigorous washdowns. Standard unsealed concrete rapidly degrades under acidic or alkaline exposure, producing concrete dust and structural pitting.

This paper examines seamless 3mm to 6mm high-build self-leveling epoxy coatings versus heavy-duty polyurethane resin screeds. We compare resistance ratings against sulfuric acid, solvents, and thermal shock from steam cleaning.`,
    coverImage: "/assets/brochures/Profile_marblex_page_4.jpg",
    tags: ["Industrial Flooring", "Epoxy Screeds", "Chemical Resistance"],
    author: "MARBLEX Polymer Engineering Unit",
    authorRole: "Flooring Systems Technical Team",
    createdAt: "2026-01-12T16:00:00Z",
    readTime: "6 min read",
    views: "3.9k",
  },
  {
    _id: "pre-construction-termite-barrier",
    title: "Sub-Slab Termite Chemical Barrier: Long-Term Soil Treatment Standards for New Civil Construction",
    slug: "sub-slab-termite-chemical-barrier-guide",
    summary:
      "Comprehensive guidelines on establishing continuous horizontal and vertical chemical zones beneath foundation plinths and along utility pipe penetrations before slab casting.",
    content: `Subterranean termites cause billions of rupees in structural timber and interior finish damage annually across South Asia. Applying non-repellent high-persistence termiticides into foundation trenches, backfill soil, and sub-slab compacted gravel prior to moisture barrier laying creates an impenetrable toxicological perimeter.

This technical guide specifies the exact application volume (liters per square meter) and soil moisture preparation necessary to guarantee 10+ years of termite-free structural protection.`,
    coverImage: "/about/about_desktop_headquarters.jpg",
    tags: ["Termite Barrier", "Soil Treatment", "Pre-Construction"],
    author: "Engr. Khalid Mehmood",
    authorRole: "Pest Management & Civil Consultant",
    createdAt: "2025-12-20T13:20:00Z",
    readTime: "5 min read",
    views: "2.5k",
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "All Technical Papers" },
  { id: "waterproofing", label: "Waterproofing Systems" },
  { id: "waterstops", label: "Rubber Waterstops" },
  { id: "insulation", label: "Thermal Insulation" },
  { id: "injection", label: "PU Injection & Repair" },
  { id: "flooring", label: "Industrial Flooring" },
];

export const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [emailSubscribe, setEmailSubscribe] = useState("");
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);

    http
      .get("/blogs")
      .then((res) => {
        const fetched = Array.isArray(res.data) && res.data.length > 0 ? res.data : [];
        // Combine fetched with fallback default articles for rich experience
        const merged = [
          ...fetched,
          ...DEFAULT_FALLBACK_BLOGS.filter(
            (def) => !fetched.some((f) => f._id === def._id || f.title === def.title)
          ),
        ];
        setBlogs(merged);
      })
      .catch(() => {
        setBlogs(DEFAULT_FALLBACK_BLOGS);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!pageRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".blog-hero-anim",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );
      gsap.fromTo(
        ".blog-card-item",
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.15, ease: "power2.out" }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [blogs, activeCategory, searchQuery]);

  // Filter and Sort Logic
  const filteredBlogs = useMemo(() => {
    return blogs
      .filter((blog) => {
        // Search filter
        const matchSearch =
          !searchQuery.trim() ||
          blog.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          blog.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

        // Category filter
        if (!matchSearch) return false;
        if (activeCategory === "all") return true;
        if (activeCategory === "waterproofing") {
          return (
            blog.tags?.some((t) => t.toLowerCase().includes("waterproof")) ||
            blog.title?.toLowerCase().includes("waterproof")
          );
        }
        if (activeCategory === "waterstops") {
          return (
            blog.tags?.some((t) => t.toLowerCase().includes("waterstop") || t.toLowerCase().includes("rubber")) ||
            blog.title?.toLowerCase().includes("waterstop")
          );
        }
        if (activeCategory === "insulation") {
          return (
            blog.tags?.some((t) => t.toLowerCase().includes("insulation") || t.toLowerCase().includes("thermal")) ||
            blog.title?.toLowerCase().includes("thermal") ||
            blog.title?.toLowerCase().includes("xps")
          );
        }
        if (activeCategory === "injection") {
          return (
            blog.tags?.some((t) => t.toLowerCase().includes("injection") || t.toLowerCase().includes("repair")) ||
            blog.title?.toLowerCase().includes("injection") ||
            blog.title?.toLowerCase().includes("leak")
          );
        }
        if (activeCategory === "flooring") {
          return (
            blog.tags?.some((t) => t.toLowerCase().includes("floor") || t.toLowerCase().includes("epoxy")) ||
            blog.title?.toLowerCase().includes("epoxy") ||
            blog.title?.toLowerCase().includes("floor")
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
        }
        return (a.title || "").localeCompare(b.title || "");
      });
  }, [blogs, searchQuery, activeCategory, sortBy]);

  const featuredBlog = useMemo(() => {
    return blogs[0] || DEFAULT_FALLBACK_BLOGS[0];
  }, [blogs]);

  const getReadingTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!emailSubscribe) return;
    setSubscribeSuccess(true);
    setEmailSubscribe("");
  };

  return (
    <div ref={pageRef} className="min-h-screen text-[#0b2f3c] dark:text-[#eaf3f7] pb-24 overflow-x-hidden">
      
      {/* ==================== 1. HERO SECTION (SPLIT MODERN HERO) ==================== */}
      <section className="relative pt-6 sm:pt-10 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8 border-b border-slate-200/80 dark:border-[#1f3d4a] overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-100/60 dark:from-[#091b24] dark:via-[#0c222e] dark:to-[#091b24]">
        {/* Ambient Glows */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#ff6b4a]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 left-10 w-80 h-80 bg-[#0a3d52]/10 dark:bg-sky-500/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-[1280px] mx-auto relative z-10 blog-hero-anim">
          {/* Breadcrumb */}
          <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mb-4 sm:mb-6 font-medium flex items-center gap-1.5">
            <RouterLink to="/" className="hover:text-[#0a3d52] dark:hover:text-sky-400 transition-colors">
              Home
            </RouterLink>
            <span>/</span>
            <span className="text-[#0a3d52] dark:text-white font-semibold">Technical Research & Articles</span>
          </div>

          {/* Split Hero Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.15fr_0.85fr] gap-8 lg:gap-12 items-center">
            
            {/* Left Content */}
            <div>
              <div className="inline-flex items-center gap-2 py-1.5 px-3.5 sm:px-4 rounded-full bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/20 text-[#ff6b4a] dark:text-[#ff8c73] font-bold text-xs tracking-wider uppercase mb-4 sm:mb-5 border border-[#ff6b4a]/30 backdrop-blur-md shadow-2xs">
                <MenuBookOutlinedIcon sx={{ fontSize: 16 }} />
                <span>MARBLEX Engineering Knowledge Hub</span>
              </div>

              <h1
                className="text-3xl sm:text-5xl lg:text-[54px] font-black text-[#0a3d52] dark:text-white tracking-tight mb-4 sm:mb-6 leading-[1.15]"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                Civil Engineering &{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] via-[#ff8c73] to-[#0a3d52] dark:to-sky-400">
                  Material Science Insights.
                </span>
              </h1>

              <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed mb-6 sm:mb-8 max-w-xl">
                Peer-reviewed chemical application guides, ASTM material testing protocols, failure analysis of waterproofing membranes, and advanced joint sealing methods for mega-structures in Pakistan.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3.5 mb-8">
                <a
                  href="#articles-stream"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-[#0a3d52]/25 hover:shadow-xl active:scale-95 transition-all cursor-pointer"
                >
                  <ArticleOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Explore Research Papers</span>
                </a>

                <RouterLink
                  to="/catalogs"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 dark:bg-[#112832] hover:bg-slate-200 dark:hover:bg-[#163544] text-[#0a3d52] dark:text-white font-bold text-xs sm:text-sm uppercase tracking-wider border border-slate-300 dark:border-slate-700 transition-all cursor-pointer"
                >
                  <MenuBookOutlinedIcon sx={{ fontSize: 18 }} />
                  <span>Technical Catalogs</span>
                </RouterLink>

                <a
                  href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20would%20like%20to%20request%20a%20technical%20whitepaper."
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span>Request Paper</span>
                </a>
              </div>

              {/* 3 Value Badges */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-6 border-t border-slate-200/90 dark:border-[#1f3d4a]/80 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                    <VerifiedOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">ASTM & DIN</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Standard References</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
                    <EngineeringOutlinedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">Field Engineers</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Written by Experts</div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-1 sm:gap-2.5">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-orange-50 dark:bg-orange-950/50 text-[#ff6b4a] flex items-center justify-center shrink-0">
                    <FlashOnRoundedIcon sx={{ fontSize: 18 }} />
                  </div>
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white">Free Access</div>
                    <div className="text-[10.5px] sm:text-xs text-slate-500 dark:text-slate-400">Open Knowledge</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Visual Frame */}
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#0a3d52] to-[#ff6b4a] rounded-3xl sm:rounded-[36px] opacity-20 blur-xl group-hover:opacity-30 transition duration-700 pointer-events-none" />

              <div className="relative rounded-2xl sm:rounded-[30px] overflow-hidden border-2 border-white/80 dark:border-slate-700/80 shadow-2xl bg-slate-100 dark:bg-[#0c222e]">
                <img
                  src="/about/about_desktop_lab.jpg"
                  alt="MARBLEX Material Testing Laboratory & Chemical Analysis"
                  className="w-full h-[280px] sm:h-[380px] lg:h-[420px] object-cover object-center group-hover:scale-104 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/85 via-transparent to-black/20 pointer-events-none" />

                {/* Floating HUD Card 1 */}
                <div className="absolute top-3 sm:top-4 left-3 sm:left-4 p-2.5 sm:p-3 rounded-2xl bg-white/95 dark:bg-[#0c222e]/95 backdrop-blur-md border border-white/40 dark:border-slate-700 shadow-lg flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#0a3d52] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <ArticleOutlinedIcon sx={{ fontSize: 19, color: "#38bdf8" }} />
                  </div>
                  <div>
                    <span className="text-[11px] sm:text-xs font-bold text-[#0a3d52] dark:text-white block">
                      50+ Technical Guides
                    </span>
                    <span className="text-[9.5px] sm:text-[10px] text-slate-500 dark:text-slate-400">
                      Regularly Updated by Staff
                    </span>
                  </div>
                </div>

                {/* Floating HUD Card 2 */}
                <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 p-2.5 sm:p-3 rounded-2xl bg-[#0a3d52]/95 dark:bg-[#081822]/95 backdrop-blur-md border border-white/20 shadow-xl text-white flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#ff6b4a] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <VerifiedOutlinedIcon sx={{ fontSize: 20 }} />
                  </div>
                  <div>
                    <div className="text-[11px] sm:text-xs font-bold text-white">Peer Reviewed</div>
                    <div className="text-[9.5px] sm:text-[10px] text-slate-300 font-medium">Civil Engineering Rigor</div>
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

      {/* ==================== 3. SPOTLIGHT / FEATURED RESEARCH PAPER ==================== */}
      {featuredBlog && (
        <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-12 sm:mt-16">
          <div
            onClick={() => navigate(`/blogs/${featuredBlog._id}`)}
            className="group rounded-3xl p-6 sm:p-10 bg-gradient-to-br from-[#0a3d52] via-[#0d4e68] to-[#082936] text-white shadow-2xl relative overflow-hidden border border-white/10 cursor-pointer hover:border-[#ff6b4a]/60 transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
            <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#ff6b4a]/20 rounded-full blur-3xl pointer-events-none" />

            <div className="lg:col-span-7 z-10">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="py-1 px-3 rounded-full bg-[#ff6b4a] text-white font-bold text-[11px] uppercase tracking-wider shadow-sm">
                  ★ Spotlight Technical Paper
                </span>
                <span className="py-1 px-3 rounded-full bg-white/10 backdrop-blur-md text-slate-200 font-semibold text-[11px]">
                  {featuredBlog.readTime || getReadingTime(featuredBlog.content)}
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-4 leading-tight group-hover:text-[#ff8c73] transition-colors"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                {featuredBlog.title}
              </h2>

              <p className="text-xs sm:text-sm text-slate-200 line-clamp-3 mb-6 leading-relaxed font-normal">
                {featuredBlog.summary || featuredBlog.content}
              </p>

              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-white/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ff6b4a] text-white flex items-center justify-center font-black text-xs shadow-md">
                    MX
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">
                      {featuredBlog.author || "MARBLEX Materials Directorate"}
                    </div>
                    <div className="text-[10.5px] text-slate-300">
                      {new Date(featuredBlog.createdAt || Date.now()).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white text-[#0a3d52] font-bold text-xs uppercase tracking-wider group-hover:bg-[#ff6b4a] group-hover:text-white transition-all shadow-md">
                  <span>Read Full Article</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 z-10">
              <div className="rounded-2xl overflow-hidden border-2 border-white/20 shadow-xl bg-slate-800 relative h-64 sm:h-72">
                <img
                  src={featuredBlog.coverImage || "/about/about_desktop_lab.jpg"}
                  alt={featuredBlog.title}
                  className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== 4. SEARCH, CATEGORIES & ARTICLE STREAM ==================== */}
      <section id="articles-stream" className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-14 sm:mt-20">
        
        {/* Controls Bar: Search & Sort */}
        <div className="rounded-2xl sm:rounded-3xl p-4 sm:p-6 bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-md mb-8 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <SearchRoundedIcon
              sx={{ fontSize: 20 }}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search engineering papers, ASTM codes, waterproofing topics..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0c222e] border border-slate-200 dark:border-slate-700 text-xs sm:text-sm text-slate-800 dark:text-white placeholder-slate-400 focus:bg-white dark:focus:bg-[#091b24] focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
            />
          </div>

          {/* Sort Dropdown & Count */}
          <div className="flex items-center gap-3 justify-between md:justify-end">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Showing <span className="font-bold text-[#0a3d52] dark:text-white">{filteredBlogs.length}</span> papers
            </span>

            <div className="flex items-center gap-2">
              <FilterListRoundedIcon sx={{ fontSize: 18 }} className="text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-xs font-bold bg-slate-50 dark:bg-[#0c222e] border border-slate-200 dark:border-slate-700 text-[#0a3d52] dark:text-white rounded-xl px-3 py-2 focus:outline-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Alphabetical</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 custom-scrollbar">
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all border ${
                  isSelected
                    ? "bg-[#0a3d52] dark:bg-[#ff6b4a] text-white border-[#0a3d52] dark:border-[#ff6b4a] shadow-sm"
                    : "bg-white dark:bg-[#0e2735] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Grid of Articles */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <BlogCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <SearchRoundedIcon sx={{ fontSize: 28 }} />
            </div>
            <h3 className="text-lg font-bold text-[#0a3d52] dark:text-white">No articles matched your criteria</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 mb-4">
              Try adjusting your search terms or selecting another category filter.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setActiveCategory("all");
              }}
              className="px-5 py-2.5 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredBlogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => navigate(`/blogs/${blog._id}`)}
                className="blog-card-item group rounded-3xl bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-2xl hover:border-[#ff6b4a]/50 transition-all duration-300 flex flex-col h-full cursor-pointer overflow-hidden"
              >
                {/* Cover Image */}
                <div className="h-52 overflow-hidden relative bg-slate-100 dark:bg-slate-800">
                  <img
                    src={blog.coverImage || "/about/about_desktop_lab.jpg"}
                    alt={blog.title}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                  {/* Category Tag Pill */}
                  <div className="absolute top-3.5 left-3.5 flex gap-1.5 flex-wrap">
                    {(blog.tags || ["Technical Article"]).slice(0, 2).map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className="bg-[#0a3d52]/90 dark:bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border border-white/20 shadow-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="absolute bottom-3 right-3.5 bg-black/60 backdrop-blur-md text-white text-[10.5px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                    <span>{blog.readTime || getReadingTime(blog.content)}</span>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-6 sm:p-7 flex flex-col flex-1">
                  
                  {/* Meta Bar */}
                  <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-3">
                    <span className="flex items-center gap-1">
                      <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                      {new Date(blog.createdAt || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span className="text-[#ff6b4a] font-bold">MARBLEX Research</span>
                  </div>

                  {/* Title */}
                  <h3
                    className="text-lg sm:text-xl font-bold text-[#0a3d52] dark:text-white mb-3 line-clamp-2 leading-snug group-hover:text-[#ff6b4a] transition-colors"
                    style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                  >
                    {blog.title}
                  </h3>

                  {/* Snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed mb-6 flex-1 font-normal">
                    {blog.summary || blog.content}
                  </p>

                  {/* Card Bottom Footer */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#0a3d52] text-white flex items-center justify-center font-bold text-[10px]">
                        MX
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {blog.author?.split(" ")[0] || "Author"}
                      </span>
                    </div>

                    <span className="text-xs font-bold text-[#ff6b4a] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      Read Paper <ArrowForwardRoundedIcon sx={{ fontSize: 14 }} />
                    </span>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

      </section>

      {/* ==================== 5. NEWSLETTER & RESEARCH DISPATCH BANNER ==================== */}
      <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 sm:mt-24">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#072431] text-white shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col lg:flex-row items-center justify-between gap-8 border border-white/10">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ff6b4a]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-xl z-10">
            <span className="inline-block py-1 px-3.5 rounded-full bg-[#ff6b4a]/20 text-[#ff8c73] font-bold text-xs uppercase tracking-widest mb-3 border border-[#ff6b4a]/30">
              Technical Research Digest
            </span>
            <h3
              className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Subscribe to Engineering Bulletins
            </h3>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Get monthly ASTM updates, failure analysis reports, and chemical application formulas delivered directly to your inbox.
            </p>
          </div>

          <div className="z-10 w-full lg:w-auto min-w-[320px] sm:min-w-[380px]">
            {subscribeSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-200 text-xs sm:text-sm font-bold text-center">
                ✓ Thank you for subscribing to MARBLEX Technical Bulletins!
              </div>
            ) : (
              <form onSubmit={handleNewsletter} className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="email"
                  value={emailSubscribe}
                  onChange={(e) => setEmailSubscribe(e.target.value)}
                  required
                  placeholder="Enter engineer / firm email"
                  className="px-4 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-300 text-xs sm:text-sm focus:outline-none focus:bg-white/20 focus:border-[#ff6b4a] flex-1"
                />
                <button
                  type="submit"
                  className="px-6 py-3.5 rounded-xl bg-[#ff6b4a] hover:bg-[#f35231] text-white font-bold text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  Subscribe
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

    </div>
  );
};
