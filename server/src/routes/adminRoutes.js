const express = require("express");
const { auth, adminOnly, staffOnly } = require("../middleware/auth");
const {
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
  getEmailConfig,
  updateEmailConfig,
} = require("../controllers/adminController");
const {
  getChatThreads,
  getThreadMessages,
  sendAdminReply,
  createBroadcast,
} = require("../controllers/chatController");
const { updateOrderStatus, updatePaymentStatus } = require("../controllers/orderController");

const router = express.Router();

router.get("/overview", auth, adminOnly, getOverview);
router.get("/blogs", auth, adminOnly, getAllBlogs);
router.get("/orders/paid", auth, adminOnly, getPaidOrders);
router.get("/orders/website", auth, adminOnly, getWebsiteOrders);
router.get("/orders/whatsapp", auth, adminOnly, getWhatsappOrders);
router.get("/orders/all", auth, adminOnly, getAllOrders);
router.patch("/orders/:id/status", auth, adminOnly, updateOrderStatus);
router.patch("/orders/:id/payment", auth, adminOnly, updatePaymentStatus);
router.get("/users", auth, adminOnly, getUsers);
router.patch("/users/:id/block", auth, adminOnly, toggleUserBlockStatus);
router.patch("/users/:id/access", auth, adminOnly, toggleUserAccess);
router.patch("/users/:id/role", auth, adminOnly, updateUserRole);
router.get("/chat/threads", auth, staffOnly, getChatThreads);
router.get("/chat/thread/:userId", auth, staffOnly, getThreadMessages);
router.post("/chat/thread/:userId", auth, staffOnly, sendAdminReply);
router.post("/broadcast", auth, staffOnly, createBroadcast);
router.get("/email-settings", auth, adminOnly, getEmailConfig);
router.post("/email-settings", auth, adminOnly, updateEmailConfig);

module.exports = router;
