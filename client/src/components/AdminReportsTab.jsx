import { useState, useEffect, useCallback } from "react";
import { http, authHeaders } from "../api/http";
import { getAuthToken } from "../auth/session";
import DownloadRoundedIcon from "@mui/icons-material/DownloadRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import ShoppingBagOutlinedIcon from "@mui/icons-material/ShoppingBagOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import LocationCityRoundedIcon from "@mui/icons-material/LocationCityRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import ProductionQuantityLimitsRoundedIcon from "@mui/icons-material/ProductionQuantityLimitsRounded";

export const AdminReportsTab = () => {
  const token = getAuthToken();
  const [rangePreset, setRangePreset] = useState("30"); // 7, 30, 90
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [abandonedCarts, setAbandonedCarts] = useState([]);
  const [error, setError] = useState("");

  const fetchReports = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError("");
    try {
      const days = parseInt(rangePreset, 10) || 30;
      const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const end = new Date().toISOString();

      const [reportsRes, cartsRes] = await Promise.all([
        http.get(`/admin/reports?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`, authHeaders(token)),
        http.get("/admin/abandoned-carts", authHeaders(token)).catch(() => ({ data: [] })),
      ]);

      setData(reportsRes.data);
      setAbandonedCarts(Array.isArray(cartsRes.data) ? cartsRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, [token, rangePreset]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleExport = (type) => {
    if (!token) return;
    const days = parseInt(rangePreset, 10) || 30;
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const end = new Date().toISOString();
    const url = `/api/admin/export/${type}.csv?startDate=${encodeURIComponent(start)}&endDate=${encodeURIComponent(end)}`;
    
    // Download via token auth
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `marblex_${type}_${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
      })
      .catch(() => alert("Export failed"));
  };

  const totalPeriodRevenue = (data?.salesByDay || []).reduce((sum, d) => sum + (d.revenue || 0), 0);
  const totalPeriodOrders = (data?.salesByDay || []).reduce((sum, d) => sum + (d.orders || 0), 0);
  const aov = totalPeriodOrders > 0 ? Math.round(totalPeriodRevenue / totalPeriodOrders) : 0;
  const totalDealerCredit = (data?.dealers || []).reduce((sum, d) => sum + (d.creditUsed || 0), 0);

  const maxRevenue = Math.max(...(data?.salesByDay || []).map((d) => d.revenue || 0), 1);

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div>
          <h2 className="text-lg font-black text-[#0a3d52] dark:text-white flex items-center gap-2">
            <span>Executive Reports & Analytics</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time sales performance, dealer balances, product velocity, and CSV exports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {["7", "30", "90"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setRangePreset(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  rangePreset === p
                    ? "bg-white dark:bg-[#0a3d52] text-[#0a3d52] dark:text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                }`}
              >
                Last {p} Days
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchReports}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            title="Refresh"
          >
            <RefreshRoundedIcon sx={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Export Bar */}
      <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-50 dark:bg-[#081822] rounded-xl border border-slate-200 dark:border-slate-800">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">Download Spreadsheets:</span>
        <button
          type="button"
          onClick={() => handleExport("orders")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs transition"
        >
          <DownloadRoundedIcon sx={{ fontSize: 16 }} /> Orders CSV
        </button>
        <button
          type="button"
          onClick={() => handleExport("customers")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0a3d52] hover:bg-[#0d4e68] text-white font-bold text-xs shadow-xs transition"
        >
          <DownloadRoundedIcon sx={{ fontSize: 16 }} /> Customers CSV
        </button>
        <button
          type="button"
          onClick={() => handleExport("products")}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs shadow-xs transition"
        >
          <DownloadRoundedIcon sx={{ fontSize: 16 }} /> Products CSV
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold text-sm">Generating Analytics...</div>
      ) : error ? (
        <div className="p-4 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">{error}</div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c222e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <TrendingUpRoundedIcon sx={{ fontSize: 15 }} className="text-emerald-500" /> Period Revenue
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0a3d52] dark:text-white mt-1">
                PKR {totalPeriodRevenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">Past {rangePreset} days confirmed</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c222e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <ShoppingBagOutlinedIcon sx={{ fontSize: 15 }} className="text-sky-500" /> Orders Placed
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0a3d52] dark:text-white mt-1">
                {totalPeriodOrders.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">Total checkout conversions</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c222e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <AccountBalanceWalletOutlinedIcon sx={{ fontSize: 15 }} className="text-indigo-500" /> Avg Order Value
              </span>
              <p className="text-xl sm:text-2xl font-black text-[#0a3d52] dark:text-white mt-1">
                PKR {aov.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">Per ticket average</span>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-[#0c222e] border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-[11px] font-bold uppercase text-slate-400 flex items-center gap-1">
                <WarningAmberRoundedIcon sx={{ fontSize: 15 }} className="text-amber-500" /> Dealer Outstanding
              </span>
              <p className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
                PKR {totalDealerCredit.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-semibold">Across {data?.dealers?.length || 0} active dealers</span>
            </div>
          </div>

          {/* Sales by Day Bar Visualization */}
          <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-black text-[#0a3d52] dark:text-white mb-3 flex items-center justify-between">
              <span>Sales by Day Velocity</span>
              <span className="text-xs font-semibold text-slate-400">PKR {totalPeriodRevenue.toLocaleString()} Total</span>
            </h3>
            {data?.salesByDay?.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales recorded in this date range.</p>
            ) : (
              <div className="space-y-2 mt-4 max-h-64 overflow-y-auto pr-2">
                {(data?.salesByDay || []).map((d) => (
                  <div key={d._id} className="flex items-center gap-3 text-xs">
                    <span className="w-24 shrink-0 font-bold text-slate-500 font-mono text-[11px]">{d._id}</span>
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 h-6 rounded-lg overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-[#0a3d52] to-[#ff6b4a] h-full rounded-lg transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(6, ((d.revenue || 0) / maxRevenue) * 100))}%` }}
                      />
                      <span className="absolute inset-y-0 left-2 flex items-center text-[10px] font-bold text-white drop-shadow-xs">
                        {d.orders} orders
                      </span>
                    </div>
                    <span className="w-28 shrink-0 text-right font-black text-[#0a3d52] dark:text-white">
                      PKR {(d.revenue || 0).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Two-Column Grid: Top Products & City Revenue */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Products */}
            <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-black text-[#0a3d52] dark:text-white mb-3">
                Top Selling Materials & Products
              </h3>
              <div className="space-y-2">
                {(data?.topProducts || []).slice(0, 8).map((p, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-5 h-5 rounded-full bg-[#0a3d52] text-white text-[10px] font-black flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{p._id || "Material"}</span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-black text-[#ff6b4a] block">{p.qty} units</span>
                      <span className="text-[10px] text-slate-400">PKR {(p.revenue || 0).toLocaleString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* City Revenue Split */}
            <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-black text-[#0a3d52] dark:text-white mb-3 flex items-center gap-1.5">
                <LocationCityRoundedIcon sx={{ fontSize: 17 }} /> Revenue by Region & City
              </h3>
              <div className="space-y-2">
                {(data?.revenueByCity || []).slice(0, 8).map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{c._id || "Other / Unspecified"}</span>
                    <div className="text-right">
                      <span className="font-black text-[#0a3d52] dark:text-white block">PKR {(c.revenue || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{c.count} orders</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two-Column Grid: Low Stock Alert & Dealer Outstanding */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Low Stock Alert */}
            <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-black text-rose-600 dark:text-rose-400 mb-3 flex items-center gap-1.5">
                <ProductionQuantityLimitsRoundedIcon sx={{ fontSize: 17 }} /> Critical Low Stock Alert (≤ 5 units)
              </h3>
              {(data?.lowStock || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">All catalog items have healthy inventory.</p>
              ) : (
                <div className="space-y-2">
                  {(data?.lowStock || []).map((p) => (
                    <div key={p._id} className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{p.name}</span>
                        <span className="text-[10px] text-slate-500">{p.category}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full bg-rose-600 text-white font-black text-[11px]">
                        {p.stock} left
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Dealer Outstanding Balances */}
            <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
              <h3 className="text-sm font-black text-[#0a3d52] dark:text-white mb-3">
                Dealer Credit & Outstanding Ledgers
              </h3>
              {(data?.dealers || []).length === 0 ? (
                <p className="text-xs text-slate-400 py-4">No outstanding balances across dealers.</p>
              ) : (
                <div className="space-y-2">
                  {(data?.dealers || []).map((d) => (
                    <div key={d._id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white block">{d.name}</span>
                        <span className="text-[10px] text-slate-400">{d.phone || d.email}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-black text-rose-600 block">PKR {Number(d.creditUsed || 0).toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">Limit: PKR {Number(d.creditLimit || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Abandoned Carts Section */}
          <div className="bg-white dark:bg-[#0c222e] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <h3 className="text-sm font-black text-[#0a3d52] dark:text-white mb-2">
              Unrecovered / Abandoned Carts ({abandonedCarts.length})
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Registered customers who added industrial products to cart but did not complete checkout.
            </p>
            {abandonedCarts.length === 0 ? (
              <p className="text-xs text-slate-400 py-2">No abandoned carts currently recorded.</p>
            ) : (
              <div className="space-y-2">
                {abandonedCarts.slice(0, 10).map((c) => (
                  <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-xs">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{c.name || c.email || "Customer"}</span>
                      <span className="text-[10px] text-slate-400">{c.phone || c.email} · {c.items?.length || 0} item(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="font-black text-[#0a3d52] dark:text-white block">PKR {Number(c.subtotal || 0).toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400">{new Date(c.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

