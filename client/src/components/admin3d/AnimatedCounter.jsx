import { useEffect, useRef } from "react";
import gsap from "gsap";

export const AnimatedCounter = ({
  value = 0,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.4,
  className = "",
}) => {
  const spanRef = useRef(null);
  const prevValRef = useRef(0);

  useEffect(() => {
    const rawVal = typeof value === "string" ? parseFloat(value.replace(/[^0-9.-]+/g, "")) || 0 : Number(value) || 0;
    const startVal = prevValRef.current;
    prevValRef.current = rawVal;

    const proxy = { val: startVal };

    const tween = gsap.to(proxy, {
      val: rawVal,
      duration,
      ease: "power3.out",
      onUpdate: () => {
        if (spanRef.current) {
          const formatted = decimals > 0 ? proxy.val.toFixed(decimals) : Math.round(proxy.val).toLocaleString();
          spanRef.current.textContent = `${prefix}${formatted}${suffix}`;
        }
      },
    });

    return () => tween.kill();
  }, [value, prefix, suffix, decimals, duration]);

  return <span ref={spanRef} className={className}>{prefix}0{suffix}</span>;
};
