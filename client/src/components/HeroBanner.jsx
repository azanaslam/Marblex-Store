import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { bannerImages } from "../config/constants";

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const bannerCount = bannerImages.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerCount);
    }, 4500);
    return () => clearInterval(interval);
  }, [bannerCount]);

  const move = useCallback((delta) => {
    setCurrent((prev) => (prev + delta + bannerCount) % bannerCount);
  }, [bannerCount]);

  const goTo = useCallback((idx) => {
    setCurrent(idx);
  }, []);

  return (
    <div className="relative mb-10 md:mb-16 rounded-3xl overflow-hidden h-[480px] sm:h-[500px] md:h-[600px] bg-slate-900 shadow-2xl shadow-slate-900/20 group">
      {/* Background Images with smooth crossfade and zoom */}
      {bannerImages.map((img, index) => {
        const isActive = current === index;
        return (
        <img
          key={img}
          src={img}
          alt={`Marblex banner ${index + 1}`}
          loading={index === 0 ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={isActive ? "high" : "low"}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            isActive
              ? "opacity-100 scale-105 z-10" 
              : "opacity-0 scale-100 z-0"
          }`}
        />
      );
      })}

      {/* Dark overlay gradient - Stronger on mobile for readability */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t md:bg-gradient-to-r from-slate-950/90 via-slate-900/60 to-transparent flex flex-col justify-center p-6 sm:p-12 md:p-20">
        
        <div className="max-w-2xl transform transition-all duration-700 translate-y-0 opacity-100">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px] sm:text-xs tracking-[0.2em] uppercase mb-4 backdrop-blur-sm border border-rose-500/20">
            Marblex Services
          </span>
          
          <h2 className="text-3xl sm:text-5xl md:text-6xl font-extrabold text-white leading-[1.1] mb-4 tracking-tight drop-shadow-xl">
            Waterproofing <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              Solutions
            </span>
          </h2>
          
          <p className="text-slate-200 text-sm sm:text-lg md:text-xl max-w-lg mb-8 leading-relaxed font-medium drop-shadow-md">
            We deal in all kinds of waterproofing products, chemical coating, hot bitumen, membrane sheet, termite treatment, and heat insulation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              onClick={() => navigate('/services')} 
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-6 py-4 sm:px-8 sm:py-3.5 rounded-2xl sm:rounded-full font-bold text-sm sm:text-base transition-all duration-300 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:-translate-y-1"
            >
              Explore Services <ArrowForwardIcon fontSize="small" />
            </button>
            <button 
              onClick={() => navigate('/catalogs')} 
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-6 py-4 sm:px-8 sm:py-3.5 rounded-2xl sm:rounded-full font-bold text-sm sm:text-base transition-all duration-300"
            >
              View Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Controls - Repositioned and stylized */}
      <div className="absolute right-4 bottom-24 md:right-8 md:bottom-8 flex flex-col md:flex-row gap-2 z-30 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => move(-1)} 
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all shadow-xl"
        >
          <KeyboardArrowLeftIcon fontSize="small" />
        </button>
        <button 
          onClick={() => move(1)} 
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all shadow-xl"
        >
          <KeyboardArrowRightIcon fontSize="small" />
        </button>
      </div>

      {/* Dots indicator - Moved up slightly and improved styling */}
      <div className="absolute bottom-8 left-6 md:left-1/2 md:-translate-x-1/2 flex items-center gap-2.5 z-30">
        {bannerImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goTo(idx)}
            className={`transition-all duration-500 rounded-full ${
              current === idx 
                ? "w-8 h-1.5 bg-rose-500" 
                : "w-1.5 h-1.5 bg-white/30 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
