import { useEffect, useRef, useState } from "react";
import { TURN_TIME_LIMIT_SECONDS } from "./game/constants.js";

export function useTurnTimer(active, resetKey, onTimeout) {
  const [timeLeft, setTimeLeft] = useState(null);
  const onTimeoutRef = useRef(onTimeout);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    if (!active) {
      const clear = window.setTimeout(() => setTimeLeft(null), 0);
      return () => window.clearTimeout(clear);
    }
    let secondsLeft = TURN_TIME_LIMIT_SECONDS;
    const start = window.setTimeout(() => setTimeLeft(secondsLeft), 0);
    const interval = window.setInterval(() => {
      secondsLeft -= 1;
      if (secondsLeft <= 0) {
        window.clearInterval(interval);
        setTimeLeft(null);
        onTimeoutRef.current();
        return;
      }
      setTimeLeft(secondsLeft);
    }, 1000);
    return () => {
      window.clearTimeout(start);
      window.clearInterval(interval);
    };
  }, [active, resetKey]);

  return timeLeft;
}
