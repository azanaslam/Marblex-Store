import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Typography, Box, Chip, Avatar, Button } from "@mui/material";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShareIcon from "@mui/icons-material/Share";
import { http } from "../api/http";

export const BlogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
    http.get(`/blogs/${id}`)
      .then((res) => {
        setBlog(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching blog details:", err);
        setLoading(false);
      });
  }, [id]);

  const getReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
  };

  if (loading) {
    return (
      <Box className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="w-16 h-16 border-4 border-slate-100 border-t-rose-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 font-bold uppercase tracking-widest text-xs">Loading article...</p>
      </Box>
    );
  }

  if (!blog) {
    return (
      <Container maxWidth="md" className="py-20 text-center">
        <Typography variant="h4" className="font-black text-slate-900 mb-4">Post Not Found</Typography>
        <Button 
          variant="contained" 
          onClick={() => navigate("/blogs")}
          startIcon={<ArrowBackIcon />}
          sx={{ bgcolor: 'slate.900', borderRadius: 3, px: 4, py: 1.5, fontWeight: 800 }}
        >
          Back to Blogs
        </Button>
      </Container>
    );
  }

  return (
    <Box className="bg-white min-h-screen relative overflow-x-hidden w-full pb-20">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-rose-50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none opacity-40"></div>
      
      <Container maxWidth="md" className="relative z-10 pt-8 md:pt-16">
        <button 
          onClick={() => navigate("/blogs")}
          className="flex items-center gap-2 text-slate-400 hover:text-rose-600 font-bold text-xs uppercase tracking-widest transition-colors mb-10 group"
        >
          <ArrowBackIcon sx={{ fontSize: 18 }} className="transition-transform group-hover:-translate-x-1" />
          Back to Insights
        </button>

        {/* Article Header */}
        <Box className="mb-12">
          <div className="flex flex-wrap gap-2 mb-6">
            {Array.isArray(blog.tags) && blog.tags.map((tag, idx) => (
              <Chip 
                key={idx}
                label={tag}
                className="bg-rose-50 text-rose-600 font-black text-[10px] uppercase tracking-wider px-2 border border-rose-100 h-7"
              />
            ))}
          </div>
          
          <Typography variant="h1" className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tight">
            {blog.title}
          </Typography>

          <div className="flex flex-wrap items-center justify-between gap-6 py-6 border-y border-slate-100">
            <div className="flex items-center gap-4">
              <Avatar sx={{ width: 48, height: 48, bgcolor: 'slate.900', fontSize: 18, fontWeight: 900 }}>M</Avatar>
              <div>
                <p className="text-sm font-black text-slate-900 uppercase tracking-wider">Marblex Editor</p>
                <div className="flex items-center gap-3 text-slate-400 text-[11px] font-bold mt-0.5">
                  <span className="flex items-center gap-1"><CalendarTodayIcon sx={{ fontSize: 12 }} /> {new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-200"></span>
                  <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 12 }} /> {getReadingTime(blog.content)}</span>
                </div>
              </div>
            </div>
            
            <button className="w-10 h-10 rounded-full bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all">
              <ShareIcon sx={{ fontSize: 18 }} />
            </button>
          </div>
        </Box>

        {/* Featured Image */}
        <div className="rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl shadow-slate-200/50 border border-slate-100">
          <img 
            src={blog.coverImage || "https://placehold.co/1200x675/f1f5f9/64748b?text=Article+Image"} 
            alt={blog.title}
            className="w-full h-auto object-cover aspect-video"
          />
        </div>

        {/* Article Content */}
        <div className="prose prose-slate max-w-none">
          <div className="text-slate-600 text-lg md:text-xl leading-relaxed font-medium whitespace-pre-wrap">
            {blog.content}
          </div>
        </div>

        {/* Article Footer */}
        <Box className="mt-16 pt-10 border-t border-slate-100 flex flex-col items-center text-center">
          <Typography className="text-slate-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">End of Article</Typography>
          <div className="w-12 h-1 bg-rose-600 rounded-full mb-8"></div>
          
          <div className="bg-slate-50 p-8 md:p-12 rounded-[3rem] w-full border border-slate-100">
            <Typography variant="h4" className="font-black text-slate-900 mb-4">Want more insights?</Typography>
            <p className="text-slate-500 font-medium mb-8">Join 5,000+ professionals getting our monthly chemical engineering digest.</p>
            <button 
              onClick={() => navigate("/blogs")}
              className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black text-sm hover:bg-rose-600 transition-all shadow-xl shadow-slate-900/10"
            >
              Back to All Articles
            </button>
          </div>
        </Box>
      </Container>
    </Box>
  );
};
