import { useState } from "react";

const SYMBOL_OPTIONS = [
  { value: "★", label: "★ 별" },
  { value: "♥", label: "♥ 하트" },
  { value: "♠", label: "♠ 스페이드" },
  { value: "●", label: "● 동그라미" },
];

export default function SetupDialog({ players, difficulty, onStart }) {
  const [values, setValues] = useState(() => ({ 1: { name: players[1].name, symbol: players[1].symbol }, 2: { name: players[2].name, symbol: players[2].symbol } }));
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);
  const [error, setError] = useState("");
  const update = (player, field, value) => setValues((current) => ({ ...current, [player]: { ...current[player], [field]: value } }));
  function submit(event) {
    event.preventDefault();
    const clean = { 1: { name: values[1].name.trim(), symbol: values[1].symbol.trim() }, 2: { name: values[2].name.trim(), symbol: values[2].symbol.trim() } };
    if (!clean[1].name || !clean[1].symbol || !clean[2].name || !clean[2].symbol) return setError("두 팀의 이름과 기호를 모두 입력해주세요.");
    if (clean[1].symbol === clean[2].symbol) return setError("두 팀은 서로 다른 기호를 선택해주세요.");
    onStart(clean, selectedDifficulty);
  }
  return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submit}>
    <h2>팀을 정해주세요</h2><p>각 팀의 이름과 기호를 입력한 뒤 게임을 시작하세요.</p>
    <div className="team-fields">{[1, 2].map((player) => <fieldset key={player}>
      <legend>{player === 1 ? "내 팀" : "AI 팀"}</legend>
      <label>팀 이름<input autoFocus={player === 1} maxLength="12" value={values[player].name} onChange={(e) => update(player, "name", e.target.value)} /></label>
      <label>기호<select className="symbol-select" value={values[player].symbol} onChange={(e) => { setError(""); update(player, "symbol", e.target.value); }}>
        {SYMBOL_OPTIONS.map((option) => <option key={option.value} value={option.value} disabled={values[player === 1 ? 2 : 1].symbol === option.value}>{option.label}</option>)}
      </select></label>
    </fieldset>)}</div>
    <label className="setup-difficulty">게임 난이도
      <select className="symbol-select" value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
        <option value="easy">쉬움</option>
        <option value="normal">보통</option>
        <option value="hard">어려움</option>
      </select>
    </label>
    <p className="form-error" role="alert">{error}</p><button type="submit">게임 시작</button>
  </form></div>;
}
