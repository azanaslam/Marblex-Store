import { useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { Alert, Box, Button, Chip, Grid, IconButton, Menu, MenuItem, Paper, Stack, TextField, Typography } from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
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

export const UserReviewDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = getAuthToken();
  const [item, setItem] = useState(null);
  const [comment, setComment] = useState("");
  const [isEditingProduct, setIsEditingProduct] = useState(false);
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

  const updateComment = async () => {
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

  const saveProductDraft = async () => {
    await http.patch(
      `/product-reviews/${id}`,
      {
        ...draft,
        price: Number(draft.price || 0),
        stock: Number(draft.stock || 0),
      },
      authHeaders(token)
    );
    await load();
    setIsEditingProduct(false);
  };

  const deleteSubmission = async () => {
    await http.delete(`/product-reviews/${id}`, authHeaders(token));
    navigate("/dashboard", { replace: true, state: { dashboardTab: 2 } });
  };

  const onCommentTouchStart = (commentId) => {
    if (touchHoldRef.current) clearTimeout(touchHoldRef.current);
    touchHoldRef.current = setTimeout(() => setActiveMobileCommentId(commentId), 420);
  };

  const onCommentTouchEnd = () => {
    if (touchHoldRef.current) clearTimeout(touchHoldRef.current);
  };

  const groupedReactions = useMemo(() => {
    const map = new Map();
    (item?.comments || []).forEach((c) => {
      const counts = new Map();
      (c.reactions || []).forEach((r) => counts.set(r.emoji, (counts.get(r.emoji) || 0) + 1));
      map.set(c._id, [...counts.entries()].map(([emoji, count]) => `${emoji} ${count}`));
    });
    return map;
  }, [item]);
  const isMyComment = (c) => c.author?._id === me?.id;

  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Back Button */}
      <button 
        onClick={() => navigate("/dashboard", { state: { dashboardTab: 2 } })}
        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors w-fit px-4 py-2 rounded-xl hover:bg-slate-100"
      >
        <ArrowBackRoundedIcon fontSize="small" /> Back to Review Queue
      </button>

      {!item ? (
        <ProductDetailSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Product Details & Edit */}
          <div className="lg:col-span-7">
            <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 h-full">
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-6">Product Details</h2>
              
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                <div className="w-full sm:w-1/3">
                  <img
                    src={draft.imageUrl || item.imageUrl || "https://placehold.co/400x400/e2e8f0/475569?text=Product"}
                    alt={draft.name || item.name}
                    className="w-full aspect-square object-cover rounded-2xl bg-slate-100 border border-slate-200 shadow-sm"
                  />
                </div>
                
                <div className="w-full sm:w-2/3 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    {isEditingProduct ? (
                      <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 mr-4" value={draft.name} onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))} />
                    ) : (
                      <h3 className="text-xl font-extrabold text-slate-900 line-clamp-1">{item.name}</h3>
                    )}
                    <span className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border ${
                      item.status === 'published' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                      item.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                      item.status === 'edit' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                      'bg-amber-50 text-amber-700 border-amber-200'
                    }`}>
                      {item.status}
                    </span>
                  </div>

                  {isEditingProduct ? (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Image URL</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" value={draft.imageUrl} onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))} />
                      </div>
                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (PKR)</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" value={draft.price} onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))} />
                        </div>
                        <div className="flex-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Stock</label>
                          <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500" value={draft.stock} onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Category</label>
                        <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500" value={draft.category} onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))} />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl">
                      <div className="flex items-center gap-4 text-sm font-bold text-slate-700 mb-2">
                        <span className="text-rose-600">PKR {item.price}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>Stock: {item.stock}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span className="text-slate-500">{item.category}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                {isEditingProduct ? (
                  <>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Description</label>
                    <textarea rows="4" className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" value={draft.description} onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}></textarea>
                  </>
                ) : (
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-2">Description</h4>
                    <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {item.description || "No description provided."}
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                {item.status !== "published" && !isEditingProduct && (
                  <button onClick={() => setIsEditingProduct(true)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all text-sm flex items-center gap-2">
                    <EditOutlinedIcon fontSize="small" /> Edit Product
                  </button>
                )}
                {item.status !== "published" && isEditingProduct && (
                  <>
                    <button onClick={() => setIsEditingProduct(false)} className="px-5 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl font-bold transition-all text-sm">
                      Cancel
                    </button>
                    <button onClick={saveProductDraft} className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md shadow-slate-900/20 transition-all text-sm">
                      Save Changes
                    </button>
                  </>
                )}
                {item.status !== "published" && (
                  <button onClick={deleteSubmission} className="flex items-center gap-1.5 px-4 py-2.5 border border-rose-200 bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 rounded-xl font-bold transition-all text-sm ml-auto">
                    <DeleteOutlineRoundedIcon fontSize="small" /> Delete
                  </button>
                )}
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
                        <div className={`px-4 py-2.5 rounded-2xl shadow-sm border ${myComment ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-br-sm border-slate-900/20' : 'bg-slate-50 text-slate-800 rounded-bl-sm border-slate-200'}`}>
                          <div className="flex items-center justify-between gap-3 mb-1">
                            <span className={`text-[11px] font-bold uppercase tracking-wider ${myComment ? 'text-slate-300' : 'text-slate-400'}`}>{c.author?.name || "User"}</span>
                            <button className={`opacity-0 group-hover:opacity-100 transition-opacity ${myComment ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}`} onClick={(e) => setMenuState({ anchorEl: e.currentTarget, comment: c })}>
                              <MoreVertRoundedIcon sx={{ fontSize: 16 }} />
                            </button>
                          </div>
                          
                          {editingCommentId === c._id ? (
                            <div className="flex gap-2 mt-2">
                              <input type="text" className="w-full bg-white/10 border-white/20 text-white placeholder-white/50 rounded-lg px-2 py-1 text-sm focus:outline-none" value={editingBody} onChange={(e) => setEditingBody(e.target.value)} />
                              <button className="bg-white text-slate-900 font-bold px-3 py-1 rounded-lg text-sm hover:bg-slate-100" onClick={updateComment}>Save</button>
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
                            {(groupedReactions.get(c._id) || []).map((x) => (
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
                    No comments yet.
                  </div>
                )}
              </div>
              
              {/* Input Area */}
              <div className="mt-auto flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
                <ChatEmojiPickerButton onPick={(emoji) => setComment((p) => `${p}${emoji}`)} />
                <input
                  type="text"
                  className="flex-1 bg-transparent px-3 py-2 text-slate-900 font-medium focus:outline-none"
                  placeholder={replyHint || "Write message for admin..."}
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
                  className="bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white w-10 h-10 rounded-xl flex items-center justify-center transition-colors shrink-0 shadow-md shadow-slate-900/20"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <Menu anchorEl={menuState.anchorEl} open={Boolean(menuState.anchorEl)} onClose={() => setMenuState({ anchorEl: null, comment: null })} PaperProps={{ sx: { borderRadius: 2, mt: 1, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' } }}>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c) setReplyHint(`Replying to ${c.author?.name || "user"}`);
            setMenuState({ anchorEl: null, comment: null });
          }}
          sx={{ fontSize: 14, fontWeight: 600, color: '#334155' }}
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c?.body) navigator.clipboard?.writeText(c.body);
            setMenuState({ anchorEl: null, comment: null });
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
              setMenuState({ anchorEl: null, comment: null });
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
              setMenuState({ anchorEl: null, comment: null });
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
