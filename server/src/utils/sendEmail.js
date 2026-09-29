const nodemailer = require("nodemailer");
const dns = require("dns");
const Config = require("../models/Config");
const env = require("../config/env");

const PORTAL_LOGIN_URL = "https://marblex-shop.vercel.app/login";
const PORTAL_HOME_URL = "https://marblex-shop.vercel.app/";

// Hosted High-Speed Web Assets (No email attachments = Clean inbox preview with zero attachment pills)
const ICONS = {
  logo: "https://marblex-shop.vercel.app/logo-icon-transparent.png",
  website: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
  facebook: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
  instagram: "https://cdn-icons-png.flaticon.com/512/3955/3955024.png",
  whatsapp: "https://cdn-icons-png.flaticon.com/512/3670/3670051.png",
};

/**
 * Fetch dynamic email configuration from Database or Environment Variables
 */
const getEmailConfig = async () => {
  let dbConfig = null;
  try {
    dbConfig = await Config.findOne({ key: "email_settings" }).lean();
  } catch (err) {
    // ignore db lookup failure on standalone scripts
  }

  const brevoApiKey =
    dbConfig?.value?.brevoApiKey ||
    process.env.BREVO_API_KEY ||
    env.brevoApiKey ||
    "";

  let senderEmail =
    dbConfig?.value?.senderEmail ||
    dbConfig?.value?.user ||
    process.env.SENDER_EMAIL ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    env.senderEmail ||
    "Marblexpak@gmail.com";

  senderEmail = String(senderEmail).trim();
  if (senderEmail.toLowerCase().endsWith(".com.com")) {
    senderEmail = senderEmail.slice(0, -4);
  }

  const smtpUser =
    dbConfig?.value?.smtpUser ||
    dbConfig?.value?.user ||
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    env.smtpUser ||
    senderEmail;

  const rawPass =
    dbConfig?.value?.smtpPass ||
    dbConfig?.value?.pass ||
    process.env.SMTP_PASS ||
    process.env.EMAIL_PASS ||
    env.smtpPass ||
    "";

  const smtpPass = rawPass ? String(rawPass).replace(/\s+/g, "").trim() : "";

  return { brevoApiKey, senderEmail, smtpUser, smtpPass };
};

/**
 * Send email via Brevo (Sendinblue) HTTPS API (Port 443 - Never blocked on Render/Cloud)
 */
