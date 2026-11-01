import assert from "node:assert/strict";
import test from "node:test";
import { chooseDailyAiMove, getDailyChallengeConfig } from "../src/game/dailyChallenge.js";
import { applyMove, createGame, getLegalMoves } from "../src/game/gameLogic.js";
import { LOGICAL_H } from "../src/game/constants.js";
import { mulberry32 } from "../src/game/rng.js";

for (const difficulty of ["easy", "normal", "hard"]) {
  test(`${difficulty}: daily AI repeats across replays and position insertion orders`, () => {
    const config = { ...getDailyChallengeConfig("2026-11-01"), difficulty };
    const newGame = () => createGame(config.dotCount, {
      rng: mulberry32(config.dotsSeed), boardHeight: LOGICAL_H,
    });
    let first = newGame();
    let replay = newGame();
    const originalRandom = Math.random;
    Math.random = () => { throw new Error("Daily AI must use its seeded RNG"); };
    try {
      while (!first.gameOver) {
        const move = first.currentPlayer === 1
          ? getLegalMoves(first)[0]
          : chooseDailyAiMove(first, config);
        if (first.currentPlayer === 2) {
          assert.deepEqual(chooseDailyAiMove(replay, config), move);
          assert.deepEqual(chooseDailyAiMove({
            ...first,
            edges: new Map([...first.edges].reverse()),
            claimed: new Map([...first.claimed].reverse()),
          }, config), move);
        }
        assert.ok(move);
        first = applyMove(first, ...move);
        replay = applyMove(replay, ...move);
      }
      assert.deepEqual(replay, first);
    } finally {
      Math.random = originalRandom;
    }
  });
}
