import { useState } from "react";
import { useLocale } from "../i18n/LocaleContext.js";

export default function ShareButton() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState("");

  function flashToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1800);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      flashToast(t("linkCopied"));
    } catch {
      flashToast(t("linkCopyFailed"));
    }
    setOpen(false);
  }

  async function shareViaMessage() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${t("appTitlePart1")}${t("appTitlePart2")}`,
          text: t("appIntro"),
          url: window.location.href,
        });
      } catch {
        // user cancelled the share sheet
      }
      setOpen(false);
      return;
    }
    await copyLink();
  }

  return <>
    {open && <div className="share-backdrop" onClick={() => setOpen(false)} />}
    {open && (
      <div className="share-menu">
        <button type="button" onClick={shareViaMessage}>{t("shareViaMessage")}</button>
        <button type="button" onClick={copyLink}>{t("copyLink")}</button>
      </div>
    )}
    <button
      type="button"
      className="share-fab"
      aria-label={t("shareButton")}
      aria-expanded={open}
      onClick={() => setOpen((v) => !v)}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <circle cx="18" cy="5" r="3" fill="currentColor" />
        <circle cx="6" cy="12" r="3" fill="currentColor" />
        <circle cx="18" cy="19" r="3" fill="currentColor" />
        <path d="M8.6 10.6 15.4 6.4M8.6 13.4 15.4 17.6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
    <div className={`share-toast${toast ? " show" : ""}`} role="status" aria-live="polite">{toast}</div>
  </>;
}
