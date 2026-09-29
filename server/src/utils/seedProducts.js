const Product = require("../models/Product");

const initialProducts = [
  {
    name: "Executive Car Mats",
    description: "Premium stitched floor mats for daily durability and easy cleaning.",
    price: 5500,
    category: "Car Accessories",
    stock: 25,
    featured: true,
    active: true,
    imageUrl: "/products/Banner1.jpeg",
    extraImages: ["/products/Banner1.jpeg", "/products/WhatsApp Image 2026-04-30 at 13.12.32 (1).jpeg"],
  },
  {
    name: "Luxury Car Mats",
    description: "Luxury quilt finish with anti-slip base and complete cabin coverage.",
    price: 8500,
    category: "Car Accessories",
    stock: 20,
    featured: true,
    active: true,
    imageUrl: "/products/Banner2.jpeg",
    extraImages: ["/products/Banner2.jpeg", "/products/WhatsApp Image 2026-04-30 at 13.12.31 (2).jpeg"],
  },
  {
    name: "PVC Wall Panel",
    description: "Elegant water-resistant paneling for modern interior walls.",
    price: 750,
    category: "Wall Panels",
    stock: 100,
    featured: true,
    active: true,
    imageUrl: "/products/Banner3.jpeg",
    extraImages: ["/products/Banner3.jpeg", "/products/WhatsApp Image 2026-04-30 at 13.12.03.jpeg"],
  },
  {
    name: "PVC Wooden Flooring",
    description: "Stylish and durable floor design with warm natural wood texture.",
    price: 145,
    category: "Flooring",
    stock: 500,
    featured: true,
    active: true,
    imageUrl: "/products/Banner4.jpeg",
    extraImages: ["/products/Banner4.jpeg", "/products/WhatsApp Image 2026-04-30 at 13.12.04.jpeg"],
  },
  {
    name: "Roof Waterproofing Chemical",
    description: "High performance elastomeric membrane coating for complete leak and dampness protection.",
    price: 4200,
    category: "Waterproofing",
    stock: 40,
    featured: true,
    active: true,
    imageUrl: "/products/WhatsApp Image 2026-04-30 at 13.12.32.jpeg",
    extraImages: ["/products/WhatsApp Image 2026-04-30 at 13.12.32 (1).jpeg"],
  },
  {
    name: "Rubber Water Stopper",
    description: "Industrial grade heavy duty water stops for construction joints, dams, and basements.",
    price: 3200,
    category: "Construction",
    stock: 60,
    featured: true,
    active: true,
    imageUrl: "/assets/brochures/Water_Stopper_123_page_1.jpg",
    extraImages: [],
  },
];

const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      await Product.insertMany(initialProducts);
      console.log(`Successfully seeded ${initialProducts.length} initial products to Database`);
    }
  } catch (error) {
    console.error("Product seeding failed:", error.message);
  }
};

module.exports = { seedProducts };
