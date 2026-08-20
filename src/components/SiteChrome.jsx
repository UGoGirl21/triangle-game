import LanguageToggle from "./LanguageToggle.jsx";
import { useLocale } from "../i18n/LocaleContext.js";

const labels = {
  ko: {
    skip: "본문으로 바로가기", brand: "삼각 땅따먹기", play: "게임하기", rules: "게임 방법",
    strategy: "공략", daily: "오늘의 챌린지", faq: "자주 묻는 질문", about: "게임 소개",
    privacy: "개인정보처리방침", terms: "이용약관", contact: "문의",
    footer: "점을 연결하고, 삼각형을 완성하고, 더 많은 땅을 차지하세요.",
  },
  en: {
    skip: "Skip to content", brand: "Triangle Territory", play: "Play", rules: "How to play",
    strategy: "Strategy", daily: "Daily challenge", faq: "FAQ", about: "About",
    privacy: "Privacy", terms: "Terms", contact: "Contact",
    footer: "Connect dots, complete triangles, and claim more territory.",
  },
};

export default function SiteChrome({ path, onNavigate, children }) {
  const { locale } = useLocale();
  const l = labels[locale] || labels.ko;
  const link = (href, label) => <a href={href} aria-current={path === href ? "page" : undefined}
    onClick={(event) => { event.preventDefault(); onNavigate(href); }}>{label}</a>;

  return <div className="site-shell">
    <a className="skip-link" href="#main-content">{l.skip}</a>
    <header className="site-header">
      <a className="site-brand" href="/" onClick={(event) => { event.preventDefault(); onNavigate("/"); }}>{l.brand}</a>
      <nav className="site-nav" aria-label={locale === "ko" ? "주요 메뉴" : "Main navigation"}>
        {link("/", l.play)}
        {link("/how-to-play", l.rules)}
        {link("/strategy", l.strategy)}
        {link("/daily-challenge", l.daily)}
        {link("/faq", l.faq)}
      </nav>
      <LanguageToggle />
    </header>
    <div id="main-content">{children}</div>
    <footer className="site-footer">
      <p><strong>{l.brand}</strong> · {l.footer}</p>
      <nav aria-label={locale === "ko" ? "사이트 정보" : "Site information"}>
        {link("/about", l.about)}
        {link("/privacy", l.privacy)}
        {link("/terms", l.terms)}
        {link("/contact", l.contact)}
      </nav>
      <p className="copyright">© {new Date().getFullYear()} Triangle Territory</p>
    </footer>
  </div>;
}
