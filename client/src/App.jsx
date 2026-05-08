import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Container, CssBaseline, ThemeProvider } from "@mui/material";
import { AppLayout } from "./components/AppLayout";
import { SiteFooter } from "./components/SiteFooter";
import { ShopPage } from "./pages/ShopPage";
import { CartPage } from "./pages/CartPage";
import { BlogsPage } from "./pages/BlogsPage";
import { AdminPage } from "./pages/AdminPage";
import { PaymentResultPage } from "./pages/PaymentResultPage";
import { LoginPage } from "./pages/LoginPage";
import { UserDashboardPage } from "./pages/UserDashboardPage";
import { UserReviewDetailPage } from "./pages/UserReviewDetailPage";
import { AdminReviewDetailPage } from "./pages/AdminReviewDetailPage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { CatalogsPage } from "./pages/CatalogsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { ContactPage } from "./pages/ContactPage";
import { AboutPage } from "./pages/AboutPage";
import { BlogDetailsPage } from "./pages/BlogDetailsPage";
import { useCart } from "./hooks/useCart";
import { appTheme } from "./theme/theme";

function App() {
  const { cart, setCart, addToCart } = useCart();

  return (
    <div className="page-shell">
      <ThemeProvider theme={appTheme}>
        <CssBaseline />
        <BrowserRouter>
          <AppLayout cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}>
            <Container maxWidth={false} sx={{ py: { xs: 2, md: 3 }, px: { xs: 1.5, sm: 2, md: 5 } }} className="page-content">
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
            </Container>
            <SiteFooter />
          </AppLayout>
        </BrowserRouter>
      </ThemeProvider>
    </div>
  );
}

export default App;
