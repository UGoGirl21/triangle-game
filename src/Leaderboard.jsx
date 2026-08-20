import { useEffect, useState } from "react";
import { getTodayKstDateString } from "./game/dailyChallenge.js";
import { useLocale } from "./i18n/LocaleContext.js";
import { supabase } from "./lib/supabaseClient.js";

export default function Leaderboard({ onExit }) {
  const { t } = useLocale();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");
  const today = getTodayKstDateString();

  useEffect(() => {
    let cancelled = false;
    supabase.from("daily_challenge_scores").select("*").eq("challenge_date", today)
      .order("score", { ascending: false }).order("duration_seconds", { ascending: true })
      .limit(50).then(({ data, error: fetchError }) => {
        if (cancelled) return;
        if (fetchError) setError(t("leaderboardLoadError"));
        else setRows(data);
      });
    return () => { cancelled = true; };
  }, [today, t]);

  return <main className="app">
    <header className="title">
      <h1><span>{t("leaderboardTitle")}</span></h1>
      <p className="subtitle">{t("leaderboardSubtitle", { date: today })}</p>
    </header>
    <div className="card leaderboard-card">
      {error && <p className="form-error" role="alert">{error}</p>}
      {!error && !rows && <p>{t("loading")}</p>}
      {!error && rows && rows.length === 0 && <p>{t("noEntriesToday")}</p>}
      {!error && rows && rows.length > 0 && (
        <table className="leaderboard-table">
          <thead>
            <tr><th>{t("rankHeader")}</th><th>{t("nameHeader")}</th><th>{t("scoreHeader")}</th><th>{t("aiScoreHeader")}</th><th>{t("timeHeader")}</th></tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.id}>
                <td>{index + 1}</td>
                <td>{row.name}</td>
                <td>{row.score}</td>
                <td>{row.opponent_score}</td>
                <td>{t("secondsSuffix", { n: row.duration_seconds })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    <button type="button" onClick={onExit}>{t("home")}</button>
  </main>;
}
