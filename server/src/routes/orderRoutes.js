const express = require("express");
const {
  createOrder,
  verifyStripeSession,
  stripeWebhook,
  getMyOrders,
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
router.post("/stripe-webhook", express.raw({ type: "application/json" }), stripeWebhook);
router.get("/my", auth, getMyOrders);

module.exports = router;
