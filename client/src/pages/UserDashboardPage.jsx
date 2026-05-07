import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { authHeaders, http } from "../api/http";
import { clearAuthSession, getAuthToken, getAuthUser, setAuthSession } from "../auth/session";
import { UserSupportChat } from "../components/UserSupportChat";

const STATUS_COLOR = {
  pending: "warning",
  looking: "info",
  edit: "secondary",
  published: "success",
  rejected: "error",
};

const emptySubmission = { name: "", imageUrl: "", description: "", price: "", stock: "", category: "General", comment: "" };

export const UserDashboardPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tab, setTab] = useState(0);
  const [broadcasts, setBroadcasts] = useState([]);
  const [floatingBroadcasts, setFloatingBroadcasts] = useState([]);
  const [supportUnread, setSupportUnread] = useState(0);
  const [profile, setProfile] = useState({ name: "", phone: "", avatarUrl: "", gender: "prefer_not_to_say" });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [submission, setSubmission] = useState(emptySubmission);
  const [submissions, setSubmissions] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });
  const lastBroadcastTopIdRef = useRef("");
  const user = getAuthUser();
  const token = getAuthToken();

  const showToast = (severity, message) => setToast({ open: true, severity, message });

  const loadBroadcasts = async () => {
    const res = await http.get("/chat/broadcasts", authHeaders(token));
    const items = res.data || [];
    setBroadcasts(items);
    const topId = items[0]?._id || "";
    if (!lastBroadcastTopIdRef.current) {
      lastBroadcastTopIdRef.current = topId;
      setFloatingBroadcasts(items.slice(0, 2));
      return;
    }
    if (topId && topId !== lastBroadcastTopIdRef.current) {
      lastBroadcastTopIdRef.current = topId;
      setFloatingBroadcasts(items.slice(0, 2));
    }
  };

  const loadSubmissions = async () => {
    const res = await http.get("/product-reviews/mine", authHeaders(token));
    setSubmissions(res.data || []);
  };

  useEffect(() => {
    if (!token) return;
    loadBroadcasts().catch(() => {});
    const t = setInterval(() => {
      loadBroadcasts().catch(() => {});
    }, 15000);
    return () => clearInterval(t);
  }, [token]);

  useEffect(() => {
    if (!floatingBroadcasts.length) return;
    const id = setTimeout(() => setFloatingBroadcasts([]), 3000);
    return () => clearTimeout(id);
  }, [floatingBroadcasts]);

  useEffect(() => {
    if (!token) return;
    const n = location.state?.chatUnread;
    if (typeof n === "number" && n > 0) {
      showToast("info", `You have ${n} unread message${n === 1 ? "" : "s"} from support.`);
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate, token]);

  useEffect(() => {
    const incomingTab = location.state?.dashboardTab;
    if (typeof incomingTab === "number") {
      setTab(incomingTab);
      navigate("/dashboard", { replace: true, state: {} });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    if (!token) return;
    const h = authHeaders(token);
    http.get("/auth/me", h).then((res) => {
      setProfile({
        name: res.data?.name || "",
        phone: res.data?.phone || "",
        avatarUrl: res.data?.avatarUrl || "",
        gender: res.data?.gender || "prefer_not_to_say",
      });
      if (!lastBroadcastTopIdRef.current) {
        lastBroadcastTopIdRef.current = "";
      }
    });
    loadSubmissions().catch(() => {});
    const loadUnread = () =>
      http.get("/chat/unread-count", h).then((r) => setSupportUnread(Number(r.data?.count) || 0)).catch(() => {});
    loadUnread();
    const id = setInterval(loadUnread, 20000);
    return () => clearInterval(id);
  }, [token]);

  const logout = () => {
    clearAuthSession();
    navigate("/login", { replace: true });
  };

  const saveProfile = async () => {
    const res = await http.put("/auth/me", profile, authHeaders(token));
    setAuthSession({ token, user: { ...(getAuthUser() || {}), ...res.data, id: res.data._id || res.data.id } });
    setIsEditingProfile(false);
    showToast("success", "Profile updated.");
  };

  const onProfileImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, avatarUrl: String(reader.result || "") }));
      showToast("success", "Profile image selected.");
    };
    reader.readAsDataURL(file);
  };

  const submitForReview = async () => {
    await http.post(
      "/product-reviews/submit",
      {
        ...submission,
        price: Number(submission.price || 0),
        stock: Number(submission.stock || 0),
      },
      authHeaders(token)
    );
    setSubmission(emptySubmission);
    await loadSubmissions();
    showToast("success", "Product sent to admin review.");
    setTab(2);
  };

  const onProductImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setSubmission((p) => ({ ...p, imageUrl: String(reader.result || "") }));
      showToast("success", "Product image selected.");
    };
    reader.readAsDataURL(file);
  };

  const statusSummary = useMemo(
    () => ({
      pending: submissions.filter((x) => x.status === "pending").length,
      published: submissions.filter((x) => x.status === "published").length,
    }),
    [submissions]
  );

  if (!token) return <Navigate to="/login" replace />;

  return (
    <Stack spacing={2}>
      <Paper sx={{ p: 3, borderRadius: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2} flexWrap="wrap" gap={1}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Avatar src={profile.avatarUrl || user?.avatarUrl || ""} sx={{ width: 52, height: 52, bgcolor: "primary.main" }}>
              {(profile.name || user?.name || "U").charAt(0).toUpperCase()}
            </Avatar>
            <Box>
            <Typography variant="h4" fontWeight={900}>
              Subowner dashboard
            </Typography>
            <Typography color="text.secondary">
              {user?.name} ({user?.email})
            </Typography>
            </Box>
          </Stack>
          <Button variant="outlined" color="error" onClick={logout}>
            Logout
          </Button>
        </Stack>

        {!!floatingBroadcasts.length && (
          <Stack spacing={1} sx={{ mb: 2 }}>
            <Stack direction="row" alignItems="center" spacing={0.75}>
              <CampaignOutlinedIcon color="primary" fontSize="small" />
              <Typography variant="subtitle1" fontWeight={800}>
                Live announcements
              </Typography>
            </Stack>
            {floatingBroadcasts.map((b) => (
              <Alert key={b._id} severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2">{b.message}</Typography>
              </Alert>
            ))}
          </Stack>
        )}

        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }} variant="scrollable" allowScrollButtonsMobile>
          <Tab label={`Broadcasts (${broadcasts.length})`} />
          <Tab label="Create product" />
          <Tab label={`Review queue (${statusSummary.pending})`} />
          <Tab
            label={
              <Badge color="error" badgeContent={supportUnread} max={99} invisible={supportUnread === 0}>
                <Typography component="span" variant="inherit">
                  Support chat
                </Typography>
              </Badge>
            }
          />
          <Tab label="My profile" />
        </Tabs>

        {tab === 0 && (
          <Stack spacing={1.5}>
            <Typography variant="h6">Broadcast message history</Typography>
            {!broadcasts.length && <Typography color="text.secondary">No broadcast yet.</Typography>}
            {broadcasts.map((b) => (
              <Alert key={b._id} severity="info" sx={{ borderRadius: 2 }}>
                <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                  {b.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(b.createdAt).toLocaleString()}
                </Typography>
              </Alert>
            ))}
          </Stack>
        )}

        {tab === 1 && (
          <Stack spacing={2}>
            <Typography variant="h6">Create product for admin review</Typography>
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Stack spacing={1.5}>
                  <TextField label="Name" value={submission.name} onChange={(e) => setSubmission((p) => ({ ...p, name: e.target.value }))} />
                  <TextField label="Image URL" value={submission.imageUrl} onChange={(e) => setSubmission((p) => ({ ...p, imageUrl: e.target.value }))} />
                  <Stack direction="row" spacing={1.2} alignItems="center">
                    <Button variant="outlined" component="label" startIcon={<CloudUploadOutlinedIcon />}>
                      Upload image
                      <input hidden accept="image/*" type="file" onChange={onProductImageUpload} />
                    </Button>
                    <Typography variant="caption" color="text.secondary">
                      PNG/JPG/WEBP supported
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, height: "100%" }}>
                  <Typography variant="caption" color="text.secondary">
                    Product preview
                  </Typography>
                  <Box
                    component="img"
                    src={submission.imageUrl || "/icons.svg"}
                    alt="Product preview"
                    sx={{ mt: 1, width: "100%", height: 130, objectFit: "cover", borderRadius: 1.5, bgcolor: "#f3f4f6" }}
                  />
                </Paper>
              </Grid>
            </Grid>
            <TextField label="Category" value={submission.category} onChange={(e) => setSubmission((p) => ({ ...p, category: e.target.value }))} />
            <TextField label="Description" multiline minRows={3} value={submission.description} onChange={(e) => setSubmission((p) => ({ ...p, description: e.target.value }))} />
            <Grid container spacing={1.5}>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Price"
                  type="number"
                  inputProps={{ inputMode: "decimal", min: 0 }}
                  value={submission.price}
                  onChange={(e) => setSubmission((p) => ({ ...p, price: e.target.value }))}
                />
              </Grid>
              <Grid size={{ xs: 6 }}>
                <TextField
                  fullWidth
                  label="Stock"
                  type="number"
                  inputProps={{ inputMode: "numeric", min: 0 }}
                  value={submission.stock}
                  onChange={(e) => setSubmission((p) => ({ ...p, stock: e.target.value }))}
                />
              </Grid>
            </Grid>
            <TextField
              label="Comment to admin"
              multiline
              minRows={2}
              value={submission.comment}
              onChange={(e) => setSubmission((p) => ({ ...p, comment: e.target.value }))}
              helperText="Write message for admin about this product."
            />
            <Button variant="contained" endIcon={<SendRoundedIcon />} onClick={submitForReview}>
              Send product to admin review
            </Button>
          </Stack>
        )}

        {tab === 2 && (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="h6">Products sent for review</Typography>
              <Chip label={`${submissions.length} total`} />
            </Stack>
            {!submissions.length && <Typography color="text.secondary">No products submitted yet.</Typography>}
            <Grid container spacing={1.5}>
              {submissions.map((item) => (
                <Grid key={item._id} size={{ xs: 12, md: 6 }}>
                  <Card variant="outlined" sx={{ borderRadius: 2.5, height: "100%" }}>
                    <CardActionArea onClick={() => navigate(`/dashboard/review/${item._id}`)} sx={{ height: "100%" }}>
                      <CardContent>
                        <Stack direction="row" spacing={1.25}>
                          <Box
                            component="img"
                            src={item.imageUrl || "/icons.svg"}
                            alt={item.name}
                            sx={{ width: 84, height: 84, borderRadius: 1.5, objectFit: "cover", bgcolor: "#f3f4f6", flexShrink: 0 }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Stack direction="row" justifyContent="space-between" spacing={1}>
                              <Typography fontWeight={800} noWrap>
                                {item.name}
                              </Typography>
                              <Chip label={item.status} size="small" color={STATUS_COLOR[item.status] || "default"} />
                            </Stack>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.4 }}>
                              PKR {item.price} · Stock {item.stock}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.7 }}>
                              Comments: {(item.comments || []).length}
                            </Typography>
                            <Button size="small" startIcon={<VisibilityOutlinedIcon />} sx={{ mt: 1 }}>
                              Open details
                            </Button>
                          </Box>
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Stack>
        )}

        {tab === 3 && <UserSupportChat token={token} showToast={showToast} />}

        {tab === 4 && (
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6">Profile settings</Typography>
              {!isEditingProfile ? (
                <Button variant="outlined" startIcon={<EditOutlinedIcon />} onClick={() => setIsEditingProfile(true)}>
                  Edit
                </Button>
              ) : (
                <Stack direction="row" spacing={1}>
                  <Button variant="outlined" onClick={() => setIsEditingProfile(false)}>
                    Cancel
                  </Button>
                  <Button variant="contained" onClick={saveProfile}>
                    Save
                  </Button>
                </Stack>
              )}
            </Stack>
            {!isEditingProfile ? (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5 }}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="center" alignItems="center">
                  <Avatar src={profile.avatarUrl || ""} sx={{ width: 86, height: 86 }}>
                    {(profile.name || "U").charAt(0).toUpperCase()}
                  </Avatar>
                  <Stack spacing={0.5} alignItems={{ xs: "center", sm: "flex-start" }} textAlign={{ xs: "center", sm: "left" }}>
                    <Typography fontWeight={800}>{profile.name || "—"}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {user?.email || "—"}
                    </Typography>
                    <Typography variant="body2">Phone: {profile.phone || "—"}</Typography>
                    <Typography variant="body2">
                      Gender: {profile.gender === "prefer_not_to_say" ? "Prefer not to say" : profile.gender}
                    </Typography>
                  </Stack>
                </Stack>
              </Paper>
            ) : (
              <Grid container spacing={1.5}>
                <Grid size={{ xs: 12, md: 8 }}>
                  <Stack spacing={1.5}>
                    <TextField fullWidth label="Full name" value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
                    <TextField fullWidth label="Phone" value={profile.phone} onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))} />
                    <TextField
                      fullWidth
                      label="Profile image URL"
                      value={profile.avatarUrl}
                      onChange={(e) => setProfile((p) => ({ ...p, avatarUrl: e.target.value }))}
                    />
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button variant="outlined" component="label" startIcon={<CloudUploadOutlinedIcon />}>
                        Upload image
                        <input hidden accept="image/*" type="file" onChange={onProfileImageUpload} />
                      </Button>
                    </Stack>
                    <TextField select fullWidth label="Gender" value={profile.gender} onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                      <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                    </TextField>
                  </Stack>
                </Grid>
                <Grid size={{ xs: 12, md: 4 }}>
                  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 2, textAlign: "center" }}>
                    <Typography variant="caption" color="text.secondary">
                      Avatar preview
                    </Typography>
                    <Avatar src={profile.avatarUrl || ""} sx={{ width: 100, height: 100, mx: "auto", mt: 1.5 }}>
                      {(profile.name || "U").charAt(0).toUpperCase()}
                    </Avatar>
                  </Paper>
                </Grid>
              </Grid>
            )}
          </Stack>
        )}
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
