export default function ScorePanel({
  players, state, aiThinking,
  displayName = (player) => player === 2 ? `${players[player].name} (AI)` : players[player].name,
  turnText = state.gameOver ? "게임 종료" : aiThinking ? "AI가 생각 중..." : `${displayName(state.currentPlayer)} 차례`,
}) {
  return (
    <section className="card score-card">
      <p className="turn-line">{turnText}</p>
      <div className="players-grid">
        {[1, 2].map((player, index) => (
          <div key={player}>
            {index > 0 && <div className="card-gap" />}
            <div className={`player-card p${player}${state.currentPlayer === player && !state.gameOver ? " active" : ""}`}>
              <div className="swatch">{players[player].symbol}</div>
              <div className="player-name">{displayName(player)}</div>
              <div className="player-score">{state.scores[player]}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
