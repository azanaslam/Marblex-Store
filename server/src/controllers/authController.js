const bcrypt = require("bcryptjs");
const User = require("../models/User");
const DirectMessage = require("../models/DirectMessage");
const { createToken } = require("../utils/createToken");
const { adminEmail } = require("../config/env");

const register = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required" });
  }

  const existing = await User.findOne({ email });
  if (existing) return res.status(409).json({ message: "Email already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role: "user",
    isAccessGranted: false,
  });

  return res.status(201).json({
    message: "Account created. An admin must approve your account before you can log in.",
    contactEmail: adminEmail,
    user: { id: user._id, name: user.name, email: user.email, role: user.role, isAccessGranted: false },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: "Invalid credentials" });

  if (user.isBlocked) {
    return res.status(403).json({
      code: "ACCOUNT_BLOCKED",
      message: "Your account is blocked. Contact admin.",
      contactEmail: adminEmail,
    });
  }
  if (user.role === "user" && user.isAccessGranted === false) {
    return res.status(403).json({
      code: "PENDING_APPROVAL",
      message:
        "Your account is pending admin approval. After an admin approves you in the dashboard, you can log in. You can email the admin using the button below.",
      contactEmail: adminEmail,
    });
  }

  let chatUnread = 0;
  if (user.role === "admin") {
    chatUnread = await DirectMessage.countDocuments({
      recipient: user._id,
      seenByAdmin: false,
    });
  } else {
    chatUnread = await DirectMessage.countDocuments({
      recipient: user._id,
      seenByUser: false,
    });
  }

  return res.json({
    token: createToken({ id: user._id, email: user.email, role: user.role }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccessGranted: user.isAccessGranted !== false,
    },
    chatUnread,
  });
};

module.exports = { register, login };
