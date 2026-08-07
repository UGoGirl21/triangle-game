import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Home from "./Home.jsx";
import LanguageToggle from "./components/LanguageToggle.jsx";
import { LocaleProvider } from "./i18n/LocaleProvider.jsx";
import "../style.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LocaleProvider>
      <LanguageToggle />
      <Home />
    </LocaleProvider>
  </StrictMode>,
);
