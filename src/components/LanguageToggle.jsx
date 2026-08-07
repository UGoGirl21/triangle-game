import { useLocale } from "../i18n/LocaleContext.js";

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();
  const next = locale === "ko" ? "en" : "ko";
  const label = locale === "ko" ? "EN" : "한글";

  return (
    <button type="button" className="lang-toggle" onClick={() => setLocale(next)} aria-label={t("switchLanguage")}>
      {label}
    </button>
  );
}
