const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const {
  getApprovedReviews,
  submitReview,
  getAllReviewsAdmin,
  createReviewAdmin,
  updateReviewAdmin,
  deleteReviewAdmin,
} = require("../controllers/clientReviewController");

const router = express.Router();

router.get("/", getApprovedReviews);
router.post("/submit", submitReview);

router.get("/admin/list", auth, adminOnly, getAllReviewsAdmin);
router.post("/admin", auth, adminOnly, createReviewAdmin);
router.patch("/admin/:id", auth, adminOnly, updateReviewAdmin);
router.delete("/admin/:id", auth, adminOnly, deleteReviewAdmin);

module.exports = router;
