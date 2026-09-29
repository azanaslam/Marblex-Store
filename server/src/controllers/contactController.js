const ContactRequest = require("../models/ContactRequest");
const { sendContactReplyEmail } = require("../utils/sendEmail");

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

    // Send email using unified mailer (Brevo HTTPS API or SMTP fallback)
    sendContactReplyEmail(request.email, request.name, request.message, reply).catch((mailError) => {
      console.error("[Mailer] Failed to send contact reply:", mailError.message);
    });

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
