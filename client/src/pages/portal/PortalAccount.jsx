import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Divider,
  IconButton,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import { authHeaders, http } from "../../api/http";
import { getAuthUser, setAuthSession } from "../../auth/session";
import { PORTAL_TEAL } from "./portalUtils";

const emptySite = { label: "", address: "", city: "", area: "", contactPhone: "", isDefault: false };

export const PortalAccount = () => {
  const { token } = useOutletContext();
  const [tab, setTab] = useState(0);
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    company: "",
    industryType: "",
    city: "",
    ntn: "",
    strn: "",
    avatarUrl: "",
    gender: "prefer_not_to_say",
    email: "",
  });
  const [sites, setSites] = useState([]);
  const [siteForm, setSiteForm] = useState(emptySite);
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    const [me, siteRes] = await Promise.all([
      http.get("/auth/me", authHeaders(token)),
      http.get("/portal/sites", authHeaders(token)),
    ]);
    const u = me.data || {};
    setProfile({
      name: u.name || "",
      phone: u.phone || "",
      company: u.company || "",
      industryType: u.industryType || "",
      city: u.city || "",
      ntn: u.ntn || "",
      strn: u.strn || "",
      avatarUrl: u.avatarUrl || "",
      gender: u.gender || "prefer_not_to_say",
      email: u.email || "",
    });
    setSites(siteRes.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
  }, [token]);

  const saveProfile = async () => {
    try {
      const res = await http.put("/auth/me", profile, authHeaders(token));
      const updated = { ...(getAuthUser() || {}), ...res.data, id: res.data._id || res.data.id };
      setAuthSession({ token, user: updated });
      setToast({ open: true, severity: "success", message: "Profile saved." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Save failed" });
    }
  };

  const addSite = async () => {
    try {
      const res = await http.post("/portal/sites", siteForm, authHeaders(token));
      setSites(res.data || []);
      setSiteForm(emptySite);
      setToast({ open: true, severity: "success", message: "Delivery site added." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed" });
    }
  };

  const removeSite = async (siteId) => {
    const res = await http.delete(`/portal/sites/${siteId}`, authHeaders(token));
    setSites(res.data || []);
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) {
      setToast({ open: true, severity: "error", message: "New passwords do not match." });
      return;
    }
    try {
      await http.post(
        "/auth/change-password",
        { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword },
        authHeaders(token)
      );
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      setToast({ open: true, severity: "success", message: "Password updated." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Failed" });
    }
  };

  return (
    <Stack spacing={2}>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Account</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Company profile, delivery sites, and security.
        </Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Company profile" />
        <Tab label="Delivery sites" />
        <Tab label="Security" />
      </Tabs>

      {tab === 0 && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
          <Stack spacing={1.75}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: "22px",
                  overflow: "hidden",
                  flexShrink: 0,
                  bgcolor: "#f15b37",
                  color: "#fff",
                  display: "grid",
                  placeItems: "center",
                  fontWeight: 800,
                  fontSize: 28,
                }}
              >
                {profile.avatarUrl ? (
                  <Box component="img" src={profile.avatarUrl} alt="" sx={{ width: 1, height: 1, objectFit: "cover" }} />
                ) : (
                  (profile.name || "M").trim().charAt(0).toUpperCase()
                )}
              </Box>
              <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                <Typography sx={{ fontWeight: 800, fontSize: 14 }}>Profile image</Typography>
                <Typography color="text.secondary" sx={{ fontSize: 12.5 }}>
                  Upload a photo for your account avatar.
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Button component="label" size="small" variant="contained" color="secondary">
                    Choose photo
                    <input
                      hidden
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (!file.type.startsWith("image/")) {
                          setToast({ open: true, severity: "error", message: "Please choose an image file." });
                          return;
                        }
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setProfile((p) => ({ ...p, avatarUrl: String(reader.result || "") }));
                          setToast({ open: true, severity: "success", message: "Photo ready — save profile to apply." });
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </Button>
                  {profile.avatarUrl ? (
                    <Button size="small" onClick={() => setProfile((p) => ({ ...p, avatarUrl: "" }))}>
                      Remove
                    </Button>
                  ) : null}
                </Stack>
              </Stack>
            </Stack>
            <TextField label="Email" value={profile.email} disabled fullWidth />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Full name"
                value={profile.name}
                onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="Company"
              value={profile.company}
              onChange={(e) => setProfile((p) => ({ ...p, company: e.target.value }))}
              fullWidth
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="Industry"
                value={profile.industryType}
                onChange={(e) => setProfile((p) => ({ ...p, industryType: e.target.value }))}
                fullWidth
              />
              <TextField
                label="City"
                value={profile.city}
                onChange={(e) => setProfile((p) => ({ ...p, city: e.target.value }))}
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <TextField
                label="NTN"
                value={profile.ntn}
                onChange={(e) => setProfile((p) => ({ ...p, ntn: e.target.value }))}
                fullWidth
              />
              <TextField
                label="STRN"
                value={profile.strn}
                onChange={(e) => setProfile((p) => ({ ...p, strn: e.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              select
              label="Gender"
              value={profile.gender}
              onChange={(e) => setProfile((p) => ({ ...p, gender: e.target.value }))}
              fullWidth
            >
              <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
              <MenuItem value="male">Male</MenuItem>
              <MenuItem value="female">Female</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </TextField>
            <Button variant="contained" color="secondary" onClick={saveProfile} sx={{ alignSelf: "flex-start" }}>
              Save profile
            </Button>
          </Stack>
        </Paper>
      )}

      {tab === 1 && (
        <Stack spacing={2}>
          <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
            <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Add delivery site</Typography>
            <Stack spacing={1.5}>
              <TextField
                label="Site label"
                placeholder="e.g. Ferozepur Road warehouse"
                value={siteForm.label}
                onChange={(e) => setSiteForm((s) => ({ ...s, label: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Address"
                value={siteForm.address}
                onChange={(e) => setSiteForm((s) => ({ ...s, address: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="City"
                  value={siteForm.city}
                  onChange={(e) => setSiteForm((s) => ({ ...s, city: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Area"
                  value={siteForm.area}
                  onChange={(e) => setSiteForm((s) => ({ ...s, area: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label="Site phone"
                  value={siteForm.contactPhone}
                  onChange={(e) => setSiteForm((s) => ({ ...s, contactPhone: e.target.value }))}
                  fullWidth
                />
              </Stack>
              <Button
                startIcon={<AddRoundedIcon />}
                variant="contained"
                onClick={addSite}
                disabled={!siteForm.label || !siteForm.address}
                sx={{ alignSelf: "flex-start" }}
              >
                Save site
              </Button>
            </Stack>
          </Paper>

          {sites.length === 0 ? (
            <Alert severity="info">No saved sites yet. Add project addresses for faster checkout.</Alert>
          ) : (
            sites.map((s) => (
              <Paper key={s._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea" }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Box>
                    <Typography sx={{ fontWeight: 800 }}>
                      {s.label} {s.isDefault ? "· Default" : ""}
                    </Typography>
                    <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                      {s.address}
                      {s.city ? `, ${s.city}` : ""}
                      {s.area ? ` · ${s.area}` : ""}
                    </Typography>
                    {s.contactPhone ? (
                      <Typography sx={{ fontSize: 13 }}>{s.contactPhone}</Typography>
                    ) : null}
                  </Box>
                  <IconButton color="error" onClick={() => removeSite(s._id)}>
                    <DeleteOutlineRoundedIcon />
                  </IconButton>
                </Stack>
              </Paper>
            ))
          )}
        </Stack>
      )}

      {tab === 2 && (
        <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
          <Typography sx={{ fontWeight: 800, mb: 1 }}>Password & security</Typography>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: 2 }}>
            Sign-in uses email 2FA. Change your password below if you need a new credential.
          </Typography>
          <Stack spacing={1.5} maxWidth={420}>
            <TextField
              type="password"
              label="Current password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
              fullWidth
            />
            <TextField
              type="password"
              label="New password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
              fullWidth
            />
            <TextField
              type="password"
              label="Confirm new password"
              value={passwords.confirm}
              onChange={(e) => setPasswords((p) => ({ ...p, confirm: e.target.value }))}
              fullWidth
            />
            <Button variant="contained" color="secondary" onClick={changePassword} sx={{ alignSelf: "flex-start" }}>
              Update password
            </Button>
          </Stack>
          <Divider sx={{ my: 2.5 }} />
          <Alert severity="success">Email 2FA is enabled on every sign-in for this account.</Alert>
        </Paper>
      )}

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
