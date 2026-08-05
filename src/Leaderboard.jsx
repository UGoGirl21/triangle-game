import { useEffect, useState } from "react";
import { supabase } from "./lib/supabaseClient.js";

export default function Leaderboard({ onExit }) {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    supabase.from("leaderboard").select("*").limit(50).then(({ data, error: fetchError }) => {
      if (cancelled) return;
      if (fetchError) setError("랭킹을 불러오지 못했어요.");
      else setRows(data);
    });
    return () => { cancelled = true; };
  }, []);

  return <main className="app">
    <header className="title">
      <h1><span>랭킹</span></h1>
      <p className="subtitle">온라인 대전 순위</p>
    </header>
    <div className="card leaderboard-card">
      {error && <p className="form-error" role="alert">{error}</p>}
      {!error && !rows && <p>불러오는 중...</p>}
      {!error && rows && rows.length === 0 && <p>아직 기록이 없어요.</p>}
      {!error && rows && rows.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr><th>순위</th><th>이름</th><th>승리</th><th>전적</th><th>승률</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.name}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.wins}</td>
                <td>{row.games_played}</td>
                <td>{row.win_rate === null ? "-" : `${row.win_rate}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    <button type="button" onClick={onExit}>홈으로</button>
  </main>;
}
