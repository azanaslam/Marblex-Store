const express = require("express");
const { createOrder, verifyStripeSession, getMyOrders } = require("../controllers/orderController");
const { auth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.post("/", optionalAuth, createOrder);
router.get("/verify-session/:sessionId", verifyStripeSession);
router.get("/my", auth, getMyOrders);

module.exports = router;
