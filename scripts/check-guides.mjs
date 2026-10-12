import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { getDailyChallengeConfig } from '../src/game/dailyChallenge.js';
import { mulberry32 } from '../src/game/rng.js';
import { LOGICAL_H } from '../src/game/constants.js';
import { applyMove, canConnect, createGame } from '../src/game/gameLogic.js';
import { guideExamples, createExampleState } from '../src/game/guideExamples.js';

for (const example of guideExamples) {
  const initial = createExampleState(example);
  example.choices.forEach((move, i) => {
    const expected = example.expected[i];
    assert.equal(canConnect(initial, ...move), expected !== null, `${example.id}: legality`);
    const after = applyMove(initial, ...move);
    if (expected === null) {
      assert.equal(after, initial, `${example.id}: invalid moves preserve state`);
      return;
    }
    assert.equal(after.scores[1], expected, `${example.id}: score`);
    assert.equal(after.currentPlayer, 2, `${example.id}: no bonus turn`);
    if (example.continuations) {
      let end = after;
      for (const continuation of example.continuations[i]) {
        assert.equal(canConnect(end, ...continuation), true, `${example.id}: continuation legality`);
        end = applyMove(end, ...continuation);
      }
      assert.deepEqual(end.scores, example.finalScores[i], `${example.id}: final scores`);
      assert.equal(end.gameOver, true, `${example.id}: endgame`);
    }
    if (example.replies) {
      const end = applyMove(after, ...example.replies[i]);
      assert.deepEqual(end.scores, i === 0 ? { 1: 1, 2: 1 } : { 1: 0, 2: 2 });
      assert.equal(end.gameOver, true, `${example.id}: final result`);
    }
  });
}
for (const route of ['', 'how-to-play', 'strategy', 'daily-challenge', 'faq', 'about', 'privacy', 'terms', 'contact']) {
  const html = await readFile(`dist/${route ? route + '/' : ''}index.html`, 'utf8');
  assert.match(html, /<h1[ >]/, `${route || '/'}: static heading`);
  assert.match(html, /<nav /, `${route || '/'}: static navigation`);
  assert.ok(html.includes(`href="https://triangle-game-one.vercel.app/${route}"`), `${route || '/'}: canonical`);
  if (!route) {
    assert.ok(html.includes('home-guide-title'), 'Home description rendered before JavaScript');
    assert.ok(html.includes('그림으로 배우는 게임 방법'), 'Home learning links');
  }
  const examples = guideExamples.filter(e => e.page === `/${route}`);
  for (const example of examples) {
    assert.ok(html.includes(example.ko.title), `${example.id}: static title`);
    for (const answer of example.ko.answers) assert.ok(html.includes(answer), `${example.id}: static explanation`);
  }
  if (examples.length) assert.match(html, /<svg /, 'Static board diagrams');
}
const config = getDailyChallengeConfig('2026-10-12');
const dailyBoard = () => createGame(config.dotCount, { rng: mulberry32(config.dotsSeed), boardHeight: LOGICAL_H });
const desktop = dailyBoard();
globalThis.window = { matchMedia: () => ({ matches: true }) };
try {
  assert.deepEqual(dailyBoard().dots, desktop.dots, 'Daily board identical on mobile and desktop');
} finally {
  delete globalThis.window;
}
console.log(`Verified ${guideExamples.length} guide boards, move outcomes, continuations, daily board consistency, and 9 prerendered pages.`);
