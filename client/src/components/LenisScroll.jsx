import { useEffect } from "react";
import { ReactLenis, useLenis } from "lenis/react";
import { useLocation } from "react-router-dom";

function ScrollToTop() {
  const location = useLocation();
  const lenis = useLenis();

  useEffect(() => {
    const hasSectionQuery =
      typeof window !== "undefined" &&
      (window.location.search.includes("section=") || Boolean(window.location.hash));

    if (lenis && !hasSectionQuery) {
      lenis.scrollTo(0, { immediate: false });
    }
  }, [location.pathname, lenis]);

  return null;
}

export function LenisScroll({ children }) {
  return (
    <ReactLenis
      root
      options={{
        lerp: 0.075,        // Silkier inertia — closer to 0 = more fluid momentum
        duration: 1.8,      // Longer deceleration for cinematic feel
        smoothWheel: true,
        smoothTouch: false, // Native touch feel on mobile (no lag)
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Expo ease-out
        wheelMultiplier: 0.9, // Slightly reduced scroll speed = more controlled
        touchMultiplier: 1.5,
      }}
    >
      <ScrollToTop />
      {children}
    </ReactLenis>
  );
}

export default LenisScroll;
