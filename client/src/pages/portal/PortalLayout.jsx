import { NavLink, Outlet, Navigate, useNavigate, useLocation } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import FavoriteBorderOutlinedIcon from "@mui/icons-material/FavoriteBorderOutlined";
import ManageAccountsOutlinedIcon from "@mui/icons-material/ManageAccountsOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { useEffect, useMemo, useState } from "react";
import { clearAuthSession, getAuthToken, getAuthUser } from "../../auth/session";
import { authHeaders, http } from "../../api/http";
import { PORTAL_ACCENT, PORTAL_TEAL } from "./portalUtils";

const drawerWidth = 280;

const NavItem = ({ to, icon, label, badge, end }) => (
  <NavLink to={to} end={end} style={{ textDecoration: "none" }}>
    {({ isActive }) => (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.25,
          px: 1.5,
          py: 1.1,
          borderRadius: 2,
          mb: 0.5,
          color: isActive ? "#fff" : "rgba(255,255,255,0.78)",
          background: isActive
            ? `linear-gradient(90deg, ${PORTAL_ACCENT} 0%, #e65636 100%)`
            : "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            background: isActive ? undefined : "rgba(255,255,255,0.08)",
            color: "#fff",
          },
        }}
      >
        {icon}
        <Typography sx={{ flex: 1, fontWeight: 650, fontSize: 14 }}>{label}</Typography>
        {badge > 0 ? (
          <Badge badgeContent={badge} color="secondary" sx={{ "& .MuiBadge-badge": { fontWeight: 700 } }} />
        ) : null}
      </Box>
    )}
  </NavLink>
);

export const PortalLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [supportUnread, setSupportUnread] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const token = getAuthToken();
  const user = getAuthUser();
  const isSubowner = user?.role === "subowner";

  useEffect(() => {
    if (!token) return;
    const load = () =>
      http
        .get("/chat/unread-count", authHeaders(token))
        .then((r) => setSupportUnread(Number(r.data?.count) || 0))
        .catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [token]);

  useEffect(() => {
    const n = location.state?.chatUnread;
    if (typeof n === "number" && n > 0) {
      setSupportUnread(n);
      navigate("/dashboard/support", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  const navItems = useMemo(() => {
    const client = [
      { to: "/dashboard", end: true, icon: <DashboardOutlinedIcon fontSize="small" />, label: "Overview" },
      { to: "/dashboard/orders", icon: <ReceiptLongOutlinedIcon fontSize="small" />, label: "Orders" },
      { to: "/dashboard/quotes", icon: <RequestQuoteOutlinedIcon fontSize="small" />, label: "Quotes / RFQ" },
      { to: "/dashboard/documents", icon: <DescriptionOutlinedIcon fontSize="small" />, label: "Documents" },
      {
        to: "/dashboard/support",
        icon: <SupportAgentOutlinedIcon fontSize="small" />,
        label: "Support",
        badge: supportUnread,
      },
      { to: "/dashboard/favorites", icon: <FavoriteBorderOutlinedIcon fontSize="small" />, label: "Favorites & Lists" },
      { to: "/dashboard/account", icon: <ManageAccountsOutlinedIcon fontSize="small" />, label: "Account" },
    ];
    if (isSubowner) {
      return [
        ...client.slice(0, 1),
        { to: "/dashboard/partner", icon: <HandshakeOutlinedIcon fontSize="small" />, label: "Partner Hub" },
        ...client.slice(1),
      ];
    }
    return client;
  }, [isSubowner, supportUnread]);

  if (!token) return <Navigate to="/login" replace />;

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", p: 2.25 }}>
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5, px: 0.5 }}>
        <Avatar
          src={user?.avatarUrl || undefined}
          sx={{ width: 44, height: 44, bgcolor: PORTAL_ACCENT, fontWeight: 800 }}
        >
          {(user?.name || "M").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "#fff", fontWeight: 800, fontSize: 15, lineHeight: 1.2 }} noWrap>
            {user?.name || "Client"}
          </Typography>
          <Typography sx={{ color: "rgba(255,255,255,0.55)", fontSize: 12 }} noWrap>
            {user?.company || user?.email || "MARBLEX Portal"}
          </Typography>
        </Box>
      </Stack>

      <Typography
        sx={{
          color: "rgba(255,255,255,0.4)",
          fontSize: 10,
          letterSpacing: 2,
          fontWeight: 800,
          mb: 1,
          px: 1,
        }}
      >
        CLIENT PORTAL
      </Typography>

      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {navItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </Box>

      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)", my: 1.5 }} />
      <Button
        startIcon={<StorefrontOutlinedIcon />}
        onClick={() => navigate("/")}
        sx={{ justifyContent: "flex-start", color: "rgba(255,255,255,0.85)", mb: 0.5 }}
      >
        Back to Shop
      </Button>
      <Button
        startIcon={<LogoutRoundedIcon />}
        onClick={() => {
          clearAuthSession();
          navigate("/login", { replace: true });
        }}
        sx={{ justifyContent: "flex-start", color: "#ffb4a2" }}
      >
        Sign out
      </Button>
    </Box>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "70vh",
        borderRadius: { xs: 0, md: 3 },
        overflow: "hidden",
        border: { md: "1px solid #dbe4ea" },
        background: "linear-gradient(180deg, #f3f7fa 0%, #eef3f6 100%)",
      }}
    >
      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              "& .MuiDrawer-paper": {
                width: drawerWidth,
                background: `linear-gradient(180deg, ${PORTAL_TEAL} 0%, #062430 100%)`,
                border: 0,
              },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Box
            sx={{
              width: drawerWidth,
              height: "100%",
              minHeight: 640,
              background: `linear-gradient(180deg, ${PORTAL_TEAL} 0%, #062430 100%)`,
            }}
          >
            {drawer}
          </Box>
        )}
      </Box>

      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            px: { xs: 2, md: 3 },
            py: 2,
            borderBottom: "1px solid #e3ebef",
            background: "rgba(255,255,255,0.85)",
            backdropFilter: "blur(8px)",
          }}
        >
          {isMobile && (
            <IconButton onClick={() => setMobileOpen(true)} edge="start">
              <MenuRoundedIcon />
            </IconButton>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              sx={{
                fontFamily: "'Space Grotesk', Poppins, sans-serif",
                fontWeight: 800,
                fontSize: { xs: 18, md: 22 },
                color: PORTAL_TEAL,
                letterSpacing: 0.5,
              }}
            >
              MAR<span style={{ color: PORTAL_ACCENT }}>BLEX</span> Client Portal
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
              Manage orders, quotes, documents, and support in one place.
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ p: { xs: 2, md: 3 }, flex: 1 }}>
          <Outlet context={{ supportUnread, setSupportUnread, user, token }} />
        </Box>
      </Box>
    </Box>
  );
};
