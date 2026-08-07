import { useLocale } from "../i18n/LocaleContext.js";

export default function RulesDialog({ onClose }) {
  const { t } = useLocale();
  const rules = ["rule1", "rule2", "rule3", "rule4", "rule5", "rule6", "rule7"];
  return <div className="overlay show"><div className="dialog-box rules-box">
    <h2>{t("howToPlay")}</h2>
    <div className="rules-content">
      {rules.map((key, index) => <span key={key}>{t(key)}{index < rules.length - 1 && <br />}</span>)}
    </div>
    <button type="button" onClick={onClose}>{t("close")}</button>
  </div></div>;
}
