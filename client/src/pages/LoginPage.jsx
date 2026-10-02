import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { http } from "../api/http";
import { setAuthSession } from "../auth/session";

export const LoginPage = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState("in"); // 'in' (Sign In) | 'reg' (Sign Up)
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: "", type: "" }); // 'error' | 'success'
  const [isShaking, setIsShaking] = useState(false);

  // Social SSO Modal state & account options
  const [ssoModal, setSsoModal] = useState(null); // { provider: 'google' | 'microsoft' | 'linkedin' } | null
  const [customSsoEmail, setCustomSsoEmail] = useState("");
  const [ssoLoading, setSsoLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  // Forgot password flow (View 3 with 4 panels/steps)
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(0); // 0: Email, 1: Verify OTP, 2: New Password, 3: Success
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtpDigits, setForgotOtpDigits] = useState(["", "", "", "", "", ""]);
  const [forgotNewPassword, setForgotNewPassword] = useState("");
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState("");
  const [forgotShowNewPw, setForgotShowNewPw] = useState(false);
  const [forgotShowConfirmPw, setForgotShowConfirmPw] = useState(false);
  const [forgotResendCooldown, setForgotResendCooldown] = useState(30);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState({ text: "", type: "" });
  const [forgotShake, setForgotShake] = useState(false);
  const forgotTimerRef = useRef(null);
  const forgotInputRefs = useRef([]);

  // 2FA Verification Stage States
  const [stageVerify, setStageVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [isOtpSuccess, setIsOtpSuccess] = useState(false);
  const [vMsg, setVMsg] = useState({ text: "", type: "" });
  const [isVShaking, setIsVShaking] = useState(false);

  // 2FA Countdown Timers (120s expiry, 30s resend cooldown)
  const [expTime, setExpTime] = useState(120);
  const [resendCooldown, setResendCooldown] = useState(30);
  const timerRef = useRef(null);
  const inputRefs = useRef([]);
  const cardsContainerRef = useRef(null);
  const userTouchedCarouselRef = useRef(false);
  const userTouchTimeoutRef = useRef(null);

  const handleCarouselTouch = () => {
    userTouchedCarouselRef.current = true;
    if (userTouchTimeoutRef.current) clearTimeout(userTouchTimeoutRef.current);
    userTouchTimeoutRef.current = setTimeout(() => {
      userTouchedCarouselRef.current = false;
    }, 4500);
  };

  // Mobile auto-slide timer: slides smoothly card by card every 3.2s
  useEffect(() => {
    const interval = setInterval(() => {
      if (userTouchedCarouselRef.current) return;
      if (window.innerWidth <= 900 && cardsContainerRef.current) {
        const container = cardsContainerRef.current;
        const cardNodes = container.querySelectorAll(".mx-fc");
        if (!cardNodes.length) return;

        const scrollLeft = container.scrollLeft;
        const cardWidth = (cardNodes[0].offsetWidth || 250) + 16;
        const maxScroll = container.scrollWidth - container.offsetWidth;

        if (scrollLeft >= maxScroll - 15) {
          container.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          container.scrollBy({ left: cardWidth, behavior: "smooth" });
        }
      }
    }, 3200);

    return () => {
      clearInterval(interval);
      if (userTouchTimeoutRef.current) clearTimeout(userTouchTimeoutRef.current);
    };
  }, []);

  // Parallax Refs
  const stageRef = useRef(null);
  const shellRef = useRef(null);
  const showRef = useRef(null);
  const formRef = useRef(null);

  // Load saved email on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("mx_email");
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
    } catch (e) { }
  }, []);

  // 2FA Timer Tick
  useEffect(() => {
    if (stageVerify) {
      setExpTime(120);
      setResendCooldown(30);
      if (timerRef.current) clearInterval(timerRef.current);

      timerRef.current = setInterval(() => {
        setExpTime((prevExp) => {
          if (prevExp <= 1) {
            clearInterval(timerRef.current);
            setVMsg({ text: "Code expired. Please request a new one.", type: "error" });
            return 0;
          }
          return prevExp - 1;
        });

        setResendCooldown((prevRs) => (prevRs > 0 ? prevRs - 1 : 0));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stageVerify]);

  // Format MM:SS for 2FA timer
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Masked email generator (e.g. az•••@gmail.com)
  const getMaskedEmail = (rawEmail) => {
    if (!rawEmail || !rawEmail.includes("@")) return rawEmail || "";
    const [u, d] = rawEmail.split("@");
    return `${u.slice(0, 2)}•••@${d}`;
  };

  // 3D Parallax Mouse Tracking
  const handleMouseMove = (e) => {
    if (!shellRef.current || !showRef.current || window.innerWidth < 900) return;
    const r = shellRef.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    shellRef.current.style.transform = `rotateY(${x * 5}deg) rotateX(${-y * 4}deg)`;
    showRef.current.style.setProperty("--px", x);
    showRef.current.style.setProperty("--py", y);
  };

  const handleMouseLeave = () => {
    if (!shellRef.current || !showRef.current) return;
    shellRef.current.style.transform = "";
    showRef.current.style.setProperty("--px", 0);
    showRef.current.style.setProperty("--py", 0);
  };

  const triggerShake = (errorMessage) => {
    setMsg({ text: errorMessage, type: "error" });
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  const triggerVShake = (errorMessage) => {
    setVMsg({ text: errorMessage, type: "error" });
    setIsVShaking(true);
    setTimeout(() => setIsVShaking(false), 500);
  };

  const completeAuth = (authData) => {
    setAuthSession(authData);
    const chatUnread = Number(authData.chatUnread) || 0;
    if (authData.user.role === "admin") {
      navigate("/admin", { replace: true, state: { chatUnread } });
    } else if (chatUnread > 0) {
      navigate("/dashboard/support", { replace: true, state: { chatUnread } });
    } else {
      navigate("/dashboard", { replace: true });
    }
  };

  // Switch tabs
  const handleTabChange = (newMode) => {
    setMode(newMode);
    setMsg({ text: "", type: "" });
  };

  // Password validation rules & strength helper
  const pwRules = {
    len: (v) => Boolean(v && String(v).length >= 8),
    case: (v) => Boolean(v && /[a-z]/.test(String(v)) && /[A-Z]/.test(String(v))),
    num: (v) => Boolean(v && /\d/.test(String(v))),
    sym: (v) => Boolean(v && /[^A-Za-z0-9]/.test(String(v))),
  };

  const getPwStrength = (v) => {
    if (!v) return { count: 0, label: "Strength", color: "" };
    const str = String(v);
    let count = 0;
    if (pwRules.len(str)) count++;
    if (pwRules.case(str)) count++;
    if (pwRules.num(str)) count++;
    if (pwRules.sym(str)) count++;
    const colors = ["#ef4444", "#f59e0b", "#eab308", "#16a672"];
    const labels = ["Weak", "Fair", "Good", "Strong"];
    const idx = Math.max(0, Math.min(count - 1, 3));
    const label = str.length < 8 && count < 4 ? "Weak" : (labels[idx] || "Weak");
    const color = colors[idx] || "#ef4444";
    return { count, label, color };
  };

  const forgotStrength = getPwStrength(forgotNewPassword);
  const isForgotMatch = Boolean(forgotNewPassword && forgotConfirmPassword && forgotNewPassword === forgotConfirmPassword);
  const isForgotMismatch = Boolean(forgotConfirmPassword && forgotNewPassword !== forgotConfirmPassword);

  const triggerForgotShake = (text) => {
    setForgotMsg({ text, type: "error" });
    setForgotShake(true);
    setTimeout(() => setForgotShake(false), 450);
  };

  const startForgotTimer = () => {
    setForgotResendCooldown(30);
    if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
    forgotTimerRef.current = setInterval(() => {
      setForgotResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(forgotTimerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const closeForgot = () => {
    if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
    setForgotOpen(false);
    setForgotStep(0);
    setForgotMsg({ text: "", type: "" });
  };

  // Step 1: Send Reset Code
  const handleForgotSendCode = async () => {
    const em = forgotEmail.trim();
    if (!/^\S+@\S+\.\S+$/.test(em)) {
      return triggerForgotShake("Please enter a valid email address.");
    }
    setForgotLoading(true);
    setForgotMsg({ text: "", type: "" });
    try {
      await http.post("/auth/forgot-password", { email: em });
      setForgotOtpDigits(["", "", "", "", "", ""]);
      setForgotStep(1);
      startForgotTimer();
      setTimeout(() => forgotInputRefs.current[0]?.focus(), 150);
    } catch (err) {
      triggerForgotShake(err.response?.data?.message || "Could not send reset code. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 2: OTP Handlers
  const handleForgotOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...forgotOtpDigits];
    newOtp[index] = cleanVal;
    setForgotOtpDigits(newOtp);

    if (cleanVal && index < 5) {
      forgotInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.join("").length === 6) {
      setTimeout(() => {
        handleForgotVerifyCode(newOtp.join(""));
      }, 250);
    }
  };

  const handleForgotOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !forgotOtpDigits[index] && index > 0) {
      forgotInputRefs.current[index - 1]?.focus();
      const newOtp = [...forgotOtpDigits];
      newOtp[index - 1] = "";
      setForgotOtpDigits(newOtp);
    }
    if (e.key === "ArrowLeft" && index > 0) forgotInputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) forgotInputRefs.current[index + 1]?.focus();
    if (e.key === "Enter") handleForgotVerifyCode();
  };

  const handleForgotOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...forgotOtpDigits];
    text.split("").forEach((c, k) => {
      if (k < 6) newOtp[k] = c;
    });
    setForgotOtpDigits(newOtp);
    const nextIdx = Math.min(text.length, 5);
    forgotInputRefs.current[nextIdx]?.focus();
    if (text.length === 6) {
      setTimeout(() => {
        handleForgotVerifyCode(text);
      }, 250);
    }
  };

  const handleForgotResend = async () => {
    if (forgotResendCooldown > 0 || forgotLoading) return;
    setForgotLoading(true);
    try {
      await http.post("/auth/forgot-password", { email: forgotEmail.trim() });
      startForgotTimer();
      setForgotOtpDigits(["", "", "", "", "", ""]);
      forgotInputRefs.current[0]?.focus();
      setForgotMsg({ text: "A new code has been sent.", type: "success" });
    } catch (err) {
      triggerForgotShake("Failed to resend code.");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleForgotVerifyCode = async (directCode) => {
    const code = String(directCode || forgotOtpDigits.join("")).trim();
    if (code.length < 6) {
      return triggerForgotShake("Please enter the full 6-digit code.");
    }
    setForgotLoading(true);
    setForgotMsg({ text: "", type: "" });
    try {
      await http.post("/auth/verify-reset-code", {
        email: forgotEmail.trim(),
        code,
      });
      if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
      setForgotStep(2);
    } catch (err) {
      triggerForgotShake(err.response?.data?.message || "Invalid or expired reset code.");
    } finally {
      setForgotLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleForgotResetPassword = async () => {
    const pass = forgotNewPassword;
    const confirm = forgotConfirmPassword;
    const code = forgotOtpDigits.join("").trim();

    if (!pwRules.len(pass) || !pwRules.case(pass) || !pwRules.num(pass) || !pwRules.sym(pass)) {
      return triggerForgotShake("Please meet all password requirements.");
    }
    if (pass !== confirm) {
      return triggerForgotShake("Passwords don't match.");
    }

    setForgotLoading(true);
    setForgotMsg({ text: "", type: "" });
    try {
      await http.post("/auth/reset-password", {
        email: forgotEmail.trim(),
        code,
        newPassword: pass,
      });
      setForgotStep(3);
    } catch (err) {
      const errMsg = err.response?.data?.message || "Password reset failed. Please check the code.";
      const isCodeIssue = /code|expired|reset request/i.test(errMsg);
      if (isCodeIssue) {
        setForgotStep(1);
        setForgotOtpDigits(["", "", "", "", "", ""]);
        startForgotTimer();
      }
      triggerForgotShake(errMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  // Available SSO Accounts (Matching user Chrome profiles from screenshot)
  const ssoAccounts = {
    google: [
      { name: "Azan Aslam", email: "azanaslam907@gmail.com", avatar: "A", color: "#ea4335" },
      { name: "Ismail", email: "ismail.marblex@gmail.com", avatar: "I", color: "#0f7c8f" },
      { name: "Zelios", email: "zelios.marblex@gmail.com", avatar: "Z", color: "#f15b37" },
    ],
    microsoft: [
      { name: "Azan Aslam", email: "azanaslam907@gmail.com", avatar: "A", color: "#00a4ef" },
      { name: "Admin Portal", email: "admin@marblex.onmicrosoft.com", avatar: "M", color: "#7fba00" },
    ],
    linkedin: [
      { name: "Azan Aslam", email: "azanaslam907@gmail.com", avatar: "in", color: "#0a66c2" },
      { name: "Marblex Enterprise", email: "business@marblex.com", avatar: "M", color: "#0a66c2" },
    ],
  };

  // Trigger Account Chooser Modal
  const handleSocialAuth = (provider) => {
    setCustomSsoEmail("");
    setSsoLoading(false);
    setSsoModal({ provider, isCustom: false });
  };

  // Select Account & Dispatch 2FA
  const handleSelectSsoAccount = async (account) => {
    const selectedEmail = (account?.email || customSsoEmail).trim();
    if (!selectedEmail || !/^\S+@\S+\.\S+$/.test(selectedEmail)) {
      return triggerShake("Please enter a valid email address.");
    }

    setSsoLoading(true);
    const provider = ssoModal?.provider || "google";
    const displayName = account?.name || selectedEmail.split("@")[0];

    try {
      const res = await http.post("/auth/sso-init", {
        email: selectedEmail,
        name: displayName,
        provider,
      });

      setTimeout(() => {
        setSsoModal(null);
        setSsoLoading(false);
        setVerifyEmail(res.data?.email || selectedEmail);
        setStageVerify(true);
        setOtpDigits(["", "", "", "", "", ""]);
        setIsOtpSuccess(false);
        setVMsg({
          text: res.data?.message || `A 6-digit verification code has been sent to ${selectedEmail}.`,
          type: "success",
        });
      }, 700);
    } catch (err) {
      setSsoLoading(false);
      triggerShake(`${provider.toUpperCase()} verification dispatch failed. Please try again.`);
    }
  };

  // Submit Handler (Sign In / Sign Up)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ text: "", type: "" });

    const trimmedEmail = email.trim();
    if (mode === "reg" && (!fullName.trim() || !company.trim())) {
      return triggerShake("Please enter your name and company.");
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return triggerShake("Please enter a valid email address.");
    }
    if (password.length < 6) {
      return triggerShake("Password must be at least 6 characters.");
    }

    try {
      if (rememberMe) {
        localStorage.setItem("mx_email", trimmedEmail);
      } else {
        localStorage.removeItem("mx_email");
      }
    } catch (err) { }

    setLoading(true);

    if (mode === "in") {
      try {
        const res = await http.post("/auth/login", { email: trimmedEmail, password });
        if (res.data?.requires2FA) {
          setVerifyEmail(res.data.email || trimmedEmail);
          setStageVerify(true);
          setOtpDigits(["", "", "", "", "", ""]);
          setIsOtpSuccess(false);
          setVMsg({ text: "", type: "" });
        } else if (res.data?.token) {
          setMsg({ text: "Credentials verified! Redirecting to dashboard…", type: "success" });
          setTimeout(() => completeAuth(res.data), 800);
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Login failed. Please check your credentials.";
        triggerShake(errorMsg);
      } finally {
        setLoading(false);
      }
    } else {
      try {
        const res = await http.post("/auth/register", {
          name: fullName.trim(),
          email: trimmedEmail,
          company: company.trim(),
          password,
        });

        if (res.data?.requires2FA) {
          setVerifyEmail(res.data.email || trimmedEmail);
          setStageVerify(true);
          setOtpDigits(["", "", "", "", "", ""]);
          setIsOtpSuccess(false);
          setVMsg({ text: "", type: "" });
        } else {
          setMsg({ text: "Account created successfully! You can now sign in.", type: "success" });
          setMode("in");
        }
      } catch (error) {
        const errorMsg = error?.response?.data?.message || "Registration failed. Please try again.";
        triggerShake(errorMsg);
      } finally {
        setLoading(false);
      }
    }
  };

  // 2FA OTP Verify Submit (accepts optional directCode to avoid stale state on auto-submit)
  const handleVerifySubmit = async (eOrCode) => {
    const directCode = typeof eOrCode === "string" ? eOrCode : null;
    if (eOrCode?.preventDefault) eOrCode.preventDefault();
    if (loading || isOtpSuccess) return;

    const code = String(directCode || otpDigits.join("")).trim();
    if (expTime <= 0) {
      return triggerVShake("Code expired. Please request a new one.");
    }
    if (code.length < 6) {
      return triggerVShake("Please enter the full 6-digit code.");
    }

    setLoading(true);
    setVMsg({ text: "", type: "" });

    try {
      const res = await http.post("/auth/verify-2fa", { email: verifyEmail, code });
      setIsOtpSuccess(true);
      setVMsg({ text: "Verified! Redirecting to your dashboard…", type: "success" });
      setTimeout(() => completeAuth(res.data), 1000);
    } catch (error) {
      const errorMsg = error?.response?.data?.message || "Invalid or expired verification code.";
      triggerVShake(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Resend 2FA
  const handleResend = async () => {
    if (resendCooldown > 0 || loading) return;
    setLoading(true);
    try {
      const res = await http.post("/auth/resend-2fa", { email: verifyEmail });
      setExpTime(120);
      setResendCooldown(30);
      setOtpDigits(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
      setVMsg({ text: res.data?.message || "A new code has been sent.", type: "success" });
    } catch (error) {
      triggerVShake("Failed to resend code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    const cleanVal = value.replace(/\D/g, "").slice(-1);
    const newOtp = [...otpDigits];
    newOtp[index] = cleanVal;
    setOtpDigits(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto submit on 6 digits — pass code directly to avoid stale React state
    const fullCode = newOtp.join("");
    if (fullCode.length === 6) {
      setTimeout(() => {
        handleVerifySubmit(fullCode);
      }, 250);
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otpDigits];
      newOtp[index - 1] = "";
      setOtpDigits(newOtp);
    }
    if (e.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
    if (e.key === "Enter") handleVerifySubmit();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData.getData("text") || "").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otpDigits];
    text.split("").forEach((c, k) => {
      if (k < 6) newOtp[k] = c;
    });
    setOtpDigits(newOtp);
    const nextIdx = Math.min(text.length, 5);
    inputRefs.current[nextIdx]?.focus();
    if (text.length === 6) {
      setTimeout(() => {
        handleVerifySubmit(text);
      }, 250);
    }
  };

  // Button Ripple
  const handleButtonClick = (e) => {
    const btn = e.currentTarget;
    const r = btn.getBoundingClientRect();
    const d = document.createElement("i");
    const s = Math.max(r.width, r.height) / 3;
    d.className = "rip";
    d.style.cssText = `width:${s}px;height:${s}px;left:${e.clientX - r.left - s / 2}px;top:${e.clientY - r.top - s / 2}px`;
    btn.appendChild(d);
    setTimeout(() => d.remove(), 600);
  };

  return (
    <div className="mx-login-scope flex items-center justify-center min-h-[calc(100vh-80px)] py-8 px-4 sm:px-6">
      <style>{`
        .mx-login-scope {
          --bg1: #eef3f7;
          --bg2: #dbe6ee;
          --card: #ffffff;
          --ink: #0b2e3a;
          --mut: #6a7d89;
          --field: #f4f7fa;
          --line: #e1e8ee;
          --tab: #f1f5f8;
          --or: #f15b37;
          --or2: #ff7a4d;
          --d1: #0d4150;
          --d2: #061f28;
          font-family: 'Inter', system-ui, sans-serif;
        }

        :root.dark .mx-login-scope,
        :root[data-theme="dark"] .mx-login-scope,
        .dark .mx-login-scope {
          --bg1: #061a22;
          --bg2: #0a2530;
          --card: #0f2a35;
          --ink: #eaf3f7;
          --mut: #8fa6b3;
          --field: #153441;
          --line: #1f4352;
          --tab: #143240;
        }

        .mx-stage {
          perspective: 1800px;
          width: 100%;
          max-width: 1060px;
        }

        .mx-shell {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: 640px;
          border-radius: 26px;
          background: var(--card);
          box-shadow: 0 40px 80px -24px rgba(7,34,44,.4), 0 6px 20px rgba(7,34,44,.1);
          transition: transform .3s ease-out, background-color .3s;
          animation: mx-enter .9s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes mx-enter {
          from { opacity: 0; transform: translateY(34px) rotateX(10deg) scale(.97); }
        }

        .mx-form-side {
          padding: 44px 52px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          position: relative;
        }

        .mx-vw {
          display: flex;
          flex-direction: column;
          justify-content: center;
          flex: 1;
          transition: opacity .4s, transform .5s cubic-bezier(.2,.8,.2,1);
        }

        .mx-vw.out {
          opacity: 0;
          transform: translateX(-30px) scale(.98);
          pointer-events: none;
        }

        .mx-vw-v2 {
          display: flex;
          animation: mx-vin .7s cubic-bezier(.2,.8,.2,1) both;
        }

        @keyframes mx-vin {
          from { opacity: 0; transform: translateX(34px) rotateY(-10deg); }
        }

        .mx-head {
          text-align: center;
        }

        .mx-head h1 {
          font-family: 'Space Grotesk', Inter, sans-serif;
          font-size: 28px;
          font-weight: 700;
          color: var(--ink);
        }

        .mx-head p {
          margin-top: 8px;
          font-size: 13.5px;
          color: var(--mut);
          line-height: 1.6;
        }

        .mx-tabs {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          background: var(--tab);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 4px;
          margin: 24px 0 22px;
        }

        .mx-tabs button {
          position: relative;
          z-index: 1;
          border: 0;
          background: none;
          font: 600 14px Inter, sans-serif;
          color: var(--mut);
          padding: 11px;
          cursor: pointer;
          transition: color .3s;
        }

        .mx-tabs button.on {
          color: var(--ink);
        }

        .mx-pill {
          position: absolute;
          top: 4px;
          bottom: 4px;
          left: 4px;
          width: calc(50% - 4px);
          background: var(--card);
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(7,34,44,.12);
          transition: transform .45s cubic-bezier(.3,1.35,.5,1);
        }

        .mx-tabs.reg .mx-pill {
          transform: translateX(100%);
        }

        .mx-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mx-lbl {
          display: flex;
          justify-content: space-between;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--ink);
          margin-bottom: 7px;
        }

        .mx-lbl i {
          color: var(--or);
          font-style: normal;
          margin-left: 3px;
        }

        .mx-lbl a {
          color: var(--or);
          text-decoration: none;
          font-size: 12px;
        }
        .mx-lbl a:hover {
          text-decoration: underline;
        }

        /* Input Container with Fixed Icon Layer */
        .mx-in {
          position: relative;
          display: flex;
          align-items: center;
        }

        .mx-in > svg {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--mut);
          transition: color .3s;
          pointer-events: none;
          z-index: 5;
        }

        .mx-in input {
          width: 100%;
          height: 48px;
          border-radius: 13px;
          border: 1.5px solid var(--line);
          background: var(--field);
          padding: 0 44px 0 42px;
          font: 500 14px Inter, sans-serif;
          color: var(--ink);
          outline: 0;
          position: relative;
          z-index: 1;
          transition: all .3s;
        }

        .mx-in input::placeholder {
          color: #9aabb6;
        }

        .mx-in input:focus {
          border-color: var(--or);
          background: var(--card);
          box-shadow: 0 0 0 4px rgba(241,91,55,.14), 0 10px 22px -10px rgba(241,91,55,.4);
          transform: translateY(-1px);
        }

        .mx-in:focus-within > svg {
          color: var(--or);
        }

        .mx-eye {
          position: absolute;
          right: 6px;
          top: 50%;
          transform: translateY(-50%);
          width: 36px;
          height: 36px;
          border: 0;
          background: none;
          color: var(--mut);
          cursor: pointer;
          border-radius: 10px;
          display: grid;
          place-items: center;
          z-index: 5;
        }
        .mx-eye:hover {
          color: var(--or);
        }

        /* In-Place Animated Expandable Registration Fields */
        .mx-extra {
          display: grid;
          grid-template-rows: 0fr;
          opacity: 0;
          transition: grid-template-rows .5s ease, opacity .4s;
        }

        .mx-extra > div {
          overflow: hidden;
          margin: 0 -4px;
          padding: 0 4px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .mx-form.reg .mx-extra {
          grid-template-rows: 1fr;
          opacity: 1;
        }

        .mx-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mx-chk {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 12.5px;
          font-weight: 500;
          color: var(--mut);
          cursor: pointer;
          margin: 0;
        }

        .mx-chk input {
          appearance: none;
          width: 17px;
          height: 17px;
          border: 1.5px solid var(--mut);
          border-radius: 5px;
          display: grid;
          place-items: center;
          cursor: pointer;
          transition: .25s;
        }

        .mx-chk input:checked {
          background: var(--or);
          border-color: var(--or);
        }

        .mx-chk input:checked:after {
          content: "";
          width: 4px;
          height: 8px;
          border: solid #fff;
          border-width: 0 2px 2px 0;
          transform: rotate(45deg) translate(-1px, -1px);
        }

        .mx-btn {
          position: relative;
          overflow: hidden;
          height: 50px;
          border: 0;
          border-radius: 13px;
          background: linear-gradient(135deg, var(--or), var(--or2));
          color: #fff;
          font: 600 14.5px Inter, sans-serif;
          cursor: pointer;
          box-shadow: 0 12px 24px -8px rgba(241,91,55,.6), 0 3px 0 #c9441f;
          transition: transform .15s, box-shadow .15s, background .3s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .mx-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 30px -8px rgba(241,91,55,.7), 0 5px 0 #c9441f;
        }

        .mx-btn:active {
          transform: translateY(2px);
          box-shadow: 0 5px 10px -4px rgba(241,91,55,.6), 0 1px 0 #c9441f;
        }

        .mx-btn.ok {
          background: linear-gradient(135deg, #16a672, #2dd4a0);
          box-shadow: 0 12px 24px -8px rgba(22,166,114,.6), 0 3px 0 #0e7d56;
        }

        .mx-btn:before {
          content: "";
          position: absolute;
          top: 0;
          left: -60%;
          width: 40%;
          height: 100%;
          background: linear-gradient(100deg, transparent, rgba(255,255,255,.4), transparent);
          transform: skewX(-20deg);
          animation: mx-shine 3.4s ease-in-out infinite;
        }

        @keyframes mx-shine {
          60%, 100% { left: 130%; }
        }

        .mx-btn svg {
          transition: transform .3s;
        }
        .mx-btn:hover svg {
          transform: translateX(4px);
        }

        .rip {
          position: absolute;
          border-radius: 50%;
          background: rgba(255,255,255,.5);
          transform: scale(0);
          animation: mx-rp .6s ease-out;
          pointer-events: none;
        }
        @keyframes mx-rp {
          to { transform: scale(4); opacity: 0; }
        }

        .mx-spin {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: mx-sp .7s linear infinite;
        }
        @keyframes mx-sp {
          to { transform: rotate(360deg); }
        }

        .mx-msg {
          min-height: 16px;
          font-size: 12.5px;
          font-weight: 600;
          text-align: center;
        }

        .mx-or {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--mut);
          font-size: 12px;
          margin: 2px 0;
        }
        .mx-or:before, .mx-or:after {
          content: "";
          flex: 1;
          height: 1px;
          background: var(--line);
        }

        .mx-soc {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
        }

        .mx-soc button {
          height: 44px;
          border: 1.5px solid var(--line);
          background: var(--card);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font: 600 12.5px Inter, sans-serif;
          color: var(--ink);
          cursor: pointer;
          transition: all .25s;
        }

        .mx-soc button:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 18px -10px rgba(7,34,44,.4);
          border-color: var(--or);
        }

        .mx-legal {
          margin-top: 18px;
          text-align: center;
          font-size: 11.5px;
          color: var(--mut);
        }

        .mx-shake {
          animation: mx-shake-anim .45s;
        }
        @keyframes mx-shake-anim {
          20%, 60% { transform: translateX(-7px); }
          40%, 80% { transform: translateX(7px); }
        }

        /* ================= 2FA VERIFICATION STYLES ================= */
        .mx-shield {
          position: relative;
          width: 84px;
          height: 84px;
          margin: 0 auto 20px;
          border-radius: 24px;
          background: linear-gradient(135deg, var(--or), var(--or2));
          display: grid;
          place-items: center;
          box-shadow: 0 16px 30px -8px rgba(241,91,55,.55);
          animation: mx-float2 4s ease-in-out infinite;
        }

        .mx-shield:before, .mx-shield:after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 24px;
          border: 2px solid var(--or);
          animation: mx-ring 2.4s ease-out infinite;
        }
        .mx-shield:after { animation-delay: 1.2s; }

        @keyframes mx-ring {
          to { transform: scale(1.7); opacity: 0; }
        }
        @keyframes mx-float2 {
          50% { transform: translateY(-6px); }
        }

        .mx-ck {
          stroke-dasharray: 12;
          stroke-dashoffset: 12;
          animation: mx-ckd .8s .5s ease-out forwards;
        }
        @keyframes mx-ckd {
          to { stroke-dashoffset: 0; }
        }

        .mx-otp {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin: 26px 0 16px;
        }

        .mx-otp input {
          width: 52px;
          height: 60px;
          border-radius: 14px;
          border: 1.5px solid var(--line);
          background: var(--field);
          text-align: center;
          font: 700 24px 'Space Grotesk', Inter, sans-serif;
          color: var(--ink);
          outline: 0;
          transition: all .25s;
          caret-color: var(--or);
        }

        .mx-otp input:focus {
          border-color: var(--or);
          background: var(--card);
          box-shadow: 0 0 0 4px rgba(241,91,55,.14), 0 12px 22px -10px rgba(241,91,55,.45);
          transform: translateY(-3px) scale(1.05);
        }

        .mx-otp input.f {
          border-color: var(--or);
          background: var(--card);
        }

        .mx-otp.okk input {
          border-color: #16a672;
          background: rgba(22,166,114,.1);
          color: #16a672;
          animation: mx-pop .5s both;
        }
        .mx-otp.okk input:nth-child(2) { animation-delay: .05s; }
        .mx-otp.okk input:nth-child(3) { animation-delay: .1s; }
        .mx-otp.okk input:nth-child(4) { animation-delay: .15s; }
        .mx-otp.okk input:nth-child(5) { animation-delay: .2s; }
        .mx-otp.okk input:nth-child(6) { animation-delay: .25s; }

        @keyframes mx-pop {
          50% { transform: translateY(-8px) scale(1.1); }
        }

        .mx-tb {
          height: 4px;
          border-radius: 4px;
          background: var(--line);
          overflow: hidden;
        }
        .mx-tb i {
          display: block;
          height: 100%;
          background: linear-gradient(90deg, var(--or), var(--or2));
          transition: width 1s linear;
        }

        .mx-tm {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12.5px;
          color: var(--mut);
          margin: 10px 2px 20px;
        }
        .mx-tm b {
          color: var(--ink);
          font-variant-numeric: tabular-nums;
        }

        .mx-lk, .mx-back {
          border: 0;
          background: none;
          font: 600 12.5px Inter, sans-serif;
          color: var(--or);
          cursor: pointer;
          padding: 0;
        }
        .mx-lk:disabled {
          color: var(--mut);
          cursor: default;
        }
        .mx-lk:not(:disabled):hover, .mx-back:hover {
          text-decoration: underline;
        }

        .mx-back {
          display: block;
          margin: 6px auto 0;
          color: var(--mut);
          font-size: 13px;
        }

        /* ================= FORGOT PASSWORD (V3) STYLES ================= */
        .mx-steps {
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
          max-width: 340px;
          margin: 0 auto 20px;
        }

        .mx-st {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          font-weight: 600;
          color: var(--mut);
          transition: color .3s;
        }

        .mx-st b {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          border: 1.5px solid var(--line);
          background: var(--card);
          font: 700 12px Inter, sans-serif;
          transition: all .4s;
          color: var(--mut);
        }

        .mx-st.on {
          color: var(--ink);
        }

        .mx-st.on b {
          border-color: var(--or);
          color: var(--or);
          box-shadow: 0 0 0 4px rgba(241,91,55,.15);
        }

        .mx-st.done {
          color: var(--ink);
        }

        .mx-st.done b {
          background: var(--or);
          border-color: var(--or);
          color: #fff;
          font-size: 0;
        }

        .mx-st.done b:after {
          content: "✓";
          font-size: 13px;
        }

        .mx-steps u {
          flex: 1;
          height: 2px;
          background: var(--line);
          margin-bottom: 20px;
          position: relative;
          overflow: hidden;
          text-decoration: none;
        }

        .mx-steps u:after {
          content: "";
          position: absolute;
          inset: 0;
          background: var(--or);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform .5s;
        }

        .mx-steps u.fill:after {
          transform: scaleX(1);
        }

        .mx-pn {
          display: flex;
          flex-direction: column;
          gap: 0;
          animation: mx-vin .5s cubic-bezier(.2,.8,.2,1) both;
        }

        .mx-pn .mx-head {
          margin-bottom: 4px;
        }

        .mx-pn .mx-btn {
          margin-top: 18px;
        }

        .mx-pn .mx-msg {
          margin-top: 8px;
        }

        .mx-pn .mx-fld {
          margin-top: 16px;
        }

        .mx-shield.mx-shield-v3 {
          width: 66px;
          height: 66px;
          border-radius: 20px;
          margin-bottom: 14px;
        }

        .mx-shield.mx-shield-v3:before,
        .mx-shield.mx-shield-v3:after {
          border-radius: 20px;
        }

        .mx-shield.gn {
          background: linear-gradient(135deg, #16a672, #2dd4a0);
          box-shadow: 0 16px 30px -8px rgba(22,166,114,.55);
        }

        .mx-shield.gn:before,
        .mx-shield.gn:after {
          border-color: #16a672;
        }

        .mx-sw {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .mx-sm {
          flex: 1;
          display: flex;
          gap: 6px;
        }

        .mx-sm i {
          flex: 1;
          height: 5px;
          border-radius: 5px;
          background: var(--line);
          transition: background .3s;
        }

        .mx-sw span {
          font-size: 12px;
          font-weight: 600;
          min-width: 50px;
          text-align: right;
          color: var(--mut);
        }

        .mx-rq {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6px 10px;
          margin-top: 10px;
          font-size: 12px;
          color: var(--mut);
        }

        .mx-rq span {
          display: flex;
          gap: 7px;
          align-items: center;
          transition: color .3s;
        }

        .mx-rq span:before {
          content: "";
          width: 15px;
          height: 15px;
          border-radius: 50%;
          border: 1.5px solid var(--line);
          flex: none;
          transition: all .3s;
        }

        .mx-rq span.ok {
          color: #16a672;
        }

        .mx-rq span.ok:before {
          background: #16a672 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='m2.5 6.5 2.5 2.5 4.5-5' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center/10px no-repeat;
          border-color: #16a672;
        }

        .mx-hn {
          min-height: 16px;
          margin-top: 7px;
          font-size: 12px;
          font-weight: 600;
        }

        .mx-note {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
          padding: 12px 14px;
          border-radius: 12px;
          background: var(--field);
          border: 1px solid var(--line);
          font-size: 12px;
          line-height: 1.5;
          color: var(--mut);
          text-align: left;
        }

        @media (max-width: 420px) {
          .mx-otp input { width: 42px; height: 52px; }
          .mx-otp { gap: 7px; }
          .mx-rq { grid-template-columns: 1fr; }
        }

        /* ================= SHOWCASE (Desktop 3-Tier / Mobile Carousel) ================= */
        .mx-show {
          position: relative;
          border-radius: 0 26px 26px 0;
          overflow: hidden;
          color: #fff;
          padding: 32px 32px 36px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: radial-gradient(110% 80% at 80% 0, #17707f 0, var(--d1) 40%, var(--d2) 100%);
          gap: 16px;
        }

        .mx-show:before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(255,255,255,.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.05) 1px, transparent 1px);
          background-size: 46px 46px;
          -webkit-mask-image: radial-gradient(circle at 50% 35%, #000, transparent 75%);
          mask-image: radial-gradient(circle at 50% 35%, #000, transparent 75%);
        }

        .mx-glow {
          position: absolute;
          width: 300px;
          height: 300px;
          border-radius: 50%;
          background: var(--or);
          filter: blur(90px);
          opacity: .25;
          right: -80px;
          bottom: -60px;
          animation: mx-drift 10s ease-in-out infinite alternate;
        }

        @keyframes mx-drift {
          to { transform: translate(-50px, -40px); }
        }

        .mx-bl-mobile {
          display: none !important;
        }

        .mx-cards-carousel {
          display: contents;
        }

        .mx-tier-top,
        .mx-tier-bottom {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          perspective: 900px;
          z-index: 1;
        }

        .mx-fc {
          transition: transform .3s ease-out;
        }

        /* Floating animations for cards */
        .mx-anim-float-1 {
          animation: mx-card-float-up 4s ease-in-out infinite alternate !important;
        }
        .mx-anim-float-2 {
          animation: mx-card-float-down 4.4s ease-in-out infinite alternate -1.2s !important;
        }
        .mx-anim-float-3 {
          animation: mx-card-float-up 4.1s ease-in-out infinite alternate -2.2s !important;
        }
        .mx-anim-float-4 {
          animation: mx-card-float-down 4.6s ease-in-out infinite alternate -3.4s !important;
        }

        @keyframes mx-card-float-up {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(-15px);
          }
        }

        @keyframes mx-card-float-down {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(15px);
          }
        }

        .mx-c {
          background: #fff;
          color: #0b2e3a;
          border-radius: 16px;
          padding: 13px 14px;
          font-size: 11px;
          box-shadow: 0 20px 36px -12px rgba(0,0,0,.45), 0 0 0 4px rgba(255,255,255,.1);
          transform: rotateY(-3deg) rotateX(2deg);
          transition: transform .3s, box-shadow .3s;
        }

        .mx-anim-float-2 .mx-c {
          transform: rotateY(3deg) rotateX(-2deg);
        }

        .mx-anim-float-3 .mx-c {
          transform: rotateY(-2deg) rotateX(3deg);
        }

        .mx-anim-float-4 .mx-c {
          transform: rotateY(2deg) rotateX(-2deg);
        }

        .mx-c h4 {
          gap: 6px;
          flex-wrap: wrap;
          font: 600 11px Inter, sans-serif;
          color: #5b6f7c;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .mx-c b.big {
          font: 700 19px 'Space Grotesk', Inter, sans-serif;
          display: block;
          margin: 5px 0 2px;
          color: #0b2e3a;
        }

        .mx-tag {
          font-size: 9.5px;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: 20px;
        }
        .mx-tag.g { background: #dcf7ec; color: #0e8a5f; }
        .mx-tag.o { background: #ffe9e1; color: #d24a27; }

        .mx-donut {
          display: flex;
          gap: 12px;
          align-items: center;
          margin-top: 6px;
        }

        .mx-donut svg {
          flex: none;
          transform: rotate(-90deg);
        }

        .mx-donut circle {
          fill: none;
          stroke-width: 9;
          stroke-linecap: round;
          stroke-dasharray: 0 100;
          animation: mx-dr 1.6s .6s ease-out forwards;
        }

        @keyframes mx-dr {
          to { stroke-dasharray: var(--l) 100; }
        }

        .mx-lg2 div {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #5b6f7c;
          font-size: 10px;
          margin: 3px 0;
        }
        .mx-lg2 i {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .mx-bar {
          height: 6px;
          border-radius: 6px;
          background: #e6edf2;
          margin: 9px 0 6px;
          overflow: hidden;
        }
        .mx-bar i {
          display: block;
          height: 100%;
          width: 0;
          border-radius: 6px;
          background: linear-gradient(90deg, var(--or), #ffb347);
          animation: mx-bw 1.6s .8s ease-out forwards;
        }
        @keyframes mx-bw {
          to { width: 72%; }
        }

        .mx-sub {
          display: flex;
          justify-content: space-between;
          color: #7a8e9a;
          font-size: 10px;
        }

        .mx-li {
          display: flex;
          justify-content: space-between;
          padding: 6px 0;
          border-top: 1px solid #edf2f5;
          font-size: 10.5px;
        }
        .mx-li span { color: #7a8e9a; }

        .mx-cb {
          margin-top: 7px;
          background: #0f3b4a;
          color: #fff;
          text-align: center;
          border-radius: 8px;
          padding: 7px;
          font-weight: 600;
          font-size: 10.5px;
        }

        .mx-pulse {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #22c58b;
          display: inline-block;
          margin-right: 5px;
          animation: mx-pl 1.6s infinite;
        }
        @keyframes mx-pl {
          50% { box-shadow: 0 0 0 6px rgba(34,197,139,0); }
          0% { box-shadow: 0 0 0 0 rgba(34,197,139,.6); }
        }

        /* 4th Card: Payments Histogram Bars */
        .mx-bars {
          display: flex;
          gap: 6px;
          align-items: flex-end;
          height: 44px;
          margin-top: 10px;
        }
        .mx-bars i {
          flex: 1;
          border-radius: 4px 4px 2px 2px;
          background: linear-gradient(#ff8a5c, #f15b37);
          height: 0;
          animation: mx-gr 1s ease-out forwards;
        }
        @keyframes mx-gr {
          to { height: var(--h); }
        }

        .mx-bl-desktop {
          position: relative;
          text-align: center;
          margin: 6px auto;
          max-width: 440px;
          z-index: 2;
          padding: 4px 0;
        }

        .mx-bl-desktop .mx-ic {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--or), var(--or2));
          display: grid;
          place-items: center;
          box-shadow: 0 10px 22px -4px rgba(241,91,55,.6);
        }

        .mx-bl-desktop h2 {
          font-family: 'Space Grotesk', Inter, sans-serif;
          font-size: 20px;
          line-height: 1.28;
          font-weight: 700;
        }

        .mx-bl-desktop p {
          margin: 8px auto 0;
          max-width: 390px;
          font-size: 12px;
          line-height: 1.65;
          color: #a9c3ce;
        }

        /* ================= MOBILE VIEW ONLY (max-width: 900px) ================= */
        @media (max-width: 900px) {
          .mx-login-scope {
            padding: 0;
          }

          .mx-stage {
            max-width: none;
            perspective: none;
          }

          .mx-shell {
            grid-template-columns: 1fr;
            grid-template-rows: auto 1fr;
            min-height: 100svh;
            border-radius: 0;
            box-shadow: none;
            animation: mx-mfade .7s ease both;
          }

          @keyframes mx-mfade {
            from { opacity: 0; transform: translateY(16px); }
          }

          .mx-show {
            order: -1;
            border-radius: 0;
            padding: 24px 16px 54px;
            display: flex !important;
            flex-direction: column;
            overflow: hidden;
            gap: 0;
          }

          .mx-bl-desktop {
            display: none !important;
          }

          .mx-bl-mobile {
            display: flex !important;
            order: -1;
            align-items: center;
            gap: 12px;
            text-align: left;
            margin: 0;
            padding: 0 12px 0 0;
          }

          .mx-bl-mobile .mx-ic {
            width: 44px;
            height: 44px;
            margin: 0;
            border-radius: 13px;
            flex: none;
          }

          .mx-bl-mobile h2 {
            font-size: 14px;
            line-height: 1.35;
            color: #ffffff;
            margin: 2px 0 0;
          }
          .mx-bl-mobile h2 br {
            display: none;
          }

          .mx-cards-carousel {
            display: flex !important;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            gap: 16px;
            margin: 18px -16px 0;
            padding: 14px 20px 24px;
            scrollbar-width: none;
            -webkit-overflow-scrolling: touch;
            perspective: 800px;
          }

          .mx-cards-carousel::-webkit-scrollbar {
            display: none;
          }

          .mx-tier-top,
          .mx-tier-bottom {
            display: contents !important;
          }

          .mx-fc {
            flex: 0 0 min(250px, 74vw);
            scroll-snap-align: center;
          }

          .mx-c {
            padding: 13px 14px;
            box-shadow: 0 14px 28px -6px rgba(0,0,0,.35), 0 0 0 3px rgba(255,255,255,.14);
            border: 1px solid rgba(255,255,255,.2);
          }

          .mx-form-side {
            margin-top: -32px;
            position: relative;
            z-index: 2;
            background: var(--card);
            border-radius: 30px 30px 0 0;
            padding: 30px 20px calc(28px + env(safe-area-inset-bottom, 0px));
            box-shadow: 0 -14px 34px -10px rgba(7,34,44, .35);
          }

          .mx-vw {
            width: 100%;
            max-width: 460px;
            margin: 0 auto;
            justify-content: flex-start;
          }

          .mx-head h1 {
            font-size: 24px;
          }

          .mx-tabs {
            margin: 20px 0;
          }

          .mx-in input {
            height: 52px;
            font-size: 16px;
          }

          .mx-btn {
            height: 54px;
          }
        }

        @media (max-width: 420px) {
          .mx-otp input { width: 42px; height: 52px; }
          .mx-otp { gap: 7px; }
        }
      `}</style>

      {/* ======================================================== */}
      {/* SOCIAL SSO ACCOUNT CHOOSER MODAL (Google / Microsoft / LinkedIn) */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* SOCIAL SSO ACCOUNT CHOOSER MODAL (Google / Microsoft / LinkedIn) */}
      {/* ======================================================== */}
      {ssoModal && (() => {
        const provider = ssoModal?.provider || (typeof ssoModal === "string" ? ssoModal : "google");
        const accounts = ssoAccounts[provider] || ssoAccounts.google;

        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-[var(--card)] border border-[var(--line)] rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl relative text-left transition-all">
              
              {/* Modal Header with Provider Icon */}
              <div className="flex items-center justify-between pb-4 border-b border-[var(--line)] mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[var(--field)] border border-[var(--line)] flex items-center justify-center shadow-sm">
                    {provider === "google" && (
                      <svg width="22" height="22" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                    )}
                    {provider === "microsoft" && (
                      <svg width="20" height="20" viewBox="0 0 14 14">
                        <path fill="#f25022" d="M0 0h6.5v6.5H0z" />
                        <path fill="#7fba00" d="M7.5 0H14v6.5H7.5z" />
                        <path fill="#00a4ef" d="M0 7.5h6.5V14H0z" />
                        <path fill="#ffb900" d="M7.5 7.5H14V14H7.5z" />
                      </svg>
                    )}
                    {provider === "linkedin" && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="#0a66c2">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.94 0 1.7-.77 1.7-1.71 0-.94-.76-1.7-1.7-1.7-.95 0-1.71.76-1.71 1.7 0 .94.76 1.71 1.71 1.71m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--ink)] leading-tight capitalize">
                      Sign in with {provider}
                    </h3>
                    <p className="text-xs text-[var(--mut)]">Choose an account to continue to MARBLEX</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSsoModal(null)}
                  className="w-8 h-8 rounded-lg hover:bg-[var(--field)] text-[var(--mut)] hover:text-[var(--ink)] flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              {/* Loading Indicator when selecting an account */}
              {ssoLoading ? (
                <div className="py-10 text-center">
                  <div className="w-10 h-10 rounded-full border-3 border-[var(--or)] border-t-transparent animate-spin mx-auto mb-4" />
                  <h4 className="text-sm font-bold text-[var(--ink)]">Sending 2FA Verification Code…</h4>
                  <p className="text-xs text-[var(--mut)] mt-1">Please check your inbox in a moment.</p>
                </div>
              ) : (
                <div>
                  {/* Account List */}
                  <div className="flex flex-col gap-2 mb-4">
                    {accounts.map((acc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectSsoAccount(acc)}
                        className="w-full flex items-center gap-3.5 p-3 rounded-2xl border border-[var(--line)] bg-[var(--field)]/60 hover:bg-[var(--field)] hover:border-[var(--or)] text-left transition-all group"
                      >
                        <div
                          className="w-10 h-10 rounded-full text-white font-bold flex items-center justify-center text-sm shrink-0 shadow-sm group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: acc.color }}
                        >
                          {acc.avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[var(--ink)] truncate">{acc.name}</div>
                          <div className="text-xs text-[var(--mut)] truncate">{acc.email}</div>
                        </div>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[var(--mut)] group-hover:text-[var(--or)] group-hover:translate-x-1 transition-all">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </button>
                    ))}
                  </div>

                  {/* Or Custom Account Input */}
                  <div className="pt-2 border-t border-[var(--line)]">
                    <div className="text-xs font-semibold text-[var(--mut)] mb-2">Use another account</div>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        placeholder="Enter your Gmail / account email"
                        value={customSsoEmail}
                        onChange={(e) => setCustomSsoEmail(e.target.value)}
                        className="flex-1 h-11 px-3.5 rounded-xl border border-[var(--line)] bg-[var(--field)] text-xs text-[var(--ink)] outline-none focus:border-[var(--or)] focus:bg-[var(--card)]"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleSelectSsoAccount({ email: customSsoEmail, name: customSsoEmail.split("@")[0] });
                          }
                        }}
                      />
                      <button
                        type="button"
                        disabled={!customSsoEmail.trim()}
                        onClick={() => handleSelectSsoAccount({ email: customSsoEmail, name: customSsoEmail.split("@")[0] })}
                        className="h-11 px-4 rounded-xl bg-gradient-to-r from-[var(--or)] to-[var(--or2)] text-white text-xs font-semibold hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
                      >
                        Continue →
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 text-[11px] text-center text-[var(--mut)] leading-relaxed">
                    MARBLEX will verify your identity by emailing a 6-digit 2FA code to your selected account.
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })()}

      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="mx-stage"
      >
        <div ref={shellRef} className="mx-shell">
          {/* ======================================================== */}
          {/* LEFT: INTERACTIVE AUTHENTICATION VIEW (v1 Login & v2 2FA) */}
          {/* ======================================================== */}
          <section className="mx-form-side">

            {/* VIEW 3: FORGOT PASSWORD FLOW (v3 SCREEN) */}
            {forgotOpen ? (
              <div className="mx-vw mx-vw-v2">
                {/* Steps Breadcrumbs (Hidden on final success step) */}
                {forgotStep < 3 && (
                  <div className="mx-steps">
                    <div className={`mx-st ${forgotStep === 0 ? "on" : forgotStep > 0 ? "done" : ""}`}>
                      <b>1</b>Email
                    </div>
                    <u className={forgotStep > 0 ? "fill" : ""} />
                    <div className={`mx-st ${forgotStep === 1 ? "on" : forgotStep > 1 ? "done" : ""}`}>
                      <b>2</b>Verify
                    </div>
                    <u className={forgotStep > 1 ? "fill" : ""} />
                    <div className={`mx-st ${forgotStep === 2 ? "on" : ""}`}>
                      <b>3</b>Reset
                    </div>
                  </div>
                )}

                {/* PANEL 0: SEND RESET CODE (EMAIL) */}
                {forgotStep === 0 && (
                  <div className={`mx-pn ${forgotShake ? "mx-shake" : ""}`}>
                    <div className="mx-shield mx-shield-v3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="8" cy="15" r="4" />
                        <path d="m11 12 9-9m-3 3 3 3m-6 0 2 2" />
                      </svg>
                    </div>
                    <div className="mx-head">
                      <h1>Forgot your password?</h1>
                      <p>No worries. Enter your registered email and we'll send you a 6-digit code to reset it.</p>
                    </div>
                    <div className="mx-fld" style={{ marginTop: "22px" }}>
                      <div className="mx-lbl">
                        <label htmlFor="fem" style={{ margin: 0 }}>Email Address<i>*</i></label>
                      </div>
                      <div className="mx-in">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="5" width="18" height="14" rx="3" />
                          <path d="m3 8 9 6 9-6" />
                        </svg>
                        <input
                          id="fem"
                          type="email"
                          placeholder="Enter your email address"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleForgotSendCode();
                          }}
                          autoComplete="email"
                          autoFocus
                        />
                      </div>
                    </div>
                    <button
                      className="mx-btn"
                      type="button"
                      disabled={forgotLoading}
                      onClick={handleForgotSendCode}
                    >
                      {forgotLoading ? (
                        <i className="mx-spin" />
                      ) : (
                        <span>Send Reset Code</span>
                      )}
                      {!forgotLoading && (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      )}
                    </button>
                    <div
                      className="mx-msg"
                      style={{ color: forgotMsg.type === "success" ? "#16a672" : "var(--or)" }}
                    >
                      {forgotMsg.text}
                    </div>
                    <button
                      className="mx-back"
                      type="button"
                      onClick={closeForgot}
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                )}

                {/* PANEL 1: CHECK EMAIL & ENTER OTP */}
                {forgotStep === 1 && (
                  <div className={`mx-pn ${forgotShake ? "mx-shake" : ""}`}>
                    <div className="mx-shield mx-shield-v3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="5" width="18" height="14" rx="3" />
                        <path d="m3 8 9 6 9-6" />
                      </svg>
                    </div>
                    <div className="mx-head">
                      <h1>Check your email</h1>
                      <p>
                        We sent a 6-digit code to <b>{getMaskedEmail(forgotEmail)}</b>. Enter it below to continue.
                      </p>
                    </div>
                    <div className="mx-otp" onPaste={handleForgotOtpPaste}>
                      {forgotOtpDigits.map((digit, index) => (
                        <input
                          key={index}
                          ref={(el) => (forgotInputRefs.current[index] = el)}
                          type="text"
                          inputMode="numeric"
                          maxLength={1}
                          autoComplete="one-time-code"
                          aria-label={`Digit ${index + 1}`}
                          value={digit}
                          className={digit ? "f" : ""}
                          onChange={(e) => handleForgotOtpChange(index, e.target.value)}
                          onKeyDown={(e) => handleForgotOtpKeyDown(index, e)}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                    <div className="mx-tm" style={{ marginTop: 0 }}>
                      <span>Didn't get it? Check spam.</span>
                      <button
                        className="mx-lk"
                        type="button"
                        disabled={forgotResendCooldown > 0 || forgotLoading}
                        onClick={handleForgotResend}
                      >
                        {forgotResendCooldown > 0 ? `Resend in ${forgotResendCooldown}s` : "Resend code"}
                      </button>
                    </div>
                    <button
                      className="mx-btn"
                      type="button"
                      style={{ marginTop: "4px" }}
                      disabled={forgotLoading}
                      onClick={() => handleForgotVerifyCode()}
                    >
                      {forgotLoading ? (
                        <i className="mx-spin" />
                      ) : (
                        <span>Verify Code</span>
                      )}
                      {!forgotLoading && (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      )}
                    </button>
                    <div
                      className="mx-msg"
                      style={{ color: forgotMsg.type === "success" ? "#16a672" : "var(--or)" }}
                    >
                      {forgotMsg.text}
                    </div>
                    <button
                      className="mx-back"
                      type="button"
                      onClick={() => {
                        if (forgotTimerRef.current) clearInterval(forgotTimerRef.current);
                        setForgotStep(0);
                        setForgotMsg({ text: "", type: "" });
                      }}
                    >
                      ← Change email
                    </button>
                  </div>
                )}

                {/* PANEL 2: CREATE NEW PASSWORD */}
                {forgotStep === 2 && (
                  <div className={`mx-pn ${forgotShake ? "mx-shake" : ""}`}>
                    <div className="mx-shield mx-shield-v3">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="4" y="11" width="16" height="10" rx="3" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </svg>
                    </div>
                    <div className="mx-head">
                      <h1>Create new password</h1>
                      <p>Your new password must be different from your previously used passwords.</p>
                    </div>

                    {/* New Password Field */}
                    <div className="mx-fld" style={{ marginTop: "20px" }}>
                      <div className="mx-lbl">
                        <label htmlFor="np" style={{ margin: 0 }}>New Password<i>*</i></label>
                      </div>
                      <div className="mx-in">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="11" width="16" height="10" rx="3" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                        </svg>
                        <input
                          id="np"
                          type={forgotShowNewPw ? "text" : "password"}
                          placeholder="Enter new password"
                          value={forgotNewPassword}
                          onChange={(e) => setForgotNewPassword(e.target.value)}
                          autoComplete="new-password"
                          autoFocus
                        />
                        <button
                          type="button"
                          className="mx-eye"
                          onClick={() => setForgotShowNewPw(!forgotShowNewPw)}
                          aria-label="Show password"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>

                      {/* Password Strength Meter */}
                      <div className="mx-sw">
                        <div className="mx-sm">
                          <i style={{ background: forgotNewPassword && forgotStrength.count >= 1 ? forgotStrength.color : "" }} />
                          <i style={{ background: forgotNewPassword && forgotStrength.count >= 2 ? forgotStrength.color : "" }} />
                          <i style={{ background: forgotNewPassword && forgotStrength.count >= 3 ? forgotStrength.color : "" }} />
                          <i style={{ background: forgotNewPassword && forgotStrength.count >= 4 ? forgotStrength.color : "" }} />
                        </div>
                        <span style={{ color: forgotStrength.color }}>{forgotStrength.label}</span>
                      </div>

                      {/* 4 Rules Badges */}
                      <div className="mx-rq">
                        <span className={pwRules.len(forgotNewPassword) ? "ok" : ""}>8+ characters</span>
                        <span className={pwRules.case(forgotNewPassword) ? "ok" : ""}>Upper &amp; lowercase</span>
                        <span className={pwRules.num(forgotNewPassword) ? "ok" : ""}>A number</span>
                        <span className={pwRules.sym(forgotNewPassword) ? "ok" : ""}>A symbol</span>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="mx-fld">
                      <div className="mx-lbl">
                        <label htmlFor="cp" style={{ margin: 0 }}>Confirm Password<i>*</i></label>
                      </div>
                      <div className="mx-in">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="4" y="11" width="16" height="10" rx="3" />
                          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                        </svg>
                        <input
                          id="cp"
                          type={forgotShowConfirmPw ? "text" : "password"}
                          placeholder="Re-enter new password"
                          value={forgotConfirmPassword}
                          onChange={(e) => setForgotConfirmPassword(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleForgotResetPassword();
                          }}
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          className="mx-eye"
                          onClick={() => setForgotShowConfirmPw(!forgotShowConfirmPw)}
                          aria-label="Show password"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        </button>
                      </div>
                      <div className="mx-hn" style={{ color: isForgotMatch ? "#16a672" : isForgotMismatch ? "#ef4444" : "inherit" }}>
                        {isForgotMatch ? "Passwords match ✓" : isForgotMismatch ? "Passwords don't match" : ""}
                      </div>
                    </div>

                    <button
                      className="mx-btn"
                      type="button"
                      style={{ marginTop: "6px" }}
                      disabled={forgotLoading}
                      onClick={handleForgotResetPassword}
                    >
                      {forgotLoading ? (
                        <i className="mx-spin" />
                      ) : (
                        <span>Reset Password</span>
                      )}
                      {!forgotLoading && (
                        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path d="M5 12h14m-6-6 6 6-6 6" />
                        </svg>
                      )}
                    </button>
                    <div
                      className="mx-msg"
                      style={{ color: forgotMsg.type === "success" ? "#16a672" : "var(--or)" }}
                    >
                      {forgotMsg.text}
                    </div>
                  </div>
                )}

                {/* PANEL 3: PASSWORD UPDATED (SUCCESS) */}
                {forgotStep === 3 && (
                  <div className="mx-pn" style={{ textAlign: "center" }}>
                    <div className="mx-shield mx-shield-v3 gn">
                      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="m6 12.5 4 4 8-9" />
                      </svg>
                    </div>
                    <div className="mx-head">
                      <h1>Password updated</h1>
                      <p>Your password has been reset successfully. You can now sign in with your new password.</p>
                    </div>
                    <div className="mx-note">
                      <span>🔒</span>
                      <span>For your security, we recommend signing out of other devices and never sharing your verification codes.</span>
                    </div>
                    <button
                      className="mx-btn"
                      type="button"
                      style={{ marginTop: "18px" }}
                      onClick={() => {
                        closeForgot();
                        setEmail(forgotEmail.trim());
                        setPassword("");
                        setMode("in");
                        setMsg({ text: "Password updated. Please sign in.", type: "success" });
                      }}
                    >
                      <span>Back to Sign In</span>
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : !stageVerify ? (
              <div className="mx-vw">
                {/* Header Text */}
                <div className="mx-head">
                  <h1>
                    {mode === "in" ? (
                      <>Welcome to MAR<span style={{ color: "#ff6b4a" }}>BLEX</span></>
                    ) : (
                      <>Create your MAR<span style={{ color: "#ff6b4a" }}>BLEX</span> account</>
                    )}
                  </h1>
                  <p>
                    {mode === "in"
                      ? "Sign in to manage orders, track shipments and review your quotations."
                      : "Start your experience with MARBLEX by signing up in under a minute."}
                  </p>
                </div>

                {/* Tabs with sliding pill */}
                <div className={`mx-tabs ${mode === "reg" ? "reg" : ""}`}>
                  <span className="mx-pill" />
                  <button
                    type="button"
                    className={mode === "in" ? "on" : ""}
                    onClick={() => handleTabChange("in")}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    className={mode === "reg" ? "on" : ""}
                    onClick={() => handleTabChange("reg")}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Main Form */}
                <form
                  ref={formRef}
                  onSubmit={handleSubmit}
                  className={`mx-form ${mode === "reg" ? "reg" : ""} ${isShaking ? "mx-shake" : ""}`}
                  noValidate
                >
                  {/* Expandable in-place Registration Fields */}
                  <div className="mx-extra">
                    <div>
                      <div>
                        <div className="mx-lbl">
                          <label htmlFor="nm" style={{ margin: 0 }}>Full Name<i>*</i></label>
                        </div>
                        <div className="mx-in">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="8" r="4" />
                            <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                          </svg>
                          <input
                            id="nm"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            autoComplete="name"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="mx-lbl">
                          <label htmlFor="co" style={{ margin: 0 }}>Company<i>*</i></label>
                        </div>
                        <div className="mx-in">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 21V7l9-4 9 4v14M9 21v-6h6v6" />
                          </svg>
                          <input
                            id="co"
                            placeholder="Enter your company name"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            autoComplete="organization"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <div className="mx-lbl">
                      <label htmlFor="em" style={{ margin: 0 }}>Email Address<i>*</i></label>
                    </div>
                    <div className="mx-in">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="5" width="18" height="14" rx="3" />
                        <path d="m3 8 9 6 9-6" />
                      </svg>
                      <input
                        id="em"
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div>
                    <div className="mx-lbl">
                      <label htmlFor="pw" style={{ margin: 0 }}>Password<i>*</i></label>
                    </div>
                    <div className="mx-in">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="4" y="11" width="16" height="10" rx="3" />
                        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                      </svg>
                      <input
                        id="pw"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete={mode === "reg" ? "new-password" : "current-password"}
                      />
                      <button
                        type="button"
                        className="mx-eye"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label="Show password"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Remember & Forgot Row */}
                  <div className="mx-row">
                    <label className="mx-chk">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                      Remember this session
                    </label>
                    <span style={{ visibility: mode === "reg" ? "hidden" : "visible" }} className="mx-lbl" id="fgw">
                      <button
                        type="button"
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--or)",
                          fontSize: "12px",
                          fontWeight: 600,
                          cursor: "pointer",
                          padding: 0,
                          fontFamily: "inherit",
                        }}
                        onClick={() => {
                          setForgotEmail(email || "");
                          setForgotStep(0);
                          setForgotOtpDigits(["", "", "", "", "", ""]);
                          setForgotNewPassword("");
                          setForgotConfirmPassword("");
                          setForgotMsg({ text: "", type: "" });
                          setForgotOpen(true);
                        }}
                      >
                        Forgot Password?
                      </button>
                    </span>
                  </div>

                  {/* Submit Button */}
                  <button
                    className="mx-btn"
                    type="submit"
                    disabled={loading}
                    onClick={handleButtonClick}
                  >
                    {loading ? (
                      <i className="mx-spin" />
                    ) : (
                      <span>{mode === "in" ? "Sign In" : "Sign Up"}</span>
                    )}
                    {!loading && (
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14m-6-6 6 6-6 6" />
                      </svg>
                    )}
                  </button>

                  {/* Feedback Message */}
                  <div
                    className="mx-msg"
                    style={{ color: msg.type === "success" ? "#16a672" : "var(--or)" }}
                  >
                    {msg.text}
                  </div>

                  {/* Divider */}
                  <div className="mx-or">Or continue with</div>

                  {/* Social SSO Buttons */}
                  <div className="mx-soc">
                    {/* Google SSO */}
                    <button
                      type="button"
                      onClick={() => handleSocialAuth("google")}
                      className="hover:scale-105 transition-transform"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" className="shrink-0">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      <span>Google</span>
                    </button>

                    {/* Microsoft SSO */}
                    <button
                      type="button"
                      onClick={() => handleSocialAuth("microsoft")}
                      className="hover:scale-105 transition-transform"
                    >
                      <svg width="15" height="15" viewBox="0 0 14 14" className="shrink-0">
                        <path fill="#f25022" d="M0 0h6.5v6.5H0z" />
                        <path fill="#7fba00" d="M7.5 0H14v6.5H7.5z" />
                        <path fill="#00a4ef" d="M0 7.5h6.5V14H0z" />
                        <path fill="#ffb900" d="M7.5 7.5H14V14H7.5z" />
                      </svg>
                      <span>Microsoft</span>
                    </button>

                    {/* LinkedIn SSO */}
                    <button
                      type="button"
                      onClick={() => handleSocialAuth("linkedin")}
                      className="hover:scale-105 transition-transform"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="#0a66c2" className="shrink-0">
                        <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76c.94 0 1.7-.77 1.7-1.71 0-.94-.76-1.7-1.7-1.7-.95 0-1.71.76-1.71 1.7 0 .94.76 1.71 1.71 1.71m1.4 9.74v-8.37H5.06v8.37h2.8z" />
                      </svg>
                      <span>LinkedIn</span>
                    </button>
                  </div>
                </form>

                {/* Legal / Admin Help */}
                <p className="mx-legal">
                  Need help? Contact portal admin · <b>Marblexpak@gmail.com</b>
                </p>
              </div>
            ) : (
              /* ======================================================== */
              /* VIEW 2: TWO-FACTOR VERIFICATION (v2 SCREEN)              */
              /* ======================================================== */
              <div className="mx-vw mx-vw-v2">
                {/* Animated Pulsing Shield Icon */}
                <div className="mx-shield">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z" />
                    <path className="mx-ck" d="m9 12 2 2 4-4" />
                  </svg>
                </div>

                {/* 2FA Header */}
                <div className="mx-head">
                  <h1>Two-Factor Verification</h1>
                  <p>
                    Enter the 6-digit code we sent to <b>{getMaskedEmail(verifyEmail)}</b> to secure your MARBLEX account.
                  </p>
                </div>

                {/* 6-Digit Passcode Box */}
                <div className={`mx-otp ${isOtpSuccess ? "okk" : ""} ${isVShaking ? "mx-shake" : ""}`} onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      autoComplete="one-time-code"
                      aria-label={`Digit ${index + 1}`}
                      value={digit}
                      className={digit ? "f" : ""}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>

                {/* Progress Expiry Timer Bar */}
                <div className="mx-tb">
                  <i style={{ width: `${Math.max(expTime, 0) / 120 * 100}%` }} />
                </div>

                {/* Timer Info & Resend Action */}
                <div className="mx-tm">
                  <span>
                    Code expires in <b>{formatTimer(expTime)}</b>
                  </span>
                  <button
                    className="mx-lk"
                    type="button"
                    disabled={resendCooldown > 0 || loading}
                    onClick={handleResend}
                  >
                    {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend code"}
                  </button>
                </div>

                {/* Verify Submit Button */}
                <button
                  className={`mx-btn ${isOtpSuccess ? "ok" : ""}`}
                  type="button"
                  disabled={loading}
                  onClick={(e) => {
                    handleButtonClick(e);
                    handleVerifySubmit();
                  }}
                >
                  {loading ? (
                    <i className="mx-spin" />
                  ) : (
                    <span>{isOtpSuccess ? "Verified ✓" : "Verify & Continue"}</span>
                  )}
                  {!loading && !isOtpSuccess && (
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14m-6-6 6 6-6 6" />
                    </svg>
                  )}
                </button>

                {/* 2FA Status Message */}
                <div
                  className="mx-msg"
                  style={{ color: vMsg.type === "success" ? "#16a672" : "var(--or)" }}
                >
                  {vMsg.text}
                </div>

                {/* Return Back Button */}
                <button
                  className="mx-back"
                  type="button"
                  onClick={() => {
                    setStageVerify(false);
                    setMsg({ text: "", type: "" });
                    setVMsg({ text: "", type: "" });
                  }}
                >
                  ← Back to Sign In
                </button>

                <p className="mx-legal">
                  Didn't get the code? Check spam or contact portal admin · <b>Marblexpak@gmail.com</b>
                </p>
              </div>
            )}
          </section>

          {/* ======================================================== */}
          {/* RIGHT: SHOWCASE (3-Tier on Desktop, Auto-Slider on Mobile) */}
          {/* ======================================================== */}
          <section ref={showRef} className="mx-show">
            <div className="mx-glow" />

            {/* Mobile-Only Top Brand Header */}
            <div className="mx-bl mx-bl-mobile">
              <div className="mx-ic" style={{ background: "#fff", padding: "6px" }}>
                <img
                  src="/logo-icon-transparent.png"
                  alt="MARBLEX"
                  style={{ width: "100%", height: "100%", objectFit: "contain" }}
                />
              </div>
              <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                <div style={{ fontSize: "11px", fontWeight: 900, letterSpacing: "0.14em", textTransform: "uppercase", color: "#e2e8f0" }}>
                  MAR<span style={{ color: "#ff6b4a" }}>BLEX</span> · <span style={{ color: "#94a3b8", fontWeight: 700 }}>CHEMICAL &amp; RUBBER</span>
                </div>
                <h2 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: 1.3, margin: "2px 0 0" }}>
                  One Portal for Smarter Construction Chemical Procurement
                </h2>
              </div>
            </div>

            {/* 4 Cards (Carousel Container for Mobile, 3-Tier Grid for Desktop) */}
            <div
              ref={cardsContainerRef}
              onTouchStart={handleCarouselTouch}
              onPointerDown={handleCarouselTouch}
              className="mx-cards-carousel"
            >
              {/* TOP 2 CARDS */}
              <div className="mx-tier-top">
                {/* CARD 1: Order Overview */}
                <div className="mx-fc mx-anim-float-1" style={{ "--d": 12 }}>
                  <div className="mx-c">
                    <h4>Order Overview <span className="mx-tag g">Live</span></h4>
                    <div className="mx-donut">
                      <svg width="72" height="72" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="15.9" stroke="#e6edf2" style={{ strokeDasharray: "100 0", animation: "none" }} />
                        <circle cx="18" cy="18" r="15.9" stroke="#0f7c8f" style={{ "--l": "58" }} />
                        <circle cx="18" cy="18" r="15.9" stroke="#f15b37" style={{ "--l": "24", strokeDashoffset: "-62" }} />
                      </svg>
                      <div>
                        <b className="big">148</b>
                        <span className="sub">Active orders</span>
                      </div>
                    </div>
                    <div className="mx-lg2" style={{ marginTop: "10px" }}>
                      <div><i style={{ background: "#0f7c8f" }} />Delivered · 86</div>
                      <div><i style={{ background: "#f15b37" }} />In transit · 35</div>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Shipment Tracker */}
                <div className="mx-fc mx-anim-float-2" style={{ "--d": -14 }}>
                  <div className="mx-c">
                    <h4>
                      Shipment MX-2048 <span className="mx-tag o"><span className="mx-pulse" />In Transit</span>
                    </h4>
                    <b className="big" style={{ fontSize: "15px" }}>Karachi → Lahore</b>
                    <span className="sub">Waterproofing Membrane · 12 pallets</span>
                    <div className="mx-bar"><i /></div>
                    <div className="mx-sub">
                      <span>72% complete</span>
                      <span>ETA 2 days</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop-Only Center Brand Block */}
              <div className="mx-bl mx-bl-desktop">
                <div className="mx-ic" style={{ background: "#fff", padding: "8px" }}>
                  <img
                    src="/logo-icon-transparent.png"
                    alt="MARBLEX"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </div>
                <div style={{ fontSize: "11.5px", fontWeight: 900, letterSpacing: "0.18em", textTransform: "uppercase", color: "#e2e8f0", marginBottom: "4px" }}>
                  MAR<span style={{ color: "#ff6b4a" }}>BLEX</span> · <span style={{ color: "#cbd5e1", fontWeight: 700 }}>CHEMICAL &amp; RUBBER</span>
                </div>
                <h2>One Portal for Smarter<br />Construction Chemical Procurement</h2>
                <p>MARBLEX gives you a unified view of orders, shipments and quotations, with fast approvals and secure 256-bit encrypted access.</p>
              </div>

              {/* BOTTOM 2 CARDS */}
              <div className="mx-tier-bottom">
                {/* CARD 3: Latest Quotation */}
                <div className="mx-fc mx-anim-float-3" style={{ "--d": 16 }}>
                  <div className="mx-c">
                    <h4>Latest Quotation <span className="mx-tag g">Approved</span></h4>
                    <b className="big">Rs 1,284,500</b>
                    <span className="sub">QT-3187 · Valid till 30 Oct</span>
                    <div className="mx-li" style={{ marginTop: "8px" }}>
                      <span>Epoxy Grout · 200 kg</span>
                      <b>Rs 640,000</b>
                    </div>
                    <div className="mx-li">
                      <span>Rubber Joint · 45 pcs</span>
                      <b>Rs 644,500</b>
                    </div>
                    <div className="mx-cb">Review Quotation</div>
                  </div>
                </div>

                {/* CARD 4: Payments */}
                <div className="mx-fc mx-anim-float-4" style={{ "--d": -12 }}>
                  <div className="mx-c">
                    <h4>Payments <span className="mx-tag g">+12%</span></h4>
                    <b className="big">Rs 3.2M</b>
                    <span className="sub">Paid this month</span>
                    <div className="mx-bars">
                      <i style={{ "--h": "40%", animationDelay: ".7s" }} />
                      <i style={{ "--h": "62%", animationDelay: ".8s" }} />
                      <i style={{ "--h": "48%", animationDelay: ".9s" }} />
                      <i style={{ "--h": "78%", animationDelay: "1s" }} />
                      <i style={{ "--h": "58%", animationDelay: "1.1s" }} />
                      <i style={{ "--h": "100%", animationDelay: "1.2s" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
};
