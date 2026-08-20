import { useLocale } from "./i18n/LocaleContext.js";

const content = {
  ko: {
    "/how-to-play": {
      eyebrow: "처음 플레이하는 분을 위한 안내", title: "삼각 땅따먹기 게임 방법",
      intro: "두 플레이어가 번갈아 점과 점을 직선으로 연결하고, 삼각형을 완성해 영역을 차지하는 전략 게임입니다. 아래 규칙을 익히면 바로 시작할 수 있습니다.",
      sections: [
        ["게임 목표", ["게임판의 점들을 연결해 삼각형을 만드세요. 새 선으로 완성된 삼각형은 선을 그은 플레이어의 영역이 되고 1점을 얻습니다.", "더 이상 그을 수 있는 유효한 선이 없을 때 게임이 끝나며, 더 많은 삼각형을 차지한 플레이어가 승리합니다."]],
        ["한 턴 진행 방법", ["연결할 첫 번째 점을 선택한 다음 두 번째 점을 선택하면 선이 그어집니다.", "이미 연결된 두 점에는 선을 다시 그을 수 없습니다. 선택을 바꾸고 싶다면 선택한 점을 다시 누르거나 게임판의 빈 곳을 누르세요."]],
        ["그을 수 없는 선", ["새 선은 기존 선과 교차할 수 없습니다.", "다른 점을 관통하거나 너무 가깝게 지나가는 선도 허용되지 않습니다.", "이 조건 덕분에 게임판은 겹치지 않는 작은 영역들로 나뉩니다."]],
        ["점수 계산", ["한 번의 선으로 여러 삼각형이 동시에 완성되면 완성한 삼각형 수만큼 모두 점수를 얻습니다.", "이미 다른 삼각형 안에 포함된 큰 삼각형을 중복 영역으로 세지 않고, 게임 로직이 새로 닫힌 유효 영역을 판정합니다."]],
        ["게임 모드", ["AI 대전에서는 쉬움·보통·어려움 난이도를 선택할 수 있습니다. 온라인 대전은 한 사람이 방을 만들고 6자리 코드를 상대에게 공유합니다.", "오늘의 챌린지는 모든 참가자가 같은 점 배치와 난이도로 AI를 상대하며, 점수와 완료 시간으로 순위를 비교합니다."]],
      ],
    },
    "/strategy": {
      eyebrow: "더 많은 영역을 차지하는 법", title: "삼각 땅따먹기 전략 가이드",
      intro: "좋은 수는 당장 한 점을 얻는 데서 끝나지 않습니다. 다음 차례에 상대가 만들 수 있는 삼각형까지 살피는 것이 핵심입니다.",
      sections: [
        ["초보 전략: 열린 두 변을 찾기", ["두 변이 이미 연결된 세 점을 찾으면 나머지 한 변으로 바로 삼각형을 완성할 수 있습니다. 내 차례가 오면 먼저 즉시 득점할 수 있는 선이 있는지 전체 판을 확인하세요.", "반대로 내가 그을 선이 상대에게 쉬운 마지막 변을 내주는지도 확인해야 합니다."]],
        ["중급 전략: 판을 작은 영역으로 나누기", ["게임판 중앙을 가로지르는 긴 선은 앞으로 가능한 연결을 크게 제한합니다. 중앙을 너무 일찍 막으면 내 선택지도 함께 줄어들 수 있습니다.", "짧은 선으로 여러 후보 영역을 만들고, 상대가 어느 쪽을 막더라도 다른 쪽에서 득점할 수 있게 준비해 보세요."]],
        ["연속 득점 기회 만들기", ["한 선이 두 개 이상의 열린 삼각형에서 공통 마지막 변이 되도록 만들면 한 턴에 여러 점을 얻을 수 있습니다.", "현재 점수뿐 아니라 각 후보 선이 새로 닫는 영역 수를 비교하면 더 좋은 수를 고를 수 있습니다."]],
        ["AI 난이도 활용법", ["쉬움은 가능한 수 중 단순한 선택을 자주 하므로 기본 규칙을 연습하기 좋습니다. 보통은 즉시 얻을 수 있는 삼각형을 우선합니다.", "어려움은 득점 수를 찾고 상대에게 바로 점수를 내줄 위험도 일부 계산합니다. 어려움 AI를 상대로는 한 수 뒤의 강제 득점까지 생각해 보세요."]],
        ["마지막 수 계산", ["후반에는 가능한 선이 줄어들기 때문에 모든 후보를 눈으로 비교하기 쉬워집니다. 남은 선을 그었을 때 상대에게 득점선이 생기는지 차례대로 가정해 보세요.", "앞서고 있다면 안전하게 선택지를 줄이고, 뒤지고 있다면 여러 영역을 동시에 완성할 수 있는 형태를 노리는 편이 유리합니다."]],
      ],
    },
    "/faq": {
      eyebrow: "플레이와 데이터에 관한 답변", title: "자주 묻는 질문",
      intro: "게임 규칙, 온라인 대전, 오늘의 챌린지와 저장되는 정보에 관한 자주 묻는 질문입니다.",
      sections: [
        ["게임은 무료인가요?", ["네. 브라우저에서 별도 설치 없이 무료로 플레이할 수 있습니다."]],
        ["선을 그을 수 없다는 메시지가 나와요.", ["이미 존재하는 선이거나, 기존 선과 교차하거나, 중간의 다른 점을 통과하는 경우에는 선을 그을 수 없습니다. 다른 점 조합을 선택해 주세요."]],
        ["온라인 대전은 어떻게 시작하나요?", ["온라인 대전에서 방 만들기를 선택하고 이름·기호·점 개수를 설정하세요. 생성된 6자리 코드를 친구에게 보내면 상대가 코드로 참가할 수 있습니다."]],
        ["오늘의 챌린지는 왜 하루 한 번인가요?", ["모든 참가자가 같은 조건에서 기록을 비교할 수 있도록 브라우저에 당일 참여 결과를 저장합니다. 브라우저 데이터가 삭제되면 참여 상태가 달라질 수 있습니다."]],
        ["랭킹에는 어떤 정보가 표시되나요?", ["입력한 닉네임, 플레이어 점수, AI 점수와 완료 시간이 표시됩니다. 실명이나 연락처처럼 개인을 식별할 수 있는 정보는 닉네임으로 입력하지 마세요."]],
        ["앱을 설치해야 하나요?", ["아니요. 최신 모바일 또는 데스크톱 브라우저에서 JavaScript를 켜고 접속하면 됩니다."]],
        ["문제를 발견했어요.", ["문의 페이지의 이메일로 사용 중인 브라우저, 기기 종류, 문제가 발생한 과정을 알려주시면 확인에 도움이 됩니다. 방 코드나 개인 정보는 보내지 마세요."]],
      ],
    },
    "/about": {
      eyebrow: "직접 만든 브라우저 전략 게임", title: "Triangle Territory 소개",
      intro: "Triangle Territory는 종이 위에서 점을 잇던 놀이를 브라우저에서 간편하게 즐길 수 있도록 만든 독립 웹게임입니다.",
      sections: [
        ["게임의 특징", ["무작위 점 배치, 교차선 판정, 삼각형 영역 판정과 세 단계 AI를 자체 게임 로직으로 구현했습니다.", "혼자 연습하는 AI 대전뿐 아니라 친구와의 실시간 대전, 모두 같은 조건으로 경쟁하는 일일 챌린지를 제공합니다."]],
        ["만든 이유", ["규칙은 몇 문장으로 익힐 수 있지만 매번 다른 판이 만들어지는 게임을 목표로 했습니다. 짧은 시간에도 한 판을 끝낼 수 있고, 한 수 앞을 읽는 재미를 느낄 수 있도록 설계했습니다."]],
        ["운영 원칙", ["사용자가 게임을 이해하는 데 도움이 되는 정확한 안내를 제공하고, 불필요한 개인정보를 요구하지 않으며, 오류와 이용 문의에 지속적으로 대응하는 것을 원칙으로 합니다."]],
        ["업데이트", ["게임 규칙과 사용 경험을 계속 개선하고 있습니다. 변경 사항이 점수 계산이나 데이터 처리에 영향을 주는 경우 관련 안내와 정책 문서를 함께 갱신합니다."]],
      ],
    },
    "/privacy": {
      eyebrow: "시행일 2026년 8월 19일", title: "개인정보처리방침",
      intro: "Triangle Territory는 게임 제공에 필요한 최소한의 정보만 처리합니다. 아래에서 처리 항목과 목적을 확인할 수 있습니다.",
      sections: [
        ["1. 처리하는 정보", ["오늘의 챌린지 참여 시 사용자가 입력한 닉네임, 점수, AI 점수, 완료 시간, 난이도와 참여 날짜가 저장됩니다. 온라인 대전 중에는 방 코드와 사용자가 입력한 이름·기호, 게임 상태가 대전 제공을 위해 처리될 수 있습니다.", "서비스 운영 과정에서 호스팅·보안 제공자가 IP 주소, 브라우저 종류, 접속 시간 같은 통상적인 로그를 처리할 수 있습니다."]],
        ["2. 이용 목적", ["정보는 온라인 대전 연결, 오늘의 챌린지 순위 제공, 오류 방지와 서비스 보안을 위해 사용합니다. 입력한 닉네임은 공개 랭킹에 표시될 수 있으므로 실명·이메일·전화번호를 입력하지 마세요."]],
        ["3. 브라우저 저장소", ["오늘의 챌린지 중복 참여를 줄이고 결과를 기억하기 위해 localStorage에 당일 결과를 저장합니다. 브라우저 설정에서 언제든 삭제할 수 있으며 삭제하면 참여 상태가 초기화될 수 있습니다."]],
        ["4. 제3자 서비스", ["데이터베이스와 실시간 기능에 Supabase를, 웹 호스팅에 Vercel을 사용합니다. Google AdSense가 활성화되면 Google과 광고 파트너가 광고 제공·측정·부정 사용 방지를 위해 쿠키 또는 유사 기술을 사용할 수 있습니다.", "Google의 광고 데이터 이용 방식은 Google의 ‘광고를 위해 데이터를 사용하는 방식’ 안내에서 확인할 수 있습니다."]],
        ["5. 보관과 삭제", ["챌린지 기록은 순위 제공과 서비스 운영에 필요한 기간 보관한 뒤 운영 목적이 끝나면 삭제할 수 있습니다. 법령상 보관 의무가 있는 경우에는 해당 기간 동안 보관합니다. 본인의 닉네임 기록 삭제를 요청하려면 문의 페이지의 연락처로 날짜와 닉네임을 보내주세요."]],
        ["6. 이용자의 선택", ["브라우저 설정에서 쿠키와 localStorage를 관리할 수 있습니다. 지역에 따라 광고 동의 화면에서 맞춤 광고 선택을 변경할 수 있습니다."]],
        ["7. 아동의 개인정보", ["서비스는 아동의 실명이나 연락처 수집을 의도하지 않습니다. 공개 닉네임에는 개인 식별 정보를 사용하지 마세요."]],
        ["8. 변경 및 문의", ["처리 내용이 바뀌면 이 페이지의 시행일과 내용을 수정합니다. 개인정보 관련 요청은 문의 페이지에 안내된 프로젝트 문의 채널로 접수할 수 있습니다."]],
      ],
    },
    "/terms": {
      eyebrow: "시행일 2026년 8월 19일", title: "이용약관",
      intro: "Triangle Territory를 이용하면 아래 조건에 동의한 것으로 봅니다. 서비스는 건전한 게임 이용을 목적으로 제공됩니다.",
      sections: [
        ["1. 서비스 이용", ["게임은 현재 상태 그대로 제공되며 개인적인 오락 목적으로 이용할 수 있습니다. 서비스의 일부 기능은 네트워크나 외부 제공자의 상태에 따라 일시적으로 이용하지 못할 수 있습니다."]],
        ["2. 이용자 책임", ["공개 랭킹이나 온라인 대전 이름에 타인의 개인정보, 모욕적 표현, 불법 콘텐츠, 광고성 문구를 입력해서는 안 됩니다. 서비스 또는 다른 이용자의 정상적인 이용을 방해하는 자동화·조작·공격 행위를 금지합니다."]],
        ["3. 랭킹과 기록", ["오류, 부정 이용 또는 시스템 정비가 필요한 경우 기록을 수정하거나 삭제할 수 있습니다. 네트워크 지연과 브라우저 환경에 따라 완료 시간이 실제 체감 시간과 다를 수 있습니다."]],
        ["4. 지식재산권", ["게임의 소스 코드, 디자인, 문구와 브랜드에 관한 권리는 제작자 또는 정당한 권리자에게 있습니다. 관련 법률이 허용하거나 별도 허가한 범위를 넘어 복제·재배포해서는 안 됩니다."]],
        ["5. 책임의 제한", ["서비스의 안전한 운영을 위해 노력하지만 중단, 데이터 손실 또는 특정 목적에 대한 완전한 적합성을 보장하지 않습니다. 관련 법률에서 허용하지 않는 책임까지 제한하는 것은 아닙니다."]],
        ["6. 약관 변경", ["기능 또는 법적 요구가 바뀌면 약관을 수정할 수 있으며, 중요한 변경은 이 페이지에 시행일과 함께 반영합니다."]],
      ],
    },
    "/contact": {
      eyebrow: "게임·기록·개인정보 문의", title: "문의하기",
      intro: "오류 제보, 콘텐츠 또는 개인정보 관련 요청을 이메일로 받고 있습니다.",
      sections: [
        ["이메일 문의", ["문의사항이 있으면 cozy.web.official@gmail.com으로 이메일을 보내주세요.", "오류 확인에 필요하지 않은 실명, 방 코드와 같은 개인정보는 보내지 마세요."]],
        ["오류를 제보할 때", ["사용 중인 브라우저와 기기, 문제가 발생한 화면, 재현 순서를 함께 적어주세요. 비밀번호, 실명, 방 코드 같은 민감한 정보는 보내지 마세요."]],
        ["랭킹 기록 삭제 요청", ["참여 날짜와 사용한 닉네임을 알려주시면 확인 후 처리 방법을 안내합니다. 동일 닉네임이 여러 명에게 사용될 수 있어 추가 확인이 필요할 수 있습니다."]],
        ["답변 시간", ["문의는 순서대로 확인합니다. 운영 여건에 따라 답변까지 며칠이 걸릴 수 있습니다."]],
      ],
    },
  },
};

