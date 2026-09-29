import { useEffect, useRef } from "react";
import gsap from "gsap";

export const AmbientMesh3D = () => {
  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orb 1: Soft Navy Teal
      gsap.to(orb1Ref.current, {
        x: "+=40",
        y: "+=25",
        scale: 1.1,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Orb 2: Soft Red-Orange
      gsap.to(orb2Ref.current, {
        x: "-=30",
        y: "-=40",
        scale: 0.95,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1,
      });

      // Orb 3: Soft Amber
      gsap.to(orb3Ref.current, {
        x: "+=25",
        y: "-=30",
        scale: 1.05,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 2,
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="pointer-events-none fixed inset-0 overflow-hidden z-0 select-none opacity-30"
    >
      <div
        ref={orb1Ref}
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-[#0a3d52]/15 blur-[120px]"
      />
      <div
        ref={orb2Ref}
        className="absolute top-1/4 -right-24 w-[28rem] h-[28rem] rounded-full bg-[#ff6b4a]/12 blur-[140px]"
      />
      <div
        ref={orb3Ref}
        className="absolute -bottom-24 left-1/4 w-80 h-80 rounded-full bg-[#ff8c73]/10 blur-[120px]"
      />
    </div>
  );
};
