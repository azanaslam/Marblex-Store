/**
 * Seeds rich dummy data for MARBLEX admin UI preview.
 * Run: node src/utils/seedAdminDemo.js
 * Re-run safe: removes prior demo records (tagged MX_DEMO) then inserts fresh.
 */
require("dotenv").config({ path: require("path").join(__dirname, "../../.env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { connectDatabase } = require("../config/db");
const { adminEmail } = require("../config/env");

const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Blog = require("../models/Blog");
const Quote = require("../models/Quote");
const SupportTicket = require("../models/SupportTicket");
const ContactRequest = require("../models/ContactRequest");
const DirectMessage = require("../models/DirectMessage");
const ClientReview = require("../models/ClientReview");
const ProductReviewSubmission = require("../models/ProductReviewSubmission");
const PortalDocument = require("../models/PortalDocument");
const Broadcast = require("../models/Broadcast");

const DEMO_TAG = "MX_DEMO";
const DEMO_EMAIL_DOMAIN = "@marblex.demo";

const daysAgo = (n, hour = 12) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 30, 0, 0);
  return d;
};

const clearDemoData = async () => {
  const demoUsers = await User.find({ email: new RegExp(`${DEMO_EMAIL_DOMAIN.replace(".", "\\.")}$`, "i") }).select("_id");
  const demoUserIds = demoUsers.map((u) => u._id);

  await Order.deleteMany({ notes: DEMO_TAG });
  await Quote.deleteMany({ adminNotes: DEMO_TAG });
  await SupportTicket.deleteMany({ subject: new RegExp(`^\\[${DEMO_TAG}\\]`) });
  await ContactRequest.deleteMany({ message: new RegExp(DEMO_TAG) });
  await Blog.deleteMany({ tags: DEMO_TAG });
  await ClientReview.deleteMany({ source: "seed", company: DEMO_TAG });
  await ProductReviewSubmission.deleteMany({ description: DEMO_TAG });
  await PortalDocument.deleteMany({ description: DEMO_TAG });
  await Broadcast.deleteMany({ message: new RegExp(DEMO_TAG) });

  if (demoUserIds.length) {
    await DirectMessage.deleteMany({
      $or: [{ sender: { $in: demoUserIds } }, { recipient: { $in: demoUserIds } }],
    });
    await User.deleteMany({ _id: { $in: demoUserIds } });
  }
};

const seedAdminDemo = async () => {
  const admin = await User.findOne({ email: (adminEmail || "").toLowerCase().trim(), role: "admin" });
  if (!admin) {
    throw new Error("Admin user not found. Start server once so seedAdmin runs.");
  }

  let products = await Product.find({ active: { $ne: false } }).limit(12).lean();
  if (!products.length) {
    const { seedProducts } = require("./seedProducts");
    await seedProducts();
    products = await Product.find({ active: { $ne: false } }).limit(12).lean();
  }

  const pw = await bcrypt.hash("Demo@12345", 10);
  const clientSpecs = [
    { name: "Azan Aslam", email: `azan${DEMO_EMAIL_DOMAIN}`, company: "Aslam Builders", city: "Lahore", granted: true },
    { name: "Hassan Raza", email: `hassan${DEMO_EMAIL_DOMAIN}`, company: "Raza Chemicals", city: "Karachi", granted: true },
    { name: "Sana Malik", email: `sana${DEMO_EMAIL_DOMAIN}`, company: "Malik Developers", city: "Islamabad", granted: false },
    { name: "Bilal Khan", email: `bilal${DEMO_EMAIL_DOMAIN}`, company: "Khan Contractors", city: "Multan", granted: false },
    { name: "Fatima Noor", email: `fatima${DEMO_EMAIL_DOMAIN}`, company: "Noor Interiors", city: "Faisalabad", granted: true },
    { name: "Usman Ali", email: `usman${DEMO_EMAIL_DOMAIN}`, company: "Ali Waterproofing", city: "Rawalpindi", granted: true },
    { name: "Ayesha Tariq", email: `ayesha${DEMO_EMAIL_DOMAIN}`, company: "Tariq Homes", city: "Peshawar", granted: true },
    { name: "Imran Shah", email: `imran${DEMO_EMAIL_DOMAIN}`, company: "Shah Projects", city: "Sialkot", granted: false },
  ];

  const clients = await User.insertMany(
    clientSpecs.map((c) => ({
      name: c.name,
      email: c.email.toLowerCase(),
      passwordHash: pw,
      role: "user",
      isAccessGranted: c.granted,
      isEmailVerified: true,
      company: c.company,
      city: c.city,
      phone: "03084585792",
      avatarUrl: "",
    }))
  );

  const pickProduct = (i) => products[i % products.length];
  const itemFrom = (p, qty = 1) => ({
    productId: p._id,
    name: p.name,
    imageUrl: p.imageUrl || "/products/Banner1.jpeg",
    price: p.price,
    quantity: qty,
  });

  const orderTemplates = [
    { channel: "website", pay: "paid", status: "processing", method: "stripe", days: 0, qty: 2 },
    { channel: "website", pay: "paid", status: "delivered", method: "cod", days: 1, qty: 1 },
    { channel: "whatsapp", pay: "paid", status: "pending", method: "cod", days: 2, qty: 4 },
    { channel: "whatsapp", pay: "paid", status: "processing", method: "cod", days: 3, qty: 3 },
    { channel: "whatsapp", pay: "unpaid", status: "pending", method: "cod", days: 4, qty: 3 },
    { channel: "whatsapp", pay: "paid", status: "on the way", method: "cod", days: 5, qty: 2 },
    { channel: "website", pay: "pending_verification", status: "pending", method: "easypaisa", days: 1, qty: 1 },
    { channel: "whatsapp", pay: "paid", status: "delivered", method: "jazzcash", days: 6, qty: 5 },
    { channel: "whatsapp", pay: "paid", status: "processing", method: "cod", days: 6, qty: 4 },
    { channel: "website", pay: "paid", status: "pending", method: "bank_transfer", days: 5, qty: 1 },
    { channel: "whatsapp", pay: "paid", status: "processing", method: "cod", days: 4, qty: 2 },
    { channel: "whatsapp", pay: "unpaid", status: "pending", method: "cod", days: 3, qty: 1 },
  ];

  const orders = orderTemplates.map((t, i) => {
    const client = clients[i % clients.length];
    const p1 = pickProduct(i);
    const p2 = pickProduct(i + 3);
    const items =
      t.qty > 2
        ? [itemFrom(p1, 2), itemFrom(p2, Math.max(1, t.qty - 2))]
        : [itemFrom(p1, t.qty)];
    const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
    return {
      userId: client._id,
      customerName: client.name,
      email: client.email,
      phone: client.phone || "03001234567",
      city: client.city,
      address: "Plot 12, Industrial Zone",
      channel: t.channel,
      orderSource: t.channel,
      items,
      subtotal,
      paymentMethod: t.method,
      paymentStatus: t.pay,
      orderStatus: t.status,
      transactionReference: t.method !== "cod" ? `TXN${100000 + i}` : "",
      notes: DEMO_TAG,
      createdAt: daysAgo(t.days, 10 + i),
      updatedAt: daysAgo(t.days, 10 + i),
    };
  });

  await Order.insertMany(orders);

  await Blog.insertMany([
    {
      title: "Roof waterproofing best practices (Demo)",
      coverImage: "/products/Banner3.jpeg",
      content: "<p>Demo blog for admin UI preview.</p>",
      tags: [DEMO_TAG, "waterproofing"],
      published: true,
    },
    {
      title: "Choosing vinyl flooring for commercial sites (Demo)",
      coverImage: "/products/Banner4.jpeg",
      content: "<p>Demo blog content.</p>",
      tags: [DEMO_TAG, "flooring"],
      published: true,
    },
    {
      title: "Marblex membrane application guide (Demo draft)",
      coverImage: "/assets/membrane-water-render.png",
      content: "<p>Draft demo post.</p>",
      tags: [DEMO_TAG],
      published: false,
    },
  ]);

  await Quote.insertMany([
    {
      userId: clients[0]._id,
      contactName: clients[0].name,
      email: clients[0].email,
      phone: "03084585792",
      company: clients[0].company,
      city: "Lahore",
      projectName: "DHA Phase 6 basement",
      items: [itemFrom(pickProduct(0), 120), itemFrom(pickProduct(4), 40)],
      message: "Need bulk quote for membrane + primer.",
      status: "submitted",
      adminNotes: DEMO_TAG,
    },
    {
      userId: clients[1]._id,
      contactName: clients[1].name,
      email: clients[1].email,
      phone: "03112223344",
      company: clients[1].company,
      city: "Karachi",
      projectName: "Clifton high-rise",
      items: [itemFrom(pickProduct(2), 80)],
      message: "RFQ for swimming pool waterproofing.",
      status: "reviewing",
      adminNotes: DEMO_TAG,
    },
    {
      userId: clients[4]._id,
      contactName: clients[4].name,
      email: clients[4].email,
      phone: "03214445566",
      company: clients[4].company,
      city: "Faisalabad",
      projectName: "Factory expansion",
      items: [itemFrom(pickProduct(1), 200)],
      message: "Quote for flooring + water stopper.",
      status: "quoted",
      quotedAmount: 485000,
      quotedAt: daysAgo(1),
      adminNotes: DEMO_TAG,
    },
  ]);

  await SupportTicket.insertMany([
    {
      userId: clients[0]._id,
      subject: `[${DEMO_TAG}] Delivery delay on order`,
      category: "delivery",
      status: "open",
      priority: "high",
      messages: [
        { sender: "user", body: "My order has been processing for 3 days — please update.", createdAt: daysAgo(0) },
      ],
    },
    {
      userId: clients[2]._id,
      subject: `[${DEMO_TAG}] Product TDS request`,
      category: "product",
      status: "waiting",
      messages: [
        { sender: "user", body: "Need TDS for roof membrane.", createdAt: daysAgo(2) },
        { sender: "admin", body: "We will email the document shortly.", createdAt: daysAgo(1) },
      ],
    },
  ]);

  await ContactRequest.insertMany([
    {
      name: "Demo Client — Ali",
      email: `ali.inquiry${DEMO_EMAIL_DOMAIN}`,
      phone: "03001112222",
      subject: "Bulk pricing",
      message: `${DEMO_TAG} — Interested in 500L membrane for a commercial project.`,
      status: "unread",
      createdAt: daysAgo(0),
    },
    {
      name: "Demo Client — Sara",
      email: `sara.inquiry${DEMO_EMAIL_DOMAIN}`,
      phone: "03003334444",
      subject: "Dealer partnership",
      message: `${DEMO_TAG} — Looking for dealership in Lahore.`,
      status: "unread",
      createdAt: daysAgo(1),
    },
    {
      name: "Demo Client — Omar",
      email: `omar.inquiry${DEMO_EMAIL_DOMAIN}`,
      subject: "Technical support",
      message: `${DEMO_TAG} — Need application guidance for basement.`,
      status: "responded",
      reply: "Our engineer will call you within 24 hours.",
      repliedAt: daysAgo(0),
      createdAt: daysAgo(3),
    },
  ]);

  const chatPairs = [
    { from: clients[0], text: "Assalam o alaikum — need help with waterproofing quantity." },
    { from: clients[1], text: "Payment sent via Easypaisa, please verify." },
    { from: clients[4], text: "Can you share catalog PDF for flooring range?" },
  ];

  for (const msg of chatPairs) {
    await DirectMessage.create({
      sender: msg.from._id,
      recipient: admin._id,
      body: msg.text,
      seenByAdmin: false,
      seenByUser: true,
      createdAt: daysAgo(0, 14),
    });
    await DirectMessage.create({
      sender: admin._id,
      recipient: msg.from._id,
      body: "Thank you — MARBLEX support will assist you shortly. (Demo reply)",
      seenByAdmin: true,
      seenByUser: false,
      createdAt: daysAgo(0, 15),
    });
  }

  await ClientReview.insertMany([
    {
      name: "Eng. Kamran",
      role: "Project Manager",
      company: DEMO_TAG,
      quote: "Marblex membrane performed excellently on our basement project.",
      rating: 5,
      status: "pending",
      source: "seed",
    },
    {
      name: "Mrs. Aisha",
      role: "Homeowner",
      company: DEMO_TAG,
      quote: "Fast delivery and genuine products — highly recommended.",
      rating: 5,
      status: "approved",
      featured: true,
      source: "seed",
    },
  ]);

  await ProductReviewSubmission.insertMany([
    {
      submittedBy: clients[3]._id,
      name: "Partner SKU — Grey Vinyl Roll",
      imageUrl: "/products/Banner2.jpeg",
      description: DEMO_TAG,
      price: 2200,
      stock: 15,
      category: "Flooring",
      status: "pending",
      hasAdminUnread: true,
    },
    {
      submittedBy: clients[5]._id,
      name: "Partner SKU — Pool Mosaic Mix",
      imageUrl: "/products/Banner1.jpeg",
      description: DEMO_TAG,
      price: 3500,
      stock: 8,
      category: "Waterproofing",
      status: "looking",
      hasAdminUnread: true,
    },
  ]);

  await PortalDocument.insertMany([
    {
      title: "Water Stopper 123 — TDS (Demo)",
      category: "tds",
      description: DEMO_TAG,
      fileUrl: "/pdfs/Water Stopper 123.pdf",
      coverUrl: "/assets/brochures/Water_Stopper_123_page_1.jpg",
      active: true,
    },
    {
      title: "Marblex Company Profile (Demo)",
      category: "brochure",
      description: DEMO_TAG,
      fileUrl: "/pdfs/Profile marblex.pdf",
      coverUrl: "/assets/brochures/Profile_marblex_page_1.jpg",
      active: true,
    },
  ]);

  await Broadcast.create({
    message: `${DEMO_TAG} — Demo broadcast: New membrane batch in stock. Clients will see this on the portal.`,
    createdBy: admin._id,
  });

  // One low-stock product for ops snapshot
  const lowStock = await Product.findOne({ stock: { $gt: 5 } });
  if (lowStock) {
    lowStock.stock = 3;
    await lowStock.save();
  }

  return {
    clients: clients.length,
    orders: orders.length,
    adminEmail: admin.email,
  };
};

const run = async () => {
  try {
    await connectDatabase();
    console.log("Clearing previous MARBLEX admin demo data…");
    await clearDemoData();
    console.log("Inserting admin demo dataset…");
    const summary = await seedAdminDemo();
    console.log("Done.");
    console.log(`  Demo clients: ${summary.clients}`);
    console.log(`  Demo orders: ${summary.orders}`);
    console.log(`  Admin login: ${summary.adminEmail}`);
    console.log("  Demo client password (all): Demo@12345");
    process.exit(0);
  } catch (err) {
    console.error("Admin demo seed failed:", err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect().catch(() => {});
  }
};

if (require.main === module) {
  run();
}

module.exports = { seedAdminDemo, clearDemoData, DEMO_TAG };
