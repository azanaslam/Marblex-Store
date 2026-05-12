import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { HeroBanner } from "../components/HeroBanner";
import { ProductCard } from "../components/ProductCard";
import { beforeAfterPairs, galleryImages } from "../config/constants";
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import PhotoLibraryIcon from '@mui/icons-material/PhotoLibrary';
import { ProductCardSkeleton } from "../components/LoaderSkeleton";

const demoProducts = [
  {
    _id: "demo-1",
    name: "Executive Car Mats",
    description: "Premium stitched floor mats for daily durability and easy cleaning.",
    price: 5500,
    imageUrl: "/products/Banner1.jpeg",
  },
  {
    _id: "demo-2",
    name: "Luxury Car Mats",
    description: "Luxury quilt finish with anti-slip base and complete cabin coverage.",
    price: 8500,
    imageUrl: "/products/Banner2.jpeg",
  },
  {
    _id: "demo-3",
    name: "PVC Wall Panel",
    description: "Elegant water-resistant paneling for modern interior walls.",
    price: 750,
    imageUrl: "/products/Banner3.jpeg",
  },
  {
    _id: "demo-4",
    name: "PVC Wooden Flooring",
    description: "Stylish and durable floor design with warm natural wood texture.",
    price: 145,
    imageUrl: "/products/Banner4.jpeg",
  },
];

export const ShopPage = ({ addToCart }) => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleOpenProduct = useCallback(
    (item) => {
      navigate(`/product/${item._id}`, { state: { product: item } });
    },
    [navigate]
  );

  useEffect(() => {
    setLoading(true);
    http
      .get("/products")
      .then((res) => {
        setProducts(Array.isArray(res.data) && res.data.length ? res.data : demoProducts);
        setLoading(false);
      })
      .catch(() => {
        setProducts(demoProducts);
        setLoading(false);
      });
  }, []);

  return (
    <div className="pb-16 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-6">
      <HeroBanner />
      
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 border-b border-slate-200 pb-6 gap-4">
        <div>
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
            Featured <span className="text-rose-600">Products</span>
          </h3>
          <p className="text-slate-500 font-medium text-lg">
            Discover our hand-picked premium collection of industrial chemicals.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900 text-white px-6 py-2.5 rounded-2xl font-bold shadow-xl shadow-slate-900/10">
          <LocalOfferOutlinedIcon fontSize="small" />
          <span>{products.length} Items Available</span>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
        {loading ? (
          [1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <ProductCardSkeleton key={i} />
          ))
        ) : (
          products.map((product) => (
            <div key={product._id} className="h-full">
              <ProductCard
                product={product}
                onAddToCart={addToCart}
                onOpenProduct={handleOpenProduct}
              />
            </div>
          ))
        )}
      </div>

      {/* Before & After Section */}
      <div className="mt-32">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 border border-rose-100">
            <CompareArrowsIcon sx={{ fontSize: 16 }} /> Transformation
          </div>
          <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-4">Professional Results</h3>
          <p className="text-slate-500 font-medium text-lg max-w-2xl mx-auto">See the difference our specialized chemicals and professional application make.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {beforeAfterPairs.map((pair, idx) => (
            <div key={idx} className="group">
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1 relative rounded-3xl overflow-hidden border border-slate-200 shadow-lg">
                  <img src={pair.before} alt="Before" loading="lazy" decoding="async" className="w-full h-[300px] object-cover" />
                  <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">Before</div>
                </div>
                <div className="flex-1 relative rounded-3xl overflow-hidden border border-rose-200 shadow-xl shadow-rose-500/10 scale-105 sm:scale-100 group-hover:scale-105 transition-transform duration-500">
                  <img src={pair.after} alt="After" loading="lazy" decoding="async" className="w-full h-[300px] object-cover" />
                  <div className="absolute top-4 right-4 bg-rose-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase">After</div>
                </div>
              </div>
              <div className="px-2">
                <h4 className="text-2xl font-black text-slate-900 mb-2">{pair.title}</h4>
                <p className="text-slate-500 font-medium">{pair.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Work Showcase Gallery */}
      <div className="mt-32">
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-3xl md:text-5xl font-black text-slate-900 mb-2">Work Showcase</h3>
            <p className="text-slate-500 font-medium text-lg">A glimpse into our recent successful projects across Pakistan.</p>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <PhotoLibraryIcon />
            <span className="font-bold uppercase tracking-tighter">Project Gallery</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {galleryImages.map((img, idx) => (
            <div key={idx} className={`relative rounded-3xl overflow-hidden group border border-slate-200 ${idx === 0 || idx === 5 ? 'md:col-span-2 md:row-span-2' : ''}`}>
              <img 
                src={img} 
                alt={`Showcase ${idx}`} 
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover min-h-[200px] transition-transform duration-700 group-hover:scale-110" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                <span className="text-white font-bold text-sm">Marblex Excellence</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Services & Expertise Showcase */}
      <div className="mt-32 mb-16 bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-16">
            <h3 className="text-3xl md:text-6xl font-black mb-6 tracking-tight">
              Our Professional <span className="text-rose-500">Expertise</span>
            </h3>
            <p className="text-lg text-slate-300 font-medium max-w-2xl mx-auto">
              Explore our specialized construction chemical solutions designed for durability and performance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="group rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500">
              <div className="h-[250px] overflow-hidden relative">
                <img 
                  src="/assets/brochures/Profile_marblex_page_1.jpg" 
                  alt="Company Profile" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black mb-3">Company Profile</h4>
                <p className="text-slate-400 font-medium mb-6">
                  Learn about Marblex specialized projects and premium industrial services.
                </p>
                <button onClick={() => navigate('/catalogs?tab=profile')} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                  View Brochure <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </div>

            <div className="group rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500">
              <div className="h-[250px] overflow-hidden relative">
                <img 
                  src="/assets/brochures/real_one_page_1.jpg" 
                  alt="Construction Projects" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black mb-3">Construction Solutions</h4>
                <p className="text-slate-400 font-medium mb-6">
                  Explore termite treatments, waterproofing, and heat insulation solutions.
                </p>
                <button onClick={() => navigate('/catalogs?tab=construction')} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                  View Brochure <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </div>

            <div className="group rounded-[2rem] overflow-hidden bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-500">
              <div className="h-[250px] overflow-hidden relative">
                <img 
                  src="/assets/brochures/Water_Stopper_123_page_1.jpg" 
                  alt="Rubber Water Stopper" 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700 opacity-80 group-hover:opacity-100" 
                />
              </div>
              <div className="p-8">
                <h4 className="text-2xl font-black mb-3">Rubber Water Stops</h4>
                <p className="text-slate-400 font-medium mb-6">
                  Detailed specifications for premium rubber water stops for dams and reservoirs.
                </p>
                <button onClick={() => navigate('/catalogs?tab=waterstopper')} className="bg-white text-slate-900 px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 hover:bg-rose-500 hover:text-white transition-all">
                  View Brochure <ArrowForwardIcon fontSize="small" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