content.en = {
  "/how-to-play": { eyebrow: "A guide for first-time players", title: "How to play Triangle Territory", intro: "Players take turns connecting dots with straight lines. Complete triangles, claim territory, and finish with the highest score.", sections: [["Goal", ["Complete a triangle by drawing its final side. Each newly completed valid triangle becomes your territory and scores one point.", "The game ends when no valid line remains. The player with more territory wins."]], ["Taking a turn", ["Select one dot, then another to draw a line. You cannot draw a duplicate line.", "Tap the selected dot again or an empty area to cancel your selection."]], ["Invalid lines", ["A new line cannot cross an existing line or pass through another dot.", "These rules divide the board into distinct, non-overlapping regions."]], ["Scoring", ["If one line completes several triangles, you score every newly completed triangle.", "The game logic detects newly enclosed valid regions rather than counting the same territory twice."]], ["Modes", ["Practice against three AI levels, create a six-character room for a friend, or play the same daily layout as everyone else."]]] },
  "/strategy": { eyebrow: "How to claim more territory", title: "Triangle Territory strategy guide", intro: "A strong move considers both the point you can score now and the triangle your opponent may complete next.", sections: [["Start with open triangles", ["Look for three dots with two existing sides. The missing side may score immediately.", "Before drawing, check whether your move gives the opponent an easy final side."]], ["Divide the board carefully", ["Long central lines remove many future connections. Blocking the center too early can also reduce your own choices.", "Use short lines to create more than one scoring threat."]], ["Create multi-score moves", ["Try to make one future line the shared final side of multiple open triangles.", "Compare how many new regions each candidate line would close."]], ["Use AI levels to learn", ["Easy is suited to learning the controls. Normal prioritizes immediate captures, while Hard also avoids some moves that offer an immediate reply."]], ["Plan the endgame", ["When few lines remain, test each candidate in your head. If ahead, reduce safe options; if behind, seek shapes that can close multiple regions."]]] },
  "/faq": { eyebrow: "Answers about play and data", title: "Frequently asked questions", intro: "Common questions about the rules, online rooms, the daily challenge, and stored information.", sections: [["Is the game free?", ["Yes. You can play in a modern browser without installing anything."]], ["Why is a line rejected?", ["It may already exist, cross another line, or pass through a third dot. Choose another pair of dots."]], ["How do online matches work?", ["Create a room and share its six-character code. Your friend can use that code to join."]], ["Why is the daily challenge limited?", ["The result is stored in your browser to help keep the daily comparison fair. Clearing browser data may reset that state."]], ["What appears on the leaderboard?", ["Your chosen nickname, scores, and completion time. Do not use a real name or contact details as a nickname."]], ["How do I report a problem?", ["Email the address on the Contact page with your browser, device type, and reproduction steps. Do not send private information or room codes."]]] },
  "/about": { eyebrow: "An original browser strategy game", title: "About Triangle Territory", intro: "Triangle Territory turns the familiar pen-and-paper idea of connecting dots into a quick, replayable browser game.", sections: [["What makes it different", ["The game includes original dot generation, line-intersection and territory detection, and three AI levels.", "It supports solo practice, live rooms with friends, and a shared daily challenge."]], ["Why it was made", ["The goal was a game that takes only a moment to learn but creates a different tactical board every time."]], ["Operating principles", ["We aim to explain the game accurately, request as little personal information as possible, and respond to errors and privacy requests."]]] },
  "/privacy": { eyebrow: "Effective August 19, 2026", title: "Privacy policy", intro: "Triangle Territory processes only the information needed to operate the game.", sections: [["Information processed", ["Daily challenge records include the nickname you enter, player and AI scores, completion time, difficulty, and date. Online play may process room codes, names, symbols, and game state.", "Hosting and security providers may process standard logs such as IP address, browser type, and access time."]], ["Purposes", ["Information supports online rooms, daily rankings, reliability, and security. Never enter a real name, email address, or phone number as a public nickname."]], ["Browser storage", ["localStorage remembers your daily result. You can clear it in browser settings, which may reset participation status."]], ["Service providers and advertising", ["We use Supabase for database and realtime features and Vercel for hosting. When Google AdSense is active, Google and its partners may use cookies or similar technology to serve and measure ads and prevent abuse."]], ["Retention and requests", ["Records are retained as needed for rankings and operation, then may be deleted. To request removal, contact us with the date and nickname."]], ["Changes", ["We will update this page and its effective date when our data practices materially change."]]] },
  "/terms": { eyebrow: "Effective August 19, 2026", title: "Terms of use", intro: "By using Triangle Territory, you agree to these conditions for fair and responsible use.", sections: [["Using the service", ["The game is provided as available for personal entertainment. Network or provider conditions may temporarily interrupt features."]], ["Your responsibilities", ["Do not submit personal data, abusive language, illegal content, or promotions as a public name. Automation, manipulation, or attacks that disrupt the service are prohibited."]], ["Rankings", ["We may remove records affected by errors, abuse, or maintenance. Completion times can vary with network and browser conditions."]], ["Intellectual property", ["The game's code, design, text, and brand belong to their respective rights holders and may not be redistributed beyond applicable law or permission."]], ["Changes", ["We may revise these terms when features or legal requirements change and will update the effective date."]]] },
  "/contact": { eyebrow: "Game, record, and privacy enquiries", title: "Contact", intro: "We accept bug reports and content or privacy requests by email.", sections: [["Email", ["Send enquiries to cozy.web.official@gmail.com.", "Do not include a real name, room code, or other personal information unless it is necessary for your request."]], ["Bug reports", ["Include your browser, device, screen, and reproduction steps. Never send passwords, real names, or room codes."]], ["Record deletion", ["Tell us the challenge date and nickname. Because nicknames are not unique, we may need further details."]]] },
};

