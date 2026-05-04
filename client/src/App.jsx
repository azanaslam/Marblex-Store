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
import { useCart } from "./hooks/useCart";
import { appTheme } from "./theme/theme";

function App() {
  const { cart, setCart, addToCart } = useCart();

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <BrowserRouter>
        <AppLayout cartCount={cart.reduce((sum, i) => sum + i.quantity, 0)}>
          <Container maxWidth={false} sx={{ py: 3, px: { xs: 2, md: 5 } }}>
            <Routes>
              <Route path="/" element={<ShopPage addToCart={addToCart} />} />
              <Route path="/cart" element={<CartPage cart={cart} setCart={setCart} />} />
              <Route path="/blogs" element={<BlogsPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/dashboard" element={<UserDashboardPage />} />
              <Route path="/payment/success" element={<PaymentResultPage success />} />
              <Route path="/payment/cancel" element={<PaymentResultPage success={false} />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Container>
          <SiteFooter />
        </AppLayout>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
