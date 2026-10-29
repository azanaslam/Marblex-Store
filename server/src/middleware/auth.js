const jwt = require("jsonwebtoken");
const { jwtSecret } = require("../config/env");
const User = require("../models/User");

const extractToken = (req) => {
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }
  const header = req.headers.authorization || "";
  if (header.startsWith("Bearer ")) {
    return header.slice(7);
  }
  return "";
};

const auth = async (req, res, next) => {
  const token = extractToken(req);
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser) return res.status(401).json({ message: "Invalid user" });
    if (dbUser.isBlocked) return res.status(403).json({ message: "Your account is blocked. Contact admin." });
    if (dbUser.role === "user" && dbUser.isAccessGranted === false) {
      return res.status(403).json({ message: "Your account is pending admin approval." });
    }
    req.user = {
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      dealerDiscountPercent: dbUser.dealerDiscountPercent || 0,
      creditLimit: dbUser.creditLimit || 0,
      creditUsed: dbUser.creditUsed || 0,
    };
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

const optionalAuth = async (req, _, next) => {
  const token = extractToken(req);
  if (!token) return next();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    const dbUser = await User.findById(decoded.id);
    if (!dbUser || dbUser.isBlocked || (dbUser.role === "user" && dbUser.isAccessGranted === false)) {
      req.user = null;
      return next();
    }
    req.user = {
      id: dbUser._id,
      email: dbUser.email,
      role: dbUser.role,
      dealerDiscountPercent: dbUser.dealerDiscountPercent || 0,
      creditLimit: dbUser.creditLimit || 0,
      creditUsed: dbUser.creditUsed || 0,
    };
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

const staffOnly = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "subowner")) {
    return res.status(403).json({ message: "Staff access required" });
  }
  return next();
};

module.exports = { auth, optionalAuth, adminOnly, staffOnly };
