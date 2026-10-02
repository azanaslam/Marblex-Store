import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { AppLayoutShell } from "./components/AppLayoutShell";
import { BrandSplashPreloader } from "./components/BrandSplashPreloader";
import { LenisScroll } from "./components/LenisScroll";
import { ShopPage } from "./pages/ShopPage";
import { useCart } from "./hooks/useCart";
import { appTheme } from "./theme/theme";

const named = (importer, exportName) =>
  lazy(() => importer().then((module) => ({ default: module[exportName] })));

const CartPage = named(() => import("./pages/CartPage"), "CartPage");
const BlogsPage = named(() => import("./pages/BlogsPage"), "BlogsPage");
const AdminPage = named(() => import("./pages/AdminPage"), "AdminPage");
const PaymentResultPage = named(() => import("./pages/PaymentResultPage"), "PaymentResultPage");
const LoginPage = named(() => import("./pages/LoginPage"), "LoginPage");
const UserReviewDetailPage = named(() => import("./pages/UserReviewDetailPage"), "UserReviewDetailPage");
const AdminReviewDetailPage = named(() => import("./pages/AdminReviewDetailPage"), "AdminReviewDetailPage");
const ProductDetailPage = named(() => import("./pages/ProductDetailPage"), "ProductDetailPage");
const CatalogsPage = named(() => import("./pages/CatalogsPage"), "CatalogsPage");
const ServicesPage = named(() => import("./pages/ServicesPage"), "ServicesPage");
const ContactPage = named(() => import("./pages/ContactPage"), "ContactPage");
const AboutPage = named(() => import("./pages/AboutPage"), "AboutPage");
const BlogDetailsPage = named(() => import("./pages/BlogDetailsPage"), "BlogDetailsPage");
const PortalHost = named(() => import("./pages/portal/PortalHost"), "PortalHost");

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
      <BrandSplashPreloader />
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <LenisScroll>
            <Routes>
              <Route
                path="/admin"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <AdminPage />
                  </Suspense>
                }
              />
              <Route
                path="/admin/review/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <AdminReviewDetailPage />
                  </Suspense>
                }
              />
              <Route
                path="/dashboard/review/:id"
                element={
                  <Suspense fallback={<RouteFallback />}>
                    <UserReviewDetailPage />
                  </Suspense>
                }
              />

              {/* Suspense lives inside the layout shell so the navbar never unmounts on lazy routes */}
              <Route
                element={
                  <AppLayoutShell cartCount={cartCount} fallback={<RouteFallback />} />
                }
              >
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
                <Route path="/dashboard/*" element={<PortalHost />} />
                <Route path="/payment/success" element={<PaymentResultPage success />} />
                <Route path="/payment/cancel" element={<PaymentResultPage success={false} />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </LenisScroll>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