export function HomeContent() {
  const { locale } = useLocale();
  const ko = locale === "ko";
  const cards = ko ? [
    ["누구나 바로 시작하는 전략 게임", "점 두 개를 골라 선을 긋고 삼각형을 완성하면 내 영역이 됩니다. 규칙은 간단하지만 점 배치가 매번 달라 같은 판이 반복되지 않습니다."],
    ["세 가지 AI 난이도", "쉬움에서 조작과 규칙을 익히고, 보통과 어려움에서 즉시 득점과 상대의 다음 수까지 고려하는 플레이에 도전할 수 있습니다."],
    ["친구와 온라인 대전", "방을 만든 뒤 6자리 코드를 공유하면 별도 계정 없이 친구가 참가할 수 있습니다. 두 플레이어의 게임판과 차례가 실시간으로 동기화됩니다."],
    ["모두 같은 오늘의 챌린지", "매일 정해진 점 배치와 AI 난이도로 한 판을 플레이합니다. 획득한 영역 수와 완료 시간을 다른 참가자의 기록과 비교할 수 있습니다."],
  ] : [
    ["Easy to learn, different every time", "Choose two dots to draw a line. Complete a triangle to claim it. Random layouts keep the simple rules tactically fresh."],
    ["Three AI levels", "Learn the rules on Easy, then challenge Normal and Hard opponents that consider captures and risky replies."],
    ["Live games with friends", "Create a room and share its six-character code. No account is required, and both players see the board update live."],
    ["A shared daily challenge", "Everyone faces the same layout and AI each day, then compares territory and completion time."],
  ];
  return <section className="home-content" aria-labelledby="home-guide-title">
    <header><p className="eyebrow">{ko ? "무료 브라우저 보드게임" : "A free browser board game"}</p>
      <h2 id="home-guide-title">{ko ? "삼각형 하나에서 시작되는 땅따먹기" : "Territory begins with one triangle"}</h2>
      <p>{ko ? "설치 없이 AI와 연습하고, 친구를 초대하거나 오늘의 기록에 도전해 보세요." : "Practice against AI, invite a friend, or compete on today's board—no installation required."}</p>
    </header>
    <div className="home-content-grid">{cards.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
  </section>;
}

export default function SiteContent({ path }) {
  const { locale } = useLocale();
  const page = (content[locale] || content.ko)[path] || content.ko[path];
  if (!page) return null;
  return <main className="content-page">
    <header className="content-hero">
      <p className="eyebrow">{page.eyebrow}</p>
      <h1>{page.title}</h1>
      <p className="content-intro">{page.intro}</p>
    </header>
    <div className="content-grid">
      {page.sections.map(([heading, paragraphs]) => <section className="content-card" key={heading}>
        <h2>{heading}</h2>
        {paragraphs.map((paragraph) => {
          const url = paragraph.match(/https:\/\/\S+/)?.[0];
          return url ? <p key={paragraph}>{paragraph.slice(0, paragraph.indexOf(url))}<a href={url} target="_blank" rel="noreferrer">{url}</a></p> : <p key={paragraph}>{paragraph}</p>;
        })}
      </section>)}
    </div>
  </main>;
}
