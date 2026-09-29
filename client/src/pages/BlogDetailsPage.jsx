import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { http } from "../api/http";
import { BlogDetailSkeleton } from "../components/LoaderSkeleton";

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
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  if (loading) return <BlogDetailSkeleton />;

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto py-20 text-center px-4">
        <h2 className="text-2xl font-bold text-[#0a3d52] mb-4">Article Not Found</h2>
        <button 
          onClick={() => navigate("/blogs")}
          className="btn-3d-navy px-6 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider"
        >
          Back to Articles
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto min-h-screen pb-24 px-4 sm:px-6 lg:px-8 pt-8">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/blogs")}
        className="flex items-center gap-1.5 text-xs font-bold text-[#0a3d52] hover:text-[#ff6b4a] bg-white border border-[#e0e6ed] px-4 py-2 rounded-xl shadow-sm transition-all mb-8 active:scale-95"
      >
        <ArrowBackRoundedIcon sx={{ fontSize: 16 }} /> Back to Articles
      </button>

      {/* Article Header */}
      <div className="mb-10">
        <div className="flex flex-wrap gap-2 mb-4">
          {(blog.tags || ["Technical Article"]).map((tag, idx) => (
            <span 
              key={idx}
              className="bg-[#ff6b4a]/10 text-[#ff6b4a] font-bold text-[10px] uppercase tracking-wider px-3 py-1 rounded-lg border border-[#ff6b4a]/20"
            >
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#0f1929] mb-6 leading-tight tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          {blog.title}
        </h1>

        <div className="flex items-center justify-between py-4 border-y border-[#e0e6ed]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0a3d52] text-white flex items-center justify-center font-bold text-sm">
              MX
            </div>
            <div>
              <p className="text-xs font-bold text-[#0a3d52] uppercase tracking-wider">MARBLEX Editorial</p>
              <div className="flex items-center gap-3 text-[#565e69] text-[11px] font-medium mt-0.5">
                <span className="flex items-center gap-1"><CalendarTodayIcon sx={{ fontSize: 12 }} /> {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                <span>•</span>
                <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 12 }} /> {getReadingTime(blog.content)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="rounded-3xl overflow-hidden mb-10 card-shadow border border-[#e0e6ed] bg-[#f5f7fa]">
          <img 
            src={blog.coverImage} 
            alt={blog.title}
            className="w-full h-auto max-h-[500px] object-cover"
          />
        </div>
      )}

      {/* Content */}
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#e0e6ed] card-shadow">
        <div className="text-[#0f1929] text-base sm:text-lg leading-relaxed font-normal whitespace-pre-wrap">
          {blog.content}
        </div>

        <div className="mt-12 pt-6 border-t border-[#e0e6ed] flex justify-between items-center flex-wrap gap-4">
          <span className="text-xs text-[#565e69]">Published by MARBLEX Construction Chemical & Rubber Industry</span>
          <Link to="/contact" className="btn-3d-accent px-5 py-2.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider">
            Consult With Author
          </Link>
        </div>
      </div>
    </div>
  );
};
