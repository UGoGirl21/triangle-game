import ShareButton from "./components/ShareButton.jsx";
import SiteChrome from "./components/SiteChrome.jsx";
import { LocaleContext } from "./i18n/LocaleContext.js";
import { translations } from "./i18n/translations.js";
import SiteContent from "./SiteContent.jsx";

function translate(key, vars) {
  const template = translations.ko[key] ?? translations.en[key] ?? key;
  return vars ? template.replace(/\{(\w+)\}/g, (_, name) => vars[name] ?? "") : template;
}

const localeValue = { locale: "ko", setLocale: () => {}, t: translate };
const navigate = () => {};

function DailyChallengePreview() {
  return <main className="content-page">
    <header className="content-hero">
      <p className="eyebrow">매일 새로운 공통 게임판</p>
      <h1>삼각 땅따먹기 오늘의 챌린지</h1>
      <p className="content-intro">모든 참가자가 같은 점 배치와 AI 난이도로 하루 한 번 플레이하고, 획득한 영역 수와 완료 시간을 비교합니다.</p>
    </header>
    <div className="content-grid">
      <section className="content-card">
        <h2>오늘의 게임에 도전하세요</h2>
        <p>닉네임을 입력하고 오늘 정해진 게임판에서 AI를 상대하세요. 게임을 완료하면 점수와 플레이 시간이 오늘의 랭킹에 기록됩니다.</p>
      </section>
      <section className="content-card">
        <h2>모두에게 같은 조건</h2>
        <p>날짜별로 동일한 점 배치와 난이도가 제공되므로 다른 참가자의 결과와 공정하게 비교할 수 있습니다.</p>
      </section>
    </div>
  </main>;
}

export default function PrerenderApp({ path }) {
  const page = path === "/daily-challenge"
    ? <DailyChallengePreview />
    : <SiteContent path={path} />;

  return <LocaleContext.Provider value={localeValue}>
    <SiteChrome path={path} onNavigate={navigate}>{page}<ShareButton /></SiteChrome>
  </LocaleContext.Provider>;
}
