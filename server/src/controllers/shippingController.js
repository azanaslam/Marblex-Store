const ShippingRate = require("../models/ShippingRate");

const DEFAULT_RATES = [
  { city: "Lahore", charge: 350, freeAbove: 15000, etaDays: "1-2 Business Days" },
  { city: "Karachi", charge: 750, freeAbove: 25000, etaDays: "3-5 Business Days" },
  { city: "Islamabad", charge: 500, freeAbove: 20000, etaDays: "2-3 Business Days" },
  { city: "Rawalpindi", charge: 500, freeAbove: 20000, etaDays: "2-3 Business Days" },
  { city: "Faisalabad", charge: 450, freeAbove: 18000, etaDays: "2-3 Business Days" },
  { city: "Multan", charge: 550, freeAbove: 20000, etaDays: "2-4 Business Days" },
  { city: "Peshawar", charge: 600, freeAbove: 22000, etaDays: "3-4 Business Days" },
  { city: "Other cities", charge: 800, freeAbove: 30000, etaDays: "4-6 Business Days" },
];

const getShippingRates = async (req, res) => {
  try {
    let rates = await ShippingRate.find({ active: true }).sort({ city: 1 }).lean();
    if (!rates || rates.length === 0) {
      await ShippingRate.insertMany(DEFAULT_RATES);
      rates = await ShippingRate.find({ active: true }).sort({ city: 1 }).lean();
    }
    return res.json({ success: true, rates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminListShippingRates = async (req, res) => {
  try {
    let rates = await ShippingRate.find().sort({ city: 1 }).lean();
    if (!rates || rates.length === 0) {
      await ShippingRate.insertMany(DEFAULT_RATES);
      rates = await ShippingRate.find().sort({ city: 1 }).lean();
    }
    return res.json({ success: true, rates });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

const adminCreateShippingRate = async (req, res) => {
  try {
    const { city, charge, freeAbove, etaDays } = req.body;
    if (!city || charge === undefined) {
      return res.status(400).json({ message: "City and delivery charge are required" });
    }
    const rate = await ShippingRate.create({
      city: String(city).trim(),
      charge: Number(charge),
      freeAbove: freeAbove ? Number(freeAbove) : null,
      etaDays: etaDays ? String(etaDays).trim() : "2-4 Business Days",
    });
    return res.status(201).json({ success: true, rate });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const adminUpdateShippingRate = async (req, res) => {
  try {
    const { id } = req.params;
    const rate = await ShippingRate.findByIdAndUpdate(id, req.body, { new: true });
    if (!rate) return res.status(404).json({ message: "Shipping rate not found" });
    return res.json({ success: true, rate });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const adminDeleteShippingRate = async (req, res) => {
  try {
    const { id } = req.params;
    await ShippingRate.findByIdAndDelete(id);
    return res.json({ success: true, message: "Shipping rate deleted" });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getShippingRates,
  adminListShippingRates,
  adminCreateShippingRate,
  adminUpdateShippingRate,
  adminDeleteShippingRate,
};
