import { useState } from "react";
import { Container, Box, Typography, Grid } from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import SendIcon from "@mui/icons-material/Send";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
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
    <div className="bg-white min-h-screen relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-60"></div>

      <Container maxWidth="lg" className="relative z-10 pt-16 pb-24">
        {/* Header Section */}
        <Box className="text-center mb-16">
          <span className="inline-block py-1 px-4 rounded-full bg-rose-50 text-rose-600 font-black text-[10px] tracking-widest uppercase mb-4 border border-rose-100 shadow-sm">
            Contact Us
          </span>
          <Typography variant="h1" className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Get in <span className="text-rose-600">Touch</span>
          </Typography>
          <Typography className="text-base md:text-lg text-slate-500 font-medium max-w-xl mx-auto leading-relaxed text-center">
            Have a project in mind or need professional advice? Reach out to our specialized team across Pakistan.
          </Typography>
        </Box>

        <Grid container spacing={4} alignItems="stretch">
          {/* Contact Info Cards */}
          <Grid item xs={12} md={5}>
            <div className="flex flex-col h-full gap-4">
              <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-200 transition-all duration-500 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition-all duration-500">
                  <LocationOnIcon />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Our Headquarters</h4>
                <p className="text-xl font-black text-slate-900 leading-tight">40-Ferozpur Road, Lahore, Pakistan</p>
              </div>

              <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-500 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                  <PhoneIcon />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Customer Hotline</h4>
                <p className="text-xl font-black text-slate-900 leading-tight">0348-111-66-11</p>
              </div>

              <div className="group bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all duration-500 flex flex-col items-center text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-500">
                  <EmailIcon />
                </div>
                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Support Email</h4>
                <p className="text-xl font-black text-slate-900 leading-tight">Sales@themarflexgroup.com</p>
              </div>
            </div>
          </Grid>

          {/* Contact Form */}
          <Grid item xs={12} md={7}>
            <div className="bg-slate-900 p-8 md:p-10 rounded-[3rem] shadow-2xl shadow-slate-900/20 relative overflow-hidden h-full flex flex-col justify-center">
              <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              {success ? (
                <div className="flex flex-col items-center justify-center text-center py-6">
                  <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-8 border border-emerald-500/20">
                    <VerifiedUserIcon sx={{ fontSize: 48 }} />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4">Message Sent!</h3>
                  <p className="text-slate-400 font-medium text-lg mb-10 max-w-sm">Thank you for reaching out. Our team will contact you within 24 hours.</p>
                  <button onClick={() => setSuccess(false)} className="bg-white text-slate-900 px-10 py-4 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all shadow-xl">
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-center">Full Name</label>
                      <input 
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-5 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-700 text-center"
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-center">Email Address</label>
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-5 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-700 text-center"
                        placeholder="john@example.com"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-center">Subject</label>
                    <input 
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-5 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-700 text-center"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 block text-center">Your Message</label>
                    <textarea 
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={5}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-7 py-5 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-700 resize-none text-center"
                      placeholder="Describe your project or inquiry..."
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-rose-600 to-rose-500 py-6 rounded-2xl text-white font-black text-lg shadow-2xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:-translate-y-1 active:translate-y-0 transition-all flex items-center justify-center gap-4 disabled:opacity-50"
                  >
                    {loading ? "Transmitting..." : (
                      <>Send Your Message <SendIcon /></>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
};
