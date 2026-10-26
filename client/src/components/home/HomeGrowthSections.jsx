import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import RoofingOutlinedIcon from "@mui/icons-material/RoofingOutlined";
import FoundationOutlinedIcon from "@mui/icons-material/FoundationOutlined";
import PoolOutlinedIcon from "@mui/icons-material/PoolOutlined";
import FactoryOutlinedIcon from "@mui/icons-material/FactoryOutlined";
import WaterDropOutlinedIcon from "@mui/icons-material/WaterDropOutlined";
import ConstructionOutlinedIcon from "@mui/icons-material/ConstructionOutlined";
import EngineeringOutlinedIcon from "@mui/icons-material/EngineeringOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import WorkspacePremiumOutlinedIcon from "@mui/icons-material/WorkspacePremiumOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import PlayCircleOutlineRoundedIcon from "@mui/icons-material/PlayCircleOutlineRounded";
import HomeWorkOutlinedIcon from "@mui/icons-material/HomeWorkOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import PrecisionManufacturingOutlinedIcon from "@mui/icons-material/PrecisionManufacturingOutlined";
import DomainOutlinedIcon from "@mui/icons-material/DomainOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";

const WA = "923084585792";
const waLink = (text) =>
  `https://wa.me/${WA}?text=${encodeURIComponent(text)}`;

const PROBLEMS = [
  {
    id: "roof",
    title: "Roof & Terrace Leak",
    desc: "Torch-on membranes, elastomeric coats, ponding water systems.",
    categoryId: "waterproofing",
    icon: RoofingOutlinedIcon,
    tone: "from-[#0a3d52] to-[#125a78]",
  },
  {
    id: "basement",
    title: "Basement Damp / Seepage",
    desc: "Negative-side barriers, crystalline systems, drain boards.",
    categoryId: "waterproofing",
    icon: FoundationOutlinedIcon,
    tone: "from-[#0c475e] to-[#0a3d52]",
  },
  {
    id: "pool",
    title: "Pool & Reservoir",
    desc: "Chlorine-resistant sealants, mosaic joints, tank linings.",
    categoryId: "chemicals",
    icon: PoolOutlinedIcon,
    tone: "from-[#125a78] to-[#0a3d52]",
  },
  {
    id: "floor",
    title: "Industrial Flooring",
    desc: "Epoxy, heavy-traffic coatings, chemical-resistant floors.",
    categoryId: "elastomeric",
    icon: FactoryOutlinedIcon,
    tone: "from-[#ff6b4a] to-[#e65636]",
  },
  {
    id: "joints",
    title: "Expansion Joints",
    desc: "Rubber waterstops, joint fillers, sealant systems.",
    categoryId: "rubber",
    icon: ConstructionOutlinedIcon,
    tone: "from-[#0a3d52] to-[#ff6b4a]",
  },
  {
    id: "termite",
    title: "Termite & Soil Barrier",
    desc: "Foundation chemical barriers and perimeter protection.",
    categoryId: "chemicals",
    icon: WaterDropOutlinedIcon,
    tone: "from-[#0c313d] to-[#0a3d52]",
  },
];

const TECH_DOCS = [
  {
    id: "profile",
    title: "Corporate Profile & ISO",
    meta: "10-page overview",
    href: "/catalogs?tab=profile",
    icon: MenuBookOutlinedIcon,
  },
  {
    id: "construction",
    title: "Waterproofing Application Manual",
    meta: "Site SOP guide",
    href: "/catalogs?tab=construction",
    icon: DescriptionOutlinedIcon,
  },
  {
    id: "waterstopper",
    title: "Waterstop Profile Data",
    meta: "Joint design / CAD",
    href: "/catalogs?tab=waterstopper",
    icon: PictureAsPdfOutlinedIcon,
  },
  {
    id: "tds",
    title: "Request Full TDS Pack",
    meta: "WhatsApp · PDF pack",
    href: waLink(
      "Hello MARBLEX, please send the complete TDS / MSDS technical pack for our project."
    ),
    external: true,
    icon: ScienceOutlinedIcon,
  },
];

