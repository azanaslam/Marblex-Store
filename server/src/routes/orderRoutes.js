const express = require("express");
const {
  createOrder,
  verifyStripeSession,
  getMyOrders,
  getMyOrderById,
  cancelMyOrder,
  getMyOrderInvoice,
  getPaymentConfig,
  uploadPaymentProof,
} = require("../controllers/orderController");
const { auth, optionalAuth } = require("../middleware/auth");
const { orderRateLimiter } = require("../middleware/rateLimiter");

const router = express.Router();

router.get("/payment-config", getPaymentConfig);
router.post("/upload-proof", uploadPaymentProof);
router.post("/", orderRateLimiter(), optionalAuth, createOrder);
router.get("/verify-session/:sessionId", verifyStripeSession);
// Stripe webhook is mounted in app.js with raw body (before express.json)
router.get("/my", auth, getMyOrders);
router.get("/my/:id/invoice", auth, getMyOrderInvoice);
router.get("/my/:id", auth, getMyOrderById);
router.post("/my/:id/cancel", auth, cancelMyOrder);

module.exports = router;
