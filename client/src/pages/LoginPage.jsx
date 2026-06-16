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
  const [loading, setLoading] = useState(false);

  const showToast = (message, severity = "error") => {
    setToast({ open: true, message, severity });
  };

  const login = async () => {
    setLoginAssist(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    setRegisterAssist(null);
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-100px)] flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-full max-w-4xl bg-white rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10">
        
        {/* Left Side: Branding */}
        <div className="md:w-[45%] bg-slate-900 p-8 md:p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
            <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-rose-600 rounded-full blur-[80px]"></div>
            <div className="absolute bottom-[-10%] left-[-20%] w-64 h-64 bg-indigo-600 rounded-full blur-[80px]"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-black mb-4 leading-tight tracking-tight">
              Welcome to <span className="text-rose-500">Marblex</span>
            </h2>
            <p className="text-slate-400 font-medium text-lg leading-relaxed mb-8">
              Access your premium dashboard, track orders, and discover exclusive construction solutions.
            </p>
            <div className="flex items-center gap-4 text-sm font-bold text-slate-300">
              <span className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Secure Access
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span className="flex items-center gap-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-rose-500"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> Fast Checkout
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-[55%] p-8 md:p-12 bg-white">
          <h3 className="text-2xl font-extrabold text-slate-900 mb-6 tracking-tight">
            Account Portal
          </h3>
          
          <Tabs
            value={tab}
            onChange={(_, v) => {
              setTab(v);
              if (v === 1) {
                setLoginAssist(null);
                setRegisterAssist(null);
              }
            }}
            sx={{ 
              mb: 4, 
              '& .MuiTabs-indicator': { backgroundColor: '#e11d48', height: 3, borderRadius: '3px 3px 0 0' },
              '& .MuiTab-root': { textTransform: 'none', fontWeight: 800, fontSize: '1rem', color: '#64748b' },
              '& .Mui-selected': { color: '#0f172a !important' },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

          {tab === 0 && (
            <Stack
              spacing={2.5}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                login();
              }}
            >
              <TextField
                label="Email Address"
                variant="outlined"
                value={loginForm.email}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, email: e.target.value });
                  setLoginAssist(null);
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField
                label="Password"
                type="password"
                variant="outlined"
                value={loginForm.password}
                onChange={(e) => {
                  setLoginForm({ ...loginForm, password: e.target.value });
                  setLoginAssist(null);
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-rose-600 text-white font-black text-lg py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-rose-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Authenticating..." : "Sign In to Account"}
              </button>
              
              {loginAssist && loginAssist.code === "PENDING_APPROVAL" && (
                <Alert severity="warning" sx={{ borderRadius: 3, p: 2, '& .MuiAlert-message': { width: '100%' } }}>
                  <Typography variant="body2" fontWeight={800} mb={0.5} color="warning.dark">
                    Waiting for admin approval
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.5 }}>
                    Open your email app and send a request to the admin. Your registered email is filled in the message.
                  </Typography>
                  <Button
                    variant="contained"
                    color="warning"
                    size="small"
                    component="a"
                    fullWidth
                    href={buildPendingMailto(loginAssist.contactEmail, loginAssist.userEmail, "")}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, py: 1 }}
                  >
                    Email Admin to Request Access
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1.5} textAlign="center">
                    Sends to: {loginAssist.contactEmail}
                  </Typography>
                </Alert>
              )}
              
              {loginAssist && loginAssist.code === "ACCOUNT_BLOCKED" && (
                <Alert severity="error" sx={{ borderRadius: 3, p: 2, '& .MuiAlert-message': { width: '100%' } }}>
                  <Typography variant="body2" fontWeight={800} mb={0.5} color="error.dark">
                    Account Access Blocked
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.5 }}>
                    Contact the admin by email if you need help recovering your account.
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    size="small"
                    component="a"
                    fullWidth
                    href={buildBlockedMailto(loginAssist.contactEmail, loginAssist.userEmail)}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, py: 1 }}
                  >
                    Email Admin for Help
                  </Button>
                  <Typography variant="caption" display="block" color="text.secondary" mt={1.5} textAlign="center">
                    Sends to: {loginAssist.contactEmail}
                  </Typography>
                </Alert>
              )}
            </Stack>
          )}

          {tab === 1 && (
            <Stack
              spacing={2.5}
              component="form"
              onSubmit={(e) => {
                e.preventDefault();
                register();
              }}
            >
              <TextField 
                label="Full Name" 
                variant="outlined"
                value={registerForm.name} 
                onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField 
                label="Email Address" 
                variant="outlined"
                value={registerForm.email} 
                onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <TextField 
                label="Create Password" 
                type="password" 
                variant="outlined"
                value={registerForm.password} 
                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} 
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 3 } }}
              />
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-rose-600 text-white font-black text-lg py-4 rounded-2xl transition-all duration-300 shadow-xl shadow-slate-900/20 hover:shadow-rose-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? "Processing..." : "Create Account"}
              </button>
              <div className="text-center mt-2">
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                  After sign-up, an admin must approve your account before you can log in.
                </Typography>
              </div>
            </Stack>
          )}

          {tab === 0 && registerAssist && (
            <Alert severity="info" sx={{ mt: 3, borderRadius: 3, p: 2, '& .MuiAlert-message': { width: '100%' } }}>
              <Typography variant="body2" fontWeight={800} mb={0.5} color="info.dark">
                Registration Successful!
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2} sx={{ lineHeight: 1.5 }}>
                You can email the admin to speed up your access approval (optional).
              </Typography>
              <Button
                variant="contained"
                color="info"
                size="small"
                component="a"
                fullWidth
                href={buildPendingMailto(registerAssist.contactEmail, registerAssist.email, registerAssist.name)}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2, py: 1 }}
              >
                Email Admin to Approve Account
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" mt={1.5} textAlign="center">
                Sends to: {registerAssist.contactEmail}
              </Typography>
            </Alert>
          )}
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={loginAssist ? 6500 : 3500}
        onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ minWidth: 280, borderRadius: 3, fontWeight: 700, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};
