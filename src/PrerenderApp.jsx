import ShareButton from "./components/ShareButton.jsx";
import SiteChrome from "./components/SiteChrome.jsx";
import { LocaleContext } from "./i18n/LocaleContext.js";
import { translations } from "./i18n/translations.js";
import SiteContent, { HomeContent } from "./SiteContent.jsx";
import App from "./App.jsx";
import DailyChallengeIntro from "./components/DailyChallengeIntro.jsx";

function translate(key, vars) {
  const template = translations.ko[key] ?? translations.en[key] ?? key;
  return vars ? template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : template;
}

const localeValue = { locale: "ko", setLocale: () => {}, t: translate };
const navigate = () => {};

export default function PrerenderApp({ path }) {
  const page = path === "/" ? <><App onNavigate={navigate} /><HomeContent /></> : path === "/daily-challenge"
    ? <DailyChallengeIntro />
    : <SiteContent path={path} />;

  return <LocaleContext.Provider value={localeValue}>
    <SiteChrome path={path} onNavigate={navigate}>{page}<ShareButton /></SiteChrome>
  </LocaleContext.Provider>;
}
