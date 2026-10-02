import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
} from "@mui/material";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import RequestQuoteOutlinedIcon from "@mui/icons-material/RequestQuoteOutlined";
import SupportAgentOutlinedIcon from "@mui/icons-material/SupportAgentOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import { authHeaders, http } from "../../api/http";
import { formatMoney, formatPkt, orderLabel, ORDER_STATUS_COLOR, PORTAL_ACCENT, PORTAL_TEAL } from "./portalUtils";

const StatCard = ({ label, value, hint }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      borderRadius: 3,
      border: "1px solid #dbe4ea",
      background: "#fff",
      height: "100%",
    }}
  >
    <Typography sx={{ fontSize: 12, color: "text.secondary", fontWeight: 700, letterSpacing: 1 }}>
      {label}
    </Typography>
    <Typography sx={{ mt: 1, fontSize: 28, fontWeight: 800, color: PORTAL_TEAL, lineHeight: 1 }}>
      {value}
    </Typography>
    {hint ? (
      <Typography sx={{ mt: 0.75, fontSize: 12, color: "text.secondary" }}>{hint}</Typography>
    ) : null}
  </Paper>
);

export const PortalOverview = () => {
  const { token, user } = useOutletContext();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    http
      .get("/portal/overview", authHeaders(token))
      .then((res) => {
        if (alive) setData(res.data);
      })
      .catch((err) => {
        if (alive) setError(err.response?.data?.message || "Failed to load overview");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [token]);

  if (loading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map((i) => (
          <Grid item xs={12} sm={6} md={3} key={i}>
            <Skeleton variant="rounded" height={110} />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (error) return <Alert severity="error">{error}</Alert>;

  const stats = data?.stats || {};
  const profile = data?.user || user || {};

  return (
    <Stack spacing={2.5}>
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          borderRadius: 3,
          border: "1px solid #dbe4ea",
          background: `linear-gradient(135deg, ${PORTAL_TEAL} 0%, #125a78 55%, #0b2f3c 100%)`,
          color: "#fff",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -40,
            top: -40,
            width: 180,
            height: 180,
            borderRadius: "50%",
            background: "rgba(255,107,71,0.18)",
          }}
        />
        <Typography sx={{ fontSize: 13, letterSpacing: 2, fontWeight: 700, opacity: 0.75 }}>
          WELCOME BACK
        </Typography>
        <Typography sx={{ mt: 0.5, fontSize: { xs: 24, md: 30 }, fontWeight: 800 }}>
          {profile.name || "Client"}
        </Typography>
        <Typography sx={{ mt: 0.5, opacity: 0.85, maxWidth: 560 }}>
          {profile.company
            ? `${profile.company} · ${profile.industryType || "Construction partner"}`
            : "Your MARBLEX account hub for orders, RFQs, and technical support."}
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 2.5 }}>
          <Button
            variant="contained"
            startIcon={<ShoppingCartCheckoutRoundedIcon />}
            onClick={() => navigate("/dashboard/orders")}
            sx={{ bgcolor: PORTAL_ACCENT, "&:hover": { bgcolor: "#e65636" } }}
          >
            View orders
          </Button>
          <Button
            variant="outlined"
            startIcon={<RequestQuoteOutlinedIcon />}
            onClick={() => navigate("/dashboard/quotes")}
            sx={{ borderColor: "rgba(255,255,255,0.45)", color: "#fff" }}
          >
            New RFQ
          </Button>
          <Button
            variant="outlined"
            startIcon={<StorefrontOutlinedIcon />}
            onClick={() => navigate("/")}
            sx={{ borderColor: "rgba(255,255,255,0.45)", color: "#fff" }}
          >
            Browse catalog
          </Button>
          <Button
            variant="outlined"
            startIcon={<SupportAgentOutlinedIcon />}
            onClick={() => navigate("/dashboard/support")}
            sx={{ borderColor: "rgba(255,255,255,0.45)", color: "#fff" }}
          >
            Support
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="TOTAL ORDERS" value={stats.totalOrders || 0} hint="All-time website orders" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="ACTIVE" value={stats.activeOrders || 0} hint="Pending / processing / on the way" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="OPEN RFQs" value={stats.openQuotes || 0} hint="Awaiting quote or review" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard label="SUPPORT" value={stats.openTickets || 0} hint="Open or waiting tickets" />
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL }}>Recent orders</Typography>
              <Button size="small" onClick={() => navigate("/dashboard/orders")}>
                See all
              </Button>
            </Stack>
            <Stack spacing={1.25}>
              {(data?.recentOrders || []).length === 0 ? (
                <Typography color="text.secondary">No orders yet. Place your first order from the shop.</Typography>
              ) : (
                data.recentOrders.map((order) => (
                  <Box
                    key={order._id}
                    onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: "1px solid #e6edf1",
                      cursor: "pointer",
                      "&:hover": { borderColor: PORTAL_ACCENT, background: "#fff8f6" },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{orderLabel(order)}</Typography>
                        <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                          {formatPkt(order.createdAt)} · {formatMoney(order.subtotal)}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={order.orderStatus}
                        color={ORDER_STATUS_COLOR[order.orderStatus] || "default"}
                      />
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea", height: "100%" }}>
            <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL, mb: 1.5 }}>Announcements</Typography>
            <Stack spacing={1.25}>
              {(data?.broadcasts || []).length === 0 ? (
                <Typography color="text.secondary">No broadcasts right now.</Typography>
              ) : (
                data.broadcasts.map((b) => (
                  <Box key={b._id} sx={{ p: 1.5, borderRadius: 2, background: "#f4f8fa", border: "1px solid #e6edf1" }}>
                    <Typography sx={{ fontSize: 13, whiteSpace: "pre-wrap" }}>{b.message}</Typography>
                    <Typography sx={{ mt: 0.75, fontSize: 11, color: "text.secondary" }}>
                      {formatPkt(b.createdAt)}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};
