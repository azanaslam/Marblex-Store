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
import { AdminQuotesTab } from "../components/AdminQuotesTab";
import { AdminTicketsTab } from "../components/AdminTicketsTab";
import { AdminPaymentQueueTab } from "../components/AdminPaymentQueueTab";
import { AdminDocumentsTab } from "../components/AdminDocumentsTab";
import { AdminCustomersTab } from "../components/AdminCustomersTab";
import { AdminCommandCenter } from "../components/AdminCommandCenter";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser } from "../auth/session";
import { TiltCard3D } from "../components/admin3d/TiltCard3D";
import { StatCard3D } from "../components/admin3d/StatCard3D";
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
    { id: 0, label: "Command Center", icon: "⚡" },
    { id: 1, label: "Web Orders", icon: "🌐", badge: websiteOrders },
    { id: 2, label: "WhatsApp Orders", icon: "📱", badge: whatsappOrders },
    { id: 12, label: "Payment Queue", icon: "💳", badge: paymentQueueCount || overview?.pendingVerification || 0 },
    { id: 13, label: "Quotes / RFQ", icon: "📋", badge: overview?.openQuotes || 0 },
    { id: 3, label: "Customers", icon: "👥", badge: pendingAccessCount },
    { id: 4, label: "Products Catalog", icon: "🛍️", badge: products.length },
    { id: 15, label: "Documents", icon: "📄" },
    { id: 5, label: "Blogs & Stories", icon: "📝", badge: blogs.length },
    { id: 6, label: "Support Chats", icon: "💬", badge: chatUnreadTotal },
    { id: 14, label: "Tickets", icon: "🎫", badge: overview?.openTickets || 0 },
    { id: 7, label: "Global Broadcast", icon: "📢" },
    { id: 8, label: "Partner Submissions", icon: "🤝", badge: adminUnreadReviews },
    { id: 9, label: "Order Lookup", icon: "🔍" },
    { id: 10, label: "Client Inquiries", icon: "📧", badge: contactRequests.filter((c) => c.status === "unread").length },
    { id: 11, label: "SMTP Settings", icon: "⚙️" },
  ];

  const navGroups = [
    { title: "Core Operations", items: [0] },
    { title: "Revenue & Sales", items: [1, 2, 12, 13, 9] },
    { title: "Catalog & Docs", items: [4, 15, 5, 8] },
    { title: "Customers & Support", items: [3, 6, 14, 7, 10] },
    { title: "System", items: [11] },
  ];

  const render3DOrderCard = (order) => {
    const displayNum = order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`;
    const isManual = ["easypaisa", "jazzcash", "bank_transfer"].includes(order.paymentMethod);

    return (
      <TiltCard3D
        key={order._id}
        maxTilt={3}
        scale={1.01}
        className="group rounded-2xl bg-white border border-[#e0e6ed] p-5 shadow-sm transition-all duration-300 hover:border-[#ff8c73] hover:shadow-md"
      >
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-4 border-b border-[#e0e6ed]/60">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-[#0a3d52]/5 border border-[#0a3d52]/10 flex items-center justify-center font-mono font-bold text-[#0a3d52] text-xs">
              {String(displayNum).slice(-4)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-base font-bold text-[#0a3d52] font-heading">{order.customerName}</h4>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#f5f7fa] text-[#565e69] border border-[#e0e6ed]">
                  {order.channel || order.orderSource}
                </span>
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  order.paymentMethod === "cod"
                    ? "bg-slate-100 text-slate-700"
                    : order.paymentMethod === "stripe"
                    ? "bg-purple-50 text-purple-700 border border-purple-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}>
                  {order.paymentMethod ? String(order.paymentMethod).replace("_", " ") : "COD"}
                </span>
              </div>
              <p className="text-xs text-[#565e69] font-medium mt-0.5">
                {order.email} <span className="text-slate-300">|</span> {order.phone}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => copyOrderId(displayNum)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f5f7fa] hover:bg-[#e0e6ed] text-[#0a3d52] border border-[#e0e6ed] text-xs font-mono transition-colors cursor-pointer"
              title="Copy Order Number"
            >
              <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
              {displayNum}
            </button>

            <div className="flex items-center rounded-lg bg-[#f5f7fa] border border-[#e0e6ed] p-1">
              <select
                value={order.paymentStatus || "pending"}
                onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                className={`text-xs font-bold uppercase px-2.5 py-1 rounded border-0 bg-transparent focus:ring-0 cursor-pointer ${
                  order.paymentStatus === "paid"
                    ? "text-emerald-700 font-bold"
                    : order.paymentStatus === "pending_verification"
                    ? "text-blue-700 font-bold"
                    : "text-amber-600"
                }`}
              >
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
                <option value="pending_verification">Pending Verification</option>
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

        {/* Detailed Address & Transaction Verification Bar */}
        <div className="py-2.5 px-3 rounded-xl bg-slate-50 border border-[#e0e6ed]/80 my-3 text-xs space-y-1">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
            {order.city && (
              <span><strong>City:</strong> {order.city}</span>
            )}
            {order.address && (
              <span><strong>Site Address:</strong> {order.address}</span>
            )}
            {order.areaSize && (
              <span><strong>Area Size:</strong> {order.areaSize} sq ft</span>
            )}
            {order.deliveryDate && (
              <span><strong>Pref. Date:</strong> {order.deliveryDate}</span>
            )}
          </div>

          {(order.transactionReference || order.paymentScreenshotUrl) && (
            <div className="pt-1.5 border-t border-slate-200/80 flex flex-wrap items-center gap-3 text-xs">
              {order.transactionReference && (
                <span className="text-blue-700 font-semibold flex items-center gap-1">
                  <strong>TID / Ref:</strong> <span className="font-mono bg-blue-50 px-2 py-0.5 rounded border border-blue-200">{order.transactionReference}</span>
                </span>
              )}
              {order.paymentScreenshotUrl && (
                <a
                  href={order.paymentScreenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#ff6b4a] hover:underline font-bold text-xs flex items-center gap-1"
                >
                  📸 View Receipt Screenshot
                </a>
              )}
            </div>
          )}

          {order.notes && (
            <div className="text-[11px] text-slate-500 italic pt-0.5">
              <strong>Notes:</strong> {order.notes}
            </div>
          )}
          {(order.courierName || order.trackingRef || order.dispatchNote) && (
            <div className="text-[11px] text-slate-700 pt-0.5">
              {order.courierName ? <span><strong>Courier:</strong> {order.courierName} </span> : null}
              {order.trackingRef ? <span><strong>Track:</strong> {order.trackingRef} </span> : null}
              {order.dispatchNote ? <span className="block italic">{order.dispatchNote}</span> : null}
            </div>
          )}
        </div>

        <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
  };

  return (
    <div className="admin-redesign relative min-h-screen w-full bg-[#f7f7f5] text-[#17201d] font-sans selection:bg-[#17201d] selection:text-white pb-16">
      {/* The dashboard uses a quiet operational surface rather than decorative 3D effects. */}

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

                                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Category</label>
                            <input
                              type="text"
                              value={product.category || "General"}
                              onChange={(e) => setProduct({ ...product, category: e.target.value })}
                              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                            />
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#0a3d52] pb-2 cursor-pointer">
                              <input type="checkbox" checked={Boolean(product.featured)} onChange={(e) => setProduct({ ...product, featured: e.target.checked })} />
                              Featured
                            </label>
                          </div>
                          <div className="flex items-end">
                            <label className="flex items-center gap-2 text-xs font-bold text-[#0a3d52] pb-2 cursor-pointer">
                              <input type="checkbox" checked={product.active !== false} onChange={(e) => setProduct({ ...product, active: e.target.checked })} />
                              Active / Visible
                            </label>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {[0, 1, 2].map((idx) => (
                            <div key={idx}>
                              <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Extra image {idx + 1}</label>
                              <input
                                type="text"
                                value={(product.extraImages && product.extraImages[idx]) || ""}
                                onChange={(e) => {
                                  const extra = [...(product.extraImages || ["", "", ""])];
                                  extra[idx] = e.target.value;
                                  setProduct({ ...product, extraImages: extra });
                                }}
                                placeholder="Image URL"
                                className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
                              />
                            </div>
                          ))}
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

            {/* ================= TAB 8: PARTNER SUBMISSIONS ================= */}
            {activeTab === 8 && (
              <TabWrapper3D tabKey={8}>
                <div className="space-y-5">
                  <div>
                    <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Partner Product Submissions</h2>
                    <p className="text-xs text-[#565e69]">Subowner catalog submissions awaiting admin review / publish</p>
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
                          <div className="flex justify-between items-center mb-1.5 gap-2">
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#f5f7fa] text-[#565e69] font-subheading">
                              {item.status}
                            </span>
                            {item.hasAdminUnread ? (
                              <span className="text-[10px] font-black uppercase text-rose-600">Unread</span>
                            ) : null}
                          </div>
                          <h4 className="text-sm font-bold text-[#0a3d52] font-heading">{item.name || "Untitled product"}</h4>
                          <p className="text-xs text-[#565e69] mt-1 line-clamp-3">{item.description || item.comment || "No description"}</p>
                          <p className="text-xs font-bold text-[#0a3d52] mt-2">PKR {Number(item.price || 0).toLocaleString()} · Stock {item.stock ?? 0}</p>
                        </div>
                        <div className="pt-2 border-t border-[#e0e6ed] flex items-center justify-between gap-2">
                          <span className="text-[11px] text-[#565e69]">
                            By: <span className="text-[#0a3d52] font-bold">{item.submittedBy?.name || item.userId?.name || "Partner"}</span>
                          </span>
                          <Link to={`/admin/review/${item._id}`} className="text-xs font-bold text-[#ff6b4a] hover:underline">
                            Open review
                          </Link>
                        </div>
                      </TiltCard3D>
                    ))}
                    {!reviewItems.length && (
                      <div className="col-span-full py-12 text-center text-[#565e69] font-bold border border-dashed border-[#e0e6ed] rounded-2xl bg-white">
                        No partner submissions yet.
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
