import { useEffect, useReducer, useRef, useState } from "react";
import GameBoard from "./components/GameBoard.jsx";
import ScorePanel from "./components/ScorePanel.jsx";
import SetupDialog from "./components/SetupDialog.jsx";
import WinnerDialog from "./components/WinnerDialog.jsx";
import { chooseAiMove } from "./game/ai.js";
import { DIFFICULTY_DOT_COUNTS, INITIAL_PLAYERS } from "./game/constants.js";
import { canConnect, createGame, edgeCrossesAny, edgePassesNearDot, gameReducer } from "./game/gameLogic.js";
import { edgeKey } from "./game/geometry.js";

const copyPlayers = (players) => ({ 1: { ...players[1] }, 2: { ...players[2] } });

export default function App({ onNavigate }) {
  const [players, setPlayers] = useState(() => copyPlayers(INITIAL_PLAYERS));
  const [state, dispatch] = useReducer(gameReducer, undefined, createGame);
  const [difficulty, setDifficulty] = useState("normal");
  const [showSetup, setShowSetup] = useState(true);
  const stateRef = useRef(state);
  const aiThinking = !showSetup && !state.gameOver && state.currentPlayer === 2;

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

  function startGame(values, selectedDifficulty) {
    setPlayers((current) => ({
      1: { ...current[1], ...values[1] },
      2: { ...current[2], ...values[2] },
    }));
    setDifficulty(selectedDifficulty);
    dispatch({ type: "RESET", dotCount: DIFFICULTY_DOT_COUNTS[selectedDifficulty] });
    setShowSetup(false);
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
        <details className="mobile-rules">
          <summary>게임 방법</summary>
          <div className="mobile-rules-content">
            1. 점을 탭해 선택<br />
            2. 다른 점을 탭해 선 긋기<br />
            3. 점과 점은 직선으로만 연결<br />
            4. 선이 서로 교차할 순 없음<br />
            5. 완성한 모든 삼각형은 점수 획득<br />
            6. 노란 선은 가장 최근에 둔 수<br />
            7. 더 그을 선이 없으면 게임 종료
          </div>
        </details>
      </header>
      <div className="paper-wrap">
        <GameBoard state={state} players={players} disabled={showSetup || state.gameOver || aiThinking} onPick={handlePick} />
        <div className={`toast${state.notice ? " show" : ""}`} role="status" aria-live="polite">
          {state.notice ? state.notice.message || `${displayName(state.notice.player)} 삼각형 완성!` : ""}
        </div>
      </div>
      <aside className="side">
        <ScorePanel players={players} state={state} aiThinking={aiThinking} />
        <section className="card controls">
          <button type="button" onClick={() => setShowSetup(true)}>새 게임</button>
          <button type="button" onClick={() => onNavigate("online")}>친구와 대전</button>
          <button type="button" onClick={() => onNavigate("leaderboard")}>랭킹</button>
        </section>
        <section className="card rules"><h2>게임 방법</h2>1. 점을 탭해 선택<br />2. 다른 점을 탭해 선 긋기<br />3. 점과 점은 직선으로만 연결<br />4. 선이 서로 교차할 순 없음<br />5. 완성한 모든 삼각형은 점수 획득<br />6. 노란 선은 가장 최근에 둔 수<br />7. 더 그을 선이 없으면 게임 종료</section>
      </aside>
    </main>
    {showSetup && <SetupDialog players={players} difficulty={difficulty} onStart={startGame} />}
    {!showSetup && state.gameOver && <WinnerDialog message={winnerMessage} onPlayAgain={() => setShowSetup(true)} />}
  </>;
}
