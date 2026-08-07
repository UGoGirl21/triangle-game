import { useEffect, useState } from "react";
import GameBoard from "../components/GameBoard.jsx";
import RulesDialog from "../components/RulesDialog.jsx";
import ScorePanel from "../components/ScorePanel.jsx";
import WinnerDialog from "../components/WinnerDialog.jsx";
import { DIFFICULTY_DOT_COUNTS, SYMBOL_OPTIONS } from "../game/constants.js";
import { canConnect, edgeCrossesAny, edgePassesNearDot } from "../game/gameLogic.js";
import { edgeKey } from "../game/geometry.js";
import { useLocale } from "../i18n/LocaleContext.js";
import { useOnlineGame } from "./useOnlineGame.js";

export default function OnlineGame({ onExit }) {
  const { t } = useLocale();
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
    if (!name) return setError(t("errorTeamNameRequired"));
    startAsHost({ name, symbol: hostForm.symbol, dotCount: DIFFICULTY_DOT_COUNTS[hostForm.difficulty] });
  }

  function submitJoinCode(event) {
    event.preventDefault();
    if (joinCode.trim().length !== 6) return setError(t("errorRoomCodeRequired"));
    setError("");
    peekRoom(joinCode);
  }

  function submitJoinForm(event) {
    event.preventDefault();
    const name = joinForm.name.trim();
    if (!name) return setError(t("errorTeamNameRequired"));
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
    if (gameState.edges.has(edgeKey(a, index))) return showNotice(t("noticeEdgeExists"));
    if (edgeCrossesAny(gameState, a, index)) return showNotice(t("noticeEdgeCrosses"));
    if (edgePassesNearDot(gameState, a, index)) return showNotice(t("noticeEdgeThroughDot"));
    if (canConnect(gameState, a, index)) makeMove(a, index);
  }

  if (phase === "playing" && gameState) {
    const myTurn = gameState.currentPlayer === role;
    const turnText = gameState.gameOver ? t("gameOver") : myTurn ? t("myTurn") : t("waitingOpponentTurn");
    let winnerMessage = "";
    if (gameState.gameOver) {
      if (gameState.scores[1] === gameState.scores[2]) winnerMessage = t("winnerDraw");
      else {
        const winner = gameState.scores[1] > gameState.scores[2] ? 1 : 2;
        winnerMessage = t("winnerMessage", { name: players[winner].name, s1: gameState.scores[1], s2: gameState.scores[2] });
      }
    }
    return <>
      <main className="app">
        <header className="title">
          <h1><span>{t("onlineTitlePart1")}</span>{t("onlineTitlePart2")}</h1>
          <p className="subtitle">{t("roomCodeSubtitle", { code })}</p>
        </header>
        <div className="paper-wrap">
          <GameBoard state={gameState} players={players} disabled={gameState.gameOver || !myTurn || showRules} onPick={handlePick} />
          <div className={`toast${gameState.notice ? " show" : ""}`} role="status" aria-live="polite">
            {gameState.notice ? gameState.notice.message || t("noticeTriangleComplete", { name: players[gameState.notice.player]?.name }) : ""}
          </div>
        </div>
        <aside className="side">
          <ScorePanel players={players} state={gameState} turnText={turnText}
            displayName={(player) => players[player].name} />
          <section className="card controls">
            <button type="button" onClick={backToMenu}>{t("leaveButton")}</button>
            <button type="button" onClick={() => setShowRules(true)}>{t("howToPlay")}</button>
          </section>
        </aside>
      </main>
      {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
      {!showRules && gameState.gameOver && <WinnerDialog message={winnerMessage} onPlayAgain={backToMenu} />}
    </>;
  }

  if (phase === "disconnected") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>{t("disconnectedTitle")}</h2><p>{t("disconnectedBody")}</p>
      <button type="button" onClick={backToMenu}>{t("home")}</button>
    </div></div>;
  }

  if (phase === "not-found") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>{t("notFoundTitle")}</h2><p>{t("notFoundBody")}</p>
      <button type="button" onClick={backToMenu}>{t("home")}</button>
    </div></div>;
  }

  if (phase === "room-taken") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>{t("roomTakenTitle")}</h2><p>{t("roomTakenBody")}</p>
      <button type="button" onClick={backToMenu}>{t("home")}</button>
      <pre style={{ textAlign: "left", fontSize: 11, whiteSpace: "pre-wrap", marginTop: 12 }}>
        {JSON.stringify(debugInfo, null, 2)}
      </pre>
    </div></div>;
  }

  if (phase === "hosting") {
    return <div className="overlay show"><div className="dialog-box">
      <h2>{t("hostingTitle")}</h2>
      <p className="room-code">{code}</p>
      <p>{t("hostingBody")}</p>
      <button type="button" onClick={backToMenu}>{t("cancel")}</button>
    </div></div>;
  }

  if (phase === "joining") {
    if (!hostInfo) {
      return <div className="overlay show"><div className="dialog-box">
        <h2>{t("checkingRoomTitle")}</h2><p>{t("checkingRoomCode", { code })}</p>
        <button type="button" onClick={backToMenu}>{t("cancel")}</button>
      </div></div>;
    }
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitJoinForm}>
      <h2>{t("joinTitle")}</h2><p>{t("opponentInfo", { name: hostInfo.name, symbol: hostInfo.symbol })}</p>
      <label>{t("teamNameLabel")}<input autoFocus maxLength="12" value={joinForm.name}
        onChange={(e) => setJoinForm((current) => ({ ...current, name: e.target.value }))} /></label>
      <label>{t("symbolLabel")}<select className="symbol-select" value={joinSymbol}
        onChange={(e) => setJoinForm((current) => ({ ...current, symbol: e.target.value }))}>
        {SYMBOL_OPTIONS.map((option) => (
          <option key={option.value} value={option.value} disabled={option.value === hostInfo.symbol}>
            {t(option.labelKey)}
          </option>
        ))}
      </select></label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">{t("startGameButton")}</button>
    </form></div>;
  }

  if (view === "host-form") {
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitHostForm}>
      <h2>{t("createRoomTitle")}</h2>
      <label>{t("teamNameLabel")}<input autoFocus maxLength="12" value={hostForm.name}
        onChange={(e) => setHostForm((current) => ({ ...current, name: e.target.value }))} /></label>
      <label>{t("symbolLabel")}<select className="symbol-select" value={hostForm.symbol}
        onChange={(e) => setHostForm((current) => ({ ...current, symbol: e.target.value }))}>
        {SYMBOL_OPTIONS.map((option) => <option key={option.value} value={option.value}>{t(option.labelKey)}</option>)}
      </select></label>
      <label>{t("onlineDifficultyLabel")}
        <select className="symbol-select" value={hostForm.difficulty}
          onChange={(e) => setHostForm((current) => ({ ...current, difficulty: e.target.value }))}>
          <option value="easy">{t("difficultyEasy")}</option>
          <option value="normal">{t("difficultyNormal")}</option>
          <option value="hard">{t("difficultyHard")}</option>
        </select>
      </label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">{t("createRoomTitle")}</button>
      <button type="button" onClick={() => setView("select")}>{t("back")}</button>
    </form></div>;
  }

  if (view === "join-form") {
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submitJoinCode}>
      <h2>{t("joinTitle")}</h2>
      <label>{t("roomCodeLabel")}<input autoFocus maxLength="6" value={joinCode}
        onChange={(e) => setJoinCode(e.target.value.toUpperCase())} /></label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">{t("confirmButton")}</button>
      <button type="button" onClick={() => setView("select")}>{t("back")}</button>
    </form></div>;
  }

  return <div className="overlay show"><div className="dialog-box">
    <h2>{t("onlineMatchTitle")}</h2>
    <button type="button" onClick={() => { setError(""); setView("host-form"); }}>{t("createRoomTitle")}</button>
    <button type="button" onClick={() => { setError(""); setView("join-form"); }}>{t("joinTitle")}</button>
    <button type="button" onClick={onExit}>{t("home")}</button>
  </div></div>;
}
