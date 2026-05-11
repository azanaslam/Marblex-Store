import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import { authHeaders, http } from "../api/http";
import { getAuthToken, getAuthUser } from "../auth/session";
import { ChatEmojiPickerButton } from "../components/chat/ChatEmojiPickerButton";
import { ProductDetailSkeleton } from "../components/LoaderSkeleton";

const STATUS_COLOR = {
  pending: "warning",
  looking: "info",
  edit: "secondary",
  published: "success",
  rejected: "error",
};

const groupReactions = (reactions = []) => {
  const map = new Map();
  reactions.forEach((r) => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
  return [...map.entries()].map(([emoji, count]) => `${emoji} ${count}`);
};

export const AdminReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getAuthToken();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");
  const [draft, setDraft] = useState({ name: "", imageUrl: "", description: "", price: "", stock: "", category: "" });
  const [activeMobileCommentId, setActiveMobileCommentId] = useState("");
  const [menuState, setMenuState] = useState({ anchorEl: null, comment: null });
  const [editingCommentId, setEditingCommentId] = useState("");
  const [editingBody, setEditingBody] = useState("");
  const [replyHint, setReplyHint] = useState("");
  const touchHoldRef = useRef(null);
  const me = getAuthUser();

  const load = async () => {
    const res = await http.get(`/product-reviews/${id}`, authHeaders(token));
    setItem(res.data);
    setDraft({
      name: res.data?.name || "",
      imageUrl: res.data?.imageUrl || "",
      description: res.data?.description || "",
      price: String(res.data?.price ?? ""),
      stock: String(res.data?.stock ?? ""),
      category: res.data?.category || "",
    });
  };

  useEffect(() => {
    if (!token || !id) return;
    load().catch(() => {});
  }, [token, id]);

  const sendComment = async () => {
    const body = comment.trim();
    if (!body) return;
    await http.post(`/product-reviews/${id}/comments`, { body }, authHeaders(token));
    setComment("");
    await load();
  };

  const reactComment = async (commentId, emoji) => {
    await http.post(`/product-reviews/${id}/comments/${commentId}/react`, { emoji }, authHeaders(token));
    await load();
    setActiveMobileCommentId("");
  };

  const editComment = async () => {
    const body = editingBody.trim();
    if (!body || !editingCommentId) return;
    await http.patch(`/product-reviews/${id}/comments/${editingCommentId}`, { body }, authHeaders(token));
    setEditingCommentId("");
    setEditingBody("");
    await load();
  };

  const deleteComment = async (commentId) => {
    await http.delete(`/product-reviews/${id}/comments/${commentId}`, authHeaders(token));
    await load();
  };

  const updateStatus = async (status) => {
    await http.patch(`/product-reviews/admin/${id}`, { status }, authHeaders(token));
    await load();
  };

  const saveDraftEdits = async () => {
    await http.patch(
      `/product-reviews/admin/${id}`,
      { ...draft, price: Number(draft.price || 0), stock: Number(draft.stock || 0) },
      authHeaders(token)
    );
    await load();
  };

  const publish = async () => {
    await http.post(`/product-reviews/admin/${id}/publish`, {}, authHeaders(token));
    await load();
  };

  const deleteSubmission = async () => {
    await http.delete(`/product-reviews/admin/${id}`, authHeaders(token));
    navigate("/admin", { replace: true, state: { adminTab: 8 } });
  };

  const onCommentTouchStart = (commentId) => {
    if (touchHoldRef.current) clearTimeout(touchHoldRef.current);
    touchHoldRef.current = setTimeout(() => setActiveMobileCommentId(commentId), 420);
  };
  const onCommentTouchEnd = () => {
    if (touchHoldRef.current) clearTimeout(touchHoldRef.current);
  };

  const grouped = useMemo(() => {
    const map = new Map();
    (item?.comments || []).forEach((c) => map.set(c._id, groupReactions(c.reactions || [])));
    return map;
  }, [item]);

  const openMenu = (event, comment) => setMenuState({ anchorEl: event.currentTarget, comment });
  const closeMenu = () => setMenuState({ anchorEl: null, comment: null });
  const isMyComment = (c) => c.author?._id === me?.id;

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/admin", { state: { adminTab: 8 } })}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors w-fit px-4 py-2 rounded-xl hover:bg-slate-100"
      >
        <ArrowBackRoundedIcon fontSize="small" /> Back to Product Review
      </button>

      {!item ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Review Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Review Submission</h2>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-full sm:w-1/3">
                  <img
                    src={draft.imageUrl || "https://placehold.co/400x400/e2e8f0/475569?text=Product"}
                    alt={draft.name}
                    className="w-full aspect-square object-cover rounded-2xl bg-slate-100 border border-slate-200 shadow-sm"
                  />
                </div>
                
                <div className="w-full sm:w-2/3 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Product Name</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Image URL</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={draft.imageUrl} onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))} />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (PKR)</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock</label>
                      <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={draft.stock} onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" value={draft.category} onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))} />
                  </div>
                </div>
              </div>
              
              <div className="mb-8">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-y" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}></textarea>
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                <span className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' : item.status === 'edit' ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {item.status}
                </span>
                
                <div className="relative border border-slate-200 rounded-xl overflow-hidden min-w-[140px] bg-white">
                  <select
                    className="w-full appearance-none bg-transparent px-4 py-2 text-sm font-bold text-slate-700 focus:outline-none cursor-pointer"
                    value={item.status || "pending"}
                    onChange={(e) => updateStatus(e.target.value)}
                  >
                    <option value="pending">Pending</option>
                    <option value="looking">Looking</option>
                    <option value="edit">Need Edit</option>
                    <option value="rejected">Reject</option>
                    <option value="published">Published</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>

                <div className="flex-1 min-w-[10px]"></div>

                <button onClick={publish} className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow-md shadow-emerald-600/20 transition-all text-sm">
                  Publish
                </button>
                <button onClick={saveDraftEdits} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-900/20 transition-all text-sm">
                  Save Draft Edits
                </button>
                <button onClick={deleteSubmission} className="flex items-center gap-1.5 px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl font-bold transition-all text-sm">
                  <DeleteOutlineRoundedIcon fontSize="small" /> Delete
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column: Review Comments */}
          <div className="lg:col-span-5 flex flex-col relative">
            <div className="sticky top-8 bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 flex-1 flex flex-col max-h-[550px] lg:h-[550px]">
              <h3 className="text-xl font-extrabold text-slate-900 mb-6 tracking-tight flex items-center gap-2">
                Review Comments
                <span className="bg-blue-50 text-blue-600 px-2.5 py-0.5 rounded-lg text-xs border border-blue-100">{(item.comments || []).length}</span>
              </h3>
              
              {/* Chat Area */}
              <div className="flex-1 overflow-y-auto pr-3 space-y-5 mb-6 custom-scrollbar">
                {(item.comments || []).map((c) => {
                  const myComment = isMyComment(c);
                  return (
                    <div
                      key={c._id}
                      onTouchStart={() => onCommentTouchStart(c._id)}
                      onTouchEnd={onCommentTouchEnd}
                      onTouchCancel={onCommentTouchEnd}
                      className={`relative flex flex-col w-full group ${myComment ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`flex flex-col max-w-[85%] ${myComment ? 'items-end' : 'items-start'}`}>
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm border ${myComment ? 'bg-gradient-to-br from-blue-600 to-blue-500 text-white rounded-br-sm border-blue-700/20' : 'bg-slate-50 text-slate-800 rounded-bl-sm border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${myComment ? 'text-blue-100' : 'text-slate-400'}`}>{c.author?.name || "User"}</span>
                            <button className={`opacity-0 group-hover:opacity-100 transition-opacity ${myComment ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`} onClick={(e) => openMenu(e, c)}>
                              <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                            </button>
                          </div>
                          
                          {editingCommentId === c._id ? (
                            <div className="flex gap-2 mt-2">
                              <input type="text" className="w-full bg-white/20 border-white/30 text-white placeholder-white/50 rounded-lg px-2 py-1 text-sm focus:outline-none" value={editingBody} onChange={(e) => setEditingBody(e.target.value)} />
                              <button className="bg-white text-blue-600 font-bold px-3 py-1 rounded-lg text-sm hover:bg-slate-100" onClick={editComment}>Save</button>
                            </div>
                          ) : (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">{c.body}</p>
                          )}
                        </div>

                        {/* Reactions */}
                        <div className={`flex items-center gap-1.5 mt-1.5 ${myComment ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity scale-90">
                            <ChatEmojiPickerButton size="small" onPick={(emoji) => reactComment(c._id, emoji)} />
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {(grouped.get(c._id) || []).map((x) => (
                              <span key={`${c._id}-${x}`} className="bg-white border border-slate-200 px-2 py-0.5 rounded-full text-[11px] font-medium shadow-sm cursor-pointer hover:bg-slate-50 transition-colors">
                                {x}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {!item.comments?.length && (
                  <div className="h-full flex items-center justify-center text-slate-400 font-medium text-sm">
                    No comments yet. Start the conversation!
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="mt-auto flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <ChatEmojiPickerButton onPick={(emoji) => setComment((p) => `${p}${emoji}`)} />
                <input
                  type="text"
                  className="flex-1 bg-transparent px-3 py-2 text-slate-900 font-medium focus:outline-none"
                  placeholder={replyHint || "Reply to subowner..."}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendComment();
                    }
                  }}
                />
                <button 
                  onClick={sendComment}
                  disabled={!comment.trim()}
                  className="bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-md shadow-blue-600/20"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu remains unchanged */}
      <Menu anchorEl={menuState.anchorEl} open={Boolean(menuState.anchorEl)} onClose={closeMenu} PaperProps={{ sx: { borderRadius: 2, mt: 1, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } }}>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c) setReplyHint(`Replying to ${c.author?.name || "user"}`);
            closeMenu();
          }}
          sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c?.body) navigator.clipboard?.writeText(c.body);
            closeMenu();
          }}
          sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}
        >
          Copy Text
        </MenuItem>
        {(menuState.comment?.author?._id === me?.id || me?.role === "admin") && (
          <MenuItem
            onClick={() => {
              const c = menuState.comment;
              if (c) {
                setEditingCommentId(c._id);
                setEditingBody(c.body || "");
              }
              closeMenu();
            }}
            sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}
          >
            Edit Message
          </MenuItem>
        )}
        {(menuState.comment?.author?._id === me?.id || me?.role === "admin") && (
          <MenuItem
            onClick={() => {
              const c = menuState.comment;
              if (c?._id) deleteComment(c._id);
              closeMenu();
            }}
            sx={{ fontSize: 14, fontWeight: 600, color: '#e11d48' }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};
