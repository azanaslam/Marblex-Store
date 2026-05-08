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
      service: "gmail",
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });

    // Send Email
    const mailOptions = {
      from: `"Marblex Store" <${emailUser}>`,
      to: request.email,
      subject: `Reply to your Inquiry: ${request.subject || "About Us Inquiry"}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #e11d48;">Marblex Store</h2>
          <p>Dear ${request.name},</p>
          <p>Thank you for reaching out to us. We have reviewed your inquiry and here is our response:</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #e11d48; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #555;">Your Question:</p>
            <p style="margin: 5px 0 0 0; color: #333;">${request.message}</p>
          </div>
          
          <div style="background: #fff; padding: 15px; border: 1px solid #eee; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; font-weight: bold; color: #e11d48;">Our Reply:</p>
            <p style="margin: 5px 0 0 0; color: #333;">${reply}</p>
          </div>
          
          <p>Best Regards,<br/><strong>Marblex Store Team</strong></p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #999; text-align: center;">40-Ferozpur Road, Lahore, Pakistan</p>
        </div>
      `,
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
