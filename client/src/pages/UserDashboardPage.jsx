import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Badge,
  Box,
  Button,
  List,
  ListItem,
  ListItemText,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser } from "../auth/session";
import { UserSupportChat } from "../components/UserSupportChat";

export const UserDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [orders, setOrders] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [supportUnread, setSupportUnread] = useState(0);
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });
  const user = getAuthUser();
  const token = getAuthToken();

  const showToast = (severity, message) => setToast({ open: true, severity, message });

  useEffect(() => {
    if (!token) return;
    http.get("/orders/my", authHeaders(token)).then((res) => setOrders(res.data));
  }, [token]);

  useEffect(() => {
    if (!token) return;
    const load = () => http.get("/chat/broadcasts", authHeaders(token)).then((res) => setBroadcasts(res.data || []));
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    const n = location.state?.chatUnread;
    if (typeof n === "number" && n > 0) {
      showToast(
        "info",
        `You have ${n} unread message${n === 1 ? "" : "s"} from support. Open Support chat.`
      );
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    const load = () =>
      http.get("/chat/unread-count", h).then((r) => setSupportUnread(Number(r.data?.count) || 0)).catch(() => {});
    load();
    const id = setInterval(load, 20000);
    return () => clearInterval(id);
  }, [token]);

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Box>
            <Typography variant="h4" fontWeight={800}>
              My account
            </Typography>
            <Typography color="text.secondary">
              {user?.name} ({user?.email})
            </Typography>
          </Box>
          <Button variant="outlined" color="error" onClick={logout}>
            Logout
          </Button>
        </Stack>

        {!!broadcasts.length && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CampaignOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={800}>
                Announcements from Marblex
              </Typography>
            </Stack>
            {broadcasts.slice(0, 5).map((b) => (
              <Alert key={b._id} severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {b.message}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                  {new Date(b.createdAt).toLocaleString()}
                </Typography>
              </Alert>
            ))}
          </Stack>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="My orders" />
          <Tab
            label={
              <Badge color="error" badgeContent={supportUnread} max={99} invisible={supportUnread === 0}>
                <Typography component="span" variant="inherit">
                  Support chat
                </Typography>
              </Badge>
            }
          />
        </Tabs>

        {tab === 0 && (
          <>
            <Typography variant="h6" mb={1}>
              Your website orders
            </Typography>
            <List>
              {orders.map((order) => (
                <ListItem key={order._id} sx={{ border: "1px solid #eee", borderRadius: 2, mb: 1 }}>
                  <ListItemText
                    primary={`Order ${order._id.slice(-6)} - PKR ${order.subtotal} - ${order.paymentStatus}`}
                    secondary={`Items: ${order.items.map((i) => `${i.name} x${i.quantity}`).join(", ")} | Created: ${new Date(order.createdAt).toLocaleString()}`}
                  />
                </ListItem>
              ))}
              {!orders.length && <Typography color="text.secondary">No orders yet.</Typography>}
            </List>
          </>
        )}

        {tab === 1 && <UserSupportChat token={token} showToast={showToast} />}
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((p) => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity={toast.severity} variant="filled" onClose={() => setToast((p) => ({ ...p, open: false }))}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Stack>
  );
};
