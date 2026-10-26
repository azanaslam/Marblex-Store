import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import RemoveRoundedIcon from "@mui/icons-material/RemoveRounded";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import PriceCheckOutlinedIcon from "@mui/icons-material/PriceCheckOutlined";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import StorefrontOutlinedIcon from "@mui/icons-material/StorefrontOutlined";
import VerifiedOutlinedIcon from "@mui/icons-material/VerifiedOutlined";
import ArrowBackIosNewRoundedIcon from "@mui/icons-material/ArrowBackIosNewRounded";
import MicNoneRoundedIcon from "@mui/icons-material/MicNoneRounded";
import PhotoCameraOutlinedIcon from "@mui/icons-material/PhotoCameraOutlined";
import SentimentSatisfiedAltRoundedIcon from "@mui/icons-material/SentimentSatisfiedAltRounded";
import SignalCellularAltRoundedIcon from "@mui/icons-material/SignalCellularAltRounded";
import WifiRoundedIcon from "@mui/icons-material/WifiRounded";
import BatteryFullRoundedIcon from "@mui/icons-material/BatteryFullRounded";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { DEFAULT_PAYMENT_CONFIG } from "../config/paymentConfig";

const FALLBACK_ITEMS = [
  { _id: "wn-1", name: "Entryway Flooring", category: "Flooring", price: 4000, unit: "unit" },
  { _id: "wn-2", name: "Waterproofing Barrier", category: "Waterproofing", price: 3500, unit: "unit" },
  { _id: "wn-3", name: "Polymer Wall Putty", category: "Chemicals", price: 3000, unit: "Bag" },
  { _id: "wn-4", name: "Mosaic Pool Sealant", category: "Sealants", price: 650, unit: "Tube" },
  { _id: "wn-5", name: "Bituminous Membrane", category: "Membranes", price: 2000, unit: "Roll" },
  { _id: "wn-6", name: "Industrial Epoxy Kit", category: "Flooring", price: 4200, unit: "Kit" },
];

const LOCATION_DATA = [
  {
    code: "PK",
    label: "Pakistan",
    flag: "🇵🇰",
    cities: [
      "Lahore", "Karachi", "Islamabad", "Rawalpindi", "Faisalabad", "Multan",
      "Peshawar", "Quetta", "Sialkot", "Gujranwala", "Hyderabad", "Bahawalpur",
      "Other / Site (Pakistan)",
    ],
  },
  {
    code: "AE",
    label: "United Arab Emirates",
    flag: "🇦🇪",
    cities: ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Ras Al Khaimah", "Other / Site (UAE)"],
  },
  {
    code: "SA",
    label: "Saudi Arabia",
    flag: "🇸🇦",
    cities: ["Riyadh", "Jeddah", "Dammam", "Khobar", "Mecca", "Medina", "Other / Site (KSA)"],
  },
  {
    code: "QA",
    label: "Qatar",
    flag: "🇶🇦",
    cities: ["Doha", "Al Rayyan", "Al Wakrah", "Other / Site (Qatar)"],
  },
  {
    code: "OM",
    label: "Oman",
    flag: "🇴🇲",
    cities: ["Muscat", "Sohar", "Salalah", "Other / Site (Oman)"],
  },
  {
    code: "BH",
    label: "Bahrain",
    flag: "🇧🇭",
    cities: ["Manama", "Riffa", "Other / Site (Bahrain)"],
  },
  {
    code: "GB",
    label: "United Kingdom",
    flag: "🇬🇧",
    cities: ["London", "Manchester", "Birmingham", "Other / Site (UK)"],
  },
  {
    code: "OTHER",
    label: "Other Country",
    flag: "🌍",
    cities: ["Export / International Site"],
  },
];

const fieldCls =
  "mt-1 w-full appearance-none rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-medium text-slate-800 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15 dark:border-slate-700 dark:bg-[#071620] dark:text-white";

