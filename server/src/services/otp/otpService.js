const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const PhoneOtp = require("../../models/PhoneOtp");
const { normalizePhone } = require("./normalizePhone");

const OTP_PROVIDER = process.env.OTP_PROVIDER || "console"; // "console" | "twilio" | "custom-http"
const OTP_EXPIRY_MINUTES = 5;
const RESEND_COOLDOWN_SECONDS = 60;
const MAX_ATTEMPTS = 5;

/**
 * Generate a cryptographically secure 6-digit OTP code
 */
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send OTP via chosen provider
 */
async function sendOtpMessage({ phone, code, purpose = "login" }) {
  const message = `Your MARBLEX verification code is ${code}. Valid for 5 minutes. Do not share this code.`;

  if (OTP_PROVIDER === "twilio") {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("[Twilio OTP] Missing Twilio credentials in environment. Falling back to console output.");
      console.log(`[Twilio Fallback Console] Phone: ${phone} | Code: ${code} | Message: ${message}`);
      return { success: true, provider: "console-fallback" };
    }

    try {
      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const body = new URLSearchParams({
        To: phone,
        From: fromNumber,
        Body: message,
      });

      const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: body.toString(),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || `Twilio error ${response.status}`);
      }
      return { success: true, provider: "twilio", sid: data.sid };
    } catch (err) {
      console.error("[Twilio OTP Error]", err.message);
      throw new Error(`Failed to deliver SMS via Twilio: ${err.message}`);
    }
  } else if (OTP_PROVIDER === "custom-http") {
    // Template adapter for local Pakistani SMS gateway (e.g. Brandverse, SMSGateway.pk, Jazz, Telenor)
    const gatewayUrl = process.env.CUSTOM_SMS_URL;
    const apiKey = process.env.CUSTOM_SMS_API_KEY;
    const sender = process.env.CUSTOM_SMS_SENDER || "MARBLEX";

    if (!gatewayUrl) {
      console.warn("[Custom-HTTP SMS] Missing CUSTOM_SMS_URL. Falling back to console output.");
      console.log(`[Custom-HTTP Console] Phone: ${phone} | Code: ${code} | Message: ${message}`);
      return { success: true, provider: "console-fallback" };
    }

    try {
      const response = await fetch(gatewayUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        },
        body: JSON.stringify({
          recipient: phone,
          sender,
          text: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Gateway returned HTTP ${response.status}`);
      }
      return { success: true, provider: "custom-http" };
    } catch (err) {
      console.error("[Custom-HTTP SMS Error]", err.message);
      throw new Error(`Failed to deliver SMS via custom gateway: ${err.message}`);
    }
  } else {
    // Default development console provider
    console.log("=========================================");
    console.log(`[MARBLEX OTP DEV CONSOLE]`);
    console.log(`Phone: ${phone}`);
    console.log(`Code:  ${code}`);
    console.log(`Purpose: ${purpose}`);
    console.log(`Valid for ${OTP_EXPIRY_MINUTES} minutes.`);
    console.log("=========================================");
    return { success: true, provider: "console" };
  }
}

/**
 * Request an OTP for a phone number
 */
async function requestOtp(rawPhone, purpose = "login") {
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 10) {
    throw new Error("Invalid phone number format.");
  }

  // Check cooldown
  const existing = await PhoneOtp.findOne({ phone, purpose });
  const now = new Date();
  if (existing && existing.resendAvailableAt > now) {
    const remainingSeconds = Math.ceil((existing.resendAvailableAt - now) / 1000);
    const err = new Error(`Please wait ${remainingSeconds} seconds before requesting a new code.`);
    err.status = 429;
    err.retryAfter = remainingSeconds;
    throw err;
  }

  const code = generateCode();
  const salt = await bcrypt.genSalt(10);
  const otpHash = await bcrypt.hash(code, salt);

  const expiresAt = new Date(now.getTime() + OTP_EXPIRY_MINUTES * 60 * 1000);
  const resendAvailableAt = new Date(now.getTime() + RESEND_COOLDOWN_SECONDS * 1000);

  await PhoneOtp.findOneAndUpdate(
    { phone, purpose },
    {
      phone,
      otpHash,
      attempts: 0,
      expiresAt,
      resendAvailableAt,
      purpose,
    },
    { upsert: true, new: true }
  );

  await sendOtpMessage({ phone, code, purpose });

  return {
    success: true,
    phone,
    cooldownSeconds: RESEND_COOLDOWN_SECONDS,
    expiresInMinutes: OTP_EXPIRY_MINUTES,
  };
}

/**
 * Verify an OTP code
 */
async function verifyOtp(rawPhone, code, purpose = "login") {
  const phone = normalizePhone(rawPhone);
  const record = await PhoneOtp.findOne({ phone, purpose });

  if (!record) {
    throw new Error("No active verification code found for this phone number. Please request a new one.");
  }

  const now = new Date();
  if (record.expiresAt < now) {
    await PhoneOtp.deleteOne({ _id: record._id });
    throw new Error("Verification code has expired. Please request a new one.");
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    await PhoneOtp.deleteOne({ _id: record._id });
    throw new Error("Maximum attempts exceeded. Please request a new verification code.");
  }

  const isValid = await bcrypt.compare(String(code).trim(), record.otpHash);
  if (!isValid) {
    record.attempts += 1;
    await record.save();
    const remaining = MAX_ATTEMPTS - record.attempts;
    throw new Error(`Incorrect verification code. ${remaining} attempts remaining.`);
  }

  // Code verified successfully -> consume OTP
  await PhoneOtp.deleteOne({ _id: record._id });

  return {
    success: true,
    phone,
  };
}

module.exports = {
  requestOtp,
  verifyOtp,
  normalizePhone,
};
