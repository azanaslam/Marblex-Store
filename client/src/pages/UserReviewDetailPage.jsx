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

  if (!token) return <Navigate to="/login" replace />;

  return (
    <Stack spacing={2}>
      <Button
        variant="text"
        startIcon={<ArrowBackRoundedIcon />}
        sx={{ alignSelf: "flex-start" }}
        onClick={() => navigate("/dashboard", { state: { dashboardTab: 2 } })}
      >
        Back to review queue
      </Button>
      {!item ? (
        <Alert severity="info">Loading review details...</Alert>
      ) : (
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper sx={{ p: 2.2, borderRadius: 3 }}>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <Box
                  component="img"
                  src={draft.imageUrl || item.imageUrl || "/icons.svg"}
                  alt={draft.name || item.name}
                  sx={{ width: { xs: "100%", sm: 240 }, height: 190, objectFit: "cover", borderRadius: 2 }}
                />
                <Box sx={{ minWidth: 0 }}>
                  <Stack direction="row" spacing={1} alignItems="center" mb={0.8}>
                    {isEditingProduct ? (
                      <TextField
                        size="small"
                        value={draft.name}
                        onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                        sx={{ minWidth: 220 }}
                      />
                    ) : (
                      <Typography variant="h5" fontWeight={900}>
                        {item.name}
                      </Typography>
                    )}
                    <Chip label={item.status} color={STATUS_COLOR[item.status] || "default"} />
                  </Stack>
                  {isEditingProduct ? (
                    <Stack spacing={1}>
                      <TextField
                        size="small"
                        label="Image URL"
                        value={draft.imageUrl}
                        onChange={(e) => setDraft((p) => ({ ...p, imageUrl: e.target.value }))}
                      />
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          label="Price"
                          type="number"
                          value={draft.price}
                          onChange={(e) => setDraft((p) => ({ ...p, price: e.target.value }))}
                        />
                        <TextField
                          size="small"
                          label="Stock"
                          type="number"
                          value={draft.stock}
                          onChange={(e) => setDraft((p) => ({ ...p, stock: e.target.value }))}
                        />
                      </Stack>
                      <TextField
                        size="small"
                        label="Category"
                        value={draft.category}
                        onChange={(e) => setDraft((p) => ({ ...p, category: e.target.value }))}
                      />
                      <TextField
                        size="small"
                        multiline
                        minRows={3}
                        label="Description"
                        value={draft.description}
                        onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
                      />
                    </Stack>
                  ) : (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        PKR {item.price} · Stock {item.stock} · {item.category}
                      </Typography>
                      <Typography sx={{ mt: 1.2 }} variant="body2">
                        {item.description || "No description provided."}
                      </Typography>
                    </>
                  )}
                  <Stack direction="row" spacing={1} mt={1.4}>
                    {item.status !== "published" && !isEditingProduct && (
                      <Button size="small" startIcon={<EditOutlinedIcon />} variant="outlined" onClick={() => setIsEditingProduct(true)}>
                        Edit
                      </Button>
                    )}
                    {item.status !== "published" && isEditingProduct && (
                      <>
                        <Button size="small" variant="outlined" onClick={() => setIsEditingProduct(false)}>
                          Cancel
                        </Button>
                        <Button size="small" variant="contained" onClick={saveProductDraft}>
                          Save
                        </Button>
                      </>
                    )}
                    {item.status !== "published" && (
                      <Button size="small" color="error" variant="outlined" startIcon={<DeleteOutlineRoundedIcon />} onClick={deleteSubmission}>
                        Delete
                      </Button>
                    )}
                  </Stack>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper sx={{ p: 2.2, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={800} mb={1.2}>
                Review comments
              </Typography>
              <Stack spacing={1}>
                {(item.comments || []).map((c) => (
                  <Paper
                    key={c._id}
                    variant="outlined"
                    onTouchStart={() => onCommentTouchStart(c._id)}
                    onTouchEnd={onCommentTouchEnd}
                    onTouchCancel={onCommentTouchEnd}
                    sx={{
                      p: 1.2,
                      borderRadius: 2,
                      ml: c.author?.role === "admin" ? "auto" : 0,
                      maxWidth: "88%",
                      bgcolor: c.author?.role === "admin" ? "rgba(33, 150, 243, 0.08)" : "#fff",
                      "& .react-trigger": { opacity: { xs: activeMobileCommentId === c._id ? 1 : 0, md: 0 } },
                      "&:hover .react-trigger": { opacity: { md: 1 } },
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                      <Typography variant="body2" fontWeight={700}>
                        {c.author?.name || "User"}
                      </Typography>
                      <IconButton className="react-trigger" size="small" onClick={(e) => setMenuState({ anchorEl: e.currentTarget, comment: c })}>
                        <MoreVertRoundedIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                    {editingCommentId === c._id ? (
                      <Stack direction="row" spacing={1} mt={0.5}>
                        <TextField size="small" fullWidth value={editingBody} onChange={(e) => setEditingBody(e.target.value)} />
                        <Button size="small" variant="contained" onClick={updateComment}>Save</Button>
                      </Stack>
                    ) : (
                      <Typography variant="body2">{c.body}</Typography>
                    )}
                    <Stack direction="row" alignItems="center" spacing={1} mt={0.8}>
                      <Box className="react-trigger" sx={{ transition: "opacity .18s ease" }}>
                        <ChatEmojiPickerButton size="small" onPick={(emoji) => reactComment(c._id, emoji)} />
                      </Box>
                      <Stack direction="row" spacing={0.6} flexWrap="wrap" useFlexGap>
                        {(groupedReactions.get(c._id) || []).map((x) => (
                          <Chip key={`${c._id}-${x}`} size="small" variant="outlined" label={x} />
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
              <Stack direction="row" spacing={1} mt={1.5}>
                <ChatEmojiPickerButton onPick={(emoji) => setComment((p) => `${p}${emoji}`)} />
                <TextField
                  fullWidth
                  size="small"
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
                <Button variant="contained" onClick={sendComment}>
                  Send
                </Button>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}
      <Menu anchorEl={menuState.anchorEl} open={Boolean(menuState.anchorEl)} onClose={() => setMenuState({ anchorEl: null, comment: null })}>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c) setReplyHint(`Replying to ${c.author?.name || "user"}`);
            setMenuState({ anchorEl: null, comment: null });
          }}
        >
          Reply
        </MenuItem>
        <MenuItem
          onClick={() => {
            const c = menuState.comment;
            if (c?.body) navigator.clipboard?.writeText(c.body);
            setMenuState({ anchorEl: null, comment: null });
          }}
        >
          Copy
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
          >
            Edit
          </MenuItem>
        )}
        {(menuState.comment?.author?._id === me?.id || me?.role === "admin") && (
          <MenuItem
            onClick={() => {
              const c = menuState.comment;
              if (c?._id) deleteComment(c._id);
              setMenuState({ anchorEl: null, comment: null });
            }}
          >
            Delete
          </MenuItem>
        )}
      </Menu>
    </Stack>
  );
};
