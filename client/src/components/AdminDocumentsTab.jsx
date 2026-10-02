import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { authHeaders, http } from "../api/http";

const CATEGORIES = ["tds", "sds", "manual", "brochure", "certificate", "other"];

export const AdminDocumentsTab = ({ token, showToast }) => {
  const [docs, setDocs] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    category: "brochure",
    description: "",
    fileUrl: "",
    active: true,
  });

  const load = async () => {
    const res = await http.get("/portal/admin/documents", authHeaders(token));
    setDocs(res.data || []);
  };

  useEffect(() => {
    load().catch(() => showToast?.("error", "Failed to load documents"));
  }, [token]);

  const create = async () => {
    try {
      await http.post("/portal/admin/documents", form, authHeaders(token));
      setOpen(false);
      setForm({ title: "", category: "brochure", description: "", fileUrl: "", active: true });
      showToast?.("success", "Document added.");
      await load();
    } catch (err) {
      showToast?.("error", err.response?.data?.message || "Failed");
    }
  };

  const toggleActive = async (doc) => {
    await http.put(`/portal/admin/documents/${doc._id}`, { active: !doc.active }, authHeaders(token));
    await load();
  };

  const remove = async (id) => {
    await http.delete(`/portal/admin/documents/${id}`, authHeaders(token));
    showToast?.("success", "Document removed.");
    await load();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Technical Documents</h2>
          <p className="text-sm text-[#565e69]">TDS / SDS / manuals shown in the client portal library.</p>
        </div>
        <Button variant="contained" color="secondary" onClick={() => setOpen(true)}>
          Add document
        </Button>
      </div>

      {docs.length === 0 ? (
        <Alert severity="info">No documents yet.</Alert>
      ) : (
        <Stack spacing={1.25}>
          {docs.map((doc) => (
            <Box key={doc._id} className="rounded-2xl border border-[#e0e6ed] bg-white p-4 flex flex-col sm:flex-row justify-between gap-3">
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography sx={{ fontWeight: 800 }}>{doc.title}</Typography>
                  <Chip size="small" label={doc.category} />
                  <Chip size="small" label={doc.active ? "active" : "hidden"} color={doc.active ? "success" : "default"} />
                </Stack>
                <Typography sx={{ fontSize: 13, color: "text.secondary", mt: 0.5 }}>
                  {doc.description || doc.fileUrl}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" href={doc.fileUrl} target="_blank" rel="noreferrer">
                  Open
                </Button>
                <Button size="small" onClick={() => toggleActive(doc)}>
                  {doc.active ? "Hide" : "Show"}
                </Button>
                <Button size="small" color="error" onClick={() => remove(doc._id)}>
                  Delete
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add portal document</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <TextField
              label="Title"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              fullWidth
            />
            <TextField
              select
              label="Category"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              fullWidth
            >
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="File / page URL"
              value={form.fileUrl}
              onChange={(e) => setForm((f) => ({ ...f, fileUrl: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Description"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={create} disabled={!form.title || !form.fileUrl}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