const sendViaBrevoHttpApi = async ({ brevoApiKey, senderEmail, to, subject, html, text }) => {
  const url = "https://api.brevo.com/v3/smtp/email";
  const payload = {
    sender: { name: "MARBLEX Security", email: senderEmail },
    to: [{ email: to }],
    subject: subject,
    htmlContent: html,
    textContent: text || "",
  };

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "accept": "application/json",
      "api-key": brevoApiKey.trim(),
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo HTTP API error (${response.status}): ${errorBody}`);
  }

  const result = await response.json();
  return { success: true, provider: "Brevo HTTPS API", messageId: result?.messageId };
};

/**
 * Send email via Nodemailer SMTP with IPv4 and Port 587 STARTTLS
 */
const sendViaNodemailerSmtp = async ({ senderEmail, smtpUser, smtpPass, to, subject, html, text }) => {
  if (!smtpPass) {
    throw new Error("SMTP Password is not configured.");
  }

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false, // Port 587 uses STARTTLS
    requireTLS: true,
    lookup: (hostname, options, callback) => {
      // Force IPv4 lookup for Render and Cloud Linux containers
      dns.lookup(hostname, { family: 4 }, (err, address, family) => {
        callback(err, address, 4);
      });
    },
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
    tls: {
      servername: "smtp.gmail.com",
      rejectUnauthorized: false,
      minVersion: "TLSv1.2",
    },
  });

  const info = await transporter.sendMail({
    from: `"MARBLEX Security" <${senderEmail}>`,
    to,
    replyTo: senderEmail,
    subject,
    text: text || "",
    html,
    headers: {
      "X-Priority": "1",
      "Importance": "high",
      "X-Auto-Response-Suppress": "OOF, AutoReply",
    },
  });

  return { success: true, provider: "Nodemailer SMTP (Port 587 IPv4)", messageId: info?.messageId };
};

/**
 * Single Unified SendEmail Helper with Dual-Provider Fallback Architecture
 */
const sendEmail = async ({ to, subject, html, text }) => {
  const config = await getEmailConfig();

  // Try Provider 1: Brevo HTTPS API (if API Key provided)
  if (config.brevoApiKey) {
    try {
      const result = await sendViaBrevoHttpApi({
        brevoApiKey: config.brevoApiKey,
        senderEmail: config.senderEmail,
        to,
        subject,
        html,
        text,
      });
      console.log(`[Mailer] Email sent successfully via Brevo HTTPS API`);
      return result;
    } catch (brevoErr) {
      console.warn(`[Mailer] Brevo HTTPS API failed (${brevoErr.message}). Attempting fallback to SMTP...`);
    }
  }

  // Try Provider 2: Nodemailer SMTP
  try {
    const result = await sendViaNodemailerSmtp({
      senderEmail: config.senderEmail,
      smtpUser: config.smtpUser,
      smtpPass: config.smtpPass,
      to,
      subject,
      html,
      text,
    });
    console.log(`[Mailer] Email sent successfully via Nodemailer SMTP`);
    return result;
  } catch (smtpErr) {
    console.error(`[Mailer] Email delivery failed: ${smtpErr.message}`);
    return { success: false, error: smtpErr.message, simulated: !config.smtpPass && !config.brevoApiKey };
  }
};

/**
 * Master Responsive HTML Email Shell
 */
const buildMasterShell = ({ title, preheader, centerContent, senderEmail }) => {
  const currentYear = new Date().getFullYear();
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  return `
<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title || "MARBLEX Security"}</title>
<style>
:root{box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}
@media(max-width:480px){
  .pad{padding-left:18px!important;padding-right:18px!important}
  .dg{width:38px!important;height:50px!important;font-size:24px!important;line-height:50px!important}
  .soc-link{font-size:11px!important;padding:5px 8px!important;}
  .soc-link img{width:14px!important;height:14px!important;}
}
</style></head>
<body style="margin:0;padding:0;background:#e9eef2;font-family:'Segoe UI',Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#e9eef2;padding:36px 12px;">
<tr><td align="center">

<!-- preheader -->
<div style="display:none;max-height:0;overflow:hidden;">${preheader || ""}</div>

<table role="presentation" width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #dbe4ea;box-shadow:0 10px 30px rgba(11,47,60,0.06);">

<!-- top accent -->
<tr><td style="height:5px;background:#ff6b47;background-image:linear-gradient(90deg,#0b2f3c,#ff6b47);font-size:0;line-height:0;">&nbsp;</td></tr>

<!-- header -->
<tr><td align="center" class="pad" style="padding:34px 40px 8px;">
  <table role="presentation" cellpadding="0" cellspacing="0"><tr>
    <td style="padding-right:12px;vertical-align:middle;">
      <img src="${ICONS.logo}" alt="MARBLEX" width="44" height="38" style="display:block;border:0;outline:none;text-decoration:none;object-fit:contain;vertical-align:middle;" />
    </td>
    <td style="font-size:30px;font-weight:800;letter-spacing:5px;color:#0b2f3c;vertical-align:middle;">MAR<span style="color:#ff6b47;">BLEX</span></td>
  </tr></table>
  <div style="font-size:10.5px;letter-spacing:3px;color:#7a8c99;margin-top:6px;font-weight:700;">CONSTRUCTION CHEMICAL &amp; RUBBER INDUSTRY</div>
</td></tr>

<tr><td class="pad" style="padding:20px 40px 0;"><div style="height:1px;background:#e6edf1;"></div></td></tr>

<!-- Center Content (Dynamic) -->
${centerContent}

