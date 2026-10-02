import { lazy, Suspense, useMemo } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Box, CircularProgress, CssBaseline, ThemeProvider } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
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
const PortalLayout = named(() => import("./pages/portal/PortalLayout"), "PortalLayout");
const PortalOverview = named(() => import("./pages/portal/PortalOverview"), "PortalOverview");
const PortalOrders = named(() => import("./pages/portal/PortalOrders"), "PortalOrders");
const PortalOrderDetail = named(() => import("./pages/portal/PortalOrderDetail"), "PortalOrderDetail");
const PortalQuotes = named(() => import("./pages/portal/PortalQuotes"), "PortalQuotes");
const PortalDocuments = named(() => import("./pages/portal/PortalDocuments"), "PortalDocuments");
const PortalSupport = named(() => import("./pages/portal/PortalSupport"), "PortalSupport");
const PortalFavorites = named(() => import("./pages/portal/PortalFavorites"), "PortalFavorites");
const PortalAccount = named(() => import("./pages/portal/PortalAccount"), "PortalAccount");
const PortalPartner = named(() => import("./pages/portal/PortalPartner"), "PortalPartner");

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
            <AppLayout cartCount={cartCount}>
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
                  <Route path="/dashboard" element={<PortalLayout />}>
                    <Route index element={<PortalOverview />} />
                    <Route path="orders" element={<PortalOrders />} />
                    <Route path="orders/:id" element={<PortalOrderDetail />} />
                    <Route path="quotes" element={<PortalQuotes />} />
                    <Route path="documents" element={<PortalDocuments />} />
                    <Route path="support" element={<PortalSupport />} />
                    <Route path="favorites" element={<PortalFavorites />} />
                    <Route path="account" element={<PortalAccount />} />
                    <Route path="partner" element={<PortalPartner />} />
                  </Route>
                  <Route path="/dashboard/review/:id" element={<UserReviewDetailPage />} />
                  <Route path="/payment/success" element={<PaymentResultPage success />} />
                  <Route path="/payment/cancel" element={<PaymentResultPage success={false} />} />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Suspense>
            </AppLayout>
          </LenisScroll>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
