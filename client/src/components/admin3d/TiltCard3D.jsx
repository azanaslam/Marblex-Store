import { useRef } from "react";
import gsap from "gsap";

export const TiltCard3D = ({
  children,
  className = "",
  maxTilt = 4,
  perspective = 1200,
  scale = 1.01,
  glare = true,
  onClick,
  style = {},
}) => {
  const cardRef = useRef(null);
  const glareRef = useRef(null);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -maxTilt;
    const rotateY = ((x - centerX) / centerX) * maxTilt;

    gsap.to(cardRef.current, {
      rotateX,
      rotateY,
      scale,
      y: -3,
      duration: 0.35,
      ease: "power2.out",
      transformPerspective: perspective,
      transformStyle: "preserve-3d",
      overwrite: "auto",
    });

    if (glare && glareRef.current) {
      const glareX = (x / rect.width) * 100;
      const glareY = (y / rect.height) * 100;
      gsap.to(glareRef.current, {
        opacity: 0.12,
        background: `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 65%)`,
        duration: 0.25,
        overwrite: "auto",
      });
    }
  };

  const handleMouseLeave = () => {
    if (!cardRef.current) return;
    gsap.to(cardRef.current, {
      rotateX: 0,
      rotateY: 0,
      scale: 1,
      y: 0,
      duration: 0.5,
      ease: "power3.out",
      overwrite: "auto",
    });

    if (glare && glareRef.current) {
      gsap.to(glareRef.current, {
        opacity: 0,
        duration: 0.35,
        overwrite: "auto",
      });
    }
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transformStyle: "preserve-3d",
        perspective: `${perspective}px`,
        willChange: "transform",
        ...style,
      }}
      className={`relative transition-shadow duration-300 ${className}`}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 z-30"
        />
      )}
    </div>
  );
};
