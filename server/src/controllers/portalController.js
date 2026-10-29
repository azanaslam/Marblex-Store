const Quote = require("../models/Quote");
const SupportTicket = require("../models/SupportTicket");
const Favorite = require("../models/Favorite");
const ProjectList = require("../models/ProjectList");
const PortalDocument = require("../models/PortalDocument");
const Order = require("../models/Order");
const User = require("../models/User");
const Product = require("../models/Product");
const Broadcast = require("../models/Broadcast");
const DirectMessage = require("../models/DirectMessage");

const DEFAULT_DOCS = [
  {
    title: "MARBLEX Corporate Profile",
    category: "brochure",
    description: "Company overview, product lines, and industrial capabilities.",
    fileUrl: "https://marblex-shop.vercel.app/catalogs",
    coverUrl: "",
  },
  {
    title: "Application Manual – Waterproofing Systems",
    category: "manual",
    description: "Field application guidance for membranes and coatings.",
    fileUrl: "https://marblex-shop.vercel.app/catalogs",
    coverUrl: "",
  },
  {
    title: "PVC Waterstop Technical Data",
    category: "tds",
    description: "Technical specifications for PVC waterstop profiles.",
    fileUrl: "https://marblex-shop.vercel.app/catalogs",
    coverUrl: "",
  },
  {
    title: "Elastomeric Sealants – Product Guide",
    category: "tds",
    description: "Sealant selection and performance data for construction joints.",
    fileUrl: "https://marblex-shop.vercel.app/catalogs",
    coverUrl: "",
  },
];

const ensureDefaultDocuments = async () => {
  const count = await PortalDocument.countDocuments();
  if (count === 0) {
    await PortalDocument.insertMany(DEFAULT_DOCS);
  }
};

/** GET /portal/overview */
const getOverview = async (req, res) => {
  try {
    const userId = req.user.id;
    const [user, orders, openQuotes, openTickets, favoritesCount, unreadChat, broadcasts] = await Promise.all([
      User.findById(userId).select("-passwordHash -twoFactorCode"),
      Order.find({ userId }).sort({ createdAt: -1 }).limit(5),
      Quote.countDocuments({ userId, status: { $in: ["submitted", "reviewing", "quoted"] } }),
      SupportTicket.countDocuments({ userId, status: { $in: ["open", "waiting"] } }),
      Favorite.countDocuments({ userId }),
      DirectMessage.countDocuments({ recipient: userId, seenByUser: false }).catch(() => 0),
      Broadcast.find().sort({ createdAt: -1 }).limit(5).lean().catch(() => []),
    ]);

    const allOrders = await Order.find({ userId }).select("orderStatus paymentStatus subtotal").lean();
    const statusCounts = allOrders.reduce(
      (acc, o) => {
        const key = o.orderStatus || "pending";
        acc[key] = (acc[key] || 0) + 1;
        acc.total += 1;
        return acc;
      },
      { total: 0 }
    );

    const activeOrders = allOrders.filter((o) =>
      ["pending", "processing", "on the way"].includes(o.orderStatus)
    ).length;

    return res.json({
      user,
      recentOrders: orders,
      stats: {
        totalOrders: statusCounts.total,
        activeOrders,
        openQuotes,
        openTickets,
        favoritesCount,
        unreadChat: typeof unreadChat === "number" ? unreadChat : 0,
        statusCounts,
      },
      broadcasts: Array.isArray(broadcasts) ? broadcasts : [],
    });
  } catch (error) {
    console.error("[Portal Overview]", error);
    return res.status(500).json({ message: error.message || "Failed to load portal overview" });
  }
};

/** —— Delivery sites —— */
const listDeliverySites = async (req, res) => {
  const user = await User.findById(req.user.id).select("deliverySites");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user.deliverySites || []);
};

const addDeliverySite = async (req, res) => {
  const { label, address, city, area, contactPhone, isDefault } = req.body || {};
  if (!label || !address) {
    return res.status(400).json({ message: "Site label and address are required" });
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });

  if (isDefault) {
    user.deliverySites.forEach((s) => {
      s.isDefault = false;
    });
  }

  user.deliverySites.push({
    label: String(label).trim(),
    address: String(address).trim(),
    city: String(city || "").trim(),
    area: String(area || "").trim(),
    contactPhone: String(contactPhone || "").trim(),
    isDefault: Boolean(isDefault) || user.deliverySites.length === 0,
  });
  await user.save();
  return res.status(201).json(user.deliverySites);
};

const updateDeliverySite = async (req, res) => {
  const { siteId } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const site = user.deliverySites.id(siteId);
  if (!site) return res.status(404).json({ message: "Delivery site not found" });

  const fields = ["label", "address", "city", "area", "contactPhone"];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) site[f] = String(req.body[f]).trim();
  });
  if (req.body.isDefault === true) {
    user.deliverySites.forEach((s) => {
      s.isDefault = false;
    });
    site.isDefault = true;
  }
  await user.save();
  return res.json(user.deliverySites);
};

