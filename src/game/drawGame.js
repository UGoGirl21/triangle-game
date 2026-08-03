import { LOGICAL_H, LOGICAL_W } from "./constants.js";
import { edgeKey } from "./geometry.js";

function hash(a, b) {
  let h = (a * 374761393 + b * 668265263) ^ (a * 2654435761);
  h = (h ^ (h >>> 13)) * 1274126177;
  h ^= h >>> 16;
  return ((h >>> 0) % 1000) / 1000;
}

function drawTriangle(ctx, state, players, triangle) {
  const a = state.dots[triangle.a];
  const b = state.dots[triangle.b];
  const c = state.dots[triangle.c];
  const player = players[triangle.player];
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.lineTo(c.x, c.y); ctx.closePath();
  ctx.clip();
  ctx.globalAlpha = 0.16; ctx.fillStyle = player.color; ctx.fill();
  ctx.globalAlpha = 0.35; ctx.strokeStyle = player.color; ctx.lineWidth = 1;
  const minX = Math.min(a.x, b.x, c.x); const maxX = Math.max(a.x, b.x, c.x);
  const minY = Math.min(a.y, b.y, c.y); const maxY = Math.max(a.y, b.y, c.y);
  ctx.beginPath();
  for (let x = minX - (maxY - minY); x < maxX + (maxY - minY); x += 7) {
    ctx.moveTo(x, minY); ctx.lineTo(x + maxY - minY, maxY);
  }
  ctx.stroke(); ctx.restore();
  ctx.save();
  ctx.translate((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
  ctx.rotate((hash(triangle.a, triangle.b) - 0.5) * 0.5);
  ctx.globalAlpha = 0.85; ctx.fillStyle = player.dark;
  ctx.font = "700 15px 'Gowun Dodum', sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  ctx.fillText(`${player.symbol}${triangle.seq}`, 0, 0); ctx.restore();
}

function drawEdge(ctx, state, players, edge) {
  const p1 = state.dots[edge.a]; const p2 = state.dots[edge.b];
  const isLast = state.lastMoveKey === edgeKey(edge.a, edge.b);
  ctx.save();
  ctx.strokeStyle = isLast ? "#ffe600" : players[edge.player].color;
  ctx.lineWidth = isLast ? 3.4 : 2.4; ctx.lineCap = "round";
  if (isLast) { ctx.shadowColor = "rgba(255,230,0,.7)"; ctx.shadowBlur = 6; }
  ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke(); ctx.restore();
}

function drawPreview(ctx, state, players, preview) {
  if (!preview) return;
  const p1 = state.dots[preview.from];
  const p2 = state.dots[preview.to];
  ctx.save();
  ctx.strokeStyle = preview.valid ? players[state.currentPlayer].color : "#85827a";
  ctx.lineWidth = preview.valid ? 2.6 : 2.2;
  ctx.globalAlpha = preview.valid ? 0.82 : 0.9;
  ctx.setLineDash(preview.valid ? [10, 7] : [6, 7]);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(p2.x, p2.y, 10, 0, Math.PI * 2);
  ctx.strokeStyle = preview.valid ? players[state.currentPlayer].color : "#77746d";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

export function drawGame(ctx, state, players, pulseTime = 0, preview = null) {
  ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
  state.claimed.forEach((triangle) => drawTriangle(ctx, state, players, triangle));
  state.edges.forEach((edge) => drawEdge(ctx, state, players, edge));
  drawPreview(ctx, state, players, preview);
  state.dots.forEach((dot, index) => {
    ctx.save();
    if (state.selected === index) {
      const pulse = 6 + Math.sin(pulseTime / 220) * 2.4;
      ctx.beginPath(); ctx.arc(dot.x, dot.y, 9 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = players[state.currentPlayer].color; ctx.lineWidth = 2; ctx.globalAlpha = 0.55; ctx.stroke();
    }
    ctx.globalAlpha = 1; ctx.beginPath(); ctx.arc(dot.x, dot.y, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#522817"; ctx.fill(); ctx.restore();
  });
}
