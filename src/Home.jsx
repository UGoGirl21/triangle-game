import { useState } from "react";
import App from "./App.jsx";
import DailyChallenge from "./DailyChallenge.jsx";
import OnlineGame from "./online/OnlineGame.jsx";
import Leaderboard from "./Leaderboard.jsx";
import ShareButton from "./components/ShareButton.jsx";

export default function Home() {
  const [screen, setScreen] = useState("local");

  let content;
  if (screen === "online") content = <OnlineGame onExit={() => setScreen("local")} />;
  else if (screen === "leaderboard") content = <Leaderboard onExit={() => setScreen("local")} />;
  else if (screen === "daily") content = <DailyChallenge onNavigate={setScreen} onExit={() => setScreen("local")} />;
  else content = <App onNavigate={setScreen} />;

  return <>
    {content}
    <ShareButton />
  </>;
}
