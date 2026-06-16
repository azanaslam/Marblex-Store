const Product = require("../models/Product");



const getProducts = async (_, res) => {

  const products = await Product.find({ active: true }).sort({ createdAt: -1 });

  res.json(products);

};



const getProductById = async (req, res) => {

  const product = await Product.findOne({ _id: req.params.id, active: true });

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.json(product);

};



const createProduct = async (req, res) => {

  const product = await Product.create(req.body);

  res.status(201).json(product);

};



const updateProduct = async (req, res) => {

  const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.json(product);

};



const deleteProduct = async (req, res) => {

  const product = await Product.findByIdAndDelete(req.params.id);

  if (!product) return res.status(404).json({ message: "Product not found" });

  return res.json({ ok: true });

};



module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
