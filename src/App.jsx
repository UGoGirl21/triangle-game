import { useEffect, useReducer, useRef, useState } from "react";
import GameBoard from "./components/GameBoard.jsx";
import RulesDialog from "./components/RulesDialog.jsx";
import ScorePanel from "./components/ScorePanel.jsx";
import SettingsDialog from "./components/SettingsDialog.jsx";
import WinnerDialog from "./components/WinnerDialog.jsx";
import { chooseAiMove } from "./game/ai.js";
import { DIFFICULTY_DOT_COUNTS, randomPlayers } from "./game/constants.js";
import { canConnect, createGame, edgeCrossesAny, edgePassesNearDot, gameReducer } from "./game/gameLogic.js";
import { edgeKey } from "./game/geometry.js";

export default function App({ onNavigate }) {
  const [players, setPlayers] = useState(randomPlayers);
  const [state, dispatch] = useReducer(gameReducer, undefined, createGame);
  const [difficulty, setDifficulty] = useState("normal");
  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const stateRef = useRef(state);
  const aiThinking = !showSettings && !showRules && !state.gameOver && state.currentPlayer === 2;

  const displayName = (player) => player === 2 ? `${players[player].name} (AI)` : players[player].name;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!aiThinking) return undefined;
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(stateRef.current, difficulty);
      if (move) dispatch({ type: "MOVE", a: move[0], b: move[1] });
    }, 500 + Math.random() * 500);
    return () => window.clearTimeout(timer);
  }, [aiThinking, difficulty, state.moveCount]);

  useEffect(() => {
    if (!state.notice) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "CLEAR_NOTICE" }), 1400);
    return () => window.clearTimeout(timer);
  }, [state.notice]);

  function handlePick(index) {
    if (index === -1 || state.gameOver || aiThinking) {
      dispatch({ type: "CANCEL" });
      return;
    }
    if (state.selected === null) return dispatch({ type: "SELECT", index });
    if (state.selected === index) return dispatch({ type: "CANCEL" });
    const a = state.selected;
    if (state.edges.has(edgeKey(a, index))) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: "이미 연결된 선이에요" });
      return;
    }
    if (edgeCrossesAny(state, a, index)) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: "다른 선과 겹칠 수 없어요" });
      return;
    }
    if (edgePassesNearDot(state, a, index)) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: "다른 점을 가로질러 연결할 수 없어요" });
      return;
    }
    if (canConnect(state, a, index)) dispatch({ type: "MOVE", a, b: index });
  }

  function startNewGame() {
    dispatch({ type: "RESET", dotCount: DIFFICULTY_DOT_COUNTS[difficulty] });
  }

  function saveSettings(values, selectedDifficulty) {
    setPlayers((current) => ({
      1: { ...current[1], ...values[1] },
      2: { ...current[2], ...values[2] },
    }));
    setDifficulty(selectedDifficulty);
    dispatch({ type: "RESET", dotCount: DIFFICULTY_DOT_COUNTS[selectedDifficulty] });
    setShowSettings(false);
  }

  let winnerMessage = "";
  if (state.gameOver) {
    if (state.scores[1] === state.scores[2]) winnerMessage = "무승부입니다!";
    else {
      const winner = state.scores[1] > state.scores[2] ? 1 : 2;
      winnerMessage = `${displayName(winner)} 승리! (${state.scores[1]} : ${state.scores[2]})`;
    }
  }

  return <>
    <main className="app">
      <header className="title">
        <h1><span>삼각</span> 땅따먹기</h1>
        <p className="subtitle">Triangle Territory · 점을 이어 삼각형을 완성하세요</p>
      </header>
      <div className="paper-wrap">
        <GameBoard state={state} players={players} disabled={showSettings || showRules || state.gameOver || aiThinking} onPick={handlePick} />
        <div className={`toast${state.notice ? " show" : ""}`} role="status" aria-live="polite">
          {state.notice ? state.notice.message || `${displayName(state.notice.player)} 삼각형 완성!` : ""}
        </div>
      </div>
      <aside className="side">
        <ScorePanel players={players} state={state} aiThinking={aiThinking} />
        <section className="card controls">
          <button type="button" onClick={startNewGame}>새 게임</button>
          <button type="button" onClick={() => onNavigate("online")}>친구와 대전</button>
          <button type="button" onClick={() => onNavigate("leaderboard")}>랭킹</button>
          <button type="button" onClick={() => setShowSettings(true)}>설정</button>
          <button type="button" onClick={() => setShowRules(true)}>게임 방법</button>
        </section>
      </aside>
    </main>
    {showSettings && <SettingsDialog players={players} difficulty={difficulty} onSave={saveSettings} onClose={() => setShowSettings(false)} />}
    {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
    {!showSettings && !showRules && state.gameOver && <WinnerDialog message={winnerMessage} onPlayAgain={startNewGame} />}
  </>;
}
