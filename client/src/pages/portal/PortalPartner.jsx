import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import CloudUploadOutlinedIcon from "@mui/icons-material/CloudUploadOutlined";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import { authHeaders, http } from "../../api/http";
import { PORTAL_TEAL } from "./portalUtils";

const emptySubmission = {
  name: "",
  imageUrl: "",
  extraImages: ["", "", ""],
  description: "",
  price: "",
  stock: "",
  category: "General",
  comment: "",
};

const STATUS_COLOR = {
  pending: "warning",
  looking: "info",
  edit: "secondary",
  published: "success",
  rejected: "error",
};

export const PortalPartner = () => {
  const { token, user } = useOutletContext();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(emptySubmission);
  const [submissions, setSubmissions] = useState([]);
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    const res = await http.get("/product-reviews/mine", authHeaders(token));
    setSubmissions(res.data || []);
  };

  useEffect(() => {
    if (user?.role === "subowner") load().catch(() => {});
  }, [token, user?.role]);

  const summary = useMemo(
    () => ({
      pending: submissions.filter((x) => x.status === "pending").length,
      published: submissions.filter((x) => x.status === "published").length,
    }),
    [submissions]
  );

  if (user?.role !== "subowner") {
    return <Alert severity="info">Partner Hub is available for subowner accounts only.</Alert>;
  }

  const onImage = (event, field = "main", idx = 0) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = String(reader.result || "");
      if (field === "main") setSubmission((p) => ({ ...p, imageUrl: dataUrl }));
      else {
        setSubmission((p) => {
          const extra = [...(p.extraImages || ["", "", ""])];
          extra[idx] = dataUrl;
          return { ...p, extraImages: extra };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const submit = async () => {
    try {
      await http.post(
        "/product-reviews/submit",
        {
          ...submission,
          price: Number(submission.price || 0),
          stock: Number(submission.stock || 0),
        },
        authHeaders(token)
      );
      setSubmission(emptySubmission);
      await load();
      setToast({ open: true, severity: "success", message: "Product sent for admin review." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Submit failed" });
    }
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Partner Hub</Typography>
        <Typography color="text.secondary" sx={{ fontSize: 14 }}>
          Submit products for catalog review · Pending {summary.pending} · Published {summary.published}
        </Typography>
      </Box>

      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: "1px solid #dbe4ea" }}>
        <Typography sx={{ fontWeight: 800, mb: 2 }}>Create product submission</Typography>
        <Stack spacing={1.5}>
          <TextField
            label="Product name"
            value={submission.name}
            onChange={(e) => setSubmission((p) => ({ ...p, name: e.target.value }))}
            fullWidth
          />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Main image URL"
              value={submission.imageUrl}
              onChange={(e) => setSubmission((p) => ({ ...p, imageUrl: e.target.value }))}
              fullWidth
            />
            <Button component="label" variant="outlined" startIcon={<CloudUploadOutlinedIcon />}>
              Upload
              <input hidden accept="image/*" type="file" onChange={(e) => onImage(e, "main")} />
            </Button>
          </Stack>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              label="Category"
              value={submission.category}
              onChange={(e) => setSubmission((p) => ({ ...p, category: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Price"
              type="number"
              value={submission.price}
              onChange={(e) => setSubmission((p) => ({ ...p, price: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Stock"
              type="number"
              value={submission.stock}
              onChange={(e) => setSubmission((p) => ({ ...p, stock: e.target.value }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Description"
            multiline
            minRows={3}
            value={submission.description}
            onChange={(e) => setSubmission((p) => ({ ...p, description: e.target.value }))}
            fullWidth
          />
          <TextField
            label="Comment to admin"
            multiline
            minRows={2}
            value={submission.comment}
            onChange={(e) => setSubmission((p) => ({ ...p, comment: e.target.value }))}
            fullWidth
          />
          <Button
            variant="contained"
            color="secondary"
            startIcon={<SendRoundedIcon />}
            onClick={submit}
            sx={{ alignSelf: "flex-start" }}
          >
            Submit for review
          </Button>
        </Stack>
      </Paper>

      <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL }}>Review queue</Typography>
      {submissions.length === 0 ? (
        <Alert severity="info">No submissions yet.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {submissions.map((s) => (
            <Paper key={s._id} elevation={0} sx={{ p: 2, borderRadius: 3, border: "1px solid #dbe4ea" }}>
              <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" gap={1.5}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography sx={{ fontWeight: 800 }}>{s.name}</Typography>
                    <Chip size="small" label={s.status} color={STATUS_COLOR[s.status] || "default"} />
                  </Stack>
                  <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                    {s.category} · PKR {s.price}
                  </Typography>
                </Box>
                <Button
                  size="small"
                  startIcon={<VisibilityOutlinedIcon />}
                  onClick={() => navigate(`/dashboard/review/${s._id}`)}
                >
                  Open thread
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