const GUIDE_VIDEOS = [
  {
    id: "v1",
    title: "Roof membrane application",
    tip: "Torch-on & cold-applied sequence",
    img: "/products/Banner2.jpeg",
    wa: waLink(
      "Hello MARBLEX, please share the roof membrane application video / method statement."
    ),
  },
  {
    id: "v2",
    title: "Epoxy floor system",
    tip: "Surface prep → primer → topcoat",
    img: "/products/Banner1.jpeg",
    wa: waLink(
      "Hello MARBLEX, please share the industrial epoxy flooring application guide video."
    ),
  },
  {
    id: "v3",
    title: "Waterstop joint install",
    tip: "Placement, welding & concrete pour",
    img: "/products/Banner3.jpeg",
    wa: waLink(
      "Hello MARBLEX, please share rubber waterstop installation SOP / video."
    ),
  },
];

const INDUSTRIES = [
  {
    title: "Residential & Villas",
    desc: "Terraces, bathrooms, basements",
    icon: HomeWorkOutlinedIcon,
  },
  {
    title: "Commercial Buildings",
    desc: "Podiums, plazas, parking decks",
    icon: ApartmentOutlinedIcon,
  },
  {
    title: "Industrial & Factories",
    desc: "Chemical floors, plant roofs",
    icon: PrecisionManufacturingOutlinedIcon,
  },
  {
    title: "Infrastructure",
    desc: "Dams, reservoirs, tunnels",
    icon: DomainOutlinedIcon,
  },
  {
    title: "GCC & Export",
    desc: "UAE, KSA, Qatar project supply",
    icon: PublicOutlinedIcon,
  },
];

const CITIES = [
  { city: "Lahore", role: "Central plant & HQ", eta: "Same-day / 24h" },
  { city: "Karachi", role: "South dispatch hub", eta: "24–48h" },
  { city: "Islamabad", role: "North corridor", eta: "24–48h" },
  { city: "Faisalabad", role: "Industrial belt", eta: "24–48h" },
  { city: "Multan", role: "South Punjab", eta: "48h" },
  { city: "Peshawar", role: "KP projects", eta: "48–72h" },
];

const SURFACES = [
  "Roof / Terrace",
  "Basement / Retaining wall",
  "Swimming pool / Tank",
  "Industrial floor",
  "Expansion joints",
  "Full building survey",
];

