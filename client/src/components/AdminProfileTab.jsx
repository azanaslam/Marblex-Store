import { useEffect, useState } from "react";
import { Avatar } from "@mui/material";
import PersonOutlineRoundedIcon from "@mui/icons-material/PersonOutlineRounded";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { authHeaders, http } from "../api/http";
import { getAuthUser, setAuthSession } from "../auth/session";
import { TiltCard3D } from "./admin3d/TiltCard3D";

export const AdminProfileTab = ({ token, showToast }) => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    avatarUrl: "",
    role: "admin",
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
  const [saving, setSaving] = useState(false);
  const [updatingPw, setUpdatingPw] = useState(false);

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
          industryType: u.industryType || "",
          city: u.city || "",
          ntn: u.ntn || "",
          strn: u.strn || "",
          gender: u.gender || "prefer_not_to_say",
        });
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
          }));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

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
      const updated = {
        ...(getAuthUser() || {}),
        ...res.data,
        id: res.data._id || res.data.id,
      };
      setAuthSession({ token, user: updated });
      setProfile((p) => ({
        ...p,
        name: updated.name || p.name,
        phone: updated.phone || "",
        company: updated.company || "",
        avatarUrl: updated.avatarUrl || "",
        email: updated.email || p.email,
      }));
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

  const initial = (profile.name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className="space-y-5 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-[#0a3d52] mb-1 font-heading">Admin Account Profile</h2>
        <p className="text-xs text-[#565e69]">
          Manage your controller identity and sign-in security for the MARBLEX admin workspace.
        </p>
      </div>

      <TiltCard3D maxTilt={2} scale={1} className="rounded-2xl bg-white border border-[#e0e6ed] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-[#0a3d52]/8 text-[#ff6b4a] flex items-center justify-center">
            <PersonOutlineRoundedIcon sx={{ fontSize: 20 }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0a3d52] font-heading">Profile details</h3>
            <p className="text-[11px] text-[#565e69]">Shown across the admin console</p>
          </div>
        </div>

        <div className="flex items-center gap-4 mb-5 p-3.5 rounded-xl bg-[#f5f7fa] border border-[#e0e6ed]/70">
          {profile.avatarUrl ? (
            <Avatar src={profile.avatarUrl} sx={{ width: 52, height: 52 }} />
          ) : (
            <Avatar sx={{ width: 52, height: 52, bgcolor: "#0a3d52", fontWeight: 800, color: "#ff6b4a" }}>
              {initial}
            </Avatar>
          )}
          <div className="min-w-0">
            <p className="text-sm font-bold text-[#0a3d52] truncate font-heading">{profile.name || "Admin"}</p>
            <p className="text-[11px] text-[#565e69] truncate">{profile.email}</p>
            <span className="inline-flex mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] border border-[#ff6b4a]/20">
              {profile.role === "admin" ? "Master Controller" : profile.role}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Email</label>
            <input
              type="email"
              value={profile.email}
              disabled
              className="w-full bg-[#eef2f6] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#565e69] text-xs cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Full name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              placeholder="Optional"
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Company / desk</label>
            <input
              type="text"
              value={profile.company}
              onChange={(e) => setProfile({ ...profile, company: e.target.value })}
              placeholder="e.g. MARBLEX HQ"
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Avatar URL</label>
            <input
              type="url"
              value={profile.avatarUrl}
              onChange={(e) => setProfile({ ...profile, avatarUrl: e.target.value })}
              placeholder="https://…"
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={saveProfile}
          disabled={saving}
          className="btn-3d-navy mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save profile"}
        </button>
      </TiltCard3D>

      <TiltCard3D maxTilt={2} scale={1} className="rounded-2xl bg-white border border-[#e0e6ed] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
            <LockOutlinedIcon sx={{ fontSize: 18 }} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#0a3d52] font-heading">Change password</h3>
            <p className="text-[11px] text-[#565e69]">Update the credential used for admin sign-in</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Current password</label>
            <input
              type="password"
              value={passwords.currentPassword}
              onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">New password</label>
            <input
              type="password"
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#0a3d52] mb-1 font-subheading">Confirm password</label>
            <input
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
              className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-3.5 py-2.5 text-[#0f1929] text-xs focus:bg-white focus:outline-none focus:border-[#ff6b4a]"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={changePassword}
          disabled={updatingPw}
          className="btn-3d-accent mt-5 w-full sm:w-auto px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider disabled:opacity-60"
        >
          {updatingPw ? "Updating…" : "Update password"}
        </button>
      </TiltCard3D>
    </div>
  );
};
