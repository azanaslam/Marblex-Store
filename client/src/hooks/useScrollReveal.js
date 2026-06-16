import { useEffect, useRef } from "react";

/**
 * Custom hook that uses IntersectionObserver to add scroll-reveal animations.
 * Adds "visible" class to elements with "scroll-reveal" class when they enter the viewport.
 */
export const useScrollReveal = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target); // Only animate once
          }
        });
      },
      {
        threshold: 0.08,
        rootMargin: "0px 0px -40px 0px",
      }
    );

    // Observe all scroll-reveal elements inside the container
    const elements = container.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return containerRef;
};
