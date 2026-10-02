const bcrypt = require("bcryptjs");
const User = require("../models/User");
const DirectMessage = require("../models/DirectMessage");
const { createToken } = require("../utils/createToken");
const {
  send2FACodeEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
} = require("../utils/sendEmail");
const { adminEmail } = require("../config/env");

const generate6DigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const register = async (req, res) => {
  const { name, email, password, phone, company, industryType, city } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Full name, email address, and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const existing = await User.findOne({ email: normalizedEmail });
  if (existing) return res.status(409).json({ message: "An account with this email address already exists" });

  const passwordHash = await bcrypt.hash(password, 10);
  const twoFactorCode = generate6DigitCode();
  const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  const user = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    passwordHash,
    phone: phone ? String(phone).trim() : "",
    company: company ? String(company).trim() : "",
    industryType: industryType ? String(industryType).trim() : "Waterproofing & Construction",
    city: city ? String(city).trim() : "",
    role: "user",
    isAccessGranted: true, // Allow approved access after 2FA
    twoFactorCode,
    twoFactorExpires,
    isEmailVerified: false,
  });

  // Send 2FA Verification Code Email for registration (non-blocking)
  send2FACodeEmail(user.email, twoFactorCode, user.name, "Account Registration").catch((err) =>
    console.error("[MARBLEX Register] 2FA Email error:", err.message)
  );

  return res.status(201).json({
    requires2FA: true,
    email: user.email,
    message: "Account created! A 6-digit verification code has been sent to your email.",
    contactEmail: adminEmail,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      company: user.company,
      industryType: user.industryType,
      city: user.city,
    },
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: "Invalid email or password" });

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) return res.status(401).json({ message: "Invalid email or password" });

  if (user.isBlocked) {
    return res.status(403).json({
      code: "ACCOUNT_BLOCKED",
      message: "Your account is blocked. Please contact the administrator.",
      contactEmail: adminEmail,
    });
  }

  if (user.role === "user" && user.isAccessGranted === false) {
    return res.status(403).json({
      code: "PENDING_APPROVAL",
      message:
        "Your account is pending admin approval. You can contact the admin using the link below.",
      contactEmail: adminEmail,
    });
  }

  // Generate 2FA Code
  const twoFactorCode = generate6DigitCode();
  user.twoFactorCode = twoFactorCode;
  user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
  await user.save();

  // Send verification code email non-blocking for instant UI response
  send2FACodeEmail(user.email, twoFactorCode, user.name, "Account Sign-In 2FA").catch((err) =>
    console.error("[MARBLEX 2FA Login] Email dispatch error:", err.message)
  );

  return res.json({
    requires2FA: true,
    email: user.email,
    message: "A 6-digit verification code has been sent to your email.",
  });
};

const verify2FA = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and 6-digit verification code are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.twoFactorCode || !user.twoFactorExpires) {
    return res.status(400).json({ message: "No active verification request found. Please login again." });
  }

  if (new Date() > new Date(user.twoFactorExpires)) {
    return res.status(400).json({ message: "Verification code has expired. Please request a new code." });
  }

  if (user.twoFactorCode.trim() !== String(code).trim()) {
    return res.status(400).json({ message: "Incorrect 6-digit verification code. Please check and try again." });
  }

  const isNewlyVerified = !user.isEmailVerified;

  // Clear 2FA code & mark email verified
  user.twoFactorCode = null;
  user.twoFactorExpires = null;
  user.isEmailVerified = true;
  await user.save();

  // Send Welcome Email if newly registered & verified
  if (isNewlyVerified) {
    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error("[MARBLEX] Welcome email error:", err.message)
    );
  }

  // Send Login Security Alert Email on successful sign in
  const userAgent = req.headers["user-agent"] || "Web Browser";
  sendLoginAlertEmail(user.email, user.name, {
    ip: req.ip || req.connection?.remoteAddress,
    userAgent,
  }).catch((err) => console.error("[MARBLEX] Login alert error:", err.message));

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
    message: "Authentication successful.",
    token: createToken({ id: user._id, email: user.email, role: user.role }),
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAccessGranted: user.isAccessGranted !== false,
      avatarUrl: user.avatarUrl || "",
      phone: user.phone || "",
      company: user.company || "",
      industryType: user.industryType || "",
      city: user.city || "",
      gender: user.gender || "prefer_not_to_say",
    },
    chatUnread,
  });
};

const resend2FA = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: "User not found" });

  const twoFactorCode = generate6DigitCode();
  user.twoFactorCode = twoFactorCode;
  user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  send2FACodeEmail(user.email, twoFactorCode, user.name, "Verification Code Resend").catch((err) =>
    console.error("[MARBLEX Resend 2FA] Email error:", err.message)
  );

  return res.json({
    success: true,
    message: "A new 6-digit verification code has been dispatched to your email.",
  });
};

