import { Link } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";

export const SiteFooter = () => {
  const infoLinks = [
    { label: "About Us", path: "/about" },
    { label: "Services & Solutions", path: "/services" },
    { label: "Contact Us", path: "/contact" },
    { label: "Blogs & News", path: "/blogs" },
    { label: "Catalog & Specs", path: "/catalogs" },
  ];

  return (
    <footer className="bg-[#0a3d52] text-[#f5f7fa] pt-16 pb-8 border-t-4 border-[#ff6b4a] relative overflow-hidden">
      {/* Decorative Subtle Glow Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#ff6b4a] blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-[#ff8c73] blur-[140px]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-md border border-white/20 shrink-0 overflow-hidden">
                <img 
                  src="/logo-icon-transparent.png" 
                  alt="MARBLEX Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black tracking-tight text-white leading-none" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
                  MARBLEX
                </span>
                <span className="text-[10px] font-bold text-[#ff8c73] tracking-[0.2em] uppercase mt-0.5">
                  Construction Chemical & Rubber
                </span>
              </div>
            </div>
            <p className="text-[#f5f7fa]/75 text-sm leading-relaxed pr-4 font-normal">
              High-performance construction chemicals, elastomeric rubber water stoppers, industrial waterproofing coatings, and structural polymers.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#ff6b4a] text-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 shadow-md">
                <FacebookIcon fontSize="small" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#ff6b4a] text-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 shadow-md">
                <InstagramIcon fontSize="small" />
              </a>
              <a href="#" className="w-10 h-10 rounded-xl bg-white/10 hover:bg-[#ff6b4a] text-white flex items-center justify-center hover:-translate-y-1 transition-all duration-300 shadow-md">
                <XIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="w-6 h-1 bg-[#ff6b4a] rounded-full"></span> Get In Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-[#ff8c73] group-hover:text-white transition-colors">
                  <LocationOnOutlinedIcon fontSize="small" />
                </div>
                <span className="text-sm text-[#f5f7fa]/80 group-hover:text-white transition-colors">
                  40-Ferozpur Road, Industrial Area, Lahore, Pakistan
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-[#ff8c73] group-hover:text-white transition-colors">
                  <MailOutlineOutlinedIcon fontSize="small" />
                </div>
                <a href="mailto:Marblexpak@gmail.com" className="text-sm text-[#f5f7fa]/80 hover:text-[#ff8c73] transition-colors">
                  Marblexpak@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-[#ff8c73] group-hover:text-white transition-colors">
                  <LocalPhoneOutlinedIcon fontSize="small" />
                </div>
                <a href="tel:0348-111-66-11" className="text-sm text-[#f5f7fa]/80 hover:text-[#ff8c73] transition-colors">
                  +92 348 111 6611
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="w-6 h-1 bg-[#ff8c73] rounded-full"></span> Quick Links
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path} 
                    className="text-sm text-[#f5f7fa]/80 hover:text-[#ff8c73] hover:pl-2 transition-all duration-300 flex items-center gap-2 before:content-['›'] before:text-[#ff6b4a] before:font-bold before:text-lg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
              <span className="w-6 h-1 bg-[#10b981] rounded-full"></span> Industry Updates
            </h3>
            <p className="text-sm text-[#f5f7fa]/75 mb-6 leading-relaxed font-normal">
              Subscribe to MARBLEX technical bulletins and new product releases.
            </p>
            <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
              <div className="relative flex items-center">
                <div className="absolute left-3.5 text-white/50 pointer-events-none flex items-center">
                  <MailOutlineOutlinedIcon fontSize="small" />
                </div>
                <input 
                  type="email" 
                  placeholder="Enter corporate email" 
                  className="w-full bg-white/10 border border-white/20 text-white rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:border-[#ff6b4a] focus:ring-1 focus:ring-[#ff6b4a] transition-all text-sm placeholder:text-white/40"
                />
              </div>
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73] hover:from-[#ff8c73] hover:to-[#ff6b4a] text-white font-bold py-3 rounded-xl shadow-lg shadow-[#ff6b4a]/25 transition-all hover:-translate-y-0.5 active:translate-y-0 text-sm cursor-pointer"
              >
                Subscribe Now
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/15 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs sm:text-sm text-[#f5f7fa]/70 text-center md:text-left">
            Copyright © {new Date().getFullYear()} <strong className="text-white font-bold">MARBLEX</strong>. Construction Chemical & Rubber Industry. All rights reserved.
          </p>
          <div className="flex gap-2">
            <span className="text-xs font-semibold px-3 py-1 rounded-md bg-white/10 text-white/80 border border-white/10">ISO 9001 Certified</span>
            <span className="text-xs font-semibold px-3 py-1 rounded-md bg-white/10 text-white/80 border border-white/10">Industrial Grade</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

