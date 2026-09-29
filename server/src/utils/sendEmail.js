const nodemailer = require("nodemailer");
const Config = require("../models/Config");

const PORTAL_LOGIN_URL = "https://marblex-shop.vercel.app/login";
const PORTAL_HOME_URL = "https://marblex-shop.vercel.app/";

// Hosted High-Speed Web Assets (No email attachments = No attachment pills in Gmail list)
const ICONS = {
  logo: "https://marblex-shop.vercel.app/logo.png",
  website: "https://cdn-icons-png.flaticon.com/512/1006/1006771.png",
  facebook: "https://cdn-icons-png.flaticon.com/512/5968/5968764.png",
  instagram: "https://cdn-icons-png.flaticon.com/512/3955/3955024.png",
  whatsapp: "https://cdn-icons-png.flaticon.com/512/3670/3670051.png",
};

const getTransporter = async () => {
  const config = await Config.findOne({ key: "email_settings" }).lean();
  const rawUser = config?.value?.user || process.env.EMAIL_USER || "Marblexpak@gmail.com";
  const rawPass = config?.value?.pass || process.env.EMAIL_PASS;

  const emailUser = String(rawUser).trim();
  const emailPass = rawPass ? String(rawPass).replace(/\s+/g, "").trim() : "";

  if (!emailPass) {
    return { transporter: null, emailUser, emailPass: null };
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: emailUser,
      pass: emailPass,
    },
    connectionTimeout: 5000,
    greetingTimeout: 5000,
    socketTimeout: 7000,
    tls: {
      rejectUnauthorized: false,
    },
  });

  return { transporter, emailUser, emailPass };
};


// Reusable Master HTML Email Shell with Hosted Icons (Clean Inbox Preview)
const buildEmailTemplate = ({ title, preheader, centerContent }) => {
  const currentYear = new Date().getFullYear();

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
      <img src="https://marblex-shop.vercel.app/logo-icon-transparent.png" alt="MARBLEX" width="44" height="38" style="display:block;border:0;outline:none;text-decoration:none;object-fit:contain;vertical-align:middle;" />
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
  40-Ferozpur Road, Lahore, Pakistan &nbsp;·&nbsp; <a href="mailto:Marblexpak@gmail.com" style="color:#0b2f3c;text-decoration:none;">Marblexpak@gmail.com</a><br>
  <span style="color:#9aa9b4;">Automated security notification. Please do not reply.<br>© ${currentYear} MARBLEX. All rights reserved.</span>
</td></tr>

</table>
</td></tr></table>
</body></html>
  `.trim();
};

// 1. Send 2FA Verification Code Email (Register or Login Verification)
const send2FACodeEmail = async (toEmail, code, userName = "Valued Client", purpose = "Account 2FA Verification") => {
  try {
    const { transporter, emailUser, emailPass } = await getTransporter();

    const formattedDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });

    console.log(`\n==================================================`);
    console.log(`[MARBLEX 2FA SECURITY CODE]`);
    console.log(`Recipient : ${toEmail}`);
    console.log(`Sender    : ${emailUser}`);
    console.log(`Code      : ${code}`);
    console.log(`Valid for : 10 minutes`);
    console.log(`==================================================\n`);

    if (!emailPass || !transporter) {
      console.warn("[MARBLEX 2FA] SMTP password not set. Code logged to console.");
      return { success: true, simulated: true, code };
    }

    // Generate 6 digit HTML boxes
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
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${userName}</strong>, use the code below to complete your sign-in to the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
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
  <tr><td align="center" style="padding:14px 12px 24px;font-size:13px;color:#cfe2ea;">Expires in <strong style="color:#ff8a6b;">10 minutes</strong> &nbsp;·&nbsp; Single use only</td></tr>
  </table>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Purpose</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${purpose}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Requested at</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${formattedDate} (PKT)</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Never share this code.</strong> MARBLEX staff will never ask for it. If you didn't request it, contact <a href="mailto:${emailUser}" style="color:#d94a25;font-weight:700;">${emailUser}</a> right away.
  </td></tr></table>
</td></tr>
    `;

    const htmlContent = buildEmailTemplate({
      title: `MARBLEX – Verification Code: ${code}`,
      preheader: `Your MARBLEX verification code is ${code}. It expires in 10 minutes.`,
      centerContent,
    });

    const textContent = `
MARBLEX CONSTRUCTION CHEMICAL & RUBBER INDUSTRY
Verification Code: ${code}
================================================
Hello ${userName},

Your single-use verification code for the MARBLEX Client Portal (${PORTAL_LOGIN_URL}) is: ${code}

• Purpose: ${purpose}
• Validity: 10 minutes
• Requested At: ${formattedDate} (PKT)

Never share this code with anyone. MARBLEX staff will never ask for it.
Support: ${emailUser}
    `.trim();

    await transporter.sendMail({
      from: `"MARBLEX Security" <${emailUser}>`,
      to: toEmail,
      replyTo: emailUser,
      subject: `MARBLEX Verification Code: ${code}`,
      text: textContent,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "Importance": "high",
        "X-Entity-Ref-ID": `2FA-${Date.now()}-${code}`,
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    });

    return { success: true, simulated: false, code };
  } catch (err) {
    console.error("[MARBLEX 2FA] Failed to send email via SMTP:", err.message);
    return { success: true, simulated: true, code, error: err.message };
  }
};