<!-- Footer with Real Branded Social Media Icons -->
<tr><td align="center" style="background:#f4f8fa;padding:26px 20px;border-top:1px solid #e6edf1;font-size:12px;line-height:1.8;color:#7a8c99;">
  
  <!-- Clean Social Media Buttons Table -->
  <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto 16px auto;">
    <tr>
      <td style="padding:0 4px;">
        <a href="${PORTAL_HOME_URL}" target="_blank" class="soc-link" style="display:inline-block;padding:7px 12px;background:#ffffff;border:1px solid #dbe4ea;border-radius:9px;color:#0b2f3c;text-decoration:none;font-weight:700;font-size:12px;line-height:16px;">
          <img src="${ICONS.website}" alt="" width="16" height="16" style="vertical-align:middle;margin-right:5px;border:0;display:inline-block;" />Website
        </a>
      </td>
      <td style="padding:0 4px;">
        <a href="https://facebook.com" target="_blank" class="soc-link" style="display:inline-block;padding:7px 12px;background:#ffffff;border:1px solid #dbe4ea;border-radius:9px;color:#1877f2;text-decoration:none;font-weight:700;font-size:12px;line-height:16px;">
          <img src="${ICONS.facebook}" alt="" width="16" height="16" style="vertical-align:middle;margin-right:5px;border:0;display:inline-block;" />Facebook
        </a>
      </td>
      <td style="padding:0 4px;">
        <a href="https://instagram.com" target="_blank" class="soc-link" style="display:inline-block;padding:7px 12px;background:#ffffff;border:1px solid #dbe4ea;border-radius:9px;color:#e1306c;text-decoration:none;font-weight:700;font-size:12px;line-height:16px;">
          <img src="${ICONS.instagram}" alt="" width="16" height="16" style="vertical-align:middle;margin-right:5px;border:0;display:inline-block;" />Instagram
        </a>
      </td>
      <td style="padding:0 4px;">
        <a href="https://wa.me/923000000000" target="_blank" class="soc-link" style="display:inline-block;padding:7px 12px;background:#ffffff;border:1px solid #dbe4ea;border-radius:9px;color:#16a34a;text-decoration:none;font-weight:700;font-size:12px;line-height:16px;">
          <img src="${ICONS.whatsapp}" alt="" width="16" height="16" style="vertical-align:middle;margin-right:5px;border:0;display:inline-block;" />WhatsApp
        </a>
      </td>
    </tr>
  </table>

  <strong style="color:#0b2f3c;">MARBLEX Chemical &amp; Rubber Industry</strong><br>
  40-Ferozpur Road, Lahore, Pakistan &nbsp;·&nbsp; <a href="mailto:${supportEmail}" style="color:#0b2f3c;text-decoration:none;">${supportEmail}</a><br>
  <span style="color:#9aa9b4;">Automated security notification. Please do not reply.<br>© ${currentYear} MARBLEX. All rights reserved.</span>
</td></tr>

</table>
</td></tr></table>
</body></html>
  `.trim();
};

/**
 * 1. OTP / 2FA Email Template Generator
 */
const otpEmailTemplate = ({ name, code, purpose = "Account 2FA Verification", requestedAt, expiresMinutes = 10, senderEmail }) => {
  const safeName = name || "Valued Client";
  const safeDate = requestedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  // Generate 6 individual digit boxes
  const digitBoxes = String(code)
    .split("")
    .map(
      (digit) =>
        `<td style="padding:0 4px;"><div class="dg" style="width:46px;height:58px;line-height:58px;text-align:center;font-size:30px;font-weight:700;font-family:Consolas,'Courier New',monospace;color:#0b2f3c;background:#ffffff;border-radius:10px;border-bottom:3px solid #ff6b47;">${digit}</div></td>`
    )
    .join("");

  const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eaf7f0;color:#1a8a55;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">SECURE SIGN-IN</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">Verify your identity</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${safeName}</strong>, use the code below to complete your sign-in to the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
</td></tr>

<!-- code -->
<tr><td class="pad" style="padding:26px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b2f3c;border-radius:16px;">
  <tr><td align="center" style="padding:26px 12px 8px;font-size:11px;letter-spacing:3px;color:#8fb3c0;font-weight:700;">ONE-TIME PASSCODE</td></tr>
  <tr><td align="center" style="padding:6px 8px 4px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      ${digitBoxes}
    </tr></table>
  </td></tr>
  <tr><td align="center" style="padding:14px 12px 24px;font-size:13px;color:#cfe2ea;">Expires in <strong style="color:#ff8a6b;">${expiresMinutes} minutes</strong> &nbsp;·&nbsp; Single use only</td></tr>
  </table>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Purpose</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${purpose}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Requested at</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${safeDate}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Never share this code.</strong> MARBLEX staff will never ask for it. If you didn't request it, contact <a href="mailto:${supportEmail}" style="color:#d94a25;font-weight:700;">${supportEmail}</a> right away.
  </td></tr></table>
</td></tr>
  `;

  return buildMasterShell({
    title: `MARBLEX – Verification Code: ${code}`,
    preheader: `Your MARBLEX verification code is ${code}. It expires in ${expiresMinutes} minutes.`,
    centerContent,
    senderEmail: supportEmail,
  });
};

