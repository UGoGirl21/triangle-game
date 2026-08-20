import { useCallback, useEffect, useReducer, useRef, useState } from "react";
import GameBoard from "./components/GameBoard.jsx";
import RulesDialog from "./components/RulesDialog.jsx";
import ScorePanel from "./components/ScorePanel.jsx";
import { chooseAiMove } from "./game/ai.js";
import { randomPlayers } from "./game/constants.js";
import { getDailyChallengeConfig } from "./game/dailyChallenge.js";
import { canConnect, createGame, edgeCrossesAny, edgePassesNearDot, gameReducer } from "./game/gameLogic.js";
import { edgeKey } from "./game/geometry.js";
import { useLocale } from "./i18n/LocaleContext.js";
import { mulberry32 } from "./game/rng.js";
import { supabase } from "./lib/supabaseClient.js";
import { useTurnTimer } from "./useTurnTimer.js";

const DIFFICULTY_LABEL_KEY = { easy: "difficultyEasy", normal: "difficultyNormal", hard: "difficultyHard" };

const storageKey = (dateStr) => `dailyChallenge:${dateStr}`;

function readSavedResult(dateStr) {
  try {
    const raw = window.localStorage.getItem(storageKey(dateStr));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function DailyChallenge({ onNavigate, onExit }) {
  const { locale, t } = useLocale();
  const [config] = useState(getDailyChallengeConfig);
  const [savedResult, setSavedResult] = useState(() => readSavedResult(config.dateStr));
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [started, setStarted] = useState(false);
  const [players, setPlayers] = useState(null);
  const [showRules, setShowRules] = useState(false);
  const [submitState, setSubmitState] = useState("idle");
  const [state, dispatch] = useReducer(gameReducer, undefined, () =>
    createGame(config.dotCount, { rng: mulberry32(config.dotsSeed) }));
  const startTimeRef = useRef(null);
  const submittedRef = useRef(false);
  const stateRef = useRef(state);

  const aiThinking = started && !showRules && !state.gameOver && state.currentPlayer === 2;
  const myTurnActive = started && !showRules && !state.gameOver && state.currentPlayer === 1;

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    if (!aiThinking) return undefined;
    const timer = window.setTimeout(() => {
      const move = chooseAiMove(stateRef.current, config.difficulty);
      if (move) dispatch({ type: "MOVE", a: move[0], b: move[1] });
    }, 500 + Math.random() * 500);
    return () => window.clearTimeout(timer);
  }, [aiThinking, config.difficulty, state.moveCount]);

  useEffect(() => {
    if (!state.notice) return undefined;
    const timer = window.setTimeout(() => dispatch({ type: "CLEAR_NOTICE" }), 1400);
    return () => window.clearTimeout(timer);
  }, [state.notice]);

  const timeLeft = useTurnTimer(myTurnActive, state.moveCount, () => {
    dispatch({ type: "TIMEOUT_SKIP", id: Date.now(), message: t("noticeTimeout") });
  });

  const trySubmit = useCallback(async (result) => {
    setSubmitState("submitting");
    const { error: submitError } = await supabase.from("daily_challenge_scores").insert({
      challenge_date: config.dateStr,
      name: result.name,
      score: result.score,
      opponent_score: result.opponentScore,
      duration_seconds: result.durationSeconds,
      difficulty: config.difficulty,
      dot_count: config.dotCount,
    });
    if (submitError) console.error("daily challenge submit failed", submitError);
    const nextResult = { ...result, submitted: !submitError };
    setSavedResult(nextResult);
    try {
      window.localStorage.setItem(storageKey(config.dateStr), JSON.stringify(nextResult));
    } catch {
      /* best-effort only; a failed write just means the "already played" gate won't stick on this device */
    }
    setSubmitState(submitError ? "error" : "done");
  }, [config]);

  useEffect(() => {
    if (!started || !state.gameOver || submittedRef.current) return;
    submittedRef.current = true;
    const durationSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));
    const result = { name: players[1].name, score: state.scores[1], opponentScore: state.scores[2], durationSeconds, submitted: false };
    setSavedResult(result);
    try {
      window.localStorage.setItem(storageKey(config.dateStr), JSON.stringify(result));
    } catch {
      /* best-effort only; a failed write just means the "already played" gate won't stick on this device */
    }
    trySubmit(result);
  }, [started, state.gameOver, state.scores, players, config, trySubmit]);

  function startChallenge(event) {
    event.preventDefault();
    const clean = nickname.trim();
    if (!clean) return setError(t("errorNicknameRequired"));
    const base = randomPlayers(locale);
    setPlayers({ 1: { ...base[1], name: clean }, 2: base[2] });
    startTimeRef.current = Date.now();
    setStarted(true);
  }

  function handlePick(index) {
    if (index === -1 || state.gameOver || aiThinking) {
      dispatch({ type: "CANCEL" });
      return;
    }
    if (state.selected === null) return dispatch({ type: "SELECT", index });
    if (state.selected === index) return dispatch({ type: "CANCEL" });
    const a = state.selected;
    if (state.edges.has(edgeKey(a, index))) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: t("noticeEdgeExists") });
      return;
    }
    if (edgeCrossesAny(state, a, index)) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: t("noticeEdgeCrosses") });
      return;
    }
    if (edgePassesNearDot(state, a, index)) {
      dispatch({ type: "SHOW_NOTICE", id: Date.now(), message: t("noticeEdgeThroughDot") });
      return;
    }
    if (canConnect(state, a, index)) dispatch({ type: "MOVE", a, b: index });
  }

  const subtitle = t("dailySubtitle", { date: config.dateStr, difficulty: t(DIFFICULTY_LABEL_KEY[config.difficulty]), dotCount: config.dotCount });

  if (savedResult && !started) {
    return <main className="app">
      <header className="title">
        <h1><span>{t("dailyTitlePart1")}</span>{t("dailyTitlePart2")}</h1>
        <p className="subtitle">{subtitle}</p>
      </header>
      <div className="card leaderboard-card">
        <p className="turn-line">{t("alreadyPlayed")}</p>
        <p>{t("resultLine", { name: savedResult.name, score: savedResult.score, opponentScore: savedResult.opponentScore, duration: savedResult.durationSeconds })}</p>
        {!savedResult.submitted && <p className="form-error" role="alert">
          {submitState === "submitting" ? t("submittingToLeaderboard") : t("notYetSubmitted")}
        </p>}
      </div>
      {!savedResult.submitted && <button type="button" disabled={submitState === "submitting"}
        onClick={() => trySubmit(savedResult)}>
        {submitState === "submitting" ? t("submitting") : t("resubmit")}
      </button>}
      <button type="button" onClick={() => onNavigate("leaderboard")}>{t("viewTodayLeaderboard")}</button>
      <button type="button" onClick={onExit}>{t("home")}</button>
    </main>;
  }

  if (!started) {
    return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={startChallenge}>
      <h2>{t("dailyTitlePart1")}{t("dailyTitlePart2")}</h2>
      <p>{subtitle}<br />{t("dailyIntro")}</p>
      <label>{t("nicknameLabel")}<input autoFocus maxLength="12" value={nickname}
        onChange={(e) => { setError(""); setNickname(e.target.value); }} /></label>
      <p className="form-error" role="alert">{error}</p>
      <button type="submit">{t("startChallenge")}</button>
      <button type="button" onClick={onExit}>{t("home")}</button>
    </form></div>;
  }

  return <>
    <main className="app">
      <header className="title">
        <h1><span>{t("dailyTitlePart1")}</span>{t("dailyTitlePart2")}</h1>
        <p className="subtitle">{subtitle}</p>
      </header>
      <div className="paper-wrap">
        <GameBoard state={state} players={players} disabled={showRules || state.gameOver || aiThinking} onPick={handlePick} />
        <div className={`toast${state.notice ? " show" : ""}`} role="status" aria-live="polite">
          {state.notice ? state.notice.message || t("noticeTriangleComplete", { name: players[state.notice.player]?.name }) : ""}
        </div>
      </div>
      <aside className="side">
        <ScorePanel players={players} state={state} aiThinking={aiThinking}
          displayName={(player) => player === 2 ? `${players[player].name} (AI)` : players[player].name}
          turnText={state.gameOver ? t("gameOver") : aiThinking ? t("aiThinking") :
            timeLeft !== null ? t("turnWithTime", { name: players[1].name, time: timeLeft }) : t("turnNoTime", { name: players[1].name })} />
        <section className="card controls">
          <button type="button" onClick={() => setShowRules(true)}>{t("howToPlay")}</button>
          <button type="button" onClick={onExit}>{t("home")}</button>
        </section>
      </aside>
    </main>
    {showRules && <RulesDialog onClose={() => setShowRules(false)} />}
    {!showRules && state.gameOver && savedResult && <div className="overlay show">
      <div className="dialog-box winner-box">
        <h2>{t("dailyCompleteTitle")}</h2>
        <p>{t("resultLine", { name: savedResult.name, score: savedResult.score, opponentScore: savedResult.opponentScore, duration: savedResult.durationSeconds })}</p>
        {!savedResult.submitted && <p className="form-error" role="alert">
          {submitState === "submitting" ? t("submittingToLeaderboard") : t("submitFailed")}
        </p>}
        {!savedResult.submitted && <button type="button" disabled={submitState === "submitting"}
          onClick={() => trySubmit(savedResult)}>
          {submitState === "submitting" ? t("submitting") : t("resubmit")}
        </button>}
        <button type="button" onClick={() => onNavigate("leaderboard")}>{t("viewTodayLeaderboard")}</button>
        <button type="button" onClick={onExit}>{t("home")}</button>
      </div>
    </div>}
  </>;
}
