import { useCallback, useEffect, useState } from "react";
import CampaignIcon from "@mui/icons-material/Campaign";
import { authHeaders, http } from "../api/http";

export const AdminBroadcastTab = ({ token, showToast }) => {
  const [message, setMessage] = useState("");
  const [items, setItems] = useState([]);
  const [sending, setSending] = useState(false);

  const headers = authHeaders(token);

  const loadBroadcasts = useCallback(async () => {
    const res = await http.get("/chat/broadcasts", headers);
    setItems(res.data || []);
  }, [token]);

  useEffect(() => {
    loadBroadcasts().catch(() => showToast?.("error", "Could not load broadcasts."));
  }, [loadBroadcasts, showToast]);

  const sendBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    try {
      await http.post("/admin/broadcast", { message: message.trim() }, headers);
      setMessage("");
      await loadBroadcasts();
      showToast?.("success", "Broadcast sent. All users will see it on their dashboard.");
    } catch {
      showToast?.("error", "Failed to send broadcast.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl border border-blue-100">
            <CampaignIcon />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight">
            Broadcast message
          </h2>
        </div>
        <p className="text-sm text-slate-500 font-medium mb-6">
          This message appears on every logged-in user's dashboard (announcements, offers, updates).
        </p>
        
        <textarea
          rows={5}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-900 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all resize-y mb-4 text-sm"
          placeholder="Write something for all users…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        
        <button 
          onClick={sendBroadcast} 
          disabled={sending || !message.trim()}
          className="btn-3d-blue px-6 py-2.5 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50"
        >
          {sending ? "Sending..." : "Send to all users"}
        </button>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-extrabold text-slate-900 mb-6 tracking-tight">
          Recent broadcasts
        </h3>
        
        <div className="space-y-4">
          {!items.length ? (
            <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 text-slate-500 font-medium bg-slate-50/50">
              No broadcasts sent yet.
            </div>
          ) : (
            items.map((b) => (
              <div key={b._id} className="p-5 rounded-2xl border border-slate-100 bg-slate-50">
                <p className="text-slate-800 font-medium whitespace-pre-wrap word-break mb-3 text-lg leading-relaxed">
                  {b.message}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  {new Date(b.createdAt).toLocaleString()}
                  {b.createdBy?.name ? ` · Admin: ${b.createdBy.name}` : ""}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
