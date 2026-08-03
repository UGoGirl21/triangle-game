import { edgeKey, triKey } from "./geometry.js";
import { canConnect, getLegalMoves } from "./gameLogic.js";

function triangleEdgeCount(state, x, y, z, extraEdge) {
  const hasEdge = (a, b) => state.edges.has(edgeKey(a, b)) ||
    (extraEdge && edgeKey(...extraEdge) === edgeKey(a, b));
  return Number(hasEdge(x, y)) + Number(hasEdge(y, z)) + Number(hasEdge(x, z));
}

function countCaptures(state, a, b) {
  let count = 0;
  for (let c = 0; c < state.dots.length; c += 1) {
    if (c !== a && c !== b && !state.claimed.has(triKey(a, b, c)) &&
      triangleEdgeCount(state, a, b, c, [a, b]) === 3) count += 1;
  }
  return count;
}

function isUnsafe(state, a, b) {
  for (let c = 0; c < state.dots.length; c += 1) {
    if (c !== a && c !== b && !state.claimed.has(triKey(a, b, c)) &&
      triangleEdgeCount(state, a, b, c, [a, b]) === 2) return true;
  }
  return false;
}

const randomItem = (items) => items[Math.floor(Math.random() * items.length)];

export function chooseAiMove(state, difficulty) {
  const moves = getLegalMoves(state);
  if (!moves.length) return null;
  const scored = moves.map(([a, b]) => ({ a, b, captures: countCaptures(state, a, b) }));
  const completing = scored.filter((move) => move.captures > 0);
  const bestCompleting = () => {
    const best = Math.max(...completing.map((move) => move.captures));
    const move = randomItem(completing.filter((item) => item.captures === best));
    return [move.a, move.b];
  };
  if (difficulty === "easy") return completing.length && Math.random() < 0.6 ? bestCompleting() : randomItem(moves);
  if (completing.length) return bestCompleting();
  if (difficulty === "normal") {
    if (Math.random() < 0.5) return randomItem(moves);
    const safe = moves.filter(([a, b]) => !isUnsafe(state, a, b));
    return randomItem(safe.length ? safe : moves);
  }
  const safe = moves.filter(([a, b]) => !isUnsafe(state, a, b));
  if (safe.length) return randomItem(safe);
  if (moves.length <= 180) {
    let bestMove = null;
    let bestOpponentGain = Infinity;
    for (const [a, b] of moves) {
      const edges = new Map(state.edges);
      edges.set(edgeKey(a, b), { a, b, player: state.currentPlayer });
      const simulated = { ...state, edges };
      let maximumGain = 0;
      for (let x = 0; x < state.dots.length; x += 1) {
        for (let y = x + 1; y < state.dots.length; y += 1) {
          if (canConnect(simulated, x, y)) maximumGain = Math.max(maximumGain, countCaptures(simulated, x, y));
        }
      }
      if (maximumGain < bestOpponentGain) {
        bestOpponentGain = maximumGain;
        bestMove = [a, b];
      }
    }
    return bestMove || randomItem(moves);
  }
  return randomItem(moves);
}
