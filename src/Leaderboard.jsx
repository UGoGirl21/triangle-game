import { useEffect, useState } from "react";
import { getTodayKstDateString } from "./game/dailyChallenge.js";
import { supabase } from "./lib/supabaseClient.js";

export default function Leaderboard({ onExit }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const today = getTodayKstDateString();

  useEffect(() => {
    let cancelled = false;
    supabase.from("daily_challenge_scores").select("*").eq("challenge_date", today)
      .order("score", { ascending: false }).order("duration_seconds", { ascending: true })
      .limit(50).then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError("랭킹을 불러오지 못했어요.");
        else setRows(data);
      });
    return () => { cancelled = true; };
  }, [today]);

  return <main className="app">
    <header className="title">
      <h1><span>랭킹</span></h1>
      <p className="subtitle">오늘의 챌린지 순위 · {today}</p>
    </header>
    <div className="card leaderboard-card">
      {error && <p className="form-error" role="alert">{error}</p>}
      {!error && !rows && <p>불러오는 중...</p>}
      {!error && rows && rows.length === 0 && <p>아직 오늘 참여한 기록이 없어요.</p>}
      {!error && rows && rows.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr><th>순위</th><th>이름</th><th>점수</th><th>AI 점수</th><th>시간</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.score}</td>
                <td>{row.opponent_score}</td>
                <td>{row.duration_seconds}초</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    <button type="button" onClick={onExit}>홈으로</button>
  </main>;
}
