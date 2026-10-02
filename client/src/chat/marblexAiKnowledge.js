/** Catalog + product knowledge for guest Marblex AI (no login). */

export const CATALOGS = [
  {
    id: "profile",
    title: "Corporate Profile & ISO Certifications",
    category: "Corporate & Capabilities",
    href: "/catalogs?tab=profile",
    blurb:
      "Plant overview, lab testing, nationwide projects, and ISO 9001:2015 quality protocols (10 pages).",
  },
  {
    id: "construction",
    title: "Waterproofing & Chemical Application Manual",
    category: "Technical Specifications",
    href: "/catalogs?tab=construction",
    blurb:
      "SOPs for elastomeric coatings, crystalline penetrants, APP torch-on membranes, and termite barriers.",
  },
  {
    id: "waterstopper",
    title: "Rubber Waterstop Profile Data & Joint Design",
    category: "Hydraulic Engineering",
    href: "/catalogs?tab=waterstopper",
    blurb:
      "Elastomeric profiles, center-bulb specs, and heat-welding SOPs for dams, reservoirs, and basements.",
  },
];

export const PRODUCTS = [
  {
    name: "Entryway Flooring",
    category: "elastomeric",
    blurb: "High-durability moisture seal for heavy foot traffic.",
    href: "/shop",
  },
  {
    name: "Waterproofing Barrier",
    category: "waterproofing",
    blurb: "Polymer-modified liquid membrane for hydrostatic pressure.",
    href: "/shop",
  },
  {
    name: "Mosaic Swimming Pool Seal",
    category: "chemicals",
    blurb: "Chlorine and UV resistant sealant for pools and water vessels.",
    href: "/shop",
  },
  {
    name: "Termite (Marblex) 2.9c",
    category: "chemicals",
    blurb: "Industrial anti-termite soil barrier for foundations.",
    href: "/shop",
  },
  {
    name: "Polymer Wall Putty",
    category: "chemicals",
    blurb: "Water-resistant white cement putty with crack bridging.",
    href: "/shop",
  },
  {
    name: "Interior Emulsion Paint",
    category: "elastomeric",
    blurb: "Washable low-VOC protective coating for interiors.",
    href: "/shop",
  },
  {
    name: "Bituminous Membrane",
    category: "membranes",
    blurb: "APP modified sheet with polyester reinforcement.",
    href: "/shop",
  },
  {
    name: "Vulcanized Rubber Waterstop",
    category: "rubber",
    blurb: "Rib profiles for expansion and construction joints.",
    href: "/shop",
  },
];

export const SERVICES = [
  "Crystalline & elastomeric waterproofing",
  "APP & SBS polymer membrane sheets",
  "PU high-pressure grouting for active leaks",
  "Thermal XPS insulation",
  "Industrial epoxy & PU floors",
  "Structural termite soil impregnation",
  "Elastomeric rubber & PVC waterstops",
  "Concrete repair & CFRP wrapping",
];

export const WELCOME_QUESTION =
  "Planning a waterproofing or joint-sealing job — which site condition should we solve first?";

export const SUGGESTIONS = [
  "Which waterstop for basement joints?",
  "Show me your catalogs",
  "Bituminous membrane options",
  "Need a project quote",
];

function includesAny(text, words) {
  return words.some((w) => text.includes(w));
}

