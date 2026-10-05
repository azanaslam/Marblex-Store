import { useEffect, useRef, useState } from "react";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import ContentCopyRoundedIcon from "@mui/icons-material/ContentCopyRounded";
import { authHeaders, http } from "../api/http";
import { getAuthToken, getAuthUser, setAuthSession } from "../auth/session";

const fieldCls =
  "w-full bg-[#f4f7f9] border border-[#e2e8ec] rounded-xl px-3.5 py-2.5 text-[#0b2f3d] text-[13px] font-medium focus:bg-white focus:outline-none focus:border-[#ff6a45] transition";

const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-[22px] bg-white border border-[#e2e8ec]/80 p-5 sm:p-6 shadow-[0_1px_0_#fff_inset,0_1px_2px_rgba(11,47,61,.06),0_8px_18px_-6px_rgba(11,47,61,.12)] ${className}`}
  >
    {children}
  </div>
);

export const AdminProfileTab = ({ token, showToast }) => {
  const fileRef = useRef(null);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    avatarUrl: "",
    role: "admin",
    authProvider: "local",
    industryType: "",
    city: "",
    ntn: "",
    strn: "",
    gender: "prefer_not_to_say",
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [totpEnabled, setTotpEnabled] = useState(false);
  const [totpSetup, setTotpSetup] = useState(null);
  const [totpCode, setTotpCode] = useState("");
  const [disablePw, setDisablePw] = useState("");
  const [showDisable, setShowDisable] = useState(false);
  const [saving, setSaving] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);
  const [totpBusy, setTotpBusy] = useState(false);

  const syncLocalUser = (patch) => {
    const t = token || getAuthToken();
    const next = { ...(getAuthUser() || {}), ...patch, id: patch._id || patch.id || getAuthUser()?.id };
    setAuthSession({ token: t, user: next });
    window.dispatchEvent(new Event("auth-session-changed"));
  };

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await http.get("/auth/me", authHeaders(token));
        if (cancelled) return;
        const u = res.data || {};
        setProfile({
          name: u.name || "",
          email: u.email || "",
          phone: u.phone || "",
          company: u.company || "",
          avatarUrl: u.avatarUrl || "",
          role: u.role || "admin",
          authProvider: u.authProvider || "local",
          industryType: u.industryType || "",
          city: u.city || "",
          ntn: u.ntn || "",
          strn: u.strn || "",
          gender: u.gender || "prefer_not_to_say",
        });
        setTotpEnabled(Boolean(u.totpEnabled));
        syncLocalUser(u);
      } catch {
        const local = getAuthUser() || {};
        if (!cancelled) {
          setProfile((p) => ({
            ...p,
            name: local.name || p.name,
            email: local.email || p.email,
            phone: local.phone || p.phone,
            company: local.company || p.company,
            avatarUrl: local.avatarUrl || p.avatarUrl,
            role: local.role || "admin",
            authProvider: local.authProvider || "local",
          }));
          setTotpEnabled(Boolean(local.totpEnabled));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const onPickImage = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast?.("error", "Please choose an image file (JPG, PNG, WebP).");
      return;
    }
    if (file.size > 2.5 * 1024 * 1024) {
      showToast?.("error", "Image must be under 2.5 MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile((p) => ({ ...p, avatarUrl: String(reader.result || "") }));
      showToast?.("success", "Photo ready — click Save profile to apply.");
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = async () => {
    if (!profile.name.trim()) {
      showToast?.("error", "Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await http.put(
        "/auth/me",
        {
          name: profile.name.trim(),
          phone: profile.phone.trim(),
          company: profile.company.trim(),
          avatarUrl: profile.avatarUrl.trim(),
          industryType: profile.industryType || "",
          city: profile.city || "",
          ntn: profile.ntn || "",
          strn: profile.strn || "",
          gender: profile.gender || "prefer_not_to_say",
        },
        authHeaders(token)
      );
      const updated = res.data || {};
      setProfile((p) => ({
        ...p,
        name: updated.name || p.name,
        phone: updated.phone || "",
        company: updated.company || "",
        avatarUrl: updated.avatarUrl || "",
        email: updated.email || p.email,
        authProvider: updated.authProvider || p.authProvider,
      }));
      syncLocalUser(updated);
      showToast?.("success", "Admin profile saved.");
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Could not save profile.");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!passwords.currentPassword) {
      showToast?.("error", "Enter your current password.");
      return;
    }
    if (passwords.newPassword.length < 6) {
      showToast?.("error", "New password must be at least 6 characters.");
      return;
    }
    if (passwords.newPassword !== passwords.confirm) {
      showToast?.("error", "New passwords do not match.");
      return;
    }
    setUpdatingPw(true);
    try {
      await http.post(
        "/auth/change-password",
        {
          currentPassword: passwords.currentPassword,
          newPassword: passwords.newPassword,
        },
        authHeaders(token)
      );
      setPasswords({ currentPassword: "", newPassword: "", confirm: "" });
      showToast?.("success", "Password updated successfully.");
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Could not update password.");
    } finally {
      setUpdatingPw(false);
    }
  };

  const startTotpSetup = async () => {
    setTotpBusy(true);
    try {
      const res = await http.post("/auth/2fa/totp/setup", {}, authHeaders(token));
      setTotpSetup(res.data);
      setTotpCode("");
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Could not generate QR.");
    } finally {
      setTotpBusy(false);
    }
  };

  const confirmTotp = async () => {
    const code = totpCode.trim();
    if (code.length < 6) {
      showToast?.("error", "Enter the 6-digit authenticator code.");
      return;
    }
    setTotpBusy(true);
    try {
      const res = await http.post("/auth/2fa/totp/confirm", { code }, authHeaders(token));
      setTotpEnabled(true);
      setTotpSetup(null);
      setTotpCode("");
      syncLocalUser({ totpEnabled: true });
      showToast?.("success", res.data?.message || "Authenticator enabled.");
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Invalid code.");
    } finally {
      setTotpBusy(false);
    }
  };

  const disableTotp = async () => {
    if (!disablePw.trim()) {
      showToast?.("error", "Password required to disable authenticator.");
      return;
    }
    setTotpBusy(true);
    try {
      const res = await http.post(
        "/auth/2fa/totp/disable",
        { password: disablePw },
        authHeaders(token)
      );
      setTotpEnabled(false);
      setShowDisable(false);
      setDisablePw("");
      syncLocalUser({ totpEnabled: false });
      showToast?.("success", res.data?.message || "Authenticator disabled.");
    } catch (err) {
      showToast?.("error", err?.response?.data?.message || "Could not disable.");
    } finally {
      setTotpBusy(false);
    }
  };

  const copySecret = async () => {
    if (!totpSetup?.secret) return;
    try {
      await navigator.clipboard.writeText(totpSetup.secret);
      showToast?.("success", "Secret copied.");
    } catch {
      showToast?.("error", "Could not copy secret.");
    }
  };

  const initial = (profile.name || "A").trim().charAt(0).toUpperCase();
  const isGoogle = profile.authProvider === "google" || String(profile.avatarUrl || "").includes("googleusercontent");

  return (
    <div className="space-y-5 max-w-3xl pb-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#6b8190]">System · Identity</p>
          <h2 className="text-[clamp(22px,3vw,30px)] font-extrabold tracking-tight text-[#0b2f3d] mt-0.5">
            Account profile
          </h2>
          <p className="text-[13px] text-[#6b8190] mt-1">
            Controller identity, photo, password, and authenticator security for MARBLEX admin.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-full border border-[#e2e8ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#0b2f3d] shadow-sm">
          <span className={`h-2 w-2 rounded-full ${totpEnabled ? "bg-[#0f9d6b]" : "bg-[#e5484d]"}`} />
          2FA {totpEnabled ? "armed" : "off"}
        </div>
      </div>

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-[#0e3a4a] text-[#ff6a45] grid place-items-center shadow-[0_3px_0_#082631]">
            <PersonOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0b2f3d]">Profile details</h3>
            <p className="text-[11px] text-[#6b8190]">Shown across the admin console & sidebar</p>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0b2f3d] via-[#145068] to-[#1b6a85] p-4 sm:p-5 text-white mb-5 shadow-[0_8px_0_#07202b,0_24px_40px_-18px_rgba(7,32,43,.55)]">
          <div className="absolute inset-0 bg-[radial-gradient(400px_180px_at_90%_10%,rgba(255,106,69,.35),transparent)] pointer-events-none" />
          <div className="relative flex items-center gap-4">
            <div className="h-[72px] w-[72px] rounded-2xl overflow-hidden bg-white/15 border border-white/30 shadow-[0_4px_0_rgba(0,0,0,.25)] grid place-items-center shrink-0">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-extrabold text-[#ffb199]">{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-lg font-extrabold truncate">{profile.name || "Admin"}</p>
              <p className="text-[12px] text-white/75 truncate">{profile.email}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6a45] text-white">
                  Master controller
                </span>
                {isGoogle ? (
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/15 border border-white/25">
                    Google photo linked
                  </span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {/* Image upload */}
        <div className="mb-5 p-4 rounded-2xl bg-[#f4f7f9] border border-[#e2e8ec]">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="h-16 w-16 rounded-2xl overflow-hidden bg-white border border-[#e2e8ec] grid place-items-center shrink-0 shadow-sm">
              {profile.avatarUrl ? (
                <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <PhotoCameraOutlinedIcon sx={{ color: "#6b8190" }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-extrabold text-[#0b2f3d]">Profile image</p>
              <p className="text-[12px] text-[#6b8190] mt-0.5">
                Upload a photo, or sign in with Google — if that account has a picture, it appears here automatically.
              </p>
              <div className="flex flex-wrap gap-2 mt-2.5">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0e3a4a] text-white text-xs font-bold shadow-[0_3px_0_#082631]"
                >
                  <PhotoCameraOutlinedIcon sx={{ fontSize: 16 }} />
                  Choose photo
                </button>
                {profile.avatarUrl ? (
                  <button
                    type="button"
                    onClick={() => setProfile((p) => ({ ...p, avatarUrl: "" }))}
                    className="px-3.5 py-2 rounded-xl border border-[#e2e8ec] bg-white text-xs font-bold text-[#6b8190]"
                  >
                    Remove
                  </button>
                ) : null}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  onPickImage(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Email</label>
            <input type="email" value={profile.email} disabled className={`${fieldCls} bg-[#eef2f6] text-[#6b8190] cursor-not-allowed`} />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={fieldCls}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Optional"
              className={fieldCls}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Company / desk</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              placeholder="e.g. MARBLEX HQ"
              className={fieldCls}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider bg-[#0e3a4a] shadow-[0_4px_0_#082631] disabled:opacity-60 active:translate-y-[2px] active:shadow-none"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </Card>

      {/* Password */}
      <Card>
        <div className="flex items-center gap-3 mb-5">
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-500 grid place-items-center border border-rose-100">
            <LockOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#0b2f3d]">Change password</h3>
            <p className="text-[11px] text-[#6b8190]">Credential used for admin sign-in</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Current password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className={fieldCls}
              autoComplete="current-password"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">New password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className={fieldCls}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Confirm password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className={fieldCls}
              autoComplete="new-password"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={changePassword}
          disabled={updatingPw}
          className="mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_4px_0_#e5502b] disabled:opacity-60 active:translate-y-[2px] active:shadow-none"
        >
          {updatingPw ? "Updating…" : "Update password"}
        </button>
      </Card>

      {/* 2FA Authenticator — same flow as client portal */}
      <Card className="overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#fff4f0] text-[#ff6a45] grid place-items-center border border-[#ffd5c8]">
              <SecurityRoundedIcon sx={{ fontSize: 20 }} />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#0b2f3d]">Authenticator app (QR)</h3>
              <p className="text-[11px] text-[#6b8190] max-w-md">
                Scan once with Google Authenticator / Authy. At login you can choose email code or app code — same as the client portal.
              </p>
            </div>
          </div>
          <span
            className={`shrink-0 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
              totpEnabled
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-[#f4f7f9] text-[#6b8190] border-[#e2e8ec]"
            }`}
          >
            {totpEnabled ? "Enabled" : "Off"}
          </span>
        </div>

        {totpEnabled ? (
          <div className="space-y-3">
            <p className="text-[13px] text-[#6b8190]">
              Authenticator is active on this admin account. Disable below if you lose access to your phone.
            </p>
            {!showDisable ? (
              <button
                type="button"
                onClick={() => setShowDisable(true)}
                className="px-4 py-2.5 rounded-xl border border-[#e2e8ec] bg-[#f4f7f9] text-xs font-bold text-[#0b2f3d]"
              >
                Disable authenticator
              </button>
            ) : (
              <div className="rounded-2xl border border-[#e2e8ec] bg-[#f4f7f9] p-4 space-y-3">
                <p className="text-[12px] text-[#6b8190]">Confirm with your account password.</p>
                <input
                  type="password"
                  value={disablePw}
                  onChange={(e) => setDisablePw(e.target.value)}
                  placeholder="Password"
                  className={fieldCls}
                />
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={totpBusy}
                    onClick={disableTotp}
                    className="px-4 py-2.5 rounded-xl bg-rose-500 text-white text-xs font-bold disabled:opacity-60"
                  >
                    {totpBusy ? "Disabling…" : "Confirm disable"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowDisable(false);
                      setDisablePw("");
                    }}
                    className="px-4 py-2.5 rounded-xl border border-[#e2e8ec] bg-white text-xs font-bold text-[#6b8190]"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : !totpSetup ? (
          <button
            type="button"
            disabled={totpBusy}
            onClick={startTotpSetup}
            className="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider bg-[#0e3a4a] shadow-[0_4px_0_#082631] disabled:opacity-60"
          >
            {totpBusy ? "Generating QR…" : "Enable · generate QR"}
          </button>
        ) : (
          <div className="flex flex-col md:flex-row gap-4 items-start rounded-2xl border border-[#e2e8ec] bg-[#f4f7f9] p-4">
            <img
              src={totpSetup.qrDataUrl}
              alt="Authenticator QR code"
              className="w-[180px] h-[180px] rounded-xl bg-white border border-[#e2e8ec] shadow-sm shrink-0"
            />
            <div className="flex-1 min-w-0 space-y-3 w-full">
              <p className="text-[13px] text-[#6b8190]">
                1) Scan this QR · 2) Enter the 6-digit code from the app to confirm.
              </p>
              <div className="flex items-center gap-2 rounded-xl bg-white border border-[#e2e8ec] px-3 py-2">
                <code className="text-[11px] font-bold text-[#0b2f3d] break-all flex-1">{totpSetup.secret}</code>
                <button type="button" onClick={copySecret} className="p-1.5 rounded-lg hover:bg-[#f4f7f9] text-[#6b8190]" title="Copy">
                  <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
              <div>
                <label className="block text-xs font-bold text-[#0b2f3d] mb-1">Authenticator code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className={`${fieldCls} tracking-[0.35em] font-extrabold text-center text-base`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={totpBusy}
                  onClick={confirmTotp}
                  className="px-5 py-2.5 rounded-xl text-white font-extrabold text-xs uppercase tracking-wider bg-gradient-to-b from-[#ff8460] to-[#ff6a45] shadow-[0_4px_0_#e5502b] disabled:opacity-60"
                >
                  {totpBusy ? "Confirming…" : "Confirm & enable"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTotpSetup(null);
                    setTotpCode("");
                  }}
                  className="px-4 py-2.5 rounded-xl border border-[#e2e8ec] bg-white text-xs font-bold text-[#6b8190]"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
