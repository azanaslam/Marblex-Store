/**
 * Marblex Coverage Calculator Utility
 * Pure calculation logic for material requirement and best pack combinations
 */

/**
 * Convert area between sq ft and sq meters
 */
export const convertArea = (value, fromUnit, toUnit) => {
  const val = Number(value) || 0;
  if (fromUnit === toUnit) return val;
  if (fromUnit === "sqm" && toUnit === "sqft") {
    return val * 10.7639;
  }
  if (fromUnit === "sqft" && toUnit === "sqm") {
    return val / 10.7639;
  }
  return val;
};

/**
 * Calculate total quantity required based on dimensions and product coverage specs
 *
 * @param {Object} params
 * @param {number} params.area - Area or length
 * @param {string} params.inputUnit - 'sqft' | 'sqm' | 'lm'
 * @param {string} params.coverageUnit - 'sqft' | 'sqm' | 'lm' (unit specified by product)
 * @param {number} params.perUnit - Consumption per unit (e.g. 0.25 kg per sqft or 1.5 kg per sqm)
 * @param {number} params.coats - Number of application coats (default 2)
 * @param {number} params.wastagePercent - Percentage safety/wastage margin (e.g. 10%)
 * @returns {number} Raw material quantity required (kg or litres)
 */
export const calculateTotalQuantity = ({
  area = 0,
  inputUnit = "sqft",
  coverageUnit = "sqft",
  perUnit = 0,
  coats = 1,
  wastagePercent = 10,
}) => {
  const numArea = Math.max(0, Number(area) || 0);
  const numPerUnit = Math.max(0, Number(perUnit) || 0);
  const numCoats = Math.max(1, Number(coats) || 1);
  const wastageMultiplier = 1 + Math.max(0, Number(wastagePercent) || 0) / 100;

  let normalizedArea = numArea;
  if (coverageUnit !== "lm" && inputUnit !== "lm") {
    normalizedArea = convertArea(numArea, inputUnit, coverageUnit);
  }

  const rawQty = normalizedArea * numPerUnit * numCoats * wastageMultiplier;
  return Math.ceil(rawQty * 100) / 100; // Round to 2 decimal places
};

/**
 * Greedily determine best combination of commercial package sizes
 * e.g. Needed 48kg with packSizes [5, 20] -> 2x20kg + 2x5kg = 50kg
 *
 * @param {number} neededQty
 * @param {Array<number>} packSizes - array of numbers, e.g. [5, 20]
 * @returns {Array<{ size: number, count: number }>}
 */
export const calculateBestPacks = (neededQty = 0, packSizes = []) => {
  const target = Math.max(0, Number(neededQty) || 0);
  if (target === 0) return [];

  // Filter positive numbers and sort descending
  const sizes = (packSizes || [])
    .map(Number)
    .filter((n) => !isNaN(n) && n > 0)
    .sort((a, b) => b - a);

  if (sizes.length === 0) {
    // If no pack sizes configured, return single unit
    return [{ size: Math.ceil(target), count: 1 }];
  }

  let remaining = target;
  const result = [];

  for (let i = 0; i < sizes.length; i++) {
    const size = sizes[i];
    if (i === sizes.length - 1) {
      // Smallest pack: round up to cover any residual fraction
      const count = Math.ceil(remaining / size);
      if (count > 0) {
        result.push({ size, count });
      }
      break;
    }

    const count = Math.floor(remaining / size);
    if (count > 0) {
      result.push({ size, count });
      remaining -= count * size;
    }

    if (remaining <= 0) break;
  }

  return result;
};

/**
 * Calculate total cost estimation from pack breakdown and product variants / base price
 */
export const estimatePacksCost = (packs = [], product = {}) => {
  if (!packs || !packs.length || !product) return 0;

  const variants = product.variants || [];
  let totalCost = 0;

  for (const pack of packs) {
    // Try to find matching variant by label or number in label
    const matchedVariant = variants.find(
      (v) =>
        String(v.label || "").toLowerCase().includes(String(pack.size)) ||
        String(v.sku || "").toLowerCase().includes(String(pack.size))
    );

    const unitPrice = matchedVariant ? Number(matchedVariant.price) : (Number(product.price) || 0) * (pack.size || 1);
    totalCost += unitPrice * pack.count;
  }

  return Math.round(totalCost);
};

