const ClientReview = require("../models/ClientReview");

const sanitizePublic = (doc) => ({
  _id: doc._id,
  name: doc.name,
  role: doc.role,
  company: doc.company,
  quote: doc.quote,
  rating: doc.rating,
  featured: doc.featured,
  createdAt: doc.createdAt,
});

const getApprovedReviews = async (_, res) => {
  try {
    const reviews = await ClientReview.find({ status: "approved" })
      .sort({ featured: -1, createdAt: -1 })
      .limit(24)
      .lean();
    return res.json(reviews.map(sanitizePublic));
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reviews" });
  }
};

const submitReview = async (req, res) => {
  try {
    const { name, role, company, quote, rating, email, phone } = req.body || {};

    if (!name?.trim() || !role?.trim() || !company?.trim() || !quote?.trim()) {
      return res.status(400).json({ message: "Name, role, company, and review text are required." });
    }

    const parsedRating = Math.min(5, Math.max(1, Number(rating) || 5));

    const review = await ClientReview.create({
      name: name.trim().slice(0, 80),
      role: role.trim().slice(0, 80),
      company: company.trim().slice(0, 100),
      quote: quote.trim().slice(0, 800),
      rating: parsedRating,
      email: (email || "").trim().slice(0, 120),
      phone: (phone || "").trim().slice(0, 40),
      status: "pending",
      source: "website",
    });

    return res.status(201).json({
      success: true,
      message: "Thank you. Your review was submitted and is pending approval.",
      id: review._id,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to submit review" });
  }
};

const getAllReviewsAdmin = async (_, res) => {
  try {
    const reviews = await ClientReview.find().sort({ createdAt: -1 }).lean();
    return res.json(reviews);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load reviews" });
  }
};

const createReviewAdmin = async (req, res) => {
  try {
    const { name, role, company, quote, rating, email, phone, status, featured } = req.body || {};

    if (!name?.trim() || !role?.trim() || !company?.trim() || !quote?.trim()) {
      return res.status(400).json({ message: "Name, role, company, and review text are required." });
    }

    const review = await ClientReview.create({
      name: name.trim(),
      role: role.trim(),
      company: company.trim(),
      quote: quote.trim(),
      rating: Math.min(5, Math.max(1, Number(rating) || 5)),
      email: (email || "").trim(),
      phone: (phone || "").trim(),
      status: ["pending", "approved", "rejected"].includes(status) ? status : "approved",
      featured: Boolean(featured),
      source: "admin",
    });

    return res.status(201).json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to create review" });
  }
};

const updateReviewAdmin = async (req, res) => {
  try {
    const allowed = ["name", "role", "company", "quote", "rating", "email", "phone", "status", "featured"];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (patch.rating !== undefined) {
      patch.rating = Math.min(5, Math.max(1, Number(patch.rating) || 5));
    }

    const review = await ClientReview.findByIdAndUpdate(req.params.id, patch, { new: true });
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json(review);
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to update review" });
  }
};

const deleteReviewAdmin = async (req, res) => {
  try {
    const review = await ClientReview.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message || "Failed to delete review" });
  }
};

module.exports = {
  getApprovedReviews,
  submitReview,
  getAllReviewsAdmin,
  createReviewAdmin,
  updateReviewAdmin,
  deleteReviewAdmin,
};
