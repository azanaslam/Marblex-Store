import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { setAuthSession } from "../auth/session";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("signin"); // 'signin' | 'signup'
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null); // { message, type: 'success' | 'error' | 'warning' }

  // Form states for Sign In
  const [signInData, setSignInData] = useState({ email: "", password: "", rememberMe: false });

  // Form states for Sign Up
  const [signUpData, setSignUpData] = useState({
    fullName: "",
    workEmail: "",
    phone: "",
    company: "",
    industry: "waterproofing",
    city: "",
    password: "",
    confirmPassword: "",
    terms: true,
  });

  // Password strength score for Sign Up
  const [passwordStrength, setPasswordStrength] = useState(0);

  // Verification Code Stage State
  const [stageVerify, setStageVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRefs = useRef([]);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const calculatePasswordStrength = (val) => {
    if (!val) {
      setPasswordStrength(0);
      return;
    }
    let score = 0;
    if (val.length >= 6) score += 30;
    if (val.length >= 10) score += 30;
    if (/[A-Z]/.test(val)) score += 20;
    if (/[0-9]/.test(val)) score += 20;
    setPasswordStrength(score);
  };

  const showAlert = (message, type = "error") => {
    setAlert({ message, type });
  };

  const completeAuth = (authData) => {
    setAuthSession(authData);
    const chatUnread = Number(authData.chatUnread) || 0;
    if (authData.user.role === "admin") {
      navigate("/admin", { replace: true, state: { chatUnread } });
    } else {
      navigate("/dashboard", { replace: true, state: { chatUnread } });
    }
  };

  // 1. Handle Sign In Submit
  const handleSignInSubmit = async (e) => {
    e?.preventDefault();
    setAlert(null);
    setLoading(true);

    try {
      const res = await http.post("/auth/login", {
        email: signInData.email,
        password: signInData.password,
      });

      if (res.data?.requires2FA) {
        setVerifyEmail(res.data.email || signInData.email);
        setStageVerify(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCooldown(60);
        showAlert("A 6-digit verification code has been dispatched to your email.", "success");
      } else if (res.data?.token) {
        completeAuth(res.data);
      }
    } catch (error) {
      const data = error?.response?.data;
      const message = data?.message || "Login failed. Please check your credentials.";
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 2. Handle Sign Up Submit
  const handleSignUpSubmit = async (e) => {
    e?.preventDefault();
    setAlert(null);

    if (signUpData.password !== signUpData.confirmPassword) {
      showAlert("Validation Error: Passwords do not match. Please check again.", "error");
      return;
    }

    if (signUpData.password.length < 6) {
      showAlert("Validation Error: Password must be at least 6 characters.", "error");
      return;
    }

    setLoading(true);
    try {
      const res = await http.post("/auth/register", {
        name: signUpData.fullName,
        email: signUpData.workEmail,
        phone: signUpData.phone,
        company: signUpData.company,
        industryType: signUpData.industry,
        city: signUpData.city,
        password: signUpData.password,
      });

      if (res.data?.requires2FA) {
        setVerifyEmail(res.data.email || signUpData.workEmail);
        setStageVerify(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setResendCooldown(60);
        showAlert("Registration submitted! A verification code has been sent to your email.", "success");
      } else {
        showAlert("Account created! You can now sign in.", "success");
        setActiveTab("signin");
      }
    } catch (error) {
      const message = error?.response?.data?.message || "Registration failed. Please try again.";
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 3. Handle Verify Code Submit
  const handleVerifySubmit = async (e) => {
    e?.preventDefault();
    const code = otpDigits.join("").trim();
    if (code.length < 6) {
      showAlert("Please enter the complete 6-digit verification code.", "warning");
      return;
    }

    setLoading(true);
    try {
      const res = await http.post("/auth/verify-2fa", {
        email: verifyEmail,
        code,
      });
      completeAuth(res.data);
    } catch (error) {
      const message = error?.response?.data?.message || "Invalid or expired verification code.";
      showAlert(message, "error");
    } finally {
      setLoading(false);
    }
  };

  // 4. Handle Resend Code
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    try {
      const res = await http.post("/auth/resend-2fa", { email: verifyEmail });
      setResendCooldown(60);
      showAlert(res.data?.message || "A new verification code has been dispatched to your email.", "success");
    } catch (error) {
      showAlert("Failed to resend code. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP digit input changes
  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "");
    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split("");
      const newOtp = [...otpDigits];
      pasted.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpDigits(newOtp);
      const nextFocus = Math.min(pasted.length, 5);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const newOtp = [...otpDigits];
    newOtp[index] = cleanVal.slice(-1);
    setOtpDigits(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6eff3] via-[#f1f6f8] to-[#dfebf0] flex flex-col justify-center items-center p-4 sm:p-6 md:p-10 font-sans text-slate-800 antialiased selection:bg-[#f05a36] selection:text-white">
      
      {/* Main Container Card */}
      <main className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-[#0c313d]/25 border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px] my-auto">
        
        {/* LEFT PANEL (Brand & Information) */}
        <section className="lg:col-span-5 bg-gradient-to-br from-[#0f3c4b] via-[#0c313d] to-[#07222b] p-8 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden text-white">
          {/* Decorative Glows */}
          <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-[#f05a36]/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-10 -top-10 w-60 h-60 bg-[#185366]/40 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10">
            {/* Brand Logo Header */}
            <div className="flex items-center gap-3 mb-10">
              <div className="bg-white rounded-2xl w-14 h-14 flex items-center justify-center shadow-xl shadow-black/25 p-2 transition-transform hover:scale-105 duration-300 overflow-hidden">
                <img
                  src="/logo-icon-transparent.png"
                  alt="MARBLEX Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <span className="text-xs font-bold text-[#f05a36] tracking-widest uppercase block">Industrial Grade</span>
                <span className="text-sm font-semibold text-slate-300 tracking-wide">Chemical & Rubber</span>
              </div>
            </div>

            {/* Heading & Tagline */}
            <div className="mb-8">
              <span className="text-[#f05a36] text-xs font-extrabold uppercase tracking-widest block mb-2">
                Secure Client Portal
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Welcome to
              </h1>
              <h2 className="text-3xl sm:text-4xl font-black text-[#f05a36] tracking-wider mb-4">
                MARBLEX
              </h2>
              <p className="text-[#9cbac3] text-sm leading-relaxed max-w-sm">
                Access your client dashboard, manage orders, track shipments, and view industrial construction chemical quotations.
              </p>
            </div>

            {/* Security Features Badges */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs font-semibold text-[#b1ccd3]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#f05a36]/20 flex items-center justify-center text-[#f05a36]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <span>256-bit Encrypted</span>
              </div>

              <div className="h-4 w-px bg-white/10 hidden sm:block" />

              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span>Fast Approvals</span>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="relative z-10 pt-8 mt-8 border-t border-[#1d4d5c]/60 flex items-center justify-between text-xs text-[#638793]">
            <p>© 2026 MARBLEX Chemical & Rubber</p>
            <div className="flex gap-3">
              <span className="hover:text-white transition-colors cursor-pointer">Privacy</span>
              <span>•</span>
              <span className="hover:text-white transition-colors cursor-pointer">Terms</span>
            </div>
          </div>
        </section>

        {/* RIGHT PANEL (Interactive Authentication Forms) */}
        <section className="lg:col-span-7 p-8 sm:p-10 lg:p-12 flex flex-col justify-between bg-white relative">
          <div>
            
            {/* STAGE: VERIFY CODE */}
            {stageVerify ? (
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStageVerify(false);
                      setAlert(null);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-[#f05a36] uppercase tracking-wider">
                    Identity Verification
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c313d] mb-2">
                    Check Your Email
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600">
                    We have dispatched a 6-digit verification code to: <br />
                    <strong className="text-[#0c313d] font-bold">{verifyEmail}</strong>
                  </p>
                </div>

                {/* Alert Notification Box */}
                {alert && (
                  <div className={`p-4 rounded-2xl text-xs sm:text-sm font-medium border ${
                    alert.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : alert.type === "warning"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}>
                    {alert.message}
                  </div>
                )}

                <form onSubmit={handleVerifySubmit} className="space-y-6">
                  <div className="flex justify-between gap-2 sm:gap-3">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        autoFocus={index === 0}
                        className="w-11 h-13 sm:w-13 sm:h-15 text-center text-xl sm:text-2xl font-black rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 focus:border-[#f05a36] focus:bg-white outline-none transition-all shadow-sm"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    disabled={loading || otpDigits.join("").length < 6}
                    className="w-full py-4 px-6 bg-[#f05a36] hover:bg-[#d94826] active:scale-[0.99] text-white font-extrabold text-sm tracking-widest uppercase rounded-2xl shadow-lg shadow-[#f05a36]/30 transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    <span>{loading ? "VERIFYING..." : "VERIFY & CONTINUE"}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resendCooldown > 0 || loading}
                      className="font-bold text-[#0c313d] hover:text-[#f05a36] disabled:opacity-50 transition"
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend Code"}
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              /* STAGE: SIGN IN / SIGN UP TABS */
              <>
                {/* Portal Header & Tab Switcher */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0c313d]">
                    Client Portal
                  </h2>

                  {/* Tabs with Capsule Pill */}
                  <div className="relative flex p-1 bg-slate-100 rounded-2xl self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signin");
                        setAlert(null);
                      }}
                      className={`relative z-10 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === "signin"
                          ? "bg-white text-[#0c313d] shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab("signup");
                        setAlert(null);
                      }}
                      className={`relative z-10 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all duration-200 ${
                        activeTab === "signup"
                          ? "bg-white text-[#0c313d] shadow-sm"
                          : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      Create Account
                    </button>
                  </div>
                </div>

                {/* Alert Notification Box */}
                {alert && (
                  <div className={`mb-6 p-4 rounded-2xl text-xs sm:text-sm font-medium border transition-all duration-300 flex items-start gap-3 ${
                    alert.type === "success"
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : alert.type === "warning"
                      ? "bg-amber-50 text-amber-900 border-amber-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {alert.type === "success" ? (
                        <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )}
                    </div>
                    <div>{alert.message}</div>
                  </div>
                )}

                {/* ================= FORM 1: SIGN IN ================= */}
                {activeTab === "signin" && (
                  <form onSubmit={handleSignInSubmit} className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Email Address
                      </label>
                      <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                        <input
                          type="email"
                          required
                          placeholder="client@company.com"
                          value={signInData.email}
                          onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                          className="w-full px-4 py-3.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-2xl"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password
                        </label>
                        <a href="mailto:Marblexpak@gmail.com?subject=Password%20Assistance" className="text-xs text-[#f05a36] font-bold hover:underline">
                          Forgot Password?
                        </a>
                      </div>
                      <div className="relative flex items-center bg-slate-50 rounded-2xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                        <input
                          type={showSignInPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={signInData.password}
                          onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                          className="w-full px-4 py-3.5 bg-transparent text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-2xl pr-12"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSignInPassword(!showSignInPassword)}
                          className="absolute right-4 text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                          {showSignInPassword ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.858A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.592-4.591a3 3 0 10-4.243-4.243M3 3l18 18" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="flex items-center gap-2.5 text-xs text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={signInData.rememberMe}
                          onChange={(e) => setSignInData({ ...signInData, rememberMe: e.target.checked })}
                          className="w-4 h-4 rounded border-slate-300 text-[#f05a36] focus:ring-[#f05a36] focus:ring-offset-0"
                        />
                        <span className="font-medium">Remember this session</span>
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-[#f05a36] hover:bg-[#d94826] active:scale-[0.99] text-white font-extrabold text-sm tracking-widest uppercase rounded-2xl shadow-lg shadow-[#f05a36]/30 transition-all duration-200 flex items-center justify-center gap-3 mt-6 disabled:opacity-50"
                    >
                      <span>{loading ? "AUTHENTICATING..." : "SIGN IN"}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </form>
                )}

                {/* ================= FORM 2: CREATE ACCOUNT ================= */}
                {activeTab === "signup" && (
                  <form onSubmit={handleSignUpSubmit} className="space-y-4">
                    {/* Row 1: Full Name & Work Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Full Name *</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="text"
                            required
                            placeholder="e.g. Engr. Tariq Mehmood"
                            value={signUpData.fullName}
                            onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Email *</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="email"
                            required
                            placeholder="client@company.com"
                            value={signUpData.workEmail}
                            onChange={(e) => setSignUpData({ ...signUpData, workEmail: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 2: Phone & Company */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone / WhatsApp Number *</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="tel"
                            required
                            placeholder="0348-1116611"
                            value={signUpData.phone}
                            onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Company / Organization</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="text"
                            placeholder="e.g. Habib Construction Ltd."
                            value={signUpData.company}
                            onChange={(e) => setSignUpData({ ...signUpData, company: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 3: Industry & Location */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Industry / Sector</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <select
                            value={signUpData.industry}
                            onChange={(e) => setSignUpData({ ...signUpData, industry: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 focus:outline-none rounded-xl appearance-none cursor-pointer"
                          >
                            <option value="waterproofing">Waterproofing & Coating Contractors</option>
                            <option value="flooring">Industrial Flooring Contractors</option>
                            <option value="admixtures">Concrete Admixtures & Mortars</option>
                            <option value="grouting">Structural Repair & Grouting</option>
                            <option value="sealants">Tile Adhesives & Joint Sealants</option>
                            <option value="other">Other Industrial Construction Sector</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">City / Location</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="text"
                            placeholder="e.g. Lahore, Karachi, Islamabad"
                            value={signUpData.city}
                            onChange={(e) => setSignUpData({ ...signUpData, city: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Row 4: Create & Confirm Password */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Create Password *</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type={showSignUpPassword ? "text" : "password"}
                            required
                            placeholder="••••••••"
                            value={signUpData.password}
                            onChange={(e) => {
                              setSignUpData({ ...signUpData, password: e.target.value });
                              calculatePasswordStrength(e.target.value);
                            }}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                            className="absolute right-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                          >
                            {showSignUpPassword ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.858A9.954 9.954 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-4.592-4.591a3 3 0 10-4.243-4.243M3 3l18 18" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>
                        </div>
                        {/* Strength Indicator */}
                        <div className="h-1 w-full bg-slate-100 rounded-full mt-1.5 overflow-hidden flex">
                          <div
                            className={`h-full transition-all duration-300 ${
                              passwordStrength === 0
                                ? "w-0 bg-slate-300"
                                : passwordStrength < 40
                                ? "bg-rose-500"
                                : passwordStrength < 80
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${passwordStrength}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm Password *</label>
                        <div className="relative flex items-center bg-slate-50/80 rounded-xl border border-slate-200 focus-within:border-[#f05a36] focus-within:ring-4 focus-within:ring-[#f05a36]/10 transition-all">
                          <input
                            type="password"
                            required
                            placeholder="Re-enter password"
                            value={signUpData.confirmPassword}
                            onChange={(e) => setSignUpData({ ...signUpData, confirmPassword: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-transparent text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none rounded-xl"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Terms agreement */}
                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        checked={signUpData.terms}
                        onChange={(e) => setSignUpData({ ...signUpData, terms: e.target.checked })}
                        className="mt-0.5 w-4 h-4 rounded border-slate-300 text-[#f05a36] focus:ring-[#f05a36]"
                      />
                      <label htmlFor="terms" className="text-xs text-slate-500 leading-tight cursor-pointer">
                        I agree to MARBLEX Terms of Service and Privacy Policy.
                      </label>
                    </div>

                    {/* Submit Registration Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-6 bg-[#f05a36] hover:bg-[#d94826] active:scale-[0.99] text-white font-extrabold text-sm tracking-widest uppercase rounded-2xl shadow-lg shadow-[#f05a36]/30 transition-all duration-200 flex items-center justify-center gap-3 mt-4 disabled:opacity-50"
                    >
                      <span>{loading ? "SUBMITTING..." : "CREATE ACCOUNT"}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>

                    {/* Disclaimer Note */}
                    <p className="text-center text-xs text-slate-400 mt-3 font-medium">
                      After sign-up, an admin must approve your account before you can log in.
                    </p>
                  </form>
                )}
              </>
            )}

          </div>

          {/* Quick Contact Info Footer */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Need assistance? Contact portal admin</span>
            <a href="mailto:Marblexpak@gmail.com" className="text-[#0c313d] font-bold hover:underline">
              Marblexpak@gmail.com
            </a>
          </div>
        </section>
      </main>
    </div>
  );
};
