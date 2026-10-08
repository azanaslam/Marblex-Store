import { useMemo, useState, useEffect, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import ShoppingCartOutlinedIcon from "@mui/icons-material/ShoppingCartOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import CreditCardOutlinedIcon from "@mui/icons-material/CreditCardOutlined";
import PhoneAndroidOutlinedIcon from "@mui/icons-material/PhoneAndroidOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import PersonOutlineOutlinedIcon from "@mui/icons-material/PersonOutlineOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LocationCityOutlinedIcon from "@mui/icons-material/LocationCityOutlined";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import StraightenOutlinedIcon from "@mui/icons-material/StraightenOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import { authHeaders, http } from "../api/http";
import { getAuthToken, getAuthUser } from "../auth/session";
import { DEFAULT_PAYMENT_CONFIG } from "../config/paymentConfig";
import {
  StripeCardIcon,
  EasypaisaIcon,
  JazzCashIcon,
  BankTransferIcon,
  CodTruckIcon,
  OnlinePaymentIcon,
  PaymentHeaderBadge,
  SelectedProductsIcon,
  DeliveryContactIcon,
} from "../assets/PaymentBrandIcons";
import selectedProductsBgImg from "../assets/selected-products-bg.jpg";
import orderSummaryBgImg from "../assets/order-summary-bg.jpg";
import onlinePaymentBgImg from "../assets/online-payment-bg.jpg";
import deliveryInfoBgImg from "../assets/delivery-info-bg.jpg";
import gsap from "gsap";

export const CartPage = ({ cart = [], setCart }) => {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const containerRef = useRef(null);

  // Dynamic Payment Configuration (fetched from backend or falls back to local)
  const [paymentConfig, setPaymentConfig] = useState(DEFAULT_PAYMENT_CONFIG);

  // Form State with Comprehensive Order Information
  const [form, setForm] = useState({
    customerName: authUser?.name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
    city: authUser?.city || "",
    address: "",
    areaSize: "",
    deliveryDate: "",
    notes: "",
  });

  // Payment Selection State
  // mainMethod: 'cod' | 'online'
  // onlineSubMethod: 'stripe' | 'easypaisa' | 'jazzcash' | 'bank_transfer'
  const [mainPaymentMethod, setMainPaymentMethod] = useState("cod");
  const [onlineSubMethod, setOnlineSubMethod] = useState("stripe");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofImageBase64, setProofImageBase64] = useState("");
  const [proofImageName, setProofImageName] = useState("");
  const [uploadingProof, setUploadingProof] = useState(false);
  const [copiedKey, setCopiedKey] = useState("");

  const [touched, setTouched] = useState({
    customerName: false,
    email: false,
    phone: false,
    city: false,
    address: false,
    transactionRef: false,
  });

  const [toastMessage, setToastMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [loadingOrder, setLoadingOrder] = useState(false);

  // Fetch Payment Configuration on Mount
  useEffect(() => {
    http
      .get("/orders/payment-config")
      .then((res) => {
        if (res.data?.config) {
          setPaymentConfig(res.data.config);
        }
      })
      .catch(() => {
        // use default fallback config
      });
  }, []);

  // Pre-fill user profile if logged in
  useEffect(() => {
    const user = getAuthUser();
    if (user) {
      setForm((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || "",
        email: prev.email || user.email || "",
        phone: prev.phone || user.phone || "",
        city: prev.city || user.city || "",
      }));
    }
  }, []);

  // Smooth Page Load Entrance & Scroll Reveal Animations
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

      gsap.fromTo(
        ".cart-anim-header",
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
      );

      gsap.fromTo(
        ".cart-anim-items",
        { opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? 25 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 0.85, ease: "power2.out" }
      );

      gsap.fromTo(
        ".cart-item-row",
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.08, delay: 0.15, ease: "power2.out" }
      );

      gsap.fromTo(
        ".cart-anim-details",
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85, delay: 0.18, ease: "power2.out" }
      );

      gsap.fromTo(
        ".cart-anim-summary",
        { opacity: 0, x: isMobile ? 0 : 40, y: isMobile ? 25 : 0 },
        { opacity: 1, x: 0, y: 0, duration: 0.85, delay: isMobile ? 0.2 : 0.1, ease: "power2.out" }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2800);
  };

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      triggerToast("Copied to clipboard!");
      setTimeout(() => setCopiedKey(""), 2000);
    } catch {
      triggerToast("Unable to copy. Please select and copy manually.");
    }
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

  const isBulkOrder = useMemo(
    () =>
      total >= (paymentConfig.bulkThresholdAmount || 50000) ||
      totalItemsCount >= (paymentConfig.bulkThresholdItems || 10),
    [total, totalItemsCount, paymentConfig]
  );

  // Form Validations
  const validatePhone = (val) => {
    const clean = String(val || "").replace(/[\s\-_()]/g, "");
    return /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/.test(clean);
  };

  const isManualPayment =
    mainPaymentMethod === "online" &&
    ["easypaisa", "jazzcash", "bank_transfer"].includes(onlineSubMethod);

  const errors = {
    customerName: form.customerName.trim().length >= 2 ? "" : "Full name is required (min 2 letters)",
    email: !form.email.trim()
      ? "Email address is required"
      : !/^\S+@\S+\.\S+$/.test(form.email.trim())
      ? "Enter a valid email address"
      : "",
    phone: !form.phone.trim()
      ? "Phone number is required"
      : !validatePhone(form.phone)
      ? "Enter a valid Pakistani mobile number (e.g. 0348-1116611)"
      : "",
    city: form.city.trim().length >= 2 ? "" : "City is required",
    address: form.address.trim().length >= 5 ? "" : "Full delivery site address is required (min 5 characters)",
    transactionRef: isManualPayment && transactionRef.trim().length < 3 ? "Transaction ID / Reference Number is required" : "",
  };

  const isFormValid =
    !errors.customerName &&
    !errors.email &&
    !errors.phone &&
    !errors.city &&
    !errors.address &&
    !errors.transactionRef;

  const isOrderDisabled = !isFormValid || cart.length === 0 || loadingOrder || uploadingProof;

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

  const handleProofFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      triggerToast("Only JPG, PNG, and WebP image formats are supported.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      triggerToast("File size must be under 5MB.");
      return;
    }

    setProofImageName(file.name);
    setUploadingProof(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result;
      setProofImageBase64(base64);
      try {
        const res = await http.post("/orders/upload-proof", { imageBase64: base64 });
        if (res.data?.url) {
          setProofImageBase64(res.data.url);
        }
        triggerToast("Payment screenshot attached successfully!");
      } catch {
        // fallback to base64 string
      } finally {
        setUploadingProof(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const submitOrder = async (channel) => {
    if (channel === "website" && isOrderDisabled) {
      setTouched({
        customerName: true,
        email: true,
        phone: true,
        city: true,
        address: true,
        transactionRef: true,
      });
      triggerToast("Please fill in all required fields accurately.");
      return;
    }

    setLoadingOrder(true);

    const finalPaymentMethod =
      channel === "whatsapp"
        ? "cod"
        : mainPaymentMethod === "cod"
        ? "cod"
        : onlineSubMethod;

    try {
      const payload = {
        customerName: form.customerName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        address: form.address.trim(),
        areaSize: form.areaSize.trim(),
        deliveryDate: form.deliveryDate.trim(),
        notes: form.notes.trim(),
        channel,
        paymentMethod: finalPaymentMethod,
        transactionReference: transactionRef.trim(),
        paymentScreenshotUrl: proofImageBase64,
        items: cart.map((item) => ({
          productId: item.productId || item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity || 1,
          imageUrl: item.imageUrl,
        })),
      };

      const token = getAuthToken();
      const headers = token ? authHeaders(token) : {};

      const res = await http.post("/orders", payload, headers);

      if (channel === "whatsapp") {
        const list = cart
          .map((item) => {
            let absImageUrl = "";
            if (item.imageUrl) {
              if (item.imageUrl.startsWith("data:image")) {
                absImageUrl = "Preview on website";
              } else {
                absImageUrl = item.imageUrl.startsWith("http") ? item.imageUrl : window.location.origin + item.imageUrl;
              }
            }
            return `• *${item.name}*\n  Qty: ${item.quantity || 1} | Price: PKR ${(item.price * (item.quantity || 1)).toLocaleString()}${absImageUrl ? `\n  Ref: ${absImageUrl}` : ""}`;
          })
          .join("\n\n");

        const waNum = paymentConfig.whatsapp?.number || res.data?.whatsappNumber || "923084585792";
        const orderNum = res.data?.orderNumber || "INQUIRY";

        const msgRaw = 
          `*🟩 MARBLEX ORDER INQUIRY [${orderNum}]*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `*Customer:* ${form.customerName || "Customer"}\n` +
          `*Phone:* ${form.phone || "Not provided"}\n` +
          `*Email:* ${form.email || "Not provided"}\n` +
          (form.city ? `*City:* ${form.city}\n` : "") +
          (form.address ? `*Delivery Site:* ${form.address}\n` : "") +
          (form.areaSize ? `*Area Size:* ${form.areaSize} sq ft\n` : "") +
          `\n*ORDERED PRODUCTS:*\n${list}\n\n` +
          `*ESTIMATED SUBTOTAL:* ${fmt(res.data?.subtotal || total)}\n` +
          (form.notes ? `*Notes:* ${form.notes}\n` : "") +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `_Please confirm delivery timeline and site supply logistics._`;

        const msg = encodeURIComponent(msgRaw);

        window.open(`https://wa.me/${waNum}?text=${msg}`, "_blank");
        triggerToast("Order inquiry sent via WhatsApp!");
        setCart([]);
        return;
      }

      // Website Order
      if (finalPaymentMethod === "stripe" && res.data?.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
        return;
      }

      // COD or Manual Payment Success
      setCart([]);
      navigate("/payment/success", {
        state: {
          orderId: res.data?.orderId,
          orderNumber: res.data?.orderNumber,
          customerName: res.data?.customerName || form.customerName,
          email: res.data?.email || form.email,
          paymentMethod: finalPaymentMethod,
          subtotal: res.data?.subtotal || total,
          isManual: isManualPayment,
        },
      });
    } catch (error) {
      console.error("Order submission error:", error);
      const message =
        error?.response?.data?.message ||
        "Failed to place order. Please check your internet connection or reach out on WhatsApp.";
      triggerToast(message);
    } finally {
      setLoadingOrder(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="max-w-[1200px] mx-auto px-3.5 sm:px-6 py-4 sm:py-8 text-[#0b2f3c] dark:text-[#eaf3f7] overflow-x-hidden"
    >
      {/* Breadcrumb & Header */}
      <div className="cart-anim-header">
        <div className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 mb-2 font-medium flex items-center gap-1.5">
          <RouterLink to="/" className="hover:text-[#0a3d52] dark:hover:text-sky-400 transition-colors">
            Home
          </RouterLink>
          <span>/</span>
          <span className="text-[#0a3d52] dark:text-white font-semibold">Checkout & Cart</span>
        </div>

        {/* Header & Flow Steps */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 sm:mb-8 pb-3 border-b border-slate-200 dark:border-[#1f3d4a]">
          <div>
            <h1
              className="text-xl sm:text-2xl md:text-[30px] font-black tracking-tight m-0 text-[#0a3d52] dark:text-white"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Order Checkout
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Guest checkout available. No registration required.
            </p>
          </div>

          <div className="w-full sm:w-auto overflow-x-auto pb-1 flex items-center justify-between sm:justify-end gap-2 sm:gap-3 text-xs sm:text-[13px] font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            <span className="flex items-center gap-1 sm:gap-1.5 text-[#0a3d52] dark:text-white font-bold">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-[#0a3d52] dark:bg-[#0ea5e9] text-white flex items-center justify-center text-[11px] sm:text-xs font-bold shadow-xs shrink-0">
                1
              </span>
              <span className="whitespace-nowrap">Cart & Details</span>
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1 sm:gap-1.5 opacity-60">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-slate-200 dark:bg-[#1f3d4a] text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0">
                2
              </span>
              <span className="whitespace-nowrap">Payment</span>
            </span>
            <span className="opacity-30">•</span>
            <span className="flex items-center gap-1 sm:gap-1.5 opacity-60">
              <span className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-slate-200 dark:bg-[#1f3d4a] text-slate-700 dark:text-slate-300 flex items-center justify-center text-[11px] sm:text-xs font-bold shrink-0">
                3
              </span>
              <span className="whitespace-nowrap">Confirmation</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Items & Form, Right Order Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-5 sm:gap-6 lg:gap-8 items-start">
        {/* ==================== LEFT COLUMN ==================== */}
        <div className="flex flex-col gap-5 sm:gap-6">
          {/* Card 1: Cart Items */}
          <div className="cart-anim-items relative bg-white/95 dark:bg-[#112832]/95 border border-slate-200 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[24px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
            {/* Background 3D Construction Materials & Chemical Containers Graphic (Responsive Mobile & Desktop) */}
            <div
              className="absolute inset-0 bg-cover pointer-events-none opacity-20 sm:opacity-30 transition-all duration-700 bg-[position:right_bottom] sm:bg-[position:right_20%]"
              style={{
                backgroundImage: `url(${selectedProductsBgImg})`,
              }}
            />

            {/* Directional Frosted Glass Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-white/98 via-white/92 to-white/75 dark:from-[#112832]/98 dark:via-[#112832]/92 dark:to-[#0e222b]/75 backdrop-blur-[0.5px] pointer-events-none" />

            <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1f3d4a] flex items-center justify-between">
              <h2
                className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                <SelectedProductsIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                <span>Selected Products</span>
              </h2>
              <span className="text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 font-medium">
                {cart.length} {cart.length === 1 ? "product" : "products"} ({totalItemsCount} units)
              </span>
            </div>

            {/* Product List */}
            {cart.length === 0 ? (
              <div className="relative z-10 py-12 sm:py-16 px-4 sm:px-6 text-center text-slate-500 dark:text-slate-400">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-50 dark:bg-[#0e222b] border border-slate-200/80 dark:border-[#1f3d4a] flex items-center justify-center mx-auto mb-3 text-2xl sm:text-3xl">
                  🛒
                </div>
                <p
                  className="text-sm sm:text-base font-bold text-[#0a3d52] dark:text-white mb-1"
                  style={{ fontFamily: "'Poppins', sans-serif" }}
                >
                  Your cart is empty.
                </p>
                <p className="text-xs sm:text-sm max-w-sm mx-auto mb-5 text-slate-500 dark:text-slate-400 font-normal">
                  Add chemical coatings, elastomeric waterproofing membranes, or waterstops to proceed.
                </p>
                <RouterLink
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider shadow-md shadow-[#0a3d52]/20 hover:opacity-95 transition-all active:scale-95"
                >
                  <span>Explore Catalog</span>
                  <ArrowForwardIcon sx={{ fontSize: 16 }} />
                </RouterLink>
              </div>
            ) : (
              <div className="relative z-10">
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
                      {/* Product Thumbnail & Details */}
                      <div className="flex items-start gap-3 sm:contents">
                        <RouterLink
                          to={productUrl}
                          className="w-16 h-16 sm:w-[76px] sm:h-[76px] rounded-xl sm:rounded-[14px] overflow-hidden border border-slate-200/80 dark:border-[#1f3d4a] bg-slate-50 dark:bg-[#0e222b] flex items-center justify-center shrink-0 group/img cursor-pointer transition-all hover:border-[#0a3d52]/40"
                          title={`View ${item.name}`}
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

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <RouterLink
                              to={productUrl}
                              className="group/title block flex-1 cursor-pointer"
                              title={item.name}
                            >
                              <h3 className="font-bold text-sm sm:text-[15px] leading-snug line-clamp-2 text-[#0a3d52] dark:text-white mb-0.5 group-hover/title:text-[#ff6b4a] transition-colors">
                                {item.name}
                              </h3>
                            </RouterLink>

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
                              Ready for dispatch
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Quantity & Item Total */}
                      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#1f3d4a]/50 sm:border-0 sm:pt-0 sm:contents">
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

                        <div
                          className="text-right font-bold text-sm sm:text-[15px] sm:min-w-[110px] text-[#0a3d52] dark:text-slate-100"
                          style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                        >
                          <span className="text-[11px] font-normal text-slate-400 sm:hidden mr-1">Total:</span>
                          {fmt(itemTotal)}
                        </div>

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

          {/* Payment + Delivery only after cart has products */}
          {cart.length > 0 && (
          <>
          {/* Card 2: Payment Method Selection */}
          <div
            className={`cart-anim-details relative border rounded-2xl sm:rounded-[24px] shadow-sm overflow-hidden transition-all duration-500 bg-white/95 dark:bg-[#112832]/95 ${
              mainPaymentMethod === "online"
                ? "border-orange-300/80 dark:border-sky-500/40 shadow-lg shadow-orange-500/10"
                : "border-slate-200/90 dark:border-[#1f3d4a] shadow-md shadow-slate-900/5"
            }`}
          >
            {/* Background Image — construction chemicals / membranes (right-weighted) */}
            <div
              className="absolute inset-0 bg-cover pointer-events-none transition-all duration-700 ease-out opacity-[0.18] sm:opacity-[0.32] scale-100 bg-[position:right_center] md:bg-[position:85%_center]"
              style={{
                backgroundImage: `url(${onlinePaymentBgImg})`,
              }}
            />

            {/* Premium Directional Gradient */}
            <div
              className={`absolute inset-0 pointer-events-none transition-all duration-500 ${
                mainPaymentMethod === "online"
                  ? "bg-gradient-to-b sm:bg-gradient-to-r from-white via-white/95 to-white/72 dark:from-[#112832] dark:via-[#112832]/95 dark:to-[#0e222b]/72"
                  : "bg-gradient-to-b sm:bg-gradient-to-r from-white via-white/95 to-white/75 dark:from-[#112832] dark:via-[#112832]/95 dark:to-[#0e222b]/75"
              }`}
            />

            {/* Header */}
            <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100/90 dark:border-[#1f3d4a]/80 flex items-center justify-between">
              <h2
                className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                <PaymentHeaderBadge className="w-6 h-6 sm:w-7 sm:h-7" />
                <span>Payment Method</span>
              </h2>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                Encrypted & Verified
              </span>
            </div>

            <div className="relative z-10 p-4 sm:p-6 space-y-4">
              {/* Primary Payment Radios (COD vs Online) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* Option A: Cash on Delivery (COD) */}
                <label
                  onClick={() => setMainPaymentMethod("cod")}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    mainPaymentMethod === "cod"
                      ? "border-[#0a3d52] dark:border-sky-400 bg-slate-50/95 dark:bg-[#0a3d52]/30 shadow-sm"
                      : "border-slate-200 dark:border-[#1f3d4a] hover:border-slate-300 dark:hover:border-slate-700 bg-white/90 dark:bg-[#0e222b]/90 backdrop-blur-xs"
                  }`}
                >
                  <input
                    type="radio"
                    name="mainPaymentMethod"
                    checked={mainPaymentMethod === "cod"}
                    onChange={() => setMainPaymentMethod("cod")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      mainPaymentMethod === "cod"
                        ? "border-[#0a3d52] dark:border-sky-400 bg-[#0a3d52] dark:bg-sky-400"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {mainPaymentMethod === "cod" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 shadow-sm overflow-hidden ring-1 ring-black/5">
                    <CodTruckIcon className="w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-[15px] font-bold text-[#0a3d52] dark:text-white">
                        Cash on Delivery (COD)
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                      Pay cash upon delivery at your construction site / warehouse.
                    </p>
                  </div>
                </label>

                {/* Option B: Online Payment */}
                <label
                  onClick={() => setMainPaymentMethod("online")}
                  className={`relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                    mainPaymentMethod === "online"
                      ? "border-[#ff6b4a] bg-orange-50/80 dark:bg-[#ff6b4a]/20 shadow-md ring-2 ring-[#ff6b4a]/30"
                      : "border-slate-200 dark:border-[#1f3d4a] hover:border-slate-300 dark:hover:border-slate-700 bg-white/90 dark:bg-[#0e222b]/90 backdrop-blur-xs"
                  }`}
                >
                  <input
                    type="radio"
                    name="mainPaymentMethod"
                    checked={mainPaymentMethod === "online"}
                    onChange={() => setMainPaymentMethod("online")}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                      mainPaymentMethod === "online"
                        ? "border-[#ff6b4a] bg-[#ff6b4a]"
                        : "border-slate-300 dark:border-slate-600"
                    }`}
                  >
                    {mainPaymentMethod === "online" && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>

                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl shrink-0 shadow-sm overflow-hidden ring-1 ring-black/5">
                    <OnlinePaymentIcon className="w-full h-full" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm sm:text-[15px] font-bold text-[#0a3d52] dark:text-white">
                        Online Payment
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed font-normal">
                      Credit/Debit Card (Stripe), Easypaisa, JazzCash, or Bank IBFT.
                    </p>
                  </div>
                </label>
              </div>

              {/* Sub-Options when "Online Payment" is Active */}
              {mainPaymentMethod === "online" && (
                <div className="pt-4 border-t border-slate-200/70 dark:border-[#1f3d4a]/80 space-y-4 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ff6b4a] animate-pulse" />
                      <span>Select Online Channel:</span>
                    </div>
                    <span className="text-[11px] font-semibold text-[#0a3d52] dark:text-sky-300 bg-white/90 dark:bg-slate-800/90 px-2.5 py-0.5 rounded-full border border-slate-200/80 dark:border-slate-700 shadow-2xs backdrop-blur-md">
                      Instant & Secure IBFT
                    </span>
                  </div>

                  {/* 4 Online Sub-Option Buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {/* 1. Stripe / Card */}
                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod("stripe")}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        onlineSubMethod === "stripe"
                          ? "border-[#635BFF] bg-[#635BFF]/10 dark:bg-[#635BFF]/25 text-[#0a3d52] dark:text-white ring-2 ring-[#635BFF]/30 shadow-sm backdrop-blur-xs"
                          : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/85 dark:bg-[#0e222b]/85 hover:bg-white dark:hover:bg-[#132d39] text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <StripeCardIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-2xs shrink-0" />
                        {onlineSubMethod === "stripe" && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#635BFF" }} />
                        )}
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold leading-tight">Card / Stripe</span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Instant Checkout</span>
                    </button>

                    {/* 2. Easypaisa */}
                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod("easypaisa")}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        onlineSubMethod === "easypaisa"
                          ? "border-[#00C853] bg-[#00C853]/15 dark:bg-[#00C853]/25 text-emerald-900 dark:text-white ring-2 ring-[#00C853]/30 shadow-sm backdrop-blur-xs"
                          : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/85 dark:bg-[#0e222b]/85 hover:bg-white dark:hover:bg-[#132d39] text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <EasypaisaIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-2xs shrink-0" />
                        {onlineSubMethod === "easypaisa" && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#00C853" }} />
                        )}
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold leading-tight">Easypaisa</span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Manual Transfer</span>
                    </button>

                    {/* 3. JazzCash */}
                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod("jazzcash")}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        onlineSubMethod === "jazzcash"
                          ? "border-[#D50000] bg-rose-50/80 dark:bg-rose-950/40 text-rose-900 dark:text-white ring-2 ring-rose-500/30 shadow-sm backdrop-blur-xs"
                          : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/85 dark:bg-[#0e222b]/85 hover:bg-white dark:hover:bg-[#132d39] text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <JazzCashIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-2xs shrink-0" />
                        {onlineSubMethod === "jazzcash" && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#D50000" }} />
                        )}
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold leading-tight">JazzCash</span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Manual Transfer</span>
                    </button>

                    {/* 4. Bank Transfer */}
                    <button
                      type="button"
                      onClick={() => setOnlineSubMethod("bank_transfer")}
                      className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        onlineSubMethod === "bank_transfer"
                          ? "border-[#0A3D52] dark:border-sky-400 bg-sky-50/80 dark:bg-sky-950/40 text-sky-900 dark:text-white ring-2 ring-sky-500/30 shadow-sm backdrop-blur-xs"
                          : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/85 dark:bg-[#0e222b]/85 hover:bg-white dark:hover:bg-[#132d39] text-slate-700 dark:text-slate-300 shadow-2xs backdrop-blur-xs"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-2">
                        <BankTransferIcon className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg shadow-2xs shrink-0" />
                        {onlineSubMethod === "bank_transfer" && (
                          <CheckCircleRoundedIcon sx={{ fontSize: 16, color: "#0A3D52" }} className="dark:text-sky-400" />
                        )}
                      </div>
                      <span className="text-xs sm:text-[13px] font-bold leading-tight">Bank Transfer</span>
                      <span className="text-[10.5px] text-slate-500 dark:text-slate-400">Direct IBFT</span>
                    </button>
                  </div>

                  {/* Manual Payment Details & Transaction ID Input Box */}
                  {isManualPayment && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#0c222e]/90 border border-slate-200/90 dark:border-slate-700/80 shadow-sm backdrop-blur-md space-y-3.5 animate-in fade-in duration-200">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs sm:text-sm font-bold text-[#0a3d52] dark:text-white flex items-center gap-2">
                          {onlineSubMethod === "easypaisa" && <EasypaisaIcon className="w-5 h-5 rounded shrink-0" />}
                          {onlineSubMethod === "jazzcash" && <JazzCashIcon className="w-5 h-5 rounded shrink-0" />}
                          {onlineSubMethod === "bank_transfer" && <BankTransferIcon className="w-5 h-5 rounded shrink-0" />}
                          <span>
                            {onlineSubMethod === "easypaisa" && "Easypaisa Account Information"}
                            {onlineSubMethod === "jazzcash" && "JazzCash Account Information"}
                            {onlineSubMethod === "bank_transfer" && "Corporate Bank Account Information"}
                          </span>
                        </h4>
                        <span className="text-[10.5px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded-full">
                          Manual Verification
                        </span>
                      </div>

                      {/* Account Box based on Sub-Method */}
                      {onlineSubMethod === "easypaisa" && (
                        <div className="space-y-2 bg-white dark:bg-[#081822] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account Title:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {paymentConfig.easypaisa?.accountTitle}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0a3d52] dark:text-sky-300">
                                {paymentConfig.easypaisa?.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(paymentConfig.easypaisa?.accountNumber, "easypaisa")
                                }
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                title="Copy Number"
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {paymentConfig.easypaisa?.instructions}
                          </p>
                        </div>
                      )}

                      {onlineSubMethod === "jazzcash" && (
                        <div className="space-y-2 bg-white dark:bg-[#081822] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account Title:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {paymentConfig.jazzcash?.accountTitle}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account Number:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0a3d52] dark:text-sky-300">
                                {paymentConfig.jazzcash?.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(paymentConfig.jazzcash?.accountNumber, "jazzcash")
                                }
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                title="Copy Number"
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {paymentConfig.jazzcash?.instructions}
                          </p>
                        </div>
                      )}

                      {onlineSubMethod === "bank_transfer" && (
                        <div className="space-y-2 bg-white dark:bg-[#081822] p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Bank Name:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {paymentConfig.bankTransfer?.bankName}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account Title:</span>
                            <span className="font-bold text-slate-800 dark:text-slate-200">
                              {paymentConfig.bankTransfer?.accountTitle}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500 dark:text-slate-400">Account / IBAN:</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-[#0a3d52] dark:text-sky-300 text-[11px]">
                                {paymentConfig.bankTransfer?.iban || paymentConfig.bankTransfer?.accountNumber}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  copyToClipboard(
                                    paymentConfig.bankTransfer?.iban ||
                                      paymentConfig.bankTransfer?.accountNumber,
                                    "bank"
                                  )
                                }
                                className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 cursor-pointer"
                                title="Copy IBAN"
                              >
                                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                              </button>
                            </div>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                            {paymentConfig.bankTransfer?.instructions}
                          </p>
                        </div>
                      )}

                      {/* Required Transaction ID Input */}
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Transaction ID / Reference Number *
                        </label>
                        <div className="relative group/tid">
                          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/tid:text-[#0a3d52] dark:group-focus-within/tid:text-sky-400 transition-colors">
                            <ReceiptLongOutlinedIcon sx={{ fontSize: 18 }} />
                          </div>
                          <input
                            type="text"
                            placeholder="e.g. 12-digit TID / Bank Reference Number"
                            value={transactionRef}
                            onBlur={() => setTouched((prev) => ({ ...prev, transactionRef: true }))}
                            onChange={(e) => setTransactionRef(e.target.value)}
                            className={`w-full pl-10.5 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-mono transition-all outline-none bg-white dark:bg-[#081822] text-slate-800 dark:text-white placeholder:font-sans placeholder:text-slate-400 shadow-2xs ${
                              touched.transactionRef && errors.transactionRef
                                ? "border-rose-500 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                                : "border-slate-300 dark:border-slate-700 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:ring-2 focus:ring-[#0a3d52]/10 dark:focus:ring-sky-500/15"
                            }`}
                          />
                        </div>
                        {touched.transactionRef && errors.transactionRef && (
                          <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                            {errors.transactionRef}
                          </p>
                        )}
                      </div>

                      {/* Optional Receipt Screenshot Upload */}
                      <div className="space-y-1.5 pt-1">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-200">
                          Payment Screenshot / Receipt (Optional)
                        </label>
                        <div className="flex items-center gap-3">
                          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#081822] border border-slate-300 dark:border-slate-700 hover:border-[#0a3d52] text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs transition-colors">
                            <CloudUploadOutlinedIcon sx={{ fontSize: 16 }} />
                            <span>{uploadingProof ? "Uploading..." : "Attach Receipt"}</span>
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              onChange={handleProofFileUpload}
                              className="hidden"
                            />
                          </label>
                          {proofImageName && (
                            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                              <span className="truncate max-w-[180px]">{proofImageName}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Trust Note under Payment Options */}
              <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 dark:bg-[#081822] border border-slate-200/80 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
                <InfoOutlinedIcon sx={{ fontSize: 16, color: "#0a3d52" }} className="dark:text-sky-400 shrink-0" />
                <span>
                  Delivery charges are confirmed directly by our logistics team after reviewing site dimensions.
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Your Details Form */}
          <div className="cart-anim-details relative bg-white/95 dark:bg-[#112832]/95 border border-slate-200/90 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[24px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
            {/* Background — site delivery / membrane logistics (right-weighted) */}
            <div
              className="absolute inset-0 bg-cover pointer-events-none opacity-[0.16] sm:opacity-[0.30] transition-all duration-700 bg-[position:right_center] sm:bg-[position:88%_center]"
              style={{
                backgroundImage: `url(${deliveryInfoBgImg})`,
              }}
            />

            {/* Directional Glass Gradient for Crystal Clear Form Readability */}
            <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-white via-white/95 to-white/75 dark:from-[#112832] dark:via-[#112832]/95 dark:to-[#0e222b]/75 pointer-events-none" />

            <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100/90 dark:border-[#1f3d4a]/80 flex items-center justify-between">
              <h2
                className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white flex items-center gap-2"
                style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
              >
                <DeliveryContactIcon className="w-6 h-6 sm:w-7 sm:h-7" />
                <span>Delivery & Contact Information</span>
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium bg-slate-100/80 dark:bg-slate-800/80 px-2.5 py-0.5 rounded-full border border-slate-200/60 dark:border-slate-700/60 shadow-2xs backdrop-blur-xs">
                Required fields *
              </span>
            </div>

            <div className="relative z-10 p-4 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Full Name *
                </label>
                <div className="relative group/name">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/name:text-[#0a3d52] dark:group-focus-within/name:text-sky-400 transition-colors">
                    <PersonOutlineOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Engr. Ahmad Hassan"
                    value={form.customerName}
                    onBlur={() => setTouched((prev) => ({ ...prev, customerName: true }))}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none shadow-2xs ${
                      touched.customerName && errors.customerName
                        ? "border-rose-500 bg-white dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10"
                    }`}
                  />
                </div>
                {touched.customerName && errors.customerName && (
                  <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {errors.customerName}
                  </p>
                )}
              </div>

              {/* Phone (Pakistani format validated) */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Mobile Number (WhatsApp) *
                </label>
                <div className="relative group/phone">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/phone:text-[#0a3d52] dark:group-focus-within/phone:text-sky-400 transition-colors">
                    <PhoneOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="tel"
                    placeholder="03XX-XXXXXXX or +923XXXXXXXXX"
                    value={form.phone}
                    onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none shadow-2xs ${
                      touched.phone && errors.phone
                        ? "border-rose-500 bg-white dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10"
                    }`}
                  />
                </div>
                {touched.phone && errors.phone && (
                  <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {errors.phone}
                  </p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Email Address *
                </label>
                <div className="relative group/email">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/email:text-[#0a3d52] dark:group-focus-within/email:text-sky-400 transition-colors">
                    <EmailOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="email"
                    placeholder="ahmad@construction.com"
                    value={form.email}
                    onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none shadow-2xs ${
                      touched.email && errors.email
                        ? "border-rose-500 bg-white dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10"
                    }`}
                  />
                </div>
                {touched.email && errors.email && (
                  <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  City / Region *
                </label>
                <div className="relative group/city">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/city:text-[#0a3d52] dark:group-focus-within/city:text-sky-400 transition-colors">
                    <LocationCityOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Lahore, Karachi, Islamabad"
                    value={form.city}
                    onBlur={() => setTouched((prev) => ({ ...prev, city: true }))}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none shadow-2xs ${
                      touched.city && errors.city
                        ? "border-rose-500 bg-white dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10"
                    }`}
                  />
                </div>
                {touched.city && errors.city && (
                  <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {errors.city}
                  </p>
                )}
              </div>

              {/* Full Delivery Address (Site Address) */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Full Delivery Site Address *
                </label>
                <div className="relative group/address">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/address:text-[#0a3d52] dark:group-focus-within/address:text-sky-400 transition-colors">
                    <HomeOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="text"
                    placeholder="Plot #, Street, Sector / Industrial Area, Landmark"
                    value={form.address}
                    onBlur={() => setTouched((prev) => ({ ...prev, address: true }))}
                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                    className={`w-full pl-10.5 pr-4 py-3 rounded-xl border text-sm transition-all outline-none shadow-2xs ${
                      touched.address && errors.address
                        ? "border-rose-500 bg-white dark:bg-[#0e222b] text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-rose-600 focus:ring-2 focus:ring-rose-500/10"
                        : "border-slate-200/90 dark:border-[#1f3d4a] bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10"
                    }`}
                  />
                </div>
                {touched.address && errors.address && (
                  <p className="text-[11.5px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                    {errors.address}
                  </p>
                )}
              </div>

              {/* Area Size (Optional) */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Project Area Size (sq ft) <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative group/area">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/area:text-[#0a3d52] dark:group-focus-within/area:text-sky-400 transition-colors">
                    <StraightenOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. 5,000 sq ft"
                    value={form.areaSize}
                    onChange={(e) => setForm({ ...form, areaSize: e.target.value })}
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-200/90 dark:border-[#1f3d4a] text-sm transition-all outline-none bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10 shadow-2xs"
                  />
                </div>
              </div>

              {/* Preferred Delivery Date (Optional) */}
              <div>
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Preferred Delivery Date <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative group/date">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within/date:text-[#0a3d52] dark:group-focus-within/date:text-sky-400 transition-colors">
                    <CalendarMonthOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <input
                    type="date"
                    value={form.deliveryDate}
                    onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-200/90 dark:border-[#1f3d4a] text-sm transition-all outline-none bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10 shadow-2xs"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-xs sm:text-[12.5px] font-bold mb-1.5 text-slate-700 dark:text-slate-200">
                  Special Site Instructions / Requirements <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <div className="relative group/notes">
                  <div className="absolute left-3.5 top-3.5 pointer-events-none text-slate-400 group-focus-within/notes:text-[#0a3d52] dark:group-focus-within/notes:text-sky-400 transition-colors">
                    <DescriptionOutlinedIcon sx={{ fontSize: 19 }} />
                  </div>
                  <textarea
                    placeholder="e.g. Specific chemical mixing instructions, gate clearance, offloading assistance required..."
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows={3}
                    className="w-full pl-10.5 pr-4 py-3 rounded-xl border border-slate-200/90 dark:border-[#1f3d4a] text-sm transition-all outline-none bg-white/95 dark:bg-[#0e222b]/95 text-slate-800 dark:text-white placeholder:text-slate-400 focus:border-[#0a3d52] dark:focus:border-sky-400 focus:bg-white dark:focus:bg-[#112832] focus:ring-2 focus:ring-[#0a3d52]/10 shadow-2xs resize-y min-h-[90px]"
                  />
                </div>
              </div>
            </div>
          </div>
          </>
          )}
        </div>

        {/* ==================== RIGHT COLUMN (STICKY ASIDE) ==================== */}
        <aside className="cart-anim-summary lg:sticky lg:top-20 relative bg-white/95 dark:bg-[#112832]/95 border border-slate-200 dark:border-[#1f3d4a] rounded-2xl sm:rounded-[24px] shadow-sm shadow-slate-900/5 overflow-hidden transition-colors">
          {/* Background 3D Digital Checkout & Verified Purchase Illustration (Responsive Mobile & Desktop) */}
          <div
            className="absolute inset-0 bg-cover pointer-events-none opacity-20 sm:opacity-30 transition-all duration-700 bg-[position:center_bottom] sm:bg-[position:center_30%]"
            style={{
              backgroundImage: `url(${orderSummaryBgImg})`,
            }}
          />

          {/* Directional Frosted Glass Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/98 via-white/94 to-white/80 dark:from-[#112832]/98 dark:via-[#112832]/94 dark:to-[#0e222b]/80 backdrop-blur-[0.5px] pointer-events-none" />

          <div className="relative z-10 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-100 dark:border-[#1f3d4a]">
            <h2
              className="text-sm sm:text-base md:text-[17px] font-bold m-0 text-[#0a3d52] dark:text-white"
              style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
            >
              Order Summary
            </h2>
          </div>

          <div className="relative z-10 p-4 sm:p-6 space-y-3">
            <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Items Subtotal</span>
              <b className="text-slate-800 dark:text-white font-semibold">{fmt(total)}</b>
            </div>

            <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Delivery Charges</span>
              <b className="text-emerald-700 dark:text-emerald-400 font-semibold">
                Confirmed by our team
              </b>
            </div>

            <div className="flex justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              <span>Payment Mode</span>
              <b className="text-[#0a3d52] dark:text-sky-300 uppercase font-semibold">
                {mainPaymentMethod === "cod" ? "COD" : onlineSubMethod.replace("_", " ")}
              </b>
            </div>

            {/* Total Line with Dashed Border */}
            <div className="flex justify-between items-center pt-3.5 sm:pt-4 mt-2 border-t border-dashed border-slate-200 dark:border-[#1f3d4a]">
              <span
                className="text-sm sm:text-base font-bold text-slate-700 dark:text-white"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Total Payable
              </span>
              <span
                className="text-xl sm:text-2xl md:text-[24px] font-black text-[#0a3d52] dark:text-sky-400"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {fmt(total)}
              </span>
            </div>
          </div>

          {/* Bulk Order WhatsApp Hint */}
          {isBulkOrder && (
            <div className="mx-4 sm:mx-6 mb-3 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2">
              <span className="text-base shrink-0">💡</span>
              <div className="leading-snug">
                <strong>Ordering in bulk?</strong> Chat with us on WhatsApp for exclusive contractor discounts & direct site logistics.
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="relative z-10 px-4 sm:px-6 pb-5 sm:pb-6 pt-1 flex flex-col gap-2.5 sm:gap-3">
            <div className="glowing-border-wrap-rounded w-full">
              <div className="glowing-border-beam" />
              <div className="glowing-border-body w-full">
                <button
                  onClick={() => submitOrder("website")}
                  disabled={isOrderDisabled}
                  className="shimmer-btn w-full py-3.5 sm:py-4 px-4 rounded-xl bg-gradient-to-r from-[#0a3d52] to-[#0d4e68] hover:from-[#0d4e68] hover:to-[#0a3d52] text-white font-bold text-sm sm:text-[15px] border-0 shadow-lg shadow-[#0a3d52]/20 hover:shadow-xl hover:shadow-[#0a3d52]/30 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingCartOutlinedIcon sx={{ fontSize: 19 }} />
                  <span>{loadingOrder ? "Processing Order..." : "Place Website Order"}</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => submitOrder("whatsapp")}
              disabled={cart.length === 0 || loadingOrder}
              title="For bulk orders or price negotiation"
              className="shimmer-btn w-full py-3 sm:py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm border-0 shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/25 active:scale-[0.98] disabled:opacity-45 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <WhatsAppIcon sx={{ fontSize: 19 }} />
              <span>Order on WhatsApp (Negotiate / Bulk)</span>
            </button>
          </div>

          {/* Trust Footnotes */}
          <div className="relative z-10 px-4 sm:px-6 pb-4 sm:pb-5 pt-2 flex items-center justify-center flex-wrap gap-2.5 sm:gap-4 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-[#1f3d4a]/60">
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
              <span>Quality certified</span>
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <svg className="w-3.5 h-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M21 17C21 18.6569 19.6569 20 18 20H17V15H18C19.6569 15 21 15.8954 21 17Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
                <path d="M3 17C3 15.8954 4.34315 15 6 15H7V20H6C4.34315 20 3 18.6569 3 17Z" fill="currentColor" stroke="currentColor" strokeWidth="2"/>
              </svg>
              <span>On-site support</span>
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
    </div>
  );
};
