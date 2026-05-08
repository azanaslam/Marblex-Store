import { useState } from "react";
import { Container, Box, Typography, TextField, Button, Grid, Paper, Divider } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SendIcon from "@mui/icons-material/Send";
import BusinessIcon from "@mui/icons-material/Business";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SpeedIcon from "@mui/icons-material/Speed";
import { http } from "../api/http";

export const AboutPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
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
      setFormData({ name: "", email: "", phone: "", message: "" });
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const values = [
    {
      icon: <BusinessIcon sx={{ fontSize: 40, color: '#e11d48' }} />,
      title: "Industry Leadership",
      desc: "Leading the market in construction chemicals and premium car accessories since inception."
    },
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 40, color: '#2563eb' }} />,
      title: "Quality Assurance",
      desc: "Every product and service meets the highest international standards of durability and safety."
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: '#059669' }} />,
      title: "Rapid Execution",
      desc: "Quick turnaround times for project consultations and product deliveries nationwide."
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans overflow-x-hidden">
      {/* Hero Section */}
      <Box sx={{ 
        bgcolor: '#0f172a', 
        color: 'white', 
        pt: { xs: 10, md: 15 }, 
        pb: { xs: 14, md: 20 },
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
        px: 2
      }}>
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#e11d48,transparent_60%)] blur-[100px]"></div>
        </div>
        
        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="overline" sx={{ letterSpacing: 4, fontWeight: 800, color: '#f43f5e', mb: 2, display: 'block', fontSize: { xs: '0.65rem', sm: '0.75rem' } }}>
            SINCE 2010
          </Typography>
          <Typography variant="h1" sx={{ fontWeight: 900, fontSize: { xs: '2rem', sm: '3rem', md: '4.5rem' }, mb: 4, lineHeight: 1.1 }}>
            Innovation in <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">Construction</span> & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-600">Style</span>
          </Typography>
          <Typography variant="h6" sx={{ color: '#94a3b8', fontWeight: 500, lineHeight: 1.8, maxWidth: 800, mx: 'auto', fontSize: { xs: '0.95rem', md: '1.25rem' } }}>
            Marblex is a premier provider of waterproofing solutions and luxury car accessories, blending structural integrity with aesthetic excellence.
          </Typography>
        </Container>
      </Box>

      {/* Story Section */}
      <Container maxWidth="lg" sx={{ mt: { xs: -4, md: -8 }, mb: 12, px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Paper elevation={0} sx={{ p: { xs: 3, sm: 5, md: 8 }, borderRadius: { xs: 4, md: 6 }, border: '1px solid #f1f5f9', height: '100%', shadow: '0 20px 50px -12px rgba(0,0,0,0.05)' }}>
              <Typography variant="h3" sx={{ fontWeight: 900, mb: 3, color: '#1e293b', fontSize: { xs: '1.75rem', md: '3rem' } }}>The Marblex Legacy</Typography>
              <div className="w-20 h-1.5 bg-rose-600 rounded-full mb-8"></div>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 4, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                At Marblex, we don't just sell products; we provide peace of mind. Our specialized waterproofing treatments protect thousands of structures across Pakistan, while our premium car mats bring luxury to every drive.
              </Typography>
              <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.8, mb: 6, fontSize: { xs: '1rem', md: '1.1rem' } }}>
                With over a decade of experience, we have built a reputation for using only the finest chemicals and materials, ensuring that our customers receive nothing but the best.
              </Typography>
              <Button 
                variant="contained" 
                onClick={() => navigate('/catalogs')}
                endIcon={<ArrowForwardIcon />}
                fullWidth={window.innerWidth < 640}
                sx={{ bgcolor: '#e11d48', borderRadius: 2, px: 6, py: 2, fontWeight: 800, textTransform: 'none', fontSize: '1.1rem', '&:hover': { bgcolor: '#be123c' } }}
              >
                Explore Catalog
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ position: 'relative', height: '100%', borderRadius: { xs: 4, md: 6 }, overflow: 'hidden', minHeight: { xs: 300, md: 400 }, border: { xs: '4px solid white', md: '8px solid white' }, shadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <img 
                src="/assets/brochures/Profile_marblex_page_1.jpg" 
                alt="Marblex Quality" 
                className="w-full h-full object-cover"
              />
            </Box>
          </Grid>
        </Grid>

        {/* Values Section */}
        <Box sx={{ py: { xs: 8, md: 15 } }}>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant="overline" sx={{ color: '#f43f5e', fontWeight: 900, letterSpacing: 4, display: 'block', mb: 2, fontSize: { xs: '0.7rem', md: '0.9rem' } }}>
              OUR VALUES
            </Typography>
            <Typography variant="h3" sx={{ fontWeight: 900, color: '#1e293b', mb: 3, fontSize: { xs: '1.75rem', md: '3rem' } }}>Our Core Principles</Typography>
            <Typography variant="body1" sx={{ color: '#64748b', maxWidth: 600, mx: 'auto', fontWeight: 500, fontSize: { xs: '0.9rem', md: '1rem' } }}>
              We are driven by a commitment to excellence, ensuring every project reflects our high standards of quality and integrity.
            </Typography>
          </Box>
          
          <Grid container spacing={3} justifyContent="center">
            {values.map((v, i) => (
              <Grid item xs={12} sm={4} key={i}>
                <div className="group bg-white p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-rose-500/30 transition-all duration-500 h-full flex flex-col items-center text-center max-w-[400px] mx-auto">
                  <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-rose-50 transition-all duration-500 border border-slate-100 group-hover:border-rose-100">
                    {v.icon}
                  </div>
                  <h4 className="text-xl md:text-2xl font-black text-slate-900 mb-4">{v.title}</h4>
                  <p className="text-slate-500 font-medium leading-relaxed text-sm md:text-base">
                    {v.desc}
                  </p>
                </div>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>

      {/* Contact Section */}
      <Box id="contact-form" sx={{ py: { xs: 10, md: 20 }, bgcolor: '#0f172a', color: 'white', position: 'relative', overflow: 'hidden', px: 2 }}>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-600/10 rounded-full blur-[120px] pointer-events-none translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none -translate-x-1/2 translate-y-1/2"></div>

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={5}>
              <Box>
                <Typography variant="overline" sx={{ color: '#f43f5e', fontWeight: 900, letterSpacing: 4, display: 'block', mb: 2, fontSize: { xs: '0.7rem', md: '0.9rem' } }}>
                  REACH OUT
                </Typography>
                <Typography variant="h2" sx={{ fontWeight: 900, mb: 4, fontSize: { xs: '2rem', sm: '2.5rem', md: '4rem' }, lineHeight: 1.1 }}>
                  Let's Build <br /> Something <span className="text-rose-500">Great</span>
                </Typography>
                <Typography variant="body1" sx={{ color: '#94a3b8', mb: 8, fontSize: { xs: '1rem', md: '1.25rem' }, lineHeight: 1.8, maxWidth: 400 }}>
                  Our specialists are ready to help you with your construction or style needs.
                </Typography>
                
                <div className="space-y-6 md:space-y-8">
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all duration-300">
                      <BusinessIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Corporate Office</p>
                      <p className="text-base md:text-lg font-bold">40-Ferozpur Road, Lahore</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
                      <SendIcon />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Direct Email</p>
                      <p className="text-base md:text-lg font-bold">Sales@themarflexgroup.com</p>
                    </div>
                  </div>
                </div>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={7}>
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 sm:p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] shadow-2xl">
                {success ? (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 md:w-20 md:h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                      <VerifiedUserIcon sx={{ fontSize: { xs: 30, md: 40 } }} />
                    </div>
                    <h3 className="text-2xl md:text-3xl font-black mb-4">Message Sent!</h3>
                    <p className="text-slate-400 font-medium mb-8 text-sm md:text-base">Thank you for reaching out. We will get back to you shortly.</p>
                    <button onClick={() => setSuccess(false)} className="bg-white text-slate-900 px-8 py-3 rounded-2xl font-black text-sm hover:bg-rose-500 hover:text-white transition-all">
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                        <input 
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-600 text-sm md:text-base"
                          placeholder="Mubashir Khan"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</label>
                        <input 
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-600 text-sm md:text-base"
                          placeholder="mubashir@example.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                      <input 
                        type="text"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-600 text-sm md:text-base"
                        placeholder="0348-xxxxxxx"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Your Message</label>
                      <textarea 
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={4}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 outline-none focus:border-rose-500/50 transition-all text-white font-medium placeholder:text-slate-600 resize-none text-sm md:text-base"
                        placeholder="Tell us about your project..."
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-rose-600 to-rose-500 py-4 md:py-5 rounded-2xl text-white font-black text-base md:text-lg shadow-xl shadow-rose-600/20 hover:shadow-rose-600/40 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {loading ? "Processing..." : (
                        <>Submit Inquiry <SendIcon fontSize="small" /></>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </div>
  );
};
