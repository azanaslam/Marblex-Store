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

export const EnterpriseMetricsBar = ({ className = "my-10 sm:my-14" }) => {
  return (
    <div className={`${className} bg-gradient-to-r from-[#0a3d52] via-[#0b4860] to-[#082a38] rounded-3xl py-6 sm:py-7 text-white shadow-xl shadow-[#0a3d52]/15 border border-[#1b556e]/50 relative overflow-hidden group select-none`}>
      
      {/* Soft Ambient Glows */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#ff6b4a]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#0ea5e9]/15 rounded-full blur-[90px] pointer-events-none" />

      {/* Left & Right Gradient Fade Masks for Cinema Look */}
      <div className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-[#0a3d52] to-transparent z-20 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-[#082a38] to-transparent z-20 pointer-events-none" />

      {/* Continuous Infinite Marquee Track (Right to Left) */}
      <div className="animate-marquee-left flex items-center">
        {[...enterpriseMetrics, ...enterpriseMetrics].map((metric, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 sm:gap-6 px-6 sm:px-10 shrink-0 border-r border-white/10"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center shrink-0 shadow-inner">
              {metric.icon}
            </div>
            <div className="flex flex-col text-left">
              <span
                className="text-2xl sm:text-3xl md:text-4xl font-black text-white font-heading tracking-tight drop-shadow-sm leading-none"
                style={{ fontFamily: "'Space Grotesk', sans-serif" }}
              >
                {metric.value}
                <span className="text-[#ff6b4a]">{metric.suffix}</span>
              </span>
              <span className="text-xs sm:text-[13px] font-bold text-slate-100 mt-1 uppercase tracking-wider whitespace-nowrap">
                {metric.title}
              </span>
              <span className="text-[10.5px] text-slate-300 font-normal mt-0.5 whitespace-nowrap">
                {metric.subtitle}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
