const Order = require("../models/Order");
const Blog = require("../models/Blog");
const User = require("../models/User");
const Config = require("../models/Config");

const getOverview = async (_, res) => {
  const [orderCount, totalRevenueResult, whatsappOrders, websiteOrders, paidOrdersCount, recentOrders] = await Promise.all([
    Order.countDocuments(),
    Order.aggregate([{ $group: { _id: null, total: { $sum: "$subtotal" } } }]),
    Order.countDocuments({ channel: "whatsapp" }),
    Order.countDocuments({ channel: "website" }),
    Order.countDocuments({ paymentStatus: "paid" }),
    Order.find().sort({ createdAt: -1 }).limit(10),
  ]);

  const uniqueCustomers = await Order.distinct("email");

  res.json({
    orderCount,
    totalRevenue: totalRevenueResult[0]?.total || 0,
    whatsappOrders,
    websiteOrders,
    paidOrdersCount,
    uniqueCustomers: uniqueCustomers.length,
    recentOrders,
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
