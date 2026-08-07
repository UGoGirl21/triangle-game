import { useState } from "react";
import { COLOR_OPTIONS, SYMBOL_OPTIONS } from "../game/constants.js";
import { useLocale } from "../i18n/LocaleContext.js";

export default function SettingsDialog({ players, difficulty, onSave, onClose }) {
  const { t } = useLocale();
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
    if (!clean[1].name || !clean[1].symbol || !clean[2].name || !clean[2].symbol) return setError(t("errorNamesRequired"));
    if (clean[1].symbol === clean[2].symbol) return setError(t("errorSymbolDuplicate"));
    if (clean[1].color === clean[2].color) return setError(t("errorColorDuplicate"));
    const colorInfo = { 1: COLOR_OPTIONS.find((c) => c.color === clean[1].color), 2: COLOR_OPTIONS.find((c) => c.color === clean[2].color) };
    onSave({
      1: { ...clean[1], dark: colorInfo[1].dark },
      2: { ...clean[2], dark: colorInfo[2].dark },
    }, selectedDifficulty);
  }

  return <div className="overlay show"><form className="dialog-box setup-box" onSubmit={submit}>
    <h2>{t("settingsButton")}</h2><p>{t("settingsDescription")}</p>
    <div className="team-fields">{[1, 2].map((player) => <fieldset key={player}>
      <legend>{player === 1 ? t("myTeamLegend") : t("aiTeamLegend")}</legend>
      <label>{t("teamNameLabel")}<input autoFocus={player === 1} maxLength="12" value={values[player].name} onChange={(e) => update(player, "name", e.target.value)} /></label>
      <label>{t("symbolLabel")}<select className="symbol-select" value={values[player].symbol} onChange={(e) => { setError(""); update(player, "symbol", e.target.value); }}>
        {SYMBOL_OPTIONS.map((option) => <option key={option.value} value={option.value} disabled={values[player === 1 ? 2 : 1].symbol === option.value}>{t(option.labelKey)}</option>)}
      </select></label>
      <label>{t("lineColorLabel")}
        <div className="color-options">
          {COLOR_OPTIONS.map((option) => {
            const taken = values[player === 1 ? 2 : 1].color === option.color;
            const selected = values[player].color === option.color;
            return <button type="button" key={option.key} title={t(option.labelKey)}
              className={`color-swatch${selected ? " selected" : ""}`}
              style={{ background: option.color }} disabled={taken}
              onClick={() => { setError(""); update(player, "color", option.color); }}
              aria-label={t(option.labelKey)} aria-pressed={selected} />;
          })}
        </div>
      </label>
    </fieldset>)}</div>
    <label className="setup-difficulty">{t("gameDifficultyLabel")}
      <select className="symbol-select" value={selectedDifficulty} onChange={(event) => setSelectedDifficulty(event.target.value)}>
        <option value="easy">{t("difficultyEasy")}</option>
        <option value="normal">{t("difficultyNormal")}</option>
        <option value="hard">{t("difficultyHard")}</option>
      </select>
    </label>
    <p className="form-error" role="alert">{error}</p>
    <button type="submit">{t("saveAndStart")}</button>
    <button type="button" onClick={onClose}>{t("cancel")}</button>
  </form></div>;
}
