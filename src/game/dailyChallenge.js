import { DIFFICULTY_DOT_COUNTS } from "./constants.js";

const DIFFICULTIES = ["easy", "normal", "hard"];

export function getTodayKstDateString(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(now);
}

function hashStringToSeed(str) {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function getDailyChallengeConfig(dateStr = getTodayKstDateString()) {
  const difficulty = DIFFICULTIES[hashStringToSeed(`${dateStr}:difficulty`) % DIFFICULTIES.length];
  const dotsSeed = hashStringToSeed(`${dateStr}:dots`);
  return { dateStr, difficulty, dotCount: DIFFICULTY_DOT_COUNTS[difficulty], dotsSeed };
}
