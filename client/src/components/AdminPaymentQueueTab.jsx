import { useMemo, useState } from "react";
import { authHeaders, http } from "../api/http";

export const AdminPaymentQueueTab = ({ token, orders = [], showToast, onUpdated, renderOrderCard }) => {
  const queue = useMemo(
    () =>
      (orders || []).filter(
        (o) =>
          ["pending_verification", "pending"].includes(o.paymentStatus) &&
          ["easypaisa", "jazzcash", "bank_transfer", "stripe"].includes(o.paymentMethod)
      ),
    [orders]
  );

  const [fulfillId, setFulfillId] = useState("");
  const [fulfill, setFulfill] = useState({ dispatchNote: "", courierName: "", trackingRef: "" });
  const [busyId, setBusyId] = useState("");

  const markPaid = async (id) => {
    setBusyId(id);
    try {
      await http.patch(`/admin/orders/${id}/payment`, { paymentStatus: "paid" }, authHeaders(token));
      showToast?.("success", "Marked as paid.");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to update payment.");
    } finally {
      setBusyId("");
    }
  };

  const markFailed = async (id) => {
    setBusyId(id);
    try {
      await http.patch(`/admin/orders/${id}/payment`, { paymentStatus: "failed" }, authHeaders(token));
      showToast?.("success", "Marked as failed.");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to update payment.");
    } finally {
      setBusyId("");
    }
  };

  const saveFulfillment = async (order) => {
    setBusyId(order._id);
    try {
      await http.patch(`/admin/orders/${order._id}/fulfillment`, fulfill, authHeaders(token));
      showToast?.("success", "Fulfillment details saved.");
      setFulfillId("");
      onUpdated?.();
    } catch {
      showToast?.("error", "Failed to save fulfillment.");
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 mb-1.5">
            <span className="h-2 w-2 rounded-full bg-[#ff6b4a] shadow-[0_0_0_4px_rgba(255,107,74,.2)]" />
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#6b8190]">
              Revenue desk
            </span>
          </div>
          <h2 className="text-[22px] sm:text-xl md:text-2xl font-extrabold text-[#0a3d52] font-heading tracking-[-0.4px]">
            Payment Verification Queue
          </h2>
          <p className="text-[12px] sm:text-xs text-[#6b8190] mt-1 max-w-[52ch]">
            Manual wallet / bank transfers awaiting proof review
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center px-3.5 py-2 rounded-xl bg-white border border-[#e2e8ec] text-xs font-extrabold text-[#0a3d52] shadow-[0_3px_0_#e8eef1]">
            In queue
            <span className="ml-1.5 min-w-[22px] h-[22px] px-1.5 rounded-lg grid place-items-center bg-[#ff6b4a] text-white text-[12px]">
              {queue.length}
            </span>
          </span>
        </div>
      </div>

      {queue.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#cfe8d9] bg-gradient-to-b from-emerald-50/80 to-white px-5 py-12 text-center">
          <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-emerald-100 text-emerald-700 grid place-items-center text-lg font-black shadow-[0_3px_0_#a7d4b8]">
            ✓
          </div>
          <p className="text-[15px] font-extrabold text-[#0a3d52]">Queue clear</p>
          <p className="text-xs text-[#6b8190] mt-1">No payments waiting for verification.</p>
        </div>
      ) : (
        <div className="space-y-3.5 sm:space-y-4">
          {queue.map((order) => {
            const isBusy = busyId === order._id;
            const isFulfillOpen = fulfillId === order._id;
            return (
              <section key={order._id} className="space-y-2.5">
                {renderOrderCard ? renderOrderCard(order) : null}

                <div className="rounded-2xl border border-[#ffe0d4] bg-gradient-to-br from-[#fff7f3] via-white to-[#fff8f5] p-3 sm:p-3.5 shadow-[0_8px_20px_-16px_rgba(194,65,12,.35)]">
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#c2410c]">
                      Verification actions
                    </p>
                    {order.paymentScreenshotUrl ? (
                      <a
                        href={order.paymentScreenshotUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-extrabold text-[#ff6b4a] hover:underline"
                      >
                        Open receipt →
                      </a>
                    ) : (
                      <span className="text-[10px] font-bold text-[#94a3b8]">No receipt uploaded</span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => markPaid(order._id)}
                      className="min-h-[44px] rounded-xl px-3 py-2.5 text-[13px] font-extrabold text-white bg-gradient-to-b from-[#22c55e] to-[#16a34a] shadow-[0_3px_0_#15803d] disabled:opacity-60"
                    >
                      {isBusy ? "Updating…" : "Mark paid"}
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => markFailed(order._id)}
                      className="min-h-[44px] rounded-xl px-3 py-2.5 text-[13px] font-extrabold text-[#e5484d] bg-white border border-[#f0b4b7] shadow-[0_3px_0_#f3d5d7] disabled:opacity-60"
                    >
                      Reject / failed
                    </button>
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => {
                        if (isFulfillOpen) {
                          setFulfillId("");
                          return;
                        }
                        setFulfillId(order._id);
                        setFulfill({
                          dispatchNote: order.dispatchNote || "",
                          courierName: order.courierName || "",
                          trackingRef: order.trackingRef || "",
                        });
                      }}
                      className={`min-h-[44px] rounded-xl px-3 py-2.5 text-[13px] font-extrabold border shadow-[0_3px_0_#e8eef1] disabled:opacity-60 ${
                        isFulfillOpen
                          ? "bg-[#0a3d52] text-white border-[#0a3d52] shadow-[0_3px_0_#07202b]"
                          : "bg-white text-[#0a3d52] border-[#e2e8ec]"
                      }`}
                    >
                      {isFulfillOpen ? "Close fulfillment" : "Fulfillment"}
                    </button>
                  </div>

                  {isFulfillOpen ? (
                    <div className="mt-3 pt-3 border-t border-[#ffe0d4] space-y-2.5">
                      <p className="text-[11px] font-extrabold text-[#0a3d52]">Dispatch / courier</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#6b8190] mb-1">
                            Courier
                          </span>
                          <input
                            value={fulfill.courierName}
                            onChange={(e) => setFulfill((f) => ({ ...f, courierName: e.target.value }))}
                            className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-semibold text-[#0a3d52] outline-none focus:border-[#ffb39a]"
                            placeholder="TCS, Leopards…"
                          />
                        </label>
                        <label className="block">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-[#6b8190] mb-1">
                            Tracking ref
                          </span>
                          <input
                            value={fulfill.trackingRef}
                            onChange={(e) => setFulfill((f) => ({ ...f, trackingRef: e.target.value }))}
                            className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-semibold text-[#0a3d52] outline-none focus:border-[#ffb39a]"
                            placeholder="Tracking number"
                          />
                        </label>
                      </div>
                      <label className="block">
                        <span className="block text-[10px] font-bold uppercase tracking-wide text-[#6b8190] mb-1">
                          Dispatch note
                        </span>
                        <textarea
                          value={fulfill.dispatchNote}
                          onChange={(e) => setFulfill((f) => ({ ...f, dispatchNote: e.target.value }))}
                          rows={2}
                          className="w-full rounded-xl border border-[#e2e8ec] bg-[#f8fafc] px-3 py-2.5 text-[13px] font-semibold text-[#0a3d52] outline-none focus:border-[#ffb39a] resize-y"
                          placeholder="Optional note for logistics"
                        />
                      </label>
                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => saveFulfillment(order)}
                          className="min-h-[42px] rounded-xl px-4 py-2 text-[13px] font-extrabold text-white bg-gradient-to-b from-[#145068] to-[#0a3d52] shadow-[0_3px_0_#07202b] disabled:opacity-60"
                        >
                          {isBusy ? "Saving…" : "Save fulfillment"}
                        </button>
                        <button
                          type="button"
                          onClick={() => setFulfillId("")}
                          className="min-h-[42px] rounded-xl px-4 py-2 text-[13px] font-extrabold text-[#6b8190] bg-white border border-[#e2e8ec]"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
};