const deleteDeliverySite = async (req, res) => {
  const { siteId } = req.params;
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const site = user.deliverySites.id(siteId);
  if (!site) return res.status(404).json({ message: "Delivery site not found" });
  site.deleteOne();
  await user.save();
  return res.json(user.deliverySites);
};

/** —— Quotes / RFQ —— */
const listMyQuotes = async (req, res) => {
  const quotes = await Quote.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.json(quotes);
};

const getMyQuote = async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  return res.json(quote);
};

const createQuote = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const {
      contactName,
      phone,
      email,
      city,
      siteAddress,
      projectName,
      items,
      message,
      company,
    } = req.body || {};

    const safeItems = Array.isArray(items)
      ? items
          .filter((i) => i && i.name && Number(i.quantity) > 0)
          .map((i) => ({
            productId: i.productId || null,
            name: String(i.name).trim(),
            quantity: Number(i.quantity) || 1,
            unit: String(i.unit || "pcs").trim(),
            notes: String(i.notes || "").trim(),
          }))
      : [];

    if (!safeItems.length && !String(message || "").trim()) {
      return res.status(400).json({ message: "Add at least one product line or a message for your RFQ" });
    }

    const quote = await Quote.create({
      userId: user._id,
      company: String(company || user.company || "").trim(),
      contactName: String(contactName || user.name || "").trim(),
      email: String(email || user.email || "").trim().toLowerCase(),
      phone: String(phone || user.phone || "").trim(),
      city: String(city || user.city || "").trim(),
      siteAddress: String(siteAddress || "").trim(),
      projectName: String(projectName || "").trim(),
      items: safeItems,
      message: String(message || "").trim(),
      status: "submitted",
    });

    return res.status(201).json(quote);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const acceptQuote = async (req, res) => {
  const quote = await Quote.findOne({ _id: req.params.id, userId: req.user.id });
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  if (quote.status !== "quoted") {
    return res.status(400).json({ message: "Only quoted RFQs can be accepted" });
  }
  quote.status = "accepted";
  await quote.save();
  return res.json(quote);
};

/** Convert Quoted RFQ to Official Order (Admin Action) */
const adminConvertQuoteToOrder = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).json({ message: "Quote not found" });
    if (!["quoted", "accepted"].includes(quote.status)) {
      return res.status(400).json({ message: "Only 'quoted' or 'accepted' quotes can be converted to orders" });
    }

    const totalAmount = Number(quote.quotedAmount) || 0;
    const orderItems = (quote.items || []).map((item) => ({
      productId: item.productId || undefined,
      name: item.name,
      price: item.unitPrice || Math.round(totalAmount / (quote.items.length || 1)),
      quantity: item.quantity || 1,
    }));

    const orderNumber = "ORD-" + Math.floor(100000 + Math.random() * 900000);

    const order = await Order.create({
      orderNumber,
      userId: quote.userId,
      quoteId: quote._id,
      customerName: quote.contactName,
      email: quote.email,
      phone: quote.phone,
      city: quote.city || "Other",
      address: quote.siteAddress || "Site Delivery",
      notes: "Converted from quotation " + quote.quoteNumber + (quote.message ? " - " + quote.message : ""),
      channel: "website",
      paymentMethod: "cod",
      paymentStatus: "pending",
      orderStatus: "processing",
      items: orderItems,
      subtotal: totalAmount,
      total: totalAmount,
    });

    quote.status = "converted";
    quote.convertedOrderId = order._id;
    await quote.save();

    return res.json({
      message: "Quote successfully converted to official Order #" + order.orderNumber,
      order,
      quote,
    });
  } catch (error) {
    console.error("[Convert Quote]", error);
    return res.status(500).json({ message: error.message || "Failed to convert quote" });
  }
};