// 2. Send Welcome Email (On Account Creation / Verification)
const sendWelcomeEmail = async (toEmail, userName = "Valued Client") => {
  try {
    const { transporter, emailUser, emailPass } = await getTransporter();
    if (!emailPass || !transporter) return { success: true, simulated: true };

    const formattedDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eaf7f0;color:#1a8a55;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">ACCOUNT ACTIVATED</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">Welcome to MARBLEX</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${userName}</strong>, your account has been successfully created and verified on the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
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
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Registered Email</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${toEmail}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Joined On</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${formattedDate} (PKT)</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Account Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active &amp; Verified</td></tr>
  </table>
</td></tr>

<!-- help card -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;border-radius:12px;border:1px solid #e2e8f0;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#5a6b79;">
    Need help getting started or technical product datasheets? Contact our 24/7 client desk at <a href="mailto:${emailUser}" style="color:#0b2f3c;font-weight:700;">${emailUser}</a>.
  </td></tr></table>
</td></tr>
    `;

    const htmlContent = buildEmailTemplate({
      title: "Welcome to MARBLEX Client Portal",
      preheader: `Welcome ${userName}! Your MARBLEX portal account is now active.`,
      centerContent,
    });

    await transporter.sendMail({
      from: `"MARBLEX Team" <${emailUser}>`,
      to: toEmail,
      replyTo: emailUser,
      subject: `Welcome to MARBLEX – Your Account is Ready`,
      html: htmlContent,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[MARBLEX Welcome] Failed to send welcome email:", err.message);
    return { success: false, error: err.message };
  }
};

// 3. Send Login Alert Email (On Every Successful Login)
const sendLoginAlertEmail = async (toEmail, userName = "Valued Client", meta = {}) => {
  try {
    const { transporter, emailUser, emailPass } = await getTransporter();
    if (!emailPass || !transporter) return { success: true, simulated: true };

    const formattedDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });

    const userAgent = meta.userAgent || "Web Browser";

    const centerContent = `
<!-- title -->
<tr><td align="center" class="pad" style="padding:28px 40px 0;">
  <div style="display:inline-block;background:#eff6ff;color:#0284c7;font-size:11px;font-weight:700;letter-spacing:1px;padding:6px 14px;border-radius:999px;">SECURITY NOTIFICATION</div>
  <h1 style="margin:16px 0 10px;font-size:26px;line-height:1.25;color:#0b2f3c;font-weight:800;">New Login Detected</h1>
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${userName}</strong>, a new sign-in was recorded on your <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a> account.</p>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Time</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${formattedDate} (PKT)</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Device / Client</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${userAgent}</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Successful 2FA Auth</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Don't recognize this activity?</strong> If this wasn't you, your account may be compromised. Please secure your account immediately or contact <a href="mailto:${emailUser}" style="color:#d94a25;font-weight:700;">${emailUser}</a>.
  </td></tr></table>
</td></tr>
    `;

    const htmlContent = buildEmailTemplate({
      title: "New Sign-in to your MARBLEX Account",
      preheader: `New login detected on your MARBLEX Account at ${formattedDate}`,
      centerContent,
    });

    await transporter.sendMail({
      from: `"MARBLEX Security" <${emailUser}>`,
      to: toEmail,
      replyTo: emailUser,
      subject: `MARBLEX Security: New Sign-in to Your Account`,
      html: htmlContent,
      headers: {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    });

    return { success: true };
  } catch (err) {
    console.error("[MARBLEX Login Alert] Failed to send login alert:", err.message);
    return { success: false, error: err.message };
  }
};

// 4. Send Password Reset Email
const sendPasswordResetEmail = async (toEmail, code, userName = "Valued Client") => {
  try {
    const { transporter, emailUser, emailPass } = await getTransporter();

    const formattedDate = new Date().toLocaleString("en-US", {
      timeZone: "Asia/Karachi",
      dateStyle: "medium",
      timeStyle: "short",
    });

    if (!emailPass || !transporter) {
      console.warn("[MARBLEX Password Reset] SMTP password not set. Code logged:", code);
      return { success: true, simulated: true, code };
    }

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
  <p style="margin:0;font-size:15px;line-height:1.65;color:#5a6b79;">Hello <strong style="color:#0b2f3c;">${userName}</strong>, use the single-use recovery code below to reset your password on the <a href="${PORTAL_LOGIN_URL}" target="_blank" style="color:#0b2f3c;font-weight:700;text-decoration:underline;">MARBLEX Client Portal</a>.</p>
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
  <tr><td align="center" style="padding:14px 12px 24px;font-size:13px;color:#cfe2ea;">Expires in <strong style="color:#ff8a6b;">10 minutes</strong> &nbsp;·&nbsp; Single use only</td></tr>
  </table>
</td></tr>

<!-- details -->
<tr><td class="pad" style="padding:22px 40px 0;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e3ebef;border-radius:12px;font-size:13px;">
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Purpose</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">Password Reset Request</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;border-bottom:1px solid #eef3f5;">Requested at</td><td align="right" style="padding:12px 16px;color:#1c2b36;font-weight:600;border-bottom:1px solid #eef3f5;">${formattedDate} (PKT)</td></tr>
    <tr><td style="padding:12px 16px;color:#7a8c99;">Status</td><td align="right" style="padding:12px 16px;color:#1a8a55;font-weight:700;">● Active</td></tr>
  </table>
</td></tr>

<!-- warning -->
<tr><td class="pad" style="padding:20px 40px 34px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff6f2;border-radius:12px;border-left:4px solid #ff6b47;">
  <tr><td style="padding:14px 16px;font-size:13px;line-height:1.6;color:#7a3a25;">
    <strong>Didn't request a password reset?</strong> Please ignore this message. Your password will remain unchanged, or contact <a href="mailto:${emailUser}" style="color:#d94a25;font-weight:700;">${emailUser}</a> immediately.
  </td></tr></table>
</td></tr>
    `;

    const htmlContent = buildEmailTemplate({
      title: `MARBLEX – Password Reset Code: ${code}`,
      preheader: `Your MARBLEX password reset code is ${code}. It expires in 10 minutes.`,
      centerContent,
    });

    await transporter.sendMail({
      from: `"MARBLEX Security" <${emailUser}>`,
      to: toEmail,
      replyTo: emailUser,
      subject: `MARBLEX Password Reset: ${code}`,
      html: htmlContent,
      headers: {
        "X-Priority": "1",
        "Importance": "high",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    });

    return { success: true, simulated: false, code };
  } catch (err) {
    console.error("[MARBLEX Password Reset] Failed to send email:", err.message);
    return { success: true, simulated: true, code, error: err.message };
  }
};

module.exports = {
  send2FACodeEmail,
  sendWelcomeEmail,
  sendLoginAlertEmail,
  sendPasswordResetEmail,
};
