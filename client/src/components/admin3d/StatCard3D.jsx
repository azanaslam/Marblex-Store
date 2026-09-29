import { TiltCard3D } from "./TiltCard3D";
import { AnimatedCounter } from "./AnimatedCounter";

export const StatCard3D = ({
  title,
  value,
  prefix = "",
  suffix = "",
  subtext,
  icon,
  gradient = "from-[#ff6b4a]/10 to-[#ff8c73]/5",
  glowColor = "rgba(255, 107, 74, 0.15)",
  iconBg = "bg-[#0a3d52]/5 text-[#0a3d52] border-[#0a3d52]/10",
  trend,
  trendPositive = true,
  onClick,
}) => {
  return (
    <TiltCard3D
      maxTilt={3}
      scale={1.015}
      onClick={onClick}
      className="group relative cursor-pointer overflow-hidden rounded-2xl bg-white p-5 sm:p-6 border border-[#e0e6ed] shadow-sm transition-all duration-300 hover:border-[#ff8c73] hover:shadow-lg hover:shadow-[#0a3d52]/5"
      style={{ "--glow": glowColor }}
    >
      {/* Subtle MARBLEX Gradient Accent on Hover */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br ${gradient} blur-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
      />

      {/* Card Content with 3D Depth */}
      <div className="relative z-10 flex flex-col justify-between h-full space-y-4" style={{ transformStyle: "preserve-3d" }}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#565e69] font-subheading">
              {title}
            </p>
            <div className="mt-1.5 text-2xl sm:text-3xl font-extrabold text-[#0a3d52] font-heading tracking-tight flex items-baseline gap-1" style={{ transform: "translateZ(16px)" }}>
              <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
            </div>
          </div>
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border text-xl font-bold shadow-sm transition-transform duration-300 group-hover:scale-105 ${iconBg}`}
            style={{ transform: "translateZ(24px)" }}
          >
            {icon}
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#e0e6ed]/60" style={{ transform: "translateZ(12px)" }}>
          <span className="text-xs font-medium text-[#565e69] truncate max-w-[170px]">
            {subtext || "Live metrics"}
          </span>
          {trend && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider font-subheading ${
                trendPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {trendPositive ? "↑" : "↓"} {trend}
            </span>
          )}
        </div>
      </div>
    </TiltCard3D>
  );
};
