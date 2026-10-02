const Order = require("../models/Order");
const Blog = require("../models/Blog");
const User = require("../models/User");
const Config = require("../models/Config");

const getOverview = async (_, res) => {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    orderCount,
    totalRevenueResult,
    whatsappOrders,
    websiteOrders,
    paidOrdersCount,
    recentOrders,
    pendingVerification,
    unpaidAgg,
    weeklyAgg,
    topProducts,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$subtotal" } } }]),
    Order.countDocuments({ channel: "whatsapp" }),
    Order.countDocuments({ channel: "website" }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.find().sort({ createdAt: -1 }).limit(10),
    Order.countDocuments({ paymentStatus: "pending_verification" }),
    Order.aggregate([
      { $match: { paymentStatus: { $in: ["unpaid", "pending", "pending_verification"] }, orderStatus: { $ne: "cancelled" } } },
      { $group: { _id: null, total: { $sum: "$subtotal" }, count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { createdAt: { $gte: weekAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: "Asia/Karachi" } },
          revenue: { $sum: "$subtotal" },
          orders: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.name",
          qty: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
        },
      },
      { $sort: { qty: -1 } },
      { $limit: 5 },
    ]),
  ]);

  let openQuotes = 0;
  let openTickets = 0;
  let lowStock = [];
  try {
    const Quote = require("../models/Quote");
    const SupportTicket = require("../models/SupportTicket");
    const Product = require("../models/Product");
    [openQuotes, openTickets, lowStock] = await Promise.all([
      Quote.countDocuments({ status: { $in: ["submitted", "reviewing", "quoted"] } }),
      SupportTicket.countDocuments({ status: { $in: ["open", "waiting"] } }),
      Product.find({ active: { $ne: false }, stock: { $lte: 5 } })
        .select("name stock price category")
        .sort({ stock: 1 })
        .limit(8)
        .lean(),
    ]);
  } catch {
    // optional models
  }

  const uniqueCustomers = await Order.distinct("email");

  // Build Mon–Sun style last 7 days bars from real data
  const dayMap = new Map((weeklyAgg || []).map((d) => [d._id, d]));
  const weeklyBars = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" }); // YYYY-MM-DD
    const label = d.toLocaleDateString("en-US", { timeZone: "Asia/Karachi", weekday: "short" });
    const row = dayMap.get(key) || { revenue: 0, orders: 0 };
    weeklyBars.push({ label, date: key, revenue: row.revenue || 0, orders: row.orders || 0 });
  }
  const maxRev = Math.max(...weeklyBars.map((b) => b.revenue), 1);

  res.json({
    orderCount,
    totalRevenue: totalRevenueResult[0]?.total || 0,
    whatsappOrders,
    websiteOrders,
    paidOrdersCount,
    uniqueCustomers: uniqueCustomers.length,
    recentOrders,
    pendingVerification,
    unpaidCount: unpaidAgg[0]?.count || 0,
    unpaidAmount: unpaidAgg[0]?.total || 0,
    openQuotes,
    openTickets,
    topProducts: (topProducts || []).map((p) => ({
      name: p._id,
      qty: p.qty,
      revenue: p.revenue,
    })),
    lowStock,
    weeklyBars: weeklyBars.map((b) => ({
      ...b,
      height: `${Math.max(8, Math.round((b.revenue / maxRev) * 100))}%`,
    })),
  });
};

const getAllBlogs = async (_, res) => {
  const blogs = await Blog.find().sort({ createdAt: -1 });
  res.json(blogs);
};

const getPaidOrders = async (_, res) => {
  const orders = await Order.find({ paymentStatus: "paid" }).sort({ createdAt: -1 });
  res.json(orders);
};

const getWebsiteOrders = async (_, res) => {
  const orders = await Order.find({ channel: "website" }).sort({ createdAt: -1 });
  const totalAmount = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  res.json({ totalOrders: orders.length, totalAmount, orders });
};

