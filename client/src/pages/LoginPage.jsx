import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Box, Button, Paper, Snackbar, Stack, Tab, Tabs, TextField, Typography } from "@mui/material";
import { http } from "../api/http";
import { setAuthSession } from "../auth/session";

const buildPendingMailto = (adminEmail, userEmail, userName) => {
  const subject = encodeURIComponent(`Marblex – please approve my account (${userEmail})`);
  const body = encodeURIComponent(
    `Hello Admin,\n\nPlease approve my Marblex account so I can log in.\n\nName: ${userName || "—"}\nEmail: ${userEmail}\n\nThank you.`
  );
  return `mailto:${adminEmail}?subject=${subject}&body=${body}`;
};

const buildBlockedMailto = (adminEmail, userEmail) => {
  const subject = encodeURIComponent(`Marblex – blocked account (${userEmail})`);
  const body = encodeURIComponent(
    `Hello Admin,\n\nMy email is ${userEmail}. My account shows as blocked when I try to log in. Please help.\n\nThank you.`
  );
  return `mailto:${adminEmail}?subject=${subject}&body=${body}`;
};

export const LoginPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "error" });
  const [loginAssist, setLoginAssist] = useState(null);
  const [registerAssist, setRegisterAssist] = useState(null);

  const showToast = (message, severity = "error") => {
    setToast({ open: true, message, severity });
  };

  const login = async () => {
    setLoginAssist(null);
    try {
      const res = await http.post("/auth/login", loginForm);
      setAuthSession(res.data);
      const chatUnread = Number(res.data.chatUnread) || 0;
      if (res.data.user.role === "admin") {
        navigate("/admin", { replace: true, state: { chatUnread } });
      } else {
        navigate("/dashboard", { replace: true, state: { chatUnread } });
      }
    } catch (error) {
      const data = error?.response?.data;
      const message = data?.message || "Login failed. Please try again.";
      if (data?.contactEmail && data?.code) {
        setLoginAssist({
          code: data.code,
          contactEmail: data.contactEmail,
          userEmail: loginForm.email,
          message,
        });
      }
      showToast(message, "error");
    }
  };

  const register = async () => {
    setRegisterAssist(null);
    try {
      const snap = { ...registerForm };
      const res = await http.post("/auth/register", registerForm);
      const message =
        res.data?.message ||
        "Account created. Wait for admin approval, then sign in from the Login tab.";
      showToast(message, "success");
      setRegisterForm({ name: "", email: "", password: "" });
      setTab(0);
      if (res.data?.contactEmail) {
        setRegisterAssist({
          contactEmail: res.data.contactEmail,
          name: snap.name,
          email: snap.email,
        });
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      showToast(message, "error");
    }
  };

  return (
    <Box sx={{ minHeight: "calc(100vh - 220px)", display: "grid", placeItems: "center" }}>
      <Paper
        sx={{
          width: "100%",
          maxWidth: 940,
          borderRadius: 4,
          overflow: "hidden",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1.1fr" },
        }}
      >
        <Box
          sx={{
            p: { xs: 3, md: 4 },
            bgcolor: "primary.main",
            color: "white",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 1.2,
          }}
        >
          <Typography variant="h4" fontWeight={800}>
            Welcome to Marblex
          </Typography>
          <Typography>
            Login for better experience.
          </Typography>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Typography variant="h5" fontWeight={800} mb={2}>
            Login / Register
          </Typography>
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              if (v === 1) {
                setLoginAssist(null);
                setRegisterAssist(null);
              }
            }}
            sx={{ mb: 2 }}
          >
            <Tab label="Login" />
            <Tab label="Register User" />
          </Tabs>

          {tab === 0 && (
            <Stack
              spacing={1.5}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
            >
              <TextField
                label="Email"
                value={loginForm.email}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, email: e.target.value });
                  setLoginAssist(null);
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={loginForm.password}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, password: e.target.value });
                  setLoginAssist(null);
                }}
              />
              <Button type="submit" variant="contained" size="large">
                Login
              </Button>
              {loginAssist && loginAssist.code === "PENDING_APPROVAL" && (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                    Waiting for admin approval
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    Open your email app and send a request to the admin. Your registered email is filled in the message.
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    component="a"
                    href={buildPendingMailto(loginAssist.contactEmail, loginAssist.userEmail, "")}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Email admin – request access
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Sends to: {loginAssist.contactEmail}
                  </Typography>
                </Alert>
              )}
              {loginAssist && loginAssist.code === "ACCOUNT_BLOCKED" && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                  <Typography variant="body2" fontWeight={600} mb={0.5}>
                    Account blocked
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={1.5}>
                    Contact the admin by email if you need help.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    component="a"
                    href={buildBlockedMailto(loginAssist.contactEmail, loginAssist.userEmail)}
                    sx={{ textTransform: "none", fontWeight: 700 }}
                  >
                    Email admin
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                    Sends to: {loginAssist.contactEmail}
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}

          {tab === 1 && (
            <Stack
              spacing={1.5}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                register();
              }}
            >
              <TextField label="Name" value={registerForm.name} onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} />
              <TextField label="Email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} />
              <TextField label="Password" type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} />
              <Button type="submit" variant="contained" size="large">
                Create account
              </Button>
              <Typography variant="caption" color="text.secondary">
                After sign-up, an admin must approve your account before you can log in.
              </Typography>
            </Stack>
          )}

          {tab === 0 && registerAssist && (
            <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
              <Typography variant="body2" fontWeight={600} mb={0.5}>
                Just registered?
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={1.5}>
                You can email the admin to ask for access approval (optional).
              </Typography>
              <Button
                variant="outlined"
                size="small"
                component="a"
                href={buildPendingMailto(registerAssist.contactEmail, registerAssist.email, registerAssist.name)}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Email admin – please approve my account
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" mt={1}>
                Sends to: {registerAssist.contactEmail}
              </Typography>
            </Alert>
          )}
        </Box>
      </Paper>

      <Snackbar
        open={toast.open}
        autoHideDuration={loginAssist ? 6500 : 3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        sx={{ mb: { xs: 2, md: 3 }, mr: { xs: 1, md: 2 } }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ minWidth: 280, boxShadow: "0 10px 24px rgba(0,0,0,0.2)" }}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};
