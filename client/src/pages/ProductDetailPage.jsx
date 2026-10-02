import { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import StarIcon from "@mui/icons-material/Star";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import FactCheckOutlinedIcon from "@mui/icons-material/FactCheckOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import LayersOutlinedIcon from "@mui/icons-material/LayersOutlined";
import FavoriteBorderRoundedIcon from "@mui/icons-material/FavoriteBorderRounded";
import FavoriteRoundedIcon from "@mui/icons-material/FavoriteRounded";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import ZoomInOutlinedIcon from "@mui/icons-material/ZoomInOutlined";
import { authHeaders, http } from "../api/http";
import { getAuthToken } from "../auth/session";
import { ProductDetailSkeleton } from "../components/LoaderSkeleton";
import { EnterpriseMetricsBar } from "../components/EnterpriseMetricsBar";
import gsap from "gsap";

const ASSURANCE = [
  {
    title: "10-Year Warranty",
    subtitle: "Certified structural life",
    tone: "emerald",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L3 6V12C3 17.5228 6.84278 22.5028 12 23.95C17.1572 22.5028 21 17.5228 21 12V6L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "ASTM D412 Tested",
    subtitle: "Lab certified metrics",
    tone: "sky",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 15H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
      </svg>
    ),
  },
  {
    title: "Zero-VOC Eco Safe",
    subtitle: "Odorless & non-toxic",
    tone: "emerald",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M20.24 12.24C21.09 7.74 18.06 4.14 13.9 3.09C9.74 2.04 5.34 3.73 3.5 7.5C1.66 11.27 2.76 16.35 6.13 18.97C9.5 21.59 14.54 21.24 17.5 18.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
        <path d="M4 20L11.5 12.5C13.5 10.5 16.5 9.5 19.5 9.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "Express Dispatch",
    subtitle: "Nationwide safe transit",
    tone: "orange",
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
        <path d="M1 4H15V16H1V4Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M15 8H19L22 11V16H15V8Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="5.5" cy="18.5" r="2.2" stroke="currentColor" strokeWidth="1.75" />
        <circle cx="18.5" cy="18.5" r="2.2" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
];

const VALUE_PROPS = [
  {
    title: "Durability 15+ Years",
    desc: "Engineered for heavy traffic and extreme weather resilience.",
    tone: "emerald",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" />
        <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "ASTM & ISO Certified",
    desc: "Meets ASTM F1700 / D412 international lab standards.",
    tone: "orange",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.75" />
        <path d="M15.5 13.5L18 21L12 18.5L6 21L8.5 13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    title: "100% Waterproof Seal",
    desc: "Hydrostatic barrier against moisture, spills, and chemical stains.",
    tone: "sky",
    icon: (
      <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none">
        <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    ),
  },
];

const toneBox = {
  emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400",
  sky: "bg-sky-50 text-sky-600 dark:bg-sky-950/60 dark:text-sky-400",
  orange: "bg-[#ff6b4a]/10 text-[#ff6b4a]",
};

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
  const [loading, setLoading] = useState(!location.state?.product);
  const [addedToast, setAddedToast] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favBusy, setFavBusy] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [descNeedsToggle, setDescNeedsToggle] = useState(false);
  const containerRef = useRef(null);
  const descRef = useRef(null);

  const defaultGallery = [
    "/products/Banner1.jpeg",
    "/products/Banner2.jpeg",
    "/products/Banner3.jpeg",
    "/products/Banner4.jpeg",
  ];

  const galleryImages = (
    product?.imageUrl
      ? [product.imageUrl, ...(product.extraImages || []), ...defaultGallery]
      : defaultGallery
  )
    .filter((v, i, a) => typeof v === "string" && v.trim() && a.indexOf(v) === i)
    .slice(0, 4);

  const currentImage = galleryImages[selectedImageIndex] || galleryImages[0];

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: "smooth" });
    setQuantity(1);
    setSelectedImageIndex(0);
    setDescExpanded(false);

    if (location.state?.product && location.state.product._id === id) {
      setProduct(location.state.product);
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    if (!id || product?._id === id) {
      setLoading(false);
      return () => {
        mounted = false;
      };
    }

    setLoading(true);
    http
      .get(`/products/${id}`)
      .then((res) => {
        if (mounted) setProduct(res.data || null);
      })
      .catch(() => {
        if (mounted) setProduct(null);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
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
          setMoreProducts(
            [
              ...filtered,
              { _id: "rel-1", name: "Basalt Grey Tiles", price: 4000, reviewsCount: 518, rating: 4.9, imageUrl: "/products/Banner4.jpeg" },
              { _id: "rel-2", name: "Oak Wood-Effect Flooring", price: 4000, reviewsCount: 128, rating: 4.9, imageUrl: "/products/Banner1.jpeg" },
              { _id: "rel-3", name: "Installation Kit", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner2.jpeg" },
              { _id: "rel-4", name: "Maintenance Solution", price: 4000, reviewsCount: 9, rating: 5.0, imageUrl: "/products/Banner3.jpeg" },
            ].slice(0, 4)
          );
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
      const ctx = gsap.context(() => {
        gsap.fromTo(
          containerRef.current.querySelectorAll(".anim-reveal"),
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.07, ease: "power2.out" }
        );
      }, containerRef);
      return () => ctx.revert();
    }
  }, [loading, product]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({ ...product, quantity, selectedMaterial, selectedColor });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  const toggleFavorite = async () => {
    const token = getAuthToken();
    if (!token) {
      navigate("/login");
      return;
    }
    if (!product?._id || favBusy) return;
    setFavBusy(true);
    try {
      if (isFavorite) {
        await http.delete(`/portal/favorites/${product._id}`, authHeaders(token));
        setIsFavorite(false);
      } else {
        await http.post("/portal/favorites", { productId: product._id }, authHeaders(token));
        setIsFavorite(true);
      }
    } catch {
      // ignore
    } finally {
      setFavBusy(false);
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (!token || !id) return;
    http
      .get("/portal/favorites", authHeaders(token))
      .then((res) => {
        const list = res.data || [];
        setIsFavorite(list.some((f) => String(f.productId?._id || f.productId) === String(id)));
      })
      .catch(() => {});
  }, [id]);

  const handleWhatsAppInquiry = () => {
    const text = encodeURIComponent(
      `Hello MARBLEX, I would like to inquire about ${product?.name || "Entryway Flooring System"} (Material: ${selectedMaterial}, Color: ${selectedColor}, Qty: ${quantity}, Price: PKR ${product?.price || 4000}). Please provide an instant quotation.`
    );
    window.open(`https://wa.me/923481116611?text=${text}`, "_blank");
  };

  const descriptionText =
    product?.description ||
    "High-performance engineered polymer and chemical formulation providing exceptional hydrostatic sealing, chemical barrier protection, and high-impact structural resilience.";

  useEffect(() => {
    if (loading) return;
    const el = descRef.current;
    if (!el) return;

    const measure = () => {
      if (descExpanded) return;
      setDescNeedsToggle(el.scrollHeight > el.clientHeight + 2);
    };

    const frame = requestAnimationFrame(measure);
    window.addEventListener("resize", measure);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", measure);
    };
  }, [descriptionText, descExpanded, loading, id]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-[1440px] px-4 py-8 sm:px-6 lg:px-8">
        <ProductDetailSkeleton />
      </div>
    );
  }

  const productName = product?.name || "Entryway Flooring";
  const displayTitle = productName.toLowerCase().includes("system")
    ? productName
    : `${productName} System - Carrara Elegance (8mm)`;
  const priceLabel = Number(product?.price ?? 4000).toLocaleString();
  const categoryLabel = product?.category || "Engineered Solutions";

  const SpecRow = ({ label, value, accent = false, icon }) => (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/90 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-800/40 sm:items-center">
      <div className="flex min-w-0 items-center gap-2.5">
        <span className="shrink-0 text-slate-400">{icon}</span>
        <span className="text-[12px] font-medium text-slate-500 dark:text-slate-400">{label}</span>
      </div>
      <span
        className={`max-w-[58%] text-right text-[12px] font-bold leading-snug sm:max-w-none ${
          accent ? "text-emerald-700 dark:text-emerald-400" : "text-[#0a3d52] dark:text-slate-100"
        }`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-[1440px] space-y-8 px-3 pb-28 pt-4 sm:space-y-10 sm:px-6 sm:pb-12 lg:px-8 lg:pt-6">
      {/* Header */}
      <div className="anim-reveal flex items-start justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
            <Link to="/" className="transition-colors hover:text-[#ff6b4a]">
              Home
            </Link>
            <span>/</span>
            <span className="uppercase tracking-[0.14em] text-[#0a3d52] dark:text-sky-400">{categoryLabel}</span>
          </div>
          <h1 className="font-heading text-[1.45rem] font-black leading-tight tracking-tight text-[#0f1929] dark:text-white sm:text-3xl lg:text-[2rem]">
            {productName}
          </h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="no-shimmer inline-flex shrink-0 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-[#0a3d52] shadow-xs transition hover:border-[#ff6b4a]/40 hover:text-[#ff6b4a] dark:border-slate-700 dark:bg-[#0e2735] dark:text-slate-200"
        >
          <ArrowBackRoundedIcon sx={{ fontSize: 14 }} />
          <span className="hidden sm:inline">Back to Catalog</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      {/* Main stage */}
      <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-12 lg:gap-10">
        {/* Gallery */}
        <div className="anim-reveal space-y-4 lg:col-span-6 lg:space-y-5">
          {/* Mobile: single hero */}
          <div className="relative overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-100 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:hidden">
            <div className="aspect-[4/5]">
              <img
                src={currentImage}
                alt={productName}
                className="h-full w-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/products/Banner1.jpeg";
                }}
              />
            </div>
            <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
              {selectedImageIndex + 1} / {galleryImages.length}
            </div>
            <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-emerald-700/85 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
              <CheckCircleRoundedIcon sx={{ fontSize: 12 }} /> Verified
            </div>
          </div>

          {/* Desktop/tablet: dual stage */}
          <div className="hidden gap-3.5 sm:grid sm:grid-cols-12 sm:items-stretch">
            <div className="group relative min-h-[320px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-slate-100 shadow-xs dark:border-slate-700 dark:bg-slate-800 sm:col-span-5 lg:min-h-[420px]">
              <img
                src={galleryImages[1] || galleryImages[0]}
                alt="Architectural Application"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = "/products/Banner1.jpeg";
                }}
              />
              <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2.5 py-1 text-[9.5px] font-bold uppercase tracking-wider text-white backdrop-blur-md">
                Site Application
              </div>
            </div>
            <div className="group relative min-h-[320px] overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white shadow-xs dark:border-slate-700 dark:bg-[#0c222e] sm:col-span-7 lg:min-h-[420px]">
              <img
                src={currentImage}
                alt={productName}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                onError={(e) => {
                  e.currentTarget.src = "/products/Banner1.jpeg";
                }}
              />
              <div className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-md bg-emerald-700/80 px-2.5 py-1 text-[9.5px] font-extrabold uppercase tracking-wider text-white backdrop-blur-md">
                <CheckCircleRoundedIcon sx={{ fontSize: 13 }} /> Verified Quality
              </div>
            </div>
          </div>

          {/* Thumbnails */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span>Product Perspectives ({galleryImages.length})</span>
              <span className="hidden items-center gap-1 text-[11px] font-normal text-slate-400 sm:inline-flex">
                <ZoomInOutlinedIcon sx={{ fontSize: 13 }} /> Click to inspect
              </span>
            </div>
            <div className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-4 sm:gap-3 sm:overflow-visible sm:px-0 sm:pb-0">
              {galleryImages.map((img, idx) => (
                <button
                  key={img + idx}
                  type="button"
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`no-shimmer relative aspect-square w-[4.6rem] shrink-0 overflow-hidden rounded-2xl border-2 bg-white p-0.5 transition sm:w-auto ${
                    selectedImageIndex === idx
                      ? "border-[#ff6b4a] shadow-md ring-2 ring-[#ff6b4a]/20"
                      : "border-slate-200 opacity-80 hover:opacity-100 dark:border-slate-700"
                  }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="h-full w-full rounded-xl object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/products/Banner1.jpeg";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Assurance — desktop under gallery; mobile after CTAs via order */}
          <div className="hidden rounded-[1.5rem] border border-slate-200/90 bg-gradient-to-br from-[#0a3d52]/5 via-white to-slate-50/80 p-5 shadow-sm dark:border-slate-800 dark:from-[#0c222e] dark:via-[#091b24] dark:to-[#0c222e] sm:block sm:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs font-black uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0a3d52]/10 dark:bg-sky-400/10">
                  <VerifiedUserOutlinedIcon sx={{ fontSize: 17 }} />
                </span>
                <span>MARBLEX Engineering Assurance</span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Industrial Standard</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {ASSURANCE.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-2xs dark:border-slate-700/60 dark:bg-[#0e2735]"
                >
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${toneBox[item.tone]}`}>
                    {item.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold leading-tight text-slate-900 dark:text-white">{item.title}</div>
                    <div className="truncate text-[10.5px] text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Buy column */}
        <div className="anim-reveal space-y-5 lg:col-span-6 lg:space-y-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ff6b4a]/20 bg-[#ff6b4a]/10 px-3 py-1 text-[10.5px] font-extrabold uppercase tracking-wider text-[#ff6b4a]">
              <ShieldOutlinedIcon sx={{ fontSize: 13 }} />
              Industrial Certified Grade
            </div>
            <h2 className="font-heading text-[1.35rem] font-black leading-tight tracking-tight text-slate-900 dark:text-white sm:text-3xl lg:text-[1.85rem]">
              MARBLEX {displayTitle}
            </h2>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs">
              <div className="flex items-center text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} sx={{ fontSize: 15 }} />
                ))}
              </div>
              <span className="font-bold text-slate-800 dark:text-slate-200">4.9</span>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 underline dark:text-slate-400">128 contractor reviews</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10.5px] font-extrabold text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/50 dark:text-emerald-400 sm:ml-auto">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                In Stock & Ready
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-slate-50 to-white p-4 dark:border-slate-800 dark:from-[#0c222e] dark:to-[#0a1c26]">
            <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
              <span className="font-heading text-2xl font-black tracking-tight text-[#0a3d52] dark:text-sky-400 sm:text-3xl">
                PKR {priceLabel}
              </span>
              <span className="pb-1 text-sm font-bold text-slate-500 dark:text-slate-400">/ standard unit</span>
            </div>
            <p className="mt-1 text-[11px] font-medium text-slate-400">Dual-coat coverage · Industrial packaging</p>
          </div>

          <div className="space-y-1.5">
            <p
              ref={descRef}
              className={`text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm ${
                descExpanded ? "" : "line-clamp-4"
              }`}
            >
              {descriptionText}
            </p>
            {(descNeedsToggle || descExpanded) && (
              <button
                type="button"
                onClick={() => setDescExpanded((open) => !open)}
                className="no-shimmer inline-flex items-center gap-1 text-[12px] font-bold text-[#0a3d52] transition hover:text-[#ff6b4a] dark:text-sky-400 dark:hover:text-[#ff6b4a]"
              >
                {descExpanded ? (
                  <>
                    Show less
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} className="rotate-180" />
                  </>
                ) : (
                  <>
                    Read more
                    <span className="tracking-[0.2em] text-slate-400">...</span>
                    <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
                  </>
                )}
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Material Specification</label>
              <div className="relative">
                <select
                  value={selectedMaterial}
                  onChange={(e) => setSelectedMaterial(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-xs focus:border-[#ff6b4a] focus:outline-none dark:border-slate-700 dark:bg-[#0c222e] dark:text-slate-200"
                >
                  <option value="Polished Marble Composite">Polished Marble Composite</option>
                  <option value="High-Build Elastomeric">High-Build Elastomeric Liquid</option>
                  <option value="Reinforced Vulcanized Compound">Reinforced Vulcanized Compound</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">Color Tone</label>
              <div className="relative">
                <select
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
                  className="w-full cursor-pointer appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-xs font-semibold text-slate-800 shadow-xs focus:border-[#ff6b4a] focus:outline-none dark:border-slate-700 dark:bg-[#0c222e] dark:text-slate-200"
                >
                  <option value="Carrara White">Carrara White</option>
                  <option value="Basalt Grey">Basalt Grey</option>
                  <option value="Desert Sand">Desert Sand</option>
                  <option value="Slate Black">Slate Black</option>
                </select>
                <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
            </div>
          </div>

          {/* Desktop / tablet actions */}
          <div className="hidden space-y-3 pt-1 sm:block">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</span>
              <div className="inline-flex h-10 w-32 overflow-hidden rounded-xl border border-slate-300 bg-white shadow-2xs dark:border-slate-700 dark:bg-[#0c222e]">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="no-shimmer flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <RemoveIcon sx={{ fontSize: 14 }} />
                </button>
                <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</div>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="no-shimmer flex h-full w-10 items-center justify-center text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <AddIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-3">
              <div className="col-span-5">
                <div className="glowing-border-wrap-rounded w-full">
                  <div className="glowing-border-beam" />
                  <div className="glowing-border-body w-full">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      className="shimmer-btn flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0a3d52] px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-[#0a3d52]/20 transition hover:bg-[#082e3e] active:scale-95"
                    >
                      <ShoppingCartOutlinedIcon sx={{ fontSize: 18 }} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-span-5">
                <div className="glowing-border-wrap-rounded w-full">
                  <div className="glowing-border-beam" />
                  <div className="glowing-border-body w-full">
                    <button
                      type="button"
                      onClick={handleWhatsAppInquiry}
                      className="shimmer-btn flex w-full items-center gap-2.5 rounded-2xl bg-[#ff6b4a] px-4 py-3 text-left text-white shadow-md shadow-[#ff6b4a]/25 transition hover:bg-[#e05333] active:scale-95"
                    >
                      <WhatsAppIcon sx={{ fontSize: 22 }} className="shrink-0" />
                      <span className="flex min-w-0 flex-col leading-tight">
                        <span className="text-xs font-extrabold uppercase tracking-wide">WhatsApp Quote</span>
                        <span className="text-[10px] font-normal text-white/90">Technical consultation</span>
                      </span>
                    </button>
                  </div>
                </div>
              </div>
              <div className="col-span-2">
                <button
                  type="button"
                  onClick={toggleFavorite}
                  disabled={favBusy}
                  className={`no-shimmer flex h-full min-h-[52px] w-full items-center justify-center gap-1.5 rounded-2xl border text-xs font-bold uppercase tracking-wider transition ${
                    isFavorite
                      ? "border-rose-200 bg-rose-50 text-rose-600"
                      : "border-slate-200 bg-white text-slate-700 hover:border-[#ff6b4a] hover:text-[#ff6b4a] dark:border-slate-700 dark:bg-[#0c222e] dark:text-slate-200"
                  }`}
                  title={isFavorite ? "Remove from favorites" : "Save to favorites"}
                >
                  {isFavorite ? <FavoriteRoundedIcon sx={{ fontSize: 20 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 20 }} />}
                  <span className="hidden xl:inline">{isFavorite ? "Saved" : "Save"}</span>
                </button>
              </div>
            </div>

            {addedToast && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 shadow-sm">
                <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> Added {quantity} unit(s) to cart successfully!
              </div>
            )}
          </div>

          {/* Mobile quantity only (sticky bar handles cart/whatsapp) */}
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-[#0c222e] sm:hidden">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Quantity</span>
            <div className="inline-flex h-10 w-32 overflow-hidden rounded-xl border border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="no-shimmer flex h-full w-10 items-center justify-center text-slate-600 dark:text-slate-300"
              >
                <RemoveIcon sx={{ fontSize: 14 }} />
              </button>
              <div className="flex flex-1 items-center justify-center text-sm font-bold text-slate-900 dark:text-white">{quantity}</div>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="no-shimmer flex h-full w-10 items-center justify-center text-slate-600 dark:text-slate-300"
              >
                <AddIcon sx={{ fontSize: 14 }} />
              </button>
            </div>
            <button
              type="button"
              onClick={toggleFavorite}
              disabled={favBusy}
              className={`no-shimmer flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                isFavorite
                  ? "border-rose-200 bg-rose-50 text-rose-600"
                  : "border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-300"
              }`}
            >
              {isFavorite ? <FavoriteRoundedIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderRoundedIcon sx={{ fontSize: 18 }} />}
            </button>
          </div>

          {addedToast && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 shadow-sm sm:hidden">
              <CheckCircleRoundedIcon sx={{ fontSize: 18 }} /> Added {quantity} unit(s) to cart
            </div>
          )}

          {/* Value props */}
          <div className="grid grid-cols-1 gap-3 pt-1 sm:grid-cols-3">
            {VALUE_PROPS.map((item) => (
              <div
                key={item.title}
                className="flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-xs dark:border-slate-800 dark:bg-[#0c222e] sm:flex-col sm:items-center sm:p-4 sm:text-center"
              >
                <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${toneBox[item.tone]}`}>
                  {item.icon}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight text-slate-900 dark:text-white">{item.title}</div>
                  <p className="mt-1 text-[10.5px] leading-snug text-slate-500 dark:text-slate-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile assurance */}
          <div className="rounded-[1.5rem] border border-slate-200/90 bg-gradient-to-br from-[#0a3d52]/5 via-white to-slate-50/80 p-4 dark:border-slate-800 dark:from-[#0c222e] dark:via-[#091b24] dark:to-[#0c222e] sm:hidden">
            <div className="mb-3 flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
              <VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />
              Engineering Assurance
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {ASSURANCE.map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200/80 bg-white p-2.5 dark:border-slate-700/60 dark:bg-[#0e2735]">
                  <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-xl ${toneBox[item.tone]}`}>{item.icon}</div>
                  <div className="text-[11px] font-bold leading-tight text-slate-900 dark:text-white">{item.title}</div>
                  <div className="mt-0.5 text-[10px] text-slate-500 dark:text-slate-400">{item.subtitle}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specs */}
      <section className="anim-reveal overflow-hidden rounded-[1.7rem] border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c222e]">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 dark:border-slate-800/80 sm:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">
          <div className="min-w-0">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#0a3d52]/20 bg-[#0a3d52]/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#0a3d52] dark:border-sky-400/20 dark:bg-sky-400/10 dark:text-sky-300">
              <FactCheckOutlinedIcon sx={{ fontSize: 15 }} />
              Engineering Data Sheet
            </div>
            <h3 className="font-heading text-xl font-black tracking-tight text-[#0f1929] dark:text-white sm:text-2xl lg:text-3xl">
              Technical Specifications & Material Properties
            </h3>
            <p className="mt-1 max-w-2xl text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
              Laboratory-verified chemical thresholds, physical dimensions, and application parameters.
            </p>
          </div>
          <a
            href={`https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20please%20send%20the%20official%20Technical%20Data%20Sheet%20(TDS)%20for%20${encodeURIComponent(productName)}.`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#0a3d52] px-4 py-3 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm transition hover:bg-[#082e3e] sm:px-5 sm:text-xs"
          >
            <ScienceOutlinedIcon sx={{ fontSize: 17 }} />
            <span className="sm:hidden">Request TDS</span>
            <span className="hidden sm:inline">Request Official TDS / Lab Report</span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-6 p-5 sm:gap-7 sm:p-7 md:grid-cols-2 lg:gap-8 lg:p-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
              <LayersOutlinedIcon sx={{ fontSize: 16 }} />
              Physical Attributes & Composition
            </div>
            <div className="space-y-2.5">
              <SpecRow
                label="Base Compound"
                value={selectedMaterial}
                icon={
                  <svg className="h-4 w-4 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                    <path d="M2 17L12 22L22 17M2 12L12 17L22 12" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
                  </svg>
                }
              />
              <SpecRow
                label="Color Formulation"
                value={selectedColor}
                icon={
                  <svg className="h-4 w-4 text-sky-500" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                }
              />
              <SpecRow
                label="Thickness / Profile"
                value="8mm - 12mm Dual-Coat"
                icon={
                  <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6H21M3 18H21M7 6V18M17 6V18" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                }
              />
              <SpecRow
                label="Packaging Unit"
                value="20Kg / 200L Drum"
                icon={
                  <svg className="h-4 w-4 text-purple-500" viewBox="0 0 24 24" fill="none">
                    <path d="M21 8V16C21 18.7614 16.9706 21 12 21C7.02944 21 3 18.7614 3 16V8M21 8C21 10.7614 16.9706 13 12 13C7.02944 13 3 10.7614 3 8M21 8C21 5.23858 16.9706 3 12 3C7.02944 3 3 5.23858 3 8" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                }
              />
              <SpecRow
                label="VOC Emissions"
                value="Zero VOC / Eco-Safe"
                accent
                icon={
                  <svg className="h-4 w-4 text-emerald-500" viewBox="0 0 24 24" fill="none">
                    <path d="M20.24 12.24C21.09 7.74 18.06 4.14 13.9 3.09C9.74 2.04 5.34 3.73 3.5 7.5C1.66 11.27 2.76 16.35 6.13 18.97C9.5 21.59 14.54 21.24 17.5 18.5" stroke="currentColor" strokeWidth="1.75" />
                  </svg>
                }
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 text-[11px] font-bold uppercase tracking-wider text-[#0a3d52] dark:text-sky-400">
              <PrecisionManufacturingOutlinedIcon sx={{ fontSize: 16 }} />
              Mechanical & Hydrostatic Matrix
            </div>
            <div className="space-y-2.5">
              <SpecRow label="Tensile Strength" value="> 12.5 MPa (ASTM D412)" icon={<span className="text-rose-500">●</span>} />
              <SpecRow label="Elongation Capacity" value="350% - 450% Crack-Bridging" icon={<span className="text-amber-500">●</span>} />
              <SpecRow label="Hydrostatic Pressure Seal" value="Up to 5 Bar (50m Head)" icon={<span className="text-cyan-500">●</span>} />
              <SpecRow label="Service Temperature" value="-20°C to +85°C" icon={<span className="text-orange-500">●</span>} />
              <SpecRow label="Standard Compliance" value="ASTM D412 / BS 8102 / ISO 9001" accent icon={<span className="text-emerald-500">●</span>} />
            </div>
          </div>
        </div>
      </section>

      <div className="anim-reveal pt-1">
        <EnterpriseMetricsBar className="my-4 sm:my-8" />
      </div>

      {/* Related */}
      <section className="anim-reveal space-y-5 pb-4">
        <div className="flex items-end justify-between gap-3 border-b border-slate-200/80 pb-4 dark:border-slate-800">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b4a]">Recommended Solutions</span>
            <h3 className="font-heading text-xl font-black tracking-tight text-[#0f1929] dark:text-white sm:text-2xl">
              Related Industrial Formulations
            </h3>
          </div>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="no-shimmer shrink-0 text-xs font-bold text-[#0a3d52] hover:underline dark:text-sky-400"
          >
            View Catalog →
          </button>
        </div>

        <div className="-mx-3 flex gap-3.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {moreProducts.map((item, idx) => (
            <button
              key={item._id || idx}
              type="button"
              onClick={() => {
                navigate(`/product/${item._id}`, { state: { product: item } });
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="no-shimmer group flex w-[78vw] max-w-[280px] shrink-0 flex-col overflow-hidden rounded-[1.4rem] border border-slate-200/90 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-1 hover:border-[#ff6b4a]/40 hover:shadow-xl dark:border-slate-800 dark:bg-[#0c222e] sm:w-auto sm:max-w-none"
            >
              <div className="relative mb-3 aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100 dark:bg-slate-800">
                <span className="absolute left-2.5 top-2.5 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-[#ff6b4a] text-[11px] font-extrabold text-white shadow-md">
                  {idx + 1}
                </span>
                <img
                  src={item.imageUrl || defaultGallery[idx % defaultGallery.length]}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    e.currentTarget.src = "/products/Banner1.jpeg";
                  }}
                />
              </div>
              <h5 className="line-clamp-1 text-sm font-bold text-slate-900 transition group-hover:text-[#ff6b4a] dark:text-white dark:group-hover:text-sky-400">
                {item.name}
              </h5>
              <div className="mt-1 flex items-center gap-1.5 text-xs">
                <div className="flex text-amber-400">
                  {[...Array(5)].map((_, starIdx) => (
                    <StarIcon key={starIdx} sx={{ fontSize: 12 }} />
                  ))}
                </div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">4.9</span>
              </div>
              <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2 dark:border-slate-800/80">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  PKR {Number(item.price ?? 4000).toLocaleString()}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#ff6b4a] dark:text-sky-400">Inspect →</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Mobile sticky CTA */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200/90 bg-white/95 px-3 py-2.5 backdrop-blur-md dark:border-slate-800 dark:bg-[#0c222e]/95 sm:hidden">
        <div className="mx-auto flex max-w-[1440px] items-center gap-2">
          <div className="min-w-0 flex-1">
            <div className="truncate text-[11px] font-semibold text-slate-500">PKR {priceLabel}</div>
            <div className="truncate text-xs font-bold text-[#0a3d52] dark:text-white">{productName}</div>
          </div>
          <button
            type="button"
            onClick={handleWhatsAppInquiry}
            className="no-shimmer flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#25D366] text-white shadow-sm"
            aria-label="WhatsApp quote"
          >
            <WhatsAppIcon sx={{ fontSize: 22 }} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            className="shimmer-btn inline-flex h-11 shrink-0 items-center gap-1.5 rounded-xl bg-[#0a3d52] px-3.5 text-[11px] font-bold uppercase tracking-wide text-white shadow-md"
          >
            <ShoppingCartOutlinedIcon sx={{ fontSize: 16 }} />
            Add
            <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-[10px]">{quantity}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
