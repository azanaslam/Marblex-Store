import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { bannerImages } from "../config/constants";

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % bannerImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const move = (delta) => {
    setCurrent((prev) => (prev + delta + bannerImages.length) % bannerImages.length);
  };

  return (
    <div className="relative mb-10 md:mb-16 rounded-3xl overflow-hidden h-[300px] sm:h-[400px] md:h-[550px] bg-slate-900 shadow-2xl shadow-slate-900/20 group">
      {/* Background Images with smooth crossfade and zoom */}
      {bannerImages.map((img, index) => (
        <img
          key={img}
          src={img}
          alt={`Marblex banner ${index + 1}`}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out ${
            current === index 
              ? "opacity-100 scale-105 z-10" 
              : "opacity-0 scale-100 z-0"
          }`}
        />
      ))}

      {/* Dark overlay gradient */}
      <div className="absolute inset-0 z-20 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-transparent flex flex-col justify-center p-6 sm:p-12 md:p-20">
        
        <div className="max-w-2xl transform transition-all duration-700 translate-y-0 opacity-100">
          <span className="inline-block py-1 px-3 rounded-full bg-rose-500/20 text-rose-400 font-bold text-xs sm:text-sm tracking-widest uppercase mb-4 backdrop-blur-sm border border-rose-500/20">
            Marblex Services
          </span>
          
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 tracking-tight drop-shadow-lg">
            Waterproofing <br /> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">
              Solutions
            </span>
          </h2>
          
          <p className="text-slate-200 text-base sm:text-lg md:text-xl max-w-lg mb-6 leading-relaxed font-medium drop-shadow-md">
            We deal in all kinds of waterproofing products, chemical coating, hot bitumen, membrane sheet, termite treatment, and heat insulation.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button onClick={() => navigate('/services')} className="flex items-center gap-2 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white px-8 py-3.5 rounded-full font-bold text-base transition-all duration-300 shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:-translate-y-1">
              Explore Services <ArrowForwardIcon fontSize="small" />
            </button>
            <button onClick={() => navigate('/catalogs')} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/20 px-8 py-3.5 rounded-full font-bold text-base transition-all duration-300">
              View Catalog
            </button>
          </div>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8 flex gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <button 
          onClick={() => move(-1)} 
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all"
        >
          <KeyboardArrowLeftIcon />
        </button>
        <button 
          onClick={() => move(1)} 
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/10 transition-all"
        >
          <KeyboardArrowRightIcon />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {bannerImages.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              current === idx ? "w-8 bg-rose-500" : "bg-white/50 hover:bg-white"
            }`}
          />
        ))}
      </div>
    </div>
  );
};
