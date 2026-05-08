const express = require("express");
const { auth } = require("../middleware/auth");
const { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog } = require("../controllers/blogController");

const router = express.Router();

router.get("/", getBlogs);
router.get("/:id", getBlogById);
router.post("/", auth, createBlog);
router.put("/:id", auth, updateBlog);
router.delete("/:id", auth, deleteBlog);

module.exports = router;
