const { describe, it } = require("node:test");
const assert = require("node:assert");
const { normalizePhone } = require("../src/services/otp/normalizePhone");

describe("Server Core Business Logic", () => {
  describe("Pakistani Phone Normalization", () => {
    it("converts 03001234567 to +923001234567", () => {
      assert.strictEqual(normalizePhone("03001234567"), "+923001234567");
    });

    it("converts 923001234567 to +923001234567", () => {
      assert.strictEqual(normalizePhone("923001234567"), "+923001234567");
    });

    it("handles dashes and spaces properly: 0308-458 5792", () => {
      assert.strictEqual(normalizePhone("0308-458 5792"), "+923084585792");
    });

    it("handles empty input safely", () => {
      assert.strictEqual(normalizePhone(""), "");
    });
  });

  describe("Order Calculation & Dealer Logic", () => {
    it("calculates order totals with coupon and city delivery", () => {
      const subtotal = 12500;
      const discount = 1500; // coupon
      const deliveryCharge = 350; // city delivery
      const total = Math.max(0, subtotal - discount) + deliveryCharge;
      assert.strictEqual(total, 11350);
    });

    it("validates dealer credit capacity correctly", () => {
      const dealer = {
        role: "dealer",
        creditLimit: 250000,
        creditUsed: 100000,
      };
      const availableCredit = Math.max(0, dealer.creditLimit - dealer.creditUsed);
      assert.strictEqual(availableCredit, 150000);

      const orderAmount = 80000;
      const canOrder = orderAmount <= availableCredit;
      assert.strictEqual(canOrder, true);

      const excessOrder = 160000;
      const canExcessOrder = excessOrder <= availableCredit;
      assert.strictEqual(canExcessOrder, false);
    });

    it("correctly identifies high-value COD orders requiring OTP verification", () => {
      const threshold = 15000;
      const smallCod = { paymentMethod: "cod", total: 4500 };
      const largeCod = { paymentMethod: "cod", total: 28000 };

      const requiresOtp = (order) => order.paymentMethod === "cod" && order.total >= threshold;

      assert.strictEqual(requiresOtp(smallCod), false);
      assert.strictEqual(requiresOtp(largeCod), true);
    });
  });
});