const ssoLogin = async (req, res) => {
  const { email, name, provider } = req.body;
  if (!email) return res.status(400).json({ message: "Email address is required" });

  const normalizedEmail = email.toLowerCase().trim();
  let user = await User.findOne({ email: normalizedEmail });

  const twoFactorCode = generate6DigitCode();
  const twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

  if (!user) {
    const passwordHash = await bcrypt.hash("sso_enterprise_verified_" + Date.now(), 10);
    const displayName = name || (provider ? `${provider.charAt(0).toUpperCase() + provider.slice(1)} Verified Client` : "Enterprise Client");
    const isAdmin = normalizedEmail.includes("admin") || normalizedEmail === "marblexpak@gmail.com";

    user = await User.create({
      name: displayName,
      email: normalizedEmail,
      passwordHash,
      company: "Enterprise Partner",
      role: isAdmin ? "admin" : "user",
      isAccessGranted: true,
      twoFactorCode,
      twoFactorExpires,
      isEmailVerified: false,
    });
  } else {
    user.twoFactorCode = twoFactorCode;
    user.twoFactorExpires = twoFactorExpires;
    await user.save();
  }

  // Dispatch 2FA verification email to the user
  const providerLabel = provider ? provider.toUpperCase() : "SSO";
  send2FACodeEmail(user.email, twoFactorCode, user.name, `${providerLabel} Sign-In 2FA`).catch((err) =>
    console.error("[MARBLEX SSO 2FA] Email error:", err.message)
  );

  return res.json({
    requires2FA: true,
    email: user.email,
    message: `A 6-digit verification code has been sent to ${user.email}.`,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email address is required" });

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    // For security, respond with success message
    return res.json({ success: true, message: "If an account exists with this email, a reset code has been sent." });
  }

  const resetCode = generate6DigitCode();
  user.twoFactorCode = resetCode;
  user.twoFactorExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save();

  sendPasswordResetEmail(user.email, resetCode, user.name).catch((err) =>
    console.error("[MARBLEX Forgot Password] Email error:", err.message)
  );

  return res.json({
    success: true,
    message: "A 6-digit password reset code has been sent to your email.",
  });
};

const verifyResetCode = async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) {
    return res.status(400).json({ message: "Email and 6-digit reset code are required" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.twoFactorCode || !user.twoFactorExpires) {
    return res.status(400).json({ message: "No active password reset request. Please request a new code." });
  }

  if (new Date() > new Date(user.twoFactorExpires)) {
    return res.status(400).json({ message: "Password reset code has expired. Please request a new one." });
  }

  if (user.twoFactorCode.trim() !== String(code).trim()) {
    return res.status(400).json({ message: "Incorrect 6-digit reset code. Please check and try again." });
  }

  return res.json({
    success: true,
    message: "Reset code verified. You can now set a new password.",
  });
};

const resetPassword = async (req, res) => {
  const { email, code, newPassword } = req.body;
  if (!email || !code || !newPassword) {
    return res.status(400).json({ message: "Email, reset code, and new password are required" });
  }

  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters" });
  }

  const normalizedEmail = email.toLowerCase().trim();
  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(404).json({ message: "User not found" });

  if (!user.twoFactorCode || !user.twoFactorExpires) {
    return res.status(400).json({ message: "No active password reset request. Please request a new code." });
  }

  if (new Date() > new Date(user.twoFactorExpires)) {
    return res.status(400).json({ message: "Password reset code has expired. Please request a new one." });
  }

  if (user.twoFactorCode.trim() !== String(code).trim()) {
    return res.status(400).json({ message: "Invalid 6-digit reset code." });
  }

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.twoFactorCode = null;
  user.twoFactorExpires = null;
  await user.save();

  return res.json({
    success: true,
    message: "Password reset successful! You can now log in with your new password.",
  });
};

const getMyProfile = async (req, res) => {
  const user = await User.findById(req.user.id).select("-passwordHash");
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json(user);
};

const updateMyProfile = async (req, res) => {
  const updates = {
    name: String(req.body?.name || "").trim(),
    phone: String(req.body?.phone || "").trim(),
    company: String(req.body?.company || "").trim(),
    industryType: String(req.body?.industryType || "").trim(),
    city: String(req.body?.city || "").trim(),
    ntn: String(req.body?.ntn || "").trim(),
    strn: String(req.body?.strn || "").trim(),
    avatarUrl: String(req.body?.avatarUrl || "").trim(),
    gender: String(req.body?.gender || "prefer_not_to_say"),
  };
  if (!updates.name) {
    return res.status(400).json({ message: "Name is required" });
  }
  const allowedGenders = ["male", "female", "other", "prefer_not_to_say"];
  if (!allowedGenders.includes(updates.gender)) updates.gender = "prefer_not_to_say";
  const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true }).select("-passwordHash -twoFactorCode");
  return res.json(user);
};

const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: "Current password and new password are required" });
  }
  if (String(newPassword).length < 6) {
    return res.status(400).json({ message: "New password must be at least 6 characters" });
  }
  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: "User not found" });
  const ok = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: "Current password is incorrect" });
  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();
  return res.json({ success: true, message: "Password updated successfully" });
};

const testEmailDelivery = async (req, res) => {
  try {
    const targetEmail = req.body?.email || req.query?.email || "azanaslam907@gmail.com";
    const testCode = generate6DigitCode();
    const result = await send2FACodeEmail(targetEmail, testCode, "Administrator", "Email Delivery Verification Test");
    
    return res.json({
      success: result.success !== false,
      provider: result.provider || (result.simulated ? "Simulated (No credentials)" : "Unknown Provider"),
      message: `Test email dispatched to ${targetEmail}`,
      details: result,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

module.exports = {
  register,
  login,
  ssoLogin,
  verify2FA,
  resend2FA,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  changePassword,
  testEmailDelivery,
};