/**
 * 2. Welcome Email Template Generator
 */
const welcomeEmailTemplate = ({ name, email, requestedAt, senderEmail }) => {
  const safeName = name || "Valued Client";
  const safeDate = requestedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eaf7f0;color:#1a8a55;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">ACCOUNT ACTIVATED</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">Welcome to MARBLEX</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${safeName}</strong>, your account has been successfully verified on the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
</td></tr>

<!-- feature banner -->
<tr><td class="pad" style="padding:24px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b2f3c;border-radius:16px;padding:24px 20px;color:#ffffff;text-align:center;">
    <tr><td>
      <div style="font-size:18px;font-weight:800;color:#ffffff;margin-bottom:6px;">Your Construction &amp; Rubber Partner</div>
      <p style="margin:0 0 16px 0;font-size:13px;color:#cfe2ea;line-height:1.5;">Access our full chemical catalog, place wholesale orders, and connect with technical specialists.</p>
      <a href="${PORTAL_LOGIN_URL}" target="_blank" style="display:inline-block;background:#ff6b47;color:#ffffff;padding:10px 24px;border-radius:8px;font-weight:700;font-size:13px;text-decoration:none;">Go to Client Portal</a>
    </td></tr>
  </table>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Registered Email</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${email || ""}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Joined On</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${safeDate}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Account Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active &amp; Verified</td></tr>
  </table>
</td></tr>

<!-- help card -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#5a6b79;">
    Need help getting started or technical product datasheets? Contact our client desk at <a href="mailto:${supportEmail}" style="color:#0b2f3c;font-weight:700;">${supportEmail}</a>.
  </td></tr></table>
</td></tr>
  `;

  return buildMasterShell({
    title: "Welcome to MARBLEX Client Portal",
    preheader: `Welcome ${safeName}! Your MARBLEX portal account is now active.`,
    centerContent,
    senderEmail: supportEmail,
  });
};

/**
 * 3. Login Alert Email Template Generator
 */
const loginAlertEmailTemplate = ({ name, userAgent, requestedAt, senderEmail }) => {
  const safeName = name || "Valued Client";
  const safeDate = requestedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eff6ff;color:#0284c7;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">SECURITY NOTIFICATION</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">New Login Detected</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${safeName}</strong>, a new sign-in was recorded on your <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a> account.</p>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Time</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${safeDate}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Device / Client</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${userAgent || "Web Browser"}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Successful 2FA Auth</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Don't recognize this activity?</strong> If this wasn't you, please change your password immediately or contact <a href="mailto:${supportEmail}" style="color:#d94a25;font-weight:700;">${supportEmail}</a>.
  </td></tr></table>
</td></tr>
  `;

  return buildMasterShell({
    title: "New Sign-in to your MARBLEX Account",
    preheader: `New login detected on your MARBLEX Account at ${safeDate}`,
    centerContent,
    senderEmail: supportEmail,
  });
};

