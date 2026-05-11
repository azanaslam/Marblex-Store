import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Tooltip,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from "../auth/session";
import { UserSupportChat } from "../components/UserSupportChat";
import { ListSkeleton } from "../components/LoaderSkeleton";

const STATUS_COLOR = {
  pending: "warning",
  looking: "info",
  edit: "secondary",
  published: "success",
  rejected: "error",
};

const emptySubmission = { name: "", imageUrl: "", description: "", price: "", stock: "", category: "General", comment: "" };
const CART_KEY = "marblex_cart";

export const UserDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState("broadcasts");
  const [broadcasts, setBroadcasts] = useState([]);
  const [floatingBroadcasts, setFloatingBroadcasts] = useState([]);
  const [supportUnread, setSupportUnread] = useState(0);
  const [profile, setProfile] = useState({ name: "", phone: "", avatarUrl: "", gender: "prefer_not_to_say" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [submission, setSubmission] = useState(emptySubmission);
  const [submissions, setSubmissions] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });
  const [myOrders, setMyOrders] = useState([]);
  const [ordersWithUpdate, setOrdersWithUpdate] = useState(new Set());
  const [loadingBroadcasts, setLoadingBroadcasts] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [currentUser, setCurrentUser] = useState(getAuthUser());
  const lastBroadcastTopIdRef = useRef("");
  const user = currentUser;
  const token = getAuthToken();
  const isSubowner = user?.role === "subowner";
  const currentTab = isSubowner ? tab : tab;

  const showToast = (severity, message) => setToast({ open: true, severity, message });
  const copyOrderId = async (id) => {
    try {
      await navigator.clipboard?.writeText(String(id || ""));
      showToast("success", `Order #${String(id || "").slice(-6).toUpperCase()} copied.`);
    } catch {
      showToast("error", "Unable to copy order ID.");
    }
  };
  const reorderItems = (order) => {
    const existing = (() => {
      try {
        const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    })();
    const incoming = (order.items || []).map((item) => ({
      productId: item.productId || `${order._id}-${item.name}`,
      name: item.name,
      price: item.price,
      quantity: Number(item.quantity) || 1,
      imageUrl: item.imageUrl || "",
    }));
    const merged = [...existing];
    incoming.forEach((inc) => {
      const idx = merged.findIndex((m) => String(m.productId) === String(inc.productId));
      if (idx >= 0) {
        merged[idx] = { ...merged[idx], quantity: Number(merged[idx].quantity || 0) + inc.quantity };
      } else {
        merged.push(inc);
      }
    });
    localStorage.setItem(CART_KEY, JSON.stringify(merged));
    showToast("success", "Items added to cart.");
    navigate("/cart");
  };

  const loadBroadcasts = async () => {
    setLoadingBroadcasts(true);
    try {
      const res = await http.get("/chat/broadcasts", authHeaders(token));
      const items = res.data || [];
      setBroadcasts(items);
      const topId = items[0]?._id || "";
      if (!lastBroadcastTopIdRef.current) {
        lastBroadcastTopIdRef.current = topId;
        setFloatingBroadcasts(items.slice(0, 2));
      } else if (topId && topId !== lastBroadcastTopIdRef.current) {
        lastBroadcastTopIdRef.current = topId;
        setFloatingBroadcasts(items.slice(0, 2));
      }
    } finally {
      setLoadingBroadcasts(false);
    }
  };

  const loadSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const res = await http.get("/product-reviews/mine", authHeaders(token));
      setSubmissions(res.data || []);
    } finally {
      setLoadingSubmissions(false);
    }
  };
  const loadMyOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await http.get("/orders/my", authHeaders(token));
      const newOrders = res.data || [];
      
      // Check for updates compared to last viewed statuses
      const lastStatuses = JSON.parse(localStorage.getItem("marblex_last_order_statuses") || "{}");
      const updatedIds = new Set();
      
      newOrders.forEach(order => {
        if (lastStatuses[order._id] && lastStatuses[order._id] !== order.orderStatus) {
          updatedIds.add(order._id);
        }
      });
      
      setOrdersWithUpdate(updatedIds);
      setMyOrders(newOrders);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (!token) return;
    loadBroadcasts().catch(() => {});
    const t = setInterval(() => {
      loadBroadcasts().catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    if (!floatingBroadcasts.length) return;
    const id = setTimeout(() => setFloatingBroadcasts([]), 3000);
    return () => clearTimeout(id);
  }, [floatingBroadcasts]);

  useEffect(() => {
    if (!token) return;
    const n = location.state?.chatUnread;
    if (typeof n === "number" && n > 0) {
      showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from support.`);
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate, token]);

  useEffect(() => {
    const incomingTab = location.state?.dashboardTab;
    if (typeof incomingTab === "number") {
      if (isSubowner) {
        const map = { 0: "broadcasts", 1: "create", 2: "review", 3: "chat", 4: "profile" };
        setTab(map[incomingTab] || "broadcasts");
      } else {
        setTab(incomingTab === 3 ? "chat" : "orders");
      }
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate, isSubowner]);

  useEffect(() => {
    const subownerTabs = new Set(["broadcasts", "create", "review", "chat", "profile"]);
    const userTabs = new Set(["broadcasts", "orders", "chat", "profile"]);
    if (isSubowner && !subownerTabs.has(tab)) {
      setTab("broadcasts");
      return;
    }
    if (!isSubowner && !userTabs.has(tab)) {
      setTab("orders");
    }

    // Clear notifications when user views orders tab
    if (!isSubowner && tab === "orders" && ordersWithUpdate.size > 0) {
      const currentStatuses = {};
      myOrders.forEach(o => {
        currentStatuses[o._id] = o.orderStatus;
      });
      localStorage.setItem("marblex_last_order_statuses", JSON.stringify(currentStatuses));
      setOrdersWithUpdate(new Set());
    }
  }, [isSubowner, tab, ordersWithUpdate.size, myOrders]);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    http.get("/auth/me", h).then((res) => {
      setCurrentUser({
        id: res.data?._id || res.data?.id,
        name: res.data?.name || "",
        email: res.data?.email || "",
        role: res.data?.role || "user",
        isAccessGranted: res.data?.isAccessGranted !== false,
        avatarUrl: res.data?.avatarUrl || "",
        phone: res.data?.phone || "",
        gender: res.data?.gender || "prefer_not_to_say",
      });
      setProfile({
        name: res.data?.name || "",
        phone: res.data?.phone || "",
        avatarUrl: res.data?.avatarUrl || "",
        gender: res.data?.gender || "prefer_not_to_say",
      });
      if (!lastBroadcastTopIdRef.current) {
        lastBroadcastTopIdRef.current = "";
      }
    });
    if (isSubowner) {
      loadSubmissions().catch(() => {});
    } else {
      loadMyOrders().catch(() => {});
    }
    const loadUnread = () =>
      http.get("/chat/unread-count", h).then((r) => setSupportUnread(Number(r.data?.count) || 0)).catch(() => {});
    loadUnread();
    const id = setInterval(loadUnread, 20000);
    return () => clearInterval(id);
  }, [token, isSubowner]);

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const saveProfile = async () => {
    const res = await http.put("/auth/me", profile, authHeaders(token));
    const updated = { ...(getAuthUser() || {}), ...res.data, id: res.data._id || res.data.id };
    setAuthSession({ token, user: updated });
    setCurrentUser(updated);
    setIsEditingProfile(false);
    showToast("success", "Profile updated.");
  };

  const onProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, avatarUrl: String(reader.result || "") }));
      showToast("success", "Profile image selected.");
    };
    reader.readAsDataURL(file);
  };

  const submitForReview = async () => {
    await http.post(
      "/product-reviews/submit",
      {
        ...submission,
        price: Number(submission.price || 0),
        stock: Number(submission.stock || 0),
      },
      authHeaders(token)
    );
    setSubmission(emptySubmission);
    await loadSubmissions();
    showToast("success", "Product sent to admin review.");
    setTab("review");
  };

  const onProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubmission((p) => ({ ...p, imageUrl: String(reader.result || "") }));
      showToast("success", "Product image selected.");
    };
    reader.readAsDataURL(file);
  };

  const statusSummary = useMemo(
    () => ({
      pending: submissions.filter((x) => x.status === "pending").length,
      published: submissions.filter((x) => x.status === "published").length,
      requiresAttention: submissions.filter((x) => x.hasSubownerUnread).length,
    }),
    [submissions]
  );

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Profile Section */}
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-5">
          {profile.avatarUrl ? (
            <img 
              src={profile.avatarUrl} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full object-cover shadow-lg shadow-slate-900/20 border-2 border-white bg-slate-100"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-slate-900/20 border-2 border-white">
              {(profile.name || user?.name || "U").charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isSubowner ? "Subowner Dashboard" : "User Dashboard"}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              {user?.name} <span className="text-slate-300 mx-1">|</span> {user?.email}
            </p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="px-6 py-2.5 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold rounded-xl transition-all border border-red-100 hover:border-red-600 shadow-sm"
        >
          Logout
        </button>
      </div>

      {/* Broadcast Alerts */}
      {!!floatingBroadcasts.length && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-rose-600 font-bold px-2">
            <CampaignOutlinedIcon fontSize="small" />
            <span>Live Announcements</span>
          </div>
          <div className="space-y-2">
            {floatingBroadcasts.map((b) => (
              <div key={b._id} className="bg-blue-50 border border-blue-100 text-blue-800 px-5 py-4 rounded-2xl shadow-sm">
                <p className="font-medium">{b.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs Navigation */}
      <div className="flex flex-wrap gap-2 pb-2 border-b border-slate-200">
        {isSubowner ? (
          <>
            <button 
              onClick={() => setTab("broadcasts")} 
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "broadcasts" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Broadcasts <span className="ml-1 opacity-70">({broadcasts.length})</span>
            </button>
            <button 
              onClick={() => setTab("create")} 
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "create" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Create Product
            </button>
            <button 
              onClick={() => setTab("review")} 
              className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "review" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Review Queue <span className="ml-1 opacity-70">({statusSummary.pending})</span>
              {statusSummary.requiresAttention > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
              )}
            </button>
            <button 
              onClick={() => setTab("chat")} 
              className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "chat" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Support Chat
              {supportUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                  {supportUnread > 99 ? '99+' : supportUnread}
                </span>
              )}
            </button>
            <button 
              onClick={() => setTab("profile")} 
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "profile" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              My Profile
            </button>
          </>
        ) : (
          <>
            <button 
              onClick={() => setTab("broadcasts")} 
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "broadcasts" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Broadcasts <span className="ml-1 opacity-70">({broadcasts.length})</span>
            </button>
            <button 
              onClick={() => setTab("orders")} 
              className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "orders" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              My Orders <span className="ml-1 opacity-70">({myOrders.length})</span>
              {ordersWithUpdate.size > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 border-2 border-white rounded-full animate-pulse shadow-sm"></span>
              )}
            </button>
            <button 
              onClick={() => setTab("chat")} 
              className={`relative px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "chat" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              Support Chat
              {supportUnread > 0 && (
                <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm">
                  {supportUnread > 99 ? '99+' : supportUnread}
                </span>
              )}
            </button>
            <button 
              onClick={() => setTab("profile")} 
              className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${currentTab === "profile" ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
            >
              My Profile
            </button>
          </>
        )}
      </div>

      {/* Tab Content Area */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 min-h-[500px]">
      
        {/* User - Orders Tab */}
        {!isSubowner && currentTab === "orders" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Order History</h2>
            {loadingOrders ? (
              <ListSkeleton />
            ) : !myOrders.length ? (
              <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                You haven't placed any orders yet.
              </div>
            ) : (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div key={order._id} className={`group bg-white border ${ordersWithUpdate.has(order._id) ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200'} rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300`}>
                  {ordersWithUpdate.has(order._id) && (
                    <div className="bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest py-1 text-center">
                      Order Status Updated
                    </div>
                  )}
                  {/* Order Header */}
                  <div className="bg-slate-50/80 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                        <ShoppingCartCheckoutRoundedIcon className="text-slate-400" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">Order #{String(order._id || "").slice(-6).toUpperCase()}</h3>
                          <button 
                            onClick={() => copyOrderId(order._id)}
                            className="p-1 text-slate-400 hover:text-slate-900 transition-colors"
                            title="Copy Order ID"
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                          </button>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                          {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider border shadow-sm ${
                        order.paymentStatus === 'paid' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-amber-50 text-amber-600 border-amber-100'
                      }`}>
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>
                  
                  {/* Order Body - Items */}
                  <div className="p-6 space-y-6">
                    <div className="flex flex-col gap-4">
                      {(order.items || []).map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-slate-50/40 border border-slate-100/50">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-white border border-slate-100 flex-shrink-0">
                            <img 
                              src={item.imageUrl || "https://placehold.co/100x100/e2e8f0/475569?text=Product"} 
                              alt={item.name} 
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = "https://placehold.co/100x100/e2e8f0/475569?text=Product"}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 truncate">{item.name}</h4>
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mt-0.5">
                              Qty: {item.quantity} <span className="mx-1">×</span> PKR {item.price}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-black text-slate-900">PKR {item.quantity * item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Delivery Channel</p>
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-sm font-bold border border-slate-200 capitalize">
                            {order.channel || "Standard Shipping"}
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-900 rounded-3xl p-6 text-white shadow-xl shadow-slate-900/10 flex flex-col justify-between h-full">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                          <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Amount</p>
                          <p className="text-2xl font-black">PKR {order.subtotal}</p>
                        </div>
                        <button 
                          onClick={() => reorderItems(order)}
                          className="w-full py-3 bg-white hover:bg-rose-500 text-slate-900 hover:text-white font-black rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-lg group-hover:scale-[1.02]"
                        >
                          <ShoppingCartCheckoutRoundedIcon sx={{ fontSize: 18 }} />
                          REORDER ITEMS
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Broadcasts Tab (Both User & Subowner) */}
        {currentTab === "broadcasts" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Broadcasts</h2>
            {loadingBroadcasts ? (
              <ListSkeleton />
            ) : !broadcasts.length ? (
              <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                No broadcasts received yet.
              </div>
            ) : (
            <div className="space-y-4">
              {broadcasts.map((b) => (
                <div key={b._id} className="bg-blue-50 border border-blue-100 p-5 rounded-2xl">
                  <p className="text-blue-900 font-medium whitespace-pre-wrap">{b.message}</p>
                  <p className="text-blue-600/70 text-xs font-bold mt-3 uppercase tracking-wider">{new Date(b.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Subowner - Create Product Tab */}
        {isSubowner && currentTab === "create" && (
          <div className="space-y-8">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Submit Product for Review</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-5">
                <TextField fullWidth label="Product Name" value={submission.name} onChange={(e) => setSubmission((p) => ({ ...p, name: e.target.value }))} />
                <TextField fullWidth label="Image URL" value={submission.imageUrl} onChange={(e) => setSubmission((p) => ({ ...p, imageUrl: e.target.value }))} />
                
                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Button variant="outlined" component="label" sx={{ borderRadius: 3, px: 3, py: 1.5, textTransform: 'none', fontWeight: 700 }}>
                    <CloudUploadOutlinedIcon sx={{ mr: 1 }} /> Upload Image
                    <input hidden accept="image/*" type="file" onChange={onProductImageUpload} />
                  </Button>
                  <span className="text-xs text-slate-500 font-medium bg-slate-50 px-3 py-2 rounded-xl border border-slate-100">
                    PNG/JPG/WEBP supported.
                  </span>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <TextField fullWidth label="Category" value={submission.category} onChange={(e) => setSubmission((p) => ({ ...p, category: e.target.value }))} />
                  <TextField fullWidth label="Price (PKR)" type="number" inputProps={{ min: 0 }} value={submission.price} onChange={(e) => setSubmission((p) => ({ ...p, price: e.target.value }))} />
                  <TextField fullWidth label="Stock" type="number" inputProps={{ min: 0 }} value={submission.stock} onChange={(e) => setSubmission((p) => ({ ...p, stock: e.target.value }))} />
                </div>
                
                <TextField fullWidth label="Description" multiline minRows={3} value={submission.description} onChange={(e) => setSubmission((p) => ({ ...p, description: e.target.value }))} />
                <TextField fullWidth label="Comment to Admin" multiline minRows={2} helperText="Explain why this product should be added." value={submission.comment} onChange={(e) => setSubmission((p) => ({ ...p, comment: e.target.value }))} />
                
                <div className="pt-4">
                  <button 
                    onClick={submitForReview}
                    className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2"
                  >
                    <SendRoundedIcon sx={{ fontSize: 20 }} /> Submit for Admin Review
                  </button>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="sticky top-6 border border-slate-200 rounded-3xl p-5 bg-slate-50/50">
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Live Preview</h3>
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
                    <div className="aspect-[4/3] bg-slate-100 flex items-center justify-center">
                      <img 
                        src={submission.imageUrl || "https://placehold.co/400x300/e2e8f0/475569?text=No+Image"} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        onError={(e) => e.target.src = "https://placehold.co/400x300/e2e8f0/475569?text=Invalid+Image"}
                      />
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-slate-900 text-lg leading-tight line-clamp-1">{submission.name || "Product Name"}</h4>
                      <p className="text-sm text-slate-500 mt-1 line-clamp-2">{submission.description || "Brief product description will appear here..."}</p>
                      <div className="mt-3 flex justify-between items-end">
                        <p className="text-rose-600 font-black text-lg">PKR {submission.price || "0"}</p>
                        <p className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-md">Stock: {submission.stock || "0"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subowner - Review Queue Tab */}
        {isSubowner && currentTab === "review" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Review Queue</h2>
              <span className="bg-slate-100 text-slate-700 font-bold px-3 py-1 rounded-lg text-sm border border-slate-200">
                Total: {submissions.length}
              </span>
            </div>
            
            {loadingSubmissions ? (
              <ListSkeleton />
            ) : !submissions.length ? (
              <div className="py-12 text-center text-slate-500 font-medium border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                You haven't submitted any products for review.
              </div>
            ) : (
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {submissions.map((item) => (
                <div 
                  key={item._id} 
                  onClick={() => navigate(`/dashboard/review/${item._id}`)}
                  className="group relative cursor-pointer border border-slate-200 hover:border-slate-300 rounded-2xl p-4 transition-all hover:shadow-lg hover:shadow-slate-200/50 bg-white flex gap-4"
                >
                  {item.hasSubownerUnread && (
                    <span className="absolute -top-2 -right-2 bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black shadow-sm flex items-center gap-1 border-2 border-white">
                      Updates
                    </span>
                  )}
                  <img 
                    src={item.imageUrl || "https://placehold.co/100x100/e2e8f0/475569?text=No+Img"} 
                    alt={item.name} 
                    className="w-24 h-24 object-cover rounded-xl bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <h3 className="font-bold text-slate-900 leading-tight truncate">{item.name}</h3>
                        <span className={`flex-shrink-0 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                          item.status === 'published' ? 'bg-emerald-100 text-emerald-700' :
                          item.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          item.status === 'edit' ? 'bg-purple-100 text-purple-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-600">PKR {item.price} <span className="text-slate-300 mx-1">|</span> Qty: {item.stock}</p>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      <span className="text-xs font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                        {(item.comments || []).length} Comments
                      </span>
                      <span className="text-xs font-bold text-blue-600 group-hover:underline">View Details →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

        {/* Chat Tab */}
        {currentTab === "chat" && (
          <div className="-mx-2 -my-2 sm:mx-0 sm:my-0">
            <UserSupportChat token={token} showToast={showToast} />
          </div>
        )}

        {/* Profile Tab (Both User & Subowner) */}
        {currentTab === "profile" && (
          <div className="max-w-3xl mx-auto space-y-6 pt-4">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Profile Settings</h2>
              {!isEditingProfile ? (
                <button 
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
                >
                  <EditOutlinedIcon sx={{ fontSize: 18 }} /> Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={() => setIsEditingProfile(false)}
                    className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={saveProfile}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-colors shadow-md shadow-slate-900/20"
                  >
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="bg-slate-50/50 border border-slate-200 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-indigo-500/20 flex-shrink-0 overflow-hidden border-4 border-white">
                  {profile.avatarUrl ? (
                    <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    (profile.name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="text-center md:text-left space-y-2 flex-1">
                  <h3 className="text-2xl font-black text-slate-900">{profile.name || "Not specified"}</h3>
                  <p className="text-slate-500 font-medium">{user?.email}</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200">
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Phone Number</p>
                      <p className="font-medium text-slate-800">{profile.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gender</p>
                      <p className="font-medium text-slate-800 capitalize">{profile.gender === "prefer_not_to_say" ? "Prefer not to say" : profile.gender}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <div className="w-32 flex-shrink-0 flex flex-col items-center gap-3">
                    <div className="w-24 h-24 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-black overflow-hidden border-4 border-slate-50 shadow-inner">
                      {profile.avatarUrl ? (
                        <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        (profile.name || "U").charAt(0).toUpperCase()
                      )}
                    </div>
                    <Button variant="outlined" component="label" size="small" sx={{ borderRadius: 2, fontSize: '0.75rem', fontWeight: 700, textTransform: 'none' }}>
                      Change Photo
                      <input hidden accept="image/*" type="file" onChange={onProfileImageUpload} />
                    </Button>
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <TextField fullWidth label="Full Name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                    <TextField fullWidth label="Phone Number" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                    <TextField fullWidth label="Avatar Image URL (Optional)" value={profile.avatarUrl} onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))} />
                    <TextField select fullWidth label="Gender" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </TextField>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
