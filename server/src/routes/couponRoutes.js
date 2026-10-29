const express = require("express");
const { auth, optionalAuth, adminOnly } = require("../middleware/auth");
const {
  validateCoupon,
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} = require("../controllers/couponController");

const router = express.Router();

router.post("/validate", optionalAuth, validateCoupon);
router.get("/admin", auth, adminOnly, adminListCoupons);
router.post("/admin", auth, adminOnly, adminCreateCoupon);
router.put("/admin/:id", auth, adminOnly, adminUpdateCoupon);
router.delete("/admin/:id", auth, adminOnly, adminDeleteCoupon);

module.exports = router;

