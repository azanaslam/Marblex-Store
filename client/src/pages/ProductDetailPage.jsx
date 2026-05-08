import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { http } from "../api/http";
import { ProductCard } from "../components/ProductCard";

export const ProductDetailPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [product, setProduct] = useState(location.state?.product || null);
  const [moreProducts, setMoreProducts] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(!location.state?.product);

  useEffect(() => {
    let mounted = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setQuantity(1); // Reset quantity on route change

    if (location.state?.product && location.state.product._id === id) {
      setProduct(location.state.product);
      setLoading(false);
      return () => { mounted = false; };
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
        setMoreProducts(list.filter((x) => String(x._id) !== String(id)).slice(0, 8));
      })
      .catch(() => setMoreProducts([]));
  }, [id]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors w-fit px-4 py-2 rounded-xl hover:bg-slate-100"
      >
        <ArrowBackRoundedIcon fontSize="small" /> Back to Products
      </button>

      {/* Loading & Error States */}
      {loading && (
        <div className="bg-blue-50 text-blue-700 p-4 rounded-2xl font-bold animate-pulse border border-blue-100">
          Loading product details...
        </div>
      )}
      {!loading && !product && (
        <div className="bg-red-50 text-red-700 p-4 rounded-2xl font-bold border border-red-100">
          Product not found.
        </div>
      )}

      {/* Product Details Section */}
      {!loading && product && (
        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Image Gallery */}
            <div className="lg:w-1/2 bg-slate-50 p-6 sm:p-10 flex items-center justify-center">
              <img
                src={product.imageUrl || "https://placehold.co/800x800/f8fafc/94a3b8?text=No+Image"}
                alt={product.name}
                className="w-full max-w-lg aspect-square object-cover rounded-3xl shadow-xl shadow-slate-200/50"
              />
            </div>
            
            {/* Product Info */}
            <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
              <span className="inline-block px-4 py-1.5 bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest rounded-full w-fit mb-6">
                {product.category || 'Premium Product'}
              </span>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4 tracking-tight">
                {product.name}
              </h1>
              
              <div className="text-3xl font-black text-rose-600 mb-8">
                PKR {product.price?.toLocaleString()}
              </div>
              
              <div className="prose prose-slate prose-lg text-slate-500 mb-10 whitespace-pre-wrap font-medium leading-relaxed">
                {product.description || "No description available for this product."}
              </div>
              
              <div className="mt-auto space-y-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Quantity Control */}
                  <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden h-14 w-full sm:w-36 shadow-sm">
                    <button 
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M5 12h14"/></svg>
                    </button>
                    <div className="flex-1 h-full flex items-center justify-center font-black text-slate-900 border-x border-slate-200 bg-white">
                      {quantity}
                    </div>
                    <button 
                      onClick={() => setQuantity((q) => q + 1)}
                      className="w-12 h-full flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition-colors active:bg-slate-300"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                    </button>
                  </div>
                  
                  {/* Add to Cart Button */}
                  <button
                    onClick={() => {
                      addToCart({ ...product, quantity });
                      setQuantity(1);
                    }}
                    className="flex-1 h-14 bg-slate-900 hover:bg-rose-600 text-white rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-rose-600/30 active:scale-[0.98] flex items-center justify-center gap-3"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                    Add To Cart
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm font-bold text-slate-400 bg-slate-50 px-5 py-4 rounded-2xl border border-slate-100">
                  <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure Checkout</span>
                  <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                  <span className="flex items-center gap-2"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg> Fast Delivery</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* More Products Section */}
      {!!moreProducts.length && (
        <div className="pt-8 sm:pt-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              You might also like
            </h2>
            <button onClick={() => navigate("/")} className="hidden sm:flex text-rose-600 hover:text-rose-700 font-bold items-center gap-1 transition-colors">
              View all <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {moreProducts.map((item) => (
              <div key={item._id} className="h-full">
                <ProductCard
                  product={item}
                  onAddToCart={addToCart}
                  onOpenProduct={(prod) => navigate(`/product/${prod._id}`, { state: { product: prod } })}
                />
              </div>
            ))}
          </div>
          
          <button onClick={() => navigate("/")} className="sm:hidden w-full mt-6 py-4 bg-slate-50 text-slate-900 font-bold rounded-2xl border border-slate-200 hover:bg-slate-100 transition-colors">
            View all products
          </button>
        </div>
      )}
    </div>
  );
};
