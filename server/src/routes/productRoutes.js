const express = require("express");
const { auth } = require("../middleware/auth");
const { validate, productSchema } = require("../middleware/validate");
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct } = require("../controllers/productController");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", auth, validate(productSchema), createProduct);
router.put("/:id", auth, validate(productSchema), updateProduct);
router.delete("/:id", auth, deleteProduct);

module.exports = router;
