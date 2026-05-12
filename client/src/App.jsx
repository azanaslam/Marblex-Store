import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress, Container, CssBaseline, ThemeProvider } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
import { SiteFooter } from "./components/SiteFooter";
import { useCart } from "./hooks/useCart";
import { appTheme } from "./theme/theme";

const named = (importer, exportName) =>
  lazy(() => importer().then((module) => ({ default: module[exportName] })));

const ShopPage = named(() => import("./pages/ShopPage"), "ShopPage");
const CartPage = named(() => import("./pages/CartPage"), "CartPage");
const BlogsPage = named(() => import("./pages/BlogsPage"), "BlogsPage");
const AdminPage = named(() => import("./pages/AdminPage"), "AdminPage");
const PaymentResultPage = named(() => import("./pages/PaymentResultPage"), "PaymentResultPage");
const LoginPage = named(() => import("./pages/LoginPage"), "LoginPage");
const UserDashboardPage = named(() => import("./pages/UserDashboardPage"), "UserDashboardPage");
const UserReviewDetailPage = named(() => import("./pages/UserReviewDetailPage"), "UserReviewDetailPage");
const AdminReviewDetailPage = named(() => import("./pages/AdminReviewDetailPage"), "AdminReviewDetailPage");
const ProductDetailPage = named(() => import("./pages/ProductDetailPage"), "ProductDetailPage");
const CatalogsPage = named(() => import("./pages/CatalogsPage"), "CatalogsPage");
const ServicesPage = named(() => import("./pages/ServicesPage"), "ServicesPage");
const ContactPage = named(() => import("./pages/ContactPage"), "ContactPage");
const AboutPage = named(() => import("./pages/AboutPage"), "AboutPage");
const BlogDetailsPage = named(() => import("./pages/BlogDetailsPage"), "BlogDetailsPage");

function RouteFallback() {
  return (
    <Box
      className="route-fallback"
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "40vh",
        py: 6,
      }}
    >
      <CircularProgress color="secondary" size={40} />
    </Box>
  );
}

function App() {
  const { cart, setCart, addToCart } = useCart();
  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.quantity, 0), [cart]);

  return (
    <div className="page-shell">
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout cartCount={cartCount}>
            <Container maxWidth={false} sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 5 } }} className="page-content">
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                  <Route path="/" element={<ShopPage addToCart={addToCart} />} />
                  <Route path="/product/:id" element={<ProductDetailPage addToCart={addToCart} />} />
                  <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/blogs" element={<BlogsPage />} />
                  <Route path="/blogs/:id" element={<BlogDetailsPage />} />
                  <Route path="/catalogs" element={<CatalogsPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/admin/review/:id" element={<AdminReviewDetailPage />} />
                  <Route path="/dashboard" element={<UserDashboardPage />} />
                  <Route path="/dashboard/review/:id" element={<UserReviewDetailPage />} />
                  <Route path="/payment/success" element={<PaymentResultPage success />} />
                  <Route path="/payment/cancel" element={<PaymentResultPage success={false} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </Container>
            <SiteFooter />
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