const getWhatsappOrders = async (_, res) => {
  const orders = await Order.find({ channel: "whatsapp" }).sort({ createdAt: -1 });
  const totalAmount = orders.reduce((sum, order) => sum + (order.subtotal || 0), 0);
  res.json({ totalOrders: orders.length, totalAmount, orders });
};

const getAllOrders = async (_, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json({ totalOrders: orders.length, orders });
};

const getUsers = async (_, res) => {
  const users = await User.find({}, { passwordHash: 0 }).sort({ createdAt: -1 });
  res.json({ totalUsers: users.length, users });
};

const getUserById = async (req, res) => {
  const { id } = req.params;
  const user = await User.findById(id, { passwordHash: 0, twoFactorCode: 0 });
  if (!user) return res.status(404).json({ message: "User not found" });

  const Order = require("../models/Order");
  let quotes = [];
  let tickets = [];
  try {
    const Quote = require("../models/Quote");
    const SupportTicket = require("../models/SupportTicket");
    [quotes, tickets] = await Promise.all([
      Quote.find({ userId: id }).sort({ createdAt: -1 }).limit(10),
      SupportTicket.find({ userId: id }).sort({ updatedAt: -1 }).limit(10),
    ]);
  } catch {
    // ignore
  }
  const orders = await Order.find({ userId: id }).sort({ createdAt: -1 }).limit(15);

  res.json({
    user,
    orders,
    quotes,
    tickets,
    stats: {
      orderCount: orders.length,
      quoteCount: quotes.length,
      ticketCount: tickets.length,
    },
  });
};

const getAllProductsAdmin = async (_, res) => {
  const Product = require("../models/Product");
  const products = await Product.find().sort({ createdAt: -1 }).lean();
  res.json(products);
};

const toggleUserBlockStatus = async (req, res) => {
  const { id } = req.params;
  const { isBlocked } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin account cannot be blocked" });

  user.isBlocked = Boolean(isBlocked);
  await user.save();

  return res.json({
    message: user.isBlocked ? "User blocked successfully" : "User unblocked successfully",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isAccessGranted: user.isAccessGranted,
    },
  });
};

const toggleUserAccess = async (req, res) => {
  const { id } = req.params;
  const { isAccessGranted } = req.body;

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin access cannot be changed here" });

  user.isAccessGranted = Boolean(isAccessGranted);
  await user.save();

  return res.json({
    message: user.isAccessGranted ? "User can now log in." : "User login access revoked.",
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isAccessGranted: user.isAccessGranted,
    },
  });
};

const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const nextRole = String(req.body?.role || "").trim().toLowerCase();
  if (!["user", "subowner"].includes(nextRole)) {
    return res.status(400).json({ message: "Role must be either user or subowner" });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin role cannot be changed here" });

  user.role = nextRole;
  if (user.isAccessGranted === false) {
    user.isAccessGranted = true;
  }
  await user.save();

  return res.json({
    message: `User role updated to ${nextRole}`,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked,
      isAccessGranted: user.isAccessGranted,
    },
  });
};

module.exports = {
  getOverview,
  getAllBlogs,
  getPaidOrders,
  getWebsiteOrders,
  getWhatsappOrders,
  getAllOrders,
  getUsers,
  getUserById,
  getAllProductsAdmin,
  toggleUserBlockStatus,
  toggleUserAccess,
  updateUserRole,
  getEmailConfig: async (req, res) => {
    try {
      const config = await Config.findOne({ key: "email_settings" });
      res.json(config ? config.value : { user: "", pass: "" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
  updateEmailConfig: async (req, res) => {
    try {
      const { user, pass } = req.body;
      await Config.findOneAndUpdate(
        { key: "email_settings" },
        { value: { user, pass }, updatedAt: Date.now() },
        { upsert: true }
      );
      res.json({ success: true, message: "Email settings updated" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};
