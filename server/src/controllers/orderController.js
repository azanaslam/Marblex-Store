const Order = require("../models/Order");
const Product = require("../models/Product");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const { whatsappNumber, stripeSecretKey, stripeWebhookSecret, stripeCurrency, frontendUrl, cloudinaryCloudName, cloudinaryApiKey, cloudinaryApiSecret } = require("../config/env");
const paymentConfig = require("../config/paymentConfig");
const { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } = require("../utils/sendEmail");
const cloudinary = require("cloudinary").v2;

if (cloudinaryCloudName && cloudinaryApiKey && cloudinaryApiSecret) {
  cloudinary.config({
    cloud_name: cloudinaryCloudName,
    api_key: cloudinaryApiKey,
    api_secret: cloudinaryApiSecret,
  });
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

// Validate Pakistani Phone Numbers (+923XXXXXXXXX, 03XXXXXXXXX, 923XXXXXXXXX, 03XX-XXXXXXX)
const validatePkPhone = (phone) => {
  if (!phone || typeof phone !== "string") return false;
  const clean = phone.replace(/[\s\-_()]/g, "");
  return /^((\+92)|(0092)|(92)|(0))?3[0-9]{9}$/.test(clean);
};

// Generate high-readability unique order number
const generateOrderNumber = () => {
  const year = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${year}-${rand}`;
};

const getPaymentConfig = async (req, res) => {
  return res.json({
    success: true,
    config: paymentConfig,
  });
};

const uploadPaymentProof = async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ message: "No image file provided" });
    }

    if (cloudinaryCloudName && cloudinaryApiKey) {
      const uploadRes = await cloudinary.uploader.upload(imageBase64, {
        folder: "marblex_payment_proofs",
        resource_type: "image",
        transformation: [{ quality: "auto", fetch_format: "auto" }],
      });
      return res.json({ success: true, url: uploadRes.secure_url });
    }

    // Fallback: return base64 / data URL directly
    return res.json({ success: true, url: imageBase64 });
  } catch (error) {
    console.error("Payment proof upload error:", error);
    return res.status(500).json({ message: "Failed to upload payment proof. Please try again." });
  }
};

const createOrder = async (req, res) => {
  try {
    const {
      customerName,
      email,
      phone,
      city,
      address,
      areaSize,
      deliveryDate,
      notes,
      channel,
      items,
      paymentMethod = "cod",
      transactionReference = "",
      paymentScreenshotUrl = "",
    } = req.body;

    const orderChannel = channel === "whatsapp" ? "whatsapp" : "website";

    // 1. Validation (Form Data)
    if (!customerName || typeof customerName !== "string" || customerName.trim().length < 2) {
      return res.status(400).json({ message: "Full name is required (minimum 2 characters)" });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!email || !emailRegex.test(String(email).trim())) {
      return res.status(400).json({ message: "Valid email address is required" });
    }

    if (!phone || !validatePkPhone(phone)) {
      return res.status(400).json({ message: "Valid Pakistani phone number is required (e.g. 0308 4585792 or +923084585792)" });
    }

    if (orderChannel === "website") {
      if (!city || typeof city !== "string" || city.trim().length < 2) {
        return res.status(400).json({ message: "City is required" });
      }
      if (!address || typeof address !== "string" || address.trim().length < 4) {
        return res.status(400).json({ message: "Full delivery site address is required" });
      }
    }

    // 2. Validate Cart Items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart items are required to place an order" });
    }

    // 3. Server-Side Price & Product Recalculation (Never trust prices sent from client!)
    const productIds = items
      .map((i) => i.productId || i._id)
      .filter((id) => mongoose.Types.ObjectId.isValid(id));

    const dbProducts = await Product.find({ _id: { $in: productIds } }).lean();
    const dbProductMap = new Map(dbProducts.map((p) => [String(p._id), p]));

    const normalizedItems = [];
    for (const item of items) {
      const pId = String(item.productId || item._id || "");
      const dbProd = dbProductMap.get(pId);

      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);
      // Use database price if product exists; fallback to item.price only if legacy product
      const unitPrice = dbProd ? Number(dbProd.price) : Number(item.price) || 0;
      const itemName = dbProd ? dbProd.name : String(item.name || "Product").trim();
      const itemImage = dbProd?.imageUrl || item.imageUrl || "";

      normalizedItems.push({
        productId: dbProd ? dbProd._id : undefined,
        name: itemName,
        imageUrl: itemImage,
        price: unitPrice >= 0 ? unitPrice : 0,
        quantity,
      });
    }

    if (normalizedItems.length === 0) {
      return res.status(400).json({ message: "No valid products found in order" });
    }

    const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 4. Validate Payment Method
    const validMethods = ["cod", "stripe", "easypaisa", "jazzcash", "bank_transfer"];
    const chosenMethod = validMethods.includes(paymentMethod) ? paymentMethod : "cod";

    if (orderChannel === "website" && ["easypaisa", "jazzcash", "bank_transfer"].includes(chosenMethod)) {
      if (!transactionReference || String(transactionReference).trim().length < 3) {
        return res.status(400).json({ message: "Transaction ID / Reference Number is required for manual online payments." });
      }
    }

    // 5. Build Order Document
    const orderNumber = generateOrderNumber();
    const isGuest = !req.user;
    const finalUserId = req.user?.id || null;
    const finalEmail = String(email).trim().toLowerCase();
    const guestEmail = isGuest ? finalEmail : "";

    let initialPaymentStatus = "pending";
    if (chosenMethod === "cod") {
      initialPaymentStatus = "unpaid";
    } else if (["easypaisa", "jazzcash", "bank_transfer"].includes(chosenMethod)) {
      initialPaymentStatus = "pending_verification";
    } else if (chosenMethod === "stripe") {
      initialPaymentStatus = "unpaid";
    }

    const order = await Order.create({
      orderNumber,
      userId: finalUserId,
      guestEmail,
      customerName: customerName.trim(),
      email: finalEmail,
      phone: phone.trim(),
      city: String(city || "").trim(),
      address: String(address || "").trim(),
      areaSize: String(areaSize || "").trim(),
      deliveryDate: String(deliveryDate || "").trim(),
      notes: String(notes || "").trim(),
      channel: orderChannel,
      orderSource: orderChannel,
      items: normalizedItems,
      subtotal,
      paymentMethod: chosenMethod,
      paymentStatus: initialPaymentStatus,
      orderStatus: "pending",
      transactionReference: String(transactionReference || "").trim(),
      paymentScreenshotUrl: String(paymentScreenshotUrl || "").trim(),
    });

    // 6. Channel & Payment Specific Execution
    if (orderChannel === "whatsapp") {
      // Send background emails
      sendOrderConfirmationEmail(order).catch(() => {});
      sendAdminOrderNotificationEmail(order).catch(() => {});

      return res.status(201).json({
        success: true,
        orderId: order._id,
        orderNumber: order.orderNumber,
        subtotal,
        whatsappNumber,
      });
    }

    // Website Order - Stripe Flow
    if (chosenMethod === "stripe") {
      if (!stripe) {
        return res.status(500).json({
          message: "Stripe payment gateway is currently not configured on server. Please choose Cash on Delivery, Easypaisa, or JazzCash.",
        });
      }

      try {
        const allowedFrontend = String(frontendUrl || "http://localhost:5173").split(",")[0].trim();
        const lineItems = normalizedItems.map((item) => ({
          price_data: {
            currency: stripeCurrency || "pkr",
            product_data: {
              name: item.name,
              images: item.imageUrl ? [item.imageUrl] : undefined,
            },
            unit_amount: Math.round(item.price * 100),
          },
          quantity: item.quantity,
        }));

        const session = await stripe.checkout.sessions.create({
          mode: "payment",
          customer_email: finalEmail,
          client_reference_id: String(order._id),
          metadata: {
            orderId: String(order._id),
            orderNumber: order.orderNumber,
          },
          success_url: `${allowedFrontend}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${allowedFrontend}/payment/cancel?order_id=${order._id}`,
          line_items: lineItems,
        });

        order.stripeSessionId = session.id;
        await order.save();

        return res.status(201).json({
          success: true,
          orderId: order._id,
          orderNumber: order.orderNumber,
          subtotal,
          checkoutUrl: session.url,
        });
      } catch (stripeErr) {
        console.error("Stripe Session Creation Error:", stripeErr);
        return res.status(500).json({
          message: `Stripe Checkout Error: ${stripeErr.message || "Failed to initialize payment gateway"}. Please try manual online payment or Cash on Delivery.`,
        });
      }
    }

    // Website Order - COD & Manual Payments (Easypaisa, JazzCash, Bank Transfer)
    sendOrderConfirmationEmail(order).catch(() => {});
    sendAdminOrderNotificationEmail(order).catch(() => {});

    return res.status(201).json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      subtotal,
      paymentMethod: chosenMethod,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      email: order.email,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return res.status(500).json({ message: error.message || "Internal server error while creating order" });
  }
};

const verifyStripeSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    if (!stripe) return res.status(500).json({ message: "Stripe is not configured on server" });

    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (!session) return res.status(404).json({ message: "Stripe session not found" });

    const orderId = session.metadata?.orderId || session.client_reference_id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Associated order not found" });

    if (session.payment_status === "paid") {
      const wasUnpaid = order.paymentStatus !== "paid";
      order.paymentStatus = "paid";
      order.stripePaymentIntentId = String(session.payment_intent || "");
      await order.save();

      // Email only on first transition to paid (webhook may also fire)
      if (wasUnpaid) {
        sendOrderConfirmationEmail(order).catch(() => {});
        sendAdminOrderNotificationEmail(order).catch(() => {});
      }
    }

    return res.json({
      success: true,
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      customerName: order.customerName,
      email: order.email,
      subtotal: order.subtotal,
    });
  } catch (error) {
    console.error("Verify Stripe Session Error:", error);
    return res.status(500).json({ message: error.message || "Failed to verify Stripe payment" });
  }
};

const stripeWebhook = async (req, res) => {
  if (!stripe) return res.status(500).json({ message: "Stripe not initialized" });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    if (stripeWebhookSecret && sig) {
      event = stripe.webhooks.constructEvent(req.body, sig, stripeWebhookSecret);
    } else {
      event = req.body;
    }
  } catch (err) {
    console.error("Stripe Webhook Signature Verification Failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId || session.client_reference_id;
    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.paymentStatus !== "paid") {
        order.paymentStatus = "paid";
        order.stripePaymentIntentId = String(session.payment_intent || "");
        await order.save();

        sendOrderConfirmationEmail(order).catch(() => {});
        sendAdminOrderNotificationEmail(order).catch(() => {});
      }
    }
  }

  res.json({ received: true });
};

const getMyOrders = async (req, res) => {
  try {
    const { status, paymentStatus, q } = req.query;
    const filter = { userId: req.user.id };
    if (status) filter.orderStatus = status;
    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (q) {
      const rx = new RegExp(String(q).trim(), "i");
      filter.$or = [{ orderNumber: rx }, { customerName: rx }, { city: rx }];
    }
    const orders = await Order.find(filter).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    return res.json(order);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const cancelMyOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });
    if (order.orderStatus !== "pending") {
      return res.status(400).json({
        message: "Only pending orders can be cancelled. Contact support for in-progress orders.",
      });
    }
    order.orderStatus = "cancelled";
    await order.save();
    return res.json({ success: true, order });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getMyOrderInvoice = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, userId: req.user.id });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const orderNo = order.orderNumber || String(order._id).slice(-6).toUpperCase();
    const dateStr = new Date(order.createdAt).toLocaleString("en-PK", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });
    const rows = (order.items || [])
      .map(
        (item) => `
      <tr>
        <td>${escapeHtml(item.name)}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">PKR ${Number(item.price || 0).toLocaleString()}</td>
        <td style="text-align:right">PKR ${Number((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
      </tr>`
      )
      .join("");

    const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><title>Invoice ${escapeHtml(orderNo)}</title>
<style>
  body{font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#0b2f3c;margin:40px;background:#fff}
  h1{margin:0;font-size:28px;letter-spacing:2px} .accent{color:#ff6b47}
  .meta{margin-top:24px;display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap}
  table{width:100%;border-collapse:collapse;margin-top:28px}
  th,td{padding:10px 12px;border-bottom:1px solid #e2e8f0;font-size:14px;text-align:left}
  th{background:#0b2f3c;color:#fff}
  .total{margin-top:16px;text-align:right;font-size:18px;font-weight:700}
  .badge{display:inline-block;padding:4px 10px;border-radius:999px;background:#eaf7f0;color:#1a8a55;font-size:12px;font-weight:700}
  @media print{.no-print{display:none}}
</style></head><body>
  <div class="no-print" style="margin-bottom:20px">
    <button onclick="window.print()" style="background:#0b2f3c;color:#fff;border:0;padding:10px 18px;border-radius:8px;cursor:pointer;font-weight:700">Print / Save PDF</button>
  </div>
  <h1>MAR<span class="accent">BLEX</span></h1>
  <div style="color:#7a8c99;font-size:12px;letter-spacing:2px;font-weight:700;margin-top:4px">CONSTRUCTION CHEMICAL & RUBBER INDUSTRY</div>
  <div class="meta">
    <div>
      <div><strong>Invoice / Order</strong> ${escapeHtml(orderNo)}</div>
      <div>Date: ${escapeHtml(dateStr)} (PKT)</div>
      <div style="margin-top:8px"><span class="badge">${escapeHtml(order.orderStatus)} · ${escapeHtml(order.paymentStatus)}</span></div>
    </div>
    <div>
      <div><strong>Bill To</strong></div>
      <div>${escapeHtml(order.customerName)}</div>
      <div>${escapeHtml(order.email)}</div>
      <div>${escapeHtml(order.phone)}</div>
      <div>${escapeHtml([order.address, order.city].filter(Boolean).join(", "))}</div>
    </div>
  </div>
  <table>
    <thead><tr><th>Product</th><th style="text-align:center">Qty</th><th style="text-align:right">Unit</th><th style="text-align:right">Line Total</th></tr></thead>
    <tbody>${rows || `<tr><td colspan="4">No items</td></tr>`}</tbody>
  </table>
  <div class="total">Subtotal: <span class="accent">PKR ${Number(order.subtotal || 0).toLocaleString()}</span></div>
  <p style="margin-top:28px;font-size:12px;color:#7a8c99">Payment: ${escapeHtml(String(order.paymentMethod || "").toUpperCase())}${order.transactionReference ? ` · Ref: ${escapeHtml(order.transactionReference)}` : ""}</p>
  <p style="font-size:12px;color:#9aa9b4">40-Ferozpur Road, Lahore, Pakistan · Automated invoice from MARBLEX Client Portal</p>
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(id, { orderStatus }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(id, { paymentStatus }, { new: true });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrderFulfillment = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};
    ["dispatchNote", "courierName", "trackingRef"].forEach((k) => {
      if (req.body[k] !== undefined) updates[k] = String(req.body[k] || "").trim();
    });
    const order = await Order.findByIdAndUpdate(id, updates, { new: true });
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPaymentConfig,
  uploadPaymentProof,
  createOrder,
  verifyStripeSession,
  stripeWebhook,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getMyOrderInvoice,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderFulfillment,
};
