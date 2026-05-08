import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Typography, Grid, Box, Chip, Avatar } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { http } from "../api/http";

export const BlogsPage = () => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    http.get("/blogs")
      .then((res) => {
        setBlogs(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blogs:", err);
        setLoading(false);
      });
  }, []);

  // Helper to estimate reading time
  const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  return (
    <Box className="bg-white min-h-screen relative overflow-x-hidden w-full">
      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2 pointer-events-none opacity-50"></div>

      <Container maxWidth="lg" className="relative z-10 pt-12 pb-24">
        {/* Header Section */}
        <Box className="text-center mb-16">
          <span className="inline-block py-1.5 px-6 rounded-full bg-slate-900 text-white font-black text-[10px] tracking-[0.3em] uppercase mb-6 shadow-lg shadow-slate-900/20">
            Insights & News
          </span>
          <Typography variant="h1" className="text-4xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">
            Our <span className="text-rose-600">Blog</span>
          </Typography>
          <Typography className="text-lg text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">
            Expert perspectives on chemical engineering, construction solutions, and industrial innovations in Pakistan.
          </Typography>
        </Box>

        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="w-16 h-16 border-4 border-slate-100 border-t-rose-600 rounded-full animate-spin"></div>
            <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Curating stories...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="text-center py-24 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-100">
            <Typography className="text-slate-400 font-bold text-xl">No articles published yet.</Typography>
            <p className="text-slate-400 mt-2">Check back soon for new updates.</p>
          </div>
        ) : (
          <Grid container spacing={4}>
            {blogs.map((blog, index) => (
              <Grid item xs={12} md={index === 0 ? 12 : 6} lg={index === 0 ? 12 : 4} key={blog._id}>
                <div className={`group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-rose-500/10 hover:border-rose-100 transition-all duration-500 flex flex-col h-full ${index === 0 ? 'md:flex-row' : ''}`}>
                  
                  {/* Image Container */}
                  <div className={`relative overflow-hidden cursor-pointer ${index === 0 ? 'md:w-1/2 h-[300px] md:h-auto' : 'h-[240px]'}`}>
                    <img 
                      src={blog.coverImage || "https://placehold.co/800x600/f1f5f9/64748b?text=Article+Image"} 
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                      {Array.isArray(blog.tags) ? blog.tags.slice(0, 2).map((tag, tIdx) => (
                        <Chip 
                          key={tIdx}
                          label={tag}
                          className="bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] uppercase tracking-wider px-2 shadow-sm border-none h-7"
                        />
                      )) : (
                        <Chip label="Article" className="bg-white/90 backdrop-blur-md text-slate-900 font-black text-[10px] uppercase tracking-wider px-2 shadow-sm border-none h-7" />
                      )}
                    </div>
                  </div>

                  {/* Content Container */}
                  <div className={`p-8 md:p-10 flex flex-col flex-1 ${index === 0 ? 'md:w-1/2' : ''}`}>
                    <div className="flex items-center gap-4 text-slate-400 text-[11px] font-bold uppercase tracking-widest mb-6">
                      <span className="flex items-center gap-1.5"><CalendarTodayIcon sx={{ fontSize: 14 }} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                      <span className="flex items-center gap-1.5"><AccessTimeIcon sx={{ fontSize: 14 }} /> {getReadingTime(blog.content)}</span>
                    </div>

                    <Typography variant="h2" className={`font-black text-slate-900 mb-4 leading-tight group-hover:text-rose-600 transition-colors cursor-pointer ${index === 0 ? 'text-2xl md:text-4xl' : 'text-xl md:text-2xl line-clamp-2'}`}>
                      {blog.title}
                    </Typography>

                    <Typography className={`text-slate-500 font-medium leading-relaxed mb-8 ${index === 0 ? 'text-lg line-clamp-3' : 'text-sm line-clamp-3'}`}>
                      {blog.content}
                    </Typography>

                    <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar sx={{ width: 32, height: 32, bgcolor: 'slate.900', fontSize: 12, fontWeight: 900 }}>M</Avatar>
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider">Marblex Editor</span>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/blogs/${blog._id}`)}
                        className="flex items-center gap-2 text-rose-600 font-black text-xs uppercase tracking-[0.2em] group/btn"
                      >
                        Read More 
                        <ArrowForwardIcon sx={{ fontSize: 16 }} className="transition-transform group-hover/btn:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Newsletter Section */}
        <Box className="mt-24 bg-slate-900 rounded-[3rem] p-10 md:p-20 text-center relative overflow-hidden shadow-2xl shadow-slate-900/20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10">
            <Typography variant="h3" className="text-white font-black text-2xl md:text-4xl mb-6">Stay ahead of the curve</Typography>
            <p className="text-slate-400 font-medium text-lg mb-10 max-w-xl mx-auto">Get monthly updates on industry trends and product releases directly in your inbox.</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-rose-500 transition-all placeholder:text-slate-600 text-center sm:text-left"
              />
              <button className="bg-white text-slate-900 font-black px-8 py-4 rounded-2xl hover:bg-rose-600 hover:text-white transition-all shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </Box>
      </Container>
    </Box>
  );
};
