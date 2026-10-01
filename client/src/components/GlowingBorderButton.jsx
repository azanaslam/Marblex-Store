import { Link } from "react-router-dom";

/**
 * Animated Glowing Border & Shimmer CTA Button
 * Features:
 * - Rotating perimeter glowing light beam (`@keyframes moveAround`)
 * - Reflective surface light shimmer (`@keyframes shimmer`)
 * - Responsive sizing and smooth hover micro-animations
 */
export function GlowingBorderButton({
  to,
  href,
  text,
  children,
  onClick,
  className = "",
  buttonClassName = "",
  style = {},
  type = "button",
  disabled = false,
  ariaLabel,
}) {
  const label = text || children;
  const linkTarget = to || href;

  const content = (
    <div className={`relative w-fit z-10 overflow-clip rounded-2xl ${className}`} style={style}>
      {/* Ghoomne wala glowing beam (Border Light) */}
      <div
        className="absolute blur-sm -z-10 bg-white w-16 h-16 rounded-full pointer-events-none"
        style={{ animation: "moveAround 3s linear infinite" }}
      />
      {/* Button Body with 2px padding for border effect */}
      <div className="p-[2px] rounded-2xl">
        <button
          type={type}
          onClick={onClick}
          disabled={disabled}
          aria-label={ariaLabel || (typeof label === "string" ? label : undefined)}
          className={`shimmer-btn inline-flex items-center justify-center gap-2 px-8 sm:px-10 h-[56px] sm:h-[62px] bg-gradient-to-r from-[#ff6b4a] to-[#ff522b] hover:from-[#ff5a36] hover:to-[#e04520] text-white font-bold text-[16px] sm:text-[18px] rounded-2xl transition-all duration-300 hover:scale-[0.99] active:scale-95 cursor-pointer shadow-[0_0_30px_rgba(255,107,74,0.45)] disabled:opacity-60 disabled:cursor-not-allowed ${buttonClassName}`}
        >
          {label}
        </button>
      </div>
    </div>
  );

  if (linkTarget && !disabled) {
    return (
      <Link to={linkTarget} className="inline-block text-decoration-none">
        {content}
      </Link>
    );
  }

  return content;
}

export default GlowingBorderButton;
