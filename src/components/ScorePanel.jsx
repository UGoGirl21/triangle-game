import { useLocale } from "../i18n/LocaleContext.js";

export default function ScorePanel({
  players, state, aiThinking,
  displayName = (player) => player === 2 ? `${players[player].name} (AI)` : players[player].name,
  turnText,
}) {
  const { t } = useLocale();
  const resolvedTurnText = turnText ?? (state.gameOver ? t("gameOver") : aiThinking ? t("aiThinking") : t("turnNoTime", { name: displayName(state.currentPlayer) }));
  return (
    <section className="card score-card">
      <p className="turn-line">{resolvedTurnText}</p>
      <div className="players-grid">
        {[1, 2].map((player, index) => (
          <div key={player}>
            {index > 0 && <div className="card-gap" />}
            <div className={`player-card${state.currentPlayer === player && !state.gameOver ? " active" : ""}`}>
              <div className="swatch" style={{ background: players[player].color }}>{players[player].symbol}</div>
              <div className="player-name">{displayName(player)}</div>
              <div className="player-score" style={{ color: players[player].color }}>{state.scores[player]}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
