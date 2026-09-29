import { useEffect, useRef } from "react";
import gsap from "gsap";

export const TabWrapper3D = ({ children, tabKey }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    gsap.fromTo(
      containerRef.current,
      {
        opacity: 0,
        y: 24,
        rotateX: -6,
        scale: 0.98,
        transformPerspective: 1200,
        transformOrigin: "top center",
      },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
        clearProps: "transform",
      }
    );
  }, [tabKey]);

  return (
    <div ref={containerRef} className="w-full will-change-transform">
      {children}
    </div>
  );
};
