import { useEffect, useMemo, useState } from "react";

const money = (n) => `PKR ${Number(n || 0).toLocaleString("en-US")}`;
const moneyShort = (n) => {
  const v = Number(n || 0);
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(Math.round(v));
};

const pktDayKey = (d = new Date()) =>
  d.toLocaleDateString("en-CA", { timeZone: "Asia/Karachi" });

const STATUS = {
  pending: "p",
  processing: "g",
  "on the way": "g",
  delivered: "g",
  cancelled: "p",
};

const SQ_COLORS = ["#ff6a45", "#0e3a4a", "#3b82f6", "#ff8460", "#0f9d6b"];

const buildBarsFromOrders = (orders, range) => {
  const now = new Date();
  if (range === "t") {
    const labels = ["9a", "11a", "1p", "3p", "5p", "7p", "9p"];
    const buckets = [0, 0, 0, 0, 0, 0, 0];
    const today = pktDayKey(now);
    orders.forEach((o) => {
      if (!o.createdAt) return;
      if (pktDayKey(new Date(o.createdAt)) !== today) return;
      const hour = Number(
        new Date(o.createdAt).toLocaleString("en-US", {
          timeZone: "Asia/Karachi",
          hour: "numeric",
          hour12: false,
        })
      );
      const idx = hour < 10 ? 0 : hour < 12 ? 1 : hour < 14 ? 2 : hour < 16 ? 3 : hour < 18 ? 4 : hour < 20 ? 5 : 6;
      buckets[idx] += Number(o.subtotal || 0);
    });
    return labels.map((label, i) => ({ label, revenue: buckets[i] }));
  }

  if (range === "m") {
    const labels = ["W1", "W2", "W3", "W4", "W5"];
    const buckets = [0, 0, 0, 0, 0];
    const start = new Date(now.getTime() - 34 * 24 * 60 * 60 * 1000);
    orders.forEach((o) => {
      if (!o.createdAt) return;
      const d = new Date(o.createdAt);
      if (d < start) return;
      const daysAgo = Math.floor((now - d) / (24 * 60 * 60 * 1000));
      const weekIdx = Math.min(4, Math.floor((34 - daysAgo) / 7));
      buckets[weekIdx] += Number(o.subtotal || 0);
    });
    return labels.map((label, i) => ({ label, revenue: buckets[i] }));
  }

  // 7 days
  const bars = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const key = pktDayKey(d);
    const label = d.toLocaleDateString("en-US", { timeZone: "Asia/Karachi", weekday: "short" });
    const revenue = orders
      .filter((o) => o.createdAt && pktDayKey(new Date(o.createdAt)) === key)
      .reduce((s, o) => s + Number(o.subtotal || 0), 0);
    bars.push({ label, revenue, date: key });
  }
  return bars;
};

