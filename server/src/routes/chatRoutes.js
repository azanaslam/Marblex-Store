const express = require("express");
const { auth } = require("../middleware/auth");
const {
  sendUserMessage,
  getUserConversation,
  listBroadcasts,
  getChatUnreadCount,
  reactToMessage,
} = require("../controllers/chatController");

const router = express.Router();

router.get("/messages", auth, getUserConversation);
router.post("/messages", auth, sendUserMessage);
router.post("/messages/:messageId/react", auth, reactToMessage);
router.get("/broadcasts", auth, listBroadcasts);
router.get("/unread-count", auth, getChatUnreadCount);

module.exports = router;
