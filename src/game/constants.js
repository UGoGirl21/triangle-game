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

export const SYMBOL_OPTIONS = [
  { value: "★", label: "★ 별" },
  { value: "♥", label: "♥ 하트" },
  { value: "♠", label: "♠ 스페이드" },
  { value: "●", label: "● 동그라미" },
];

export const COLOR_OPTIONS = [
  { key: "orange", label: "주황", color: "#f05a13", dark: "#a83b08" },
  { key: "green", label: "초록", color: "#2f9e44", dark: "#1e6b2d" },
  { key: "blue", label: "파랑", color: "#1c7ed6", dark: "#12518f" },
  { key: "purple", label: "보라", color: "#74399a", dark: "#4f216c" },
  { key: "pink", label: "분홍", color: "#e64980", dark: "#a52f5b" },
];

export const NAME_WORDS = [
  "호랑이", "번개", "혜성", "폭풍", "여우", "독수리", "고양이", "펭귄",
  "로켓", "무지개", "해적", "상어", "코알라", "다람쥐", "치타", "부엉이",
  "늑대", "곰", "매", "유령",
];

function pickTwoDistinct(list) {
  const shuffled = [...list].sort(() => Math.random() - 0.5);
  return [shuffled[0], shuffled[1]];
}

export function randomColorPair() {
  return pickTwoDistinct(COLOR_OPTIONS);
}

export function randomPlayers() {
  const [color1, color2] = randomColorPair();
  const [symbol1, symbol2] = pickTwoDistinct(SYMBOL_OPTIONS);
  const [name1, name2] = pickTwoDistinct(NAME_WORDS);
  return {
    1: { name: `${name1}팀`, symbol: symbol1.value, color: color1.color, dark: color1.dark },
    2: { name: `${name2}팀`, symbol: symbol2.value, color: color2.color, dark: color2.dark },
  };
}
