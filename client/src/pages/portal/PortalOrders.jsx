import { useEffect, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { authHeaders, http } from "../../api/http";
import { ListSkeleton } from "../../components/LoaderSkeleton";
import {
  formatMoney,
  formatPkt,
  orderLabel,
  ORDER_STATUS_COLOR,
  PORTAL_TEAL,
  reorderToCart,
} from "./portalUtils";

export const PortalOrders = () => {
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (status) params.status = status;
      if (q.trim()) params.q = q.trim();
      const res = await http.get("/orders/my", { ...authHeaders(token), params });
      setOrders(res.data || []);
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed to load orders" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, status]);

  const copyId = async (order) => {
    try {
      await navigator.clipboard?.writeText(order.orderNumber || order._id);
      setToast({ open: true, severity: "success", message: "Order ID copied." });
    } catch {
      setToast({ open: true, severity: "error", message: "Could not copy." });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Orders</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            Track status, reorder materials, and open invoices.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search order #"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
          />
          <TextField select size="small" value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All statuses</MenuItem>
            {["pending", "processing", "on the way", "delivered", "cancelled"].map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" onClick={load}>
            Filter
          </Button>
        </Stack>
      </Stack>

      {loading ? (
        <ListSkeleton rows={4} />
      ) : orders.length === 0 ? (
        <Alert severity="info">No orders found. Browse the catalog to place your first order.</Alert>
      ) : (
        <Stack spacing={1.5}>
          {orders.map((order) => (
            <Paper key={order._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea" }}>
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                justifyContent="space-between"
                alignItems={{ md: "center" }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Typography sx={{ fontWeight: 800 }}>{orderLabel(order)}</Typography>
                    <Chip size="small" label={order.orderStatus} color={ORDER_STATUS_COLOR[order.orderStatus] || "default"} />
                    <Chip size="small" variant="outlined" label={order.paymentStatus} />
                  </Stack>
                  <Typography sx={{ mt: 0.5, fontSize: 13, color: "text.secondary" }}>
                    {formatPkt(order.createdAt)} · {formatMoney(order.subtotal)} · {(order.items || []).length} item(s)
                    {order.city ? ` · ${order.city}` : ""}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button
                    size="small"
                    startIcon={<VisibilityOutlinedIcon />}
                    onClick={() => navigate(`/dashboard/orders/${order._id}`)}
                  >
                    Details
                  </Button>
                  <Button size="small" startIcon={<ContentCopyRoundedIcon />} onClick={() => copyId(order)}>
                    Copy ID
                  </Button>
                  <Button
                    size="small"
                    variant="contained"
                    color="secondary"
                    startIcon={<ShoppingCartCheckoutRoundedIcon />}
                    onClick={() => {
                      reorderToCart(order);
                      setToast({ open: true, severity: "success", message: "Items added to cart." });
                      navigate("/cart");
                    }}
                  >
                    Reorder
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Snackbar
        open={toast.open}
        autoHideDuration={3000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={toast.severity} onClose={() => setToast((t) => ({ ...t, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
