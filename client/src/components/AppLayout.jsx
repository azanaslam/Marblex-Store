import { useEffect, useState } from "react";
import { Badge, Box } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";
import { FloatingChatWidget } from "./FloatingChatWidget";

export const AppLayout = ({ cartCount, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUserFromStorage, setAuthUserFromStorage] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());
  const [chatUnreadNav, setChatUnreadNav] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  let tokenPayload = null;

  const isHomePage = location.pathname === "/";

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
    setIsMenuOpen(false);
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
    setIsMenuOpen(false);
  }, [location.pathname]);

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
          scrolled || isMenuOpen
            ? "bg-white border-slate-200/60 shadow-lg shadow-slate-200/20 py-2" 
            : "bg-white border-transparent py-4"
        }`}
      >
        <div className="max-w-[1400px] mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            
            {/* Logo area */}
            <div className="flex items-center gap-2">
              {!isHomePage && (
                <button 
                  onClick={() => navigate(-1)}
                  className="md:hidden p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  <ArrowBackIosNewIcon sx={{ fontSize: 18 }} />
                </button>
              )}
              <RouterLink to="/" className="flex items-center gap-2 sm:gap-3 group">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-100 group-hover:shadow-md transition-all duration-300">
                  <img 
                    src="/products/Logo.jpeg" 
                    alt="Marblex Logo" 
                    className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => e.currentTarget.src = "/icons.svg"}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-base sm:text-lg md:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                    Marblex
                  </span>
                  <span className="text-[9px] sm:text-[10px] md:text-sm font-bold text-rose-600 tracking-wider uppercase">
                    Store
                  </span>
                </div>
              </RouterLink>
            </div>

            {/* Main Navigation - Desktop */}
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
            <div className="flex items-center gap-1 md:gap-4">
              <RouterLink 
                to="/cart"
                className="flex items-center gap-2 p-2 md:px-4 md:py-2.5 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 text-slate-700 font-semibold text-sm"
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
                <div className="hidden sm:flex items-center gap-2">
                  {isAdmin && (
                    <RouterLink to="/admin" className="px-4 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 rounded-full transition-colors">
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0}>
                        Admin
                      </Badge>
                    </RouterLink>
                  )}
                  {isCustomer && (
                    <RouterLink to="/dashboard" className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
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

              {/* Mobile Menu Toggle */}
              <button 
                className="md:hidden p-2 rounded-full hover:bg-slate-100 transition-colors"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div 
          className={`md:hidden absolute top-full left-0 w-full bg-white border-b border-slate-200 transition-all duration-300 ease-in-out overflow-hidden ${
            isMenuOpen ? "max-h-[500px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
          }`}
        >
          <div className="flex flex-col px-6 gap-4">
            {navLinks.map((link) => (
              <RouterLink 
                key={link.label} 
                to={link.path}
                className="text-lg font-bold text-slate-800 hover:text-rose-600 transition-colors py-2 border-b border-slate-50"
                onClick={() => setIsMenuOpen(false)}
              >
                {link.label}
              </RouterLink>
            ))}
            
            <div className="pt-4 flex flex-col gap-3">
              {!isUserLoggedIn ? (
                <RouterLink 
                  to="/login"
                  className="flex items-center justify-center w-full py-4 rounded-2xl bg-slate-900 text-white font-bold text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </RouterLink>
              ) : (
                <>
                  {isAdmin && (
                    <RouterLink 
                      to="/admin" 
                      className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-rose-50 text-rose-600 font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Admin Dashboard
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0} />
                    </RouterLink>
                  )}
                  {isCustomer && (
                    <RouterLink 
                      to="/dashboard" 
                      className="flex items-center justify-between w-full py-3 px-4 rounded-xl bg-slate-50 text-slate-700 font-bold"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {customerLabel}
                      <Badge color="error" variant="dot" invisible={chatUnreadNav === 0} />
                    </RouterLink>
                  )}
                  <button 
                    onClick={logout}
                    className="w-full py-3 text-center font-bold text-slate-500 hover:text-rose-600"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative z-10 w-full">
        {children}
      </main>

      {/* Floating Chat for Customers */}
      <FloatingChatWidget />
    </div>
  );
};
