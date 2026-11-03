import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import ur from "./ur.json";

export const getSavedLanguage = () => {
  try {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("marblex_lang");
      if (saved === "ur" || saved === "en") return saved;
      const navLang = navigator.language || navigator.userLanguage || "";
      if (navLang.toLowerCase().startsWith("ur")) return "ur";
    }
  } catch {
    /* ignore */
  }
  return "en";
};

const initialLang = getSavedLanguage();

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  lng: initialLang,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export const setAppLanguage = (lang) => {
  const target = lang === "ur" ? "ur" : "en";
  try {
    localStorage.setItem("marblex_lang", target);
  } catch {
    /* ignore */
  }
  i18n.changeLanguage(target);
  if (typeof document !== "undefined") {
    document.documentElement.lang = target;
    document.documentElement.dir = target === "ur" ? "rtl" : "ltr";
    if (target === "ur") {
      document.body.classList.add("urdu-mode");
    } else {
      document.body.classList.remove("urdu-mode");
    }
    // Broadcast language change to portal iframe
    window.dispatchEvent(new CustomEvent("marblex:lang_change", { detail: { lang: target, dir: target === "ur" ? "rtl" : "ltr" } }));
  }
};

if (typeof document !== "undefined") {
  document.documentElement.lang = initialLang;
  document.documentElement.dir = initialLang === "ur" ? "rtl" : "ltr";
  if (initialLang === "ur") {
    document.body.classList.add("urdu-mode");
  }
}

export default i18n;