/**
 * 4. Password Reset Email Template Generator
 */
const passwordResetEmailTemplate = ({ name, code, requestedAt, expiresMinutes = 10, senderEmail }) => {
  const safeName = name || "Valued Client";
  const safeDate = requestedAt || new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  const digitBoxes = String(code)
    .split("")
    .map(
      (digit) =>
        `<td style="padding:0 4px;"><div class="dg" style="width:46px;height:58px;line-height:58px;text-align:center;font-size:30px;font-weight:700;font-family:Consolas,'Courier New',monospace;color:#0b2f3c;background:#ffffff;border-radius:10px;border-bottom:3px solid #ff6b47;">${digit}</div></td>`
    )
    .join("");

  const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#fff1f2;color:#e11d48;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">PASSWORD RESET</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">Reset your password</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${safeName}</strong>, use the single-use recovery code below to reset your password on the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
</td></tr>

<!-- code -->
<tr><td class="pad" style="padding:26px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0b2f3c;border-radius:16px;">
  <tr><td align="center" style="padding:26px 12px 8px;font-size:11px;letter-spacing:3px;color:#8fb3c0;font-weight:700;">PASSWORD RESET CODE</td></tr>
  <tr><td align="center" style="padding:6px 8px 4px;">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      ${digitBoxes}
    </tr></table>
  </td></tr>
  <tr><td align="center" style="padding:14px 12px 24px;font-size:13px;color:#cfe2ea;">Expires in <strong style="color:#ff8a6b;">${expiresMinutes} minutes</strong> &nbsp;·&nbsp; Single use only</td></tr>
  </table>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Purpose</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">Password Reset Request</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Requested at</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${safeDate}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Didn't request a password reset?</strong> Please ignore this message. Your password will remain unchanged, or contact <a href="mailto:${supportEmail}" style="color:#d94a25;font-weight:700;">${supportEmail}</a> immediately.
  </td></tr></table>
</td></tr>
  `;

  return buildMasterShell({
    title: `MARBLEX – Password Reset Code: ${code}`,
    preheader: `Your MARBLEX password reset code is ${code}. It expires in ${expiresMinutes} minutes.`,
    centerContent,
    senderEmail: supportEmail,
  });
};

/**
 * 5. Contact / Inquiry Reply Template Generator
 */
const contactReplyEmailTemplate = ({ name, question, reply, requestedAt, senderEmail }) => {
  const safeName = name || "Valued Client";
  const supportEmail = senderEmail || "Marblexpak@gmail.com";

  const centerContent = `
<!-- title -->
<tr><td class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eff6ff;color:#0284c7;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;margin-bottom:12px;">CUSTOMER SUPPORT</div>
  <h1 style="margin:0 0 14px 0;font-size:24px;line-height:1.3;color:#0b2f3c;font-weight:800;">Response to Your Inquiry</h1>
  <p style="margin:0 0 20px 0;font-size:14px;line-height:1.6;color:#5a6b79;">Dear <strong style="color:#0b2f3c;">${safeName}</strong>, thank you for reaching out to MARBLEX. Here is our response:</p>

  <!-- Question Box -->
  <div style="background:#f8fafc;border-left:4px solid #94a3b8;border-radius:6px;padding:14px 16px;margin-bottom:16px;">
    <p style="margin:0 0 4px 0;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#64748b;">Your Message:</p>
    <p style="margin:0;font-size:13px;color:#334155;line-height:1.5;font-style:italic;">"${question || ""}"</p>
  </div>

  <!-- Reply Box -->
  <div style="background:#eff6ff;border-left:4px solid #0284c7;border-radius:8px;padding:16px 18px;margin-bottom:20px;">
    <p style="margin:0 0 6px 0;font-weight:800;font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#0369a1;">MARBLEX Response:</p>
    <p style="margin:0;font-size:14px;color:#0f172a;line-height:1.6;white-space:pre-line;">${reply || ""}</p>
  </div>

  <p style="margin:0 0 24px 0;font-size:13px;line-height:1.6;color:#64748b;">
    If you have any further questions, please reply directly to this email or visit our <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#ff6b47;font-weight:700;text-decoration:none;">Client Portal</a>.
  </p>
</td></tr>
  `;

  return buildMasterShell({
    title: "MARBLEX Support Response",
    preheader: "Response to your inquiry from MARBLEX Support",
    centerContent,
    senderEmail: supportEmail,
  });
};

// ==========================================
// APPLICATION EXPORTS (Domain Dispatchers)
// ==========================================

const send2FACodeEmail = async (toEmail, code, userName = "Valued Client", purpose = "Account 2FA Verification") => {
  const config = await getEmailConfig();
  const requestedAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";

  const html = otpEmailTemplate({
    name: userName,
    code,
    purpose,
    requestedAt,
    expiresMinutes: 10,
    senderEmail: config.senderEmail,
  });

  const text = `
MARBLEX CONSTRUCTION CHEMICAL & RUBBER INDUSTRY
Verification Code: ${code}
================================================
Hello ${userName},

Your single-use verification code for the MARBLEX Client Portal is: ${code}

• Purpose: ${purpose}
• Validity: 10 minutes
• Requested At: ${requestedAt}

Never share this code with anyone. MARBLEX staff will never ask for it.
Support: ${config.senderEmail}
  `.trim();

  return sendEmail({
    to: toEmail,
    subject: `MARBLEX Verification Code: ${code}`,
    html,
    text,
  });
};

const sendWelcomeEmail = async (toEmail, userName = "Valued Client") => {
  const config = await getEmailConfig();
  const requestedAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";

  const html = welcomeEmailTemplate({
    name: userName,
    email: toEmail,
    requestedAt,
    senderEmail: config.senderEmail,
  });

  return sendEmail({
    to: toEmail,
    subject: "Welcome to MARBLEX – Your Account is Ready",
    html,
    text: `Welcome to MARBLEX! Your account is active. Visit portal: ${PORTAL_LOGIN_URL}`,
  });
};

const sendLoginAlertEmail = async (toEmail, userName = "Valued Client", meta = {}) => {
  const config = await getEmailConfig();
  const requestedAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";

  const html = loginAlertEmailTemplate({
    name: userName,
    userAgent: meta.userAgent || "Web Browser",
    requestedAt,
    senderEmail: config.senderEmail,
  });

  return sendEmail({
    to: toEmail,
    subject: "MARBLEX Security: New Sign-in to Your Account",
    html,
    text: `New login recorded on your MARBLEX account at ${requestedAt}. If this wasn't you, contact ${config.senderEmail}`,
  });
};

