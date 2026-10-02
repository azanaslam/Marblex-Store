import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import OpenInNewRoundedIcon from "@mui/icons-material/OpenInNewRounded";
import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import { authHeaders, http } from "../../api/http";
import { PORTAL_TEAL } from "./portalUtils";

const CATEGORY_LABEL = {
  tds: "TDS",
  sds: "SDS",
  manual: "Manual",
  brochure: "Brochure",
  certificate: "Certificate",
  other: "Other",
};

export const PortalDocuments = () => {
  const { token } = useOutletContext();
  const [docs, setDocs] = useState([]);
  const [category, setCategory] = useState("");
  const [open, setOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ title: "", productName: "", message: "" });
  const [toast, setToast] = useState({ open: false, message: "", severity: "success" });

  const load = async () => {
    const params = category ? { category } : {};
    const res = await http.get("/portal/documents", { ...authHeaders(token), params });
    setDocs(res.data || []);
  };

  useEffect(() => {
    load().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, category]);

  const requestDoc = async () => {
    try {
      await http.post("/portal/documents/request", reqForm, authHeaders(token));
      setOpen(false);
      setReqForm({ title: "", productName: "", message: "" });
      setToast({ open: true, severity: "success", message: "Request sent. Support will follow up." });
    } catch (err) {
      setToast({ open: true, severity: "error", message: err.response?.data?.message || "Request failed" });
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1.5}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 22, color: PORTAL_TEAL }}>Technical documents</Typography>
          <Typography color="text.secondary" sx={{ fontSize: 14 }}>
            TDS, SDS, manuals, and brochures for site teams.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <TextField select size="small" value={category} onChange={(e) => setCategory(e.target.value)} sx={{ minWidth: 140 }}>
            <MenuItem value="">All types</MenuItem>
            {Object.entries(CATEGORY_LABEL).map(([k, v]) => (
              <MenuItem key={k} value={k}>
                {v}
              </MenuItem>
            ))}
          </TextField>
          <Button variant="outlined" startIcon={<MailOutlineRoundedIcon />} onClick={() => setOpen(true)}>
            Request datasheet
          </Button>
        </Stack>
      </Stack>

      {docs.length === 0 ? (
        <Alert severity="info">No documents in this category yet.</Alert>
      ) : (
        <Grid container spacing={2}>
          {docs.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc._id}>
              <Paper elevation={0} sx={{ p: 2.25, borderRadius: 3, border: "1px solid #dbe4ea", height: "100%" }}>
                <Chip size="small" label={CATEGORY_LABEL[doc.category] || doc.category} sx={{ mb: 1 }} />
                <Typography sx={{ fontWeight: 800, color: PORTAL_TEAL }}>{doc.title}</Typography>
                <Typography sx={{ mt: 0.75, fontSize: 13, color: "text.secondary", minHeight: 40 }}>
                  {doc.description || "Technical reference document"}
                </Typography>
                <Button
                  sx={{ mt: 1.5 }}
                  variant="contained"
                  color="secondary"
                  startIcon={<OpenInNewRoundedIcon />}
                  href={doc.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Request a datasheet</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Document title"
              value={reqForm.title}
              onChange={(e) => setReqForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Product name"
              value={reqForm.productName}
              onChange={(e) => setReqForm((f) => ({ ...f, productName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Details"
              value={reqForm.message}
              onChange={(e) => setReqForm((f) => ({ ...f, message: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={requestDoc}>
            Send request
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={toast.open} autoHideDuration={3500} onClose={() => setToast((t) => ({ ...t, open: false }))}>
        <Alert severity={toast.severity}>{toast.message}</Alert>
      </Snackbar>
    </Stack>
  );
};
