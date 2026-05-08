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
    { label: "Services", path: "/services" },
    { label: "Contact Us", path: "/contact" },
    { label: "Blogs", path: "/blogs" },
    { label: "Privacy Policy", path: "#" },
  ];

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t-[6px] border-rose-600 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-rose-600 blur-[100px]"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full bg-blue-600 blur-[100px]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 md:px-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          
          {/* Company Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="bg-white p-1.5 rounded-xl">
                <img 
                  src="/products/Logo.jpeg" 
                  alt="Marblex Logo" 
                  className="w-10 h-10 object-cover object-center rounded-lg"
                  onError={(e) => e.currentTarget.src = "/icons.svg"}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-extrabold tracking-tight text-white leading-none">
                  Marblex
                </span>
                <span className="text-xs font-bold text-rose-500 tracking-wider uppercase">
                  Store
                </span>
              </div>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed pr-4">
              Premium quality car mats, PVC wall panels, and wooden flooring solutions. Elevating your spaces with unmatched durability and style.
            </p>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <FacebookIcon fontSize="small" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <InstagramIcon fontSize="small" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-rose-600 hover:text-white hover:-translate-y-1 transition-all duration-300 shadow-lg">
                <XIcon fontSize="small" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-rose-600 rounded-full"></span> Get in touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-rose-500 group-hover:text-rose-400 transition-colors">
                  <LocationOnOutlinedIcon fontSize="small" />
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-200 transition-colors">
                  40-Ferozpur Road, Lahore, Punjab, Pakistan
                </span>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-rose-500 group-hover:text-rose-400 transition-colors">
                  <MailOutlineOutlinedIcon fontSize="small" />
                </div>
                <a href="mailto:Sales@Themarflexgroup.Com" className="text-sm text-slate-400 group-hover:text-rose-400 transition-colors">
                  Sales@Themarflexgroup.Com
                </a>
              </li>
              <li className="flex items-start gap-3 group">
                <div className="mt-0.5 text-rose-500 group-hover:text-rose-400 transition-colors">
                  <LocalPhoneOutlinedIcon fontSize="small" />
                </div>
                <a href="tel:0348-111-66-11" className="text-sm text-slate-400 group-hover:text-rose-400 transition-colors">
                  0348-111-66-11
                </a>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-blue-600 rounded-full"></span> Information
            </h3>
            <ul className="space-y-3">
              {infoLinks.map((item) => (
                <li key={item.label}>
                  <Link 
                    to={item.path} 
                    className="text-sm text-slate-400 hover:text-white hover:pl-2 transition-all duration-300 flex items-center gap-2 before:content-['›'] before:text-blue-500 before:font-bold before:text-lg"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-1">
            <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
              <span className="w-8 h-1 bg-emerald-500 rounded-full"></span> Newsletter
            </h3>
            <p className="text-sm text-slate-400 mb-6 leading-relaxed">
              Subscribe to our newsletter and get <strong className="text-white">10% off</strong> your first purchase.
            </p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="Your email address" 
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3.5 pl-11 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
                <MailOutlineOutlinedIcon fontSize="small" />
              </div>
              <button className="mt-3 w-full bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white font-bold py-3 rounded-xl shadow-lg shadow-rose-600/20 transition-all hover:-translate-y-0.5 active:translate-y-0">
                Subscribe Now
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-500 text-center md:text-left">
            Copyright © {new Date().getFullYear()} <strong className="text-white">Marblex Store</strong>. All rights reserved.
          </p>
          <div className="flex gap-4">
            {/* Payment methods mock */}
            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-slate-400">VISA</div>
            <div className="h-8 w-12 bg-white/10 rounded flex items-center justify-center text-xs font-bold text-slate-400">MC</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
