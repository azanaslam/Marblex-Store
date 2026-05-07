const express = require("express");
const { auth, adminOnly } = require("../middleware/auth");
const {
  createSubmission,
  getMySubmissions,
  getMySubmissionById,
  updateMySubmission,
  deleteMySubmission,
  addSubmissionComment,
  reactSubmissionComment,
  updateSubmissionComment,
  deleteSubmissionComment,
  getAdminSubmissions,
  updateSubmissionStatus,
  publishSubmission,
  deleteAdminSubmission,
} = require("../controllers/productReviewController");

const router = express.Router();

router.post("/submit", auth, createSubmission);
router.get("/mine", auth, getMySubmissions);
router.get("/admin/list", auth, adminOnly, getAdminSubmissions);
router.patch("/admin/:id", auth, adminOnly, updateSubmissionStatus);
router.post("/admin/:id/publish", auth, adminOnly, publishSubmission);
router.delete("/admin/:id", auth, adminOnly, deleteAdminSubmission);
router.get("/:id", auth, getMySubmissionById);
router.patch("/:id", auth, updateMySubmission);
router.delete("/:id", auth, deleteMySubmission);
router.post("/:id/comments", auth, addSubmissionComment);
router.post("/:id/comments/:commentId/react", auth, reactSubmissionComment);
router.patch("/:id/comments/:commentId", auth, updateSubmissionComment);
router.delete("/:id/comments/:commentId", auth, deleteSubmissionComment);

module.exports = router;
