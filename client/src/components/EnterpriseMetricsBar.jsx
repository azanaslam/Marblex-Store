export const enterpriseMetrics = [
  {
    value: "15",
    suffix: "+",
    title: "Years Industrial Mastery",
    subtitle: "Formulating Since 2011",
    icon: (
      <svg className="w-5 h-5 text-[#ff6b4a]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19 21V5C19 3.89543 18.1046 3 17 3H7C5.89543 3 5 3.89543 5 21M3 21H21M9 7H10M14 7H15M9 11H10M14 11H15M9 15H10M14 15H15M9 19H10M14 19H15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: "500",
    suffix: "+",
    title: "Mega Projects Sealed",
    subtitle: "Dams, High-Rises & Plants",
    icon: (
      <svg className="w-5 h-5 text-sky-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 21V9L12 3L20 9V21M9 21V12H15V21" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 7V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    value: "100",
    suffix: "%",
    title: "ISO-9001 Certified",
    subtitle: "ASTM Tested Formulations",
    icon: (
      <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="8" r="6" stroke="currentColor" strokeWidth="1.75"/>
        <path d="M15.5 13.5L18 21L12 18L6 21L8.5 13.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M10 8L11.5 9.5L14.5 6.5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: "10",
    suffix: " Yrs",
    title: "Warranty Guarantee",
    subtitle: "Zero Moisture Permeation",
    icon: (
      <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 6V12C4 17.5 7.4 22.1 12 23.5C16.6 22.1 20 17.5 20 12V6L12 2Z" fill="currentColor" fillOpacity="0.15" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    value: "50",
    suffix: "+",
    title: "Engineered Products",
    subtitle: "Membranes, Epoxy & Sealants",
    icon: (
      <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3H15M10 3V8.5L5.2 17.4C4.4 18.9 5.5 20.7 7.2 20.7H16.8C18.5 20.7 19.6 18.9 18.8 17.4L14 8.5V3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="10" cy="16" r="1" fill="currentColor"/>
        <circle cx="14" cy="15" r="1" fill="currentColor"/>
      </svg>
    ),
  },
  {
    value: "100",
    suffix: "%",
    title: "Hydrostatic Head Proof",
    subtitle: "Extreme Chemical Resistance",
    icon: (
      <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2.69L6.64 8.05C4.29 10.4 4.29 14.2 6.64 16.54C8.99 18.89 12.79 18.89 15.14 16.54C17.49 14.19 17.49 10.39 15.14 8.05L12 2.69Z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 18.5V14" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
      </svg>
    ),
  },
];

/** Full-viewport metrics marquee — edge-to-edge on every page */
export const EnterpriseMetricsBar = ({ className = "my-6 sm:my-8" }) => {
  return (
    <div className={`relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 ${className}`}>
      <div className="relative overflow-hidden border-y border-[#1b556e]/50 bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] py-6 text-white shadow-xl shadow-[#0a3d52]/15 select-none group sm:py-7">
        <div className="pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full bg-[#ff6b4a]/15 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 h-80 w-80 rounded-full bg-[#0ea5e9]/15 blur-[90px]" />

        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-16 bg-gradient-to-r from-[#0a3d52] to-transparent sm:w-28" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-16 bg-gradient-to-l from-[#082a38] to-transparent sm:w-28" />

        <div className="animate-marquee-left flex items-center">
          {[...enterpriseMetrics, ...enterpriseMetrics].map((metric, idx) => (
            <div
              key={idx}
              className="flex shrink-0 items-center gap-4 border-r border-white/10 px-6 sm:gap-6 sm:px-10"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-white/10 shadow-inner backdrop-blur-md">
                {metric.icon}
              </div>
              <div className="flex flex-col text-left">
                <span
                  className="font-heading text-2xl font-black leading-none tracking-tight text-white drop-shadow-sm sm:text-3xl md:text-4xl"
                  style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                >
                  {metric.value}
                  <span className="text-[#ff6b4a]">{metric.suffix}</span>
                </span>
                <span className="mt-1 whitespace-nowrap text-xs font-bold uppercase tracking-wider text-slate-100 sm:text-[13px]">
                  {metric.title}
                </span>
                <span className="mt-0.5 whitespace-nowrap text-[10.5px] font-normal text-slate-300">
                  {metric.subtitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
