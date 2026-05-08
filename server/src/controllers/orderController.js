const Order = require("../models/Order");
const mongoose = require("mongoose");
const Stripe = require("stripe");
const { whatsappNumber, stripeSecretKey, frontendUrl } = require("../config/env");

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : null;

const createOrder = async (req, res) => {
  const { customerName, email, phone, notes, channel, items } = req.body;
  if (channel === "website" && !req.user) {
    return res.status(401).json({ message: "Please login first to continue website payment" });
  }
  if (channel === "website" && req.user?.role !== "user") {
    return res.status(403).json({ message: "Only user account can place website order" });
  }
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Cart items are required" });
  }

  const normalizedItems = items
    .map((item) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      return {
        productId: mongoose.Types.ObjectId.isValid(item.productId) ? item.productId : undefined,
        name: item.name,
        imageUrl: item.imageUrl || "",
        price: Number.isFinite(price) && price >= 0 ? price : 0,
        quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      };
    })
    .filter((item) => item.name && item.quantity > 0);

  const subtotal = normalizedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = await Order.create({
    userId: req.user?.id,
    customerName,
    email: req.user?.email || email,
    phone,
    notes: notes || "",
    channel,
    items: normalizedItems,
    subtotal,
    paymentStatus: channel === "website" ? "pending" : "paid",
  });

  if (channel === "website") {
    if (!stripe) {
      return res.status(500).json({ message: "Stripe is not configured on server" });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      customer_email: email,
      success_url: `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/payment/cancel?order_id=${order._id}`,
      metadata: { orderId: String(order._id) },
      line_items: normalizedItems.map((item) => ({
        price_data: {
          currency: "pkr",
          product_data: { name: item.name },
          unit_amount: Math.round(item.price * 100),
        },
        quantity: item.quantity,
      })),
    });

    order.stripeSessionId = session.id;
    await order.save();

    return res.status(201).json({
      orderId: order._id,
      subtotal,
      checkoutUrl: session.url,
    });
  }

  return res.status(201).json({ orderId: order._id, subtotal, whatsappNumber });
};

const verifyStripeSession = async (req, res) => {
  const { sessionId } = req.params;
  if (!stripe) return res.status(500).json({ message: "Stripe is not configured on server" });

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session) return res.status(404).json({ message: "Session not found" });

  const orderId = session.metadata?.orderId;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (session.payment_status === "paid") {
    order.paymentStatus = "paid";
    order.stripePaymentIntentId = String(session.payment_intent || "");
    await order.save();
  }

  return res.json({
    orderId: order._id,
    paymentStatus: order.paymentStatus,
    customerName: order.customerName,
    email: order.email,
  });
};

const getMyOrders = async (req, res) => {
  const orders = await Order.find({ userId: req.user.id }).sort({ createdAt: -1 });
  res.json(orders);
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

module.exports = { createOrder, verifyStripeSession, getMyOrders, updateOrderStatus, updatePaymentStatus };