/** 1 — Shop by problem (P0) */
export function ShopByProblemSection({ onSelectCategory }) {
  return (
    <section
      className="relative my-12 scroll-reveal sm:my-16"
      aria-labelledby="shop-problem-heading"
    >
      <div className="mx-auto mb-7 max-w-2xl text-center sm:mb-9">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full border border-[#0a3d52]/15 bg-white px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a3d52] dark:border-slate-700 dark:bg-[#0c222e] dark:text-emerald-300 sm:text-[11px]">
          <EngineeringOutlinedIcon sx={{ fontSize: 14 }} />
          Shop by problem
        </span>
        <h2
          id="shop-problem-heading"
          className="font-heading text-[1.55rem] font-extrabold leading-tight tracking-tight text-[#0a3d52] dark:text-white sm:text-3xl lg:text-[2.15rem]"
        >
          What is failing on your site?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-[13px] text-slate-600 dark:text-slate-300 sm:text-sm">
          Pick the issue — we route you to the right MARBLEX system, not a random product list.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {PROBLEMS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onSelectCategory?.(p.categoryId, p.title)}
            className="group relative flex overflow-hidden rounded-2xl border border-slate-200/90 bg-white text-left shadow-[0_10px_28px_-18px_rgba(10,61,82,0.35)] transition hover:-translate-y-0.5 hover:border-[#0a3d52]/25 hover:shadow-[0_18px_36px_-20px_rgba(10,61,82,0.4)] dark:border-slate-800 dark:bg-[#0c222e]"
          >
            <span className={`w-1.5 shrink-0 bg-gradient-to-b ${p.tone}`} />
            <span className="flex flex-1 items-start gap-3 p-4 sm:p-5">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0a3d52]/8 text-[#0a3d52] dark:bg-emerald-950/50 dark:text-emerald-300">
                <p.icon sx={{ fontSize: 22 }} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="font-heading block text-[15px] font-bold text-[#0a3d52] dark:text-white">
                  {p.title}
                </span>
                <span className="mt-1 block text-[12px] leading-relaxed text-slate-500 dark:text-slate-400">
                  {p.desc}
                </span>
                <span className="mt-2.5 inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide text-[#ff6b4a]">
                  View systems
                  <ArrowForwardRoundedIcon
                    sx={{ fontSize: 14 }}
                    className="transition group-hover:translate-x-0.5"
                  />
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}

/** 2 — Free site survey booking (P0) */
export function SiteSurveySection() {
  const [form, setForm] = useState({
    name: "",
    phone: "",
    city: "Lahore",
    surface: SURFACES[0],
    area: "",
    note: "",
  });

  const openWhatsApp = () => {
    const msg = [
      "*MARBLEX FREE SITE SURVEY REQUEST*",
      "",
      `👤 Name: ${form.name || "—"}`,
      `📞 Phone: ${form.phone || "—"}`,
      `📍 City: ${form.city}`,
      `🏗️ Surface: ${form.surface}`,
      `📐 Approx area: ${form.area || "—"} sq.ft`,
      form.note ? `📝 Note: ${form.note}` : null,
      "",
      "_Please schedule an engineer visit / digital survey._",
    ]
      .filter(Boolean)
      .join("\n");
    window.open(waLink(msg), "_blank", "noopener,noreferrer");
  };

  const ready = form.name.trim() && form.phone.trim() && form.city;

  return (
    <section
      className="relative left-1/2 mt-14 w-screen max-w-[100vw] -translate-x-1/2 sm:mt-20"
      aria-labelledby="site-survey-heading"
    >
      <div className="relative overflow-hidden border-y border-[#0a3d52]/15 bg-gradient-to-br from-[#f4f8fa] via-white to-[#eef5f8] px-4 py-10 dark:border-slate-800 dark:from-[#07151d] dark:via-[#0a1a23] dark:to-[#040e14] sm:px-8 sm:py-14">
        <div className="pointer-events-none absolute -right-16 top-0 h-64 w-64 rounded-full bg-emerald-400/10 blur-[90px]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-56 w-56 rounded-full bg-[#ff6b4a]/10 blur-[90px]" />

        <div className="relative z-10 mx-auto grid max-w-[1200px] grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
              <CalendarMonthOutlinedIcon sx={{ fontSize: 14 }} />
              Free site survey
            </span>
            <h2
              id="site-survey-heading"
              className="font-heading mt-3 text-[1.55rem] font-extrabold leading-tight text-[#0a3d52] dark:text-white sm:text-3xl"
            >
              Book an engineer — get a system recommendation
            </h2>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
              Same flow used by premium waterproofing brands: site check → right products → quote.
              Photos help; WhatsApp closes the loop in minutes.
            </p>
            <ul className="mt-4 space-y-2 text-[12px] text-slate-600 dark:text-slate-300">
              {[
                "Surface diagnosis & moisture risk",
                "Product system match (not one SKU guess)",
                "Coverage estimate + contractor pricing path",
              ].map((t) => (
                <li key={t} className="flex items-start gap-2">
                  <CheckCircleRoundedIcon
                    sx={{ fontSize: 16 }}
                    className="mt-0.5 text-emerald-500"
                  />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_16px_40px_-20px_rgba(10,61,82,0.25)] dark:border-slate-800 dark:bg-[#0c222e] sm:p-6 lg:col-span-7">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Name / Firm *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Tariq Builders"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Phone / WhatsApp *
                </label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="03XX XXXXXXX"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  City
                </label>
                <select
                  value={form.city}
                  onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                  className="mt-1 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                >
                  {CITIES.map((c) => (
                    <option key={c.city} value={c.city}>
                      {c.city}
                    </option>
                  ))}
                  <option value="Other">Other city</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Surface / problem
                </label>
                <select
                  value={form.surface}
                  onChange={(e) => setForm((f) => ({ ...f, surface: e.target.value }))}
                  className="mt-1 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                >
                  {SURFACES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Approx area (sq.ft)
                </label>
                <input
                  type="number"
                  value={form.area}
                  onChange={(e) => setForm((f) => ({ ...f, area: e.target.value }))}
                  placeholder="e.g. 2500"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Site note
                </label>
                <input
                  value={form.note}
                  onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="Leak age, urgency…"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs outline-none focus:border-emerald-500 dark:border-slate-700 dark:bg-[#071620] dark:text-white"
                />
              </div>
            </div>

            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <PhotoCameraOutlinedIcon sx={{ fontSize: 14 }} />
              Tip: after opening WhatsApp, attach 2–3 site photos for faster diagnosis.
            </p>

            <button
              type="button"
              disabled={!ready}
              onClick={openWhatsApp}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-3 text-[13px] font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
            >
              <WhatsAppIcon sx={{ fontSize: 18 }} />
              Send survey request on WhatsApp
              <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/** 3 — Technical library strip (P0) */
export function TechnicalLibrarySection() {
  return (
    <section className="my-14 scroll-reveal sm:my-20" aria-labelledby="tech-lib-heading">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff6b4a]">
            Technical library
          </span>
          <h2
            id="tech-lib-heading"
            className="font-heading mt-1 text-[1.45rem] font-extrabold text-[#0a3d52] dark:text-white sm:text-3xl"
          >
            TDS, manuals &amp; catalogs — one click
          </h2>
          <p className="mt-1.5 max-w-xl text-[13px] text-slate-600 dark:text-slate-300">
            Contractors and consultants need docs above the fold — same standard as Sika / Fosroc portals.
          </p>
        </div>
        <Link
          to="/catalogs"
          className="inline-flex items-center gap-1 text-[12px] font-bold text-[#0a3d52] dark:text-emerald-300"
        >
          Open full library
          <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TECH_DOCS.map((d) => {
          const Inner = (
            <>
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0a3d52]/8 text-[#0a3d52] dark:bg-emerald-950/40 dark:text-emerald-300">
                <d.icon sx={{ fontSize: 20 }} />
              </span>
              <span>
                <span className="font-heading block text-[13px] font-bold text-[#0a3d52] dark:text-white">
                  {d.title}
                </span>
                <span className="text-[11px] text-slate-500">{d.meta}</span>
              </span>
            </>
          );
          const cls =
            "flex items-center gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 transition hover:border-[#0a3d52]/25 hover:shadow-md dark:border-slate-800 dark:bg-[#0c222e]";
          return d.external ? (
            <a key={d.id} href={d.href} target="_blank" rel="noreferrer" className={cls}>
              {Inner}
            </a>
          ) : (
            <Link key={d.id} to={d.href} className={cls}>
              {Inner}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

/** 4 — How-to / application guides (P1) */
export function ApplicationGuidesSection({ onViewMethodology }) {
  return (
    <section className="my-14 scroll-reveal sm:my-20" aria-labelledby="guides-heading">
      <div className="mx-auto mb-7 max-w-2xl text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
          Application guides
        </span>
        <h2
          id="guides-heading"
          className="font-heading mt-1 text-[1.45rem] font-extrabold text-[#0a3d52] dark:text-white sm:text-3xl"
        >
          How professionals apply MARBLEX systems
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {GUIDE_VIDEOS.map((v) => (
          <article
            key={v.id}
            className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0c222e]"
          >
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={v.img}
                alt=""
                className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a3d52]/70 via-transparent to-transparent" />
              <PlayCircleOutlineRoundedIcon
                sx={{ fontSize: 48 }}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white/95 drop-shadow"
              />
            </div>
            <div className="p-4">
              <h3 className="font-heading text-[14px] font-bold text-[#0a3d52] dark:text-white">
                {v.title}
              </h3>
              <p className="mt-0.5 text-[11px] text-slate-500">{v.tip}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onViewMethodology?.()}
                  className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-bold text-[#0a3d52] dark:border-slate-700 dark:text-slate-200"
                >
                  View 4-stage method
                </button>
                <a
                  href={v.wa}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-bold text-white"
                >
                  <WhatsAppIcon sx={{ fontSize: 14 }} />
                  Get video
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/** 5 — Certifications & warranty (P1) */
export function CertsWarrantySection() {
  const items = [
    {
      icon: VerifiedOutlinedIcon,
      title: "ISO-aligned QC",
      desc: "Plant & batch protocols documented in corporate profile.",
    },
    {
      icon: ScienceOutlinedIcon,
      title: "Lab-tested systems",
      desc: "Formulations screened for hydrostatic & chemical load.",
    },
    {
      icon: WorkspacePremiumOutlinedIcon,
      title: "Project warranties",
      desc: "System warranty paths for approved applications.",
    },
    {
      icon: SecurityOutlinedIcon,
      title: "Register warranty",
      desc: "After install — log site + product batch on WhatsApp.",
    },
  ];

  return (
    <section
      className="relative left-1/2 my-14 w-screen max-w-[100vw] -translate-x-1/2 sm:my-20"
      aria-labelledby="certs-heading"
    >
      <div className="border-y border-[#0a3d52]/20 bg-[#0a3d52] px-4 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#ff8c73]">
                Trust & warranty
              </span>
              <h2
                id="certs-heading"
                className="font-heading mt-1 text-[1.45rem] font-extrabold sm:text-3xl"
              >
                Certified formulations. Documented accountability.
              </h2>
            </div>
            <a
              href={waLink(
                "Hello MARBLEX, I want to register a project warranty / request ISO & TDS pack."
              )}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-2.5 text-[12px] font-bold text-[#0a3d52]"
            >
              Register / request docs
              <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
            </a>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((it) => (
              <div
                key={it.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
              >
                <it.icon sx={{ fontSize: 22 }} className="text-[#ff8c73]" />
                <h3 className="font-heading mt-2 text-[14px] font-bold">{it.title}</h3>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-300">{it.desc}</p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] font-semibold tracking-wide text-slate-300">
            ASTM · DIN · ISO references · Hydrostatic-rated systems
          </p>
        </div>
      </div>
    </section>
  );
}

/** 6 — Industries we serve (P1) */
export function IndustriesSection({ onSelectCategory }) {
  return (
    <section className="my-14 scroll-reveal sm:my-16" aria-labelledby="industries-heading">
      <div className="mx-auto mb-7 max-w-2xl text-center">
        <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0a3d52] dark:text-emerald-300">
          Markets
        </span>
        <h2
          id="industries-heading"
          className="font-heading mt-1 text-[1.45rem] font-extrabold text-[#0a3d52] dark:text-white sm:text-3xl"
        >
          Industries we engineer for
        </h2>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {INDUSTRIES.map((ind) => (
          <button
            key={ind.title}
            type="button"
            onClick={() => onSelectCategory?.(ind.title.includes("Industrial") ? "elastomeric" : "waterproofing")}
            className="rounded-2xl border border-slate-200/90 bg-white p-4 text-left transition hover:border-[#0a3d52]/25 hover:shadow-md dark:border-slate-800 dark:bg-[#0c222e]"
          >
            <ind.icon sx={{ fontSize: 22 }} className="text-[#ff6b4a]" />
            <h3 className="font-heading mt-2 text-[13px] font-bold text-[#0a3d52] dark:text-white">
              {ind.title}
            </h3>
            <p className="mt-0.5 text-[11px] text-slate-500">{ind.desc}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

/** 7 — Cities / dispatch (P1) + Export teaser */
export function DispatchCitiesSection() {
  const exportWa = waLink(
    "Hello MARBLEX Export Desk, I need GCC / international project pricing and logistics."
  );

  return (
    <section className="my-14 scroll-reveal sm:my-20" aria-labelledby="dispatch-heading">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.16em] text-emerald-600">
            <LocalShippingOutlinedIcon sx={{ fontSize: 14 }} />
            Dispatch network
          </span>
          <h2
            id="dispatch-heading"
            className="font-heading mt-1 text-[1.45rem] font-extrabold text-[#0a3d52] dark:text-white sm:text-3xl"
          >
            Plants & corridors across Pakistan
          </h2>
          <p className="mt-2 text-[13px] text-slate-600 dark:text-slate-300">
            Typical lead times for stocked systems — confirm on WhatsApp for your site pin.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {CITIES.map((c) => (
              <div
                key={c.city}
                className="flex items-start gap-3 rounded-xl border border-slate-200/90 bg-white p-3.5 dark:border-slate-800 dark:bg-[#0c222e]"
              >
                <LocationOnOutlinedIcon sx={{ fontSize: 18 }} className="mt-0.5 text-[#ff6b4a]" />
                <div>
                  <p className="text-[13px] font-bold text-[#0a3d52] dark:text-white">{c.city}</p>
                  <p className="text-[11px] text-slate-500">{c.role}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-emerald-600">{c.eta}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl border border-[#0a3d52]/20 bg-gradient-to-br from-[#0a3d52] to-[#072836] p-6 text-white lg:col-span-5">
          <div>
            <PublicOutlinedIcon sx={{ fontSize: 28 }} className="text-[#ff8c73]" />
            <h3 className="font-heading mt-3 text-xl font-extrabold">GCC &amp; export inquiry</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-slate-200">
              UAE, KSA, Qatar, Oman project supply with documentation pack (TDS, COA, packing list).
              Use the WhatsApp negotiation desk country selector or open export desk directly.
            </p>
          </div>
          <a
            href={exportWa}
            target="_blank"
            rel="noreferrer"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[#ff6b4a] px-4 py-3 text-[13px] font-bold text-white transition hover:bg-[#e65636]"
          >
            <WhatsAppIcon sx={{ fontSize: 18 }} />
            Talk to export desk
          </a>
        </div>
      </div>
    </section>
  );
}

/** Optional lightweight product compare (P2) — top 2 selected from list */
export function QuickCompareTeaser({ products = [] }) {
  const pair = useMemo(() => {
    const list = products?.length ? products : [];
    if (list.length < 2) return null;
    return [list[0], list[1]];
  }, [products]);

  if (!pair) return null;

  return (
    <section className="my-12 scroll-reveal rounded-2xl border border-slate-200/90 bg-white p-5 dark:border-slate-800 dark:bg-[#0c222e] sm:my-16 sm:p-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#ff6b4a]">
            Quick compare
          </span>
          <h2 className="font-heading text-lg font-extrabold text-[#0a3d52] dark:text-white sm:text-xl">
            Side-by-side snapshot
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-500">
          Tap a product for full TDS &amp; quote
        </span>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {pair.map((p) => (
          <Link
            key={p._id}
            to={`/product/${p._id}`}
            state={{ product: p }}
            className="rounded-xl border border-slate-200 p-3 transition hover:border-[#0a3d52]/30 dark:border-slate-700"
          >
            <p className="truncate text-[13px] font-bold text-[#0a3d52] dark:text-white">{p.name}</p>
            <p className="mt-1 text-[11px] text-slate-500">
              {(p.category || "system").toString()} · PKR {(p.price || 0).toLocaleString()}
            </p>
            <p className="mt-2 line-clamp-2 text-[11px] text-slate-600 dark:text-slate-400">
              {p.description || "Open for coverage, packs, and WhatsApp quote."}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
