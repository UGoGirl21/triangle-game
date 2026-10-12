import { useLocale } from '../i18n/LocaleContext.js';

export default function DailyChallengeIntro({ children }) {
  const { locale } = useLocale();
  const ko = locale === 'ko';
  return <main className="content-page">
    <header className="content-hero">
      <p className="eyebrow">{ko ? '매일 새로운 공통 게임판' : 'A shared board every day'}</p>
      <h1>{ko ? '삼각 땅따먹기 오늘의 챌린지' : 'Triangle Territory Daily Challenge'}</h1>
      <p className="content-intro">{ko ? '같은 날에는 같은 점 배치와 AI 난이도로 도전합니다. 먼저 자유 대전에서 연습하고, 오늘의 판에서 얼마나 많은 삼각형을 차지할 수 있는지 확인해 보세요.' : 'Face the same dot layout and AI level as other players today. Practice in a free game first, then see how many triangles you can claim on today’s board.'}</p>
    </header>
    {children}
    <div className="content-grid">
      <section className="content-card">
        <h2>{ko ? '참여와 기록' : 'Playing and recording your result'}</h2>
        <p>{ko ? '실명 대신 공개해도 괜찮은 닉네임을 입력하세요. 게임을 시작하면 시간이 측정되고, 끝나면 닉네임·내 점수·AI 점수·완료 시간이 오늘의 랭킹에 저장됩니다.' : 'Use a nickname you are comfortable sharing publicly. Timing begins when you start. After the game, your nickname, score, AI score, and completion time are saved to today’s leaderboard.'}</p>
        <p>{ko ? '기록 저장에 실패해도 같은 결과를 다시 제출할 수 있습니다. 시작 전에는 시간 제한 없이 규칙과 공략을 읽어볼 수 있어요.' : 'If saving fails, you can submit the same result again. Before starting, take your time to read the rules and strategy guide.'}</p>
      </section>
      <section className="content-card">
        <h2>{ko ? '하루의 기준과 연습 방법' : 'The daily reset and practice'}</h2>
        <p>{ko ? '챌린지는 한국 시간 자정에 바뀝니다. 휴대폰과 데스크톱 모두 동일한 논리적 게임판을 사용하며, 화면에 맞춰 크기만 조절합니다.' : 'The challenge resets at midnight in Korea. Phones and desktops use the same logical board, scaled to fit the screen.'}</p>
        <p>{ko ? '참여 결과는 이 브라우저에 저장됩니다. 브라우저를 바꾸거나 저장 데이터를 지우면 참여 상태가 달라질 수 있으므로, 계정으로 검증된 1인 1회 기록은 아닙니다. 추가 연습은 자유 대전을 이용하세요.' : 'Your participation is remembered in this browser. Changing browsers or clearing storage can reset it, so this is not an account-verified one-entry-per-person competition. Use free play for extra practice.'}</p>
      </section>
    </div>
    <nav className="guide-links" aria-label={ko ? '시작 전 연습' : 'Practice before starting'}>
      <a href="/how-to-play">{ko ? '그림으로 규칙 배우기' : 'Illustrated rules'}</a>
      <a href="/strategy">{ko ? '세 수 앞까지 계산하는 퍼즐' : 'Three-move strategy puzzles'}</a>
      <a href="/">{ko ? '자유 대전에서 연습' : 'Practice in free play'}</a>
    </nav>
  </main>;
}
