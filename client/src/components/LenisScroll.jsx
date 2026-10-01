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
        lerp: 0.1, // Inertia smooth factor (0.1 is buttery smooth)
        duration: 1.5, // Scroll transition duration
        smoothWheel: true,
      }}
    >
      <ScrollToTop />
      {children}
    </ReactLenis>
  );
}

export default LenisScroll;