/** View Quote PDF / Printable HTML view */
const getQuotePrintHtml = async (req, res) => {
  try {
    const quote = await Quote.findById(req.params.id);
    if (!quote) return res.status(404).send("Quote not found");

    const rows = (quote.items || [])
      .map(
        (i, idx) =>
          `<tr><td style="padding:10px;border-bottom:1px solid #e2e8ec">${idx + 1}. ${i.name}</td><td style="padding:10px;border-bottom:1px solid #e2e8ec;text-align:center">${i.quantity} ${i.unit || "pcs"}</td><td style="padding:10px;border-bottom:1px solid #e2e8ec;text-align:right">PKR ${Number(i.unitPrice || 0).toLocaleString()}</td><td style="padding:10px;border-bottom:1px solid #e2e8ec;text-align:right;font-weight:bold">PKR ${Number(i.lineTotal || (i.unitPrice * i.quantity) || 0).toLocaleString()}</td></tr>`
      )
      .join("");

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Quotation ${quote.quoteNumber}</title><style>body{font-family:system-ui,-apple-system,sans-serif;margin:40px;color:#0b2f3c;line-height:1.5}.header{display:flex;justify-content:space-between;border-bottom:2px solid #0a3d52;padding-bottom:16px;margin-bottom:24px}.badge{background:#e0f2fe;color:#0284c7;padding:4px 10px;border-radius:999px;font-size:12px;font-weight:bold}table{width:100%;border-collapse:collapse;margin:24px 0}th{background:#f8fafc;padding:10px;text-align:left;border-bottom:2px solid #cbd5e1;font-size:12px;text-transform:uppercase}.total-box{text-align:right;margin-top:20px;font-size:18px;font-weight:bold;color:#0a3d52}</style></head><body><div class="header"><div><h1 style="margin:0;color:#0a3d52">MARBLEX</h1><p style="margin:4px 0;font-size:13px;color:#64748b">Industrial Construction Chemical & Waterproofing</p></div><div style="text-align:right"><h2 style="margin:0;font-size:20px">${quote.quoteNumber}</h2><span class="badge">${String(quote.status).toUpperCase()}</span></div></div><div style="margin-bottom:20px;font-size:13px"><strong>Customer:</strong> ${quote.contactName} (${quote.company || "N/A"})<br/><strong>Phone:</strong> ${quote.phone} | <strong>Email:</strong> ${quote.email}<br/><strong>Project / Site:</strong> ${quote.projectName || "General"} - ${quote.siteAddress || quote.city}</div><table><thead><tr><th>Product Item</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit Price</th><th style="text-align:right">Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total-box">Quoted Amount: PKR ${Number(quote.quotedAmount || 0).toLocaleString()}</div><p style="margin-top:30px;font-size:11px;color:#94a3b8">This is an official computer-generated quotation from MARBLEX Engineering. Valid for 15 days.</p></body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (error) {
    return res.status(500).send("Error rendering quote");
  }
};

/** Admin quote updates */
const adminListQuotes = async (req, res) => {
  const quotes = await Quote.find().sort({ createdAt: -1 }).populate("userId", "name email company");
  return res.json(quotes);
};

const adminUpdateQuote = async (req, res) => {
  const { status, quotedAmount, adminNotes } = req.body || {};
  const quote = await Quote.findById(req.params.id);
  if (!quote) return res.status(404).json({ message: "Quote not found" });
  if (status) quote.status = status;
  if (quotedAmount !== undefined) quote.quotedAmount = Number(quotedAmount);
  if (adminNotes !== undefined) quote.adminNotes = String(adminNotes);
  if (status === "quoted") quote.quotedAt = new Date();
  await quote.save();
  return res.json(quote);
};

/** —— Support tickets —— */
const listMyTickets = async (req, res) => {
  const tickets = await SupportTicket.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  return res.json(tickets);
};

const getMyTicket = async (req, res) => {
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user.id });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  return res.json(ticket);
};

const createTicket = async (req, res) => {
  const { subject, category, body, priority } = req.body || {};
  if (!subject || !body) {
    return res.status(400).json({ message: "Subject and message are required" });
  }
  const ticket = await SupportTicket.create({
    userId: req.user.id,
    subject: String(subject).trim(),
    category: category || "other",
    priority: priority === "high" ? "high" : "normal",
    status: "open",
    messages: [{ sender: "user", body: String(body).trim() }],
  });
  return res.status(201).json(ticket);
};

const replyTicket = async (req, res) => {
  const { body } = req.body || {};
  if (!body) return res.status(400).json({ message: "Message is required" });
  const ticket = await SupportTicket.findOne({ _id: req.params.id, userId: req.user.id });
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (ticket.status === "closed") {
    return res.status(400).json({ message: "This ticket is closed" });
  }
  ticket.messages.push({ sender: "user", body: String(body).trim() });
  ticket.status = "open";
  await ticket.save();
  return res.json(ticket);
};

const adminListTickets = async (req, res) => {
  const tickets = await SupportTicket.find().sort({ updatedAt: -1 }).populate("userId", "name email company");
  return res.json(tickets);
};

const adminReplyTicket = async (req, res) => {
  const { body, status } = req.body || {};
  const ticket = await SupportTicket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (body) {
    ticket.messages.push({ sender: "admin", body: String(body).trim() });
    ticket.status = "waiting";
  }
  if (status) ticket.status = status;
  await ticket.save();
  return res.json(ticket);
};

/** —— Favorites —— */
const listFavorites = async (req, res) => {
  const favs = await Favorite.find({ userId: req.user.id })
    .populate("productId")
    .sort({ createdAt: -1 });
  return res.json(favs.filter((f) => f.productId));
};