export function answerMarblexAi(rawInput) {
  const q = String(rawInput || "")
    .toLowerCase()
    .trim();

  if (!q) {
    return {
      text: "Ask me about waterstops, membranes, waterproofing, termite protection, or our catalogs — I’ll point you to the right pack.",
    };
  }

  if (includesAny(q, ["hello", "hi", "hey", "salam", "assalam", "hola"])) {
    return {
      text: `${WELCOME_QUESTION}\n\nYou can also browse Shop, Services, or Catalogs — I know the full Marblex line.`,
      links: [
        { label: "Shop products", href: "/shop" },
        { label: "View catalogs", href: "/catalogs" },
      ],
    };
  }

  if (includesAny(q, ["catalog", "catalogue", "brochure", "tds", "manual", "pdf"])) {
    const lines = CATALOGS.map((c) => `• ${c.title} — ${c.blurb}`).join("\n");
    return {
      text: `Here are our technical catalogs:\n\n${lines}\n\nOpen any pack from the Catalogs page.`,
      links: CATALOGS.map((c) => ({ label: c.title, href: c.href })),
    };
  }

  if (includesAny(q, ["waterstop", "water stop", "joint", "expansion", "basement", "dam", "reservoir"])) {
    const product = PRODUCTS.find((p) => p.name.toLowerCase().includes("waterstop"));
    return {
      text:
        "For construction and expansion joints we recommend Vulcanized Rubber Waterstops — engineered rib profiles for basements, dams, and reservoirs. Our Waterstop catalog has CAD cross-sections and welding SOPs.",
      links: [
        { label: "Waterstop catalog", href: "/catalogs?tab=waterstopper" },
        { label: product?.name || "Shop waterstops", href: "/shop" },
      ],
    };
  }

  if (includesAny(q, ["membrane", "bitumen", "bituminous", "torch", "app", "sbs", "sheet"])) {
    return {
      text:
        "APP-modified Bituminous Membrane sheets with polyester reinforcement handle puncture-heavy roofs and podium decks. The Application Manual covers cold/hot elastomeric coats and torch-on SOPs.",
      links: [
        { label: "Application manual", href: "/catalogs?tab=construction" },
        { label: "Shop membranes", href: "/shop" },
      ],
    };
  }

  if (includesAny(q, ["waterproof", "leak", "seepage", "hydrostatic", "crystalline", "elastomeric", "coating"])) {
    return {
      text:
        "For hydrostatic pressure and seepage we typically start with polymer liquid membranes or crystalline systems, then detail joints with waterstops. Tell me roof, basement, or pool — I’ll narrow it.",
      links: [
        { label: "Waterproofing products", href: "/shop" },
        { label: "Services", href: "/services" },
      ],
    };
  }

  if (includesAny(q, ["termite", "pest", "soil"])) {
    return {
      text:
        "Termite (Marblex) 2.9c is our industrial soil barrier for foundations and sub-structures. Pre/post-construction impregnation is also available as a service.",
      links: [
        { label: "Shop Termite 2.9c", href: "/shop" },
        { label: "Services", href: "/services" },
      ],
    };
  }

  if (includesAny(q, ["pool", "swimming", "mosaic", "chlorine"])) {
    return {
      text:
        "Mosaic Swimming Pool Seal is chlorine- and UV-resistant for pools and water-retaining vessels. Pair with proper joint detailing if you have expansion gaps.",
      links: [{ label: "Shop pool seal", href: "/shop" }],
    };
  }

  if (includesAny(q, ["quote", "price", "cost", "estimate", "budget", "tender"])) {
    return {
      text:
        "Happy to help scope a quote. Share site type (roof / basement / joint / pool), area approx., and city — or use Instant Quote / Contact for engineering desk follow-up.",
      links: [
        { label: "Contact engineering", href: "/contact" },
        { label: "Shop", href: "/shop" },
      ],
    };
  }

  if (includesAny(q, ["service", "install", "application", "grout", "epoxy", "floor", "repair"])) {
    const list = SERVICES.map((s) => `• ${s}`).join("\n");
    return {
      text: `Marblex site services include:\n\n${list}\n\nBook a consult from Services or Contact.`,
      links: [
        { label: "Services", href: "/services" },
        { label: "Contact", href: "/contact" },
      ],
    };
  }

  if (includesAny(q, ["product", "shop", "buy", "list", "range", "catalog of product"])) {
    const list = PRODUCTS.map((p) => `• ${p.name} — ${p.blurb}`).join("\n");
    return {
      text: `Current shop highlights:\n\n${list}`,
      links: [{ label: "Open shop", href: "/shop" }],
    };
  }

  if (includesAny(q, ["iso", "company", "profile", "about", "marblex"])) {
    return {
      text:
        "MARBLEX Chemical & Rubber manufactures industrial waterproofing, rubber waterstops, and construction chemicals under ISO 9001:2015 protocols. The Corporate Profile catalog covers plant, lab, and project credentials.",
      links: [
        { label: "Corporate profile", href: "/catalogs?tab=profile" },
        { label: "About / home", href: "/" },
      ],
    };
  }

  // Fuzzy product name hit
  const hit = PRODUCTS.find((p) => q.includes(p.name.toLowerCase().split(" ")[0]) || q.includes(p.name.toLowerCase()));
  if (hit) {
    return {
      text: `${hit.name}: ${hit.blurb} Browse the full range in Shop, or open matching technical catalogs for application detail.`,
      links: [
        { label: hit.name, href: hit.href },
        { label: "Catalogs", href: "/catalogs" },
      ],
    };
  }

  return {
    text:
      "I can help with Marblex catalogs, waterstops, membranes, waterproofing, termite protection, services, and quotes. Try one of the suggestions below — or ask about your site condition.",
    links: [
      { label: "Catalogs", href: "/catalogs" },
      { label: "Shop", href: "/shop" },
      { label: "Contact", href: "/contact" },
    ],
  };
}
