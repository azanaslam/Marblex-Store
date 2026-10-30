const Product = require("../models/Product");

// Ultra-fast in-memory cache for product catalog
let productsCache = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 30 * 1000; // 30 seconds fresh cache

const invalidateCache = () => {
  productsCache = null;
  cacheTimestamp = 0;
};

const getProducts = async (req, res) => {
  try {
    const filter = { active: { $ne: false } };
    if (req.query.category && req.query.category !== "All") {
      filter.category = req.query.category;
    }
    if (req.query.q && req.query.q.trim()) {
      const q = req.query.q.trim();
      filter.$or = [
        { name: { $regex: q, $options: "i" } },
        { nameUr: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ];
    }

    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);
    const isPaginated = !isNaN(page) && !isNaN(limit) && limit > 0;

    let query = Product.find(filter)
      .select("name nameUr imageUrl extraImages description descriptionUr price dealerPrice category categoryUr stock featured active variants bulkTiers coverage applications createdAt")
      .sort({ createdAt: -1 });

    let total = 0;
    if (isPaginated) {
      total = await Product.countDocuments(filter);
      const skip = (Math.max(1, page) - 1) * limit;
      query = query.skip(skip).limit(limit);
    }

    const products = await query.lean();

    // Check if requester is logged in dealer
    const user = req.user;
    const isDealer = user && user.role === "dealer";
    const discountPercent = Number(user?.dealerDiscountPercent) || 0;

    const mapped = products.map((p) => {
      let finalPrice = p.price;
      let isDealerApplied = false;

      if (isDealer) {
        if (p.dealerPrice && p.dealerPrice > 0) {
          finalPrice = p.dealerPrice;
          isDealerApplied = true;
        } else if (discountPercent > 0) {
          finalPrice = Math.round(p.price * (1 - discountPercent / 100));
          isDealerApplied = true;
        }
      }

      // Map variants if present
      const mappedVariants = (p.variants || []).map((v) => {
        let vPrice = v.price;
        if (isDealer) {
          if (v.dealerPrice && v.dealerPrice > 0) {
            vPrice = v.dealerPrice;
          } else if (discountPercent > 0) {
            vPrice = Math.round(v.price * (1 - discountPercent / 100));
          }
        }
        return {
          ...v,
          price: vPrice,
          originalPrice: v.price,
        };
      });

      return {
        ...p,
        price: finalPrice,
        originalPrice: p.price,
        isDealerPrice: isDealerApplied,
        variants: mappedVariants,
      };
    });

    res.setHeader("Cache-Control", "no-cache");
    if (isPaginated) {
      return res.json({
        products: mapped,
        total,
        page: Math.max(1, page),
        totalPages: Math.ceil(total / limit),
      });
    }
    return res.json(mapped);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products", error: error.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, active: { $ne: false } }).lean();
    if (!product) return res.status(404).json({ message: "Product not found" });

    const user = req.user;
    const isDealer = user && user.role === "dealer";
    const discountPercent = Number(user?.dealerDiscountPercent) || 0;

    let finalPrice = product.price;
    let isDealerApplied = false;

    if (isDealer) {
      if (product.dealerPrice && product.dealerPrice > 0) {
        finalPrice = product.dealerPrice;
        isDealerApplied = true;
      } else if (discountPercent > 0) {
        finalPrice = Math.round(product.price * (1 - discountPercent / 100));
        isDealerApplied = true;
      }
    }

    const mappedVariants = (product.variants || []).map((v) => {
      let vPrice = v.price;
      if (isDealer) {
        if (v.dealerPrice && v.dealerPrice > 0) {
          vPrice = v.dealerPrice;
        } else if (discountPercent > 0) {
          vPrice = Math.round(v.price * (1 - discountPercent / 100));
        }
      }
      return {
        ...v,
        price: vPrice,
        originalPrice: v.price,
      };
    });

    return res.json({
      ...product,
      price: finalPrice,
      originalPrice: product.price,
      isDealerPrice: isDealerApplied,
      variants: mappedVariants,
    });
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
