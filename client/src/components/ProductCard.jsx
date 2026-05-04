import { Button, Card, CardActions, CardContent, CardMedia, Typography } from "@mui/material";

export const ProductCard = ({ product, onAddToCart }) => (
  <Card sx={{ borderRadius: 3, height: "100%", transition: "transform 0.2s ease", "&:hover": { transform: "translateY(-4px)" } }}>
    <CardMedia component="img" height="220" image={product.imageUrl} alt={product.name} />
    <CardContent>
      <Typography variant="h6" fontWeight={700}>
        {product.name}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ minHeight: 38 }}>
        {product.description}
      </Typography>
      <Typography variant="h6" sx={{ mt: 1, color: "primary.main" }}>
        PKR {product.price}
      </Typography>
    </CardContent>
    <CardActions sx={{ px: 2, pb: 2 }}>
      <Button variant="contained" color="primary" fullWidth onClick={() => onAddToCart(product)}>
        Add To Cart
      </Button>
    </CardActions>
  </Card>
);
