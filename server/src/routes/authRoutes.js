const express = require("express");
const { auth } = require("../middleware/auth");
const {
  register,
  login,
  verify2FA,
  resend2FA,
  forgotPassword,
  resetPassword,
  getMyProfile,
  updateMyProfile,
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/verify-2fa", verify2FA);
router.post("/resend-2fa", resend2FA);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", auth, getMyProfile);
router.put("/me", auth, updateMyProfile);

module.exports = router;

