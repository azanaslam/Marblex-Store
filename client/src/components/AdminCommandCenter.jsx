/**
 * Figma-inspired eCommerce Command Center for MARBLEX admin.
 * Clean SaaS cards + charts — brand colors: teal #0a3d52 / coral #ff6b4a.
 */
const money = (n) => `PKR ${Number(n || 0).toLocaleString()}`;

const STATUS_PILL = {
  pending: "bg-orange-50 text-orange-600 border-orange-100",
  processing: "bg-sky-50 text-sky-700 border-sky-100",
  "on the way": "bg-amber-50 text-amber-700 border-amber-100",
  delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  cancelled: "bg-rose-50 text-rose-600 border-rose-100",
};

const Sparkline = ({ points = [], color = "#ff6b4a", strokeWidth = 2 }) => {
  const vals = points.length ? points : [2, 4, 3, 6, 5, 8, 7];
  const max = Math.max(...vals, 1);
  const min = Math.min(...vals, 0);
  const range = max - min || 1;
  const w = 88;
  const h = 36;
  const coords = vals.map((v, i) => {
    const x = (i / Math.max(vals.length - 1, 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  const fill = `0,${h} ${coords.join(" ")} ${w},${h}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <polyline points={fill} fill={`${color}22`} stroke="none" />
      <polyline
        points={coords.join(" ")}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

const Donut = ({ segments, size = 140, thickness = 18, centerLabel, centerSub }) => {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#eef2f6" strokeWidth={thickness} />
        {segments.map((seg) => {
          const len = (seg.value / total) * c;
          const el = (
            <circle
              key={seg.label}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${len} ${c - len}`}
              strokeDashoffset={-offset}
              strokeLinecap="butt"
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className="text-2xl font-extrabold text-[#0f1929] tracking-tight">{centerLabel}</div>
        {centerSub ? <div className="text-[10px] font-semibold text-[#8b95a5] uppercase tracking-wide">{centerSub}</div> : null}
      </div>
    </div>
  );
};

const KpiCard = ({ title, value, delta, positive, spark, sparkColor, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="text-left rounded-2xl bg-white border border-[#e8edf2] p-4 sm:p-5 shadow-[0_1px_3px_rgba(15,25,41,0.04)] hover:shadow-md hover:border-[#ffc4b4] transition-all"
  >
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8b95a5]">{title}</p>
        <p className="mt-1.5 text-2xl sm:text-[28px] font-extrabold text-[#0f1929] tracking-tight truncate">{value}</p>
        <p className={`mt-1.5 text-xs font-bold ${positive ? "text-emerald-600" : "text-rose-500"}`}>
          {delta}
        </p>
      </div>
      <Sparkline points={spark} color={sparkColor} />
    </div>
  </button>
);

export const AdminCommandCenter = ({
  overview,
  usersData,
  products = [],
  orders = [],
  websiteShare = 0,
  whatsappShare = 0,
  paidShare = 0,
  paymentQueueCount = 0,
  pendingAccessCount = 0,
  visualBars = [],
  onNavigate,
}) => {
  const revenue = overview?.totalRevenue || 0;
  const orderCount = overview?.orderCount || 0;
  const clients = usersData?.totalUsers || 0;
  const unpaidPct =
    orderCount > 0 ? Math.round(((overview?.unpaidCount || 0) / orderCount) * 100) : 0;
  const paidPct = paidShare || 0;

  const weekSpark = (visualBars || []).map((b) => Number(b.revenue || b.value || 0));
  const orderSpark = (visualBars || []).map((b) => Number(b.orders ?? b.value ?? 0));

  const maxBar = Math.max(...(visualBars || []).map((b) => Number(b.revenue || 0)), 1);
  const peakIdx = (visualBars || []).reduce(
    (best, b, i, arr) => (Number(b.revenue || 0) > Number(arr[best]?.revenue || 0) ? i : best),
    0
  );

  const channelSegments = [
    { label: "Website", value: overview?.websiteOrders || 0, color: "#3b82f6", amount: null },
    { label: "WhatsApp", value: overview?.whatsappOrders || 0, color: "#ff6b4a", amount: null },
    {
      label: "Other",
      value: Math.max(0, orderCount - (overview?.websiteOrders || 0) - (overview?.whatsappOrders || 0)),
      color: "#f43f5e",
      amount: null,
    },
  ].filter((s) => s.value > 0);
  const channelTotal = channelSegments.reduce((s, x) => s + x.value, 0) || 1;

  const paymentRate = Math.min(100, Math.max(0, paidPct));
  const pendingVerify = paymentQueueCount || overview?.pendingVerification || 0;

  const bestsellers = (overview?.topProducts || []).slice(0, 5);
  const recent = (orders || []).slice(0, 8);

  const todayLabel = new Date().toLocaleDateString("en-US", {
    timeZone: "Asia/Karachi",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-5 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8b95a5]">Overview</p>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0a3d52] tracking-tight mt-0.5">
            eCommerce Dashboard
          </h2>
          <p className="text-sm text-[#565e69] mt-1">MARBLEX store performance · live Atlas metrics</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-[#e8edf2] bg-white px-3.5 py-2 text-xs font-semibold text-[#565e69] shadow-sm">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Last 7 days · {todayLabel}
        </div>
      </div>

      {/* KPI row — Figma top cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard
          title="Revenue"
          value={money(revenue)}
          delta={`${paidPct}% paid clearance`}
          positive
          spark={weekSpark}
          sparkColor="#ff6b4a"
          onClick={() => onNavigate?.(1)}
        />
        <KpiCard
          title="Orders"
          value={String(orderCount)}
          delta={`${overview?.websiteOrders || 0} web · ${overview?.whatsappOrders || 0} WA`}
          positive={orderCount > 0}
          spark={orderSpark}
          sparkColor="#f43f5e"
          onClick={() => onNavigate?.(1)}
        />
        <KpiCard
          title="Clients"
          value={clients >= 1000 ? `${(clients / 1000).toFixed(1)}K` : String(clients)}
          delta={pendingAccessCount > 0 ? `${pendingAccessCount} pending access` : "+verified network"}
          positive={pendingAccessCount === 0}
          spark={weekSpark.map((v, i) => v + i * 3)}
          sparkColor="#10b981"
          onClick={() => onNavigate?.(3)}
        />
        <KpiCard
          title="Paid rate"
          value={`${paidPct}%`}
          delta={unpaidPct ? `${unpaidPct}% still unpaid` : "Healthy collection"}
          positive={paidPct >= 50}
          spark={orderSpark}
          sparkColor="#ff6b4a"
          onClick={() => onNavigate?.(12)}
        />
      </div>

      {/* Bar chart + payment "cart" donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-[#0f1929]">Dashboard</h3>
              <p className="text-xs text-[#8b95a5] mt-0.5">Daily revenue · Asia/Karachi</p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate?.(9)}
              className="text-xs font-bold text-[#ff6b4a] hover:underline"
            >
              Advanced Report
            </button>
          </div>

          <div className="h-56 flex items-end gap-2 sm:gap-3 px-1">
            {(visualBars || []).map((bar, i) => {
              const rev = Number(bar.revenue || 0);
              const h = Math.max(6, Math.round((rev / maxBar) * 100));
              const active = i === peakIdx;
              return (
                <div key={bar.date || bar.label || i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="text-[10px] font-bold text-[#8b95a5] opacity-0 group-hover:opacity-100 transition-opacity text-center leading-tight">
                    {money(rev)}
                  </div>
                  <div
                    className={`w-full max-w-[28px] rounded-md transition-all duration-300 ${
                      active
                        ? "bg-[#ff6b4a] shadow-[0_8px_24px_rgba(255,107,74,0.45)]"
                        : "bg-[#ffb59f] group-hover:bg-[#ff6b4a]"
                    }`}
                    style={{ height: `${h}%` }}
                    title={`${bar.label}: ${money(rev)}`}
                  />
                  <span className="text-[10px] sm:text-xs font-semibold text-[#8b95a5]">{bar.label}</span>
                </div>
              );
            })}
            {!visualBars?.length && (
              <div className="w-full h-full flex items-center justify-center text-sm text-[#8b95a5]">No weekly data yet</div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-base font-bold text-[#0f1929]">Payments</h3>
            <button type="button" onClick={() => onNavigate?.(12)} className="text-xs font-bold text-[#ff6b4a]">
              Queue →
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center py-2">
            <Donut
              size={150}
              thickness={16}
              centerLabel={`${paymentRate}%`}
              centerSub="Paid"
              segments={[
                { label: "Paid", value: Math.max(paymentRate, 1), color: "#ff6b4a" },
                { label: "Rest", value: Math.max(100 - paymentRate, 1), color: "#eef2f6" },
              ]}
            />
          </div>
          <div className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#8b95a5] font-medium">Pending verify</span>
              <span className="font-bold text-[#0f1929]">{pendingVerify}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8b95a5] font-medium">Unpaid aging</span>
              <span className="font-bold text-[#0f1929]">{money(overview?.unpaidAmount || 0)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Channel donut + ops traffic line */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
          <h3 className="text-base font-bold text-[#0f1929] mb-4">Revenue by channel</h3>
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Donut
              size={160}
              thickness={22}
              centerLabel={`${websiteShare || Math.round(((overview?.websiteOrders || 0) / channelTotal) * 100)}%`}
              centerSub="Web"
              segments={
                channelSegments.length
                  ? channelSegments
                  : [{ label: "Empty", value: 1, color: "#eef2f6" }]
              }
            />
            <div className="flex-1 w-full space-y-3">
              {(channelSegments.length ? channelSegments : [{ label: "No orders", value: 1, color: "#cbd5e1" }]).map(
                (seg) => {
                  const pct = Math.round((seg.value / channelTotal) * 100);
                  return (
                    <div key={seg.label} className="flex items-center gap-3">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: seg.color }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between text-sm">
                          <span className="font-semibold text-[#0f1929]">{seg.label}</span>
                          <span className="font-bold text-[#565e69]">{seg.value} · {pct}%</span>
                        </div>
                        <div className="mt-1 h-1.5 rounded-full bg-[#eef2f6] overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: seg.color }} />
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
              <div className="pt-2 text-xs text-[#8b95a5]">
                Paid share <span className="font-bold text-[#ff6b4a]">{paidShare}%</span> · Catalog{" "}
                <span className="font-bold text-[#0a3d52]">{products.length}</span> SKUs
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
          <h3 className="text-base font-bold text-[#0f1929] mb-4">Ops traffic</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b95a5]">Open RFQs</p>
              <p className="text-2xl font-extrabold text-[#0f1929] mt-1">{overview?.openQuotes || 0}</p>
              <p className="text-xs font-bold text-emerald-600 mt-0.5">Quote desk</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b95a5]">Tickets</p>
              <p className="text-2xl font-extrabold text-[#0f1929] mt-1">{overview?.openTickets || 0}</p>
              <p className="text-xs font-bold text-rose-500 mt-0.5">Support backlog</p>
            </div>
          </div>
          <div className="h-28 w-full">
            <svg viewBox="0 0 320 100" className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <linearGradient id="opsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ff6b4a" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ff6b4a" stopOpacity="0" />
                </linearGradient>
              </defs>
              {(() => {
                const pts = weekSpark.length ? weekSpark : [1, 2, 1.5, 3, 2.5, 4, 3];
                const max = Math.max(...pts, 1);
                const path = pts
                  .map((v, i) => {
                    const x = (i / Math.max(pts.length - 1, 1)) * 320;
                    const y = 90 - (v / max) * 70;
                    return `${i === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ");
                const area = `${path} L320,100 L0,100 Z`;
                return (
                  <>
                    <path d={area} fill="url(#opsFill)" />
                    <path d={path} fill="none" stroke="#ff6b4a" strokeWidth="3" strokeLinecap="round" />
                  </>
                );
              })()}
            </svg>
          </div>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={() => onNavigate?.(13)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#fff4f0] text-[#ff6b4a] border border-[#ffd5c8]"
            >
              Open RFQs
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(14)}
              className="text-xs font-bold px-3 py-1.5 rounded-lg bg-[#f5f7fa] text-[#0a3d52] border border-[#e8edf2]"
            >
              Tickets
            </button>
          </div>
        </div>
      </div>

      {/* Bestsellers + forecast tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#0f1929]">Bestsellers</h3>
            <button type="button" onClick={() => onNavigate?.(4)} className="text-xs font-bold text-[#ff6b4a]">
              Catalog →
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wider text-[#8b95a5] border-b border-[#eef2f6]">
                  <th className="pb-2 font-bold">Product</th>
                  <th className="pb-2 font-bold text-right">Sold</th>
                  <th className="pb-2 font-bold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {bestsellers.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-sm text-[#8b95a5]">
                      No product sales yet
                    </td>
                  </tr>
                ) : (
                  bestsellers.map((p, idx) => (
                    <tr key={p.name} className="border-b border-[#f3f6f9] last:border-0">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-9 w-9 rounded-lg flex items-center justify-center text-xs font-black text-white ${
                              idx % 3 === 0 ? "bg-[#ff6b4a]" : idx % 3 === 1 ? "bg-[#0a3d52]" : "bg-sky-500"
                            }`}
                          >
                            {(p.name || "?").slice(0, 1).toUpperCase()}
                          </div>
                          <span className="text-sm font-semibold text-[#0f1929] line-clamp-1">{p.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-sm font-bold text-[#565e69]">×{p.qty}</td>
                      <td className="py-3 text-right text-sm font-extrabold text-[#0a3d52]">{money(p.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
          <h3 className="text-base font-bold text-[#0f1929] mb-4">Ops snapshot</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                label: "Revenue",
                value: money(revenue),
                delta: `${paidPct}% paid`,
                color: "#ff6b4a",
                spark: weekSpark,
              },
              {
                label: "Unpaid",
                value: money(overview?.unpaidAmount || 0),
                delta: `${overview?.unpaidCount || 0} orders`,
                color: "#f43f5e",
                spark: orderSpark,
              },
              {
                label: "Orders",
                value: String(orderCount),
                delta: `WA ${whatsappShare}%`,
                color: "#10b981",
                spark: orderSpark,
              },
              {
                label: "Low stock",
                value: String((overview?.lowStock || []).length),
                delta: "SKUs ≤ 5",
                color: "#f59e0b",
                spark: weekSpark,
              },
            ].map((tile) => (
              <div key={tile.label} className="rounded-xl border border-[#eef2f6] bg-[#fafbfc] p-3.5">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#8b95a5]">{tile.label}</p>
                    <p className="text-lg font-extrabold text-[#0f1929] mt-1 leading-tight">{tile.value}</p>
                    <p className="text-[11px] font-semibold mt-1" style={{ color: tile.color }}>
                      {tile.delta}
                    </p>
                  </div>
                  <Sparkline points={tile.spark} color={tile.color} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest orders table — Figma bottom */}
      <div className="rounded-2xl bg-white border border-[#e8edf2] p-5 sm:p-6 shadow-[0_1px_3px_rgba(15,25,41,0.04)]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#0f1929]">Latest orders</h3>
            <p className="text-xs text-[#8b95a5]">Most recent store transactions</p>
          </div>
          <button type="button" onClick={() => onNavigate?.(1)} className="text-xs font-bold text-[#ff6b4a] hover:underline">
            View all →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-wider text-[#8b95a5] border-b border-[#eef2f6]">
                <th className="pb-3 font-bold">Order / Customer</th>
                <th className="pb-3 font-bold">Qty</th>
                <th className="pb-3 font-bold">Date</th>
                <th className="pb-3 font-bold">Revenue</th>
                <th className="pb-3 font-bold">Payment</th>
                <th className="pb-3 font-bold">Status</th>
                <th className="pb-3 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-[#8b95a5]">
                    No orders in database yet.
                  </td>
                </tr>
              ) : (
                recent.map((order) => {
                  const qty = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0);
                  const first = order.items?.[0];
                  const statusCls = STATUS_PILL[order.orderStatus] || STATUS_PILL.pending;
                  return (
                    <tr key={order._id} className="border-b border-[#f3f6f9] last:border-0 hover:bg-[#fafbfc]">
                      <td className="py-3.5 pr-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={first?.imageUrl || "/products/Banner1.jpeg"}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover border border-[#e8edf2] bg-[#f5f7fa]"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#0f1929] truncate">
                              {first?.name || order.customerName}
                            </p>
                            <p className="text-[11px] text-[#8b95a5] truncate">
                              {order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`} · {order.customerName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 text-sm font-semibold text-[#565e69]">x{qty || 1}</td>
                      <td className="py-3.5 text-sm text-[#565e69]">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString("en-US", {
                              timeZone: "Asia/Karachi",
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="py-3.5 text-sm font-extrabold text-[#0a3d52]">{money(order.subtotal)}</td>
                      <td className="py-3.5 text-xs font-bold uppercase text-[#565e69]">
                        {String(order.paymentMethod || "cod").replace("_", " ")}
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${statusCls}`}>
                          {order.orderStatus || "pending"}
                        </span>
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => onNavigate?.(order.channel === "whatsapp" ? 2 : 1)}
                          className="text-xs font-bold text-[#ff6b4a] hover:underline"
                        >
                          Open
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
