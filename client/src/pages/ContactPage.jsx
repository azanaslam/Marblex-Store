import { useState } from "react";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import LocalPhoneOutlinedIcon from "@mui/icons-material/LocalPhoneOutlined";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { http } from "../api/http";

export const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await http.post("/contact", formData);
      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen pb-24 px-4 sm:px-6 lg:px-8 pt-8">
      {/* Header */}
      <div className="text-center mb-16 max-w-2xl mx-auto">
        <span className="inline-block py-1.5 px-4 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] font-bold text-xs tracking-widest uppercase mb-4 border border-[#ff6b4a]/20">
          Get In Touch
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#0f1929] mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          Contact <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73]">MARBLEX Desk</span>
        </h1>
        <p className="text-base md:text-lg text-[#565e69] font-normal leading-relaxed">
          Request technical datasheets, site consultations, or customized quotations for large-scale construction projects.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 5 Cols: Contact Channels */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-7 rounded-3xl border border-[#e0e6ed] card-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#0a3d52]/10 text-[#0a3d52] flex items-center justify-center shrink-0">
              <LocationOnOutlinedIcon />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#565e69] mb-1 font-subheading">Plant & Headquarters</h4>
              <p className="text-base font-bold text-[#0f1929]">40-Ferozpur Road, Industrial Area, Lahore, Pakistan</p>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#e0e6ed] card-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ff6b4a]/10 text-[#ff6b4a] flex items-center justify-center shrink-0">
              <LocalPhoneOutlinedIcon />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#565e69] mb-1 font-subheading">Direct Sales Hotline</h4>
              <a href="tel:0348-111-66-11" className="text-base font-bold text-[#0f1929] hover:text-[#ff6b4a] transition-colors">
                +92 348 111 6611
              </a>
            </div>
          </div>

          <div className="bg-white p-7 rounded-3xl border border-[#e0e6ed] card-shadow flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <MailOutlineOutlinedIcon />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#565e69] mb-1 font-subheading">Corporate Inquiry</h4>
              <a href="mailto:Marblexpak@gmail.com" className="text-base font-bold text-[#0f1929] hover:text-[#ff6b4a] transition-colors break-all">
                Marblexpak@gmail.com
              </a>
            </div>
          </div>

          {/* Quick WhatsApp Card */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-7 rounded-3xl text-white shadow-xl flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold">WhatsApp Engineering Desk</h4>
              <p className="text-xs text-emerald-100 mt-1">Instant replies during business hours</p>
            </div>
            <a
              href="https://wa.me/923481116611?text=Hello%20MARBLEX%2C%20I%20have%20an%20inquiry."
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 rounded-xl bg-white text-emerald-800 font-bold text-xs uppercase tracking-wider hover:bg-emerald-50 shadow-md transition-all active:scale-95"
            >
              <WhatsAppIcon sx={{ fontSize: 16 }} className="mr-1 inline" /> Chat
            </a>
          </div>
        </div>

        {/* Right 7 Cols: Interactive Form */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-12 rounded-3xl border border-[#e0e6ed] card-shadow">
          {success ? (
            <div className="flex flex-col items-center justify-center text-center py-12">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6 border border-emerald-200 shadow-md">
                <CheckCircleRoundedIcon sx={{ fontSize: 44 }} />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#0a3d52] mb-3" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Inquiry Transmitted</h3>
              <p className="text-[#565e69] text-sm sm:text-base mb-8 max-w-md">
                Thank you for contacting MARBLEX. Our chemical and sales specialists will review your requirements and respond within 24 hours.
              </p>
              <button 
                onClick={() => setSuccess(false)}
                className="btn-3d-navy px-8 py-3 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
              >
                Send Another Inquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-bold text-[#0a3d52] uppercase tracking-wider mb-2 font-subheading">Your Full Name</label>
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Tariq Mehmood"
                    className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f1929] focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0a3d52] uppercase tracking-wider mb-2 font-subheading">Email Address</label>
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="tariq@construction.com"
                    className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f1929] focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#0a3d52] uppercase tracking-wider mb-2 font-subheading">Project Subject / Product</label>
                <input 
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Waterstop rubber quote for 2500m joint"
                  className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f1929] focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0a3d52] uppercase tracking-wider mb-2 font-subheading">Detailed Specifications / Inquiry</label>
                <textarea 
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Provide project details, estimated quantity, delivery site, and technical requirements..."
                  className="w-full bg-[#f5f7fa] border border-[#e0e6ed] rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0f1929] focus:bg-white focus:outline-none focus:border-[#ff6b4a] focus:ring-4 focus:ring-[#ff6b4a]/10 transition-all resize-none"
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-3d-accent py-4 rounded-xl text-white font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                {loading ? "Transmitting..." : (
                  <>Send Direct Message <SendRoundedIcon sx={{ fontSize: 18 }} /></>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
