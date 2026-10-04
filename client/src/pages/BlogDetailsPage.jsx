import { useEffect, useState } from "react";
import { useParams, useNavigate, Link as RouterLink } from "react-router-dom";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import DoneRoundedIcon from "@mui/icons-material/DoneRounded";
import ContentCopyOutlinedIcon from "@mui/icons-material/ContentCopyOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { http } from "../api/http";
import { BlogDetailSkeleton } from "../components/LoaderSkeleton";

export const BlogDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    setLoading(true);

    http
      .get(`/blogs/${id}`)
      .then((res) => {
        setBlog(res.data);
      })
      .catch((err) => {
        console.error("Error fetching blog details:", err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const getReadingTime = (text) => {
    const words = text?.split(/\s+/).length || 0;
    const minutes = Math.max(1, Math.ceil(words / 180));
    return `${minutes} min read`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const title = blog?.title || "Technical Paper - MARBLEX";
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(`${title}\n${url}`)}`, "_blank");
  };

  if (loading) return <BlogDetailSkeleton />;

  if (!blog) {
    return (
      <div className="max-w-3xl mx-auto py-24 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-4">
          <MenuBookOutlinedIcon sx={{ fontSize: 32 }} />
        </div>
        <h2 className="text-2xl font-bold text-[#0a3d52] dark:text-white mb-2">Technical Paper Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          The requested research article might have been moved or archived.
        </p>
        <button
          onClick={() => navigate("/blogs")}
          className="px-6 py-3 rounded-xl bg-[#0a3d52] text-white font-bold text-xs uppercase tracking-wider"
        >
          Back to Knowledge Hub
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-[#0b2f3c] dark:text-[#eaf3f7] pb-24 overflow-x-hidden">
      
      {/* Top Breadcrumb & Back Bar */}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/blogs")}
            className="flex items-center gap-2 text-xs font-bold text-[#0a3d52] dark:text-sky-300 hover:text-[#ff6b4a] bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700 px-4 py-2 rounded-xl shadow-xs transition-all active:scale-95"
          >
            <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
            <span>Back to All Papers</span>
          </button>

          {/* Social / Share Tools */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="p-2 rounded-xl bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-300 hover:text-[#0a3d52] dark:hover:text-white transition-all"
              title="Copy Link"
            >
              {copied ? (
                <DoneRoundedIcon sx={{ fontSize: 18, color: "#10b981" }} />
              ) : (
                <ContentCopyOutlinedIcon sx={{ fontSize: 18 }} />
              )}
            </button>
            <button
              onClick={handleShareWhatsApp}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <WhatsAppIcon sx={{ fontSize: 16 }} />
              <span className="hidden sm:inline">Share</span>
            </button>
          </div>
        </div>

        {/* Article Header */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {(blog.tags || ["Technical Article"]).map((tag, idx) => (
              <span
                key={idx}
                className="bg-[#ff6b4a]/10 dark:bg-[#ff6b4a]/20 text-[#ff6b4a] dark:text-[#ff8c73] font-bold text-[11px] uppercase tracking-wider px-3 py-1 rounded-lg border border-[#ff6b4a]/20"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1
            className="text-2xl sm:text-4xl lg:text-5xl font-black text-[#0a3d52] dark:text-white mb-6 leading-[1.2] tracking-tight"
            style={{ fontFamily: "'Space Grotesk', 'Poppins', sans-serif" }}
          >
            {blog.title}
          </h1>

          {/* Author & Timestamp Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-y border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#0a3d52] text-white flex items-center justify-center font-bold text-sm shadow-md">
                MX
              </div>
              <div>
                <p className="text-xs font-bold text-[#0a3d52] dark:text-white uppercase tracking-wider">
                  {blog.author || "MARBLEX Technical Directorate"}
                </p>
                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 text-[11.5px] font-medium mt-0.5">
                  <span className="flex items-center gap-1">
                    <CalendarTodayOutlinedIcon sx={{ fontSize: 13 }} />
                    {new Date(blog.createdAt || Date.now()).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <AccessTimeOutlinedIcon sx={{ fontSize: 13 }} />
                    {blog.readTime || getReadingTime(blog.content)}
                  </span>
                </div>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20 self-start sm:self-auto">
              <VerifiedOutlinedIcon sx={{ fontSize: 15 }} />
              <span>ASTM & DIN Verified</span>
            </div>
          </div>
        </div>

        {/* Cover Image Frame */}
        {blog.coverImage && (
          <div className="rounded-3xl overflow-hidden mb-10 shadow-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
            <img
              src={blog.coverImage}
              alt={blog.title}
              className="w-full h-auto max-h-[520px] object-cover"
            />
          </div>
        )}

        {/* Main Content Card */}
        <div className="rounded-3xl p-6 sm:p-12 bg-white dark:bg-[#0e2735] border border-slate-200 dark:border-slate-700/80 shadow-md">
          <div className="text-slate-800 dark:text-slate-200 text-base sm:text-lg leading-relaxed font-normal whitespace-pre-wrap space-y-6">
            {blog.content}
          </div>

          {/* Key Takeaways Card */}
          <div className="my-10 p-6 rounded-2xl bg-slate-50 dark:bg-[#0c222e] border-l-4 border-[#ff6b4a] dark:border-[#ff6b4a]">
            <h4 className="text-sm font-bold uppercase tracking-wider text-[#0a3d52] dark:text-white mb-2 flex items-center gap-2">
              <EngineeringOutlinedIcon sx={{ fontSize: 18, color: "#ff6b4a" }} />
              <span>Engineering Summary & Site Takeaway</span>
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Always verify substrate compressive strength and moisture content using calibrated meters prior to applying polymer barriers. For high water-table projects, continuous hydrostatic pressure requires multi-barrier redundancy.
            </p>
          </div>

          {/* Author Consultation CTA */}
          <div className="mt-10 pt-6 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-center gap-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 text-center sm:text-left">
              Published by MARBLEX Construction Chemical & Rubber Industry • Lahore, Pakistan
            </span>
            <a
              href="https://wa.me/923084585792?text=Hello%20MARBLEX%2C%20I%20have%20a%20technical%20question%20regarding%20the%20research%20paper."
              target="_blank"
              rel="noreferrer"
              className="px-6 py-3 rounded-xl bg-[#ff6b4a] hover:bg-[#f35231] text-white font-bold text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-2"
            >
              <WhatsAppIcon sx={{ fontSize: 16 }} />
              <span>Consult with Author</span>
            </a>
          </div>
        </div>

      </div>

    </div>
  );
};
