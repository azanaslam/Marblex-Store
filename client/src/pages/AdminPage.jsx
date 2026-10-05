import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  Snackbar,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SendIcon from "@mui/icons-material/Send";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import SpaOutlinedIcon from "@mui/icons-material/SpaOutlined";

import { AdminBroadcastTab } from "../components/AdminBroadcastTab";
import { AdminMessengerTab } from "../components/AdminMessengerTab";
import { AdminQuotesTab } from "../components/AdminQuotesTab";
import { AdminTicketsTab } from "../components/AdminTicketsTab";
import { AdminPaymentQueueTab } from "../components/AdminPaymentQueueTab";
import { AdminDocumentsTab } from "../components/AdminDocumentsTab";
import { AdminCustomersTab } from "../components/AdminCustomersTab";
import { AdminReviewsTab } from "../components/AdminReviewsTab";
import { AdminProfileTab } from "../components/AdminProfileTab";
import { AdminCommandCenter } from "../components/AdminCommandCenter";
import { AdminProductsTab } from "../components/AdminProductsTab";
import { AdminPartnerSubmissionsTab } from "../components/AdminPartnerSubmissionsTab";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";
import { TiltCard3D } from "../components/admin3d/TiltCard3D";
import { TabWrapper3D } from "../components/admin3d/TabWrapper3D";
import "../styles/admin-shell.css";

