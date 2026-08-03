import { useEffect, useMemo, useRef, useState } from "react";
import { LOGICAL_H, LOGICAL_W } from "../game/constants.js";
import { canConnect } from "../game/gameLogic.js";
import { drawGame } from "../game/drawGame.js";

export default function GameBoard({ state, players, disabled, onPick }) {
  const canvasRef = useRef(null);
  const pointerRef = useRef(null);
  const [hoveredDot, setHoveredDot] = useState(null);
  const preview = useMemo(() => state.selected !== null && hoveredDot !== null && hoveredDot !== state.selected
    ? { from: state.selected, to: hoveredDot, valid: canConnect(state, state.selected, hoveredDot) }
    : null, [hoveredDot, state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const logicalHeight = state.boardHeight || LOGICAL_H;
    let frame = 0;
    const render = (time = 0) => {
      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      if (canvas.width !== LOGICAL_W * dpr || canvas.height !== logicalHeight * dpr) {
        canvas.width = LOGICAL_W * dpr; canvas.height = logicalHeight * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const dotScale = window.matchMedia("(max-width: 800px)").matches ? 1.6 : 1;
      drawGame(ctx, state, players, time, preview, dotScale, logicalHeight);
      if (state.selected !== null) frame = requestAnimationFrame(render);
    };
    render();
    const redraw = () => render();
    window.addEventListener("resize", redraw);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("resize", redraw); };
  }, [state, players, preview]);

  function pointerPosition(event) {
    const rect = canvasRef.current.getBoundingClientRect();
    const logicalHeight = state.boardHeight || LOGICAL_H;
    return { x: (event.clientX - rect.left) * (LOGICAL_W / rect.width), y: (event.clientY - rect.top) * (logicalHeight / rect.height), rect };
  }

  function nearestDot(position, pointerType, rect) {
    const radius = pointerType === "mouse" ? 16 : 26 * (LOGICAL_W / rect.width);
    let best = -1; let bestDistance = radius ** 2;
    state.dots.forEach((dot, index) => {
      const distance = (dot.x - position.x) ** 2 + (dot.y - position.y) ** 2;
      if (distance < bestDistance) { bestDistance = distance; best = index; }
    });
    return best;
  }

  function handlePointerDown(event) {
    if (disabled || pointerRef.current) return;
    event.preventDefault();
    pointerRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerMove(event) {
    if (disabled || state.selected === null) {
      if (hoveredDot !== null) setHoveredDot(null);
      return;
    }
    const position = pointerPosition(event);
    const next = nearestDot(position, event.pointerType, position.rect);
    setHoveredDot(next === -1 ? null : next);
  }

  function handlePointerUp(event) {
    const start = pointerRef.current;
    if (!start || start.id !== event.pointerId) return;
    pointerRef.current = null;
    if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 12) return;
    const position = pointerPosition(event);
    onPick(nearestDot(position, event.pointerType, position.rect));
  }

  return <canvas ref={canvasRef} id="board" aria-label="삼각 땅따먹기 게임판"
    onPointerDown={handlePointerDown} onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}
    onPointerLeave={() => setHoveredDot(null)}
    onPointerCancel={() => { pointerRef.current = null; setHoveredDot(null); }} />;
}
