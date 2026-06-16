import { useCallback, useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Paper,
  LinearProgress,
  Snackbar,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ChatRoundedIcon from "@mui/icons-material/ChatRounded";
import { AdminBroadcastTab } from "../components/AdminBroadcastTab";
import { AdminMessengerTab } from "../components/AdminMessengerTab";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser } from "../auth/session";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import { Drawer } from "@mui/material";
import { AdminOverviewSkeleton } from "../components/LoaderSkeleton";

export const AdminPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [token, setToken] = useState(getAuthToken());
  const [activeTab, setActiveTab] = useState(0);
  const [selectedChatUserId, setSelectedChatUserId] = useState(null);
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
  const [roleChangeDialog, setRoleChangeDialog] = useState({ open: false, user: null, role: "" });
  const [contactRequests, setContactRequests] = useState([]);
  const [replyDialog, setReplyDialog] = useState({ open: false, request: null, reply: "" });
  const [emailConfig, setEmailConfig] = useState({ user: "", pass: "" });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [statusConfirmDialog, setStatusConfirmDialog] = useState({ open: false, order: null, newStatus: "" });
  const [isSaving, setIsSaving] = useState(false);

  const showToast = (type, message) => setToast({ open: true, type, message });
  const copyOrderId = async (id) => {
    const shortId = String(id || "").slice(-6).toUpperCase();
    if (!shortId) return;
    try {
      await navigator.clipboard?.writeText(String(id));
      showToast("success", `Order ID ${shortId} copied.`);
    } catch {
      showToast("error", "Unable to copy order ID.");
    }
  };

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    const headers = authHeaders(token);
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
    setBlogs(blogsRes.data);
    setWebsiteData(websiteRes.data);
    setWhatsappData(whatsappRes.data);
    setUsersData(usersRes.data);
    setProducts(productsRes.data || []);
    setReviewItems(reviewRes.data || []);
    setContactRequests(contactRes.data || []);
    setEmailConfig(emailRes.data || { user: "", pass: "" });
    const orders = allOrdersRes.data?.orders || [];
    setOrderLookup({ q: "", all: orders, filtered: orders });
  }, [token]);

  useEffect(() => {
    loadDashboardData().catch(() => showToast("error", "Failed to load admin dashboard data."));
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
      showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from users. Open the Chats tab.`);
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
    setOverview(null);
    setBlogs([]);
    setWebsiteData({ totalOrders: 0, totalAmount: 0, orders: [] });
    setWhatsappData({ totalOrders: 0, totalAmount: 0, orders: [] });
    setUsersData({ totalUsers: 0, users: [] });
    setProducts([]);
    setEditingProductId("");
    setEditingBlogId("");
    navigate("/login", { replace: true });
  };

  const resetProductForm = () => {
    setProduct({ name: "", imageUrl: "", extraImages: ["", "", ""], description: "", price: 0, stock: 0 });
    setEditingProductId("");
  };

  const saveProduct = async () => {
    if (!product.imageUrl?.trim()) {
      showToast("error", "Please add image URL or upload an image.");
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
      showToast("success", editingProductId ? "Product updated successfully." : "Product saved successfully.");
    } catch (err) {
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
      showToast("success", `${file.name} selected successfully.`);
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
  };

  const deleteProductItem = async (id) => {
    await http.delete(`/products/${id}`, authHeaders(token));
    await loadDashboardData();
    if (editingProductId === id) {
      resetProductForm();
    }
    showToast("success", "Product deleted successfully.");
  };

  const handleBlogImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setBlog((prev) => ({ ...prev, coverImage: String(reader.result || "") }));
      showToast("success", `${file.name} selected successfully.`);
    };
    reader.readAsDataURL(file);
  };

  const resetBlogForm = () => {
    setBlog({ title: "", coverImage: "", content: "", tags: "", published: true });
    setEditingBlogId("");
  };

  const refreshBlogs = async () => {
    const res = await http.get("/admin/blogs", authHeaders(token));
    setBlogs(res.data);
  };

  const saveBlog = async () => {
    const payload = {
      ...blog,
      tags: blog.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    setIsSaving(true);
    try {
      if (editingBlogId) {
        await http.put(`/blogs/${editingBlogId}`, payload, authHeaders(token));
      } else {
        await http.post("/blogs", payload, authHeaders(token));
      }

      await refreshBlogs();
      resetBlogForm();
      showToast("success", editingBlogId ? "Blog updated successfully." : "Blog created successfully.");
    } catch (err) {
      showToast("error", "Failed to save blog article.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditBlog = (blogItem) => {
    setEditingBlogId(blogItem._id);
    setBlog({
      title: blogItem.title || "",
      coverImage: blogItem.coverImage || "",
      content: blogItem.content || "",
      tags: Array.isArray(blogItem.tags) ? blogItem.tags.join(", ") : "",
      published: Boolean(blogItem.published),
    });
  };

  const togglePublish = async (blogItem) => {
    await http.put(
      `/blogs/${blogItem._id}`,
      { published: !blogItem.published },
      authHeaders(token)
    );
    await refreshBlogs();
    showToast("success", blogItem.published ? "Blog unpublished." : "Blog published.");
  };

  const deleteBlog = async (id) => {
    await http.delete(`/blogs/${id}`, authHeaders(token));
    if (editingBlogId === id) resetBlogForm();
    await refreshBlogs();
    showToast("success", "Blog deleted.");
  };

  const handleToggleBlockUser = async (user) => {
    await http.patch(`/admin/users/${user._id}/block`, { isBlocked: !user.isBlocked }, authHeaders(token));
    const res = await http.get("/admin/users", authHeaders(token));
    setUsersData(res.data);
    showToast("success", user.isBlocked ? "User unblocked." : "User blocked.");
  };

  const userCanLogin = (user) =>
    user.role === "admin" || user.isAccessGranted === true || user.isAccessGranted === undefined;

  const handleToggleUserAccess = async (user) => {
    if (user.role === "admin") return;
    const nextGranted = !userCanLogin(user);
    await http.patch(`/admin/users/${user._id}/access`, { isAccessGranted: nextGranted }, authHeaders(token));
    const res = await http.get("/admin/users", authHeaders(token));
    setUsersData(res.data);
    showToast("success", nextGranted ? "User approved — they can log in now." : "Login access revoked.");
  };
  const handleUpdateUserRole = async (user, role) => {
    if (!role || user.role === "admin" || user.role === role) return;
    await http.patch(`/admin/users/${user._id}/role`, { role }, authHeaders(token));
    const res = await http.get("/admin/users", authHeaders(token));
    setUsersData(res.data);
    showToast("success", `${user.name || "User"} role updated to ${role}.`);
  };
  const askRoleChangeConfirm = (user, role) => {
    if (!role || user.role === "admin" || user.role === role) return;
    setRoleChangeDialog({ open: true, user, role });
  };
  const confirmRoleChange = async () => {
    if (!roleChangeDialog.user || !roleChangeDialog.role) return;
    await handleUpdateUserRole(roleChangeDialog.user, roleChangeDialog.role);
    setRoleChangeDialog({ open: false, user: null, role: "" });
  };

  const filterOrderLookup = (query, allOrders) => {
    const q = String(query || "").trim().toLowerCase();
    if (!q) return allOrders;
    return allOrders.filter((order) => {
      const shortId = String(order._id || "").slice(-6).toLowerCase();
      return shortId.includes(q) || String(order._id || "").toLowerCase().includes(q);
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
        const message = `Hello ${order.customerName}! Your order #${String(order._id).slice(-6).toUpperCase()} status has been updated to: ${newStatus.toUpperCase()}. Thank you for shopping with us!`;
        await http.post(`/admin/chat/thread/${order.userId}`, { body: message }, authHeaders(token));
        showToast("success", "Status updated and message sent to user.");
      } else {
        showToast("success", `Order status updated to ${newStatus}`);
      }
      
      setStatusConfirmDialog({ open: false, order: null, newStatus: "" });
      loadDashboardData();
    } catch (err) {
      showToast("error", "Failed to update order status");
    }
  };

  const handleUpdatePaymentStatus = async (orderId, newStatus) => {
    try {
      await http.patch(`/admin/orders/${orderId}/payment`, { paymentStatus: newStatus }, authHeaders(token));
      showToast("success", `Payment status updated to ${newStatus}`);
      loadDashboardData();
    } catch (err) {
      showToast("error", "Failed to update payment status");
    }
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const authUser = getAuthUser();
  if (authUser?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    { label: "Total Sales", value: `PKR ${overview?.totalRevenue || 0}`, icon: "💰", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
    { label: "Total Orders", value: overview?.orderCount || 0, icon: "📦", color: "bg-blue-50 text-blue-600 border-blue-100" },
    { label: "Web Orders", value: overview?.websiteOrders || 0, icon: "🌐", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
    { label: "WhatsApp", value: overview?.whatsappOrders || 0, icon: "📱", color: "bg-green-50 text-green-600 border-green-100" },
    { label: "Paid Orders", value: overview?.paidOrdersCount || 0, icon: "✅", color: "bg-rose-50 text-rose-600 border-rose-100" },
    { label: "Customers", value: overview?.uniqueCustomers || 0, icon: "👥", color: "bg-amber-50 text-amber-600 border-amber-100" },
  ];
  const totalOrders = overview?.orderCount || 0;
  const websiteOrders = overview?.websiteOrders || 0;
  const whatsappOrders = overview?.whatsappOrders || 0;
  const paidOrders = overview?.paidOrdersCount || 0;
  const websiteShare = totalOrders ? Math.round((websiteOrders / totalOrders) * 100) : 0;
  const whatsappShare = totalOrders ? Math.round((whatsappOrders / totalOrders) * 100) : 0;
  const paidShare = totalOrders ? Math.round((paidOrders / totalOrders) * 100) : 0;
  const pendingShare = 100 - paidShare;
  const blockedUsersCount = usersData.users.filter((user) => user.isBlocked).length;
  const activeUsersCount = usersData.totalUsers - blockedUsersCount;
  const adminsCount = usersData.users.filter((user) => user.role === "admin").length;
  const pendingAccessCount = usersData.users.filter(
    (user) => user.role === "user" && user.isAccessGranted === false
  ).length;
  const visualBars = [
    { label: "Mon", value: 45 },
    { label: "Tue", value: 62 },
    { label: "Wed", value: 38 },
    { label: "Thu", value: 71 },
    { label: "Fri", value: 52 },
    { label: "Sat", value: 84 },
    { label: "Sun", value: 66 },
  ];
  const productImagesCount = products.filter((item) => item.imageUrl).length;
  const reviewQueue = reviewItems.filter((item) => item.status !== "published");
  const adminUnreadReviews = reviewQueue.filter((item) => item.hasAdminUnread).length;

  const renderCompactOrderTable = (orders) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-100">
            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Order ID</th>
            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
            <th className="py-4 px-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
              <td className="py-4 px-4">
                <span className="text-xs font-mono font-bold text-slate-400 group-hover:text-rose-600 transition-colors">
                  #{String(order._id).slice(-6).toUpperCase()}
                </span>
              </td>
              <td className="py-4 px-4">
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-slate-900">{order.customerName}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{order.channel}</span>
                </div>
              </td>
              <td className="py-4 px-4 text-sm font-black text-slate-900">PKR {order.subtotal?.toLocaleString()}</td>
              <td className="py-4 px-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                    {order.paymentStatus}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                    {order.orderStatus || 'pending'}
                  </span>
                </div>
              </td>
              <td className="py-4 px-4 text-right">
                <button 
                  onClick={() => {
                    if (order.channel === 'website') setActiveTab(1);
                    else setActiveTab(2);
                  }}
                  className="text-[10px] font-black text-rose-600 hover:underline"
                >
                  View Full
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!orders.length && (
        <div className="py-12 text-center text-slate-400 font-medium">No recent orders.</div>
      )}
    </div>
  );

  const renderOrderList = (orders) => (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order._id} className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300">
          <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">{order.customerName}</h3>
              <p className="text-sm text-slate-500 font-medium mt-1">Email: {order.email} <span className="text-slate-300 mx-2">|</span> Phone: {order.phone}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button 
                onClick={() => copyOrderId(order._id)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 transition-colors tooltip text-xs font-bold font-mono tracking-wide"
                title="Click to copy full ID"
              >
                <ContentCopyRoundedIcon sx={{ fontSize: 14 }} /> #{String(order._id || "").slice(-6).toUpperCase()}
              </button>
              
              <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                <select 
                  value={order.paymentStatus || 'pending'}
                  onChange={(e) => handleUpdatePaymentStatus(order._id, e.target.value)}
                  className={`text-[10px] font-black uppercase px-2 py-1.5 rounded-lg border-0 bg-transparent focus:ring-0 cursor-pointer ${order.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}`}
                >
                  <option value="pending">Pending Pay</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                </select>
                <div className="w-px h-4 bg-slate-200"></div>
                <select 
                  value={order.orderStatus || 'pending'}
                  onChange={(e) => handleUpdateOrderStatus(order, e.target.value)}
                  className="text-[10px] font-black uppercase px-2 py-1.5 rounded-lg border-0 bg-transparent focus:ring-0 cursor-pointer text-slate-600"
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="on the way">On the Way</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="bg-slate-900 text-white font-black px-4 py-2 rounded-xl shadow-lg shadow-slate-900/10">
                PKR {order.subtotal?.toLocaleString()}
              </div>
            </div>
          </div>
          
          <div className="border-t border-slate-100 pt-4 space-y-2">
            {order.items.map((item, idx) => (
              <div key={`${order._id}-${idx}`} className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <img 
                  src={item.imageUrl || "https://placehold.co/100x100/e2e8f0/475569?text=Img"} 
                  alt={item.name} 
                  className="w-16 h-16 object-cover rounded-xl bg-white border border-slate-200 shadow-sm flex-shrink-0"
                />
                <div>
                  <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                  <p className="text-xs font-bold text-slate-500 mt-1">
                    Qty: <span className="text-slate-700">{item.quantity}</span> <span className="mx-1.5 text-slate-300">|</span> 
                    Unit: <span className="text-slate-700">PKR {item.price?.toLocaleString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      {!orders.length && (
        <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50">
          No orders found.
        </div>
      )}
    </div>
  );

  const navItems = [
    { id: 0, label: "Overview", icon: "📊" },
    { id: 1, label: "Website Orders", icon: "🌐" },
    { id: 2, label: "WhatsApp Orders", icon: "📱" },
    { id: 3, label: "Users", icon: "👥" },
    { id: 4, label: "Products", icon: "🛍️" },
    { id: 5, label: "Blogs", icon: "📝" },
    { id: 6, label: "Chats", icon: "💬", badge: chatUnreadTotal },
    { id: 7, label: "Broadcast", icon: "📢" },
    { id: 8, label: "Product Review", icon: "⭐", badge: adminUnreadReviews },
    { id: 9, label: "Order Lookup", icon: "🔍" },
    { id: 10, label: "Inquiries", icon: "📧" },
    { id: 11, label: "Email Settings", icon: "⚙️" },
  ];

  const navGroups = [
    { title: "Main", items: [0] },
    { title: "Sales", items: [1, 2, 9] },
    { title: "Inventory", items: [4, 8] },
    { title: "Content", items: [5] },
    { title: "Communicate", items: [6, 7, 10] },
    { title: "Admin", items: [3, 11] },
  ];

  const NavContent = () => (
    <div className="flex flex-col space-y-6">
      {navGroups.map((group) => (
        <div key={group.title} className="space-y-2">
          <h4 className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-[2px]">{group.title}</h4>
          <div className="space-y-1">
            {group.items.map((id) => {
              const item = navItems.find((n) => n.id === id);
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-left font-bold transition-all duration-200 ${
                    activeTab === item.id
                      ? "bg-rose-600 text-white shadow-lg shadow-rose-600/20"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm">{item.label}</span>
                  </div>
                  {item.badge > 0 && (
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${activeTab === item.id ? "bg-white text-rose-600" : "bg-rose-500 text-white"}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="pb-10 min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-[1600px] mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-600"
            >
              <MenuIcon />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <span className="hidden sm:inline">Admin</span> Dashboard
                <span className="text-[10px] bg-rose-100 text-rose-600 px-2 py-0.5 rounded-md uppercase font-black">PRO</span>
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={logout}
              className="flex items-center gap-2 text-slate-500 hover:text-rose-600 px-3 py-2 rounded-xl font-bold transition-all text-sm"
            >
              <LogoutIcon fontSize="small" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Desktop Sidebar */}
          <div className="hidden md:block w-64 lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-xl shadow-slate-200/40 sticky top-24">
              <NavContent />
            </div>
          </div>

          {/* Mobile Drawer */}
          <Drawer 
            anchor="left" 
            open={mobileMenuOpen} 
            onClose={() => setMobileMenuOpen(false)}
            PaperProps={{ sx: { width: '280px', p: 3, bgcolor: '#fff' } }}
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-black text-slate-900">Marblex <span className="text-rose-600">Admin</span></h2>
              <button onClick={() => setMobileMenuOpen(false)} className="p-2 rounded-lg bg-slate-100 text-slate-600">
                <CloseIcon />
              </button>
            </div>
            <NavContent />
          </Drawer>

          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            {activeTab === 11 && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-2">Email Configuration</h3>
                  <p className="text-slate-500 mb-8 font-medium">Configure the email account used for replying to "About Us" inquiries.</p>
                  
                  <div className="max-w-md space-y-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">SMTP Email (Gmail)</label>
                      <TextField 
                        fullWidth 
                        placeholder="Sales@themarflexgroup.com" 
                        value={emailConfig.user}
                        onChange={(e) => setEmailConfig({ ...emailConfig, user: e.target.value })}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">App Password</label>
                      <TextField 
                        fullWidth 
                        type="password"
                        placeholder="xxxx xxxx xxxx xxxx" 
                        value={emailConfig.pass}
                        onChange={(e) => setEmailConfig({ ...emailConfig, pass: e.target.value })}
                        variant="outlined"
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
                        helperText="Use a Gmail App Password, not your regular password."
                      />
                    </div>
                    <Button 
                      variant="contained" 
                      onClick={async () => {
                        try {
                          await http.post("/admin/email-settings", emailConfig, authHeaders(token));
                          showToast("success", "Email settings saved successfully!");
                        } catch (err) {
                          showToast("error", "Failed to save email settings.");
                        }
                      }}
                      sx={{ bgcolor: 'slate-900', fontWeight: 800, px: 6, py: 1.5, borderRadius: 3, textTransform: 'none' }}
                    >
                      Save Configuration
                    </Button>
                  </div>

                  <div className="mt-12 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                    <h4 className="text-blue-900 font-bold mb-2">How to get an App Password?</h4>
                    <ol className="text-sm text-blue-800 space-y-2 list-decimal ml-4">
                      <li>Go to your Google Account settings.</li>
                      <li>Select <strong>Security</strong>.</li>
                      <li>Under "How you sign in to Google," select <strong>2-Step Verification</strong>.</li>
                      <li>At the bottom of the page, select <strong>App passwords</strong>.</li>
                      <li>Enter a name (e.g., "Marblex Store") and select <strong>Create</strong>.</li>
                      <li>Copy the 16-character code and paste it above.</li>
                    </ol>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 10 && (
              <div className="space-y-6">
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6">About Us & Contact Inquiries</h3>
                  <div className="space-y-4">
                    {contactRequests.map((req) => (
                      <div key={req._id} className="bg-slate-50 border border-slate-100 rounded-2xl p-6 transition-all hover:shadow-md">
                        <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                          <div>
                            <h4 className="text-lg font-bold text-slate-900">{req.name}</h4>
                            <p className="text-sm text-slate-500 font-medium">
                              {req.email} <span className="mx-2 text-slate-300">|</span> {req.phone}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-xs font-black uppercase px-2 py-1 rounded-md border ${req.status === 'responded' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'}`}>
                              {req.status}
                            </span>
                            <span className="text-xs font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-lg">
                              {new Date(req.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-white p-4 rounded-xl border border-slate-100 mb-4">
                          <p className="text-slate-700 leading-relaxed font-medium">
                            {req.message}
                          </p>
                        </div>
                        
                        {req.reply && (
                          <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4">
                            <p className="text-xs font-black text-blue-600 uppercase mb-1">Our Reply (${new Date(req.repliedAt).toLocaleDateString()}):</p>
                            <p className="text-slate-700 font-medium italic">{req.reply}</p>
                          </div>
                        )}

                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => setReplyDialog({ open: true, request: req, reply: req.reply || "" })}
                            className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
                          >
                            {req.reply ? "Update Reply" : "Reply to User"}
                          </button>
                          <button 
                            onClick={async () => {
                              await http.delete(`/contact/${req._id}`, authHeaders(token));
                              setContactRequests(contactRequests.filter(r => r._id !== req._id));
                              showToast("success", "Inquiry deleted.");
                            }}
                            className="text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors"
                          >
                            <DeleteIcon fontSize="small" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {!contactRequests.length && (
                      <div className="py-20 text-center text-slate-400 font-medium border-2 border-dashed border-slate-100 rounded-3xl">
                        No inquiries found.
                      </div>
                    )}
                  </div>
                </div>

                {/* Reply Dialog */}
                <Dialog open={replyDialog.open} onClose={() => setReplyDialog({ ...replyDialog, open: false })} fullWidth maxWidth="sm">
                  <DialogTitle sx={{ fontWeight: 900 }}>Reply to Inquiry</DialogTitle>
                  <DialogContent>
                    <DialogContentText sx={{ mb: 2, fontWeight: 500 }}>
                      Send a reply to {replyDialog.request?.name} ({replyDialog.request?.email}). This will be sent as an email.
                    </DialogContentText>
                    <TextField
                      autoFocus
                      multiline
                      rows={5}
                      fullWidth
                      variant="outlined"
                      label="Your Message"
                      value={replyDialog.reply}
                      onChange={(e) => setReplyDialog({ ...replyDialog, reply: e.target.value })}
                    />
                  </DialogContent>
                  <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setReplyDialog({ ...replyDialog, open: false })} sx={{ fontWeight: 700 }}>Cancel</Button>
                    <Button 
                      onClick={async () => {
                        try {
                          await http.post(`/contact/${replyDialog.request._id}/reply`, { reply: replyDialog.reply }, authHeaders(token));
                          showToast("success", "Reply sent successfully!");
                          setReplyDialog({ open: false, request: null, reply: "" });
                          loadDashboardData();
                        } catch (err) {
                          showToast("error", "Failed to send reply.");
                        }
                      }}
                      variant="contained" 
                      sx={{ bgcolor: 'slate.900', fontWeight: 700, px: 3, borderRadius: 2 }}
                    >
                      Send Reply
                    </Button>
                  </DialogActions>
                </Dialog>
              </div>
            )}

            {activeTab === 0 && (
              !overview ? (
                <AdminOverviewSkeleton />
              ) : (
                <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {stats.map((item) => (
                  <div key={item.label} className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
                    <div className={`w-8 h-8 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl ${item.color} flex items-center justify-center text-lg sm:text-2xl mb-3 sm:mb-6 border transition-transform group-hover:scale-110`}>
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-widest mb-1 sm:mb-2">{item.label}</p>
                      <h3 className="text-sm sm:text-2xl font-black text-slate-900 truncate">{item.value}</h3>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Trend */}
                <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-1">Revenue Trend</h3>
                  <p className="text-sm text-slate-500 font-medium mb-8">Weekly traffic style analytics view</p>
                  
                  <div className="flex items-end justify-between h-56 gap-3 mt-auto pt-4">
                    {visualBars.map((bar) => (
                      <div key={bar.label} className="flex flex-col items-center justify-end flex-1 h-full group">
                        <div 
                          className={`w-full rounded-xl transition-all duration-500 ${bar.label === 'Sat' ? 'bg-gradient-to-t from-rose-600 to-rose-400 group-hover:from-rose-500 group-hover:to-rose-300' : 'bg-gradient-to-t from-slate-800 to-slate-700 group-hover:from-slate-700 group-hover:to-slate-600'}`}
                          style={{ height: `${bar.value}%` }}
                        />
                        <span className="text-xs font-bold text-slate-400 mt-3">{bar.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Order Flow Breakdown */}
                <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                  <h3 className="text-xl font-extrabold text-slate-900 mb-6">Order Flow Breakdown</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">Website Orders</span>
                        <span className="text-sm font-black text-slate-900">{websiteShare}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-slate-900 h-2.5 rounded-full" style={{ width: `${websiteShare}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">WhatsApp Orders</span>
                        <span className="text-sm font-black text-rose-600">{whatsappShare}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-rose-500 h-2.5 rounded-full" style={{ width: `${whatsappShare}%` }}></div>
                      </div>
                    </div>
                    
                    <hr className="border-slate-100 my-2" />
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">Paid Conversion</span>
                        <span className="text-sm font-black text-emerald-600">{paidShare}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-emerald-500 h-2.5 rounded-full" style={{ width: `${paidShare}%` }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-600">Pending Conversion</span>
                        <span className="text-sm font-black text-amber-500">{pendingShare}%</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2.5">
                        <div className="bg-amber-400 h-2.5 rounded-full" style={{ width: `${pendingShare}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-extrabold text-slate-900">Recent Orders</h3>
                  <button onClick={() => setActiveTab(1)} className="text-xs font-bold text-rose-600 hover:underline">View All Website Orders</button>
                </div>
                {renderCompactOrderTable(overview?.recentOrders || [])}
              </div>
            </div>
          )
        )}

          {activeTab === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl shadow-xl shadow-slate-900/10 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-slate-400 font-bold tracking-wide uppercase text-xs mb-2">Website Orders</p>
                    <h2 className="text-4xl sm:text-5xl font-black mb-2">{websiteData.totalOrders}</h2>
                    <p className="text-slate-300 text-sm font-medium">Total orders from website checkout</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>
                </div>
                
                <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-8 rounded-3xl shadow-xl shadow-rose-600/20 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-rose-200 font-bold tracking-wide uppercase text-xs mb-2">Website Sales</p>
                    <h2 className="text-3xl sm:text-4xl font-black mb-2">PKR {websiteData.totalAmount?.toLocaleString()}</h2>
                    <p className="text-rose-100 text-sm font-medium">Revenue generated via Stripe orders</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">Website Orders Directory</h3>
                {renderOrderList(websiteData.orders)}
              </div>
            </div>
          )}

          {activeTab === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-600 to-emerald-500 p-8 rounded-3xl shadow-xl shadow-emerald-600/20 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-emerald-200 font-bold tracking-wide uppercase text-xs mb-2">WhatsApp Orders</p>
                    <h2 className="text-4xl sm:text-5xl font-black mb-2">{whatsappData.totalOrders}</h2>
                    <p className="text-emerald-100 text-sm font-medium">Orders received through WhatsApp</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
                
                <div className="bg-gradient-to-br from-amber-500 to-amber-400 p-8 rounded-3xl shadow-xl shadow-amber-500/20 text-white relative overflow-hidden">
                  <div className="relative z-10">
                    <p className="text-amber-100 font-bold tracking-wide uppercase text-xs mb-2">WhatsApp Sales</p>
                    <h2 className="text-3xl sm:text-4xl font-black mb-2">PKR {whatsappData.totalAmount?.toLocaleString()}</h2>
                    <p className="text-amber-50 text-sm font-medium">Revenue from WhatsApp confirmed orders</p>
                  </div>
                  <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                </div>
              </div>
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
                <h3 className="text-xl font-extrabold text-slate-900 mb-6">WhatsApp Orders Directory</h3>
                {renderOrderList(whatsappData.orders)}
              </div>
            </div>
          )}

          {activeTab === 3 && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-slate-900 to-blue-900 p-6 md:p-8 rounded-3xl text-white shadow-lg shadow-blue-900/20">
                  <p className="text-white/80 font-medium mb-1">Total Users</p>
                  <h3 className="text-4xl md:text-5xl font-extrabold">{usersData.totalUsers}</h3>
                </div>
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 p-6 md:p-8 rounded-3xl text-white shadow-lg shadow-orange-500/20">
                  <p className="text-white/80 font-medium mb-1">Pending approval</p>
                  <h3 className="text-4xl md:text-5xl font-extrabold">{pendingAccessCount}</h3>
                  <p className="text-white/80 text-xs mt-2 font-medium bg-black/10 inline-block px-2 py-1 rounded-md">Cannot log in until approved</p>
                </div>
                <div className="bg-gradient-to-br from-rose-600 to-red-500 p-6 md:p-8 rounded-3xl text-white shadow-lg shadow-rose-500/20">
                  <p className="text-white/80 font-medium mb-1">Blocked / Admins</p>
                  <h3 className="text-4xl md:text-5xl font-extrabold">{blockedUsersCount} <span className="text-white/50 text-3xl font-light">/</span> {adminsCount}</h3>
                  <p className="text-white/80 text-xs mt-2 font-medium bg-black/10 inline-block px-2 py-1 rounded-md">Active accounts: {activeUsersCount}</p>
                </div>
              </div>

              {/* Users List */}
              <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-xl font-extrabold text-slate-900">User Management</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse whitespace-nowrap">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="py-4 px-6 font-bold text-sm">User Details</th>
                        <th className="py-4 px-6 font-bold text-sm">Role</th>
                        <th className="py-4 px-6 font-bold text-sm">Status</th>
                        <th className="py-4 px-6 font-bold text-sm text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {usersData.users.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold shadow-md shadow-slate-900/20">
                                {(user.name || "U").charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 text-base">{user.name}</p>
                                <p className="text-sm text-slate-500">{user.email}</p>
                                <p className="text-xs text-slate-400 font-mono mt-0.5">ID: {String(user._id).slice(-8)}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {user.role === "admin" ? (
                              <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
                                Admin
                              </span>
                            ) : (
                              <select
                                className="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-xl focus:ring-rose-500 focus:border-rose-500 block w-32 p-2.5 font-semibold transition-colors hover:border-slate-300 cursor-pointer"
                                value={user.role || "user"}
                                onChange={(e) => askRoleChangeConfirm(user, e.target.value)}
                              >
                                <option value="user">User</option>
                                <option value="subowner">Subowner</option>
                              </select>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col gap-2 w-max">
                              {user.role === "admin" ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">Access: Always</span>
                              ) : user.isAccessGranted === false ? (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Access: Pending</span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Access: Approved</span>
                              )}
                              
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold border ${user.isBlocked ? 'bg-red-50 text-red-700 border-red-200' : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                State: {user.isBlocked ? "Blocked" : "Active"}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex justify-end items-center gap-2">
                              <button 
                                onClick={() => {
                                  setSelectedChatUserId(user._id);
                                  setActiveTab(6);
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm"
                                title="Open chat"
                              >
                                <ChatRoundedIcon sx={{ fontSize: 16 }} />
                                Chat
                              </button>
                              
                              {user.role !== "admin" && (
                                <>
                                  <button
                                    onClick={() => handleToggleUserAccess(user)}
                                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border ${user.isAccessGranted === false ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:text-slate-900'}`}
                                  >
                                    {userCanLogin(user) ? "Revoke" : "Approve"}
                                  </button>
                                  <button
                                    onClick={() => handleToggleBlockUser(user)}
                                    className={`px-3 py-2 text-xs font-bold rounded-xl transition-all shadow-sm border ${user.isBlocked ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white'}`}
                                  >
                                    {user.isBlocked ? "Unblock" : "Block"}
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {usersData.users.length === 0 && (
                    <div className="p-10 text-center text-slate-500 font-medium">No users found.</div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 4 && (
            <div className="space-y-8">
              {/* Add/Edit Product Form */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  {editingProductId ? "Edit Product" : "Add New Product"}
                </h2>
                <div className="space-y-5">
                  <TextField fullWidth label="Product Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                  <TextField
                    fullWidth
                    label="Main Image URL"
                    helperText="Paste an image URL or upload one from your computer."
                    value={product.imageUrl}
                    onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                  />
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Button variant="outlined" component="label" sx={{ borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Upload Main Image
                      <input hidden accept="image/*" type="file" onChange={handleProductImageUpload} />
                    </Button>
                    <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      JPG, PNG, WEBP supported. Uploading auto-fills the image URL field.
                    </span>
                  </div>
                  {product.imageUrl && (
                    <div className="mt-2">
                      <img
                        src={product.imageUrl}
                        alt="Product preview"
                        className="w-32 h-24 object-cover rounded-xl shadow-sm border border-slate-200 bg-slate-50"
                      />
                    </div>
                  )}

                  <div className="mt-4 border-t border-slate-100 pt-4">
                    <h4 className="text-sm font-bold text-slate-900 mb-3">Extra Images (Optional - Up to 3)</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {[0, 1, 2].map((idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <TextField
                            size="small"
                            label={`Extra Image ${idx + 1} URL`}
                            value={product.extraImages ? product.extraImages[idx] : ""}
                            onChange={(e) => {
                              const newExtra = [...(product.extraImages || ["", "", ""])];
                              newExtra[idx] = e.target.value;
                              setProduct({ ...product, extraImages: newExtra });
                            }}
                          />
                          <Button variant="outlined" size="small" component="label" sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}>
                            Upload Image
                            <input hidden accept="image/*" type="file" onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const newExtra = [...(product.extraImages || ["", "", ""])];
                                newExtra[idx] = String(reader.result || "");
                                setProduct({ ...product, extraImages: newExtra });
                                showToast("success", `Extra image ${idx + 1} selected.`);
                              };
                              reader.readAsDataURL(file);
                            }} />
                          </Button>
                          {product.extraImages && product.extraImages[idx] && (
                            <img
                              src={product.extraImages[idx]}
                              alt={`Extra ${idx + 1}`}
                              className="w-full h-20 object-cover rounded-xl shadow-sm border border-slate-200 bg-slate-50"
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <TextField fullWidth label="Description" multiline minRows={2} value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <TextField
                      fullWidth
                      label="Price (PKR)"
                      type="number"
                      value={product.price}
                      onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                    />
                    <TextField
                      fullWidth
                      label="Stock Quantity"
                      type="number"
                      value={product.stock}
                      onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <button 
                      onClick={saveProduct}
                      disabled={isSaving}
                      className="px-8 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                    >
                      {isSaving ? "Saving..." : (editingProductId ? "Update Product" : "Save Product")}
                    </button>
                    {editingProductId && (
                      <button 
                        onClick={resetProductForm}
                        className="px-6 py-3 text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Product List */}
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-slate-100 pb-4">
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Product Inventory
                  </h2>
                  <span className="bg-rose-50 text-rose-700 font-bold px-3 py-1 rounded-lg text-sm border border-rose-100">
                    Total Products: {products.length}
                  </span>
                </div>
                
                {products.length === 0 ? (
                  <div className="text-center py-16 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                    No products added yet. Start by adding one above.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((item) => (
                      <div key={item._id} className="group flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 hover:border-slate-300 transition-all duration-300">
                        <div 
                          className="relative aspect-video overflow-hidden bg-slate-100 cursor-pointer"
                          onClick={() => {
                            startEditProduct(item);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <img
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-5 flex-1 flex flex-col">
                          <h3 className="font-bold text-slate-900 text-lg leading-tight mb-1 line-clamp-2" title={item.name}>
                            {item.name}
                          </h3>
                          <div className="mt-1 flex items-center gap-2 mb-4">
                            <span className="text-rose-600 font-black">PKR {item.price}</span>
                            <span className="text-slate-300">|</span>
                            <span className="text-slate-500 text-sm font-medium">Stock: {item.stock}</span>
                          </div>
                          
                          <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                            <button
                              onClick={() => startEditProduct(item)}
                              className="flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors"
                            >
                              <EditOutlinedIcon sx={{ fontSize: 16 }} /> Edit
                            </button>
                            <button
                              onClick={() => deleteProductItem(item._id)}
                              className="flex items-center justify-center gap-1.5 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors"
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 5 && (
            <div className="flex flex-col xl:flex-row gap-6">
              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  {editingBlogId ? "Edit Blog" : "Create Blog"}
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Title</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" value={blog.title} onChange={(e) => setBlog({ ...blog, title: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Cover Image URL</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" value={blog.coverImage} onChange={(e) => setBlog({ ...blog, coverImage: e.target.value })} placeholder="https://example.com/image.jpg" />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                    <Button variant="outlined" component="label" sx={{ borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 700, whiteSpace: 'nowrap' }}>
                      Upload Cover Image
                      <input hidden accept="image/*" type="file" onChange={handleBlogImageUpload} />
                    </Button>
                    <span className="text-[10px] text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                      Auto-fills the URL field. JPG, PNG, WEBP.
                    </span>
                  </div>
                  {blog.coverImage && (
                    <div className="mt-2">
                      <img
                        src={blog.coverImage}
                        alt="Blog cover preview"
                        className="w-full h-48 object-cover rounded-2xl shadow-sm border border-slate-200 bg-slate-50"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Tags (comma separated)</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all" value={blog.tags} onChange={(e) => setBlog({ ...blog, tags: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Blog Content</label>
                    <textarea rows="5" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all resize-y" value={blog.content} onChange={(e) => setBlog({ ...blog, content: e.target.value })}></textarea>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 pt-4">
                    <button
                      onClick={() => setBlog({ ...blog, published: !blog.published })}
                      className={`w-full sm:w-auto px-5 py-3 rounded-xl font-bold transition-colors border ${blog.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {blog.published ? "Status: Published" : "Status: Draft (Hidden)"}
                    </button>
                    <div className="flex-1"></div>
                    <div className="flex gap-3">
                      {editingBlogId && (
                        <button onClick={resetBlogForm} className="px-6 py-3 text-slate-600 hover:text-slate-900 font-bold bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors">
                          Cancel
                        </button>
                      )}
                      <button 
                        onClick={saveBlog} 
                        disabled={isSaving}
                        className="px-8 py-3 bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 text-white rounded-xl font-bold shadow-md shadow-rose-600/20 transition-all hover:-translate-y-0.5 disabled:opacity-50"
                      >
                        {isSaving ? "Processing..." : (editingBlogId ? "Update Blog" : "Save Blog")}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
                  Published & Draft Blogs
                </h2>
                <div className="space-y-4">
                  {blogs.map((item) => (
                    <div key={item._id} className="flex flex-col p-4 rounded-2xl border border-slate-100 bg-slate-50 hover:bg-white hover:shadow-lg hover:shadow-slate-200/40 hover:border-slate-200 transition-all duration-300 gap-4 group">
                      <div className="flex gap-4">
                        <img src={item.coverImage || "https://placehold.co/100x100/e2e8f0/475569?text=Blog"} alt={item.title} className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl border border-slate-200 bg-white" />
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-rose-600 transition-colors line-clamp-2 mb-2">{item.title}</h3>
                          <span className={`inline-block px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${item.published ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                            {item.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
                        <button onClick={() => { startEditBlog(item); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 py-2 text-sm font-bold text-blue-600 bg-blue-50 hover:bg-blue-600 hover:text-white rounded-xl transition-colors">
                          Edit
                        </button>
                        <button onClick={() => togglePublish(item)} className="flex-1 py-2 text-sm font-bold text-amber-600 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-xl transition-colors">
                          {item.published ? "Unpublish" : "Publish"}
                        </button>
                        <button onClick={() => deleteBlog(item._id)} className="flex-1 py-2 text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-600 hover:text-white rounded-xl transition-colors">
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                  {blogs.length === 0 && (
                    <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                      No blogs created yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 6 && (
            <Box sx={{ p: { xs: 0, sm: 0.5 } }}>
              <AdminMessengerTab 
                token={token} 
                showToast={showToast} 
                initialUserId={selectedChatUserId}
                onUserSelected={(id) => setSelectedChatUserId(id)}
              />
            </Box>
          )}

          {activeTab === 7 && <AdminBroadcastTab token={token} showToast={showToast} />}
          {activeTab === 8 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">Product Review Queue</h2>
                <span className="bg-amber-50 text-amber-700 font-bold px-4 py-1.5 rounded-xl text-sm border border-amber-200">Pending Reviews: {reviewQueue.length}</span>
              </div>
              
              {!reviewQueue.length ? (
                <div className="text-center py-16 px-4 border-2 border-dashed border-slate-200 rounded-3xl bg-slate-50/50 text-slate-500 font-medium">
                  <div className="text-4xl mb-4">✨</div>
                  No product review submissions pending.
                </div>
              ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {reviewQueue.map((item) => (
                    <div 
                      key={item._id} 
                      onClick={() => navigate(`/admin/review/${item._id}`)}
                      className="relative flex flex-col sm:flex-row gap-5 p-5 rounded-3xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 hover:shadow-lg hover:shadow-slate-200/50 transition-all cursor-pointer group"
                    >
                      {item.hasAdminUnread && (
                        <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1 border-2 border-white z-10">
                          Updates
                        </span>
                      )}
                      <img
                        src={item.imageUrl || "https://placehold.co/200x200/e2e8f0/475569?text=Product"}
                        alt={item.name}
                        className="w-full sm:w-28 h-40 sm:h-28 rounded-2xl object-cover border border-slate-200 bg-slate-100 flex-shrink-0 group-hover:scale-[1.02] transition-transform"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2 mb-1.5">
                            <h3 className="font-extrabold text-slate-900 line-clamp-1 text-lg group-hover:text-blue-600 transition-colors">{item.name}</h3>
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-black uppercase rounded-lg tracking-wider border border-amber-200 shrink-0">
                              {item.status}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 font-bold mb-1">PKR {item.price?.toLocaleString()} <span className="mx-1.5 text-slate-300">|</span> Stock: {item.stock}</p>
                          <p className="text-xs text-slate-500 mb-3 truncate font-medium">By: <span className="font-bold">{item.submittedBy?.name || "Subowner"}</span> ({item.submittedBy?.email || "—"})</p>
                        </div>
                        
                        <div className="mt-auto flex justify-between items-center pt-3 border-t border-slate-100">
                          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-lg">
                            Comments: {(item.comments || []).length}
                          </span>
                          <span className="text-sm font-bold text-blue-600 group-hover:text-blue-700 flex items-center gap-1">
                            Review Details <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {activeTab === 9 && (
            <div className="space-y-6">
              <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
                <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mb-4 tracking-tight">Order Lookup</h2>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-slate-400" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Search by order shortcut ID (last 6 chars)..."
                    value={orderLookup.q}
                    onChange={(e) => setOrderLookupQuery(e.target.value)}
                  />
                </div>
              </div>

              {orderLookup.filtered.length > 0 && (
                <div className="space-y-4">
                  {orderLookup.filtered.map((order) => (
                    <div key={order._id} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
                        <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                          Order <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">#{String(order._id).slice(-6).toUpperCase()}</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{order.channel}</span>
                        </h3>
                        <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border ${order.paymentStatus === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-4">
                        <p className="text-sm text-slate-700 font-medium mb-1"><span className="text-slate-400 mr-2 font-bold">Customer:</span> {order.customerName}</p>
                        <p className="text-sm text-slate-700 font-medium"><span className="text-slate-400 mr-2 font-bold">Contact:</span> {order.email} <span className="mx-2 text-slate-300">|</span> {order.phone}</p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Items</p>
                        <div className="flex flex-wrap gap-2">
                          {(order.items || []).map((i, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 text-sm font-bold px-3 py-1.5 rounded-xl border border-slate-200">
                              {i.name} <span className="text-slate-400 ml-1">x{i.quantity}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.type}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
      <Dialog open={statusConfirmDialog.open} onClose={() => setStatusConfirmDialog({ open: false, order: null, newStatus: "" })}>
        <DialogTitle sx={{ fontWeight: 900 }}>Confirm Status Update</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            You are changing the status of order <strong>#{String(statusConfirmDialog.order?._id).slice(-6).toUpperCase()}</strong> to <strong>{statusConfirmDialog.newStatus?.toUpperCase()}</strong>.
          </DialogContentText>
          <DialogContentText>
            Would you like to send an automatic notification message to the customer via support chat?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={() => confirmUpdateStatus(false)} color="inherit" sx={{ fontWeight: 700 }}>
            Update Only
          </Button>
          <Button onClick={() => confirmUpdateStatus(true)} variant="contained" color="primary" sx={{ fontWeight: 800 }}>
            Update & Send Message
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={roleChangeDialog.open} onClose={() => setRoleChangeDialog({ open: false, user: null, role: "" })}>
        <DialogTitle>Confirm role change</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Change role for {roleChangeDialog.user?.name || "this user"} to {roleChangeDialog.role}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleChangeDialog({ open: false, user: null, role: "" })}>Cancel</Button>
          <Button variant="contained" onClick={confirmRoleChange}>Confirm</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
