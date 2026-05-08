import { useEffect, useState } from "react";
import { Badge, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";

export const AppLayout = ({ cartCount, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUserFromStorage, setAuthUserFromStorage] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());
  const [chatUnreadNav, setChatUnreadNav] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  let tokenPayload = null;

  if (token) {
    try {
      tokenPayload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      tokenPayload = null;
    }
  }

  const authUser = authUserFromStorage || (tokenPayload ? { role: tokenPayload.role } : null);
  const isUserLoggedIn = Boolean(authUser);
  const isCustomer = Boolean(authUser) && authUser?.role !== "admin";
  const isAdmin = authUser?.role === "admin";
  const customerLabel = authUser?.name ? `${authUser.name.split(" ")[0]}'s Dashboard` : "My Dashboard";
  
  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const syncAuth = () => {
      setAuthUserFromStorage(getAuthUser());
      setToken(getAuthToken());
    };

    window.addEventListener(onAuthSessionChangeEvent, syncAuth);
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => {
      window.removeEventListener(onAuthSessionChangeEvent, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [location.pathname]);

  useEffect(() => {
    const load = () => {
      const t = getAuthToken();
      const u = getAuthUser();
      if (!t || !u || (u.role !== "admin" && u.role !== "user" && u.role !== "subowner")) {
        setChatUnreadNav(0);
        return;
      }
      http
        .get("/chat/unread-count", authHeaders(t))
        .then((r) => setChatUnreadNav(Number(r.data?.count) || 0))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [location.pathname, authUserFromStorage, token]);

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "About", path: "/about" },
    { label: "Services", path: "/services" },
    { label: "Contact", path: "/contact" },
    { label: "Blogs", path: "/blogs" },
    { label: "Catalogs", path: "/catalogs" },
  ];

  const categories = ["Car Mats", "Luxury Car Mats", "PVC Wall Panels", "PVC Wooden Flooring"];

  return (
    <div className="flex flex-col min-h-screen relative">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white py-2 px-4 text-center text-sm font-semibold tracking-wide shadow-md z-50">
        <span className="text-rose-400 mr-2">✨</span>
        Free Shipping Nationwide Only On Car Mats
        <span className="text-rose-400 ml-2">✨</span>
      </div>

      {/* Sticky Glass Header */}
      <header 
        className={`sticky top-0 z-40 transition-all duration-300 ease-in-out w-full border-b ${
          scrolled 
            ? "bg-white/80 backdrop-blur-md border-slate-200/60 shadow-lg shadow-slate-200/20 py-2" 
            : "bg-white border-transparent py-4"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo area */}
            <RouterLink to="/" className="flex items-center gap-3 group">
              <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:shadow-md transition-all duration-300">
                <img 
                  src="/products/Logo.jpeg" 
                  alt="Marblex Logo" 
                  className="w-12 h-12 md:w-14 md:h-14 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => e.currentTarget.src = "/icons.svg"}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Marblex
                </span>
                <span className="text-sm font-bold text-rose-600 tracking-wider uppercase">
                  Store
                </span>
              </div>
            </RouterLink>

            {/* Main Navigation */}
            <nav className="hidden md:flex items-center gap-1 bg-slate-50/80 px-2 py-1.5 rounded-full border border-slate-200/60">
              {navLinks.map((link) => (
                <RouterLink 
                  key={link.label} 
                  to={link.path}
                  className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white rounded-full transition-all duration-200 hover:shadow-sm"
                >
                  {link.label}
                </RouterLink>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2 md:gap-4">
              <RouterLink 
                to="/cart"
                className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-slate-700 font-semibold text-sm"
              >
                <Badge badgeContent={cartCount} color="secondary" sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }}>
                  <ShoppingCartIcon className="text-slate-600" fontSize="small" />
                </Badge>
                <span className="hidden sm:inline ml-1">Cart</span>
              </RouterLink>

              {!isUserLoggedIn ? (
                <RouterLink 
                  to="/login"
                  className="hidden sm:flex items-center justify-center px-6 py-2.5 rounded-full bg-slate-900 text-white font-semibold text-sm hover:bg-slate-800 transition-all duration-200 shadow-md shadow-slate-900/10"
                >
                  Login
                </RouterLink>
              ) : (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <RouterLink to="/admin" className="hidden lg:flex px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0}>
                        Admin
                      </Badge>
                    </RouterLink>
                  )}
                  {isCustomer && (
                    <RouterLink to="/dashboard" className="hidden lg:flex px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0}>
                        {customerLabel}
                      </Badge>
                    </RouterLink>
                  )}
                  <button 
                    onClick={logout}
                    className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-rose-600 transition-colors"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>


        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        {children}
      </main>
    </div>
  );
};
