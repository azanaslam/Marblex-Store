const express = require("express");
const { auth } = require("../middleware/auth");
const { validate, registerSchema, loginSchema } = require("../middleware/validate");
const {
  register,
  login,
  logout,
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
  requestPhoneOtpHandler,
  verifyPhoneOtpHandler,
  linkPhoneHandler,
} = require("../controllers/authController");

const {
  getRegistrationOptions,
  verifyRegistration,
  getAuthenticationOptions,
  verifyAuthentication,
  listUserPasskeys,
  deletePasskey,
} = require("../controllers/passkeyController");

const router = express.Router();

router.get("/config", getAuthConfig);
router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);
router.post("/logout", logout);
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

// Phone OTP Authentication (SMS / WhatsApp)
router.post("/phone/request-otp", requestPhoneOtpHandler);
router.post("/phone/verify-otp", verifyPhoneOtpHandler);
router.post("/phone/link", auth, linkPhoneHandler);

// WebAuthn Passkeys (Biometric / Fingerprint / Face ID)
router.get("/passkey/generate-registration-options", auth, getRegistrationOptions);
router.post("/passkey/verify-registration", auth, verifyRegistration);
router.post("/passkey/generate-authentication-options", getAuthenticationOptions);
router.post("/passkey/verify-authentication", verifyAuthentication);
router.get("/passkey/list", auth, listUserPasskeys);
router.delete("/passkey/:credentialId", auth, deletePasskey);

module.exports = router;

