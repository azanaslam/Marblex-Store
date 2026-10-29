const Coupon = require("../models/Coupon");

const validateCouponLogic = async (code, subtotal, user = null) => {
  if (!code || typeof code !== "string") {
    throw new Error("Promo code is required");
  }

  const cleanCode = code.trim().toUpperCase();
  const coupon = await Coupon.findOne({ code: cleanCode });

  if (!coupon || !coupon.active) {
    throw new Error("Invalid or expired coupon code");
  }

  const now = new Date();
  if (coupon.startsAt && now < new Date(coupon.startsAt)) {
    throw new Error("This coupon is not active yet");
  }

  if (coupon.expiresAt && now > new Date(coupon.expiresAt)) {
    throw new Error("This coupon has expired");
  }

  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    throw new Error("This coupon code has reached its maximum usage limit");
  }

  if (coupon.minOrder && subtotal < coupon.minOrder) {
    throw new Error(`Minimum order of PKR ${coupon.minOrder.toLocaleString()} required for this coupon`);
  }

  if (coupon.restrictToRoles && coupon.restrictToRoles.length > 0) {
    if (!user || !coupon.restrictToRoles.includes(user.role)) {
      throw new Error("This coupon is only available to specific account tiers");
    }
  }

  let discount = 0;
  if (coupon.type === "percent") {
    discount = Math.round((subtotal * coupon.value) / 100);
    if (coupon.maxDiscount && discount > coupon.maxDiscount) {
      discount = coupon.maxDiscount;
    }
  } else {
    discount = Math.min(coupon.value, subtotal);
  }

  return {
    valid: true,
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    discount,
  };
};

const validateCoupon = async (req, res) => {
  try {
    const { code, subtotal } = req.body;
    const result = await validateCouponLogic(code, Number(subtotal) || 0, req.user);
    return res.json({ success: true, ...result });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const adminListCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 }).lean();
    return res.json({ success: true, coupons });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminCreateCoupon = async (req, res) => {
  try {
    const { code, type, value, minOrder, maxDiscount, startsAt, expiresAt, usageLimit, active } = req.body;
    if (!code || value === undefined) {
      return res.status(400).json({ message: "Coupon code and value are required" });
    }
    const coupon = await Coupon.create({
      code: String(code).trim().toUpperCase(),
      type: type === "fixed" ? "fixed" : "percent",
      value: Number(value),
      minOrder: minOrder ? Number(minOrder) : 0,
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      startsAt: startsAt ? new Date(startsAt) : new Date(),
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      usageLimit: usageLimit ? Number(usageLimit) : null,
      active: active !== false,
    });
    return res.status(201).json({ success: true, coupon });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const adminUpdateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    if (req.body.code) req.body.code = String(req.body.code).trim().toUpperCase();
    const coupon = await Coupon.findByIdAndUpdate(id, req.body, { new: true });
    if (!coupon) return res.status(404).json({ message: "Coupon not found" });
    return res.json({ success: true, coupon });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const adminDeleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    await Coupon.findByIdAndDelete(id);
    return res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  validateCoupon,
  validateCouponLogic,
  adminListCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
};
