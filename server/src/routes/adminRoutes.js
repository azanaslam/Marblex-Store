const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const {
  getOverview,
  getAllBlogs,
  getPaidOrders,
  getWebsiteOrders,
  getWhatsappOrders,
  getUsers,
  toggleUserBlockStatus,
  toggleUserAccess,
} = require("../controllers/adminController");
const {
  getChatThreads,
  getThreadMessages,
  sendAdminReply,
  createBroadcast,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/overview", auth, adminOnly, getOverview);
router.get("/blogs", auth, adminOnly, getAllBlogs);
router.get("/orders/paid", auth, adminOnly, getPaidOrders);
router.get("/orders/website", auth, adminOnly, getWebsiteOrders);
router.get("/orders/whatsapp", auth, adminOnly, getWhatsappOrders);
router.get("/users", auth, adminOnly, getUsers);
router.patch("/users/:id/block", auth, adminOnly, toggleUserBlockStatus);
router.patch("/users/:id/access", auth, adminOnly, toggleUserAccess);
router.get("/chat/threads", auth, adminOnly, getChatThreads);
router.get("/chat/thread/:userId", auth, adminOnly, getThreadMessages);
router.post("/chat/thread/:userId", auth, adminOnly, sendAdminReply);
router.post("/broadcast", auth, adminOnly, createBroadcast);

module.exports = router;
