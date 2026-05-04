import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { http } from "../api/http";

export const PaymentResultPage = ({ success }) => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const sessionId = params.get("session_id");
  const [details, setDetails] = useState(null);
  const [hasError, setHasError] = useState(false);
  const [loading, setLoading] = useState(Boolean(success && sessionId));

  useEffect(() => {
    if (!success || !sessionId) return;

    http
      .get(`/orders/verify-session/${sessionId}`)
      .then((res) => {
        setDetails(res.data);
        localStorage.setItem("marblex_cart", JSON.stringify([]));
      })
      .catch(() => setHasError(true))
      .finally(() => setLoading(false));
  }, [sessionId, success]);

  const status = !success
    ? "cancelled"
    : !sessionId
      ? "error"
      : loading
        ? "loading"
        : hasError
          ? "error"
          : details?.paymentStatus === "paid"
            ? "paid"
            : "pending";

  useEffect(() => {
    if (status !== "paid") return;
    const timer = setTimeout(() => navigate("/dashboard"), 2000);
    return () => clearTimeout(timer);
  }, [status, navigate]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3, maxWidth: 680 }}>
      {status === "loading" && <Typography>Verifying Stripe payment...</Typography>}
      {status === "paid" && (
        <Stack spacing={1.2}>
          <Typography variant="h5" fontWeight={800}>
            Payment Done
          </Typography>
          <Typography>Order successfully paid with Stripe test payment.</Typography>
          <Typography color="text.secondary">Redirecting to your dashboard...</Typography>
          {details && (
            <Box>
              <Typography>Name: {details.customerName}</Typography>
              <Typography>Email: {details.email}</Typography>
              <Typography>Order ID: {details.orderId}</Typography>
            </Box>
          )}
        </Stack>
      )}
      {status === "cancelled" && (
        <Stack spacing={1.2}>
          <Typography variant="h5" fontWeight={800}>
            Payment Cancelled
          </Typography>
          <Typography>You cancelled Stripe checkout. You can try again from cart.</Typography>
        </Stack>
      )}
      {status === "pending" && <Typography>Payment is pending. Please check again in a moment.</Typography>}
      {status === "error" && <Typography>Could not verify payment. Please contact admin.</Typography>}

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        <Button variant="contained" component={RouterLink} to="/">
          Go To Shop
        </Button>
        <Button variant="outlined" component={RouterLink} to="/dashboard">
          Go To Dashboard
        </Button>
      </Stack>
    </Paper>
  );
};
