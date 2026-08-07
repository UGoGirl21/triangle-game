import { useLocale } from "../i18n/LocaleContext.js";

export default function WinnerDialog({ message, onPlayAgain }) {
  const { t } = useLocale();
  return <div className="overlay show"><div className="dialog-box winner-box">
    <h2>{t("winnerDialogTitle")}</h2><p>{t("winnerDialogBody", { message })}</p>
    <button type="button" onClick={onPlayAgain}>{t("playAgain")}</button>
  </div></div>;
}
