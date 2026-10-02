import { useMemo, useState } from "react";
import { Alert, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { authHeaders, http } from "../api/http";

export const AdminPaymentQueueTab = ({ token, orders = [], showToast, onUpdated, renderOrderCard }) => {
  const queue = useMemo(
    () =>
      (orders || []).filter((o) =>
        ["pending_verification", "pending"].includes(o.paymentStatus) &&
        ["easypaisa", "jazzcash", "bank_transfer", "stripe"].includes(o.paymentMethod)
      ),
    [orders]
  );

  const [fulfillId, setFulfillId] = useState("");
  const [fulfill, setFulfill] = useState({ dispatchNote: "", courierName: "", trackingRef: "" });

  const markPaid = async (id) => {
    try {
      await http.patch(`/admin/orders/${id}/payment`, { paymentStatus: "paid" }, authHeaders(token));
      showToast?.("success", "Marked as paid.");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to update payment.");
    }
  };

  const markFailed = async (id) => {
    try {
      await http.patch(`/admin/orders/${id}/payment`, { paymentStatus: "failed" }, authHeaders(token));
      showToast?.("success", "Marked as failed.");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to update payment.");
    }
  };

  const saveFulfillment = async (order) => {
    try {
      await http.patch(`/admin/orders/${order._id}/fulfillment`, fulfill, authHeaders(token));
      showToast?.("success", "Fulfillment details saved.");
      setFulfillId("");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to save fulfillment.");
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-[#0a3d52] font-heading">Payment Verification Queue</h2>
        <p className="text-sm text-[#565e69]">
          Manual wallet / bank transfers awaiting proof review · {queue.length} in queue
        </p>
      </div>

      {queue.length === 0 ? (
        <Alert severity="success">No payments waiting for verification.</Alert>
      ) : (
        <Stack spacing={2}>
          {queue.map((order) => (
            <Box key={order._id} className="space-y-2">
              {renderOrderCard ? renderOrderCard(order) : null}
              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 flex flex-wrap gap-2 items-center">
                <Button size="small" variant="contained" color="success" onClick={() => markPaid(order._id)}>
                  Mark paid
                </Button>
                <Button size="small" color="error" variant="outlined" onClick={() => markFailed(order._id)}>
                  Reject / failed
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setFulfillId(order._id);
                    setFulfill({
                      dispatchNote: order.dispatchNote || "",
                      courierName: order.courierName || "",
                      trackingRef: order.trackingRef || "",
                    });
                  }}
                >
                  Fulfillment
                </Button>
                {order.paymentScreenshotUrl && (
                  <a
                    href={order.paymentScreenshotUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-[#ff6b4a] underline"
                  >
                    Open receipt
                  </a>
                )}
              </div>
              {fulfillId === order._id && (
                <div className="rounded-xl border border-[#e0e6ed] bg-white p-3 space-y-2">
                  <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Dispatch / courier</Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      size="small"
                      label="Courier"
                      value={fulfill.courierName}
                      onChange={(e) => setFulfill((f) => ({ ...f, courierName: e.target.value }))}
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label="Tracking ref"
                      value={fulfill.trackingRef}
                      onChange={(e) => setFulfill((f) => ({ ...f, trackingRef: e.target.value }))}
                      fullWidth
                    />
                  </Stack>
                  <TextField
                    size="small"
                    label="Dispatch note"
                    value={fulfill.dispatchNote}
                    onChange={(e) => setFulfill((f) => ({ ...f, dispatchNote: e.target.value }))}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <Stack direction="row" spacing={1}>
                    <Button size="small" variant="contained" onClick={() => saveFulfillment(order)}>
                      Save
                    </Button>
                    <Button size="small" onClick={() => setFulfillId("")}>
                      Cancel
                    </Button>
                  </Stack>
                </div>
              )}
            </Box>
          ))}
        </Stack>
      )}
    </div>
  );
};
