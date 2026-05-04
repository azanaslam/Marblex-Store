import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import DeleteIcon from "@mui/icons-material/Delete";
import { authHeaders, http } from "../api/http";
import { getAuthToken, getAuthUser } from "../auth/session";

export const CartPage = ({ cart, setCart }) => {
  const [form, setForm] = useState({ customerName: "", email: "", phone: "", notes: "" });
  const [touched, setTouched] = useState({ customerName: false, email: false, phone: false });
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lastRemoved, setLastRemoved] = useState(null);
  const [showUndo, setShowUndo] = useState(false);
  const [authError, setAuthError] = useState("");
  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);

  const errors = {
    customerName: form.customerName.trim() ? "" : "Name is required",
    email: !form.email.trim() ? "Email is required" : !/^\S+@\S+\.\S+$/.test(form.email) ? "Enter a valid email" : "",
    phone: !form.phone.trim() ? "Phone is required" : form.phone.trim().length < 7 ? "Enter a valid phone" : "",
  };
  const isFormValid = !errors.customerName && !errors.email && !errors.phone;
  const isOrderDisabled = !isFormValid || cart.length === 0;

  const changeQty = (id, quantity) => {
    const parsed = Number(quantity);
    const safeQuantity = Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
    const next = cart.map((item) => (item.productId === id ? { ...item, quantity: safeQuantity } : item));
    setCart(next);
  };

  const removeItem = (itemToRemove) => {
    const next = cart.filter((item) => item.productId !== itemToRemove.productId);
    setCart(next);
    setLastRemoved(itemToRemove);
    setShowUndo(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    removeItem(deleteTarget);
    setDeleteTarget(null);
  };

  const undoRemove = () => {
    if (!lastRemoved) return;
    const exists = cart.some((item) => item.productId === lastRemoved.productId);
    if (!exists) setCart([...cart, lastRemoved]);
    setShowUndo(false);
    setLastRemoved(null);
  };

  const submitOrder = async (channel) => {
    if (isOrderDisabled) {
      setTouched({ customerName: true, email: true, phone: true });
      return;
    }
    try {
      const payload = { ...form, channel, items: cart };
      let res;
      if (channel === "website") {
        const token = getAuthToken();
        const authUser = getAuthUser();
        if (!token || !authUser || authUser.role !== "user") {
          setAuthError("Please login with a user account to place website order.");
          return;
        }
        payload.email = authUser.email;
        res = await http.post("/orders", payload, authHeaders(token));
      } else {
        res = await http.post("/orders", payload);
      }

      if (channel === "whatsapp") {
        const list = cart.map((item) => `${item.name} x${item.quantity} = PKR ${item.price * item.quantity}`).join("%0A");
        const msg =
          `Order from ${form.customerName}%0AEmail: ${form.email}%0APhone: ${form.phone}%0A` +
          `${list}%0ATotal: PKR ${res.data.subtotal}%0ANotes: ${form.notes || "-"}`;
        window.open(`https://wa.me/${res.data.whatsappNumber}?text=${msg}`, "_blank");
      } else {
        if (res.data.checkoutUrl) {
          window.location.href = res.data.checkoutUrl;
          return;
        }
        alert("Unable to start Stripe checkout.");
      }

      setCart([]);
    } catch (error) {
      const message = error?.response?.data?.message || "Order failed. Please try again.";
      setAuthError(message);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={800} mb={2}>
        Your Cart
      </Typography>
      {cart.map((item) => (
        <Paper
          key={item.productId}
          sx={{
            p: 2,
            mb: 1.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "2.5fr 1fr 1fr auto" },
            gap: 1.5,
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              component="img"
              src={item.imageUrl || "/products/Banner1.jpeg"}
              alt={item.name}
              sx={{ width: 56, height: 56, borderRadius: 1.2, objectFit: "cover", border: "1px solid #ececec" }}
            />
            <Typography fontWeight={600}>{item.name}</Typography>
          </Box>
          <TextField size="small" type="number" inputProps={{ min: 1 }} value={item.quantity} onChange={(e) => changeQty(item.productId, e.target.value)} />
          <Typography fontWeight={700}>PKR {item.price * item.quantity}</Typography>
          <IconButton color="error" onClick={() => setDeleteTarget(item)} aria-label="Delete item from cart">
            <DeleteIcon />
          </IconButton>
        </Paper>
      ))}

      <Typography variant="h6" sx={{ mt: 2 }}>
        Total: PKR {total}
      </Typography>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Name"
            value={form.customerName}
            onBlur={() => setTouched((prev) => ({ ...prev, customerName: true }))}
            onChange={(e) => setForm({ ...form, customerName: e.target.value })}
            error={touched.customerName && Boolean(errors.customerName)}
            helperText={touched.customerName ? errors.customerName : ""}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Email"
            value={form.email}
            onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={touched.email && Boolean(errors.email)}
            helperText={touched.email ? errors.email : ""}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            label="Phone"
            value={form.phone}
            onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            error={touched.phone && Boolean(errors.phone)}
            helperText={touched.phone ? errors.phone : ""}
          />
        </Grid>
        <Grid size={{ xs: 12 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Notes / area / location info"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </Grid>
      </Grid>

      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ mt: 2 }}>
        <Button disabled={isOrderDisabled} variant="contained" onClick={() => submitOrder("website")} startIcon={<ShoppingCartIcon />}>
          Place Website Order
        </Button>
        <Button disabled={isOrderDisabled} variant="contained" color="success" onClick={() => submitOrder("whatsapp")} startIcon={<WhatsAppIcon />}>
          Order On WhatsApp
        </Button>
      </Stack>

      <Dialog open={Boolean(deleteTarget)} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Remove Product?</DialogTitle>
        <DialogContent>
          <Typography>
            {deleteTarget ? `Do you want to remove ${deleteTarget.name} from cart?` : "Do you want to remove this item?"}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showUndo}
        autoHideDuration={3500}
        onClose={() => setShowUndo(false)}
        message="Product removed from cart"
        action={
          <Button size="small" color="secondary" onClick={undoRemove}>
            Undo
          </Button>
        }
      />

      <Snackbar
        open={Boolean(authError)}
        autoHideDuration={3000}
        onClose={() => setAuthError("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="error" variant="filled" onClose={() => setAuthError("")}>
          {authError}
        </Alert>
      </Snackbar>
    </Box>
  );
};
