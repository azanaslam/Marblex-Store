import { useState, useCallback, useEffect } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Badge } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { NavLogo } from "./NavLogo";
import { NavDropdown } from "./NavDropdown";
import { SettingsMenu } from "./SettingsMenu";
import { AccountMenu } from "./AccountMenu";
import { NAV_ITEMS, WHATSAPP_QUOTE_URL } from "./navConfig";

export const Navbar = ({
  cartCount = 0,
  authUser,
  isUserLoggedIn,
  isAdmin,
  isCustomer,
  notifCount = 0,
  onLogout,
  openNotifications,
  isDark = false,
  toggleTheme,
  isApp = false,
  isMenuOpen = false,
  setIsMenuOpen,
  scrolled = false,
  logoRef,
  navPillsRef,
  actionsRef,
  headerRef,
}) => {
  const { t } = useTranslation();
  const location = useLocation();

  // Single active desktop dropdown tracker: null | 'tools' | 'resources' | 'settings' | 'account'
  const [activeDropdown, setActiveDropdown] = useState(null);

  const handleDropdownToggle = useCallback((id, shouldOpen) => {
    setActiveDropdown((prev) => (shouldOpen ? id : prev === id ? null : prev));
  }, []);

  const handleDropdownClose = useCallback((id) => {
    setActiveDropdown((prev) => (prev === id ? null : prev));
  }, []);

  // Close all open dropdowns on route changes
  useEffect(() => {
    setActiveDropdown(null);
  }, [location.pathname]);

  return (
    <header
      ref={headerRef}
      style={{ zIndex: isMenuOpen ? 10200 : 40 }}
      className={`sticky top-0 w-full transition-[height,background-color,box-shadow,border-color] duration-200 ease-in-out border-b ${
        isDark
          ? scrolled
            ? "h-[64px] lg:h-[68px] bg-[#0c222f]/95 backdrop-blur-md border-slate-800 shadow-md shadow-black/30"
            : "h-[68px] lg:h-[74px] bg-[#091b24] border-slate-800/80"
          : scrolled
          ? "h-[64px] lg:h-[68px] bg-white/95 backdrop-blur-md border-slate-200/90 shadow-md shadow-[#0a3d52]/5"
          : "h-[68px] lg:h-[74px] bg-white border-slate-200/80"
      } ${isApp ? "pt-[max(0.25rem,env(safe-area-inset-top,0px))]" : ""}`}
    >
      <div className="h-full max-w-[1440px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Zone: Logo */}
        <div ref={logoRef} className="shrink-0 flex items-center">
          <NavLogo isDark={isDark} showBackOnMobile={true} />
        </div>

        {/* Center Zone: Desktop Navigation Bar (>= 1024px) */}
        <nav
          ref={navPillsRef}
          aria-label="Main Navigation"
          className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0"
        >
          {NAV_ITEMS.map((item) => {
            if (item.isDropdown) {
              return (
                <NavDropdown
                  key={item.id}
                  item={item}
                  isOpen={activeDropdown === item.id}
                  onToggle={(open) => handleDropdownToggle(item.id, open)}
                  onClose={() => handleDropdownClose(item.id)}
                  isDark={isDark}
                />
              );
            }

            const isActive = location.pathname === item.path;
            return (
              <RouterLink
                key={item.id}
                to={item.path}
                className={`relative px-3.5 py-2 text-[13.5px] font-semibold font-subheading rounded-full transition-all duration-150 whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
                  isActive
                    ? isDark
                      ? "text-white font-bold"
                      : "text-[#0a3d52] font-bold"
                    : isDark
                    ? "text-slate-300 hover:text-white hover:bg-white/5"
                    : "text-slate-700 hover:text-[#0a3d52] hover:bg-slate-100/70"
                }`}
              >
                <span>{t(item.labelKey, item.defaultLabel)}</span>
                {isActive && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-[#ff6b4a] rounded-full shadow-xs" />
                )}
              </RouterLink>
            );
          })}
        </nav>

        {/* Right Zone: Controls & CTA */}
        <div
          ref={actionsRef}
          className="flex shrink-0 items-center gap-2 sm:gap-2.5 lg:gap-3"
        >
          {/* Tablet Quote CTA (768px - 1023px) */}
          <a
            href={WHATSAPP_QUOTE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.getQuote", "Get Free Quote")}
            className="hidden md:inline-flex lg:hidden items-center gap-1.5 h-9 px-3 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] text-white text-[11px] font-bold uppercase tracking-wider shadow-xs hover:opacity-95 transition"
          >
            <RequestQuoteOutlinedIcon sx={{ fontSize: 16 }} />
            <span className="hidden sm:inline">{t("nav.getQuote", "Quote")}</span>
          </a>

          {/* Desktop Settings Menu (Language, Theme, Install App) */}
          <div className="hidden lg:block">
            <SettingsMenu
              isOpen={activeDropdown === "settings"}
              onToggle={(open) => handleDropdownToggle("settings", open)}
              onClose={() => handleDropdownClose("settings")}
              isDark={isDark}
              toggleTheme={toggleTheme}
              isApp={isApp}
            />
          </div>

          {/* Cart Icon Button with Badge (Hidden in PWA standalone app if bottom nav active) */}
          {!isApp && (
            <RouterLink
              to="/cart"
              aria-label={t("nav.cart", "Cart")}
              title={t("nav.cart", "Shopping Cart")}
              className={`relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 touch-manipulation cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
                isDark
                  ? "border-slate-700 bg-[#0e2735] text-slate-200 hover:text-white hover:border-[#ff6b4a] shadow-xs"
                  : "border-slate-200 bg-[#f8fafc] text-[#0a3d52] hover:bg-white hover:border-slate-300 shadow-xs"
              }`}
            >
              <Badge
                badgeContent={cartCount}
                invisible={!cartCount || cartCount <= 0}
                sx={{
                  "& .MuiBadge-badge": {
                    bgcolor: "#ff6b4a",
                    color: "white",
                    fontWeight: 800,
                    fontSize: "9px",
                    height: "16px",
                    minWidth: "16px",
                    top: -3,
                    right: -3,
                  },
                }}
              >
                <ShoppingCartIcon sx={{ fontSize: 18 }} />
              </Badge>
            </RouterLink>
          )}

          {/* Desktop Account Menu / Login Button (>= 1024px) */}
          <div className="hidden lg:block">
            <AccountMenu
              authUser={authUser}
              isUserLoggedIn={isUserLoggedIn}
              isAdmin={isAdmin}
              isCustomer={isCustomer}
              notifCount={notifCount}
              isOpen={activeDropdown === "account"}
              onToggle={(open) => handleDropdownToggle("account", open)}
              onClose={() => handleDropdownClose("account")}
              onLogout={onLogout}
              openNotifications={openNotifications}
              isDark={isDark}
              isApp={isApp}
              compact={false}
            />
          </div>

          {/* Mobile Account Icon (Visible < 1024px) */}
          <div className="lg:hidden">
            <AccountMenu
              authUser={authUser}
              isUserLoggedIn={isUserLoggedIn}
              isAdmin={isAdmin}
              isCustomer={isCustomer}
              notifCount={notifCount}
              isOpen={activeDropdown === "account-mobile"}
              onToggle={(open) => handleDropdownToggle("account-mobile", open)}
              onClose={() => handleDropdownClose("account-mobile")}
              onLogout={onLogout}
              openNotifications={openNotifications}
              isDark={isDark}
              isApp={isApp}
              compact={true}
            />
          </div>

          {/* Desktop "Get Free Quote" Primary Button (>= 1024px) */}
          <a
            href={WHATSAPP_QUOTE_URL}
            target="_blank"
            rel="noreferrer"
            aria-label={t("nav.getQuote", "Get Free Quote")}
            className="hidden lg:inline-flex items-center gap-1.5 h-9 sm:h-10 px-4 xl:px-5 rounded-full bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] active:scale-95 text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#ff6b4a]/25 transition-all cursor-pointer whitespace-nowrap outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a]"
          >
            <WhatsAppIcon sx={{ fontSize: 16 }} />
            <span className="hidden xl:inline">{t("nav.getQuote", "Get Free Quote")}</span>
            <span className="xl:hidden">{t("nav.getQuote", "Quote")}</span>
          </a>

          {/* Mobile Hamburger Menu Toggle Button (< 1024px) */}
          <button
            type="button"
            style={{ zIndex: isMenuOpen ? 10205 : 70 }}
            className={`lg:hidden relative flex h-9 w-9 sm:h-10 sm:w-10 min-h-[44px] min-w-[44px] items-center justify-center rounded-full border transition-all duration-300 touch-manipulation cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[#ff6b4a] ${
              isMenuOpen
                ? isDark
                  ? "border-[#ff6b4a]/50 bg-[#ff6b4a]/15 text-[#ff8c73] rotate-90"
                  : "border-[#ff6b4a]/40 bg-[#ff6b4a]/10 text-[#ff6b4a] rotate-90"
                : isDark
                ? "border-slate-700 bg-[#0e2735] text-white hover:bg-slate-800 shadow-xs"
                : "border-slate-200 bg-[#f8fafc] text-[#08222e] hover:bg-slate-100 shadow-xs"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown(null);
              setIsMenuOpen(!isMenuOpen);
            }}
            aria-label={isMenuOpen ? "Close Navigation Menu" : "Open Navigation Menu"}
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <CloseIcon sx={{ fontSize: 20 }} /> : <MenuIcon sx={{ fontSize: 20 }} />}
          </button>
        </div>
      </div>
    </header>
  );
};
