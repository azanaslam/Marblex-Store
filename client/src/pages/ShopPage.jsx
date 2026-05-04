import { useEffect, useState } from "react";
import { Box, Chip, Grid, Stack, Typography } from "@mui/material";
import { http } from "../api/http";
import { HeroBanner } from "../components/HeroBanner";
import { ProductCard } from "../components/ProductCard";

const demoProducts = [
  {
    _id: "demo-1",
    name: "Executive Car Mats",
    description: "Premium stitched floor mats for daily durability and easy cleaning.",
    price: 5500,
    imageUrl: "/products/Banner1.jpeg",
  },
  {
    _id: "demo-2",
    name: "Luxury Car Mats",
    description: "Luxury quilt finish with anti-slip base and complete cabin coverage.",
    price: 8500,
    imageUrl: "/products/Banner2.jpeg",
  },
  {
    _id: "demo-3",
    name: "PVC Wall Panel",
    description: "Elegant water-resistant paneling for modern interior walls.",
    price: 750,
    imageUrl: "/products/Banner3.jpeg",
  },
  {
    _id: "demo-4",
    name: "PVC Wooden Flooring",
    description: "Stylish and durable floor design with warm natural wood texture.",
    price: 145,
    imageUrl: "/products/Banner4.jpeg",
  },
];

export const ShopPage = ({ addToCart }) => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    http
      .get("/products")
      .then((res) => setProducts(Array.isArray(res.data) && res.data.length ? res.data : demoProducts))
      .catch(() => setProducts(demoProducts));
  }, []);

  return (
    <Box>
      <HeroBanner />
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
        <Chip label="Car Mats" />
        <Chip label="Luxury Car Mats" />
        <Chip label="PVC Wall Panels" />
        <Chip label="PVC Wooden Flooring" />
        <Chip label="Blogs" />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Featured Products
        </Typography>
        <Chip label={`${products.length} Products`} color="primary" variant="filled" />
      </Stack>
      <Grid container spacing={2}>
        {products.map((product) => (
          <Grid size={{ xs: 12, sm: 6, md: 4 }} key={product._id}>
            <ProductCard product={product} onAddToCart={addToCart} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
