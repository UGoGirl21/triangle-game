import { DOT_COUNT, DOT_LINE_CLEARANCE, LOGICAL_H, LOGICAL_W, MIN_DIST, MOBILE_LOGICAL_H } from "./constants.js";
import { distanceToSegment, edgeKey, segmentsIntersect, triKey } from "./geometry.js";

function createsCrowdedHorizontalLine(points, candidate) {
  for (let i = 0; i < points.length; i += 1) {
    for (let j = i + 1; j < points.length; j += 1) {
      const triple = [candidate, points[i], points[j]];
      const yValues = triple.map((point) => point.y);
      const xValues = triple.map((point) => point.x);
      if (Math.max(...yValues) - Math.min(...yValues) < 8 &&
        Math.max(...xValues) - Math.min(...xValues) > 180) return true;
    }
  }
  return false;
}

export function generateDots(dotCount = DOT_COUNT, boardHeight = LOGICAL_H) {
  const points = [];
  const margin = 36;
  let attempts = 0;
  while (points.length < dotCount && attempts < 30000) {
    attempts += 1;
    const x = margin + Math.random() * (LOGICAL_W - margin * 2);
    const y = margin + Math.random() * (boardHeight - margin * 2);
    const candidate = { x, y };
    if (points.every((point) => (point.x - x) ** 2 + (point.y - y) ** 2 >= MIN_DIST ** 2) &&
      !createsCrowdedHorizontalLine(points, candidate)) {
      points.push(candidate);
    }
  }
  return points;
}

export function createGame(dotCount = DOT_COUNT) {
  const boardHeight = typeof window !== "undefined" && window.matchMedia("(max-width: 800px)").matches
    ? MOBILE_LOGICAL_H : LOGICAL_H;
  return {
    dots: generateDots(dotCount, boardHeight), boardHeight, edges: new Map(), claimed: new Map(), currentPlayer: 1,
    selected: null, scores: { 1: 0, 2: 0 }, gameOver: false, lastMoveKey: null,
    moveCount: 0, notice: null,
  };
}

export function edgeCrossesAny(state, i, j) {
  const p1 = state.dots[i];
  const p2 = state.dots[j];
  for (const edge of state.edges.values()) {
    if ([edge.a, edge.b].includes(i) || [edge.a, edge.b].includes(j)) continue;
    if (segmentsIntersect(p1, p2, state.dots[edge.a], state.dots[edge.b])) return true;
  }
  return false;
}

export function edgePassesNearDot(state, i, j) {
  return state.dots.some((point, index) => index !== i && index !== j &&
    distanceToSegment(point, state.dots[i], state.dots[j]) < DOT_LINE_CLEARANCE);
}

export function canConnect(state, i, j) {
  return i !== j && !state.edges.has(edgeKey(i, j)) && !edgeCrossesAny(state, i, j) && !edgePassesNearDot(state, i, j);
}

export function getLegalMoves(state) {
  const moves = [];
  for (let i = 0; i < state.dots.length; i += 1) {
    for (let j = i + 1; j < state.dots.length; j += 1) {
      if (canConnect(state, i, j)) moves.push([i, j]);
    }
  }
  return moves;
}

function findCaptures(state, a, b) {
  const found = [];
  for (let c = 0; c < state.dots.length; c += 1) {
    if (c === a || c === b || !state.edges.has(edgeKey(a, c)) || !state.edges.has(edgeKey(b, c))) continue;
    if (!state.claimed.has(triKey(a, b, c))) found.push([a, b, c]);
  }
  return found;
}

export function applyMove(state, a, b) {
  if (!canConnect(state, a, b)) return state;
  const edges = new Map(state.edges);
  const key = edgeKey(a, b);
  edges.set(key, { a, b, player: state.currentPlayer });
  const withEdge = { ...state, edges };
  const wins = findCaptures(withEdge, a, b);
  const claimed = new Map(state.claimed);
  const scores = { ...state.scores };
  wins.forEach(([x, y, z]) => {
    scores[state.currentPlayer] += 1;
    claimed.set(triKey(x, y, z), { a: x, b: y, c: z, player: state.currentPlayer, seq: scores[state.currentPlayer] });
  });
  const next = { ...state, edges, claimed, scores, selected: null, lastMoveKey: key, moveCount: state.moveCount + 1 };
  const gameOver = getLegalMoves(next).length === 0;
  return {
    ...next,
    gameOver,
    currentPlayer: state.currentPlayer === 1 ? 2 : 1,
    notice: wins.length ? { id: next.moveCount, player: state.currentPlayer } : null,
  };
}

export function gameReducer(state, action) {
  switch (action.type) {
    case "RESET": return createGame(action.dotCount);
    case "SELECT": return { ...state, selected: action.index };
    case "CANCEL": return { ...state, selected: null };
    case "MOVE": return applyMove(state, action.a, action.b);
    case "SHOW_NOTICE": return { ...state, selected: null, notice: { id: action.id, message: action.message } };
    case "CLEAR_NOTICE": return { ...state, notice: null };
    default: return state;
  }
}