export const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(getAuthToken());
  const [adminUser, setAdminUser] = useState(() => getAuthUser());
  const [activeTab, setActiveTab] = useState(0);
  const [chatUnreadTotal, setChatUnreadTotal] = useState(0);
  const [overview, setOverview] = useState(null);
  const [websiteData, setWebsiteData] = useState({ totalOrders: 0, totalAmount: 0, orders: [] });
  const [whatsappData, setWhatsappData] = useState({ totalOrders: 0, totalAmount: 0, orders: [] });
  const [usersData, setUsersData] = useState({ totalUsers: 0, users: [] });
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({
    name: "",
    imageUrl: "",
    extraImages: ["", "", ""],
    description: "",
    price: 0,
    stock: 0,
    category: "General",
    featured: false,
    active: true,
  });
  const [editingProductId, setEditingProductId] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState({ title: "", coverImage: "", content: "", tags: "", published: true });
  const [editingBlogId, setEditingBlogId] = useState("");
  const [reviewItems, setReviewItems] = useState([]);
  const [orderLookup, setOrderLookup] = useState({ q: "", all: [], filtered: [] });
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });
  const [contactRequests, setContactRequests] = useState([]);
  const [replyDialog, setReplyDialog] = useState({ open: false, request: null, reply: "" });
  const [emailConfig, setEmailConfig] = useState({ user: "", pass: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminSearch, setAdminSearch] = useState("");
  const [statusConfirmDialog, setStatusConfirmDialog] = useState({ open: false, order: null, newStatus: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productStudioTab, setProductStudioTab] = useState("inventory"); // inventory | editor
  const [productFilter, setProductFilter] = useState("all"); // all | active | featured | low
  const [productQuery, setProductQuery] = useState("");
  const [editorSection, setEditorSection] = useState("basics"); // basics | media | details
  const refreshBtnRef = useRef(null);
  const productStudioTopRef = useRef(null);

  const showToast = (type, message) => setToast({ open: true, type, message });

  const copyOrderId = async (id) => {
    const shortId = String(id || "").slice(-6).toUpperCase();
    if (!shortId) return;
    try {
      await navigator.clipboard?.writeText(String(id));
      showToast("success", `Order ID #${shortId} copied.`);
    } catch {
      showToast("error", "Unable to copy order ID.");
    }
  };

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    const headers = authHeaders(token);
    try {
      const [overviewRes, blogsRes, websiteRes, whatsappRes, usersRes, productsRes, reviewRes, allOrdersRes, contactRes, emailRes] = await Promise.all([
        http.get("/admin/overview", headers),
        http.get("/admin/blogs", headers),
        http.get("/admin/orders/website", headers),
        http.get("/admin/orders/whatsapp", headers),
        http.get("/admin/users", headers),
        http.get("/admin/products", headers),
        http.get("/product-reviews/admin/list", headers),
        http.get("/admin/orders/all", headers),
        http.get("/contact", headers),
        http.get("/admin/email-settings", headers),
      ]);

      setOverview(overviewRes.data);
      setBlogs(blogsRes.data || []);
      setWebsiteData(websiteRes.data || { totalOrders: 0, totalAmount: 0, orders: [] });
      setWhatsappData(whatsappRes.data || { totalOrders: 0, totalAmount: 0, orders: [] });
      setUsersData(usersRes.data || { totalUsers: 0, users: [] });
      setProducts(productsRes.data || []);
      setReviewItems(reviewRes.data || []);
      setContactRequests(contactRes.data || []);
      setEmailConfig(emailRes.data || { user: "", pass: "" });
      const orders = allOrdersRes.data?.orders || [];
      setOrderLookup({ q: "", all: orders, filtered: orders });
    } catch {
      showToast("error", "Failed to refresh admin data.");
    }
  }, [token]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (refreshBtnRef.current) {
      gsap.to(refreshBtnRef.current, { rotate: "+=360", duration: 0.7, ease: "power2.inOut" });
    }
    await loadDashboardData();
    setIsRefreshing(false);
    showToast("success", "Dashboard synced with Atlas Database!");
  };

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  useEffect(() => {
    const sync = () => {
      setToken(getAuthToken());
      setAdminUser(getAuthUser());
    };
    window.addEventListener(onAuthSessionChangeEvent, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(onAuthSessionChangeEvent, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  useEffect(() => {
    const n = location.state?.chatUnread;
    const backTab = location.state?.adminTab;
    if (typeof backTab === "number") {
      setActiveTab(backTab);
      if (typeof n === "number" && n > 0) {
        showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from users.`);
      }
      navigate("/admin", { replace: true, state: {} });
      return;
    }
    if (typeof n === "number" && n > 0) {
      showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from users.`);
      setActiveTab(6);
      navigate("/admin", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    const load = () =>
      http.get("/chat/unread-count", h).then((r) => setChatUnreadTotal(Number(r.data?.count) || 0)).catch(() => { });
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [token]);

  const logout = () => {
    clearAuthSession();
    setToken("");
    navigate("/login", { replace: true });
  };

  // Product Handlers
  const resetProductForm = () => {
    setProduct({
      name: "",
      imageUrl: "",
      extraImages: ["", "", ""],
      description: "",
      price: 0,
      stock: 0,
      category: "General",
      featured: false,
      active: true,
    });
    setEditingProductId("");
    setEditorSection("basics");
  };

  const scrollProductStudioTop = () => {
    requestAnimationFrame(() => {
      const el = productStudioTopRef.current;
      if (el?.scrollIntoView) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
  };

  const openProductEditor = (mode = "new") => {
    if (mode === "new") resetProductForm();
    setProductStudioTab("editor");
    setActiveTab(4);
    scrollProductStudioTop();
  };

  const saveProduct = async () => {
    if (!product.imageUrl?.trim()) {
      showToast("error", "Please add product image.");
      return;
    }
    if (!product.name?.trim()) {
      showToast("error", "Product name is required.");
      return;
    }

    setIsSaving(true);
    const wasEditing = Boolean(editingProductId);
    try {
      if (editingProductId) {
        await http.put(`/products/${editingProductId}`, product, authHeaders(token));
      } else {
        await http.post("/products", product, authHeaders(token));
      }
      resetProductForm();
      await loadDashboardData();
      showToast("success", wasEditing ? "Product updated." : "Product published to Database!");
      setProductStudioTab("inventory");
      scrollProductStudioTop();
    } catch {
      showToast("error", "Failed to save product.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProduct((prev) => ({ ...prev, imageUrl: String(reader.result || "") }));
      showToast("success", `${file.name} uploaded.`);
    };
    reader.readAsDataURL(file);
  };

  const startEditProduct = (item) => {
    setEditingProductId(item._id);
    setProduct({
      name: item.name || "",
      imageUrl: item.imageUrl || "",
      extraImages: Array.isArray(item.extraImages) && item.extraImages.length
        ? [...item.extraImages, "", "", ""].slice(0, 3)
        : ["", "", ""],
      description: item.description || "",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
      category: item.category || "General",
      featured: Boolean(item.featured),
      active: item.active !== false,
    });
    setEditorSection("basics");
    setProductStudioTab("editor");
    setActiveTab(4);
    scrollProductStudioTop();
  };

  const deleteProductItem = async (id) => {
    try {
      await http.delete(`/products/${id}`, authHeaders(token));
      await loadDashboardData();
      if (editingProductId === id) resetProductForm();
      showToast("success", "Product deleted.");
    } catch {
      showToast("error", "Failed to delete product.");
    }
  };

  // Blog Handlers
  const resetBlogForm = () => {
    setBlog({ title: "", coverImage: "", content: "", tags: "", published: true });
    setEditingBlogId("");
  };

  const handleBlogImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setBlog((prev) => ({ ...prev, coverImage: String(reader.result || "") }));
      showToast("success", `${file.name} selected.`);
    };
    reader.readAsDataURL(file);
  };

  const saveBlog = async () => {
    const payload = {
      ...blog,
      tags: typeof blog.tags === "string" ? blog.tags.split(",").map((t) => t.trim()).filter(Boolean) : blog.tags,
    };

    setIsSaving(true);
    try {
      if (editingBlogId) {
        await http.put(`/blogs/${editingBlogId}`, payload, authHeaders(token));
      } else {
        await http.post("/blogs", payload, authHeaders(token));
      }
      resetBlogForm();
      const res = await http.get("/admin/blogs", authHeaders(token));
      setBlogs(res.data || []);
      showToast("success", editingBlogId ? "Blog updated." : "Blog published to DB!");
    } catch {
      showToast("error", "Failed to save blog.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditBlog = (b) => {
    setEditingBlogId(b._id);
    setBlog({
      title: b.title || "",
      coverImage: b.coverImage || "",
      content: b.content || "",
      tags: Array.isArray(b.tags) ? b.tags.join(", ") : "",
      published: Boolean(b.published),
    });
    setActiveTab(5);
  };

  const togglePublish = async (blogItem) => {
    try {
      await http.put(`/blogs/${blogItem._id}`, { published: !blogItem.published }, authHeaders(token));
      const res = await http.get("/admin/blogs", authHeaders(token));
      setBlogs(res.data || []);
      showToast("success", blogItem.published ? "Blog unpublished." : "Blog published.");
    } catch {
      showToast("error", "Failed to toggle status.");
    }
  };

  const deleteBlog = async (id) => {
    try {
      await http.delete(`/blogs/${id}`, authHeaders(token));
      if (editingBlogId === id) resetBlogForm();
      const res = await http.get("/admin/blogs", authHeaders(token));
      setBlogs(res.data || []);
      showToast("success", "Blog deleted.");
    } catch {
      showToast("error", "Failed to delete blog.");
    }
  };

  // User Handlers
  const userCanLogin = (user) => user.role === "admin" || user.isAccessGranted === true || user.isAccessGranted === undefined;

  const handleToggleBlockUser = async (user) => {
    try {
      await http.patch(`/admin/users/${user._id}/block`, { isBlocked: !user.isBlocked }, authHeaders(token));
      const res = await http.get("/admin/users", authHeaders(token));
      setUsersData(res.data);
      showToast("success", user.isBlocked ? "User unblocked." : "User blocked.");
    } catch {
      showToast("error", "Action failed.");
    }
  };

  const handleToggleUserAccess = async (user) => {
    if (user.role === "admin") return;
    const nextGranted = !userCanLogin(user);
    try {
      await http.patch(`/admin/users/${user._id}/access`, { isAccessGranted: nextGranted }, authHeaders(token));
      const res = await http.get("/admin/users", authHeaders(token));
      setUsersData(res.data);
      showToast("success", nextGranted ? "User approved - login granted." : "Login access revoked.");
    } catch {
      showToast("error", "Action failed.");
    }
  };

  const filterOrderLookup = (query, allOrders) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return allOrders;
    return allOrders.filter((order) => {
      const shortId = String(order._id || "").slice(-6).toLowerCase();
      const cust = String(order.customerName || "").toLowerCase();
      const phone = String(order.phone || "").toLowerCase();
      return shortId.includes(q) || String(order._id || "").toLowerCase().includes(q) || cust.includes(q) || phone.includes(q);
    });
  };

  const setOrderLookupQuery = (q) => {
    setOrderLookup((prev) => ({ ...prev, q, filtered: filterOrderLookup(q, prev.all) }));
  };

  const handleUpdateOrderStatus = (order, newStatus) => {
    setStatusConfirmDialog({ open: true, order, newStatus });
  };

  const confirmUpdateStatus = async (sendChatMessage = false) => {
    const { order, newStatus } = statusConfirmDialog;
    if (!order || !newStatus) return;

    try {
      await http.patch(`/admin/orders/${order._id}/status`, { orderStatus: newStatus }, authHeaders(token));
      if (sendChatMessage && order.userId) {
        const message = `Hello ${order.customerName}! Your order #${String(order._id).slice(-6).toUpperCase()} status has been updated to: ${newStatus.toUpperCase()}.`;
        await http.post(`/admin/chat/thread/${order.userId}`, { body: message }, authHeaders(token));
        showToast("success", "Status updated & customer notified.");
      } else {
        showToast("success", `Order status updated to ${newStatus}`);
      }
      setStatusConfirmDialog({ open: false, order: null, newStatus: "" });
      loadDashboardData();
    } catch {
      showToast("error", "Failed to update status.");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await http.patch(`/admin/orders/${orderId}/payment`, { paymentStatus: newStatus }, authHeaders(token));
      showToast("success", `Payment updated to ${newStatus}`);
      loadDashboardData();
    } catch {
      showToast("error", "Failed to update payment.");
    }
  };

  const handleSaveEmailConfig = async () => {
    setIsSaving(true);
    try {
      await http.post("/admin/email-settings", emailConfig, authHeaders(token));
      showToast("success", "Email configuration saved!");
    } catch {
      showToast("error", "Failed to save email settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendReply = async () => {
    if (!replyDialog.request || !replyDialog.reply.trim()) return;
    setIsSaving(true);
    try {
      await http.post(`/contact/reply/${replyDialog.request._id}`, { replyMessage: replyDialog.reply }, authHeaders(token));
      showToast("success", "Reply dispatched via email!");
      setReplyDialog({ open: false, request: null, reply: "" });
      loadDashboardData();
    } catch {
      showToast("error", "Failed to send reply.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!token) return <Navigate to="/login" replace />;
  const authUser = getAuthUser();
  if (authUser?.role !== "admin") return <Navigate to="/login" replace />;

  const totalOrders = overview?.orderCount || 0;
  const websiteOrders = overview?.websiteOrders || 0;
  const whatsappOrders = overview?.whatsappOrders || 0;
  const paidOrders = overview?.paidOrdersCount || 0;
  const websiteShare = totalOrders ? Math.round((websiteOrders / totalOrders) * 100) : 0;
  const whatsappShare = totalOrders ? Math.round((whatsappOrders / totalOrders) * 100) : 0;
  const paidShare = totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0;
  const pendingAccessCount = usersData.users.filter((u) => u.role === "user" && u.isAccessGranted === false).length;
  const reviewQueue = reviewItems.filter((item) => item.status !== "published");
  const adminUnreadReviews = reviewQueue.filter((item) => item.hasAdminUnread).length;
  const paymentQueueCount = (orderLookup.all || []).filter(
    (o) =>
      ["pending_verification", "pending"].includes(o.paymentStatus) &&
      ["easypaisa", "jazzcash", "bank_transfer", "stripe"].includes(o.paymentMethod)
  ).length;

  const visualBars = (overview?.weeklyBars || []).length
    ? overview.weeklyBars.map((b) => ({
      label: b.label,
      value: b.orders || 0,
      height: b.height || "8%",
      revenue: b.revenue || 0,
    }))
    : [
      { label: "Mon", value: 0, height: "8%", revenue: 0 },
      { label: "Tue", value: 0, height: "8%", revenue: 0 },
      { label: "Wed", value: 0, height: "8%", revenue: 0 },
      { label: "Thu", value: 0, height: "8%", revenue: 0 },
      { label: "Fri", value: 0, height: "8%", revenue: 0 },
      { label: "Sat", value: 0, height: "8%", revenue: 0 },
      { label: "Sun", value: 0, height: "8%", revenue: 0 },
    ];

  const navItems = [
    { id: 0, label: "Command center", icon: "🔥" },
    { id: 1, label: "Web orders", icon: "🌐", badge: websiteOrders },
    { id: 2, label: "WhatsApp orders", icon: "💬", badge: whatsappOrders },
    { id: 12, label: "Payment queue", icon: "💳", badge: paymentQueueCount || overview?.pendingVerification || 0 },
    { id: 13, label: "Quotes / RFQ", icon: "📋", badge: overview?.openQuotes || 0 },
    { id: 3, label: "Customers", icon: "👥", badge: pendingAccessCount },
    { id: 4, label: "Products catalog", icon: "🛍️", badge: products.length },
    { id: 15, label: "Documents", icon: "📄" },
    { id: 5, label: "Blogs & stories", icon: "✍️", badge: blogs.length },
    { id: 6, label: "Support chats", icon: "🗨️", badge: chatUnreadTotal },
    { id: 14, label: "Tickets", icon: "🎫", badge: overview?.openTickets || 0 },
    { id: 7, label: "Global broadcast", icon: "📣" },
    { id: 8, label: "Partner submissions", icon: "🤝", badge: adminUnreadReviews },
    { id: 9, label: "Order lookup", icon: "🔎" },
    { id: 10, label: "Client inquiries", icon: "📧", badge: contactRequests.filter((c) => c.status === "unread").length },
    { id: 16, label: "Client reviews", icon: "⭐" },
    { id: 11, label: "SMTP settings", icon: "⚙️" },
    { id: 17, label: "Account profile", icon: "👤" },
  ];

  const navGroups = [
    { title: "", items: [0] },
    { title: "Revenue & sales", items: [1, 2, 12, 13, 9] },
    { title: "Catalog & docs", items: [4, 15, 5, 8] },
    { title: "Customers & support", items: [3, 6, 14, 7, 10, 16] },
    { title: "System", items: [11, 17] },
  ];

  const runAdminSearch = (q) => {
    const term = String(q || "").trim().toLowerCase();
    if (!term) return;
    const hitOrder = (orderLookup.all || []).find(
      (o) =>
        String(o.orderNumber || "").toLowerCase().includes(term) ||
        String(o.customerName || "").toLowerCase().includes(term) ||
        String(o._id || "").toLowerCase().includes(term)
    );
    if (hitOrder) {
      setOrderLookup((prev) => ({ ...prev, q: term, filtered: [hitOrder] }));
      setActiveTab(9);
      return;
    }
    const hitProduct = products.find((p) => String(p.name || "").toLowerCase().includes(term));
    if (hitProduct) {
      setActiveTab(4);
      return;
    }
    const hitUser = (usersData.users || []).find(
      (u) =>
        String(u.name || "").toLowerCase().includes(term) ||
        String(u.email || "").toLowerCase().includes(term)
    );
    if (hitUser) {
      setActiveTab(3);
      return;
    }
    showToast("error", "No match in orders, clients, or products.");
  };

  const render3DOrderCard = (order) => {
    const displayNum = order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`;
    const isManual = ["easypaisa", "jazzcash", "bank_transfer"].includes(order.paymentMethod);
    const payTone =
      order.paymentStatus === "paid"
        ? "text-emerald-700 bg-emerald-50 border-emerald-200"
        : order.paymentStatus === "pending_verification"
          ? "text-sky-700 bg-sky-50 border-sky-200"
          : order.paymentStatus === "failed"
            ? "text-rose-700 bg-rose-50 border-rose-200"
            : "text-amber-700 bg-amber-50 border-amber-200";
    const methodTone =
      order.paymentMethod === "cod"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : order.paymentMethod === "stripe"
          ? "bg-violet-50 text-violet-700 border-violet-200"
          : "bg-emerald-50 text-emerald-700 border-emerald-200";

    const metaBits = [
      order.city ? { k: "City", v: order.city } : null,
      order.address ? { k: "Address", v: order.address } : null,
      order.areaSize ? { k: "Area", v: `${order.areaSize} sq ft` } : null,
      order.deliveryDate ? { k: "Date", v: order.deliveryDate } : null,
      order.courierName ? { k: "Courier", v: order.courierName } : null,
      order.trackingRef ? { k: "Track", v: order.trackingRef } : null,
    ].filter(Boolean);

    return (
      <article
        key={order._id}
        className="mx-oc rounded-2xl bg-white border border-[#e2e8ec] overflow-hidden shadow-[0_1px_2px_rgba(11,47,61,.04),0_10px_24px_-16px_rgba(11,47,61,.22)]"
      >
        {/* Accent rail */}
        <div className="h-1 w-full bg-gradient-to-r from-[#0a3d52] via-[#ff6b4a] to-[#0a3d52]/30" />

        <div className="p-3.5 sm:p-4">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl shrink-0 grid place-items-center font-mono font-extrabold text-[#0a3d52] text-[11px] sm:text-xs bg-[#f1f5f9] border border-[#e2e8ec]">
              {String(displayNum).slice(-4)}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h4 className="text-[14px] sm:text-[15px] font-extrabold text-[#0a3d52] tracking-[-0.2px] leading-tight truncate">
                    {order.customerName}
                  </h4>
                  <p className="text-[11px] text-[#64748b] mt-0.5 truncate">
                    {[order.email, order.phone].filter(Boolean).join(" · ") || "No contact"}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[13px] sm:text-sm font-black text-[#0a3d52] tabular-nums leading-none">
                    PKR {Number(order.subtotal || 0).toLocaleString()}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyOrderId(displayNum)}
                    className="mt-1 inline-flex items-center gap-1 text-[10px] font-bold font-mono text-[#64748b] hover:text-[#0a3d52]"
                    title="Copy order number"
                  >
                    <ContentCopyRoundedIcon sx={{ fontSize: 11 }} />
                    {displayNum}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-[#f8fafc] text-[#64748b] border border-[#e2e8ec]">
                  {order.channel || order.orderSource || "store"}
                </span>
                <span className={`text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${methodTone}`}>
                  {order.paymentMethod ? String(order.paymentMethod).replace("_", " ") : "COD"}
                </span>
                {isManual ? (
                  <span className="text-[9px] font-extrabold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200">
                    Manual
                  </span>
                ) : null}
              </div>
            </div>
          </div>

          {/* Status toolbar */}
          <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-center sm:bg-[#f8fafc] sm:border sm:border-[#e8eef2] sm:rounded-xl sm:p-1.5">
            <label className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-[#e2e8ec] sm:border-0 bg-white sm:bg-transparent px-2.5 py-2 sm:py-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#94a3b8] shrink-0">Pay</span>
              <select
                value={order.paymentStatus || "pending"}
                onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                className={`min-w-0 flex-1 text-[11px] font-extrabold uppercase border-0 bg-transparent outline-none cursor-pointer ${payTone.split(" ")[0]}`}
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="pending_verification">Pending Verification</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
              <span className={`hidden sm:inline text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border ${payTone}`}>
                {(order.paymentStatus || "pending").replace("_", " ")}
              </span>
            </label>
            <div className="hidden sm:block w-px h-6 bg-[#e2e8ec]" />
            <label className="flex-1 min-w-0 flex items-center gap-2 rounded-lg border border-[#e2e8ec] sm:border-0 bg-white sm:bg-transparent px-2.5 py-2 sm:py-1.5">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-[#94a3b8] shrink-0">Ship</span>
              <select
                value={order.orderStatus || "pending"}
                onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                className="min-w-0 flex-1 text-[11px] font-extrabold uppercase border-0 bg-transparent outline-none cursor-pointer text-[#0a3d52]"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="on the way">On The Way</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
          </div>

          {/* Meta chips */}
          {(metaBits.length > 0 ||
            order.transactionReference ||
            order.paymentScreenshotUrl ||
            order.notes ||
            order.dispatchNote) && (
            <div className="mt-3 pt-3 border-t border-dashed border-[#e8eef2]">
              {metaBits.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {metaBits.map((m) => (
                    <span
                      key={`${order._id}-${m.k}`}
                      className="inline-flex max-w-full items-baseline gap-1 rounded-lg bg-[#f8fafc] border border-[#e8eef2] px-2 py-1 text-[11px]"
                    >
                      <span className="font-extrabold uppercase tracking-wide text-[9px] text-[#94a3b8]">{m.k}</span>
                      <span className="font-semibold text-[#334155] truncate">{m.v}</span>
                    </span>
                  ))}
                </div>
              ) : null}

              {(order.transactionReference || order.paymentScreenshotUrl) && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {order.transactionReference ? (
                    <span className="inline-flex items-center text-[10px] font-bold font-mono text-sky-800 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">
                      TID {order.transactionReference}
                    </span>
                  ) : null}
                  {order.paymentScreenshotUrl ? (
                    <a
                      href={order.paymentScreenshotUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-extrabold text-[#ff6b4a] hover:underline"
                    >
                      Receipt
                    </a>
                  ) : null}
                </div>
              )}

              {order.notes ? (
                <p className="mt-2 text-[11px] text-[#64748b]">
                  <span className="font-bold text-[#94a3b8]">Note</span> {order.notes}
                </p>
              ) : null}
              {order.dispatchNote ? (
                <p className="mt-1 text-[11px] text-[#64748b] italic">{order.dispatchNote}</p>
              ) : null}
            </div>
          )}

          {/* Items */}
          {order.items?.length ? (
            <div className="mt-3 space-y-1.5">
              {order.items.map((item, idx) => (
                <div
                  key={`${order._id}-${idx}`}
                  className="flex items-center gap-2.5 rounded-xl bg-[#f8fafc] border border-[#eef2f5] px-2 py-1.5"
                >
                  <img
                    src={item.imageUrl || "/products/Banner1.jpeg"}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-cover border border-[#e2e8ec] bg-white shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] font-bold text-[#0f1929] truncate">{item.name}</p>
                    <p className="text-[10px] text-[#64748b] font-semibold">
                      ×{item.quantity}
                      <span className="text-[#cbd5e1]"> · </span>
                      PKR {Number(item.price || 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </article>
    );
  };

  const filteredProducts = useMemo(() => {
    const q = productQuery.trim().toLowerCase();
    return (products || []).filter((p) => {
      if (productFilter === "active" && p.active === false) return false;
      if (productFilter === "featured" && !p.featured) return false;
      if (productFilter === "low" && Number(p.stock || 0) >= 5) return false;
      if (productFilter === "hidden" && p.active !== false) return false;
      if (!q) return true;
      return (
        String(p.name || "").toLowerCase().includes(q) ||
        String(p.category || "").toLowerCase().includes(q)
      );
    });
  }, [products, productFilter, productQuery]);

  const bottomTabs = [
    { id: 0, label: "Home", icon: "🔥" },
    { id: 1, label: "Orders", icon: "🧾" },
    { id: 4, label: "Catalog", icon: "🛍️" },
    { id: 3, label: "Clients", icon: "👥" },
  ];

  const renderNavButton = (item) => {
    const isActive = activeTab === item.id;
    return (
      <button
        key={item.id}
        type="button"
        onClick={() => {
          setActiveTab(item.id);
          setMobileMenuOpen(false);
        }}
        className={`mx-nav ${isActive ? "on" : ""}`}
      >
        <i>{item.icon}</i>
        {item.label}
        {item.badge > 0 ? <em>{item.badge}</em> : null}
      </button>
    );
  };

  return (
    <div className="mx-admin selection:bg-[#0b2f3d] selection:text-white">
      {/* Homepage-style announcement strip */}
      <div className="mx-ann">
        <div className="mx-ann__inner mx-ann__desktop">
          <div className="mx-ann__brand">
            <span className="mx-ann__bolt">⚡</span>
            <span className="mx-ann__sep">|</span>
            <span>MARBLEX — Premium Construction Chemical & Industrial Rubber Solutions</span>
          </div>
          <div className="mx-ann__badges">
            <span className="mx-ann__badge">
              <ShieldOutlinedIcon sx={{ fontSize: 15, color: "#10b981" }} />
              <span>
                <b>ISO Certified</b>
                <small>Quality You Can Trust</small>
              </span>
            </span>
            <span className="mx-ann__badge">
              <WorkspacePremiumOutlinedIcon sx={{ fontSize: 15, color: "#10b981" }} />
              <span>
                <b>15+ Years</b>
                <small>Proven Performance</small>
              </span>
            </span>
            <span className="mx-ann__badge">
              <SpaOutlinedIcon sx={{ fontSize: 15, color: "#10b981" }} />
              <span>
                <b>Sustainable</b>
                <small>For a Better Tomorrow</small>
              </span>
            </span>
          </div>
        </div>
        <div className="mx-ann__mobile">
          <div className="mx-ann__marquee">
            {[1, 2].map((k) => (
              <div key={k} className="mx-ann__marquee-track">
                <span>
                  <span className="mx-ann__bolt">⚡</span> <b>MARBLEX</b> — Premium Construction Chemical & Industrial
                  Rubber Solutions
                </span>
                <span>•</span>
                <span className="text-emerald-300 font-bold inline-flex items-center gap-1">
                  <ShieldOutlinedIcon sx={{ fontSize: 13 }} /> ISO Certified
                </span>
                <span>•</span>
                <span className="text-sky-300 font-bold inline-flex items-center gap-1">
                  <WorkspacePremiumOutlinedIcon sx={{ fontSize: 13 }} /> 15+ Years Proven
                </span>
                <span>•</span>
                <span className="text-emerald-200 font-bold inline-flex items-center gap-1">
                  <SpaOutlinedIcon sx={{ fontSize: 13 }} /> Sustainable Eco Formulations
                </span>
                <span>•</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Homepage-style sticky navbar (admin actions) */}
      <header className="mx-top">
        <div className="mx-top__bar">
          <div className="mx-top__left">
            <button
              type="button"
              className="mx-top__icon-btn mx-top__menu"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <MenuRoundedIcon sx={{ fontSize: 20 }} />
            </button>
            <Link to="/" className="mx-top__brand-link">
              <div className="mx-top__logo">
                <img src="/logo-icon-transparent.png" alt="MARBLEX" />
              </div>
              <div className="mx-top__titles">
                <span className="mx-top__name">
                  MAR<span>BLEX</span>
                </span>
                <span className="mx-top__tag">Admin console</span>
              </div>
            </Link>
            <span className="mx-pill mx-top__status">Atlas connected</span>
          </div>

          <label className="mx-srch mx-top__search">
            <SearchIcon sx={{ fontSize: 16, color: "#6b8190" }} />
            <input
              id="mx-admin-search"
              placeholder="Search orders, clients, products"
              aria-label="Search"
              value={adminSearch}
              onChange={(e) => setAdminSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") runAdminSearch(adminSearch);
              }}
            />
            <kbd>/</kbd>
          </label>

          <div className="mx-top__actions">
            <button
              type="button"
              className={`mx-top__icon-btn mx-bell ${chatUnreadTotal > 0 || adminUnreadReviews > 0 ? "dot" : ""}`}
              aria-label="Notifications"
              onClick={() => setActiveTab(6)}
            >
              <NotificationsOutlinedIcon sx={{ fontSize: 18 }} />
            </button>
            <Link to="/" className="mx-top__pill-btn mx-hide">
              <StorefrontIcon sx={{ fontSize: 16 }} />
              View storefront
            </Link>
            <button type="button" onClick={handleManualRefresh} className="mx-top__pill-btn mx-hide">
              <span ref={refreshBtnRef} className="inline-flex">
                <RefreshRoundedIcon sx={{ fontSize: 16 }} />
              </span>
              {isRefreshing ? "Syncing…" : "Sync DB"}
            </button>
            <button type="button" onClick={logout} className="mx-top__pill-btn mx-top__logout">
              <LogoutIcon sx={{ fontSize: 15 }} />
              <span className="mx-hide">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-wrap">
        <aside className="mx-side mx-side-desktop">
          <button
            type="button"
            className={`mx-me ${activeTab === 17 ? "on" : ""}`}
            onClick={() => setActiveTab(17)}
          >
            <div className="mx-av">
              {adminUser?.avatarUrl ? (
                <img src={adminUser.avatarUrl} alt="" />
              ) : (
                (adminUser?.name || "MX").trim().slice(0, 2).toUpperCase()
              )}
            </div>
            <div>
              <b>{adminUser?.name || "MARBLEX Admin"}</b>
              <small>Master controller</small>
            </div>
          </button>
          {navGroups.map((group) => (
            <div key={group.title || "core"}>
              {group.title ? <p className="mx-grp">{group.title}</p> : null}
              {group.items.map((id) => {
                const item = navItems.find((n) => n.id === id);
                return item ? renderNavButton(item) : null;
              })}
            </div>
          ))}
        </aside>

        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            className: "mx-mdraw",
            sx: {
              width: "min(312px, 88vw)",
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
            },
          }}
        >
          <div className="mx-mdraw__sheet">
            <div className="mx-mdraw__hero">
              <div className="mx-mdraw__hero-top">
                <div className="mx-mdraw__brand">
                  MAR<b>BLEX</b>
                </div>
                <button
                  type="button"
                  className="mx-mdraw__close"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <CloseIcon sx={{ fontSize: 18 }} />
                </button>
              </div>
              <button
                type="button"
                className={`mx-mdraw__me ${activeTab === 17 ? "on" : ""}`}
                onClick={() => {
                  setActiveTab(17);
                  setMobileMenuOpen(false);
                }}
              >
                <div className="mx-mdraw__av">
                  {adminUser?.avatarUrl ? (
                    <img src={adminUser.avatarUrl} alt="" />
                  ) : (
                    (adminUser?.name || "MX").trim().slice(0, 2).toUpperCase()
                  )}
                </div>
                <div className="mx-mdraw__me-text">
                  <b>{adminUser?.name || "MARBLEX Admin"}</b>
                  <small>Master controller</small>
                </div>
                <span className="mx-mdraw__chev">›</span>
              </button>
            </div>

            <div className="mx-mdraw__body">
              {navGroups.map((group) => (
                <section key={`m-${group.title || "core"}`} className="mx-mdraw__group">
                  {group.title ? <p className="mx-mdraw__grp">{group.title}</p> : null}
                  <div className="mx-mdraw__list">
                    {group.items.map((id) => {
                      const item = navItems.find((n) => n.id === id);
                      if (!item) return null;
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          className={`mx-mdraw__nav ${isActive ? "on" : ""}`}
                          onClick={() => {
                            setActiveTab(item.id);
                            setMobileMenuOpen(false);
                          }}
                        >
                          <i>{item.icon}</i>
                          <span>{item.label}</span>
                          {item.badge > 0 ? <em>{item.badge}</em> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </Drawer>

        <div className="mx-main">
          {/* ================= TAB 0: COMMAND CENTER / OVERVIEW ================= */}
          {activeTab === 0 && (
            <TabWrapper3D tabKey={0}>
              <AdminCommandCenter
                overview={overview}
                usersData={usersData}
                products={products}
                orders={orderLookup.all || []}
                websiteShare={websiteShare}
                whatsappShare={whatsappShare}
                paidShare={paidShare}
                paymentQueueCount={paymentQueueCount}
                pendingAccessCount={pendingAccessCount}
                visualBars={visualBars}
                onNavigate={setActiveTab}
              />
            </TabWrapper3D>
          )}

          {/* ================= TAB 1: WEBSITE ORDERS ================= */}
          {activeTab === 1 && (
            <TabWrapper3D tabKey={1}>
                <div className="space-y-4 sm:space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-[22px] sm:text-xl md:text-2xl font-extrabold text-[#0a3d52] font-heading tracking-[-0.4px]">
                        Website Orders
                      </h2>
                      <p className="text-[12px] sm:text-xs text-[#6b8190] mt-1">
                        Direct purchases completed through MARBLEX store
                      </p>
                    </div>
                    <span className="inline-flex items-center self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-[#e2e8ec] text-xs font-extrabold text-[#0a3d52] shadow-[0_3px_0_#e8eef1] font-subheading">
                      Total{" "}
                      <span className="ml-1.5 text-[#ff6b4a] text-sm">{websiteData.orders?.length || 0}</span>
                    </span>
                  </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {websiteData.orders?.map(render3DOrderCard)}
                    {!websiteData.orders?.length && (
                      <div className="py-14 text-center text-[#6b8190] font-bold border border-dashed border-[#d5dee4] rounded-[22px] bg-white/80">
                        No website orders recorded yet.
                      </div>
                    )}
                  </div>
                </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 2: WHATSAPP ORDERS ================= */}
          {activeTab === 2 && (
            <TabWrapper3D tabKey={2}>
              <div className="space-y-4 sm:space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="text-[22px] sm:text-xl md:text-2xl font-extrabold text-[#0a3d52] font-heading tracking-[-0.4px]">
                      WhatsApp Orders
                    </h2>
                    <p className="text-[12px] sm:text-xs text-[#6b8190] mt-1">
                      Inquiries converted through WhatsApp
                    </p>
                  </div>
                  <span className="inline-flex items-center self-start sm:self-auto px-3.5 py-2 rounded-xl bg-white border border-[#e2e8ec] text-xs font-extrabold text-[#0a3d52] shadow-[0_3px_0_#e8eef1] font-subheading">
                    Total{" "}
                    <span className="ml-1.5 text-emerald-600 text-sm">{whatsappData.orders?.length || 0}</span>
                  </span>
                </div>

                  <div className="space-y-2.5 sm:space-y-3">
                    {whatsappData.orders?.map(render3DOrderCard)}
                    {!whatsappData.orders?.length && (
                      <div className="py-14 text-center text-[#6b8190] font-bold border border-dashed border-[#d5dee4] rounded-[22px] bg-white/80">
                        No WhatsApp orders recorded yet.
                      </div>
                    )}
                  </div>
              </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 3: CUSTOMERS ================= */}
          {activeTab === 3 && (
            <TabWrapper3D tabKey={3}>
              <AdminCustomersTab
                token={token}
                users={usersData.users || []}
                pendingAccessCount={pendingAccessCount}
                showToast={showToast}
                onToggleAccess={handleToggleUserAccess}
                onToggleBlock={handleToggleBlockUser}
                onReload={loadDashboardData}
              />
            </TabWrapper3D>
          )}

          {/* ================= TAB 4: PRODUCTS STUDIO ================= */}
          {activeTab === 4 && (
            <TabWrapper3D tabKey={4}>
              <AdminProductsTab
                products={products}
                filteredProducts={filteredProducts}
                product={product}
                setProduct={setProduct}
                editingProductId={editingProductId}
                isSaving={isSaving}
                productStudioTab={productStudioTab}
                setProductStudioTab={setProductStudioTab}
                productFilter={productFilter}
                setProductFilter={setProductFilter}
                productQuery={productQuery}
                setProductQuery={setProductQuery}
                editorSection={editorSection}
                setEditorSection={setEditorSection}
                topRef={productStudioTopRef}
                onSave={saveProduct}
                onReset={resetProductForm}
                onUpload={handleProductImageUpload}
                onEdit={startEditProduct}
                onDelete={deleteProductItem}
                onOpenNew={() => openProductEditor("new")}
              />
            </TabWrapper3D>
          )}

          {/* ================= TAB 5: BLOGS & STORIES ================= */}
          {activeTab === 5 && (
            <TabWrapper3D tabKey={5}>
              <div className="space-y-6">
                {/* Blog Creator */}
                <TiltCard3D
                  maxTilt={2}
                  scale={1}
                  className="rounded-2xl bg-white border border-[#e0e6ed] p-6 sm:p-8 shadow-sm"
                >
                  <div className="flex justify-between items-center mb-5">
                    <div>
                      <h2 className="text-xl font-bold text-[#0a3d52] font-heading">
                        {editingBlogId ? "Edit Industry Story" : "Publish Article to Atlas DB"}
                      </h2>
                      <p className="text-xs text-[#565e69]">Publish rubber & chemical case studies</p>
                    </div>
                    {editingBlogId && (
                      <button
                        onClick={resetBlogForm}
                        className="px-3 py-1 rounded-lg bg-[#f5f7fa] text-[#565e69] text-xs font-bold font-subheading"
                      >
                        Cancel
                      </button>
                    )}
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Article Title</label>
                      <input
                        type="text"
                        value={blog.title}
                        onChange={(e) => setBlog({ ...blog, title: e.target.value })}
                        placeholder="e.g. Modern Water Stopper Application Guide"
                        className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Cover Image</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={blog.coverImage}
                            onChange={(e) => setBlog({ ...blog, coverImage: e.target.value })}
                            placeholder="/products/Banner2.jpeg"
                            className="flex-1 bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none"
                          />
                          <label className="cursor-pointer btn-3d-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                            <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
                            <input type="file" accept="image/*" onChange={handleBlogImageUpload} className="hidden" />
                            Upload
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Tags</label>
                        <input
                          type="text"
                          value={blog.tags}
                          onChange={(e) => setBlog({ ...blog, tags: e.target.value })}
                          placeholder="Waterproofing, Construction, Rubber"
                          className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Content</label>
                      <textarea
                        rows={5}
                        value={blog.content}
                        onChange={(e) => setBlog({ ...blog, content: e.target.value })}
                        placeholder="Technical article content..."
                        className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2 text-[#0f1929] text-xs focus:bg-white focus:outline-none resize-y"
                      />
                    </div>

                    <button
                      onClick={saveBlog}
                      disabled={isSaving}
                      className="btn-3d-accent w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
                    >
                      {isSaving ? "Saving..." : editingBlogId ? "Update Story" : "Publish Story"}
                    </button>
                  </div>
                </TiltCard3D>

                {/* Blog Articles Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {blogs.map((b) => (
                    <TiltCard3D
                      key={b._id}
                      maxTilt={3}
                      scale={1.01}
                      className="rounded-2xl bg-white border border-[#e0e6ed] p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#ff8c73]"
                    >
                      <div>
                        <img
                          src={b.coverImage || "/products/Banner3.jpeg"}
                          alt={b.title}
                          className="w-full h-36 object-cover rounded-xl border border-[#e0e6ed] mb-2.5"
                        />
                        <h4 className="text-sm font-bold text-[#0a3d52] line-clamp-2 font-heading">{b.title}</h4>
                        <p className="text-xs text-[#565e69] line-clamp-2 mt-1">{b.content}</p>
                      </div>

                      <div className="flex gap-2 pt-2 border-t border-[#e0e6ed]">
                        <button
                          onClick={() => togglePublish(b)}
                          className={`flex-1 py-1.5 rounded-lg text-xs font-bold border font-subheading ${b.published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                            }`}
                        >
                          {b.published ? "Published" : "Draft"}
                        </button>
                        <button
                          onClick={() => startEditBlog(b)}
                          className="px-2.5 py-1.5 rounded-lg bg-[#f5f7fa] text-[#0a3d52] border border-[#e0e6ed] text-xs font-bold font-subheading"
                        >
                          <EditOutlinedIcon sx={{ fontSize: 13 }} />
                        </button>
                        <button
                          onClick={() => deleteBlog(b._id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                        >
                          <DeleteIcon sx={{ fontSize: 13 }} />
                        </button>
                      </div>
                    </TiltCard3D>
                  ))}
                </div>
              </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 6: SUPPORT CHATS ================= */}
          {activeTab === 6 && (
            <TabWrapper3D tabKey={6}>
              <div className="rounded-2xl bg-white border border-[#e0e6ed] p-5 sm:p-6 shadow-sm">
                <h2 className="text-lg font-bold text-[#0a3d52] mb-1 font-heading">Live Client Messenger</h2>
                <p className="text-xs text-[#565e69] mb-5">Socket connection with registered clients</p>
                <AdminMessengerTab token={token} showToast={showToast} />
              </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 7: GLOBAL BROADCAST ================= */}
          {activeTab === 7 && (
            <TabWrapper3D tabKey={7}>
              <div className="rounded-2xl bg-white border border-[#e0e6ed] p-5 sm:p-6 shadow-sm">
                <AdminBroadcastTab token={token} showToast={showToast} />
              </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 8: PARTNER SUBMISSIONS ================= */}
          {activeTab === 8 && (
            <TabWrapper3D tabKey={8}>
              <AdminPartnerSubmissionsTab reviewItems={reviewItems} />
            </TabWrapper3D>
          )}

          {/* ================= TAB 9: INSTANT ORDER LOOKUP ================= */}
          {activeTab === 9 && (
            <TabWrapper3D tabKey={9}>
              <div className="space-y-5">
                <TiltCard3D
                  maxTilt={2}
                  scale={1}
                  className="rounded-2xl bg-white border border-[#e0e6ed] p-6 shadow-sm"
                >
                  <h2 className="text-xl font-bold text-[#0a3d52] mb-1 font-heading">Instant Order Lookup</h2>
                  <p className="text-xs text-[#565e69] mb-4">Search by Order ID hash, customer name, or phone</p>

                  <div className="relative">
                    <SearchIcon sx={{ position: "absolute", left: 14, top: 12, color: "#565e69", fontSize: 20 }} />
                    <input
                      type="text"
                      value={orderLookup.q}
                      onChange={(e) => setOrderLookupQuery(e.target.value)}
                      placeholder="Search order ID (e.g. 7F3A), name, or phone..."
                      className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl pl-11 pr-4 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                    />
                  </div>
                </TiltCard3D>

                <div className="space-y-3">
                  {orderLookup.filtered.map(render3DOrderCard)}
                  {!orderLookup.filtered.length && (
                    <div className="py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                      No orders match your search query.
                    </div>
                  )}
                </div>
              </div>
            </TabWrapper3D>
          )}

          {/* ================= TAB 10: CLIENT INQUIRIES ================= */}
          {activeTab === 10 && (
            <TabWrapper3D tabKey={10}>
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Client Inquiries & Quotations</h2>
                  <p className="text-xs text-[#565e69]">Inquiries received via contact page with direct reply</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {contactRequests.map((req) => (
                    <TiltCard3D
                      key={req._id}
                      maxTilt={3}
                      scale={1.01}
                      className="rounded-2xl bg-white border border-[#e0e6ed] p-5 shadow-sm flex flex-col justify-between space-y-4"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1.5">
                          <div>
                            <h4 className="text-sm font-bold text-[#0a3d52] font-heading">{req.name}</h4>
                            <p className="text-xs text-[#ff6b4a] font-bold font-subheading">{req.subject || "Inquiry"}</p>
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5f7fa] text-[#565e69] font-subheading">
                            {req.status || "unread"}
                          </span>
                        </div>
                        <p className="text-xs text-[#565e69] mt-2">{req.message}</p>
                      </div>

                      <div className="pt-3 border-t border-[#e0e6ed] flex justify-between items-center">
                        <span className="text-[11px] text-[#565e69]">{req.email}</span>
                        <button
                          onClick={() => setReplyDialog({ open: true, request: req, reply: "" })}
                          className="btn-3d-accent px-3.5 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1 font-subheading"
                        >
                          <SendIcon sx={{ fontSize: 12 }} /> Reply
                        </button>
                      </div>
                    </TiltCard3D>
                  ))}
                  {!contactRequests.length && (
                    <div className="col-span-full py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                      No customer inquiries found.
                    </div>
                  )}
                </div>
              </div>
            </TabWrapper3D>
          )}

          {activeTab === 12 && (
            <TabWrapper3D tabKey={12}>
              <AdminPaymentQueueTab
                token={token}
                orders={orderLookup.all || []}
                showToast={showToast}
                onUpdated={loadDashboardData}
                renderOrderCard={render3DOrderCard}
              />
            </TabWrapper3D>
          )}

          {activeTab === 13 && (
            <TabWrapper3D tabKey={13}>
              <AdminQuotesTab token={token} showToast={showToast} />
            </TabWrapper3D>
          )}

          {activeTab === 16 && (
            <TabWrapper3D tabKey={16}>
              <AdminReviewsTab token={token} showToast={showToast} />
            </TabWrapper3D>
          )}

          {activeTab === 14 && (
            <TabWrapper3D tabKey={14}>
              <AdminTicketsTab token={token} showToast={showToast} />
            </TabWrapper3D>
          )}

          {activeTab === 15 && (
            <TabWrapper3D tabKey={15}>
              <AdminDocumentsTab token={token} showToast={showToast} />
            </TabWrapper3D>
          )}

          {/* ================= TAB 11: SMTP CONFIG ================= */}
          {activeTab === 11 && (
            <TabWrapper3D tabKey={11}>
              <TiltCard3D
                maxTilt={2}
                scale={1}
                className="rounded-2xl bg-white border border-[#e0e6ed] p-6 sm:p-8 shadow-sm max-w-xl"
              >
                <h2 className="text-xl font-bold text-[#0a3d52] mb-1 font-heading">System SMTP Settings</h2>
                <p className="text-xs text-[#565e69] mb-5">
                  Configure official Gmail SMTP credentials for automated quotation and reply emails
                </p>

                <div className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">SMTP Gmail Account</label>
                    <input
                      type="email"
                      value={emailConfig.user}
                      onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                      placeholder="e.g. sales@marblex.com"
                      className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">App Password</label>
                    <input
                      type="password"
                      value={emailConfig.pass}
                      onChange={(e) => setEmailConfig({ ...emailConfig, pass: e.target.value })}
                      placeholder="16-character App Password"
                      className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                    />
                  </div>

                  <button
                    onClick={handleSaveEmailConfig}
                    disabled={isSaving}
                    className="btn-3d-navy w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
                  >
                    {isSaving ? "Saving..." : "Save SMTP Settings"}
                  </button>
                </div>
              </TiltCard3D>
            </TabWrapper3D>
          )}

          {/* ================= TAB 17: ACCOUNT PROFILE ================= */}
          {activeTab === 17 && (
            <TabWrapper3D tabKey={17}>
              <AdminProfileTab token={token} showToast={showToast} />
            </TabWrapper3D>
          )}
        </div>
      </div>

      <nav className="mx-bn" aria-label="Mobile admin navigation">
        {bottomTabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={activeTab === t.id ? "on" : ""}
            onClick={() => setActiveTab(t.id)}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
        <button type="button" id="mb2" onClick={() => setMobileMenuOpen(true)}>
          <span>☰</span>
          More
        </button>
      </nav>

      {/* Reply Dialog */}
      <Dialog
        open={replyDialog.open}
        onClose={() => setReplyDialog({ open: false, request: null, reply: "" })}
        PaperProps={{ sx: { bgcolor: "#ffffff", color: "#0f1929", borderRadius: "1.25rem", border: "1px solid #e0e6ed", p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1.1rem", fontFamily: "'Space Grotesk', sans-serif", color: "#0a3d52" }}>
          Reply to {replyDialog.request?.name}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#565e69", fontSize: "0.8rem", mb: 2 }}>
            Email: <span className="text-[#ff6b4a] font-bold">{replyDialog.request?.email}</span>
          </DialogContentText>
          <textarea
            rows={4}
            value={replyDialog.reply}
            onChange={(e) => setReplyDialog({ ...replyDialog, reply: e.target.value })}
            placeholder="Official response from MARBLEX..."
            className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl p-3 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
          />
        </DialogContent>
        <DialogActions sx={{ p: 1.5 }}>
          <button
            onClick={() => setReplyDialog({ open: false, request: null, reply: "" })}
            className="px-3 py-1.5 rounded-lg text-[#565e69] text-xs font-bold font-subheading"
          >
            Cancel
          </button>
          <button
            onClick={handleSendReply}
            disabled={isSaving || !replyDialog.reply.trim()}
            className="btn-3d-accent px-4 py-1.5 rounded-lg text-white text-xs font-bold font-subheading"
          >
            {isSaving ? "Sending..." : "Send Email"}
          </button>
        </DialogActions>
      </Dialog>

      {/* Order Status Confirm Dialog */}
      <Dialog
        open={statusConfirmDialog.open}
        onClose={() => setStatusConfirmDialog({ open: false, order: null, newStatus: "" })}
        PaperProps={{ sx: { bgcolor: "#ffffff", color: "#0f1929", borderRadius: "1.25rem", border: "1px solid #e0e6ed", p: 1.5 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, fontSize: "1rem", color: "#0a3d52", fontFamily: "'Space Grotesk', sans-serif" }}>Update Order Status?</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#565e69", fontSize: "0.85rem" }}>
            Change order status to <span className="text-[#ff6b4a] font-bold uppercase">"{statusConfirmDialog.newStatus}"</span>?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 1.5, gap: 1 }}>
          <button
            onClick={() => setStatusConfirmDialog({ open: false, order: null, newStatus: "" })}
            className="px-3 py-1.5 rounded-lg text-[#565e69] text-xs font-bold font-subheading"
          >
            Cancel
          </button>
          <button
            onClick={() => confirmUpdateStatus(false)}
            className="btn-3d-white px-3.5 py-1.5 rounded-lg text-xs font-bold font-subheading"
          >
            Update Only
          </button>
          <button
            onClick={() => confirmUpdateStatus(true)}
            className="btn-3d-accent px-3.5 py-1.5 rounded-lg text-white text-xs font-bold font-subheading"
          >
            Update & Notify Client
          </button>
        </DialogActions>
      </Dialog>

      {/* Toast */}
      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
          sx={{
            bgcolor: "#ffffff",
            color: "#0f1929",
            border: "1px solid #e0e6ed",
            borderRadius: "0.75rem",
            fontWeight: 700,
            boxShadow: "0 10px 25px -5px rgba(10,61,82,0.12)",
          }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
