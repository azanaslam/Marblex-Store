const mongoose = require("mongoose");
const Product = require("../models/Product");
const ProductReviewSubmission = require("../models/ProductReviewSubmission");

const commentPopulate = { path: "comments.author comments.reactions.user", select: "name email role" };
const listPopulate = [{ path: "submittedBy", select: "name email role avatarUrl" }, commentPopulate];

const createSubmission = async (req, res) => {
  const payload = {
    submittedBy: req.user.id,
    name: String(req.body?.name || "").trim(),
    imageUrl: String(req.body?.imageUrl || "").trim(),
    description: String(req.body?.description || "").trim(),
    price: Number(req.body?.price || 0),
    stock: Number(req.body?.stock || 0),
    category: String(req.body?.category || "General").trim(),
  };
  const initialComment = String(req.body?.comment || "").trim();
  if (!payload.name || !payload.imageUrl || payload.price < 0) {
    return res.status(400).json({ message: "Name, image and valid price are required" });
  }
  const doc = await ProductReviewSubmission.create({
    ...payload,
    comments: initialComment ? [{ author: req.user.id, body: initialComment }] : [],
  });
  const out = await ProductReviewSubmission.findById(doc._id).populate(listPopulate);
  return res.status(201).json(out);
};

const getMySubmissions = async (req, res) => {
  const items = await ProductReviewSubmission.find({ submittedBy: req.user.id })
    .sort({ createdAt: -1 })
    .populate(listPopulate);
  return res.json(items);
};

const getMySubmissionById = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid submission id" });
  const item = await ProductReviewSubmission.findById(id).populate(listPopulate);
  if (!item) return res.status(404).json({ message: "Submission not found" });
  const isOwner = String(item.submittedBy?._id || item.submittedBy) === String(req.user.id);
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed" });
  return res.json(item);
};

const addSubmissionComment = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid submission id" });
  const body = String(req.body?.body || "").trim();
  if (!body) return res.status(400).json({ message: "Comment is required" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const isOwner = String(submission.submittedBy) === String(req.user.id);
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed" });
  submission.comments.push({ author: req.user.id, body });
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const reactSubmissionComment = async (req, res) => {
  const { id, commentId } = req.params;
  const emoji = String(req.body?.emoji || "").trim();
  if (!emoji) return res.status(400).json({ message: "Emoji is required" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const isOwner = String(submission.submittedBy) === String(req.user.id);
  if (!isOwner && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed" });
  const comment = submission.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  const uid = String(req.user.id);
  const idx = comment.reactions.findIndex((r) => String(r.user) === uid);
  if (idx >= 0 && comment.reactions[idx].emoji === emoji) {
    comment.reactions.splice(idx, 1);
  } else if (idx >= 0) {
    comment.reactions[idx].emoji = emoji;
  } else {
    comment.reactions.push({ user: req.user.id, emoji });
  }
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const updateSubmissionComment = async (req, res) => {
  const { id, commentId } = req.params;
  const body = String(req.body?.body || "").trim();
  if (!body) return res.status(400).json({ message: "Comment body is required" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const comment = submission.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  const isAuthor = String(comment.author) === String(req.user.id);
  if (!isAuthor && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed" });
  comment.body = body;
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const deleteSubmissionComment = async (req, res) => {
  const { id, commentId } = req.params;
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const comment = submission.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });
  const isAuthor = String(comment.author) === String(req.user.id);
  if (!isAuthor && req.user.role !== "admin") return res.status(403).json({ message: "Not allowed" });
  comment.deleteOne();
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const updateMySubmission = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid submission id" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  if (String(submission.submittedBy) !== String(req.user.id)) return res.status(403).json({ message: "Not allowed" });
  if (submission.status === "published") {
    return res.status(400).json({ message: "Published submission cannot be edited by subowner" });
  }
  const fields = ["name", "imageUrl", "description", "category"];
  fields.forEach((f) => {
    if (req.body?.[f] != null) submission[f] = String(req.body[f]).trim();
  });
  if (req.body?.price != null) submission.price = Number(req.body.price);
  if (req.body?.stock != null) submission.stock = Number(req.body.stock);
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const deleteMySubmission = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid submission id" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  if (String(submission.submittedBy) !== String(req.user.id)) return res.status(403).json({ message: "Not allowed" });
  if (submission.status === "published") {
    return res.status(400).json({ message: "Published submission cannot be deleted by subowner" });
  }
  await ProductReviewSubmission.findByIdAndDelete(id);
  return res.json({ ok: true });
};

const getAdminSubmissions = async (req, res) => {
  const q = {};
  if (req.query.status) q.status = req.query.status;
  const items = await ProductReviewSubmission.find(q).sort({ createdAt: -1 }).populate(listPopulate);
  return res.json(items);
};

const updateSubmissionStatus = async (req, res) => {
  const { id } = req.params;
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const status = String(req.body?.status || "").trim();
  const allowed = ["pending", "looking", "edit", "published", "rejected"];
  if (status && !allowed.includes(status)) return res.status(400).json({ message: "Invalid status" });
  if (status) submission.status = status;
  const fields = ["name", "imageUrl", "description", "category"];
  fields.forEach((f) => {
    if (req.body?.[f] != null) submission[f] = String(req.body[f]).trim();
  });
  if (req.body?.price != null) submission.price = Number(req.body.price);
  if (req.body?.stock != null) submission.stock = Number(req.body.stock);
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const publishSubmission = async (req, res) => {
  const { id } = req.params;
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  const product = await Product.create({
    name: submission.name,
    imageUrl: submission.imageUrl,
    description: submission.description,
    price: submission.price,
    stock: submission.stock,
    category: submission.category,
    active: true,
  });
  submission.status = "published";
  submission.publishedProduct = product._id;
  submission.comments.push({ author: req.user.id, body: "Published by admin. Product is now live." });
  await submission.save();
  const out = await ProductReviewSubmission.findById(id).populate(listPopulate);
  return res.json(out);
};

const deleteAdminSubmission = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "Invalid submission id" });
  const submission = await ProductReviewSubmission.findById(id);
  if (!submission) return res.status(404).json({ message: "Submission not found" });
  await ProductReviewSubmission.findByIdAndDelete(id);
  return res.json({ ok: true });
};

module.exports = {
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
};
