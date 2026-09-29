import { useMemo, useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineOutlinedIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import HeadsetMicOutlinedIcon from "@mui/icons-material/HeadsetMicOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { authHeaders, http } from "../api/http";
import { getAuthToken, getAuthUser } from "../auth/session";
import gsap from "gsap";

export const CartPage = ({ cart = [], setCart }) => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const containerRef = useRef(null);

  const [form, setForm] = useState({
    customerName: authUser?.name || "",
    email: authUser?.email || "",
    phone: "",
    notes: "",
  });

  const [touched, setTouched] = useState({
    customerName: false,
    email: false,
    phone: false,
  });

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Smooth Page Load Entrance & Scroll Reveal Animations
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (!containerRef.current) return;

    // 1. Initial Page Load Stagger Animation
    const ctx = gsap.context(() => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

      // Header slides down smoothly from top
      gsap.fromTo(
        ".cart-anim-header",
        { opacity: 0, y: -25 },
        { opacity: 1, y: 0, duration: 0.95, ease: "power3.out" }
      );

      // Items section enters from the LEFT (or bottom on mobile)
      gsap.fromTo(
        ".cart-anim-items",
        { opacity: 0, x: isMobile ? 0 : -70, y: isMobile ? 35 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 1.15, ease: "power3.out" }
      );

      // Individual product rows stagger from the left (or bottom on mobile)
      gsap.fromTo(
        ".cart-item-row",
        { opacity: 0, x: isMobile ? 0 : -30, y: isMobile ? 20 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 0.85, stagger: 0.1, delay: 0.2, ease: "power3.out" }
      );

      // Your details section enters from BOTTOM with smooth elevation and slight scale
      gsap.fromTo(
        ".cart-anim-details",
        { opacity: 0, y: 50, scale: 0.96 },
        { opacity: 1, y: 0, scale: 1, duration: 1.15, delay: 0.22, ease: "power3.out" }
      );

      // Order summary enters from the RIGHT (or bottom on mobile with delay)
      gsap.fromTo(
        ".cart-anim-summary",
        { opacity: 0, x: isMobile ? 0 : 70, y: isMobile ? 35 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 1.15, delay: isMobile ? 0.3 : 0.1, ease: "power3.out" }
      );
    }, containerRef);

    // 2. Scroll Reveal for Sections (triggers smoothly as user scrolls down)
    const observerCallback = (entries, observer) => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target.classList.contains("cart-anim-items")) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, x: isMobile ? 0 : -50, y: isMobile ? 30 : 0 },
              { opacity: 1, x: 0, y: 0, duration: 1.05, ease: "power3.out" }
            );
          } else if (entry.target.classList.contains("cart-anim-summary")) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, x: isMobile ? 0 : 50, y: isMobile ? 30 : 0 },
              { opacity: 1, x: 0, y: 0, duration: 1.05, ease: "power3.out" }
            );
          } else {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 40, scale: 0.97 },
              { opacity: 1, y: 0, scale: 1, duration: 1.05, ease: "power3.out" }
            );
          }
          observer.unobserve(entry.target);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    });

    const scrollElements = containerRef.current.querySelectorAll(".cart-scroll-section");
    scrollElements.forEach((el) => observer.observe(el));

    return () => {
      ctx.revert();
      observer.disconnect();
    };
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2400);
  };

  const fmt = (v) => "PKR " + Number(v || 0).toLocaleString("en-US");

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1), 0),
    [cart]
  );

  const totalItemsCount = useMemo(
    () => cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0),
    [cart]
  );

  const errors = {
    customerName: form.customerName.trim() ? "" : "Full name is required",
    email: !form.email.trim()
      ? "Email is required"
      : !/^\S+@\S+\.\S+$/.test(form.email)
      ? "Enter a valid email"
      : "",
    phone: !form.phone.trim()
      ? "Phone is required"
      : form.phone.trim().length < 7
      ? "Enter a valid phone number"
      : "",
  };

  const isFormValid = !errors.customerName && !errors.email && !errors.phone;
  const isOrderDisabled = !isFormValid || cart.length === 0 || loadingOrder;

  const changeQty = (id, delta) => {
    const next = cart.map((item) => {
      if (item.productId === id || item._id === id) {
        const nextQ = (item.quantity || 1) + delta;
        return { ...item, quantity: Math.max(1, nextQ) };
      }
      return item;
    });
    setCart(next);
  };

  const removeItem = (id) => {
    const next = cart.filter((item) => item.productId !== id && item._id !== id);
    setCart(next);
    triggerToast("Item removed from cart");
  };

  const submitOrder = async (channel) => {
    if (isOrderDisabled) {
      setTouched({ customerName: true, email: true, phone: true });
      return;
    }

    // Check authentication for website channel: show professional modal if not logged in
    if (channel === "website") {
      const token = getAuthToken();
      const user = getAuthUser();
      if (!token || !user) {
        setShowLoginModal(true);
        return;
      }
    }

    setLoadingOrder(true);

    try {
      const payload = {
        ...form,
        channel,
        items: cart.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl,
        })),
      };

      let res;
      if (channel === "website") {
        const token = getAuthToken();
        const user = getAuthUser();
        payload.email = user.email;
        res = await http.post("/orders", payload, authHeaders(token));
      } else {
        res = await http.post("/orders", payload);
      }

      if (channel === "whatsapp") {
        const list = cart
          .map((item) => `${item.name} x${item.quantity || 1} = PKR ${item.price * (item.quantity || 1)}`)
          .join("%0A");
        const waNum = res.data?.whatsappNumber || "923481116611";
        const msg =
          `*Order from MARBLEX Website*%0A` +
          `*Customer:* ${form.customerName}%0A` +
          `*Email:* ${form.email}%0A` +
          `*Phone:* ${form.phone}%0A%0A` +
          `*Products:*%0A${list}%0A%0A` +
          `*Total:* ${fmt(res.data?.subtotal || total)}%0A` +
          `*Notes:* ${form.notes || "None"}`;
        window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank");
        triggerToast("Order sent via WhatsApp!");
        setCart([]);
      } else {
        if (res.data?.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
          return;
        }
        triggerToast("Order placed successfully!");
        setCart([]);
        navigate("/payment/success");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to place order. Please try again.";
      triggerToast(message);
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div ref={containerRef} className="max-w-[1180px] mx-auto px-3.5 sm:px-6 py-4 sm:py-8 text-[#0b2f3c] dark:text-[#eaf3f7] overflow-x-hidden">
      
      {/* Breadcrumb & Header */}
      <div className="cart-anim-header">
        <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1.5">
          <RouterLink to="/" className="hover:text-[#0a3d52] dark:hover:text-sky-400 transition-colors">
            Home
          </RouterLink>
          <span>/</span>
          <span className="text-[#0a3d52] dark:text-white font-semibold">Cart</span>
        </div>

        {/* Header & Steps */}
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5 sm:mb-8 pb-3 border-b border-slate-200 dark:border-[#1f3d4a]">
          <h1 
            className="text-xl sm:text-2xl md:text-[32px] font-extrabold tracking-tight m-0 text-[#0a3d52] dark:text-white"
            style={{ fontFamily: "'Poppins', sans-serif" }}
          >
            Your Cart
          </h1>

          <div className="flex items-center gap-1.5 sm:gap-3 text-xs sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#0a3d52] dark:text-white font-bold">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-[#0a3d52] dark:bg-[#0ea5e9] text-white flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-xs">
                1
              </span>
              <span>Cart</span>
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1 sm:gap-1.5 opacity-60">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-slate-200 dark:bg-[#1f3d4a] text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] sm:text-xs font-bold">
                2
              </span>
              <span className="hidden xs:inline sm:inline">Details</span>
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1 sm:gap-1.5 opacity-60">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-slate-200 dark:bg-[#1f3d4a] text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] sm:text-xs font-bold">
                3
              </span>
              <span className="hidden xs:inline sm:inline">Confirmation</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Items & Form, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5 sm:gap-6 lg:gap-8 items-start">
        
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col gap-5 sm:gap-6">
          
          {/* Card 1: Items (Enters from Left) */}
          <div className="cart-anim-items cart-scroll-section bg-white dark:bg-[#112832] border border-slate-200 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[20px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1f3d4a] flex items-center justify-between">
              <h2 className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Items
              </h2>
              <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                {cart.length} {cart.length === 1 ? "product" : "products"} ({totalItemsCount} items)
              </span>
            </div>

            {/* Product List */}
            {cart.length === 0 ? (
              <div className="py-12 sm:py-16 px-4 sm:px-6 text-center text-slate-500 dark:text-slate-400">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 dark:bg-[#0e222b] border border-slate-200/80 dark:border-[#1f3d4a] flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl">
                  🛒
                </div>
                <p className="text-sm sm:text-base font-bold text-[#0a3d52] dark:text-white mb-1" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  Your cart is empty.
                </p>
                <p className="text-xs sm:text-sm max-w-sm mx-auto mb-5 text-slate-500 dark:text-slate-400 font-normal">
                  Looks like you haven't added any construction chemicals or waterproofing products yet.
                </p>
                <RouterLink
                  to="/"
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0a3d52]/20 hover:opacity-95 transition-all active:scale-95"
                >
                  <span>Explore Products</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </RouterLink>
              </div>
            ) : (
              <div>
                {cart.map((item, idx) => {
                  const itemId = item.productId || item._id || idx;
                  const targetProductId = item.productId || item._id || item.id;
                  const productUrl = targetProductId ? `/product/${targetProductId}` : "/";
                  const itemPrice = Number(item.price) || 0;
                  const itemQty = Number(item.quantity) || 1;
                  const itemTotal = itemPrice * itemQty;

                  return (
                    <div
                      key={itemId}
                      className="cart-item-row flex flex-col sm:grid sm:grid-cols-[76px_1fr_auto_auto_36px] gap-3 sm:gap-4 sm:items-center px-4 sm:px-6 py-3.5 sm:py-4.5 border-b border-slate-100 dark:border-[#1f3d4a]/70 last:border-b-0 hover:bg-slate-50/70 dark:hover:bg-[#0e222b]/50 transition-colors"
                    >
                      {/* Top Row on Mobile (Image + Title/Price + Delete) */}
                      <div className="flex items-start gap-3 sm:contents">
                        
                        {/* Clickable Product Thumbnail */}
                        <RouterLink
                          to={productUrl}
                          className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-[14px] overflow-hidden border border-slate-200/80 dark:border-[#1f3d4a] bg-slate-50 dark:bg-[#0e222b] flex items-center justify-center shrink-0 group/img cursor-pointer transition-all hover:border-[#0a3d52]/40"
                          title={`View details of ${item.name}`}
                        >
                          <img
                            src={item.imageUrl || "/products/Banner1.jpeg"}
                            alt={item.name}
                            className="w-full h-full object-cover group-hover/img:scale-108 transition-transform duration-300"
                            onError={(e) => {
                              e.currentTarget.src = "/products/Banner1.jpeg";
                            }}
                          />
                        </RouterLink>

                        {/* Clickable Name & Unit Price */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <RouterLink
                              to={productUrl}
                              className="group/title block flex-1 cursor-pointer"
                              title={`View details of ${item.name}`}
                            >
                              <h3 className="font-semibold text-sm sm:text-[15px] leading-snug line-clamp-2 text-[#0a3d52] dark:text-white mb-0.5 group-hover/title:text-sky-600 dark:group-hover/title:text-sky-400 transition-colors">
                                {item.name}
                              </h3>
                            </RouterLink>
                            
                            {/* Mobile Delete Button (visible on mobile only) */}
                            <button
                              onClick={() => removeItem(itemId)}
                              aria-label="Remove item"
                              className="sm:hidden -mr-1 -mt-0.5 p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                            >
                              <DeleteOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                            </button>
                          </div>

                          <div className="flex items-center flex-wrap gap-2 text-xs sm:text-[12.5px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                            <span>{fmt(itemPrice)} each</span>
                            <span className="inline-flex items-center gap-1 text-[10.5px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              In stock
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Bar on Mobile (Quantity + Item Total) / Inline Columns on Tablet & Desktop */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1f3d4a]/50 sm:border-0 sm:pt-0 sm:contents">
                        {/* Quantity Selector */}
                        <div className="flex items-center border border-slate-200 dark:border-[#1f3d4a] rounded-full bg-slate-50/80 dark:bg-[#0e222b] p-0.5 w-fit">
                          <button
                            onClick={() => changeQty(itemId, -1)}
                            disabled={itemQty <= 1}
                            aria-label="Decrease quantity"
                            className="w-7 h-7 sm:w-[32px] sm:h-[32px] rounded-full border-0 bg-transparent text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-base flex items-center justify-center hover:text-[#0a3d52] hover:bg-slate-200/60 dark:hover:bg-[#1a3847] disabled:opacity-30 disabled:hover:text-inherit cursor-pointer transition-colors"
                          >
                            −
                          </button>
                          <span className="min-w-[24px] sm:min-w-[28px] text-center font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-100">
                            {itemQty}
                          </span>
                          <button
                            onClick={() => changeQty(itemId, 1)}
                            aria-label="Increase quantity"
                            className="w-7 h-7 sm:w-[32px] sm:h-[32px] rounded-full border-0 bg-transparent text-slate-600 dark:text-slate-300 font-bold text-sm sm:text-base flex items-center justify-center hover:text-[#0a3d52] hover:bg-slate-200/60 dark:hover:bg-[#1a3847] cursor-pointer transition-colors"
                          >
                            +
                          </button>
                        </div>

                        {/* Total Price */}
                        <div 
                          className="text-right font-bold text-sm sm:text-[15px] sm:min-w-[110px] text-[#0a3d52] dark:text-slate-100"
                          style={{ fontFamily: "'Poppins', sans-serif" }}
                        >
                          <span className="text-[11px] font-normal text-slate-400 sm:hidden mr-1">Total:</span>
                          {fmt(itemTotal)}
                        </div>

                        {/* Desktop Delete Button (visible on tablet/desktop) */}
                        <button
                          onClick={() => removeItem(itemId)}
                          aria-label="Remove item"
                          className="hidden sm:flex w-9 h-9 rounded-xl border border-transparent text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:hover:border-rose-900/50 items-center justify-center transition-all cursor-pointer"
                        >
                          <DeleteOutlineOutlinedIcon sx={{ fontSize: 18 }} />
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card 2: Your Details Form */}
          <div className="cart-anim-details cart-scroll-section bg-white dark:bg-[#112832] border border-slate-200 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[20px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
            <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1f3d4a] flex items-center justify-between">
              <h2 className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Your details
              </h2>
              <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                Required fields *
              </span>
            </div>

            <div className="p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-5">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Full name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Azzan Aslam"
                  value={form.customerName}
                  onBlur={() => setTouched((prev) => ({ ...prev, customerName: true }))}
                  onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-sm transition-all outline-none bg-slate-50/70 dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 ${
                    touched.customerName && errors.customerName
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 dark:border-[#1f3d4a] focus:border-[#0a3d52] dark:focus:border-sky-500 focus:ring-4 focus:ring-[#0a3d52]/10 dark:focus:ring-sky-500/15 focus:bg-white dark:focus:bg-[#112832]"
                  }`}
                />
                {touched.customerName && errors.customerName && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.customerName}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Email *
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-sm transition-all outline-none bg-slate-50/70 dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 ${
                    touched.email && errors.email
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 dark:border-[#1f3d4a] focus:border-[#0a3d52] dark:focus:border-sky-500 focus:ring-4 focus:ring-[#0a3d52]/10 dark:focus:ring-sky-500/15 focus:bg-white dark:focus:bg-[#112832]"
                  }`}
                />
                {touched.email && errors.email && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Phone *
                </label>
                <input
                  type="tel"
                  placeholder="03XX XXXXXXX"
                  value={form.phone}
                  onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className={`w-full px-3.5 sm:px-4 py-3 rounded-xl border text-sm transition-all outline-none bg-slate-50/70 dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 ${
                    touched.phone && errors.phone
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                      : "border-slate-200 dark:border-[#1f3d4a] focus:border-[#0a3d52] dark:focus:border-sky-500 focus:ring-4 focus:ring-[#0a3d52]/10 dark:focus:ring-sky-500/15 focus:bg-white dark:focus:bg-[#112832]"
                  }`}
                />
                {touched.phone && errors.phone && (
                  <p className="text-[11px] text-red-500 mt-1 font-medium">{errors.phone}</p>
                )}
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Notes / area / location info
                </label>
                <textarea
                  placeholder="Site address, area size in sq ft, delivery instructions…"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3.5 sm:px-4 py-3 rounded-xl border border-slate-200 dark:border-[#1f3d4a] text-sm transition-all outline-none bg-slate-50/70 dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-500 focus:ring-4 focus:ring-[#0a3d52]/10 dark:focus:ring-sky-500/15 focus:bg-white dark:focus:bg-[#112832] resize-y min-h-[96px]"
                />
              </div>

            </div>
          </div>

        </div>

        {/* ==================== RIGHT COLUMN (STICKY ASIDE) ==================== */}
        <aside className="cart-anim-summary cart-scroll-section sticky top-20 bg-white dark:bg-[#112832] border border-slate-200 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[20px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
          
          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1f3d4a]">
            <h2 className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
              Order summary
            </h2>
          </div>

          <div className="p-4 sm:p-6 space-y-3">
            <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Subtotal</span>
              <b className="text-slate-800 dark:text-white font-semibold">{fmt(total)}</b>
            </div>

            <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Delivery</span>
              <b className="text-emerald-700 dark:text-emerald-400 font-semibold">Confirmed by our team</b>
            </div>

            {/* Total Line with Dashed Border */}
            <div className="flex justify-between items-center pt-3.5 sm:pt-4 mt-2 border-t border-dashed border-slate-200 dark:border-[#1f3d4a]">
              <span className="text-sm sm:text-base font-bold text-slate-700 dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                Total
              </span>
              <span 
                className="text-xl sm:text-2xl md:text-[26px] font-extrabold text-[#0a3d52] dark:text-sky-400"
                style={{ fontFamily: "'Poppins', sans-serif" }}
              >
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="px-4 sm:px-6 pb-5 sm:pb-6 pt-1 flex flex-col gap-2.5 sm:gap-3">
            <button
              onClick={() => submitOrder("website")}
              disabled={isOrderDisabled}
              className="w-full py-3 sm:py-4 px-4 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-sm sm:text-[15px] border-0 shadow-lg shadow-[#0a3d52]/20 hover:shadow-xl hover:shadow-[#0a3d52]/30 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShoppingCartOutlinedIcon sx={{ fontSize: 19 }} />
              <span>{loadingOrder ? "Processing..." : "Place Website Order"}</span>
            </button>

            <button
              onClick={() => submitOrder("whatsapp")}
              disabled={isOrderDisabled}
              className="w-full py-3 sm:py-4 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-[15px] border-0 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 19 }} />
              <span>Order on WhatsApp</span>
            </button>
          </div>

          {/* Trust Footnotes */}
          <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-2 flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#1f3d4a]/60">
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2"/>
                <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Secure checkout</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span>Quality assured</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 17C21 18.6569 19.6569 20 18 20H17V15H18C19.6569 15 21 15.8954 21 17Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 17C3 15.8954 4.34315 15 6 15H7V20H6C4.34315 20 3 18.6569 3 17Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>Direct engineer support</span>
            </span>
          </div>

        </aside>

      </div>

      {/* Toast Notification */}
      <div
        className={`fixed left-1/2 bottom-7 -translate-x-1/2 z-50 bg-[#0b2f3c] text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold shadow-2xl transition-all duration-300 pointer-events-none ${
          showToast ? "translate-y-0 opacity-100" : "translate-y-12 opacity-0"
        }`}
      >
        {toastMessage}
      </div>

      {/* Professional Login Required Modal (Refined Corporate Palette) */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-[#0a1a21]/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm sm:max-w-md bg-white dark:bg-[#0c222f] border border-slate-200 dark:border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-black/40 text-[#0f1929] dark:text-slate-100 overflow-hidden">
            
            {/* Ambient Background Accent */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-[#0a3d52]/10 dark:bg-[#0ea5e9]/10 rounded-full blur-[50px] pointer-events-none" />

            {/* Close Button */}
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 sm:top-5 right-4 sm:right-5 w-8 h-8 rounded-full bg-slate-100 dark:bg-[#112832] text-slate-500 hover:text-[#0a3d52] dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer border border-slate-200 dark:border-slate-700 text-sm"
              aria-label="Close dialog"
            >
              ✕
            </button>

            {/* Emblem Badge */}
            <div className="w-12 h-12 rounded-2xl bg-[#0a3d52]/10 dark:bg-[#0a3d52]/30 border border-[#0a3d52]/15 dark:border-[#0ea5e9]/20 flex items-center justify-center text-[#0a3d52] dark:text-sky-300 mb-4 shadow-xs">
              <LockOutlinedIcon sx={{ fontSize: 24 }} />
            </div>

            {/* Title & Description */}
            <h3 
              className="text-lg sm:text-xl font-bold tracking-tight text-[#0a3d52] dark:text-white mb-1.5"
              style={{ fontFamily: "'Poppins', sans-serif" }}
            >
              Account Login Required
            </h3>
            <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed mb-4 font-normal">
              Please sign in with your MARBLEX account to place website orders, process online payments, and track real-time delivery.
            </p>

            {/* Order Total Summary Chip */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#0e2735] border border-slate-200/80 dark:border-slate-700/70 mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCartOutlinedIcon sx={{ fontSize: 17, color: "#0a3d52" }} className="dark:text-sky-400" />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  {cart.length} {cart.length === 1 ? "Product" : "Products"} ({totalItemsCount} items)
                </span>
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {fmt(total)}
              </span>
            </div>

            {/* Modal Actions (Professional Corporate Look) */}
            <div className="flex flex-col gap-2.5">
              <RouterLink
                to="/login"
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0a3d52]/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-center cursor-pointer"
              >
                <span>Login or Create Account</span>
                <ArrowForwardIcon sx={{ fontSize: 15 }} />
              </RouterLink>

              <button
                onClick={() => {
                  setShowLoginModal(false);
                  submitOrder("whatsapp");
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-emerald-600/30 hover:border-emerald-600/60 bg-emerald-500/5 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <WhatsAppIcon sx={{ fontSize: 17 }} />
                <span>Order via WhatsApp (Guest)</span>
              </button>

              <button
                onClick={() => setShowLoginModal(false)}
                className="w-full py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer text-center mt-0.5"
              >
                Continue Shopping
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
