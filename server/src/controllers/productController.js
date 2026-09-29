const Product = require("../models/Product");

// Ultra-fast in-memory cache for product catalog
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

const invalidateCache = () => {
  productsCache = null;
  cacheTimestamp = 0;
};

const getProducts = async (_, res) => {
  try {
    const now = Date.now();
    if (productsCache && (now - cacheTimestamp < CACHE_TTL_MS)) {
      res.setHeader("X-Cache-Status", "HIT");
      res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
      return res.json(productsCache);
    }

    // High performance query with .lean() to bypass Mongoose hydration overhead
    const products = await Product.find({ active: { $ne: false } })
      .select("name imageUrl extraImages description price category stock featured active createdAt")
      .sort({ createdAt: -1 })
      .lean();

    productsCache = products;
    cacheTimestamp = now;

    res.setHeader("X-Cache-Status", "MISS");
    res.setHeader("Cache-Control", "public, max-age=30, stale-while-revalidate=60");
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: { $ne: false } }).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    return res.json(product);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch product", error: error.message });
  }
};

const createProduct = async (req, res) => {
  try {
    const product = await Product.create(req.body);
    invalidateCache();
    return res.status(201).json(product);
  } catch (error) {
    return res.status(400).json({ message: "Failed to create product", error: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true }).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });
    invalidateCache();
    return res.json(product);
  } catch (error) {
    return res.status(400).json({ message: "Failed to update product", error: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: "Product not found" });
    invalidateCache();
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete product", error: error.message });
  }
};

module.exports = { 
  getProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct, 
  invalidateCache 
};
