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
  if (!["user", "subowner", "dealer"].includes(nextRole)) {
    return res.status(400).json({ message: "Role must be either user, dealer, or subowner" });
  }

  const user = await User.findById(id);
  if (!user) return res.status(404).json({ message: "User not found" });
  if (user.role === "admin") return res.status(400).json({ message: "Admin role cannot be changed here" });

  user.role = nextRole;
  if (user.isAccessGranted === false) {
    user.isAccessGranted = true;
  }
  if (req.body?.dealerDiscountPercent !== undefined) {
    user.dealerDiscountPercent = Number(req.body.dealerDiscountPercent) || 0;
  }
  if (req.body?.creditLimit !== undefined) {
    user.creditLimit = Number(req.body.creditLimit) || 0;
  }
  if (req.body?.paymentTermsDays !== undefined) {
    user.paymentTermsDays = Number(req.body.paymentTermsDays) || 30;
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

/** Mark dealer credit payment received */
const recordDealerPayment = async (req, res) => {
  try {
    const { id } = req.params;
    const amount = Number(req.body?.amount) || 0;
    if (amount <= 0) return res.status(400).json({ message: "Enter a valid positive payment amount" });

    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.creditUsed = Math.max(0, (user.creditUsed || 0) - amount);
    await user.save();

    return res.json({
      message: "Payment of PKR " + amount.toLocaleString() + " recorded. Remaining balance: PKR " + user.creditUsed.toLocaleString(),
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        creditLimit: user.creditLimit,
        creditUsed: user.creditUsed,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

const getReports = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const { startDate, endDate } = req.query;
    const now = new Date();
    const start = startDate ? new Date(startDate) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate) : now;

    const matchDate = { createdAt: { $gte: start, $lte: end } };

    const [salesByDay, ordersByStatus, paymentMethods, revenueByCity, topProducts, lowStock, dealers] = await Promise.all([
      Order.aggregate([
        { $match: matchDate },
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
        { $match: matchDate },
        { $group: { _id: "$orderStatus", count: { $sum: 1 }, revenue: { $sum: "$subtotal" } } },
      ]),
      Order.aggregate([
        { $match: matchDate },
        { $group: { _id: "$paymentMethod", count: { $sum: 1 }, revenue: { $sum: "$subtotal" } } },
      ]),
      Order.aggregate([
        { $match: matchDate },
        { $group: { _id: "$city", revenue: { $sum: "$subtotal" }, count: { $sum: 1 } } },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Order.aggregate([
        { $match: matchDate },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.name",
            qty: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } },
          },
        },
        { $sort: { revenue: -1 } },
        { $limit: 10 },
      ]),
      Product.find({ active: { $ne: false }, stock: { $lte: 5 } })
        .select("name category stock price")
        .sort({ stock: 1 })
        .lean(),
      User.find({ role: "dealer", creditUsed: { $gt: 0 } })
        .select("name email phone creditLimit creditUsed")
        .sort({ creditUsed: -1 })
        .lean(),
    ]);

    res.json({
      range: { start, end },
      salesByDay,
      ordersByStatus,
      paymentMethods,
      revenueByCity,
      topProducts,
      lowStock,
      dealers,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to generate reports", error: err.message });
  }
};

const exportOrdersCsv = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const filter = {};
    if (startDate && endDate) {
      filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 }).lean();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="marblex_orders.csv"');

    let csv = "Order Number,Date,Customer Name,Email,Phone,City,Status,Payment Method,Payment Status,Subtotal,Delivery,Discount,Total\n";
    for (const o of orders) {
      const date = o.createdAt ? new Date(o.createdAt).toISOString().split("T")[0] : "";
      const total = (o.subtotal || 0) + (o.deliveryCharge || 0) - (o.discount || 0);
      csv += `"${o.orderNumber || ""}","${date}","${(o.name || "").replace(/"/g, '""')}","${o.email || ""}","${o.phone || ""}","${(o.city || "").replace(/"/g, '""')}","${o.orderStatus || ""}","${o.paymentMethod || ""}","${o.paymentStatus || ""}",${o.subtotal || 0},${o.deliveryCharge || 0},${o.discount || 0},${total}\n`;
    }
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export orders", error: err.message });
  }
};

const exportCustomersCsv = async (req, res) => {
  try {
    const users = await User.find().select("name email phone role creditLimit creditUsed createdAt").sort({ createdAt: -1 }).lean();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="marblex_customers.csv"');

    let csv = "Name,Email,Phone,Role,Credit Limit,Credit Balance,Registered Date\n";
    for (const u of users) {
      const date = u.createdAt ? new Date(u.createdAt).toISOString().split("T")[0] : "";
      csv += `"${(u.name || "").replace(/"/g, '""')}","${u.email || ""}","${u.phone || ""}","${u.role || "customer"}",${u.creditLimit || 0},${u.creditUsed || 0},"${date}"\n`;
    }
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export customers", error: err.message });
  }
};

const exportProductsCsv = async (req, res) => {
  try {
    const Product = require("../models/Product");
    const products = await Product.find().sort({ createdAt: -1 }).lean();

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="marblex_products.csv"');

    let csv = "Product Name,Category,Price,Dealer Price,Stock,Active\n";
    for (const p of products) {
      csv += `"${(p.name || "").replace(/"/g, '""')}","${p.category || "General"}",${p.price || 0},${p.dealerPrice || 0},${p.stock || 0},${p.active !== false ? "Yes" : "No"}\n`;
    }
    res.send(csv);
  } catch (err) {
    res.status(500).json({ message: "Failed to export products", error: err.message });
  }
};

const getAbandonedCarts = async (req, res) => {
  try {
    const AbandonedCart = require("../models/AbandonedCart");
    const carts = await AbandonedCart.find({ recovered: false }).sort({ updatedAt: -1 }).limit(50).lean();
    res.json(carts);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch abandoned carts", error: err.message });
  }
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
  recordDealerPayment,
  getReports,
  exportOrdersCsv,
  exportCustomersCsv,
  exportProductsCsv,
  getAbandonedCarts,
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
