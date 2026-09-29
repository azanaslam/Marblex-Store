import { useCallback, useEffect, useRef, useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  Alert,
  Avatar,
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
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import SearchIcon from "@mui/icons-material/Search";
import StorefrontIcon from "@mui/icons-material/Storefront";
import SendIcon from "@mui/icons-material/Send";
import SparklesIcon from "@mui/icons-material/AutoAwesome";

import { AdminBroadcastTab } from "../components/AdminBroadcastTab";
import { AdminMessengerTab } from "../components/AdminMessengerTab";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser } from "../auth/session";
import { TiltCard3D } from "../components/admin3d/TiltCard3D";
import { StatCard3D } from "../components/admin3d/StatCard3D";
import { AmbientMesh3D } from "../components/admin3d/AmbientMesh3D";
import { TabWrapper3D } from "../components/admin3d/TabWrapper3D";

export const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(getAuthToken());
  const [activeTab, setActiveTab] = useState(0);
  const [chatUnreadTotal, setChatUnreadTotal] = useState(0);
  const [overview, setOverview] = useState(null);
  const [websiteData, setWebsiteData] = useState({ totalOrders: 0, totalAmount: 0, orders: [] });
  const [whatsappData, setWhatsappData] = useState({ totalOrders: 0, totalAmount: 0, orders: [] });
  const [usersData, setUsersData] = useState({ totalUsers: 0, users: [] });
  const [products, setProducts] = useState([]);
  const [product, setProduct] = useState({ name: "", imageUrl: "", extraImages: ["", "", ""], description: "", price: 0, stock: 0 });
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
  const [statusConfirmDialog, setStatusConfirmDialog] = useState({ open: false, order: null, newStatus: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const refreshBtnRef = useRef(null);

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
        http.get("/products"),
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
    const n = location.state?.chatUnread;
    const backTab = location.state?.adminTab;
    if (typeof backTab === "number") {
      setActiveTab(backTab);
      navigate("/admin", { replace: true, state: {} });
      return;
    }
    if (typeof n === "number" && n > 0) {
      showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from users.`);
      navigate("/admin", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    const load = () =>
      http.get("/chat/unread-count", h).then((r) => setChatUnreadTotal(Number(r.data?.count) || 0)).catch(() => {});
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
    setProduct({ name: "", imageUrl: "", extraImages: ["", "", ""], description: "", price: 0, stock: 0 });
    setEditingProductId("");
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
    try {
      if (editingProductId) {
        await http.put(`/products/${editingProductId}`, product, authHeaders(token));
      } else {
        await http.post("/products", product, authHeaders(token));
      }
      resetProductForm();
      await loadDashboardData();
      showToast("success", editingProductId ? "Product updated." : "Product published to Database!");
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
      extraImages: item.extraImages?.length === 3 ? item.extraImages : ["", "", ""],
      description: item.description || "",
      price: Number(item.price) || 0,
      stock: Number(item.stock) || 0,
    });
    setActiveTab(4);
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

  const visualBars = [
    { label: "Mon", value: 45, height: "65%" },
    { label: "Tue", value: 62, height: "85%" },
    { label: "Wed", value: 38, height: "50%" },
    { label: "Thu", value: 71, height: "92%" },
    { label: "Fri", value: 52, height: "70%" },
    { label: "Sat", value: 84, height: "100%" },
    { label: "Sun", value: 66, height: "78%" },
  ];

  const navItems = [
    { id: 0, label: "Command Center", icon: "⚡" },
    { id: 1, label: "Web Orders", icon: "🌐", badge: websiteOrders },
    { id: 2, label: "WhatsApp Orders", icon: "📱", badge: whatsappOrders },
    { id: 3, label: "User Access", icon: "👥", badge: pendingAccessCount },
    { id: 4, label: "Products Catalog", icon: "🛍️", badge: products.length },
    { id: 5, label: "Blogs & Stories", icon: "📝", badge: blogs.length },
    { id: 6, label: "Support Chats", icon: "💬", badge: chatUnreadTotal },
    { id: 7, label: "Global Broadcast", icon: "📢" },
    { id: 8, label: "Product Reviews", icon: "⭐", badge: adminUnreadReviews },
    { id: 9, label: "Order Lookup", icon: "🔍" },
    { id: 10, label: "Client Inquiries", icon: "📧", badge: contactRequests.filter((c) => c.status === "unread").length },
    { id: 11, label: "SMTP Settings", icon: "⚙️" },
  ];

  const navGroups = [
    { title: "Core Operations", items: [0] },
    { title: "Revenue & Sales", items: [1, 2, 9] },
    { title: "Inventory & Content", items: [4, 5, 8] },
    { title: "Communications", items: [6, 7, 10] },
    { title: "Security & System", items: [3, 11] },
  ];

  const render3DOrderCard = (order) => (
    <TiltCard3D
      key={order._id}
      maxTilt={3}
      scale={1.01}
      className="group rounded-2xl bg-white border border-[#e0e6ed] p-5 shadow-sm transition-all duration-300 hover:border-[#ff8c73] hover:shadow-md"
    >
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#e0e6ed]/60">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-[#0a3d52]/5 border border-[#0a3d52]/10 flex items-center justify-center font-mono font-bold text-[#0a3d52]">
            #{String(order._id).slice(-4).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-[#0a3d52] font-heading">{order.customerName}</h4>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#f5f7fa] text-[#565e69] border border-[#e0e6ed]">
                {order.channel}
              </span>
            </div>
            <p className="text-xs text-[#565e69] font-medium">
              {order.email} <span className="text-slate-300">|</span> {order.phone}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => copyOrderId(order._id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f7fa] hover:bg-[#e0e6ed] text-[#0a3d52] border border-[#e0e6ed] text-xs font-mono transition-colors"
            title="Copy ID"
          >
            <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
            #{String(order._id).slice(-6).toUpperCase()}
          </button>

          <div className="flex items-center rounded-lg bg-[#f5f7fa] border border-[#e0e6ed] p-1">
            <select
              value={order.paymentStatus || "pending"}
              onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
              className={`text-xs font-bold uppercase px-2.5 py-1 rounded border-0 bg-transparent focus:ring-0 cursor-pointer ${
                order.paymentStatus === "paid" ? "text-emerald-700 font-bold" : "text-amber-600"
              }`}
            >
              <option value="pending">Pending Pay</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>

            <div className="w-px h-3.5 bg-[#e0e6ed] mx-1" />

            <select
              value={order.orderStatus || "pending"}
              onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
              className="text-xs font-bold uppercase px-2.5 py-1 rounded border-0 bg-transparent focus:ring-0 cursor-pointer text-[#0a3d52]"
            >
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="on the way">On The Way</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="px-3.5 py-1.5 rounded-lg bg-[#0a3d52] text-white font-bold text-xs shadow-sm font-subheading">
            PKR {order.subtotal?.toLocaleString()}
          </div>
        </div>
      </div>

      <div className="pt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {order.items?.map((item, idx) => (
          <div key={`${order._id}-${idx}`} className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f5f7fa] border border-[#e0e6ed]/60">
            <img
              src={item.imageUrl || "/products/Banner1.jpeg"}
              alt={item.name}
              className="w-10 h-10 rounded-lg object-cover border border-[#e0e6ed] bg-white shrink-0"
            />
            <div className="min-w-0">
              <h5 className="text-xs font-bold text-[#0f1929] truncate">{item.name}</h5>
              <p className="text-[11px] text-[#565e69] font-medium">
                Qty: <span className="text-[#ff6b4a] font-bold">{item.quantity}</span> · PKR {item.price?.toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </TiltCard3D>
  );

  return (
    <div className="relative min-h-screen w-full bg-[#f5f7fa] text-[#0f1929] font-sans selection:bg-[#ff6b4a] selection:text-white pb-16">
      <AmbientMesh3D />

      {/* Top MARBLEX Executive Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/95 border-b border-[#e0e6ed] shadow-sm">
        <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-[#f5f7fa] text-[#0a3d52]"
            >
              <MenuIcon />
            </button>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white border border-[#e0e6ed] p-1.5 flex items-center justify-center shadow-sm overflow-hidden shrink-0">
                <img src="/logo-icon-transparent.png" alt="MARBLEX Logo" className="w-full h-full object-contain" />
              </div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0a3d52] font-heading">
                  MAR<span className="text-[#ff6b4a]">BLEX</span>
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Atlas Connected
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/"
              className="btn-3d-white flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold"
            >
              <StorefrontIcon sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline font-subheading">View Storefront</span>
            </Link>

            <button
              onClick={handleManualRefresh}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0a3d52]/5 hover:bg-[#0a3d52]/10 text-[#0a3d52] border border-[#0a3d52]/20 text-xs font-bold transition-all active:scale-95"
            >
              <span ref={refreshBtnRef} className="inline-block">
                <RefreshRoundedIcon sx={{ fontSize: 16 }} />
              </span>
              <span className="hidden sm:inline font-subheading">{isRefreshing ? "Syncing..." : "Sync DB"}</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold transition-all active:scale-95 font-subheading"
            >
              <LogoutIcon sx={{ fontSize: 15 }} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="relative z-10 w-full max-w-[1600px] mx-auto px-4 sm:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Desktop MARBLEX Sidebar */}
          <aside className="hidden md:block w-64 lg:w-72 shrink-0">
            <div className="sticky top-20 rounded-2xl bg-white border border-[#e0e6ed] p-4 shadow-sm space-y-5">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#f5f7fa] border border-[#e0e6ed]/60">
                <Avatar sx={{ width: 36, height: 36, bgcolor: "#0a3d52", fontWeight: 800, fontSize: 13, color: "#ff6b4a" }}>MX</Avatar>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#0a3d52] truncate font-heading">MARBLEX Admin</p>
                  <p className="text-[10px] text-[#565e69] font-medium font-subheading">Master Controller</p>
                </div>
              </div>

              <div className="space-y-4">
                {navGroups.map((group) => (
                  <div key={group.title} className="space-y-1">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-[#565e69] font-subheading">
                      {group.title}
                    </p>
                    {group.items.map((id) => {
                      const item = navItems.find((n) => n.id === id);
                      const isActive = activeTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setActiveTab(item.id)}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all duration-150 font-subheading ${
                            isActive
                              ? "btn-3d-accent text-white shadow-md shadow-[#ff6b4a]/20"
                              : "text-[#565e69] hover:text-[#0a3d52] hover:bg-[#f5f7fa]"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm">{item.icon}</span>
                            <span>{item.label}</span>
                          </div>
                          {item.badge > 0 && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                isActive ? "bg-white text-[#ff6b4a]" : "bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Mobile Drawer */}
          <Drawer
            anchor="left"
            open={mobileMenuOpen}
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{
              sx: {
                width: "280px",
                bgcolor: "#ffffff",
                color: "#0f1929",
                p: 3,
                borderRight: "1px solid #e0e6ed",
              },
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-base font-black text-[#0a3d52] font-heading">
                MAR<span className="text-[#ff6b4a]">BLEX</span>
              </h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-1.5 rounded-lg bg-[#f5f7fa] text-[#0a3d52]">
                <CloseIcon />
              </button>
            </div>
            <div className="space-y-1.5">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs font-subheading ${
                    activeTab === item.id ? "bg-[#0a3d52] text-white" : "text-[#565e69] hover:bg-[#f5f7fa]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className="bg-[#ff6b4a] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </Drawer>

          {/* Dynamic Content */}
          <div className="flex-1 min-w-0">
            {/* ================= TAB 0: COMMAND CENTER / OVERVIEW ================= */}
            {activeTab === 0 && (
              <TabWrapper3D tabKey={0}>
                <div className="space-y-6">
                  {/* Hero Brand Banner */}
                  <TiltCard3D
                    maxTilt={2}
                    scale={1.01}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0a3d52]/8 via-[#ff6b4a]/6 to-white p-6 sm:p-8 border border-[#e0e6ed] shadow-sm"
                  >
                    <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a3d52]/10 text-[#0a3d52] text-[11px] font-bold uppercase tracking-wider font-subheading mb-2.5">
                          <SparklesIcon sx={{ fontSize: 13 }} /> Construction Chemical Intelligence
                        </div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a3d52] font-heading tracking-tight">
                          MARBLEX <span className="text-[#ff6b4a]">Command Center</span>
                        </h2>
                        <p className="text-[#565e69] text-xs sm:text-sm mt-1 max-w-lg font-medium">
                          Real-time industrial orders, rubber solutions inventory, and live client inquiries.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2.5">
                        <button
                          onClick={() => setActiveTab(4)}
                          className="btn-3d-accent px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
                        >
                          + Add Chemical / Product
                        </button>
                        <button
                          onClick={() => setActiveTab(7)}
                          className="btn-3d-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider"
                        >
                          📢 Send Broadcast
                        </button>
                      </div>
                    </div>
                  </TiltCard3D>

                  {/* 6x Clean Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                    <StatCard3D
                      title="Total Sales"
                      value={overview?.totalRevenue || 0}
                      prefix="PKR "
                      subtext="Gross store revenue"
                      icon="💰"
                      gradient="from-emerald-500/10 to-teal-500/5"
                      glowColor="rgba(16, 185, 129, 0.1)"
                      iconBg="bg-emerald-50 text-emerald-700 border-emerald-200"
                      trend={`${paidShare}% Paid`}
                      trendPositive={true}
                    />
                    <StatCard3D
                      title="Total Orders"
                      value={overview?.orderCount || 0}
                      subtext="Across all channels"
                      icon="📦"
                      gradient="from-[#0a3d52]/10 to-[#ff6b4a]/5"
                      glowColor="rgba(10, 61, 82, 0.1)"
                      iconBg="bg-[#0a3d52]/5 text-[#0a3d52] border-[#0a3d52]/20"
                      trend="100% active"
                      trendPositive={true}
                    />
                    <StatCard3D
                      title="Website Orders"
                      value={overview?.websiteOrders || 0}
                      subtext={`${websiteShare}% of volume`}
                      icon="🌐"
                      gradient="from-blue-500/10 to-indigo-500/5"
                      glowColor="rgba(37, 99, 235, 0.1)"
                      iconBg="bg-blue-50 text-blue-700 border-blue-200"
                      trend={`${websiteShare}% share`}
                      trendPositive={true}
                    />
                    <StatCard3D
                      title="WhatsApp Inquiries"
                      value={overview?.whatsappOrders || 0}
                      subtext={`${whatsappShare}% direct inquiries`}
                      icon="📱"
                      gradient="from-green-500/10 to-emerald-500/5"
                      glowColor="rgba(34, 197, 94, 0.1)"
                      iconBg="bg-green-50 text-green-700 border-green-200"
                      trend={`${whatsappShare}% share`}
                      trendPositive={true}
                    />
                    <StatCard3D
                      title="Paid Orders"
                      value={overview?.paidOrdersCount || 0}
                      subtext="Cleared payments"
                      icon="✅"
                      gradient="from-[#ff6b4a]/10 to-[#ff8c73]/5"
                      glowColor="rgba(255, 107, 74, 0.1)"
                      iconBg="bg-[#ff6b4a]/10 text-[#ff6b4a] border-[#ff6b4a]/20"
                      trend={`${paidShare}% collected`}
                      trendPositive={true}
                    />
                    <StatCard3D
                      title="Registered Clients"
                      value={usersData?.totalUsers || 0}
                      subtext={`${pendingAccessCount} pending approval`}
                      icon="👥"
                      gradient="from-amber-500/10 to-orange-500/5"
                      glowColor="rgba(245, 158, 11, 0.1)"
                      iconBg="bg-amber-50 text-amber-700 border-amber-200"
                      trend={pendingAccessCount > 0 ? `${pendingAccessCount} Pending` : "Verified"}
                      trendPositive={pendingAccessCount === 0}
                      onClick={() => setActiveTab(3)}
                    />
                  </div>

                  {/* 3D Charts & Distribution */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    {/* Weekly Trajectory */}
                    <TiltCard3D
                      maxTilt={2}
                      scale={1.01}
                      className="lg:col-span-2 rounded-2xl bg-white border border-[#e0e6ed] p-6 shadow-sm"
                    >
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-base font-bold text-[#0a3d52] font-heading">Weekly Demand Trajectory</h3>
                          <p className="text-xs text-[#565e69] mt-0.5">Construction chemical orders per weekday</p>
                        </div>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#0a3d52]/5 text-[#0a3d52] border border-[#0a3d52]/20 font-subheading">
                          Active Flow
                        </span>
                      </div>

                      <div className="h-48 flex items-end justify-between gap-3 pt-4 px-2">
                        {visualBars.map((bar, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                            <div className="text-[10px] font-mono font-bold text-[#565e69] opacity-0 group-hover:opacity-100 transition-opacity">
                              {bar.value}%
                            </div>
                            <div className="w-full max-w-[36px] h-28 bg-[#f5f7fa] rounded-xl overflow-hidden p-0.5 flex items-end">
                              <div
                                style={{ height: bar.height }}
                                className="w-full rounded-lg bg-gradient-to-t from-[#0a3d52] to-[#ff6b4a] shadow-sm transition-all duration-500 group-hover:scale-105"
                              />
                            </div>
                            <span className="text-xs font-semibold text-[#565e69] group-hover:text-[#ff6b4a] font-subheading">
                              {bar.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    </TiltCard3D>

                    {/* Channel Share */}
                    <TiltCard3D
                      maxTilt={2}
                      scale={1.01}
                      className="rounded-2xl bg-white border border-[#e0e6ed] p-6 shadow-sm flex flex-col justify-between"
                    >
                      <div>
                        <h3 className="text-base font-bold text-[#0a3d52] font-heading">Channel Distribution</h3>
                        <p className="text-xs text-[#565e69] mt-0.5">Breakdown by order origin</p>

                        <div className="space-y-4 mt-5">
                          <div>
                            <div className="flex justify-between text-xs font-bold text-[#0f1929] mb-1 font-subheading">
                              <span>Website Direct</span>
                              <span className="text-[#0a3d52] font-mono">{websiteShare}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#f5f7fa] overflow-hidden">
                              <div style={{ width: `${websiteShare}%` }} className="h-full rounded-full bg-[#0a3d52]" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold text-[#0f1929] mb-1 font-subheading">
                              <span>WhatsApp Direct</span>
                              <span className="text-emerald-700 font-mono">{whatsappShare}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#f5f7fa] overflow-hidden">
                              <div style={{ width: `${whatsappShare}%` }} className="h-full rounded-full bg-emerald-600" />
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs font-bold text-[#0f1929] mb-1 font-subheading">
                              <span>Payment Cleared</span>
                              <span className="text-[#ff6b4a] font-mono">{paidShare}%</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#f5f7fa] overflow-hidden">
                              <div style={{ width: `${paidShare}%` }} className="h-full rounded-full bg-[#ff6b4a]" />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#e0e6ed] flex justify-between items-center text-xs font-medium text-[#565e69]">
                        <span>Catalog Total:</span>
                        <span className="font-bold text-[#ff6b4a] font-subheading">{products.length} Products Active</span>
                      </div>
                    </TiltCard3D>
                  </div>

                  {/* Recent Orders Compact Table */}
                  <div className="rounded-2xl bg-white border border-[#e0e6ed] p-6 shadow-sm">
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h3 className="text-base font-bold text-[#0a3d52] font-heading">Recent Transactions</h3>
                        <p className="text-xs text-[#565e69]">Live incoming client orders</p>
                      </div>
                      <button
                        onClick={() => setActiveTab(1)}
                        className="text-xs font-bold text-[#ff6b4a] hover:underline font-subheading"
                      >
                        View All →
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-[#e0e6ed]">
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#565e69] uppercase tracking-wider font-subheading">ID</th>
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#565e69] uppercase tracking-wider font-subheading">Customer</th>
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#565e69] uppercase tracking-wider font-subheading">Amount</th>
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#565e69] uppercase tracking-wider text-center font-subheading">Payment</th>
                            <th className="py-2.5 px-3 text-[10px] font-bold text-[#565e69] uppercase tracking-wider text-right font-subheading">Channel</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderLookup.all.slice(0, 5).map((order) => (
                            <tr key={order._id} className="border-b border-[#e0e6ed]/40 hover:bg-[#f5f7fa] transition-colors">
                              <td className="py-2.5 px-3 font-mono text-xs text-[#ff6b4a] font-bold">
                                #{String(order._id).slice(-6).toUpperCase()}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="text-xs font-bold text-[#0a3d52]">{order.customerName}</div>
                                <div className="text-[10px] text-[#565e69]">{order.phone}</div>
                              </td>
                              <td className="py-2.5 px-3 text-xs font-bold text-[#0a3d52]">
                                PKR {order.subtotal?.toLocaleString()}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                                  order.paymentStatus === "paid" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                                }`}>
                                  {order.paymentStatus || "pending"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right text-[10px] font-bold uppercase text-[#565e69]">
                                {order.channel}
                              </td>
                            </tr>
                          ))}
                          {!orderLookup.all.length && (
                            <tr>
                              <td colSpan={5} className="py-6 text-center text-[#565e69] text-xs">
                                No orders in database yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </TabWrapper3D>
            )}

            {/* ================= TAB 1: WEBSITE ORDERS ================= */}
            {activeTab === 1 && (
              <TabWrapper3D tabKey={1}>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Website Orders</h2>
                      <p className="text-xs text-[#565e69]">Direct purchases completed through MARBLEX store</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white border border-[#e0e6ed] text-xs font-bold text-[#0a3d52] shadow-sm font-subheading">
                      Total: <span className="text-[#ff6b4a]">{websiteData.orders?.length || 0}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {websiteData.orders?.map(render3DOrderCard)}
                    {!websiteData.orders?.length && (
                      <div className="py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
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
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <div>
                      <h2 className="text-xl font-bold text-[#0a3d52] font-heading">WhatsApp Orders</h2>
                      <p className="text-xs text-[#565e69]">Inquiries converted through WhatsApp</p>
                    </div>
                    <span className="px-3 py-1 rounded-lg bg-white border border-[#e0e6ed] text-xs font-bold text-[#0a3d52] shadow-sm font-subheading">
                      Total: <span className="text-emerald-700">{whatsappData.orders?.length || 0}</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    {whatsappData.orders?.map(render3DOrderCard)}
                    {!whatsappData.orders?.length && (
                      <div className="py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                        No WhatsApp orders recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </TabWrapper3D>
            )}

            {/* ================= TAB 3: USER ACCESS CONTROL ================= */}
            {activeTab === 3 && (
              <TabWrapper3D tabKey={3}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Client Access & Security</h2>
                    <p className="text-xs text-[#565e69]">Manage client login permissions and security roles</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {usersData.users.map((user) => {
                      const canLogin = userCanLogin(user);
                      const isAdmin = user.role === "admin";
                      return (
                        <TiltCard3D
                          key={user._id}
                          maxTilt={3}
                          scale={1.01}
                          className="rounded-2xl bg-white border border-[#e0e6ed] p-5 shadow-sm flex flex-col justify-between space-y-4"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <Avatar sx={{ bgcolor: isAdmin ? "#0a3d52" : "#ff6b4a", fontWeight: 800, width: 38, height: 38 }}>
                                {user.name?.[0]?.toUpperCase() || "U"}
                              </Avatar>
                              <div>
                                <h4 className="text-sm font-bold text-[#0a3d52] font-heading">{user.name}</h4>
                                <p className="text-[11px] text-[#565e69] truncate max-w-[150px]">{user.email}</p>
                              </div>
                            </div>
                            <span
                              className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded font-subheading ${
                                isAdmin
                                  ? "bg-[#0a3d52]/10 text-[#0a3d52] border border-[#0a3d52]/20"
                                  : "bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20"
                              }`}
                            >
                              {user.role}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-2 border-t border-[#e0e6ed] text-xs">
                            <div className="flex justify-between">
                              <span className="text-[#565e69]">Login Access:</span>
                              <span className={`font-bold ${canLogin ? "text-emerald-700" : "text-amber-600"}`}>
                                {canLogin ? "Approved" : "Pending"}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-[#565e69]">Account Status:</span>
                              <span className={`font-bold ${user.isBlocked ? "text-rose-600" : "text-emerald-700"}`}>
                                {user.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </div>
                          </div>

                          {!isAdmin && (
                            <div className="grid grid-cols-2 gap-2 pt-2">
                              <button
                                onClick={() => handleToggleUserAccess(user)}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all font-subheading ${
                                  canLogin
                                    ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                }`}
                              >
                                {canLogin ? "Revoke" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleToggleBlockUser(user)}
                                className={`py-1.5 rounded-lg text-xs font-bold transition-all font-subheading ${
                                  user.isBlocked
                                    ? "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                    : "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                                }`}
                              >
                                {user.isBlocked ? "Unblock" : "Block"}
                              </button>
                            </div>
                          )}
                        </TiltCard3D>
                      );
                    })}
                  </div>
                </div>
              </TabWrapper3D>
            )}

            {/* ================= TAB 4: PRODUCTS STUDIO ================= */}
            {activeTab === 4 && (
              <TabWrapper3D tabKey={4}>
                <div className="space-y-6">
                  {/* Creator Form */}
                  <TiltCard3D
                    maxTilt={2}
                    scale={1}
                    className="rounded-2xl bg-white border border-[#e0e6ed] p-6 sm:p-8 shadow-sm"
                  >
                    <div className="flex justify-between items-center mb-5">
                      <div>
                        <h2 className="text-xl font-bold text-[#0a3d52] font-heading">
                          {editingProductId ? "Edit Chemical / Product" : "Add Product to Atlas DB"}
                        </h2>
                        <p className="text-xs text-[#565e69]">Save and publish directly to MARBLEX cluster</p>
                      </div>
                      {editingProductId && (
                        <button
                          onClick={resetProductForm}
                          className="px-3 py-1 rounded-lg bg-[#f5f7fa] text-[#565e69] text-xs font-bold font-subheading"
                        >
                          Cancel
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div className="lg:col-span-2 space-y-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Product Name</label>
                          <input
                            type="text"
                            value={product.name}
                            onChange={(e) => setProduct({ ...product, name: e.target.value })}
                            placeholder="e.g. MARBLEX Rubber Water Stopper 150mm"
                            className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Price (PKR)</label>
                            <input
                              type="number"
                              value={product.price}
                              onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Stock Units</label>
                            <input
                              type="number"
                              value={product.stock}
                              onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Image URL / Upload</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={product.imageUrl}
                              onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                              placeholder="/products/Banner1.jpeg or url"
                              className="flex-1 bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                            />
                            <label className="cursor-pointer btn-3d-white px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                              <AddPhotoAlternateIcon sx={{ fontSize: 16 }} />
                              <input type="file" accept="image/*" onChange={handleProductImageUpload} className="hidden" />
                              Upload
                            </label>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Technical Description</label>
                          <textarea
                            rows={3}
                            value={product.description}
                            onChange={(e) => setProduct({ ...product, description: e.target.value })}
                            placeholder="Industrial specifications and waterproofing standards..."
                            className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a] transition-all resize-y"
                          />
                        </div>

                        <button
                          onClick={saveProduct}
                          disabled={isSaving}
                          className="btn-3d-accent w-full py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
                        >
                          {isSaving ? "Saving..." : editingProductId ? "Update Product" : "Publish to MARBLEX Catalog"}
                        </button>
                      </div>

                      {/* 3D Interactive Live Card Preview */}
                      <div className="flex flex-col items-center justify-center p-5 rounded-xl bg-[#f5f7fa] border border-[#e0e6ed]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-[#565e69] mb-3 font-subheading">Live 3D Preview</p>
                        <TiltCard3D
                          maxTilt={4}
                          scale={1.02}
                          className="w-full max-w-[220px] rounded-xl bg-white border border-[#e0e6ed] p-3.5 shadow-sm"
                        >
                          <img
                            src={product.imageUrl || "/products/Banner1.jpeg"}
                            alt="Preview"
                            className="w-full h-32 object-cover rounded-lg border border-[#e0e6ed] bg-[#f5f7fa] mb-2.5"
                          />
                          <h4 className="text-xs font-bold text-[#0a3d52] truncate font-heading">{product.name || "Product Name"}</h4>
                          <p className="text-xs text-[#ff6b4a] font-bold mt-0.5 font-subheading">
                            PKR {product.price ? product.price.toLocaleString() : "0"}
                          </p>
                        </TiltCard3D>
                      </div>
                    </div>
                  </TiltCard3D>

                  {/* Inventory Products */}
                  <div>
                    <h3 className="text-lg font-bold text-[#0a3d52] mb-4 font-heading">Inventory Catalog ({products.length})</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {products.map((item) => (
                        <TiltCard3D
                          key={item._id}
                          maxTilt={3}
                          scale={1.01}
                          className="group rounded-2xl bg-white border border-[#e0e6ed] p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-[#ff8c73] hover:shadow-md"
                        >
                          <div>
                            <div className="relative rounded-xl overflow-hidden mb-2.5 border border-[#e0e6ed]">
                              <img
                                src={item.imageUrl || "/products/Banner1.jpeg"}
                                alt={item.name}
                                className="w-full h-36 object-cover"
                              />
                              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-white/90 backdrop-blur-sm text-[10px] font-bold text-[#0a3d52] border border-[#e0e6ed] shadow-sm font-subheading">
                                Stock: {item.stock || 0}
                              </div>
                            </div>
                            <h4 className="text-xs font-bold text-[#0a3d52] leading-tight font-heading">{item.name}</h4>
                            <p className="text-xs font-bold text-[#ff6b4a] mt-1 font-subheading">
                              PKR {item.price?.toLocaleString()}
                            </p>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-[#e0e6ed]">
                            <button
                              onClick={() => startEditProduct(item)}
                              className="flex-1 py-1.5 rounded-lg bg-[#f5f7fa] hover:bg-[#e0e6ed] text-[#0a3d52] text-xs font-bold flex items-center justify-center gap-1 border border-[#e0e6ed] font-subheading"
                            >
                              <EditOutlinedIcon sx={{ fontSize: 13 }} /> Edit
                            </button>
                            <button
                              onClick={() => deleteProductItem(item._id)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 text-xs font-bold"
                            >
                              <DeleteIcon sx={{ fontSize: 13 }} />
                            </button>
                          </div>
                        </TiltCard3D>
                      ))}
                    </div>
                  </div>
                </div>
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
                            className={`flex-1 py-1.5 rounded-lg text-xs font-bold border font-subheading ${
                              b.published ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
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

            {/* ================= TAB 8: PRODUCT REVIEWS ================= */}
            {activeTab === 8 && (
              <TabWrapper3D tabKey={8}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Product Reviews & Feedback</h2>
                    <p className="text-xs text-[#565e69]">Client satisfaction submissions</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {reviewItems.map((item) => (
                      <TiltCard3D
                        key={item._id}
                        maxTilt={3}
                        scale={1.01}
                        className="rounded-2xl bg-white border border-[#e0e6ed] p-4 shadow-sm flex flex-col justify-between space-y-3"
                      >
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[#ff6b4a] font-bold text-xs">
                              {"★".repeat(item.rating || 5)}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5f7fa] text-[#565e69] font-subheading">
                              {item.status}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-[#0a3d52] font-heading">{item.productName || "Product"}</h4>
                          <p className="text-xs text-[#565e69] mt-1">{item.reviewText}</p>
                        </div>

                        <div className="pt-2 border-t border-[#e0e6ed] text-[11px] text-[#565e69]">
                          By: <span className="text-[#0a3d52] font-bold">{item.submittedBy?.name || "Client"}</span>
                        </div>
                      </TiltCard3D>
                    ))}
                    {!reviewItems.length && (
                      <div className="col-span-full py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                        No product reviews recorded.
                      </div>
                    )}
                  </div>
                </div>
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
          </div>
        </div>
      </main>

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