const filterOrdersByRange = (orders, range) => {
  const now = Date.now();
  const ms =
    range === "t" ? 24 * 60 * 60 * 1000 : range === "m" ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
  const today = pktDayKey();
  return (orders || []).filter((o) => {
    if (!o.createdAt) return false;
    if (range === "t") return pktDayKey(new Date(o.createdAt)) === today;
    return now - new Date(o.createdAt).getTime() <= ms;
  });
};

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
  const [range, setRange] = useState("w");
  const [tilt, setTilt] = useState({});

  const rangedOrders = useMemo(() => filterOrdersByRange(orders, range), [orders, range]);

  const bars = useMemo(() => {
    if (range === "w" && visualBars?.length) {
      return visualBars.map((b) => ({ label: b.label, revenue: Number(b.revenue || 0) }));
    }
    return buildBarsFromOrders(orders, range);
  }, [orders, range, visualBars]);

  const maxBar = Math.max(...bars.map((b) => b.revenue), 1);

  const rangeRevenue = rangedOrders.reduce((s, o) => s + Number(o.subtotal || 0), 0);
  const rangeCount = rangedOrders.length;
  const rangePaid = rangedOrders.filter((o) => o.paymentStatus === "paid").length;
  const rangePaidPct = rangeCount ? Math.round((rangePaid / rangeCount) * 100) : paidShare || 0;
  const rangeUnpaidAmt = rangedOrders
    .filter((o) => ["unpaid", "pending", "pending_verification"].includes(o.paymentStatus) && o.orderStatus !== "cancelled")
    .reduce((s, o) => s + Number(o.subtotal || 0), 0);
  const rangeWeb = rangedOrders.filter((o) => o.channel === "website").length;
  const rangeWa = rangedOrders.filter((o) => o.channel === "whatsapp").length;

  const revenue = range === "w" && overview?.totalRevenue != null && !rangedOrders.length
    ? overview.totalRevenue
    : rangeRevenue || overview?.totalRevenue || 0;
  const orderCount = rangeCount || overview?.orderCount || 0;
  const clients = usersData?.totalUsers || overview?.uniqueCustomers || 0;
  const paidPct = rangeCount ? rangePaidPct : paidShare || 0;
  const unpaidPct = Math.max(0, 100 - paidPct);
  const pendingVerify = paymentQueueCount || overview?.pendingVerification || 0;

  const channelWebPct = orderCount
    ? Math.round(((rangeWeb || overview?.websiteOrders || 0) / Math.max(orderCount, 1)) * 100)
    : websiteShare;
  const channelWaPct = Math.max(0, 100 - channelWebPct);

  const bestsellers = (overview?.topProducts || []).slice(0, 5);
  const recent = (orders || []).slice(0, 4);

  const rangeLabel = range === "t" ? "Today" : range === "m" ? "This month" : "This week";

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        document.getElementById("mx-admin-search")?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onKpiMove = (key, e) => {
    if (window.matchMedia("(hover: hover)").matches === false) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setTilt((t) => ({
      ...t,
      [key]: {
        transform: `rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 14}deg) translateY(-4px)`,
        mx: `${x * 100}%`,
        my: `${y * 100}%`,
      },
    }));
  };

  const clearTilt = (key) => setTilt((t) => ({ ...t, [key]: null }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-[clamp(26px,4vw,38px)] font-extrabold tracking-[-1px] leading-[1.1] text-[var(--ink)]">
            eCommerce dashboard
          </h1>
          <p className="text-[14px] text-[var(--mut)] mt-1.5">MARBLEX store performance with live Atlas metrics</p>
        </div>
        <div className="inline-flex gap-1 p-1 rounded-[14px] bg-[var(--bg2)] shadow-[inset_0_2px_5px_rgba(11,47,61,.15)] w-full sm:w-auto">
          {[
            { id: "t", label: "Today" },
            { id: "w", label: "7 days" },
            { id: "m", label: "30 days" },
          ].map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRange(r.id)}
              className={`flex-1 sm:flex-none border-0 px-3 py-1.5 rounded-[10px] text-xs font-bold min-h-[38px] ${
                range === r.id
                  ? "bg-[var(--card)] text-[var(--ink)] shadow-[0_2px_6px_rgba(11,47,61,.18)]"
                  : "bg-transparent text-[var(--mut)]"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hero */}
      <section className="relative grid grid-cols-1 md:grid-cols-[1.4fr_1fr] items-center gap-5 p-[clamp(18px,3vw,30px)] rounded-[26px] text-white overflow-hidden bg-[radial-gradient(500px_240px_at_85%_20%,rgba(255,106,69,.35),transparent),linear-gradient(135deg,#0b2f3d,#145068_60%,#1b6a85)] shadow-[0_1px_0_rgba(255,255,255,.2)_inset,0_8px_0_#07202b,0_36px_50px_-20px_rgba(7,32,43,.75)]">
        <div>
          <small className="font-bold opacity-75 text-xs">{rangeLabel}</small>
          <h2 className="text-[clamp(24px,4vw,38px)] font-extrabold tracking-[-1px] leading-[1.1] my-2">
            {money(rangeRevenue || revenue)} earned across {rangeCount || orderCount} orders
          </h2>
          <p className="opacity-80 text-sm max-w-[46ch]">
            {rangeWa || overview?.whatsappOrders || 0} orders via WhatsApp · {rangeWeb || overview?.websiteOrders || 0} via
            web store. Paid clearance {paidPct}%.
          </p>
          <div className="h-2.5 rounded-full bg-black/30 my-4 max-w-[420px] overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,.4)]">
            <i
              className="block h-full rounded-full bg-gradient-to-r from-[#ff8c6b] to-[#ffb199] shadow-[0_0_14px_rgba(255,140,107,.8)]"
              style={{ width: `${Math.min(100, Math.max(4, paidPct))}%` }}
            />
          </div>
          <small className="opacity-75 text-xs font-semibold">
            {paidPct}% paid · {money(rangeUnpaidAmt || overview?.unpaidAmount || 0)} still unpaid
          </small>
          <div className="flex gap-2.5 flex-wrap mt-4">
            <button
              type="button"
              onClick={() => onNavigate?.(12)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-white bg-gradient-to-b from-[#ff8460] to-[var(--pri)] shadow-[0_4px_0_var(--pri2),0_12px_18px_-6px_rgba(255,106,69,.6)] border-0"
            >
              Review payments
            </button>
            <button
              type="button"
              onClick={() => onNavigate?.(1)}
              className="rounded-xl px-3.5 py-2.5 text-sm font-bold text-white bg-white/12 border border-white/25 shadow-[0_3px_0_rgba(0,0,0,.25)]"
            >
              Open orders
            </button>
          </div>
        </div>

        {/* Desktop / large screens — original 3D */}
        <div className="mx-iso-desktop h-[200px] place-items-center order-first md:order-none" aria-hidden>
          <div
            className="relative w-[120px] h-[120px]"
            style={{
              transformStyle: "preserve-3d",
              transform: "rotateX(58deg) rotateZ(-40deg)",
              animation: "mx-iso-float 6s ease-in-out infinite",
            }}
          >
            <i className="absolute inset-0 rounded-[20px] bg-white/14 border border-white/35 shadow-[6px_6px_0_rgba(0,0,0,.18),22px_26px_30px_rgba(0,0,0,.3)]" />
            <i
              className="absolute inset-0 rounded-[20px] bg-white/28 border border-white/50 shadow-[6px_6px_0_rgba(0,0,0,.18)]"
              style={{ transform: "translateZ(34px)" }}
            />
            <i
              className="absolute inset-0 rounded-[20px] grid place-items-center text-white font-extrabold text-[28px] bg-gradient-to-br from-[#ffa183] via-[var(--pri)] to-[var(--pri2)] shadow-[6px_6px_0_rgba(0,0,0,.18)]"
              style={{ transform: "translateZ(68px)" }}
            >
              MX
            </i>
          </div>
        </div>

        {/* Mobile only — new 3D emblem */}
        <div className="mx-m3d order-first" aria-hidden>
          <div className="mx-m3d__orbit">
            <span className="mx-m3d__ring" />
            <div className="mx-m3d__core">
              <span className="mx-m3d__slab mx-m3d__slab--3" />
              <span className="mx-m3d__slab mx-m3d__slab--2" />
              <span className="mx-m3d__slab mx-m3d__slab--1">
                <b>MX</b>
              </span>
              <span className="mx-m3d__lip" />
            </div>
            <span className="mx-m3d__ground" />
          </div>
        </div>
      </section>

      {/* KPIs */}
      <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4" style={{ perspective: 1000 }}>
        {[
          {
            key: "rev",
            label: "Revenue",
            value: money(rangeRevenue || overview?.totalRevenue || 0),
            sub: `${paidPct}% paid clearance`,
            color: "#ff6a45",
            icon: "₨",
            tab: 1,
          },
          {
            key: "ord",
            label: "Orders",
            value: String(rangeCount || overview?.orderCount || 0),
            sub: `${rangeWeb || overview?.websiteOrders || 0} web · ${rangeWa || overview?.whatsappOrders || 0} WhatsApp`,
            color: "#e5484d",
            icon: "#",
            tab: 1,
          },
          {
            key: "cli",
            label: "Clients",
            value: String(clients),
            sub: pendingAccessCount > 0 ? `${pendingAccessCount} pending access` : "Verified network",
            color: "#0f9d6b",
            icon: "★",
            tab: 3,
          },
          {
            key: "pay",
            label: "Paid rate",
            value: `${paidPct}%`,
            sub: unpaidPct ? `${unpaidPct}% still unpaid` : "Healthy collection",
            color: "#3b82f6",
            icon: "✓",
            tab: 12,
          },
        ].map((k) => (
          <button
            key={k.key}
            type="button"
            onClick={() => onNavigate?.(k.tab)}
            onMouseMove={(e) => onKpiMove(k.key, e)}
            onMouseLeave={() => clearTilt(k.key)}
            className="mx-card kpi relative text-left overflow-hidden transform-gpu"
            style={{
              transformStyle: "preserve-3d",
              transform: tilt[k.key]?.transform || undefined,
              "--mx": tilt[k.key]?.mx || "50%",
              "--my": tilt[k.key]?.my || "0%",
            }}
          >
            <small className="text-[var(--mut)] font-bold text-xs">{k.label}</small>
            <strong
              className="block text-[clamp(20px,2.4vw,30px)] font-extrabold tracking-[-0.8px] my-2"
              style={{ transform: "translateZ(30px)" }}
            >
              {k.value}
            </strong>
            <span className="text-xs font-bold text-[var(--good)]">{k.sub}</span>
            <div
              className="absolute right-3.5 bottom-3.5 w-9 h-9 rounded-xl grid place-items-center text-white font-extrabold text-[15px] shadow-[0_4px_0_rgba(0,0,0,.25),0_12px_16px_-4px_rgba(0,0,0,.35)]"
              style={{
                background: `linear-gradient(160deg,rgba(255,255,255,.45),transparent 60%), ${k.color}`,
                transform: "translateZ(26px)",
              }}
            >
              {k.icon}
            </div>
            <div
              className="pointer-events-none absolute inset-0 opacity-0 hover:opacity-100 transition-opacity"
              style={{
                background:
                  "radial-gradient(240px circle at var(--mx) var(--my), rgba(255,255,255,.35), transparent 60%)",
              }}
            />
          </button>
        ))}
      </section>

      {/* Daily revenue + Payments */}
      <section className="grid grid-cols-1 lg:grid-cols-[1.8fr_1fr] gap-4">
        <div className="mx-card">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-base font-extrabold">Daily revenue</h3>
            <button type="button" onClick={() => onNavigate?.(9)} className="text-xs font-bold text-[var(--pri2)]">
              Advanced report
            </button>
          </div>
          <p className="text-xs text-[var(--mut)]">Asia/Karachi time</p>
          <div
            className="flex items-end justify-around h-[210px] sm:h-[240px] mt-4 pt-2.5 border-b border-[var(--line)]"
            style={{
              background: "repeating-linear-gradient(to top, transparent 0 59px, var(--line) 59px 60px)",
            }}
          >
            {bars.map((b) => {
              const v = b.revenue;
              const h = v ? Math.max(12, (v / maxBar) * 90) : 0;
              return (
                <div key={b.label} className="flex flex-col items-center justify-end h-full flex-1 gap-0">
                  <div
                    className={`relative w-[22px] sm:w-[34px] rounded-t-[6px] min-h-[6px] origin-bottom cursor-pointer transition ${
                      v
                        ? "bg-gradient-to-r from-[#ff8c6b] via-[var(--pri)] to-[var(--pri2)] shadow-[10px_0_0_-2px_#c63f1d,0_14px_20px_-6px_rgba(229,80,43,.5)]"
                        : "bg-[#ffd3c6] w-[30px] min-h-[10px] rounded-full shadow-none"
                    }`}
                    style={{ height: v ? `${h}%` : 10 }}
                    title={money(v)}
                  >
                    {v > 0 && (
                      <em className="absolute -top-7 left-1/2 -translate-x-1/2 text-[11px] font-extrabold not-italic whitespace-nowrap">
                        {moneyShort(v)}
                      </em>
                    )}
                  </div>
                  <span className="text-xs text-[var(--mut)] mt-2.5 font-semibold">{b.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-card">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-base font-extrabold">Payments</h3>
            <button type="button" onClick={() => onNavigate?.(12)} className="text-xs font-bold text-[var(--pri2)]">
              Open queue
            </button>
          </div>
          <div
            className="w-[150px] h-[150px] sm:w-[170px] sm:h-[170px] rounded-full mx-auto my-3.5 grid place-items-center"
            style={{
              background: `conic-gradient(var(--pri) ${paidPct}%, var(--bg2) 0)`,
              transform: "perspective(520px) rotateX(22deg)",
              boxShadow:
                "0 6px 0 rgba(0,0,0,.2), 0 12px 0 rgba(0,0,0,.12), 0 34px 30px -10px rgba(11,47,61,.45)",
            }}
          >
            <div className="w-[106px] h-[106px] sm:w-[122px] sm:h-[122px] rounded-full bg-[var(--card)] grid place-items-center text-center shadow-[inset_0_4px_10px_rgba(11,47,61,.2),0_1px_0_#fff]">
              <span>
                <b className="text-[30px] font-extrabold tracking-[-1px] block leading-none">{paidPct}%</b>
                <small className="text-[11px] text-[var(--mut)] font-bold">Paid</small>
              </span>
            </div>
          </div>
          <div className="flex justify-between text-[13px] py-2 border-t border-[var(--line)]">
            <span className="text-[var(--mut)]">Pending verify</span>
            <b className="font-extrabold">{pendingVerify}</b>
          </div>
          <div className="flex justify-between text-[13px] py-2 border-t border-[var(--line)]">
            <span className="text-[var(--mut)]">Unpaid aging</span>
            <b className="font-extrabold">{money(rangeUnpaidAmt || overview?.unpaidAmount || 0)}</b>
          </div>
        </div>
      </section>

      {/* Channel + Ops */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="mx-card">
          <h3 className="text-base font-extrabold mb-3">Revenue by channel</h3>
          <div className="flex items-center gap-5 flex-wrap">
            <div
              className="w-[130px] h-[130px] rounded-full grid place-items-center shrink-0"
              style={{
                background: `conic-gradient(var(--pri) ${channelWaPct}%, var(--blue) 0)`,
                transform: "perspective(520px) rotateX(22deg)",
                boxShadow: "0 6px 0 rgba(0,0,0,.2), 0 22px 28px -10px rgba(11,47,61,.4)",
              }}
            >
              <div className="w-[92px] h-[92px] rounded-full bg-[var(--card)] grid place-items-center text-center shadow-[inset_0_4px_10px_rgba(11,47,61,.2)]">
                <span>
                  <b className="text-[22px] font-extrabold block leading-none">{channelWebPct}%</b>
                  <small className="text-[11px] text-[var(--mut)] font-bold">Web</small>
                </span>
              </div>
            </div>
            <div className="flex-1 min-w-[160px] space-y-3">
              <div>
                <div className="flex justify-between text-[13px] font-bold">
                  <span>Website</span>
                  <span>
                    {rangeWeb || overview?.websiteOrders || 0} · {channelWebPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg2)] mt-1.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,.15)]">
                  <i className="block h-full rounded-full bg-[var(--blue)]" style={{ width: `${channelWebPct}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-[13px] font-bold">
                  <span>WhatsApp</span>
                  <span>
                    {rangeWa || overview?.whatsappOrders || 0} · {channelWaPct}%
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--bg2)] mt-1.5 overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,.15)]">
                  <i className="block h-full rounded-full bg-[var(--pri)]" style={{ width: `${channelWaPct}%` }} />
                </div>
              </div>
            </div>
          </div>
          <p className="text-xs text-[var(--mut)] mt-3">
            Paid share {paidPct}% · Catalog {products.length} SKUs
          </p>
        </div>

        <div className="mx-card">
          <h3 className="text-base font-extrabold mb-3">Ops traffic</h3>
          <div className="grid grid-cols-2 gap-3 my-3">
            <div className="bg-[var(--bg)] rounded-[14px] p-3 shadow-[inset_0_2px_5px_rgba(11,47,61,.1)]">
              <small className="text-[11px] text-[var(--mut)] font-bold">Open RFQs</small>
              <b className="block text-2xl font-extrabold">{overview?.openQuotes || 0}</b>
              <em className="not-italic text-[11px] font-bold text-[var(--good)]">Quote desk</em>
            </div>
            <div className="bg-[var(--bg)] rounded-[14px] p-3 shadow-[inset_0_2px_5px_rgba(11,47,61,.1)]">
              <small className="text-[11px] text-[var(--mut)] font-bold">Tickets</small>
              <b className="block text-2xl font-extrabold">{overview?.openTickets || 0}</b>
              <em className="not-italic text-[11px] font-bold text-[var(--bad)]">Support backlog</em>
            </div>
          </div>
          <svg viewBox="0 0 300 70" width="100%" height="70" preserveAspectRatio="none">
            <defs>
              <linearGradient id="mxOpsG" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#ff6a45" stopOpacity=".35" />
                <stop offset="1" stopColor="#ff6a45" stopOpacity="0" />
              </linearGradient>
            </defs>
            {(() => {
              const pts = bars.map((b) => b.revenue);
              const vals = pts.some((v) => v > 0) ? pts : [1, 4, 2, 5, 3, 6, 4];
              const mx = Math.max(...vals, 1);
              const path = vals
                .map((v, i) => {
                  const x = (i / Math.max(vals.length - 1, 1)) * 300;
                  const y = 66 - (v / mx) * 56;
                  return `${i === 0 ? "M" : "L"}${x} ${y}`;
                })
                .join(" ");
              return (
                <>
                  <path d={`${path} L300 70 L0 70 Z`} fill="url(#mxOpsG)" />
                  <path d={path} fill="none" stroke="#ff6a45" strokeWidth="2.5" strokeLinejoin="round" />
                </>
              );
            })()}
          </svg>
          <div className="flex gap-2 mt-3 flex-wrap">
            <button type="button" onClick={() => onNavigate?.(13)} className="mx-btn">
              Open RFQs
            </button>
            <button type="button" onClick={() => onNavigate?.(14)} className="mx-btn">
              Tickets
            </button>
          </div>
        </div>
      </section>

      {/* Bestsellers + snapshot */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="mx-card">
          <div className="flex justify-between items-baseline mb-1">
            <h3 className="text-base font-extrabold">Bestsellers</h3>
            <button type="button" onClick={() => onNavigate?.(4)} className="text-xs font-bold text-[var(--pri2)]">
              Catalog
            </button>
          </div>
          {bestsellers.length === 0 ? (
            <p className="text-sm text-[var(--mut)] py-8 text-center">No product sales yet</p>
          ) : (
            bestsellers.map((p, idx) => (
              <div
                key={p.name}
                className="flex items-center gap-3 py-2.5 border-t border-[var(--line)] first:border-0 first:pt-3"
              >
                <div
                  className="w-[38px] h-[38px] rounded-[11px] shrink-0 grid place-items-center text-white font-extrabold text-[13px] shadow-[0_3px_0_rgba(0,0,0,.2),0_8px_12px_-4px_rgba(0,0,0,.25)]"
                  style={{ background: SQ_COLORS[idx % SQ_COLORS.length] }}
                >
                  {(p.name || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <b className="block text-[13.5px] truncate">{p.name}</b>
                  <small className="text-[var(--mut)] text-xs">{p.qty} sold</small>
                </div>
                <strong className="text-[13px] font-extrabold whitespace-nowrap">{money(p.revenue)}</strong>
              </div>
            ))
          )}
        </div>

        <div className="mx-card">
          <h3 className="text-base font-extrabold mb-3">Ops snapshot</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Revenue", value: money(rangeRevenue || overview?.totalRevenue || 0), em: `${paidPct}% paid` },
              {
                label: "Unpaid",
                value: money(rangeUnpaidAmt || overview?.unpaidAmount || 0),
                em: `${overview?.unpaidCount || 0} order(s)`,
              },
              {
                label: "Orders",
                value: String(rangeCount || overview?.orderCount || 0),
                em: `WhatsApp ${whatsappShare || channelWaPct}%`,
              },
              {
                label: "Low stock",
                value: String((overview?.lowStock || []).length),
                em: "SKUs under 5",
              },
            ].map((t) => (
              <div
                key={t.label}
                className="bg-[var(--bg)] rounded-2xl p-3.5 shadow-[inset_0_2px_5px_rgba(11,47,61,.08)]"
              >
                <small className="text-[11px] text-[var(--mut)] font-bold">{t.label}</small>
                <b className="block text-xl font-extrabold my-1">{t.value}</b>
                <em className="not-italic text-[11px] font-bold text-[var(--mut)]">{t.em}</em>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest orders */}
      <section className="mx-card">
        <div className="flex justify-between items-baseline mb-1">
          <h3 className="text-base font-extrabold">Latest orders</h3>
          <button type="button" onClick={() => onNavigate?.(1)} className="text-xs font-bold text-[var(--pri2)]">
            View all
          </button>
        </div>
        <p className="text-xs text-[var(--mut)] mb-2.5">Most recent store transactions</p>

        <div className="hidden md:grid grid-cols-[2.4fr_.5fr_1fr_1fr_.7fr_1fr_.5fr] gap-2.5 items-center px-1.5 pb-1.5 text-[11px] text-[var(--mut)] font-bold">
          <span>Order / customer</span>
          <span>Qty</span>
          <span>Revenue</span>
          <span>Date</span>
          <span>Payment</span>
          <span>Status</span>
          <span />
        </div>

        {recent.length === 0 ? (
          <p className="text-sm text-[var(--mut)] py-8 text-center">No orders in database yet.</p>
        ) : (
          recent.map((order) => {
            const qty = (order.items || []).reduce((s, i) => s + (i.quantity || 0), 0) || 1;
            const first = order.items?.[0];
            const st = STATUS[order.orderStatus] || "p";
            const num = order.orderNumber || `#${String(order._id).slice(-6).toUpperCase()}`;
            return (
              <div
                key={order._id}
                className="grid grid-cols-1 md:grid-cols-[2.4fr_.5fr_1fr_1fr_.7fr_1fr_.5fr] gap-1 md:gap-2.5 md:items-center py-3.5 px-1 border-t border-[var(--line)] text-[13px]"
              >
                <div className="flex gap-3 items-center min-w-0">
                  <div
                    className="w-[38px] h-[38px] rounded-[11px] shrink-0 grid place-items-center text-white font-extrabold text-[13px] shadow-[0_3px_0_rgba(0,0,0,.2)]"
                    style={{ background: SQ_COLORS[(first?.name || "A").charCodeAt(0) % SQ_COLORS.length] }}
                  >
                    {(first?.name || order.customerName || "?").charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <b className="block text-[13.5px] truncate">{first?.name || order.customerName}</b>
                    <small className="text-[var(--mut)] text-[11.5px]">
                      {num} · {order.customerName}
                    </small>
                  </div>
                </div>
                <span className="hidden md:inline">x{qty}</span>
                <span className="md:font-normal font-extrabold md:text-left text-right">
                  {money(order.subtotal)}
                </span>
                <span className="hidden md:inline text-[var(--mut)]">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-US", {
                        timeZone: "Asia/Karachi",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "—"}
                </span>
                <span className="hidden md:inline uppercase text-xs font-bold">
                  {String(order.paymentMethod || "cod").replace("_", " ")}
                </span>
                <span
                  className={`text-[11px] font-extrabold px-2.5 py-1 rounded-full w-max justify-self-end md:justify-self-start ${
                    st === "g" ? "text-[#1d6fd6] bg-[#e6f1ff]" : "text-[#c2410c] bg-[#fff1e6]"
                  }`}
                >
                  {order.orderStatus || "pending"}
                </span>
                <button
                  type="button"
                  onClick={() => onNavigate?.(order.channel === "whatsapp" ? 2 : 1)}
                  className="hidden md:inline text-[var(--pri2)] font-extrabold text-right"
                >
                  Open
                </button>
              </div>
            );
          })
        )}
      </section>

      <style>{`
        /* Desktop: original 3D (hidden on mobile) */
        .mx-iso-desktop {
          display: none;
        }
        .mx-m3d {
          display: grid;
          place-items: center;
          height: 132px;
          margin: 2px 0 6px;
          position: relative;
        }
        @media (min-width: 768px) {
          .mx-iso-desktop {
            display: grid;
          }
          .mx-m3d {
            display: none;
          }
        }
        @keyframes mx-iso-float {
          50% { transform: rotateX(58deg) rotateZ(-34deg) translateZ(16px); }
        }

        /* Mobile-only 3D emblem */
        .mx-m3d__orbit {
          position: relative;
          width: 118px;
          height: 112px;
          display: grid;
          place-items: center;
          animation: mx-m3d-bob 5.5s ease-in-out infinite;
        }
        .mx-m3d__ring {
          position: absolute;
          inset: 10px 8px 22px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(255, 140, 107, 0.28) 0%, transparent 68%);
          filter: blur(10px);
          pointer-events: none;
        }
        .mx-m3d__core {
          position: relative;
          width: 78px;
          height: 78px;
          z-index: 2;
        }
        .mx-m3d__slab {
          position: absolute;
          left: 50%;
          width: 62px;
          height: 62px;
          margin-left: -31px;
          border-radius: 16px;
          transform: rotate(45deg);
          box-sizing: border-box;
        }
        .mx-m3d__slab--3 {
          top: 28px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.04));
          border: 1px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 10px 18px rgba(0, 0, 0, 0.28);
        }
        .mx-m3d__slab--2 {
          top: 16px;
          background: linear-gradient(145deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.1));
          border: 1px solid rgba(255, 255, 255, 0.38);
          box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.16);
        }
        .mx-m3d__slab--1 {
          top: 4px;
          display: grid;
          place-items: center;
          background:
            linear-gradient(160deg, rgba(255, 255, 255, 0.45) 0%, transparent 42%),
            linear-gradient(135deg, #ffa183 0%, #ff6a45 48%, #c63f1d 100%);
          border: 1px solid rgba(255, 255, 255, 0.4);
          box-shadow:
            4px 4px 0 #9a2f14,
            8px 8px 0 rgba(0, 0, 0, 0.22),
            0 0 22px rgba(255, 106, 69, 0.45);
        }
        .mx-m3d__slab--1 b {
          transform: rotate(-45deg);
          color: #fff;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.5px;
          line-height: 1;
          text-shadow: 0 1px 0 rgba(0, 0, 0, 0.25);
          font-style: normal;
        }
        .mx-m3d__lip {
          position: absolute;
          left: 50%;
          top: 48px;
          width: 54px;
          height: 10px;
          margin-left: -27px;
          border-radius: 50%;
          background: linear-gradient(90deg, transparent, rgba(255, 106, 69, 0.55), transparent);
          filter: blur(4px);
          opacity: 0.85;
          z-index: 1;
        }
        .mx-m3d__ground {
          position: absolute;
          left: 50%;
          bottom: 4px;
          width: 72px;
          height: 14px;
          margin-left: -36px;
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0, 0, 0, 0.45) 0%, transparent 70%);
          filter: blur(3px);
          z-index: 0;
        }
        @keyframes mx-m3d-bob {
          0%,
          100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .mx-m3d__orbit {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};
