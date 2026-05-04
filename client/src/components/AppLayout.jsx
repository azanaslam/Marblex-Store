import { useEffect, useState } from "react";
import { AppBar, Badge, Box, Button, Stack, Toolbar, Typography } from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, onAuthSessionChangeEvent } from "../auth/session";

export const AppLayout = ({ cartCount, children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [authUserFromStorage, setAuthUserFromStorage] = useState(getAuthUser());
  const [token, setToken] = useState(getAuthToken());
  const [chatUnreadNav, setChatUnreadNav] = useState(0);
  let tokenPayload = null;

  if (token) {
    try {
      tokenPayload = JSON.parse(atob(token.split(".")[1]));
    } catch {
      tokenPayload = null;
    }
  }

  const authUser = authUserFromStorage || (tokenPayload ? { role: tokenPayload.role } : null);
  const isUserLoggedIn = Boolean(authUser);
  const isCustomer = authUser?.role === "user";
  const isAdmin = authUser?.role === "admin";
  const customerLabel = authUser?.name ? `${authUser.name.split(" ")[0]} Dashboard` : "My Dashboard";
  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const syncAuth = () => {
      setAuthUserFromStorage(getAuthUser());
      setToken(getAuthToken());
    };

    window.addEventListener(onAuthSessionChangeEvent, syncAuth);
    window.addEventListener("storage", syncAuth);
    syncAuth();
    return () => {
      window.removeEventListener(onAuthSessionChangeEvent, syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [location.pathname]);

  useEffect(() => {
    const load = () => {
      const t = getAuthToken();
      const u = getAuthUser();
      if (!t || !u || (u.role !== "admin" && u.role !== "user")) {
        setChatUnreadNav(0);
        return;
      }
      http
        .get("/chat/unread-count", authHeaders(t))
        .then((r) => setChatUnreadNav(Number(r.data?.count) || 0))
        .catch(() => {});
    };
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [location.pathname, authUserFromStorage, token]);

  return (
    <>
    <Box sx={{ bgcolor: "primary.main", color: "#fff", py: 1, textAlign: "center", fontSize: 13, fontWeight: 700 }}>
      Free Shipping Nationwide Only On Car Mats
    </Box>
    <AppBar position="sticky" color="inherit" elevation={1}>
      <Toolbar sx={{ justifyContent: "space-between", gap: 2, minHeight: { xs: 62, md: 72 }, px: { xs: 2, md: 5 } }}>
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            textDecoration: "none",
            color: "inherit",
          }}
        >
          <Box
            component="img"
            src="/products/Logo.jpeg"
            alt="Marblex logo"
            onError={(event) => {
              event.currentTarget.src = "/icons.svg";
            }}
            sx={{
              width: { xs: 54, md: 58 },
              height: { xs: 54, md: 58 },
              borderRadius: 1.5,
              p: 0,
              bgcolor: "transparent",
              border: "none",
              objectFit: "cover",
              objectPosition: "center 56%",
            }}
          />
          <Typography variant="h6" fontWeight={800} color="primary.main" sx={{ lineHeight: 1 }}>
            Marblex Store
          </Typography>
        </Box>
        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} flexWrap="wrap" justifyContent="flex-end">
          <Button component={RouterLink} to="/" color="inherit">
            Shop
          </Button>
          <Button component={RouterLink} to="/cart" color="inherit" startIcon={<ShoppingCartIcon />}>
            Cart ({cartCount})
          </Button>
          <Button component={RouterLink} to="/blogs" color="inherit">
            Blogs
          </Button>
          {!isUserLoggedIn && (
            <Button component={RouterLink} to="/login" color="inherit">
              Login
            </Button>
          )}
          {isAdmin && (
            <Badge color="error" badgeContent={chatUnreadNav} max={99} invisible={chatUnreadNav === 0}>
              <Button component={RouterLink} to="/admin" color="inherit">
                Admin Dashboard
              </Button>
            </Badge>
          )}
          {isCustomer && (
            <Badge color="error" badgeContent={chatUnreadNav} max={99} invisible={chatUnreadNav === 0}>
              <Button component={RouterLink} to="/dashboard" color="inherit">
                {customerLabel}
              </Button>
            </Badge>
          )}
          {isUserLoggedIn && (
            <Button
              onClick={logout}
              color="error"
              variant="outlined"
              sx={{ borderRadius: 2, ml: { xs: 0, sm: 0.5 } }}
            >
              Logout
            </Button>
          )}
        </Stack>
      </Toolbar>
      <Box sx={{ display: { xs: "none", md: "flex" }, gap: 2.5, px: 5, py: 1.2, borderTop: "1px solid #efefef", fontSize: 14 }}>
        <Button component={RouterLink} to="/" color="inherit" sx={{ p: 0, minWidth: "auto" }}>
          Home
        </Button>
        <Button color="inherit" sx={{ p: 0, minWidth: "auto" }}>Car Mats</Button>
        <Button color="inherit" sx={{ p: 0, minWidth: "auto" }}>Luxury Car Mats</Button>
        <Button color="inherit" sx={{ p: 0, minWidth: "auto" }}>PVC Wall Panels</Button>
        <Button color="inherit" sx={{ p: 0, minWidth: "auto" }}>PVC Wooden Flooring</Button>
        <Button component={RouterLink} to="/blogs" color="inherit" sx={{ p: 0, minWidth: "auto" }}>
          Blogs
        </Button>
      </Box>
    </AppBar>
    {children}
  </>
  );
};
