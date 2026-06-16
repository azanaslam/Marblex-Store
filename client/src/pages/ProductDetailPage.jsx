import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { http } from "../api/http";
import { ProductCard } from "../components/ProductCard";
import { ProductDetailSkeleton } from "../components/LoaderSkeleton";

export const ProductDetailPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [moreProducts, setMoreProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!location.state?.product);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [currentImage, setCurrentImage] = useState("");
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1); // Reset quantity on route change

    if (location.state?.product && location.state.product._id === id) {
      setProduct(location.state.product);
      setCurrentImage(location.state.product.imageUrl || "");
      setLoading(false);
      return () => { mounted = false; };
    }

    if (!id || product?._id === id) {
      if (product) setCurrentImage(product.imageUrl || "");
      setLoading(false);
      return () => { mounted = false; };
    }
    setLoading(true);
    http
      .get(`/products/${id}`)
      .then((res) => {
        if (mounted) {
          setProduct(res.data || null);
          setCurrentImage(res.data?.imageUrl || "");
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
        setMoreProducts(list.filter((x) => String(x._id) !== String(id)).slice(0, 8));
      })
      .catch(() => setMoreProducts([]));
  }, [id]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const allImages = product ? [product.imageUrl, ...(product.extraImages || [])].filter(Boolean) : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10 lg:space-y-16">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/")}
        className="group flex items-center gap-2 text-slate-500 hover:text-slate-900 font-extrabold transition-all w-fit px-5 py-2.5 rounded-xl hover:bg-slate-100 hover:shadow-sm"
      >
        <ArrowBackRoundedIcon fontSize="small" className="group-hover:-translate-x-1 transition-transform" /> 
        Back to Products
      </button>

      {/* Loading & Error States */}
      {loading && <ProductDetailSkeleton />}
      {!loading && !product && (
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl font-bold border border-red-100 shadow-sm">
          Product not found or has been removed.
        </div>
      )}

      {/* Product Details Section */}
      {!loading && product && (
        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            
            {/* Left: Image Gallery */}
            <div className="lg:w-1/2 bg-gradient-to-br from-slate-50 to-slate-100/50 p-6 sm:p-10 lg:p-14 flex flex-col justify-center border-b lg:border-b-0 lg:border-r border-slate-100">
              {/* Main Image with Zoom */}
              <div 
                className="relative w-full aspect-square bg-white rounded-[2rem] overflow-hidden cursor-crosshair shadow-lg shadow-slate-200/50 border border-slate-200 group"
                onMouseMove={handleMouseMove}
              >
                <img
                  src={currentImage || "https://placehold.co/800x800/f8fafc/94a3b8?text=No+Image"}
                  alt={product.name}
                  className="w-full h-full object-cover md:group-hover:opacity-0 transition-opacity duration-300"
                />
                {/* Zoom Overlay (Desktop only) */}
                <div 
                  className="absolute inset-0 bg-no-repeat pointer-events-none opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-10"
                  style={{
                    backgroundImage: `url(${currentImage || "https://placehold.co/800x800/f8fafc/94a3b8?text=No+Image"})`,
                    backgroundPosition: `${mousePos.x}% ${mousePos.y}%`,
                    backgroundSize: '250%'
                  }}
                />
              </div>

              {/* Thumbnails */}
              {allImages.length > 1 && (
                <div className="flex gap-4 mt-6 overflow-x-auto pb-2 snap-x custom-scrollbar">
                  {allImages.map((img, idx) => (
                    <button
                      key={idx}
                      onMouseEnter={() => window.innerWidth >= 768 && setCurrentImage(img)}
                      onClick={() => setCurrentImage(img)}
                      className={`relative w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 rounded-[1.25rem] overflow-hidden border-2 transition-all duration-300 snap-center ${
                        currentImage === img 
                          ? 'border-rose-500 shadow-lg shadow-rose-500/30 scale-100' 
                          : 'border-white bg-white hover:border-slate-300 shadow-sm opacity-70 hover:opacity-100 scale-95 hover:scale-100'
                      }`}
                    >
                      <img src={img} alt={`${product.name} thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
            
            {/* Right: Product Info */}
            <div className="lg:w-1/2 p-8 sm:p-12 lg:p-16 flex flex-col justify-center bg-white relative">
              <span className="inline-block px-5 py-2 bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-[0.2em] rounded-xl w-fit mb-6 border border-rose-100/50">
                {product.category || 'Premium Collection'}
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-[1.15] mb-6 tracking-tight">
                {product.name}
              </h1>
              
              <div className="flex items-end gap-4 mb-8">
                <div className="text-4xl sm:text-5xl font-black text-rose-600 tracking-tight">
                  <span className="text-2xl sm:text-3xl font-bold mr-1 text-rose-500/80">PKR</span>
                  {product.price?.toLocaleString()}
                </div>
                {product.stock > 0 && product.stock <= 5 && (
                  <span className="mb-2 px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider rounded-lg border border-amber-200 animate-pulse">
                    Only {product.stock} left!
                  </span>
                )}
              </div>
              
              <div className="w-full h-px bg-slate-100 mb-8" />
              
              <div className="relative mb-10 group/desc">
                <div 
                  className={`prose prose-slate prose-lg text-slate-500 whitespace-pre-wrap font-medium leading-relaxed transition-all duration-500 ease-in-out ${!isDescriptionExpanded ? 'max-h-[120px] overflow-hidden lg:max-h-none' : 'max-h-[2000px]'}`}
                >
                  {product.description || "Premium quality marble carefully selected for superior durability and aesthetic excellence."}
                </div>
                
                {!isDescriptionExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white via-white/90 to-transparent lg:hidden transition-opacity duration-500" />
                )}
                
                <button 
                  onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                  className="relative z-10 mt-4 flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-[0.15em] lg:hidden group/btn hover:text-rose-700 transition-colors"
                >
                  <span className="bg-rose-50 px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm border border-rose-100 group-hover/btn:bg-rose-100 transition-colors">
                    {isDescriptionExpanded ? (
                      <>Show Less <KeyboardArrowUpIcon sx={{ fontSize: 18 }} /></>
                    ) : (
                      <>Read Full Description <KeyboardArrowDownIcon sx={{ fontSize: 18 }} className="animate-bounce-slow" /></>
                    )}
                  </span>
                </button>
              </div>
              
              <div className="mt-auto space-y-6 pt-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Control */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-[1.25rem] overflow-hidden h-16 w-full sm:w-40 shadow-sm">
                    <button 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center font-black text-xl text-slate-900 border-x border-slate-200 bg-white">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-full flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart({ ...product, quantity });
                      setQuantity(1);
                    }}
                    className="flex-1 h-16 bg-slate-900 hover:bg-rose-600 text-white rounded-[1.25rem] font-black text-lg uppercase tracking-wider transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-rose-600/30 active:scale-[0.98] flex items-center justify-center gap-3 overflow-hidden relative group"
                  >
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="relative z-10"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    <span className="relative z-10">Add To Cart</span>
                  </button>
                </div>
                
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 text-sm font-bold text-slate-500 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    Secure Checkout
                  </span>
                  <span className="hidden sm:block w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
                    </div>
                    Fast Delivery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More Products Section */}
      {!!moreProducts.length && (
        <div className="pt-12 sm:pt-20">
          <div className="flex items-center justify-between mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              You might also like
            </h2>
            <button onClick={() => navigate("/")} className="hidden sm:flex text-rose-600 hover:text-rose-700 font-extrabold items-center gap-1.5 transition-colors uppercase tracking-wider text-sm px-4 py-2 hover:bg-rose-50 rounded-xl">
              View all <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moreProducts.map((item) => (
              <ProductCard
                key={item._id}
                product={item}
                onAddToCart={addToCart}
                onOpenProduct={(prod) => navigate(`/product/${prod._id}`, { state: { product: prod } })}
              />
            ))}
          </div>
          
          <button onClick={() => navigate("/")} className="sm:hidden w-full mt-8 py-4 bg-slate-900 text-white font-extrabold text-lg uppercase tracking-wider rounded-2xl shadow-xl shadow-slate-900/20 active:scale-[0.98] transition-all">
            View all products
          </button>
        </div>
      )}
    </div>
  );
};