const sendPasswordResetEmail = async (toEmail, code, userName = "Valued Client") => {
  const config = await getEmailConfig();
  const requestedAt = new Date().toLocaleString("en-US", { timeZone: "Asia/Karachi", dateStyle: "medium", timeStyle: "short" }) + " (PKT)";

  const html = passwordResetEmailTemplate({
    name: userName,
    code,
    requestedAt,
    expiresMinutes: 10,
    senderEmail: config.senderEmail,
  });

  return sendEmail({
    to: toEmail,
    subject: `MARBLEX Password Reset: ${code}`,
    html,
    text: `Your password reset code is: ${code}. Valid for 10 minutes.`,
  });
};

const sendContactReplyEmail = async (toEmail, userName, question, reply) => {
  const config = await getEmailConfig();

  const html = contactReplyEmailTemplate({
    name: userName,
    question,
    reply,
    senderEmail: config.senderEmail,
  });

  return sendEmail({
    to: toEmail,
    subject: "MARBLEX Support Response",
    html,
    text: `Dear ${userName},\n\nYour Question:\n${question}\n\nOur Reply:\n${reply}\n\nSupport: ${config.senderEmail}`,
  });
};

module.exports = {
  sendEmail,
  send2FACodeEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
  sendContactReplyEmail,
  otpEmailTemplate,
  welcomeEmailTemplate,
  loginAlertEmailTemplate,
  passwordResetEmailTemplate,
  contactReplyEmailTemplate,
};
