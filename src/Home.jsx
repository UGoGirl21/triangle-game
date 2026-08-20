import { useCallback, useEffect, useState } from "react";
import App from "./App.jsx";
import DailyChallenge from "./DailyChallenge.jsx";
import OnlineGame from "./online/OnlineGame.jsx";
import Leaderboard from "./Leaderboard.jsx";
import ShareButton from "./components/ShareButton.jsx";
import SiteChrome from "./components/SiteChrome.jsx";
import SiteContent, { HomeContent } from "./SiteContent.jsx";
import { useLocale } from "./i18n/LocaleContext.js";

const SITE_URL = "https://triangle-game-one.vercel.app";
const routeAliases = { local: "/", online: "/online", daily: "/daily-challenge", leaderboard: "/leaderboard" };
const CONTENT_PATHS = ["/how-to-play", "/strategy", "/faq", "/about", "/privacy", "/terms", "/contact"];
const meta = {
  "/": ["삼각 땅따먹기 – 무료 전략 보드게임", "점을 연결해 삼각형을 완성하고 더 많은 영역을 차지하세요. AI 대전, 온라인 대전과 오늘의 챌린지를 무료로 즐길 수 있습니다."],
  "/how-to-play": ["게임 방법 | 삼각 땅따먹기", "삼각 땅따먹기의 선 연결 규칙, 유효하지 않은 선, 점수 계산과 게임 모드를 자세히 알아보세요."],
  "/strategy": ["공략과 전략 | 삼각 땅따먹기", "즉시 득점, 영역 분할, 연속 득점과 후반 계산 등 더 많은 삼각형을 차지하기 위한 전략을 알아보세요."],
  "/daily-challenge": ["오늘의 챌린지 | 삼각 땅따먹기", "모두 같은 점 배치와 AI 난이도로 하루 한 번 플레이하고 점수와 완료 시간을 비교해 보세요."],
  "/faq": ["자주 묻는 질문 | 삼각 땅따먹기", "게임 규칙, 온라인 방, 오늘의 챌린지, 랭킹과 데이터 저장에 관한 답변을 확인하세요."],
  "/about": ["게임 소개 | Triangle Territory", "직접 만든 브라우저 전략 게임 Triangle Territory의 특징, 제작 배경과 운영 원칙을 소개합니다."],
  "/privacy": ["개인정보처리방침 | Triangle Territory", "Triangle Territory에서 처리하는 게임 기록, 브라우저 저장소, 외부 서비스와 이용자 선택을 안내합니다."],
  "/terms": ["이용약관 | Triangle Territory", "Triangle Territory 서비스 이용 조건, 이용자 책임, 랭킹 기록과 지식재산권 안내입니다."],
  "/contact": ["문의 | Triangle Territory", "Triangle Territory 오류 제보, 기록 삭제와 개인정보 관련 문의 방법을 확인하세요."],
  "/online": ["온라인 대전 | 삼각 땅따먹기", "6자리 방 코드를 공유해 친구와 실시간으로 삼각 땅따먹기를 즐기세요."],
  "/leaderboard": ["오늘의 랭킹 | 삼각 땅따먹기", "오늘의 챌린지 참가자 점수와 완료 시간 순위를 확인하세요."],
};
const metaEn = {
  "/": ["Triangle Territory – Free Strategy Board Game", "Connect dots, complete triangles, and claim more territory against AI, friends, or today's shared challenge."],
  "/how-to-play": ["How to Play | Triangle Territory", "Learn line rules, invalid moves, scoring, and every game mode in Triangle Territory."],
  "/strategy": ["Strategy Guide | Triangle Territory", "Learn immediate captures, board control, multi-score moves, AI tactics, and endgame planning."],
  "/daily-challenge": ["Daily Challenge | Triangle Territory", "Play the same dot layout and AI level as everyone else, then compare score and completion time."],
  "/faq": ["Frequently Asked Questions | Triangle Territory", "Find answers about game rules, online rooms, the daily challenge, rankings, and stored data."],
  "/about": ["About | Triangle Territory", "Learn about the original browser strategy game, its features, background, and operating principles."],
  "/privacy": ["Privacy Policy | Triangle Territory", "Learn how Triangle Territory handles game records, browser storage, service providers, and advertising data."],
  "/terms": ["Terms of Use | Triangle Territory", "Read the conditions for using Triangle Territory, including player responsibilities, rankings, and intellectual property."],
  "/contact": ["Contact | Triangle Territory", "Contact Triangle Territory about bugs, record deletion, content, or privacy."],
  "/online": ["Online Match | Triangle Territory", "Share a six-character room code and play Triangle Territory live with a friend."],
  "/leaderboard": ["Today's Leaderboard | Triangle Territory", "View today's challenge scores and completion-time rankings."],
};

function cleanPath(pathname) {
  if (!pathname || pathname === "/index.html") return "/";
  return pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
}

export default function Home() {
  const { locale } = useLocale();
  const [path, setPath] = useState(() => cleanPath(window.location.pathname));

  const navigate = useCallback((destination, { replace = false } = {}) => {
    const nextPath = routeAliases[destination] || destination;
    if (cleanPath(window.location.pathname) !== nextPath) window.history[replace ? "replaceState" : "pushState"]({}, "", nextPath);
    setPath(nextPath);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(cleanPath(window.location.pathname));
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  useEffect(() => {
    const localeMeta = locale === "en" ? metaEn : meta;
    const [title, description] = localeMeta[path] || localeMeta["/"];
    document.title = title;
    document.documentElement.lang = locale;
    const setMeta = (selector, attribute, value) => document.head.querySelector(selector)?.setAttribute(attribute, value);
    setMeta('meta[name="description"]', "content", description);
    setMeta('meta[property="og:title"]', "content", title);
    setMeta('meta[property="og:description"]', "content", description);
    setMeta('meta[property="og:url"]', "content", `${SITE_URL}${path}`);
    setMeta('link[rel="canonical"]', "href", `${SITE_URL}${path}`);
    const indexable = path === "/" || path === "/daily-challenge" || CONTENT_PATHS.includes(path);
    setMeta('meta[name="robots"]', "content", indexable ? "index, follow" : "noindex, follow");
  }, [locale, path]);

  let page;
  if (path === "/online") page = <OnlineGame onExit={() => navigate("/")} />;
  else if (path === "/leaderboard") page = <Leaderboard onExit={() => navigate("/")} />;
  else if (path === "/daily-challenge") page = <DailyChallenge onNavigate={navigate} onExit={() => navigate("/")} />;
  else if (CONTENT_PATHS.includes(path)) page = <SiteContent path={path} />;
  else if (path === "/") page = <><App onNavigate={navigate} /><HomeContent /></>;
  else page = <main className="content-page not-found-page"><h1>{locale === "ko" ? "페이지를 찾을 수 없습니다" : "Page not found"}</h1>
    <p>{locale === "ko" ? "주소를 확인하거나 게임 홈으로 이동해 주세요." : "Check the address or return to the game."}</p>
    <a className="button-link" href="/" onClick={(event) => { event.preventDefault(); navigate("/"); }}>{locale === "ko" ? "게임 홈" : "Game home"}</a>
  </main>;

  return <SiteChrome path={path} onNavigate={navigate}>{page}<ShareButton /></SiteChrome>;
}
