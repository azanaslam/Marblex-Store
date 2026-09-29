import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { http } from "../api/http";
import { BlogCardSkeleton } from "../components/LoaderSkeleton";

export const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    http
      .get("/blogs")
      .then((res) => setBlogs(Array.isArray(res.data) ? res.data : []))
      .catch(() => setBlogs([]))
      .finally(() => setLoading(false));
  }, []);

  const getReadingTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(words / 200));
    return `${minutes} min read`;
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto min-h-screen pb-24 px-4 sm:px-6 lg:px-8 pt-6">
      {/* Header */}
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <span className="inline-block py-1.5 px-4 rounded-full bg-[#ff6b4a]/10 text-[#ff6b4a] font-bold text-xs tracking-widest uppercase mb-4 border border-[#ff6b4a]/20">
          MARBLEX Editorial & Engineering
        </span>
        <h1 className="text-4xl md:text-6xl font-black text-[#0f1929] mb-4 tracking-tight" style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}>
          Technical <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff6b4a] to-[#ff8c73]">Articles & Insights</span>
        </h1>
        <p className="text-base text-[#565e69] font-normal leading-relaxed">
          In-depth civil engineering perspectives on concrete waterproofing, elastomeric rubber water stops, and thermal protection.
        </p>
      </div>

      {/* Blog Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#e0e6ed] card-shadow">
          <h3 className="text-lg font-bold text-[#0a3d52]">No technical articles published yet</h3>
          <p className="text-sm text-[#565e69] mt-1">Check back soon for new research bulletins.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog) => (
            <div 
              key={blog._id} 
              onClick={() => navigate(`/blogs/${blog._id}`)}
              className="group bg-white rounded-3xl border border-[#e0e6ed] card-shadow card-3d overflow-hidden flex flex-col h-full cursor-pointer hover:border-[#ff6b4a]/40 transition-all duration-300"
            >
              <div className="h-[220px] overflow-hidden relative bg-[#f5f7fa]">
                <img 
                  src={blog.coverImage || "/products/Banner1.jpeg"} 
                  alt={blog.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                />
                <div className="absolute top-4 left-4 flex gap-1.5 flex-wrap">
                  {(blog.tags || ["Article"]).slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="bg-[#0a3d52]/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 text-[11px] font-semibold text-[#565e69] mb-3">
                  <span className="flex items-center gap-1"><CalendarTodayIcon sx={{ fontSize: 13 }} /> {new Date(blog.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1"><AccessTimeIcon sx={{ fontSize: 13 }} /> {getReadingTime(blog.content)}</span>
                </div>

                <h3 className="text-xl font-bold text-[#0f1929] mb-3 line-clamp-2 leading-snug group-hover:text-[#ff6b4a] transition-colors" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {blog.title}
                </h3>

                <p className="text-sm text-[#565e69] line-clamp-3 leading-relaxed mb-6 flex-1 font-normal">
                  {blog.content}
                </p>

                <div className="pt-4 border-t border-[#e0e6ed] flex items-center justify-between mt-auto">
                  <span className="text-xs font-bold text-[#0a3d52]">MARBLEX Engineering</span>
                  <span className="text-xs font-bold text-[#ff6b4a] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    Read Article <ArrowForwardIcon sx={{ fontSize: 14 }} />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
