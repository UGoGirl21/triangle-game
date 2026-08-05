export function saveGameResult(supabase, { roomCode, players, scores, dotCount }) {
  const winner = scores[1] === scores[2] ? null : scores[1] > scores[2] ? 1 : 2;
  return supabase.from("game_results").insert({
    room_code: roomCode,
    player1_name: players[1].name,
    player1_symbol: players[1].symbol,
    player1_score: scores[1],
    player2_name: players[2].name,
    player2_symbol: players[2].symbol,
    player2_score: scores[2],
    winner,
    dot_count: dotCount,
  });
}
