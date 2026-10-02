import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Paper,
  Snackbar,
  Stack,
  Step,
  StepLabel,
  Stepper,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import ShoppingCartCheckoutRoundedIcon from "@mui/icons-material/ShoppingCartCheckoutRounded";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { authHeaders, http } from "../../api/http";
import { API_BASE_URL } from "../../config/constants";
import {
  formatMoney,
  formatPkt,
  orderLabel,
  ORDER_STATUS_COLOR,
  PORTAL_TEAL,
  reorderToCart,
} from "./portalUtils";

const FLOW = ["pending", "processing", "on the way", "delivered"];

export const PortalOrderDetail = () => {
  const { id } = useParams();
  const { token } = useOutletContext();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    setLoading(true);
    try {
      const res = await http.get(`/orders/my/${id}`, authHeaders(token));
      setOrder(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Order not found");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token]);

  const activeStep = useMemo(() => {
    if (!order) return 0;
    if (order.orderStatus === "cancelled") return -1;
    const idx = FLOW.indexOf(order.orderStatus);
    return idx >= 0 ? idx : 0;
  }, [order]);

  const openInvoice = async () => {
    try {
      const res = await http.get(`/orders/my/${id}/invoice`, {
        ...authHeaders(token),
        responseType: "text",
      });
      const blob = new Blob([res.data], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (err) {
      // Fallback absolute URL attempt (may fail without auth cookie)
      window.open(`${API_BASE_URL}/orders/my/${id}/invoice`, "_blank");
      setToast({
        open: true,
        severity: "warning",
        message: err.response?.data?.message || "Opened invoice endpoint. If blank, allow popups.",
      });
    }
  };

  const cancelOrder = async () => {
    try {
      await http.post(`/orders/my/${id}/cancel`, {}, authHeaders(token));
      setToast({ open: true, severity: "success", message: "Order cancelled." });
      await load();
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Cancel failed" });
    }
  };

  if (loading) return <Typography color="text.secondary">Loading order…</Typography>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!order) return null;

  return (
    <Stack spacing={2}>
      <Button startIcon={<ArrowBackRoundedIcon />} onClick={() => navigate("/dashboard/orders")} sx={{ alignSelf: "flex-start" }}>
        Back to orders
      </Button>

      <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, border: "1px solid #dbe4ea" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
          <Box>
            <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>{orderLabel(order)}</Typography>
            <Typography color="text.secondary" sx={{ fontSize: 13 }}>
              Placed {formatPkt(order.createdAt)}
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1 }} flexWrap="wrap" useFlexGap>
              <Chip label={order.orderStatus} color={ORDER_STATUS_COLOR[order.orderStatus] || "default"} />
              <Chip variant="outlined" label={`Payment: ${order.paymentStatus}`} />
              <Chip variant="outlined" label={String(order.paymentMethod || "").toUpperCase()} />
            </Stack>
          </Box>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button startIcon={<PictureAsPdfOutlinedIcon />} variant="outlined" onClick={openInvoice}>
              Invoice
            </Button>
            <Button
              startIcon={<ShoppingCartCheckoutRoundedIcon />}
              variant="contained"
              color="secondary"
              onClick={() => {
                reorderToCart(order);
                navigate("/cart");
              }}
            >
              Reorder
            </Button>
            {order.orderStatus === "pending" && (
              <Button startIcon={<CancelOutlinedIcon />} color="error" variant="outlined" onClick={cancelOrder}>
                Cancel
              </Button>
            )}
          </Stack>
        </Stack>

        {order.orderStatus !== "cancelled" ? (
          <Box sx={{ mt: 3 }}>
            <Stepper activeStep={activeStep} alternativeLabel>
              {FLOW.map((label) => (
                <Step key={label} completed={FLOW.indexOf(order.orderStatus) > FLOW.indexOf(label) || order.orderStatus === "delivered"}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            This order was cancelled.
          </Alert>
        )}
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5, color: PORTAL_TEAL }}>Items</Typography>
        <Stack spacing={1.25} divider={<Divider />}>
          {(order.items || []).map((item, idx) => (
            <Stack key={idx} direction="row" justifyContent="space-between" gap={2}>
              <Box>
                <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Qty {item.quantity} × {formatMoney(item.price)}
                </Typography>
              </Box>
              <Typography sx={{ fontWeight: 800 }}>{formatMoney((item.price || 0) * (item.quantity || 0))}</Typography>
            </Stack>
          ))}
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Typography sx={{ textAlign: "right", fontWeight: 800, fontSize: 18 }}>
          Subtotal: {formatMoney(order.subtotal)}
        </Typography>
      </Paper>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
        <Typography sx={{ fontWeight: 800, mb: 1.5, color: PORTAL_TEAL }}>Delivery & payment</Typography>
        <Stack spacing={0.75}>
          <Typography>
            <strong>Customer:</strong> {order.customerName}
          </Typography>
          <Typography>
            <strong>Phone:</strong> {order.phone}
          </Typography>
          <Typography>
            <strong>Email:</strong> {order.email}
          </Typography>
          <Typography>
            <strong>Address:</strong> {[order.address, order.city].filter(Boolean).join(", ") || "—"}
          </Typography>
          {order.deliveryDate ? (
            <Typography>
              <strong>Requested delivery:</strong> {order.deliveryDate}
            </Typography>
          ) : null}
          {order.transactionReference ? (
            <Typography>
              <strong>Transaction ref:</strong> {order.transactionReference}
            </Typography>
          ) : null}
          {order.notes ? (
            <Typography>
              <strong>Notes:</strong> {order.notes}
            </Typography>
          ) : null}
        </Stack>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={3500}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
      >
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
