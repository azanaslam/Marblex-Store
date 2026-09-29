const ContactRequest = require("../models/ContactRequest");
const Config = require("../models/Config");
const nodemailer = require("nodemailer");

exports.submitRequest = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;
    const newRequest = new ContactRequest({ name, email, phone, subject, message });
    await newRequest.save();
    res.status(201).json({ success: true, message: "Request submitted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await ContactRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.replyToRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    const request = await ContactRequest.findById(id);
    if (!request) {
      return res.status(404).json({ success: false, message: "Request not found" });
    }

    // Update request with reply
    request.reply = reply;
    request.repliedAt = Date.now();
    request.status = "responded";
    await request.save();

    // Fetch Email Configuration from DB
    const config = await Config.findOne({ key: "email_settings" });
    const emailUser = config?.value?.user || process.env.EMAIL_USER || "Sales@themarflexgroup.com";
    const emailPass = config?.value?.pass || process.env.EMAIL_PASS;

    if (!emailPass) {
      console.warn("Email password not configured. Email not sent.");
      return res.json({ success: true, message: "Reply saved but email not sent (credentials missing)" });
    }

    // Create a transporter dynamically
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      family: 4,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2",
      },
    });

    const path = require("path");
    const fs = require("fs");
    const logoPath = path.join(__dirname, "../assets/logo-icon-transparent.png");
    const logoExists = fs.existsSync(logoPath);
    const attachments = [];
    if (logoExists) {
      attachments.push({
        filename: "marblex-logo.png",
        path: logoPath,
        cid: "marblex-logo",
      });
    }

    const currentYear = new Date().getFullYear();

    const plainTextReply = `
MARBLEX CHEMICAL & RUBBER - CUSTOMER SUPPORT
=====================================================

Dear ${request.name},

Thank you for reaching out to MARBLEX. We have reviewed your inquiry.

YOUR QUESTION:
${request.message}

MARBLEX RESPONSE:
${reply}

If you have any further questions, feel free to reply to this email or visit our client portal.

Warm Regards,
MARBLEX Customer Support Team
40-Ferozpur Road, Lahore, Pakistan
Email: ${emailUser}
© ${currentYear} MARBLEX. All rights reserved.
    `.trim();

    // Send Email
    const mailOptions = {
      from: `"MARBLEX Customer Support" <${emailUser}>`,
      to: request.email,
      replyTo: emailUser,
      subject: `MARBLEX Support Response: ${request.subject || "Your Inquiry"}`,
      text: plainTextReply,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>MARBLEX Customer Support</title>
</head>
<body style="margin: 0; padding: 0; width: 100%; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="580" style="max-width: 580px; width: 100%; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <tr>
            <td style="height: 4px; background: linear-gradient(90deg, #0a3d52 0%, #ff6b4a 50%, #00d2ff 100%);"></td>
          </tr>

          <tr>
            <td style="background: #0a2540; padding: 24px 30px; text-align: center; color: #ffffff;">
              ${
                logoExists
                  ? `<img src="cid:marblex-logo" alt="MARBLEX" width="48" height="48" style="display: block; margin: 0 auto 10px auto; object-fit: contain;" />`
                  : ``
              }
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; letter-spacing: 1px; color: #ffffff; text-transform: uppercase;">
                MAR<span style="color: #ff6b4a;">BLEX</span>
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; font-weight: 700;">
                Chemical &amp; Rubber Industry
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding: 32px 30px; color: #1e293b;">
              <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #0a3d52; font-weight: 800;">
                Response to Your Inquiry
              </h2>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #475569;">
                Dear <strong style="color: #0f172a;">${request.name}</strong>,<br/>
                Thank you for contacting MARBLEX. Our technical and support team has reviewed your message:
              </p>
              
              <!-- Original Query Box -->
              <div style="background: #f8fafc; padding: 14px 18px; border-left: 4px solid #94a3b8; border-radius: 6px; margin: 18px 0;">
                <p style="margin: 0 0 4px 0; font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; color: #64748b;">Your Inquiry:</p>
                <p style="margin: 0; font-size: 13px; color: #334155; line-height: 1.5; font-style: italic;">"${request.message}"</p>
              </div>
              
              <!-- Team Response Box -->
              <div style="background: #eff6ff; padding: 18px 20px; border-left: 4px solid #0284c7; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 6px 0; font-weight: 800; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #0369a1;">MARBLEX Team Response:</p>
                <p style="margin: 0; font-size: 14px; color: #0f172a; line-height: 1.6; white-space: pre-line;">${reply}</p>
              </div>
              
              <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 1.6; color: #475569;">
                If you have any further questions, feel free to reply directly to this email or reach us at <a href="mailto:${emailUser}" style="color: #ff6b4a; font-weight: 700; text-decoration: none;">${emailUser}</a>.
              </p>
              
              <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9;">
                <p style="margin: 0; font-size: 13px; font-weight: 700; color: #0a3d52;">Warm regards,</p>
                <p style="margin: 2px 0 0 0; font-size: 13px; color: #64748b;">MARBLEX Customer &amp; Technical Support Team</p>
              </div>
            </td>
          </tr>

          <tr>
            <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0; font-size: 11px; color: #94a3b8; line-height: 1.5;">
                40-Ferozpur Road, Lahore, Pakistan • <a href="mailto:${emailUser}" style="color: #0a3d52; text-decoration: none; font-weight: 600;">${emailUser}</a><br/>
                © ${currentYear} MARBLEX — Chemical &amp; Rubber. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
      attachments: attachments,
      headers: {
        "X-Priority": "3",
        "Importance": "normal",
        "X-Auto-Response-Suppress": "OOF, AutoReply",
      },
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailError) {
      console.error("Failed to send email:", mailError);
    }

    res.json({ success: true, message: "Reply saved and email sent" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRequest = async (req, res) => {
  try {
    await ContactRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Request deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
