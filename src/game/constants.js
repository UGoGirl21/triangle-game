export const LOGICAL_W = 960;
export const LOGICAL_H = 720;
export const MOBILE_LOGICAL_H = 1080;
export const DOT_COUNT = 50;
export const MIN_DIST = 55;
export const DOT_LINE_CLEARANCE = 12;

export const DIFFICULTY_DOT_COUNTS = {
  easy: 30,
  normal: 50,
  hard: 70,
};

export const TURN_TIME_LIMIT_SECONDS = 15;

export const SYMBOL_OPTIONS = [
  { value: "★", labelKey: "symbolStar" },
  { value: "♥", labelKey: "symbolHeart" },
  { value: "♠", labelKey: "symbolSpade" },
  { value: "●", labelKey: "symbolCircle" },
];

export const COLOR_OPTIONS = [
  { key: "orange", labelKey: "colorOrange", color: "#f05a13", dark: "#a83b08" },
  { key: "green", labelKey: "colorGreen", color: "#2f9e44", dark: "#1e6b2d" },
  { key: "blue", labelKey: "colorBlue", color: "#1c7ed6", dark: "#12518f" },
  { key: "purple", labelKey: "colorPurple", color: "#74399a", dark: "#4f216c" },
  { key: "brown", labelKey: "colorBrown", color: "#8b5a2b", dark: "#5c3a1a" },
];

const NAME_WORDS = {
  ko: [
    "호랑이", "번개", "혜성", "폭풍", "여우", "독수리", "고양이", "펭귄",
    "로켓", "무지개", "해적", "상어", "코알라", "다람쥐", "치타", "부엉이",
    "늑대", "곰", "매", "유령",
  ],
  en: [
    "Tiger", "Lightning", "Comet", "Storm", "Fox", "Eagle", "Cat", "Penguin",
    "Rocket", "Rainbow", "Pirate", "Shark", "Koala", "Squirrel", "Cheetah", "Owl",
    "Wolf", "Bear", "Hawk", "Ghost",
  ],
};

function pickTwoDistinct(list) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function randomColorPair() {
  return pickTwoDistinct(COLOR_OPTIONS);
}

export function randomPlayers(locale = "ko") {
  const [color1, color2] = randomColorPair();
  const [symbol1, symbol2] = pickTwoDistinct(SYMBOL_OPTIONS);
  const [name1, name2] = pickTwoDistinct(NAME_WORDS[locale] || NAME_WORDS.ko);
  const teamName = (word) => (locale === "en" ? `${word} Team` : `${word}팀`);
  return {
    1: { name: teamName(name1), symbol: symbol1.value, color: color1.color, dark: color1.dark },
    2: { name: teamName(name2), symbol: symbol2.value, color: color2.color, dark: color2.dark },
  };
}
