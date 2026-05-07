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
  Grid,
  List,
  ListItem,
  ListItemText,
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
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteIcon from "@mui/icons-material/Delete";
import LogoutIcon from "@mui/icons-material/Logout";
import { AdminBroadcastTab } from "../components/AdminBroadcastTab";
import { AdminMessengerTab } from "../components/AdminMessengerTab";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser } from "../auth/session";

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
  const [product, setProduct] = useState({ name: "", imageUrl: "", description: "", price: 0, stock: 0 });
  const [editingProductId, setEditingProductId] = useState("");
  const [blogs, setBlogs] = useState([]);
  const [blog, setBlog] = useState({ title: "", coverImage: "", content: "", tags: "", published: true });
  const [editingBlogId, setEditingBlogId] = useState("");
  const [reviewItems, setReviewItems] = useState([]);
  const [orderLookup, setOrderLookup] = useState({ q: "", all: [], filtered: [] });
  const [toast, setToast] = useState({ open: false, type: "success", message: "" });

  const showToast = (type, message) => setToast({ open: true, type, message });

  const loadDashboardData = useCallback(async () => {
    if (!token) return;
    const headers = authHeaders(token);
    const [overviewRes, blogsRes, websiteRes, whatsappRes, usersRes, productsRes, reviewRes, allOrdersRes] = await Promise.all([
      http.get("/admin/overview", headers),
      http.get("/admin/blogs", headers),
      http.get("/admin/orders/website", headers),
      http.get("/admin/orders/whatsapp", headers),
      http.get("/admin/users", headers),
      http.get("/products"),
      http.get("/product-reviews/admin/list", headers),
      http.get("/admin/orders/all", headers),
    ]);

    setOverview(overviewRes.data);
    setBlogs(blogsRes.data);
    setWebsiteData(websiteRes.data);
    setWhatsappData(whatsappRes.data);
    setUsersData(usersRes.data);
    setProducts(productsRes.data || []);
    setReviewItems(reviewRes.data || []);
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
    setProduct({ name: "", imageUrl: "", description: "", price: 0, stock: 0 });
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

    if (editingProductId) {
      await http.put(`/products/${editingProductId}`, product, authHeaders(token));
    } else {
      await http.post("/products", product, authHeaders(token));
    }

    resetProductForm();
    await loadDashboardData();
    showToast("success", editingProductId ? "Product updated successfully." : "Product saved successfully.");
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

    if (editingBlogId) {
      await http.put(`/blogs/${editingBlogId}`, payload, authHeaders(token));
    } else {
      await http.post("/blogs", payload, authHeaders(token));
    }

    await refreshBlogs();
    resetBlogForm();
    showToast("success", editingBlogId ? "Blog updated successfully." : "Blog created successfully.");
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

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const authUser = getAuthUser();
  if (authUser?.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  const stats = [
    { label: "Total Sales", value: `PKR ${overview?.totalRevenue || 0}` },
    { label: "Total Orders", value: overview?.orderCount || 0 },
    { label: "Stripe Website Orders", value: overview?.websiteOrders || 0 },
    { label: "WhatsApp Orders", value: overview?.whatsappOrders || 0 },
    { label: "Paid Orders", value: overview?.paidOrdersCount || 0 },
    { label: "Unique Customers", value: overview?.uniqueCustomers || 0 },
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

  const renderOrderList = (orders) => (
    <Stack spacing={1.5}>
      {orders.map((order) => (
        <Card
          key={order._id}
          variant="outlined"
          sx={{
            borderRadius: 2,
            border: "1px solid #e5e7eb",
            boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
            overflow: "hidden",
            transition: "all .22s ease",
            "&:hover": {
              boxShadow: "0 10px 24px rgba(15, 23, 42, 0.09)",
              borderColor: "#d1d5db",
            },
          }}
        >
          <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
            <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={1} mb={1.2}>
              <Typography fontWeight={800} sx={{ fontSize: { xs: 16, md: 17 } }}>
                {order.customerName}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography fontWeight={800}>PKR {order.subtotal}</Typography>
                <Chip
                  size="small"
                  label={order.paymentStatus}
                  color={order.paymentStatus === "paid" ? "success" : "warning"}
                  variant={order.paymentStatus === "paid" ? "filled" : "outlined"}
                />
              </Stack>
            </Stack>
            <Typography variant="body2" color="text.secondary" mb={1.5}>
              Email: {order.email} | Phone: {order.phone}
            </Typography>
            <Divider sx={{ mb: 1.3 }} />
            <Stack spacing={1}>
              {order.items.map((item, idx) => (
                <Stack
                  key={`${order._id}-${idx}`}
                  direction="row"
                  spacing={1.4}
                  alignItems="center"
                  sx={{
                    p: 1.1,
                    borderRadius: 1.5,
                    bgcolor: "#f8fafc",
                    border: "1px solid #edf1f5",
                  }}
                >
                  <Avatar
                    variant="rounded"
                    src={item.imageUrl || ""}
                    alt={item.name}
                    sx={{ width: 52, height: 52, bgcolor: "#eef2f7" }}
                  />
                  <Stack spacing={0.2}>
                    <Typography variant="body2" fontWeight={700}>
                      {item.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Qty: {item.quantity} | Unit: PKR {item.price}
                    </Typography>
                  </Stack>
                </Stack>
              ))}
            </Stack>
          </CardContent>
        </Card>
      ))}
      {!orders.length && (
        <Paper sx={{ p: 2, borderRadius: 2.5 }}>
          <Typography color="text.secondary">No orders found.</Typography>
        </Paper>
      )}
    </Stack>
  );

  return (
    <Box sx={{ pb: 2 }}>
      <Paper sx={{ p: 2, borderRadius: 3, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5} alignItems={{ sm: "center" }}>
          <Typography variant="h4" fontWeight={800}>
            Admin Dashboard
          </Typography>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper sx={{ borderRadius: 3, p: 1.2 }}>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              orientation="vertical"
              variant="scrollable"
              sx={{ display: { xs: "none", md: "flex" } }}
            >
              <Tab label="Overview" />
              <Tab label="Website Orders" />
              <Tab label="WhatsApp Orders" />
              <Tab label="Users" />
              <Tab label="Products" />
              <Tab label="Blogs" />
              <Tab
                label={
                  <Badge color="error" badgeContent={chatUnreadTotal} max={99} invisible={chatUnreadTotal === 0}>
                    <Typography component="span" variant="inherit">
                      Chats
                    </Typography>
                  </Badge>
                }
              />
              <Tab label="Broadcast" />
              <Tab label="Product Review" />
              <Tab label="Order Lookup" />
            </Tabs>
            <Button
              fullWidth
              color="error"
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                mt: 1.5,
                display: { xs: "none", md: "inline-flex" },
                borderRadius: 2,
                py: 1,
                fontWeight: 700,
              }}
            >
              Logout
            </Button>
            <Tabs
              value={activeTab}
              onChange={(_, newValue) => setActiveTab(newValue)}
              variant="scrollable"
              allowScrollButtonsMobile
              sx={{ display: { xs: "flex", md: "none" } }}
            >
              <Tab label="Overview" />
              <Tab label="Website" />
              <Tab label="WhatsApp" />
              <Tab label="Users" />
              <Tab label="Products" />
              <Tab label="Blogs" />
              <Tab
                label={
                  <Badge color="error" badgeContent={chatUnreadTotal} max={99} invisible={chatUnreadTotal === 0}>
                    <Typography component="span" variant="inherit">
                      Chats
                    </Typography>
                  </Badge>
                }
              />
              <Tab label="Broadcast" />
              <Tab label="Review" />
              <Tab label="Lookup" />
            </Tabs>
            <Button
              fullWidth
              color="error"
              variant="contained"
              startIcon={<LogoutIcon />}
              onClick={logout}
              sx={{
                mt: 1.5,
                display: { xs: "inline-flex", md: "none" },
                borderRadius: 2,
                py: 1,
                fontWeight: 700,
              }}
            >
              Logout
            </Button>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 9 }}>
          {activeTab === 0 && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                {stats.map((item) => (
                  <Grid key={item.label} size={{ xs: 12, sm: 6 }}>
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        border: "1px solid #ececec",
                        background:
                          "linear-gradient(160deg, rgba(255,255,255,1) 0%, rgba(250,250,250,1) 100%)",
                      }}
                    >
                      <Typography color="text.secondary" variant="body2">
                        {item.label}
                      </Typography>
                      <Typography variant="h6" fontWeight={800}>
                        {item.value}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, lg: 7 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #ececec" }}>
                    <Typography variant="h6" fontWeight={700} mb={0.5}>
                      Revenue Trend
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                      Weekly traffic style analytics view
                    </Typography>
                    <Stack direction="row" alignItems="flex-end" spacing={1.2} sx={{ height: 170 }}>
                      {visualBars.map((bar) => (
                        <Stack key={bar.label} alignItems="center" justifyContent="flex-end" sx={{ flex: 1, height: "100%" }}>
                          <Box
                            sx={{
                              width: "100%",
                              height: `${bar.value}%`,
                              borderRadius: 1.5,
                              background:
                                bar.label === "Sat"
                                  ? "linear-gradient(180deg, #e53935 0%, #b71c1c 100%)"
                                  : "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
                              transition: "all .25s ease",
                            }}
                          />
                          <Typography variant="caption" color="text.secondary" mt={0.8}>
                            {bar.label}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, lg: 5 }}>
                  <Paper sx={{ p: 2.5, borderRadius: 2.5, border: "1px solid #ececec" }}>
                    <Typography variant="h6" fontWeight={700} mb={1.4}>
                      Order Flow Breakdown
                    </Typography>
                    <Stack spacing={1.2}>
                      <Typography variant="body2" color="text.secondary">
                        Website Orders ({websiteShare}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={websiteShare}
                        sx={{ height: 10, borderRadius: 10, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#111827" } }}
                      />
                      <Typography variant="body2" color="text.secondary" mt={0.5}>
                        WhatsApp Orders ({whatsappShare}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={whatsappShare}
                        sx={{ height: 10, borderRadius: 10, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#e53935" } }}
                      />
                      <Divider sx={{ my: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Paid Conversion ({paidShare}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={paidShare}
                        sx={{ height: 10, borderRadius: 10, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#16a34a" } }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        Pending Conversion ({pendingShare}%)
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={pendingShare}
                        sx={{ height: 10, borderRadius: 10, bgcolor: "#f1f5f9", "& .MuiLinearProgress-bar": { bgcolor: "#f59e0b" } }}
                      />
                    </Stack>
                  </Paper>
                </Grid>
              </Grid>
              <Paper sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Recent Orders
                </Typography>
                {renderOrderList(overview?.recentOrders || [])}
              </Paper>
            </Stack>
          )}

          {activeTab === 1 && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.28)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>Website Orders</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {websiteData.totalOrders}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
                      Total orders from website checkout
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "linear-gradient(135deg, #991b1b 0%, #ef4444 55%, #fb7185 100%)",
                      boxShadow: "0 10px 24px rgba(239, 68, 68, 0.28)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>Website Sales</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      PKR {websiteData.totalAmount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.74)" }}>
                      Revenue generated via Stripe orders
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              {renderOrderList(websiteData.orders)}
            </Stack>
          )}

          {activeTab === 2 && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "linear-gradient(135deg, #14532d 0%, #16a34a 55%, #22c55e 100%)",
                      boxShadow: "0 10px 24px rgba(22, 163, 74, 0.26)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>WhatsApp Orders</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {whatsappData.totalOrders}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.74)" }}>
                      Orders received through WhatsApp
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      border: "1px solid rgba(255,255,255,0.12)",
                      background: "linear-gradient(135deg, #78350f 0%, #f59e0b 55%, #fbbf24 100%)",
                      boxShadow: "0 10px 24px rgba(245, 158, 11, 0.28)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.82)" }}>WhatsApp Sales</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      PKR {whatsappData.totalAmount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.74)" }}>
                      Revenue from WhatsApp confirmed orders
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              {renderOrderList(whatsappData.orders)}
            </Stack>
          )}

          {activeTab === 3 && (
            <Stack spacing={2}>
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 100%)",
                      boxShadow: "0 10px 24px rgba(15, 23, 42, 0.2)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>Total Users</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {usersData.totalUsers}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      background: "linear-gradient(135deg, #9a3412 0%, #f97316 100%)",
                      boxShadow: "0 10px 24px rgba(249, 115, 22, 0.22)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>Pending approval</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {pendingAccessCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Cannot log in until approved
                    </Typography>
                  </Paper>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper
                    sx={{
                      p: 2.2,
                      borderRadius: 3,
                      color: "#fff",
                      background: "linear-gradient(135deg, #991b1b 0%, #ef4444 100%)",
                      boxShadow: "0 10px 24px rgba(239, 68, 68, 0.22)",
                    }}
                  >
                    <Typography sx={{ color: "rgba(255,255,255,0.85)" }}>Blocked / Admins</Typography>
                    <Typography variant="h5" fontWeight={900}>
                      {blockedUsersCount} / {adminsCount}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.8)" }}>
                      Active accounts: {activeUsersCount}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
              <TableContainer component={Paper} sx={{ borderRadius: 2, border: "1px solid #e5e7eb", overflow: "hidden" }}>
                <Table size="small">
                  <TableHead
                    sx={{
                      "& .MuiTableCell-root": {
                        fontWeight: 700,
                        color: "#fff",
                        bgcolor: "#0f172a",
                        py: 1.5,
                      },
                    }}
                  >
                    <TableRow>
                      <TableCell>User ID</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Login access</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usersData.users.map((user) => (
                      <TableRow
                        key={user._id}
                        sx={{
                          "&:nth-of-type(even)": { bgcolor: "#fafafa" },
                          "& .MuiTableCell-root": { py: 1.2, borderColor: "#eef2f7" },
                        }}
                      >
                        <TableCell sx={{ fontFamily: "monospace", fontSize: 12 }}>{user._id}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28, bgcolor: "#111827", fontSize: 12 }}>
                              {(user.name || "U").charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography fontWeight={600} variant="body2">
                              {user.name}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={user.role}
                            color={user.role === "admin" ? "warning" : "default"}
                            variant={user.role === "admin" ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell>
                          {user.role === "admin" ? (
                            <Chip size="small" label="Always" color="info" variant="outlined" />
                          ) : user.isAccessGranted === false ? (
                            <Chip size="small" label="Pending" color="warning" variant="filled" />
                          ) : (
                            <Chip size="small" label="Approved" color="success" variant="outlined" />
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={user.isBlocked ? "Blocked" : "Active"}
                            color={user.isBlocked ? "error" : "success"}
                            variant={user.isBlocked ? "filled" : "outlined"}
                          />
                        </TableCell>
                        <TableCell align="right">
                          {user.role !== "admin" && (
                            <Stack direction="row" spacing={0.75} justifyContent="flex-end" flexWrap="wrap" useFlexGap>
                              <Button
                                size="small"
                                variant={user.isAccessGranted === false ? "contained" : "outlined"}
                                color="success"
                                onClick={() => handleToggleUserAccess(user)}
                                sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700 }}
                              >
                                {userCanLogin(user) ? "Revoke access" : "Approve"}
                              </Button>
                              <Button
                                size="small"
                                variant={user.isBlocked ? "contained" : "outlined"}
                                color={user.isBlocked ? "success" : "error"}
                                onClick={() => handleToggleBlockUser(user)}
                                sx={{ borderRadius: 1.5, textTransform: "none", minWidth: 72, fontWeight: 700 }}
                              >
                                {user.isBlocked ? "Unblock" : "Block"}
                              </Button>
                            </Stack>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          {activeTab === 4 && (
            <Stack spacing={2}>
              <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} mb={2}>
                  {editingProductId ? "Edit Product" : "Add Product"}
                </Typography>
                <Stack spacing={1.5}>
                  <TextField label="Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
                  <TextField
                    label="Image URL"
                    helperText="You can paste URL or upload image from your computer."
                    value={product.imageUrl}
                    onChange={(e) => setProduct({ ...product, imageUrl: e.target.value })}
                  />
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2} alignItems={{ sm: "center" }}>
                    <Button variant="outlined" component="label">
                      Upload Image
                      <input hidden accept="image/*" type="file" onChange={handleProductImageUpload} />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      JPG, PNG, WEBP supported. Upload image to auto-fill image field.
                    </Typography>
                  </Stack>
                  {product.imageUrl ? (
                    <Box
                      component="img"
                      src={product.imageUrl}
                      alt="Product preview"
                      sx={{
                        width: 110,
                        height: 80,
                        borderRadius: 1.5,
                        objectFit: "cover",
                        border: "1px solid #e5e7eb",
                      }}
                    />
                  ) : null}
                  <TextField label="Description" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })} />
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Price"
                        type="number"
                        value={product.price}
                        onChange={(e) => setProduct({ ...product, price: Number(e.target.value) })}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <TextField
                        fullWidth
                        label="Stock"
                        type="number"
                        value={product.stock}
                        onChange={(e) => setProduct({ ...product, stock: Number(e.target.value) })}
                      />
                    </Grid>
                  </Grid>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1.2}>
                    <Button variant="contained" onClick={saveProduct}>
                      {editingProductId ? "Update Product" : "Save Product"}
                    </Button>
                    {editingProductId && (
                      <Button variant="outlined" onClick={resetProductForm}>
                        Cancel Edit
                      </Button>
                    )}
                  </Stack>
                </Stack>
              </Paper>

              <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  justifyContent="space-between"
                  alignItems={{ sm: "center" }}
                  spacing={1}
                  mb={2}
                >
                  <Typography variant="h6" fontWeight={700}>
                    Product Images
                  </Typography>
                  <Typography color="text.secondary">Total Images: {productImagesCount}</Typography>
                </Stack>
                <Grid container spacing={1.5}>
                  {products.map((item) => (
                    <Grid key={item._id} size={{ xs: 6, sm: 4, md: 3 }}>
                      <Paper
                        sx={{
                          p: 1,
                          borderRadius: 2,
                          border: "1px solid #e5e7eb",
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.8,
                        }}
                      >
                        <Box
                          component="img"
                          src={item.imageUrl}
                          alt={item.name}
                          sx={{
                            width: "100%",
                            height: 110,
                            objectFit: "cover",
                            borderRadius: 1.5,
                            bgcolor: "#f8fafc",
                          }}
                        />
                        <Typography variant="body2" fontWeight={700} noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          PKR {item.price} | Stock: {item.stock}
                        </Typography>
                        <Stack direction="row" spacing={1} mt="auto">
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<EditOutlinedIcon />}
                            onClick={() => startEditProduct(item)}
                            sx={{ flex: 1 }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => deleteProductItem(item._id)}
                            sx={{ flex: 1 }}
                          >
                            Delete
                          </Button>
                        </Stack>
                      </Paper>
                    </Grid>
                  ))}
                  {!products.length && (
                    <Grid size={{ xs: 12 }}>
                      <Typography color="text.secondary">No products added yet.</Typography>
                    </Grid>
                  )}
                </Grid>
              </Paper>
            </Stack>
          )}

          {activeTab === 5 && (
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={2}>
                    {editingBlogId ? "Edit Blog" : "Create Blog"}
                  </Typography>
                  <Stack spacing={1.5}>
                    <TextField label="Title" value={blog.title} onChange={(e) => setBlog({ ...blog, title: e.target.value })} />
                    <TextField label="Cover Image URL" value={blog.coverImage} onChange={(e) => setBlog({ ...blog, coverImage: e.target.value })} />
                    <TextField label="Tags comma separated" value={blog.tags} onChange={(e) => setBlog({ ...blog, tags: e.target.value })} />
                    <TextField label="Blog content" multiline minRows={4} value={blog.content} onChange={(e) => setBlog({ ...blog, content: e.target.value })} />
                    <Button
                      variant={blog.published ? "contained" : "outlined"}
                      onClick={() => setBlog({ ...blog, published: !blog.published })}
                    >
                      {blog.published ? "Published" : "Unpublished"}
                    </Button>
                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" onClick={saveBlog}>
                        {editingBlogId ? "Update Blog" : "Save Blog"}
                      </Button>
                      {editingBlogId && (
                        <Button variant="outlined" onClick={resetBlogForm}>
                          Cancel Edit
                        </Button>
                      )}
                    </Stack>
                  </Stack>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, lg: 6 }}>
                <Paper sx={{ p: 2.5, borderRadius: 3 }}>
                  <Typography variant="h6" fontWeight={700} mb={1}>
                    Published + Draft Blogs
                  </Typography>
                  <List>
                    {blogs.map((item) => (
                      <Box key={item._id}>
                        <ListItem
                          secondaryAction={
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="outlined" onClick={() => startEditBlog(item)}>
                                Edit
                              </Button>
                              <Button size="small" variant="outlined" color="warning" onClick={() => togglePublish(item)}>
                                {item.published ? "Unpublish" : "Publish"}
                              </Button>
                              <Button size="small" variant="outlined" color="error" onClick={() => deleteBlog(item._id)}>
                                Delete
                              </Button>
                            </Stack>
                          }
                        >
                          <ListItemText
                            primary={item.title}
                            secondary={
                              <Stack direction="row" spacing={1} mt={0.5}>
                                <Chip size="small" label={item.published ? "Published" : "Draft"} color={item.published ? "success" : "default"} />
                              </Stack>
                            }
                          />
                        </ListItem>
                        <Divider />
                      </Box>
                    ))}
                  </List>
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 6 && (
            <Box sx={{ p: { xs: 0, sm: 0.5 } }}>
              <AdminMessengerTab token={token} showToast={showToast} />
            </Box>
          )}

          {activeTab === 7 && <AdminBroadcastTab token={token} showToast={showToast} />}
          {activeTab === 8 && (
            <Stack spacing={2}>
              {!reviewQueue.length && (
                <Paper sx={{ p: 2, borderRadius: 2.5 }}>
                  <Typography color="text.secondary">No product review submissions yet.</Typography>
                </Paper>
              )}
              <Grid container spacing={1.5}>
                {reviewQueue.map((item) => (
                  <Grid key={item._id} size={{ xs: 12, md: 6 }}>
                    <Card variant="outlined" sx={{ borderRadius: 2.5, height: "100%", cursor: "pointer" }} onClick={() => navigate(`/admin/review/${item._id}`)}>
                      <CardContent>
                        <Stack direction="row" spacing={1.25}>
                          <Box
                            component="img"
                            src={item.imageUrl || "/icons.svg"}
                            alt={item.name}
                            sx={{ width: 84, height: 84, borderRadius: 1.5, objectFit: "cover", bgcolor: "#f3f4f6", flexShrink: 0 }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography fontWeight={800} noWrap>
                                {item.name}
                              </Typography>
                              <Chip label={item.status} size="small" />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                              by {item.submittedBy?.name || "Subowner"} · PKR {item.price} · Stock {item.stock}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.4 }}>
                              {item.submittedBy?.email || "—"} · ID: {String(item.submittedBy?._id || "").slice(-8)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.7 }}>
                              Comments: {(item.comments || []).length}
                            </Typography>
                            <Button size="small" sx={{ mt: 1 }}>
                              Open review details
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
          {activeTab === 9 && (
            <Stack spacing={2}>
              <Paper sx={{ p: 2, borderRadius: 2.5 }}>
                <Typography variant="h6" fontWeight={700} mb={1}>
                  Order lookup
                </Typography>
                <TextField
                  fullWidth
                  label="Search by order shortcut ID (last 6 chars)"
                  value={orderLookup.q}
                  onChange={(e) => setOrderLookupQuery(e.target.value)}
                />
              </Paper>
              {orderLookup.filtered.map((order) => (
                <Paper key={order._id} sx={{ p: 2, borderRadius: 2.5, border: "1px solid #e5e7eb" }}>
                  <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between">
                    <Typography fontWeight={800}>
                      Order #{String(order._id).slice(-6)} ({order.channel})
                    </Typography>
                    <Chip label={order.paymentStatus} color={order.paymentStatus === "paid" ? "success" : "warning"} />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {order.customerName} · {order.email} · {order.phone}
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 0.6 }}>
                    Items: {(order.items || []).map((i) => `${i.name} x${i.quantity}`).join(", ")}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>

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
    </Box>
  );
};
