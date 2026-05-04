const mongoose = require("mongoose");
const User = require("../models/User");
const DirectMessage = require("../models/DirectMessage");
const Broadcast = require("../models/Broadcast");

const messageReactionPopulate = {
  path: "reactions.user",
  select: "name email role",
};

const getAdminId = async () => {
  const admin = await User.findOne({ role: "admin" }).select("_id");
  if (!admin) {
    const err = new Error("No admin account found");
    err.statusCode = 500;
    throw err;
  }
  return admin._id;
};

const sendUserMessage = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ message: "Use the admin Chats tab to reply to users." });
    }
    const { body } = req.body;
    if (!body || !String(body).trim()) {
      return res.status(400).json({ message: "Message is required" });
    }
    const adminId = await getAdminId();
    const msg = await DirectMessage.create({
      sender: req.user.id,
      recipient: adminId,
      body: String(body).trim(),
      seenByAdmin: false,
      seenByUser: true,
    });
    const populated = await DirectMessage.findById(msg._id)
      .populate("sender", "name email role")
      .populate("recipient", "name email role")
      .populate(messageReactionPopulate);
    return res.status(201).json(populated);
  } catch (e) {
    if (e.statusCode === 500) return res.status(500).json({ message: e.message });
    throw e;
  }
};

const getUserConversation = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.status(400).json({ message: "Use admin chat threads." });
    }
    const adminId = await getAdminId();
    const uid = req.user.id;
    const messages = await DirectMessage.find({
      $or: [
        { sender: uid, recipient: adminId },
        { sender: adminId, recipient: uid },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "name email role")
      .populate("recipient", "name email role")
      .populate(messageReactionPopulate);

    await DirectMessage.updateMany(
      { sender: adminId, recipient: uid, seenByUser: false },
      { $set: { seenByUser: true } }
    );

    return res.json(messages);
  } catch (e) {
    if (e.statusCode === 500) return res.status(500).json({ message: e.message });
    return res.status(500).json({ message: "Could not load messages" });
  }
};

const getChatThreads = async (req, res) => {
  const adminId = req.user.id;

  const messages = await DirectMessage.find({
    $or: [{ recipient: adminId }, { sender: adminId }],
  })
    .sort({ createdAt: -1 })
    .limit(800)
    .populate("sender", "name email role")
    .populate("recipient", "name email role");

  const threadMap = new Map();
  const aid = adminId.toString();

  for (const m of messages) {
    const sid = m.sender._id.toString();
    const rid = m.recipient._id.toString();
    const otherId = sid === aid ? rid : sid;
    if (!threadMap.has(otherId)) {
      const otherUser = sid === aid ? m.recipient : m.sender;
      threadMap.set(otherId, {
        userId: otherId,
        user: otherUser,
        lastMessage: m,
        lastAt: m.createdAt,
      });
    }
  }

  const threads = [...threadMap.values()].sort((a, b) => new Date(b.lastAt) - new Date(a.lastAt));

  for (const t of threads) {
    t.unreadCount = await DirectMessage.countDocuments({
      sender: t.userId,
      recipient: adminId,
      seenByAdmin: false,
    });
  }

  return res.json(threads);
};

const getThreadMessages = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const adminId = req.user.id;

  const messages = await DirectMessage.find({
    $or: [
      { sender: adminId, recipient: userId },
      { sender: userId, recipient: adminId },
    ],
  })
    .sort({ createdAt: 1 })
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate(messageReactionPopulate);

  await DirectMessage.updateMany(
    { sender: userId, recipient: adminId, seenByAdmin: false },
    { $set: { seenByAdmin: true } }
  );

  return res.json(messages);
};

const sendAdminReply = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user id" });
  }
  const { body } = req.body;
  if (!body || !String(body).trim()) {
    return res.status(400).json({ message: "Message is required" });
  }
  const target = await User.findById(userId);
  if (!target || target.role === "admin") {
    return res.status(400).json({ message: "Cannot send to this user" });
  }
  const msg = await DirectMessage.create({
    sender: req.user.id,
    recipient: userId,
    body: String(body).trim(),
    seenByAdmin: true,
    seenByUser: false,
  });
  const populated = await DirectMessage.findById(msg._id)
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate(messageReactionPopulate);
  return res.status(201).json(populated);
};

const createBroadcast = async (req, res) => {
  const { message } = req.body;
  if (!message || !String(message).trim()) {
    return res.status(400).json({ message: "Message is required" });
  }
  const b = await Broadcast.create({
    message: String(message).trim(),
    createdBy: req.user.id,
  });
  const populated = await Broadcast.findById(b._id).populate("createdBy", "name email");
  return res.status(201).json(populated);
};

const listBroadcasts = async (req, res) => {
  const items = await Broadcast.find()
    .sort({ createdAt: -1 })
    .limit(100)
    .populate("createdBy", "name email");
  return res.json(items);
};

const reactToMessage = async (req, res) => {
  const { messageId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    return res.status(400).json({ message: "Invalid message id" });
  }
  let emoji = req.body?.emoji;
  if (emoji == null || typeof emoji !== "string") {
    return res.status(400).json({ message: "Emoji is required" });
  }
  emoji = String(emoji).trim();
  if (!emoji || [...emoji].length > 8) {
    return res.status(400).json({ message: "Invalid emoji" });
  }

  const msg = await DirectMessage.findById(messageId);
  if (!msg) return res.status(404).json({ message: "Message not found" });

  const uid = String(req.user.id);
  if (String(msg.sender) !== uid && String(msg.recipient) !== uid) {
    return res.status(403).json({ message: "Not allowed" });
  }

  const reactions = Array.isArray(msg.reactions) ? msg.reactions.map((r) => ({ user: r.user, emoji: r.emoji })) : [];
  const idx = reactions.findIndex((r) => String(r.user) === uid);
  if (idx >= 0 && reactions[idx].emoji === emoji) {
    reactions.splice(idx, 1);
  } else if (idx >= 0) {
    reactions[idx].emoji = emoji;
  } else {
    reactions.push({ user: req.user.id, emoji });
  }

  msg.reactions = reactions;
  await msg.save();

  const populated = await DirectMessage.findById(msg._id)
    .populate("sender", "name email role")
    .populate("recipient", "name email role")
    .populate(messageReactionPopulate);
  return res.json(populated);
};

const getChatUnreadCount = async (req, res) => {
  if (req.user.role === "admin") {
    const count = await DirectMessage.countDocuments({
      recipient: req.user.id,
      seenByAdmin: false,
    });
    return res.json({ count });
  }
  const count = await DirectMessage.countDocuments({
    recipient: req.user.id,
    seenByUser: false,
  });
  return res.json({ count });
};

module.exports = {
  sendUserMessage,
  getUserConversation,
  getChatThreads,
  getThreadMessages,
  sendAdminReply,
  createBroadcast,
  listBroadcasts,
  getChatUnreadCount,
  reactToMessage,
};
