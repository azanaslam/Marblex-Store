import { describe, it, expect } from "vitest";
import {
  convertArea,
  calculateTotalQuantity,
  calculateBestPacks,
  estimatePacksCost,
} from "./coverageCalculator";

describe("coverageCalculator utility", () => {
  it("converts area correctly between sqm and sqft", () => {
    expect(convertArea(10, "sqm", "sqft")).toBeCloseTo(107.639, 2);
    expect(convertArea(107.639, "sqft", "sqm")).toBeCloseTo(10, 2);
    expect(convertArea(50, "sqft", "sqft")).toBe(50);
  });

  it("calculates total required quantity accurately with coats and wastage", () => {
    // 100 sqft, 0.2 kg/sqft, 2 coats, 10% wastage = 100 * 0.2 * 2 * 1.1 = 44 kg
    const qty = calculateTotalQuantity({
      area: 100,
      inputUnit: "sqft",
      coverageUnit: "sqft",
      perUnit: 0.2,
      coats: 2,
      wastagePercent: 10,
    });
    expect(qty).toBe(44);
  });

  it("calculates best pack breakdown greedily", () => {
    // Needed 48kg with packs [5, 20] -> 2x20kg (40kg) + 2x5kg (10kg) = 50kg
    const packs = calculateBestPacks(48, [5, 20]);
    expect(packs).toEqual([
      { size: 20, count: 2 },
      { size: 5, count: 2 },
    ]);
  });

  it("estimates cost according to packs and matching product variants", () => {
    const product = {
      price: 500,
      variants: [
        { label: "5kg Can", price: 2500 },
        { label: "20kg Drum", price: 9000 },
      ],
    };
    const packs = [
      { size: 20, count: 2 }, // 2 * 9000 = 18000
      { size: 5, count: 1 },  // 1 * 2500 = 2500
    ];
    const cost = estimatePacksCost(packs, product);
    expect(cost).toBe(20500);
  });
});

