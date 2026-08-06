import { useState } from "react";
import App from "./App.jsx";
import DailyChallenge from "./DailyChallenge.jsx";
import OnlineGame from "./online/OnlineGame.jsx";
import Leaderboard from "./Leaderboard.jsx";

export default function Home() {
  const [screen, setScreen] = useState("local");

  if (screen === "online") return <OnlineGame onExit={() => setScreen("local")} />;
  if (screen === "leaderboard") return <Leaderboard onExit={() => setScreen("local")} />;
  if (screen === "daily") return <DailyChallenge onNavigate={setScreen} onExit={() => setScreen("local")} />;
  return <App onNavigate={setScreen} />;
}
