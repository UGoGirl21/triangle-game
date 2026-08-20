import { useEffect, useMemo, useState } from "react";
import { LocaleContext } from "./LocaleContext.js";
import { translations } from "./translations.js";

const STORAGE_KEY = "locale";

function detectInitialLocale() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ko" || saved === "en") return saved;
  } catch {
    /* localStorage unavailable; fall through to auto-detection */
  }
  if ((navigator.language || "").toLowerCase().startsWith("ko")) return "ko";
  try {
    if (Intl.DateTimeFormat().resolvedOptions().timeZone === "Asia/Seoul") return "ko";
  } catch {
    /* Intl unavailable; default to en below */
  }
  return "en";
}

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitialLocale);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next) {
    setLocaleState(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* best-effort only; the choice just won't persist across reloads */
    }
  }

  const t = useMemo(() => {
    const dict = translations[locale] || translations.en;
    return (key, vars) => {
      const template = dict[key] ?? translations.en[key] ?? key;
      return vars ? template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : template;
    };
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, t]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
