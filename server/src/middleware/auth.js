const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

const auth = async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) return res.status(401).json({ message: "Invalid user" });
    if (dbUser.isBlocked) return res.status(403).json({ message: "Your account is blocked. Contact admin." });
    if (dbUser.role === "user" && dbUser.isAccessGranted === false) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }
    req.user = { id: dbUser._id, email: dbUser.email, role: dbUser.role };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const optionalAuth = async (req, _, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser || dbUser.isBlocked || (dbUser.role === "user" && dbUser.isAccessGranted === false)) {
      req.user = null;
      return next();
    }
    req.user = { id: dbUser._id, email: dbUser.email, role: dbUser.role };
  } catch (error) {
    req.user = null;
  }
  return next();
};

const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  return next();
};

module.exports = { auth, optionalAuth, adminOnly };