const addFavorite = async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ message: "productId is required" });
  const product = await Product.findById(productId);
  if (!product || product.active === false) {
    return res.status(404).json({ message: "Product not found" });
  }
  try {
    const fav = await Favorite.findOneAndUpdate(
      { userId: req.user.id, productId },
      { userId: req.user.id, productId },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    return res.status(201).json(fav);
  } catch (error) {
    if (error.code === 11000) {
      const existing = await Favorite.findOne({ userId: req.user.id, productId });
      return res.json(existing);
    }
    return res.status(500).json({ message: error.message });
  }
};

const removeFavorite = async (req, res) => {
  await Favorite.findOneAndDelete({ userId: req.user.id, productId: req.params.productId });
  return res.json({ success: true });
};

/** —— Project lists —— */
const listProjectLists = async (req, res) => {
  const lists = await ProjectList.find({ userId: req.user.id }).sort({ updatedAt: -1 });
  return res.json(lists);
};

const createProjectList = async (req, res) => {
  const { name, siteLabel, items } = req.body || {};
  if (!name) return res.status(400).json({ message: "List name is required" });
  const list = await ProjectList.create({
    userId: req.user.id,
    name: String(name).trim(),
    siteLabel: String(siteLabel || "").trim(),
    items: Array.isArray(items) ? items : [],
  });
  return res.status(201).json(list);
};

const updateProjectList = async (req, res) => {
  const list = await ProjectList.findOne({ _id: req.params.id, userId: req.user.id });
  if (!list) return res.status(404).json({ message: "List not found" });
  if (req.body.name !== undefined) list.name = String(req.body.name).trim();
  if (req.body.siteLabel !== undefined) list.siteLabel = String(req.body.siteLabel).trim();
  if (Array.isArray(req.body.items)) list.items = req.body.items;
  await list.save();
  return res.json(list);
};

const deleteProjectList = async (req, res) => {
  await ProjectList.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  return res.json({ success: true });
};

/** —— Documents —— */
const listDocuments = async (req, res) => {
  await ensureDefaultDocuments();
  const filter = { active: true };
  if (req.query.category) filter.category = req.query.category;
  const docs = await PortalDocument.find(filter).sort({ category: 1, title: 1 });
  return res.json(docs);
};

const requestDocument = async (req, res) => {
  const { title, productName, message } = req.body || {};
  if (!title && !productName) {
    return res.status(400).json({ message: "Specify which document or product datasheet you need" });
  }
  const ticket = await SupportTicket.create({
    userId: req.user.id,
    subject: `Datasheet request: ${title || productName}`,
    category: "technical",
    status: "open",
    messages: [
      {
        sender: "user",
        body: String(message || `Please share TDS/SDS for: ${title || productName}`).trim(),
      },
    ],
  });
  return res.status(201).json({ success: true, ticket });
};

/** —— Admin documents CRUD —— */
const adminListDocuments = async (_req, res) => {
  await ensureDefaultDocuments();
  const docs = await PortalDocument.find().sort({ createdAt: -1 });
  return res.json(docs);
};

const adminCreateDocument = async (req, res) => {
  const { title, category, description, fileUrl, coverUrl, productId, active } = req.body || {};
  if (!title || !fileUrl) {
    return res.status(400).json({ message: "Title and file URL are required" });
  }
  const doc = await PortalDocument.create({
    title: String(title).trim(),
    category: category || "brochure",
    description: String(description || "").trim(),
    fileUrl: String(fileUrl).trim(),
    coverUrl: String(coverUrl || "").trim(),
    productId: productId || null,
    active: active !== false,
  });
  return res.status(201).json(doc);
};

const adminUpdateDocument = async (req, res) => {
  const doc = await PortalDocument.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!doc) return res.status(404).json({ message: "Document not found" });
  return res.json(doc);
};

const adminDeleteDocument = async (req, res) => {
  await PortalDocument.findByIdAndDelete(req.params.id);
  return res.json({ success: true });
};

module.exports = {
  getOverview,
  listDeliverySites,
  addDeliverySite,
  updateDeliverySite,
  deleteDeliverySite,
  listMyQuotes,
  getMyQuote,
  createQuote,
  acceptQuote,
  adminListQuotes,
  adminUpdateQuote,
  adminConvertQuoteToOrder,
  getQuotePrintHtml,
  listMyTickets,
  getMyTicket,
  createTicket,
  replyTicket,
  adminListTickets,
  adminReplyTicket,
  listFavorites,
  addFavorite,
  removeFavorite,
  listProjectLists,
  createProjectList,
  updateProjectList,
  deleteProjectList,
  listDocuments,
  requestDocument,
  adminListDocuments,
  adminCreateDocument,
  adminUpdateDocument,
  adminDeleteDocument,
};
