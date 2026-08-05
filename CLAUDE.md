# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

A Korean-language "dots and triangles" territory game (삼각 땅따먹기 / Triangle Territory) built with React + Vite. Two players (human vs. AI, or configurable) connect randomly placed dots with straight lines; completing a triangle claims it. Deployed via Vercel with Google AdSense embedded.

## Commands

```
npm run dev       # start Vite dev server
npm run build     # production build to dist/
npm run preview   # preview the production build
npm run lint      # eslint over the project
```

There is no test suite or type checker configured.

## Architecture

The live app lives entirely under `src/`, entered via `src/main.jsx` → `src/App.jsx`. Game rules and AI are deliberately kept as plain, framework-free modules in `src/game/`, separate from rendering:

- `src/game/constants.js` — board dimensions, dot counts per difficulty, initial player config.
- `src/game/geometry.js` — pure math: segment intersection, point-in-triangle, distance-to-segment, edge/triangle key helpers (`edgeKey`, `triKey`) used as Map keys throughout.
- `src/game/gameLogic.js` — the state machine: `createGame`/`generateDots` (rejection-sampled dot placement avoiding near-duplicates and crowded near-collinear rows), move validation (`canConnect`, `edgeCrossesAny`, `edgePassesNearDot`), `applyMove` (mutates via copy: adds edge, finds newly-closed triangles via `findCaptures`, updates scores), and `gameReducer` (a standard reducer consumed by `useReducer` in `App.jsx` with actions `RESET`/`SELECT`/`CANCEL`/`MOVE`/`SHOW_NOTICE`/`CLEAR_NOTICE`).
- `src/game/ai.js` — `chooseAiMove(state, difficulty)`: greedily takes available captures; on `hard`, avoids moves that would let the opponent capture next turn (`isUnsafe`) and, when the branching factor is small enough (≤180 legal moves), minimaxes one ply to minimize the opponent's best response.
- `src/game/drawGame.js` — canvas rendering of dots, edges, claimed triangles (hatch pattern + seq-numbered symbol), and the drag preview line. Pure function of `(ctx, state, players, ...)`, no state ownership.

Game state (`state.dots`, `state.edges` (Map keyed by `edgeKey`), `state.claimed` (Map keyed by `triKey`), `state.scores`, `state.selected`, `state.currentPlayer`, `state.gameOver`, `state.notice`) is owned by `App.jsx` via `useReducer(gameReducer, ...)` and passed down as props — there is no external state library.

`src/components/GameBoard.jsx` owns the `<canvas>` and all pointer interaction: it computes logical↔screen coordinate scaling (fixed logical size `LOGICAL_W`×`LOGICAL_H`/`MOBILE_LOGICAL_H`, scaled to device pixel ratio), finds the nearest dot to a pointer event (`nearestDot`, with a larger hit-radius for touch), and drives the `drawGame` render loop (looping via `requestAnimationFrame` only while a dot is selected, for the pulsing highlight). It calls `onPick(index)` up to `App.jsx`, which does all move validation before dispatching `SELECT`/`MOVE`/`SHOW_NOTICE` — the board itself has no game-rule knowledge beyond what's needed for hover preview validity.

The board height (and dot scale) adapt for mobile via `window.matchMedia("(max-width: 800px)")`, checked both in `createGame` (dot generation) and in `GameBoard`'s render loop — keep both in sync if changing breakpoints.

Text throughout the UI is Korean; toast/error messages are inline literals in `App.jsx` and `SetupDialog.jsx` rather than externalized.

Note: root-level `style.css` lives outside `src/` but is live — it's imported by `src/main.jsx` via `import "../style.css"` and is the stylesheet actually in effect.

`dist/` is a gitignored Vite build output directory; don't hand-edit it.
