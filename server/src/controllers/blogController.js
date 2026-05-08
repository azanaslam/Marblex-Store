const Blog = require("../models/Blog");

const getBlogs = async (_, res) => {
  const blogs = await Blog.find({ published: true }).sort({ createdAt: -1 });
  res.json(blogs);
};

const getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });
    return res.json(blog);
  } catch (error) {
    return res.status(500).json({ message: "Server error retrieving blog" });
  }
};

const createBlog = async (req, res) => {
  const blog = await Blog.create(req.body);
  res.status(201).json(blog);
};

const updateBlog = async (req, res) => {
  const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  return res.json(blog);
};

const deleteBlog = async (req, res) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });
  return res.json({ ok: true });
};

module.exports = { getBlogs, getBlogById, createBlog, updateBlog, deleteBlog };
