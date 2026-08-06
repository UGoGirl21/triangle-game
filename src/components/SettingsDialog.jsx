import { useState } from "react";
import { COLOR_OPTIONS, SYMBOL_OPTIONS } from "../game/constants.js";

export default function SettingsDialog({ players, difficulty, onSave, onClose }) {
  const [values, setValues] = useState(() => ({
    1: { name: players[1].name, symbol: players[1].symbol, color: players[1].color },
    2: { name: players[2].name, symbol: players[2].symbol, color: players[2].color },
  }));
  const [selectedDifficulty, setSelectedDifficulty] = useState(difficulty);
  const [error, setError] = useState("");
  const update = (player, field, value) => setValues((current) => ({ ...current, [player]: { ...current[player], [field]: value } }));

  function submit(event) {
    event.preventDefault();
    const clean = {
      1: { name: values[1].name.trim(), symbol: values[1].symbol.trim(), color: values[1].color },
      2: { name: values[2].name.trim(), symbol: values[2].symbol.trim(), color: values[2].color },
    };
    if (!clean[1].name || !clean[1].symbol || !clean[2].name || !clean[2].symbol) return setError("두 팀의 이름과 기호를 모두 입력해주세요.");
    if (clean[1].symbol === clean[2].symbol) return setError("두 팀은 서로 다른 기호를 선택해주세요.");
    if (clean[1].color === clean[2].color) return setError("두 팀은 서로 다른 선 색깔을 선택해주세요.");
    const colorInfo = { 1: COLOR_OPTIONS.find((c) => c.color === clean[1].color), 2: COLOR_OPTIONS.find((c) => c.color === clean[2].color) };
    onSave({
      1: { ...clean[1], dark: colorInfo[1].dark },
      2: { ...clean[2], dark: colorInfo[2].dark },
    }, selectedDifficulty);
  }

  return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submit}>
    <h2>설정</h2><p>팀 이름과 기호, 선 색깔을 바꾸고 새 게임을 시작하세요.</p>
    <div className="team-fields">{[1, 2].map((player) => <fieldset key={player}>
      <legend>{player === 1 ? "내 팀" : "AI 팀"}</legend>
      <label>팀 이름<input autoFocus={player === 1} maxLength="12" value={values[player].name} onChange={(e) => update(player, "name", e.target.value)} /></label>
      <label>기호<select className="symbol-select" value={values[player].symbol} onChange={(e) => { setError(""); update(player, "symbol", e.target.value); }}>
        {SYMBOL_OPTIONS.map((option) => <option key={option.value} value={option.value} disabled={values[player === 1 ? 2 : 1].symbol === option.value}>{option.label}</option>)}
      </select></label>
      <label>선 색깔
        <div className="color-options">
          {COLOR_OPTIONS.map((option) => {
            const taken = values[player === 1 ? 2 : 1].color === option.color;
            const selected = values[player].color === option.color;
            return <button type="button" key={option.key} title={option.label}
              className={`color-swatch${selected ? " selected" : ""}`}
              style={{ background: option.color }} disabled={taken}
              onClick={() => { setError(""); update(player, "color", option.color); }}
              aria-label={option.label} aria-pressed={selected} />;
          })}
        </div>
      </label>
    </fieldset>)}</div>
    <label className="setup-difficulty">게임 난이도
      <select className="symbol-select" value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
        <option value="easy">쉬움</option>
        <option value="normal">보통</option>
        <option value="hard">어려움</option>
      </select>
    </label>
    <p className="form-error" role="alert">{error}</p>
    <button type="submit">저장하고 새 게임 시작</button>
    <button type="button" onClick={onClose}>취소</button>
  </form></div>;
}
