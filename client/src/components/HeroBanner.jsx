import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const showcaseProducts = [
  { id: 1, title: "APP Bituminous Membrane System", desc: "Polymer-modified reinforced bituminous sheet engineered for demanding waterproofing projects.", image: "/products/Banner3.jpeg" },
  { id: 2, title: "Heavy-Duty Expansion Waterstops", desc: "Vulcanized rubber profiles designed for structural expansion and construction joints.", image: "/products/Banner2.jpeg" },
  { id: 3, title: "Elastomeric Liquid Waterproof Coating", desc: "A monolithic, joint-free barrier against water ingress with excellent crack-bridging elasticity.", image: "/products/Banner1.jpeg" },
  { id: 4, title: "High-Build Industrial Epoxy Floor", desc: "Seamless, chemical and abrasion-resistant protection for industrial facilities.", image: "/products/Banner4.jpeg" },
];

export const HeroBanner = () => {
  const navigate = useNavigate();
  const [activeSlide, setActiveSlide] = useState(0);
  const sectionRef = useRef(null);
  const liveBadgeRef = useRef(null);
  const headlineRef = useRef(null);
  const subtitleRef = useRef(null);
  const actionsRef = useRef(null);
  const metricsRef = useRef(null);
  const rightCardRef = useRef(null);
  const hasAnimatedRef = useRef(false);

  const nextSlide = useCallback(() => setActiveSlide((prev) => (prev + 1) % showcaseProducts.length), []);
  const prevSlide = useCallback(() => setActiveSlide((prev) => (prev - 1 + showcaseProducts.length) % showcaseProducts.length), []);

  const runEntranceAnimation = useCallback(() => {
    if (hasAnimatedRef.current) return;
    hasAnimatedRef.current = true;
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.fromTo(sectionRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.9 })
      .fromTo(liveBadgeRef.current, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5 }, "-=0.55")
      .fromTo(headlineRef.current, { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.7 }, "-=0.35")
      .fromTo(subtitleRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.55 }, "-=0.4")
      .fromTo(actionsRef.current.children, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.08 }, "-=0.3")
      .fromTo(metricsRef.current, { opacity: 0 }, { opacity: 1, duration: 0.45 }, "-=0.2")
      .fromTo(rightCardRef.current, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.65 }, "-=0.6");
  }, []);

  useEffect(() => {
    const reveal = () => runEntranceAnimation();
    window.addEventListener("marblex:intro_reveal", reveal);
    const timer = setTimeout(runEntranceAnimation, 1800);
    return () => { window.removeEventListener("marblex:intro_reveal", reveal); clearTimeout(timer); };
  }, [runEntranceAnimation]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(sectionRef.current, { y: 44, opacity: 0.82, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top top", end: "bottom top", scrub: 1.2 } });
      gsap.to(".hero-background-image", { yPercent: 12, scale: 1.08, ease: "none", scrollTrigger: { trigger: sectionRef.current, start: "top bottom", end: "bottom top", scrub: 1.4 } });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => { const timer = setInterval(nextSlide, 5000); return () => clearInterval(timer); }, [nextSlide]);

  const current = showcaseProducts[activeSlide];
  return (
    <section ref={sectionRef} className="hero-minimal relative mb-8 overflow-hidden rounded-[1.5rem] border border-white/15 text-white shadow-xl shadow-black/20">
      <div className="absolute inset-0 bg-[#102a33]" />
      {showcaseProducts.map((product, index) => <div key={product.id} className={`hero-background-image absolute inset-0 transition-opacity duration-1000 ${activeSlide === index ? "opacity-100" : "opacity-0"}`} aria-hidden="true"><img src={product.image} alt="" className="h-full w-full object-cover" /></div>)}
      <div className="absolute inset-0 bg-gradient-to-r from-[#071b20]/95 via-[#071b20]/72 to-[#071b20]/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#071b20]/80 via-transparent to-transparent" />
      <div className="relative z-10 grid min-h-[470px] items-end gap-10 p-6 sm:p-10 lg:min-h-[500px] lg:grid-cols-[1.05fr_.95fr] lg:p-14">
        <div className="max-w-2xl pb-1">
          <div ref={liveBadgeRef} className="mb-5 inline-flex items-center gap-2 border-b border-white/30 pb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/75"><span className="h-1.5 w-1.5 rounded-full bg-[#c7a66a]" />MarbLex industrial solutions</div>
          <h1 ref={headlineRef} className="max-w-xl text-4xl font-semibold leading-[1.02] tracking-[-0.045em] text-white sm:text-6xl lg:text-[4.35rem]">Protection that works quietly.</h1>
          <p ref={subtitleRef} className="mt-5 max-w-lg text-sm leading-6 text-white/72 sm:text-base">Reliable waterproofing systems for structures that need to last. Built for demanding projects, specified with confidence.</p>
          <div ref={actionsRef} className="mt-7 flex flex-wrap gap-3"><button onClick={() => navigate("/services")} className="rounded-full bg-[#c7a66a] px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#13252a] transition hover:bg-[#dfc28b]">Explore solutions <ArrowForwardIcon sx={{ ml: 1, fontSize: 16, verticalAlign: "middle" }} /></button><button onClick={() => navigate("/catalogs")} className="rounded-full border border-white/35 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-white transition hover:border-white hover:bg-white/10">Technical specs</button></div>
          <div ref={metricsRef} className="mt-9 flex gap-6 border-t border-white/20 pt-4 text-xs text-white/65"><span><strong className="text-white">15+</strong> years</span><span><strong className="text-white">100%</strong> waterproof</span><span><strong className="text-white">500+</strong> sites</span></div>
        </div>
        <div ref={rightCardRef} className="hidden justify-self-end lg:block lg:max-w-xs"><div className="border-l border-white/35 pl-5"><p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#dfc28b]">Featured system</p><p className="mt-3 text-xl font-medium leading-tight text-white">{current.title}</p><p className="mt-2 text-xs leading-5 text-white/65">{current.desc}</p><div className="mt-5 flex items-center gap-3"><button onClick={prevSlide} aria-label="Previous system" className="rounded-full border border-white/25 px-3 py-1 text-white/80 transition hover:bg-white/10">←</button><span className="text-[10px] tracking-[0.2em] text-white/60">0{activeSlide + 1} / 0{showcaseProducts.length}</span><button onClick={nextSlide} aria-label="Next system" className="rounded-full border border-white/25 px-3 py-1 text-white/80 transition hover:bg-white/10">→</button></div></div></div>
      </div>
    </section>
  );
};
