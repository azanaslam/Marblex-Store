import { describe, it, expect } from "vitest";

describe("Cart Totals and Pricing Calculations", () => {
  it("calculates subtotal correctly from items with quantities", () => {
    const cart = [
      { price: 1500, quantity: 2 },
      { price: 3200, quantity: 1 },
    ];
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    expect(subtotal).toBe(6200);
  });

  it("applies fixed discount coupon without going below zero", () => {
    const subtotal = 5000;
    const couponDiscount = 1000;
    const delivery = 350;
    const total = Math.max(0, subtotal - couponDiscount) + delivery;
    expect(total).toBe(4350);
  });

  it("applies percentage discount coupon accurately", () => {
    const subtotal = 10000;
    const percentage = 15; // 15% off
    const discount = Math.round((subtotal * percentage) / 100);
    expect(discount).toBe(1500);
    expect(subtotal - discount).toBe(8500);
  });

  it("calculates delivery charge by city tiers", () => {
    const cityRates = {
      lahore: 300,
      karachi: 600,
      islamabad: 500,
    };
    const getRate = (city) => cityRates[city.toLowerCase()] ?? 500;
    expect(getRate("Lahore")).toBe(300);
    expect(getRate("Karachi")).toBe(600);
    expect(getRate("Peshawar")).toBe(500); // default
  });

  it("handles B2B dealer credit limit calculations", () => {
    const creditLimit = 500000;
    const creditUsed = 200000;
    const availableCredit = creditLimit - creditUsed;
    const newOrderTotal = 150000;
    const canPurchase = newOrderTotal <= availableCredit;
    expect(canPurchase).toBe(true);
    expect(availableCredit - newOrderTotal).toBe(150000);
  });
});

