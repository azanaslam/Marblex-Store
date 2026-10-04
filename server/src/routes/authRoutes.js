const express = require("express");
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  ssoLogin,
  googleAuth,
  getAuthConfig,
  verify2FA,
  resend2FA,
  forgotPassword,
  verifyResetCode,
  resetPassword,
  getMyProfile,
  updateMyProfile,
  changePassword,
  setupTotp,
  confirmTotp,
  disableTotp,
  testEmailDelivery,
} = require("../controllers/authController");

const router = express.Router();

router.get("/config", getAuthConfig);
router.post("/register", register);
router.post("/login", login);
router.post("/sso-init", ssoLogin);
router.post("/google", googleAuth);
router.post("/verify-2fa", verify2FA);
router.post("/resend-2fa", resend2FA);
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-code", verifyResetCode);
router.post("/reset-password", resetPassword);
router.all("/test-email", testEmailDelivery);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);
router.post("/change-password", auth, changePassword);
router.post("/2fa/totp/setup", auth, setupTotp);
router.post("/2fa/totp/confirm", auth, confirmTotp);
router.post("/2fa/totp/disable", auth, disableTotp);

module.exports = router;

