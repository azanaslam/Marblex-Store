const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const {
  getShippingRates,
  adminListShippingRates,
  adminCreateShippingRate,
  adminUpdateShippingRate,
  adminDeleteShippingRate,
} = require("../controllers/shippingController");

const router = express.Router();

router.get("/rates", getShippingRates);
router.get("/admin/rates", auth, adminOnly, adminListShippingRates);
router.post("/admin/rates", auth, adminOnly, adminCreateShippingRate);
router.put("/admin/rates/:id", auth, adminOnly, adminUpdateShippingRate);
router.delete("/admin/rates/:id", auth, adminOnly, adminDeleteShippingRate);

module.exports = router;