function TypingDots() {
  return (
    <div className="inline-flex items-center gap-[3px] px-1 py-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-[5px] w-[5px] rounded-full bg-slate-400 dark:bg-slate-500"
          style={{
            animation: "wnDotPulse 1.35s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}

/** Slow, smooth word-by-word typewriter */
function TypewriterWords({ text, active, wordMs = 175, onDone }) {
  const [wordCount, setWordCount] = useState(0);
  const doneRef = useRef(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  const tokens = useMemo(() => text.match(/\S+\s*|\n+/g) || [text], [text]);

  useEffect(() => {
    if (!active) {
      setWordCount(0);
      doneRef.current = false;
      return undefined;
    }

    setWordCount(0);
    doneRef.current = false;
    let i = 0;

    const timer = window.setInterval(() => {
      i += 1;
      setWordCount(i);
      if (i >= tokens.length) {
        window.clearInterval(timer);
        if (!doneRef.current) {
          doneRef.current = true;
          // brief pause after last word before next bubble
          window.setTimeout(() => onDoneRef.current?.(), 420);
        }
      }
    }, wordMs);

    return () => window.clearInterval(timer);
  }, [active, tokens, wordMs]);

  const shown = tokens.slice(0, wordCount).join("");

  return (
    <span>
      {shown}
      {active && wordCount < tokens.length ? (
        <span className="ml-0.5 inline-block h-[0.9em] w-[1.5px] translate-y-[1px] bg-current align-middle opacity-60" />
      ) : null}
    </span>
  );
}

function buildScript(selectedList, locationLabel, customerName) {
  const place = locationLabel || "Lahore, Pakistan";
  const lines =
    selectedList.length > 0
      ? selectedList
          .slice(0, 3)
          .map((it) => `• ${it.qty}× ${it.name}`)
          .concat(
            selectedList.length > 3 ? [`• +${selectedList.length - 3} more item(s)`] : []
          )
          .join("\n")
      : "• Project materials quotation";

  return [
    {
      id: "m1",
      from: "client",
      time: "11:42 AM",
      title: customerName?.trim()
        ? `${customerName.trim()} (Site Inquiry)`
        : "Client Site Inquiry",
      body: `Salam MARBLEX team! We have a project in ${place}. Need pricing for:\n${lines}`,
      wordMs: 170,
    },
    {
      id: "m2",
      from: "agent",
      time: "11:43 AM",
      title: "Eng. Hamza (Technical Lead)",
      body: "Walaikum Assalam! Thanks for reaching out. We have fresh batch inventory available at our central plant.",
      wordMs: 180,
      highlight: true,
    },
    {
      id: "m3",
      from: "client",
      time: "11:44 AM",
      title: null,
      body: "Deal agreed! Please send invoice & dispatch details.",
      wordMs: 190,
    },
  ];
}

export function WhatsAppNegotiationSection({ products = [] }) {
  const sectionRef = useRef(null);
  const phoneRef = useRef(null);
  const chatBodyRef = useRef(null);
  const chatEndRef = useRef(null);
  const [inView, setInView] = useState(false);
  const inViewRef = useRef(false);
  const selectedListRef = useRef([]);

  const availableItems = useMemo(() => {
    if (products?.length > 0) {
      return products.slice(0, 5).map((p) => ({ ...p, unit: p.unit || "unit" }));
    }
    return FALLBACK_ITEMS.slice(0, 5);
  }, [products]);

  const [selectedItems, setSelectedItems] = useState(() => {
    const init = {};
    if (availableItems[0]?._id) init[availableItems[0]._id] = 2;
    if (availableItems[1]?._id) init[availableItems[1]._id] = 1;
    return init;
  });
  const seededFromApiRef = useRef(false);

  useEffect(() => {
    if (seededFromApiRef.current || !products?.length) return;
    seededFromApiRef.current = true;
    const init = {};
    if (products[0]?._id) init[products[0]._id] = 2;
    if (products[1]?._id) init[products[1]._id] = 1;
    if (Object.keys(init).length) setSelectedItems(init);
  }, [products]);

  const [customerName, setCustomerName] = useState("");
  const [countryCode, setCountryCode] = useState("PK");
  const [city, setCity] = useState("Lahore");

  const activeCountry = useMemo(
    () => LOCATION_DATA.find((c) => c.code === countryCode) || LOCATION_DATA[0],
    [countryCode]
  );

  const locationLabel = useMemo(() => {
    const cityPart = city || activeCountry.cities[0];
    return `${cityPart}, ${activeCountry.label}`;
  }, [city, activeCountry]);

  const selectedList = useMemo(
    () =>
      availableItems
        .filter((item) => selectedItems[item._id] > 0)
        .map((item) => ({ ...item, qty: selectedItems[item._id] })),
    [availableItems, selectedItems]
  );

  const approxEstimatedTotal = useMemo(
    () => selectedList.reduce((acc, it) => acc + (it.price || 0) * it.qty, 0),
    [selectedList]
  );

  const locationRef = useRef(locationLabel);
  const nameRef = useRef(customerName);
  locationRef.current = locationLabel;
  nameRef.current = customerName;
  selectedListRef.current = selectedList;
  inViewRef.current = inView;

  const [script, setScript] = useState(() =>
    buildScript(selectedList, locationLabel, customerName)
  );
  const [typingWho, setTypingWho] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [activeMsgId, setActiveMsgId] = useState(null);
  const [loopKey, setLoopKey] = useState(0);
  const [dealStage, setDealStage] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn, ms) => {
    const id = window.setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  const resetChatVisual = useCallback(() => {
    clearTimers();
    setRevealed([]);
    setActiveMsgId(null);
    setTypingWho(null);
    setDealStage(0);
  }, [clearTimers]);

  // Chat runs ONLY while phone is on screen — never hijack page scroll
  useEffect(() => {
    const el = phoneRef.current;
    if (!el) return undefined;

    const obs = new IntersectionObserver(
      ([entry]) => {
        const visible =
          entry.isIntersecting && entry.intersectionRatio >= 0.4;
        setInView(visible);
        if (!visible) resetChatVisual();
      },
      { threshold: [0, 0.4, 0.6, 1], rootMargin: "-10% 0px -10% 0px" }
    );
    obs.observe(el);
    return () => {
      obs.disconnect();
      clearTimers();
    };
  }, [clearTimers, resetChatVisual]);

  useEffect(() => {
    if (!inView) return undefined;

    clearTimers();
    const nextScript = buildScript(
      selectedListRef.current,
      locationRef.current,
      nameRef.current
    );
    setScript(nextScript);
    setRevealed([]);
    setActiveMsgId(null);
    setTypingWho(null);
    setDealStage(0);

    schedule(() => {
      setTypingWho("client");
      schedule(() => {
        setTypingWho(null);
        setActiveMsgId(nextScript[0]?.id || null);
      }, 1300);
    }, 500);

    return clearTimers;
  }, [inView, loopKey, clearTimers, schedule]);

  const handleMsgTyped = useCallback(
    (msgIndex) => {
      if (!inViewRef.current) return;
      const msg = script[msgIndex];
      if (!msg) return;

      setRevealed((prev) => (prev.includes(msg.id) ? prev : [...prev, msg.id]));
      setActiveMsgId(null);
      if (msgIndex >= 0) setDealStage(Math.min(2, msgIndex + 1));
      if (msgIndex === 2) setDealStage(2);

      const nextIndex = msgIndex + 1;
      if (nextIndex >= script.length) {
        schedule(() => {
          if (inViewRef.current) setLoopKey((k) => k + 1);
        }, 4000);
        return;
      }

      const nextFrom = script[nextIndex].from;
      setTypingWho(nextFrom);
      schedule(() => {
        if (!inViewRef.current) return;
        setTypingWho(null);
        setActiveMsgId(script[nextIndex].id);
      }, nextFrom === "agent" ? 1500 : 1100);
    },
    [script, schedule]
  );

  // Scroll ONLY inside the chat pane — never the page
  useEffect(() => {
    const body = chatBodyRef.current;
    if (!body || !inView) return;
    body.scrollTop = body.scrollHeight;
  }, [revealed, activeMsgId, typingWho, inView]);

  const handleCountryChange = (code) => {
    setCountryCode(code);
    const next = LOCATION_DATA.find((c) => c.code === code);
    setCity(next?.cities?.[0] || "");
  };

  const toggleItem = (item) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (next[item._id]) delete next[item._id];
      else next[item._id] = 1;
      return next;
    });
  };

  const updateQuantity = (itemId, change) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      return { ...prev, [itemId]: Math.max(1, current + change) };
    });
  };

  const waNumber = DEFAULT_PAYMENT_CONFIG.whatsapp?.number || "923084585792";
  const waFormatted =
    DEFAULT_PAYMENT_CONFIG.whatsapp?.formattedNumber || "+92 308 4585792";

  const handleOpenWhatsApp = () => {
    let message = `*MARBLEX INDUSTRIAL INQUIRY & BULK NEGOTIATION*\n\n`;
    if (customerName.trim()) message += `👤 *Client / Firm:* ${customerName.trim()}\n`;
    message += `🌍 *Country:* ${activeCountry.label}\n`;
    message += `📍 *City / Site:* ${city || "—"}\n`;

    message += `\n📦 *Requested Products & Quantities:*\n`;
    if (selectedList.length === 0) {
      message += `• General Project Quotation & Technical Assistance\n`;
    } else {
      selectedList.forEach((it, idx) => {
        message += `${idx + 1}. *${it.name}*\n   Qty: ${it.qty} ${it.unit || "units"} (List: PKR ${(it.price || 0).toLocaleString()})\n`;
      });
      message += `\n💰 *Standard Estimate:* PKR ${approxEstimatedTotal.toLocaleString()}\n`;
    }

    message += `\n_I would like to discuss volume discounts, availability, and fast dispatch._`;

    window.open(
      `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const formReady = selectedList.length > 0 && countryCode && city;

  const renderBubble = (msg, isTyping) => {
    const isClient = msg.from === "client";
    const showFull = !isTyping;

    return (
      <div
        key={msg.id}
        className={`flex w-full ${isClient ? "justify-end" : "justify-start"} animate-[wnBubbleIn_0.45s_ease-out]`}
      >
        <div
          className={`relative max-w-[88%] rounded-2xl px-3 py-2 shadow-sm ${
            isClient
              ? "rounded-tr-sm bg-[#d9fdd3] text-slate-800 dark:bg-[#005c4b] dark:text-emerald-50"
              : "rounded-tl-sm bg-white text-slate-800 dark:bg-[#1f2c34] dark:text-slate-100"
          }`}
        >
          {msg.title ? (
            <p
              className={`mb-0.5 text-[10px] font-bold ${
                isClient
                  ? "text-emerald-800 dark:text-emerald-200"
                  : "text-emerald-700 dark:text-emerald-400"
              }`}
            >
              {msg.title}
            </p>
          ) : null}

          <p className="whitespace-pre-line text-[11.5px] leading-relaxed">
            {isTyping ? (
              <TypewriterWords
                text={msg.body}
                active
                wordMs={msg.wordMs || 175}
                onDone={() =>
                  handleMsgTyped(script.findIndex((m) => m.id === msg.id))
                }
              />
            ) : (
              msg.body
            )}
          </p>

          {msg.highlight && showFull ? (
            <div className="mt-1.5 rounded-xl border border-emerald-500/25 bg-emerald-50/90 p-2 text-[11px] dark:border-emerald-500/30 dark:bg-emerald-950/40">
              <span className="font-bold text-emerald-800 dark:text-emerald-300">
                Special Contractor Deal:
              </span>
              <p className="mt-0.5 text-slate-600 dark:text-slate-300">
                We can offer a{" "}
                <b className="text-emerald-700 dark:text-emerald-300">12% volume concession</b>{" "}
                with free site delivery within 24 hours.
              </p>
            </div>
          ) : null}

          <div
            className={`mt-1 flex items-center justify-end gap-0.5 text-[9.5px] ${
              isClient ? "text-slate-500 dark:text-emerald-300/80" : "text-slate-400"
            }`}
          >
            <span>{msg.time}</span>
            {isClient ? (
              <DoneAllRoundedIcon sx={{ fontSize: 12 }} className="text-sky-500" />
            ) : null}
          </div>
        </div>
      </div>
    );
  };

  const stages = [
    { id: 0, label: "Inquiry" },
    { id: 1, label: "Negotiate" },
    { id: 2, label: "Deal closed" },
  ];

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden border-y border-[#0a3d52]/8 bg-gradient-to-b from-[#f6fafb] via-white to-[#eef5f8] py-10 transition-colors duration-300 dark:border-slate-800/80 dark:from-[#07151d] dark:via-[#0a1a23] dark:to-[#040e14] sm:py-14"
      aria-labelledby="wa-negotiate-heading"
    >
      <style>{`
        @keyframes wnDotPulse {
          0%, 80%, 100% { opacity: 0.35; transform: translateY(0); }
          40% { opacity: 1; transform: translateY(-2px); }
        }
        @keyframes wnBubbleIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      <div className="pointer-events-none absolute -left-20 top-1/3 h-[280px] w-[280px] rounded-full bg-[#0a3d52]/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-16 top-1/4 h-[300px] w-[300px] rounded-full bg-emerald-500/12 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-10 left-1/3 h-[220px] w-[220px] rounded-full bg-[#ff6b4a]/8 blur-[100px]" />

      <div className="relative mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-2xl text-center sm:mb-10">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/25 bg-emerald-50/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/50 dark:text-emerald-400 sm:text-[11px]">
            <WhatsAppIcon sx={{ fontSize: 14 }} className="text-emerald-500" />
            Direct Engineer &amp; Wholesale WhatsApp Desk
          </div>
          <h2
            id="wa-negotiate-heading"
            className="font-heading text-[1.65rem] font-extrabold leading-[1.2] tracking-tight text-[#0a3d52] dark:text-white sm:text-3xl lg:text-[2.1rem]"
          >
            Select materials, negotiate on{" "}
            <span className="bg-gradient-to-r from-emerald-600 to-[#ff6b4a] bg-clip-text text-transparent">
              WhatsApp
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[13px] leading-relaxed text-slate-600 dark:text-slate-300 sm:text-sm">
            Pick items, set your site location, and chat with a MARBLEX engineer for volume rates.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12 lg:gap-8">
          {/* LEFT — matches phone column height */}
          <div className="flex lg:col-span-6">
            <div className="flex w-full flex-col rounded-2xl border border-slate-200/90 bg-white p-4 shadow-[0_10px_32px_-12px_rgba(10,61,82,0.1)] dark:border-slate-800 dark:bg-[#0c222e] sm:p-5">
              {/* Professional benefit headings */}
              <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                {[
                  {
                    icon: PriceCheckOutlinedIcon,
                    title: "Wholesale rates",
                    desc: "Volume pricing for contractors",
                    tone: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300",
                  },
                  {
                    icon: HandshakeOutlinedIcon,
                    title: "Live deal closing",
                    desc: "Engineer negotiates with you",
                    tone: "bg-[#0a3d52]/8 text-[#0a3d52] dark:bg-sky-950/40 dark:text-sky-200",
                  },
                  {
                    icon: LocalShippingOutlinedIcon,
                    title: "Fast dispatch",
                    desc: "Same-day plant dispatch",
                    tone: "bg-[#ff6b4a]/10 text-[#e65636] dark:bg-orange-950/40 dark:text-orange-300",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-[#091a24]"
                  >
                    <div className={`mb-2 flex h-8 w-8 items-center justify-center rounded-lg ${f.tone}`}>
                      <f.icon sx={{ fontSize: 18 }} />
                    </div>
                    <h4 className="font-heading text-[12px] font-bold leading-tight text-[#0a3d52] dark:text-white">
                      {f.title}
                    </h4>
                    <p className="mt-0.5 text-[10px] leading-snug text-slate-500 dark:text-slate-400">
                      {f.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <h3 className="text-sm font-bold text-[#0a3d52] dark:text-white">
                  Choose materials
                </h3>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  {selectedList.length} selected
                </span>
              </div>

              <div className="mt-3 min-h-0 flex-1 space-y-2 overflow-y-auto pr-0.5 sm:max-h-none lg:max-h-[280px]">
                {availableItems.map((item) => {
                  const isSelected = !!selectedItems[item._id];
                  const qty = selectedItems[item._id] || 0;
                  return (
                    <div
                      key={item._id}
                      role="button"
                      tabIndex={0}
                      onClick={() => toggleItem(item)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleItem(item);
                        }
                      }}
                      className={`group flex cursor-pointer items-center justify-between gap-2 rounded-xl border px-2.5 py-2 transition-all ${
                        isSelected
                          ? "border-emerald-500/70 bg-emerald-50/60 dark:bg-emerald-950/30"
                          : "border-slate-200/70 bg-slate-50/50 hover:border-slate-300 dark:border-slate-800 dark:bg-[#091a24]"
                      }`}
                    >
                      <div className="flex min-w-0 items-center gap-2.5">
                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-slate-300 bg-white text-transparent dark:border-slate-600 dark:bg-slate-800"
                          }`}
                        >
                          <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[12px] font-bold text-slate-800 dark:text-white">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">
                            PKR {(item.price || 0).toLocaleString()} · {item.unit || "unit"}
                          </p>
                        </div>
                      </div>

                      {isSelected ? (
                        <div
                          className="flex shrink-0 items-center gap-1 rounded-lg border border-emerald-300 bg-white p-0.5 dark:border-emerald-700/60 dark:bg-[#0c222e]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            aria-label="Decrease"
                            onClick={() => updateQuantity(item._id, -1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800"
                          >
                            <RemoveRoundedIcon sx={{ fontSize: 12 }} />
                          </button>
                          <span className="w-5 text-center text-[11px] font-bold dark:text-white">
                            {qty}
                          </span>
                          <button
                            type="button"
                            aria-label="Increase"
                            onClick={() => updateQuantity(item._id, 1)}
                            className="flex h-5 w-5 items-center justify-center rounded-md bg-slate-100 dark:bg-slate-800"
                          >
                            <AddRoundedIcon sx={{ fontSize: 12 }} />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[10px] font-medium text-slate-400">+ Add</span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Details: name + country + city only */}
              <div className="mt-4 grid grid-cols-1 gap-2.5 border-t border-slate-100 pt-3 dark:border-slate-800 sm:grid-cols-3">
                <div className="sm:col-span-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Name / Firm
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Azzan"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className={fieldCls}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Country
                  </label>
                  <div className="relative">
                    <select
                      value={countryCode}
                      onChange={(e) => handleCountryChange(e.target.value)}
                      className={fieldCls}
                    >
                      {LOCATION_DATA.map((c) => (
                        <option key={c.code} value={c.code}>
                          {c.flag} {c.label}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-[9px] text-slate-400">
                      ▼
                    </span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    City / Site
                  </label>
                  <div className="relative">
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className={fieldCls}
                    >
                      {activeCountry.cities.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-2.5 top-[calc(50%+2px)] -translate-y-1/2 text-[9px] text-slate-400">
                      ▼
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-auto pt-3">
                {selectedList.length > 0 ? (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Est.{" "}
                    <span className="font-bold text-[#0a3d52] dark:text-emerald-300">
                      PKR {approxEstimatedTotal.toLocaleString()}
                    </span>
                    <span className="mx-1.5 text-slate-300">·</span>
                    {locationLabel}
                  </p>
                ) : (
                  <p className="text-[11px] text-amber-600">Select at least one product.</p>
                )}

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  disabled={!formReady}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-4 py-3 text-[13px] font-bold text-white shadow-[0_10px_24px_-8px_rgba(16,185,129,0.45)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
                >
                  <WhatsAppIcon sx={{ fontSize: 18 }} />
                  <span>Send to WhatsApp &amp; Start Negotiation</span>
                  <ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT — realistic phone frame */}
          <div className="flex h-full flex-col items-center justify-center lg:col-span-6">
            <div className="mb-3 text-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Live negotiation preview
              </span>
              <h3 className="font-heading text-base font-extrabold text-[#0a3d52] dark:text-white sm:text-lg">
                Watch the deal close
              </h3>
              <div className="mt-2 flex items-center justify-center gap-1">
                {stages.map((s, i) => (
                  <React.Fragment key={s.id}>
                    {i > 0 ? (
                      <span
                        className={`h-0.5 w-3 rounded-full ${
                          dealStage >= s.id ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-700"
                        }`}
                      />
                    ) : null}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${
                        dealStage === s.id
                          ? "bg-emerald-500 text-white"
                          : dealStage > s.id
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500"
                      }`}
                    >
                      {s.label}
                    </span>
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Device shell */}
            <div
              ref={phoneRef}
              className="relative w-[min(100%,300px)] shrink-0 select-none sm:w-[320px]"
              style={{
                filter: "drop-shadow(0 24px 40px rgba(10, 61, 82, 0.22))",
              }}
            >
              {/* Outer bezel */}
              <div className="relative rounded-[2.65rem] bg-gradient-to-b from-[#2a3140] via-[#1a1f2a] to-[#0d1118] p-[10px] ring-1 ring-black/40">
                {/* Side buttons (decorative) */}
                <span className="absolute -left-[2px] top-[98px] h-8 w-[3px] rounded-l-sm bg-[#3a4254]" />
                <span className="absolute -left-[2px] top-[140px] h-14 w-[3px] rounded-l-sm bg-[#3a4254]" />
                <span className="absolute -left-[2px] top-[200px] h-14 w-[3px] rounded-l-sm bg-[#3a4254]" />
                <span className="absolute -right-[2px] top-[160px] h-20 w-[3px] rounded-r-sm bg-[#3a4254]" />

                {/* Screen */}
                <div className="relative overflow-hidden rounded-[2.15rem] bg-[#efeae2]">
                  {/* Status bar + Dynamic Island */}
                  <div className="relative z-20 bg-[#f6f6f6] px-5 pb-1 pt-2.5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-900">
                      <span className="w-12 tabular-nums">9:41</span>
                      <div className="absolute left-1/2 top-2.5 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-black shadow-inner" />
                      <div className="flex w-16 items-center justify-end gap-0.5 text-slate-900">
                        <SignalCellularAltRoundedIcon sx={{ fontSize: 13 }} />
                        <WifiRoundedIcon sx={{ fontSize: 13 }} />
                        <BatteryFullRoundedIcon sx={{ fontSize: 15 }} />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp header — teal accents (no iOS blue) */}
                  <div className="relative z-10 flex items-center gap-1.5 border-b border-slate-200/80 bg-[#f6f6f6] px-2.5 pb-2.5 pt-1">
                    <div className="flex items-center text-[#0a3d52]">
                      <ArrowBackIosNewRoundedIcon sx={{ fontSize: 14 }} />
                      <span className="ml-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#0a3d52] px-1 text-[9px] font-bold text-white">
                        2
                      </span>
                    </div>
                    <div className="relative ml-0.5">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                        <img
                          src="/marblex-mark.png"
                          alt="MARBLEX"
                          className="h-[90%] w-[90%] object-contain"
                        />
                      </div>
                      <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-[#f6f6f6]" />
                    </div>
                    <div className="min-w-0 flex-1 pl-1">
                      <p className="truncate text-[12px] font-bold leading-tight text-slate-900">
                        MARBLEX Sales Desk
                      </p>
                      <p className="truncate text-[9px] font-medium text-emerald-600">
                        Eng. Hamza · Online
                      </p>
                    </div>
                    <div className="flex items-center gap-2.5 text-[#0a3d52]">
                      <StorefrontOutlinedIcon sx={{ fontSize: 18 }} />
                      <span className="inline-flex items-center">
                        <PhoneOutlinedIcon sx={{ fontSize: 17 }} />
                        <KeyboardArrowDownRoundedIcon sx={{ fontSize: 14, marginLeft: "-2px" }} />
                      </span>
                    </div>
                  </div>

                  {/* Chat body */}
                  <div
                    ref={chatBodyRef}
                    className="relative flex h-[340px] flex-col justify-end gap-2 overflow-y-auto overflow-x-hidden px-2.5 pb-2 pt-3 sm:h-[360px]"
                    style={{
                      backgroundColor: "#e8e0d5",
                      backgroundImage: `
                        radial-gradient(rgba(10,61,82,0.05) 0.8px, transparent 0.8px),
                        radial-gradient(rgba(16,185,129,0.04) 0.8px, transparent 0.8px)
                      `,
                      backgroundSize: "18px 18px, 18px 18px",
                      backgroundPosition: "0 0, 9px 9px",
                    }}
                  >
                    {!inView ? (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <p className="rounded-full bg-white/80 px-3 py-1.5 text-[10px] font-semibold text-slate-500 shadow-sm backdrop-blur-sm">
                          Scroll to preview live chat…
                        </p>
                      </div>
                    ) : null}

                    {script.map((msg) => {
                      const done = revealed.includes(msg.id);
                      const typing = activeMsgId === msg.id;
                      if (!done && !typing) return null;
                      return renderBubble(msg, typing);
                    })}

                    {typingWho ? (
                      <div
                        className={`flex w-full ${
                          typingWho === "client" ? "justify-end" : "justify-start"
                        } animate-[wnBubbleIn_0.4s_ease-out]`}
                      >
                        <div
                          className={`rounded-2xl px-3 py-2.5 shadow-sm ${
                            typingWho === "client"
                              ? "rounded-tr-sm bg-[#d9fdd3]"
                              : "rounded-tl-sm bg-white"
                          }`}
                        >
                          <TypingDots />
                        </div>
                      </div>
                    ) : null}

                    <div ref={chatEndRef} />
                  </div>

                  {/* Input bar */}
                  <div className="flex items-center gap-1.5 bg-[#f0f2f5] px-2 py-2">
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[#54656f]"
                      aria-label="Attach"
                    >
                      <AddRoundedIcon sx={{ fontSize: 22 }} />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="flex flex-1 items-center justify-between rounded-full bg-white px-3 py-2 text-[11px] text-slate-400 shadow-sm"
                    >
                      <span className="truncate">Message {waFormatted}…</span>
                      <SentimentSatisfiedAltRoundedIcon sx={{ fontSize: 18 }} className="text-slate-400" />
                    </button>
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center text-[#54656f]"
                      tabIndex={-1}
                      aria-hidden
                    >
                      <PhotoCameraOutlinedIcon sx={{ fontSize: 20 }} />
                    </button>
                    <button
                      type="button"
                      onClick={handleOpenWhatsApp}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#00a884] text-white shadow-sm"
                      aria-label="Open WhatsApp"
                    >
                      <MicNoneRoundedIcon sx={{ fontSize: 18 }} />
                    </button>
                  </div>

                  {/* Home indicator */}
                  <div className="flex justify-center bg-[#f0f2f5] pb-2 pt-0.5">
                    <span className="h-[4px] w-[108px] rounded-full bg-slate-900/80" />
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 text-[10px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-0.5 font-medium">
                <VerifiedOutlinedIcon sx={{ fontSize: 12 }} className="text-emerald-500" />
                Official MARBLEX Verified
              </span>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <ShieldOutlinedIcon sx={{ fontSize: 11 }} className="text-emerald-500" />
                Avg reply &lt; 5 mins
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
