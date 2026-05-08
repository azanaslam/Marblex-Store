const express = require("express");
const { whatsappNumber } = require("../config/env");
const authRoutes = require("./authRoutes");
const productRoutes = require("./productRoutes");
const blogRoutes = require("./blogRoutes");
const orderRoutes = require("./orderRoutes");
const adminRoutes = require("./adminRoutes");
const chatRoutes = require("./chatRoutes");
const productReviewRoutes = require("./productReviewRoutes");
const contactRoutes = require("./contact");

const router = express.Router();

router.get("/health", (_, res) => res.json({ ok: true, whatsappNumber }));
router.use("/auth", authRoutes);
router.use("/products", productRoutes);
router.use("/blogs", blogRoutes);
router.use("/orders", orderRoutes);
router.use("/admin", adminRoutes);
router.use("/chat", chatRoutes);
router.use("/product-reviews", productReviewRoutes);
router.use("/contact", contactRoutes);

module.exports = router;
