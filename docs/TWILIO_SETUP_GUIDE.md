# MARBLEX: Twilio & SMS Gateway Setup Guide (Phase 6)

This document provides step-by-step instructions to configure phone OTP verification (SMS / WhatsApp) for MARBLEX contractors and high-value Cash-on-Delivery (COD) orders.

---

## 1. Local / Development Setup (Zero Cost)

In development, `OTP_PROVIDER=console` is enabled by default:
- No Twilio or external gateway account is needed.
- When an OTP is requested, the 6-digit code is printed directly in the server terminal:
  ```
  =========================================
  [MARBLEX OTP DEV CONSOLE]
  Phone: +923001234567
  Code:  492815
  Purpose: login
  Valid for 5 minutes.
  =========================================
  ```

---

## 2. Twilio Setup (Global SMS & WhatsApp)

1. **Sign Up**:
   - Go to [Twilio Console](https://console.twilio.com/) and register an account.
2. **Find API Credentials**:
   - In your dashboard, copy your:
     - **Account SID**: (e.g. `ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
     - **Auth Token**: (e.g. `your_auth_token_here`)
3. **Get a Phone Number**:
   - Navigate to **Phone Numbers** → **Buy a Number**.
   - Select an SMS-capable phone number and copy the number (e.g. `+1234567890`).
4. **Configure Server `.env`**:
   ```bash
   OTP_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   TWILIO_AUTH_TOKEN=your_auth_token_here
   TWILIO_FROM_NUMBER=+1234567890
   ```
5. **Restart Server**:
   - Your backend will now dispatch live SMS codes to contractor mobile numbers worldwide.

---

## 3. Local Pakistani SMS Gateways (`custom-http` Provider)

For low-cost domestic SMS across Pakistan (Jazz, Telenor, Zong, Ufone), MARBLEX supports a universal HTTP adapter:

1. **Recommended Gateways**:
   - **Brandverse / BrandSMS**
   - **SMSGateway.pk**
   - **Telenor Corporate SMS API**
   - **Jazz Business SMS**
2. **Configure Server `.env`**:
   ```bash
   OTP_PROVIDER=custom-http
   CUSTOM_SMS_URL=https://api.your-gateway.com/v1/sms/send
   CUSTOM_SMS_API_KEY=your_gateway_bearer_token
   CUSTOM_SMS_SENDER=MARBLEX
   ```

---

## 4. Cash-on-Delivery (COD) Phone Verification

To eliminate prank or fake orders on high-value industrial deliveries:
```bash
# Enable phone OTP verification for COD orders above threshold (in PKR)
COD_OTP_REQUIRED=true
COD_OTP_THRESHOLD=15000
```
When an order exceeds the threshold (e.g. Rs. 15,000), checkout prompts the buyer for a one-time SMS verification code before dispatch.
