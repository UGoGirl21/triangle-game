import { useEffect, useState } from "react";
import GameBoard from "../components/GameBoard.jsx";
import RulesDialog from "../components/RulesDialog.jsx";
import ScorePanel from "../components/ScorePanel.jsx";
import WinnerDialog from "../components/WinnerDialog.jsx";
import { DIFFICULTY_DOT_COUNTS, SYMBOL_OPTIONS } from "../game/constants.js";
import { canConnect, edgeCrossesAny, edgePassesNearDot } from "../game/gameLogic.js";
import { edgeKey } from "../game/geometry.js";
import { useOnlineGame } from "./useOnlineGame.js";

export default function OnlineGame({ onExit }) {
  const {
    phase, code, role, players, hostInfo, gameState, debugInfo,
    startAsHost, peekRoom, finalizeJoin, makeMove, select, cancel, showNotice, clearNotice, leave,
  } = useOnlineGame();

  const [view, setView] = useState("select");
  const [hostForm, setHostForm] = useState({ name: "", symbol: SYMBOL_OPTIONS[0].value, difficulty: "normal" });
  const [joinCode, setJoinCode] = useState("");
  const [joinForm, setJoinForm] = useState({ name: "", symbol: "" });
  const [error, setError] = useState("");
  const [showRules, setShowRules] = useState(false);
  const joinSymbol = joinForm.symbol || SYMBOL_OPTIONS.find((option) => option.value !== hostInfo?.symbol)?.value;

  useEffect(() => {
    if (!gameState?.notice) return undefined;
    const timer = window.setTimeout(() => clearNotice(), 1400);
    return () => window.clearTimeout(timer);
  }, [gameState?.notice, clearNotice]);

  function backToMenu() {
    leave();
    setView("select");
    setError("");
  }

  function submitHostForm(event) {
    event.preventDefault();
    const name = hostForm.name.trim();
    if (!name) return setError("팀 이름을 입력해주세요.");
    startAsHost({ name, symbol: hostForm.symbol, dotCount: DIFFICULTY_DOT_COUNTS[hostForm.difficulty] });
  }

  function submitJoinCode(event) {
    event.preventDefault();
    if (joinCode.trim().length !== 6) return setError("6자리 방 코드를 입력해주세요.");
    setError("");
    peekRoom(joinCode);
  }

  function submitJoinForm(event) {
    event.preventDefault();
    const name = joinForm.name.trim();
    if (!name) return setError("팀 이름을 입력해주세요.");
    finalizeJoin({ name, symbol: joinSymbol });
  }

  function handlePick(index) {
    const myTurn = gameState.currentPlayer === role;
    if (index === -1 || gameState.gameOver || !myTurn) {
      cancel();
      return;
    }
    if (gameState.selected === null) return select(index);
    if (gameState.selected === index) return cancel();
    const a = gameState.selected;
    if (gameState.edges.has(edgeKey(a, index))) return showNotice("이미 연결된 선이에요");
    if (edgeCrossesAny(gameState, a, index)) return showNotice("다른 선과 겹칠 수 없어요");
    if (edgePassesNearDot(gameState, a, index)) return showNotice("다른 점을 가로질러 연결할 수 없어요");
    if (canConnect(gameState, a, index)) makeMove(a, index);
  }

  if (phase === "playing" && gameState) {
    const myTurn = gameState.currentPlayer === role;
    const turnText = gameState.gameOver ? "게임 종료" : myTurn ? "내 차례" : "상대 차례를 기다리는 중...";
    let winnerMessage = "";
    if (gameState.gameOver) {
      if (gameState.scores[1] === gameState.scores[2]) winnerMessage = "무승부입니다!";
      else {
        const winner = gameState.scores[1] > gameState.scores[2] ? 1 : 2;
        winnerMessage = `${players[winner].name} 승리! (${gameState.scores[1]} : ${gameState.scores[2]})`;
      }
    }
    return <>
      <main className="app">
        <header className="title">
          <h1><span>온라인</span> 대전</h1>
          <p className="subtitle">방 코드 {code}</p>
        </header>
        <div className="paper-wrap">
          <GameBoard state={gameState} players={players} disabled={gameState.gameOver || !myTurn || showRules} onPick={handlePick} />
          <div className={`toast${gameState.notice ? " show" : ""}`} role="status" aria-live="polite">
            {gameState.notice ? gameState.notice.message || `${players[gameState.notice.player]?.name} 삼각형 완성!` : ""}
          </div>
        </div>
        <aside className="side">
          <ScorePanel players={players} state={gameState} turnText={turnText}
            displayName={(player) => players[player].name} />
          <section className="card controls">
            <button type="button" onClick={backToMenu}>나가기</button>
            <button type="button" onClick={() => setShowRules(true)}>게임 방법</button>
          </section>
        </aside>
      </main>
      {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
      {!showRules && gameState.gameOver && <WinnerDialog message={winnerMessage} onPlayAgain={backToMenu} />}
    </>;
  }

  if (phase === "disconnected") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>연결이 끊어졌어요</h2><p>상대방과의 연결이 끊어졌습니다.</p>
      <button type="button" onClick={backToMenu}>홈으로</button>
    </div></div>;
  }

  if (phase === "not-found") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>방을 찾을 수 없어요</h2><p>코드를 다시 확인해주세요.</p>
      <button type="button" onClick={backToMenu}>홈으로</button>
    </div></div>;
  }

  if (phase === "room-taken") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>이미 시작된 방이에요</h2><p>다른 방 코드를 사용해주세요.</p>
      <button type="button" onClick={backToMenu}>홈으로</button>
      <pre style={{ textAlign: "left", fontSize: 11, whiteSpace: "pre-wrap", marginTop: 12 }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div></div>;
  }

  if (phase === "hosting") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>상대방을 기다리는 중...</h2>
      <p className="room-code">{code}</p>
      <p>이 코드를 상대방에게 알려주세요.</p>
      <button type="button" onClick={backToMenu}>취소</button>
    </div></div>;
  }

  if (phase === "joining") {
    if (!hostInfo) {
      return <div className="overlay show"><div className="dialog-box">
        <h2>방 확인 중...</h2><p>코드 {code}</p>
        <button type="button" onClick={backToMenu}>취소</button>
      </div></div>;
    }
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitJoinForm}>
      <h2>참가하기</h2><p>상대: {hostInfo.name} {hostInfo.symbol}</p>
      <label>팀 이름<input autoFocus maxLength="12" value={joinForm.name}
        onChange={(e) => setJoinForm((current) => ({ ...current, name: e.target.value }))} /></label>
      <label>기호<select className="symbol-select" value={joinSymbol}
        onChange={(e) => setJoinForm((current) => ({ ...current, symbol: e.target.value }))}>
        {SYMBOL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === hostInfo.symbol}>
            {option.label}
          </option>
        ))}
      </select></label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">게임 시작</button>
    </form></div>;
  }

  if (view === "host-form") {
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitHostForm}>
      <h2>방 만들기</h2>
      <label>팀 이름<input autoFocus maxLength="12" value={hostForm.name}
        onChange={(e) => setHostForm((current) => ({ ...current, name: e.target.value }))} /></label>
      <label>기호<select className="symbol-select" value={hostForm.symbol}
        onChange={(e) => setHostForm((current) => ({ ...current, symbol: e.target.value }))}>
        {SYMBOL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select></label>
      <label>난이도
        <select className="symbol-select" value={hostForm.difficulty}
          onChange={(e) => setHostForm((current) => ({ ...current, difficulty: e.target.value }))}>
          <option value="easy">쉬움</option>
          <option value="normal">보통</option>
          <option value="hard">어려움</option>
        </select>
      </label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">방 만들기</button>
      <button type="button" onClick={() => setView("select")}>뒤로</button>
    </form></div>;
  }

  if (view === "join-form") {
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitJoinCode}>
      <h2>참가하기</h2>
      <label>방 코드<input autoFocus maxLength="6" value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())} /></label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">확인</button>
      <button type="button" onClick={() => setView("select")}>뒤로</button>
    </form></div>;
  }

  return <div className="overlay show"><div className="dialog-box">
    <h2>온라인 대전</h2>
    <button type="button" onClick={() => { setError(""); setView("host-form"); }}>방 만들기</button>
    <button type="button" onClick={() => { setError(""); setView("join-form"); }}>참가하기</button>
    <button type="button" onClick={onExit}>홈으로</button>
  </div></div>;
}
