(() => {
  "use strict";

  const canvas = document.getElementById("board");
  const ctx = canvas.getContext("2d");
  const toastEl = document.getElementById("toast");
  const scoreEls = { 1: document.getElementById("score1"), 2: document.getElementById("score2") };
  const playerCards = { 1: document.getElementById("p1card"), 2: document.getElementById("p2card") };
  const nameEls = { 1: document.getElementById("name1"), 2: document.getElementById("name2") };
  const symbolEls = { 1: document.getElementById("symbol1"), 2: document.getElementById("symbol2") };
  const turnLabel = document.getElementById("turnLabel");
  const setupOverlay = document.getElementById("setupOverlay");
  const setupForm = document.getElementById("setupForm");
  const formError = document.getElementById("formError");
  const winnerOverlay = document.getElementById("winnerOverlay");
  const winnerText = document.getElementById("winnerText");
  const difficultySelect = document.getElementById("difficultySelect");

  const PLAYERS = {
    1: { name: "잉크팀", symbol: "★", color: "#2d4373", dark: "#1c2c4d" },
    2: { name: "산호팀", symbol: "♥", color: "#b5502f", dark: "#7d341c" }
  };

  const LOGICAL_W = 960;
  const LOGICAL_H = 720;
  const DOT_COUNT = 50;
  const MIN_DIST = 55;
  const MOUSE_HIT_RADIUS = 16;
  const TOUCH_HIT_RADIUS_CSS = 26;

  let dots = [];
  let edges = new Map();
  let claimed = new Map();
  let currentPlayer = 1;
  let selected = null;
  let scores = { 1: 0, 2: 0 };
  let gameOver = true;
  let toastTimer = null;
  let pulseTime = 0;
  let activePointerId = null;
  let pointerStart = null;
  const mode = "ai";
  let difficulty = "normal";
  let aiThinking = false;
  let aiTimer = null;
  let lastMoveKey = null;

  const edgeKey = (a, b) => a < b ? `${a}-${b}` : `${b}-${a}`;
  const triKey = (a, b, c) => [a, b, c].sort((x, y) => x - y).join("-");

  function playerDisplayName(player) {
    return player === 2 ? `${PLAYERS[player].name} (AI)` : PLAYERS[player].name;
  }

  function hash(a, b) {
    let h = (a * 374761393 + b * 668265263) ^ (a * 2654435761);
    h = (h ^ (h >>> 13)) * 1274126177;
    h ^= h >>> 16;
    return ((h >>> 0) % 1000) / 1000;
  }

  function setupHiDPI() {
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = LOGICAL_W * dpr;
    canvas.height = LOGICAL_H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function generateDots() {
    const points = [];
    const margin = 36;
    let attempts = 0;
    while (points.length < DOT_COUNT && attempts < 20000) {
      attempts++;
      const x = margin + Math.random() * (LOGICAL_W - margin * 2);
      const y = margin + Math.random() * (LOGICAL_H - margin * 2);
      if (points.every((point) => (point.x - x) ** 2 + (point.y - y) ** 2 >= MIN_DIST ** 2)) {
        points.push({ x, y });
      }
    }
    return points;
  }

  function resetGame() {
    clearTimeout(aiTimer);
    aiTimer = null;
    aiThinking = false;
    dots = generateDots();
    edges = new Map();
    claimed = new Map();
    currentPlayer = 1;
    selected = null;
    scores = { 1: 0, 2: 0 };
    gameOver = false;
    lastMoveKey = null;
    winnerOverlay.classList.remove("show");
    updateScoreUI();
    draw();
  }

  function openSetup() {
    clearTimeout(aiTimer);
    aiTimer = null;
    aiThinking = false;
    selected = null;
    gameOver = true;
    winnerOverlay.classList.remove("show");
    setupOverlay.classList.add("show");
    document.getElementById("team1Name").value = PLAYERS[1].name;
    document.getElementById("team1Symbol").value = PLAYERS[1].symbol;
    document.getElementById("team2Name").value = PLAYERS[2].name;
    document.getElementById("team2Symbol").value = PLAYERS[2].symbol;
    formError.textContent = "";
    requestAnimationFrame(() => document.getElementById("team1Name").focus());
    updateScoreUI();
    draw();
  }

  function orient(p, q, r) {
    const value = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    return Math.abs(value) < 1e-7 ? 0 : value > 0 ? 1 : -1;
  }

  function onSegment(p, q, r) {
    return Math.min(p.x, r.x) - 1e-6 <= q.x && q.x <= Math.max(p.x, r.x) + 1e-6 &&
      Math.min(p.y, r.y) - 1e-6 <= q.y && q.y <= Math.max(p.y, r.y) + 1e-6;
  }

  function segmentsIntersect(p1, p2, p3, p4) {
    const o1 = orient(p1, p2, p3);
    const o2 = orient(p1, p2, p4);
    const o3 = orient(p3, p4, p1);
    const o4 = orient(p3, p4, p2);
    if (o1 !== o2 && o3 !== o4) return true;
    return (o1 === 0 && onSegment(p1, p3, p2)) || (o2 === 0 && onSegment(p1, p4, p2)) ||
      (o3 === 0 && onSegment(p3, p1, p4)) || (o4 === 0 && onSegment(p3, p2, p4));
  }

  function pointInTriangle(point, a, b, c) {
    const directions = [orient(point, a, b), orient(point, b, c), orient(point, c, a)];
    return !(directions.some((value) => value < 0) && directions.some((value) => value > 0));
  }

  function edgeCrossesAny(i, j) {
    const p1 = dots[i];
    const p2 = dots[j];
    for (const edge of edges.values()) {
      if ([edge.a, edge.b].includes(i) || [edge.a, edge.b].includes(j)) continue;
      if (segmentsIntersect(p1, p2, dots[edge.a], dots[edge.b])) return true;
    }
    return false;
  }

  function canConnect(i, j) {
    return i !== j && !edges.has(edgeKey(i, j)) && !edgeCrossesAny(i, j);
  }

  function anyMovesLeft() {
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        if (canConnect(i, j)) return true;
      }
    }
    return false;
  }

  function tryClaimTriangles(a, b) {
    const found = [];
    for (let c = 0; c < dots.length; c++) {
      if (c === a || c === b || !edges.has(edgeKey(a, c)) || !edges.has(edgeKey(b, c))) continue;
      const key = triKey(a, b, c);
      if (claimed.has(key)) continue;
      const hasPointInside = dots.some((point, k) =>
        k !== a && k !== b && k !== c && pointInTriangle(point, dots[a], dots[b], dots[c])
      );
      if (!hasPointInside) found.push([a, b, c]);
    }
    return found;
  }

  function pointerPosition(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) * (LOGICAL_W / rect.width),
      y: (event.clientY - rect.top) * (LOGICAL_H / rect.height)
    };
  }

  function nearestDot(position, pointerType) {
    const rect = canvas.getBoundingClientRect();
    const radius = pointerType === "mouse"
      ? MOUSE_HIT_RADIUS
      : TOUCH_HIT_RADIUS_CSS * (LOGICAL_W / rect.width);
    let best = -1;
    let bestDistance = radius ** 2;
    dots.forEach((dot, index) => {
      const distance = (dot.x - position.x) ** 2 + (dot.y - position.y) ** 2;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = index;
      }
    });
    return best;
  }

  function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 1400);
  }

  function handlePick(index) {
    if (gameOver || aiThinking || index === -1) {
      selected = null;
      draw();
      return;
    }
    if (mode === "ai" && currentPlayer === 2) return;
    if (selected === null) {
      selected = index;
      draw();
      return;
    }
    if (selected === index) {
      selected = null;
      draw();
      return;
    }

    const a = selected;
    const b = index;
    if (edges.has(edgeKey(a, b))) {
      showToast("이미 연결된 선이에요");
      selected = null;
      draw();
      return;
    }
    if (edgeCrossesAny(a, b)) {
      showToast("다른 선과 겹칠 수 없어요");
      selected = null;
      draw();
      return;
    }

    selected = null;
    const result = applyEdge(a, b);
    if (!result.ended) maybeTriggerAI();
  }

  function applyEdge(a, b) {
    edges.set(edgeKey(a, b), { a, b, player: currentPlayer });
    lastMoveKey = edgeKey(a, b);
    const wins = tryClaimTriangles(a, b);
    wins.forEach(([x, y, z]) => {
      scores[currentPlayer]++;
      claimed.set(triKey(x, y, z), { a: x, b: y, c: z, player: currentPlayer, seq: scores[currentPlayer] });
    });
    updateScoreUI();

    if (!anyMovesLeft()) {
      finishGame();
      draw();
      return { captured: wins.length, ended: true };
    } else if (wins.length) {
      showToast(`${playerDisplayName(currentPlayer)} 땅 획득! 한 번 더 그으세요`);
    } else {
      currentPlayer = currentPlayer === 1 ? 2 : 1;
      updateScoreUI();
    }
    draw();
    return { captured: wins.length, ended: false };
  }

  function finishGame() {
    gameOver = true;
    aiThinking = false;
    clearTimeout(aiTimer);
    aiTimer = null;
    const message = scores[1] === scores[2]
      ? "무승부입니다!"
      : `${playerDisplayName(scores[1] > scores[2] ? 1 : 2)} 승리! (${scores[1]} : ${scores[2]})`;
    winnerText.textContent = `${message} 더 그을 수 있는 선이 없습니다.`;
    winnerOverlay.classList.add("show");
    updateScoreUI();
  }

  function getLegalMoves() {
    const moves = [];
    for (let i = 0; i < dots.length; i++) {
      for (let j = i + 1; j < dots.length; j++) {
        if (canConnect(i, j)) moves.push([i, j]);
      }
    }
    return moves;
  }

  function triangleEdgeCount(x, y, z, extraEdge) {
    const hasEdge = (a, b) => edges.has(edgeKey(a, b)) ||
      (extraEdge && edgeKey(extraEdge[0], extraEdge[1]) === edgeKey(a, b));
    return Number(hasEdge(x, y)) + Number(hasEdge(y, z)) + Number(hasEdge(x, z));
  }

  function triangleHasInteriorPoint(x, y, z) {
    return dots.some((point, index) =>
      index !== x && index !== y && index !== z &&
      pointInTriangle(point, dots[x], dots[y], dots[z])
    );
  }

  function countCapturesForMove(a, b) {
    let count = 0;
    for (let c = 0; c < dots.length; c++) {
      if (c === a || c === b || claimed.has(triKey(a, b, c))) continue;
      if (triangleEdgeCount(a, b, c, [a, b]) === 3 && !triangleHasInteriorPoint(a, b, c)) count++;
    }
    return count;
  }

  function isUnsafeMove(a, b) {
    for (let c = 0; c < dots.length; c++) {
      if (c === a || c === b || claimed.has(triKey(a, b, c))) continue;
      if (triangleEdgeCount(a, b, c, [a, b]) === 2 && !triangleHasInteriorPoint(a, b, c)) return true;
    }
    return false;
  }

  function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function aiChooseMove() {
    const moves = getLegalMoves();
    if (!moves.length) return null;

    const scoredMoves = moves.map(([a, b]) => ({ a, b, captures: countCapturesForMove(a, b) }));
    const completingMoves = scoredMoves.filter((move) => move.captures > 0);

    if (difficulty === "easy") {
      if (completingMoves.length && Math.random() < 0.6) {
        const bestScore = Math.max(...completingMoves.map((move) => move.captures));
        const move = randomItem(completingMoves.filter((item) => item.captures === bestScore));
        return [move.a, move.b];
      }
      return randomItem(moves);
    }

    if (completingMoves.length) {
      const bestScore = Math.max(...completingMoves.map((move) => move.captures));
      const move = randomItem(completingMoves.filter((item) => item.captures === bestScore));
      return [move.a, move.b];
    }

    if (difficulty === "normal") {
      if (Math.random() < 0.5) return randomItem(moves);
      const safeMoves = moves.filter(([a, b]) => !isUnsafeMove(a, b));
      return randomItem(safeMoves.length ? safeMoves : moves);
    }

    const safeMoves = moves.filter(([a, b]) => !isUnsafeMove(a, b));
    if (safeMoves.length) return randomItem(safeMoves);

    if (moves.length <= 180) {
      let bestMove = null;
      let bestOpponentGain = Infinity;
      for (const [a, b] of moves) {
        const key = edgeKey(a, b);
        edges.set(key, { a, b, player: currentPlayer });
        let maximumGain = 0;
        for (let x = 0; x < dots.length; x++) {
          for (let y = x + 1; y < dots.length; y++) {
            if (canConnect(x, y)) maximumGain = Math.max(maximumGain, countCapturesForMove(x, y));
          }
        }
        edges.delete(key);
        if (maximumGain < bestOpponentGain) {
          bestOpponentGain = maximumGain;
          bestMove = [a, b];
        }
      }
      return bestMove || randomItem(moves);
    }
    return randomItem(moves);
  }

  function maybeTriggerAI() {
    if (mode !== "ai" || gameOver || currentPlayer !== 2) return;
    aiThinking = true;
    updateScoreUI();
    aiTimer = setTimeout(aiTakeTurn, 500 + Math.random() * 500);
  }

  function aiTakeTurn() {
    if (gameOver || mode !== "ai") {
      aiThinking = false;
      return;
    }
    const move = aiChooseMove();
    if (!move) {
      aiThinking = false;
      finishGame();
      return;
    }
    const result = applyEdge(move[0], move[1]);
    if (result.ended) {
      aiThinking = false;
    } else if (currentPlayer === 2) {
      aiTimer = setTimeout(aiTakeTurn, 500 + Math.random() * 400);
    } else {
      aiThinking = false;
      updateScoreUI();
    }
  }

  function updateScoreUI() {
    [1, 2].forEach((player) => {
      scoreEls[player].textContent = scores[player];
      nameEls[player].textContent = playerDisplayName(player);
      symbolEls[player].textContent = PLAYERS[player].symbol;
      playerCards[player].classList.toggle("active", currentPlayer === player && !gameOver);
    });
    turnLabel.textContent = gameOver
      ? (winnerOverlay.classList.contains("show") ? "게임 종료" : "게임 준비")
      : aiThinking ? "AI가 생각 중..." : `${playerDisplayName(currentPlayer)} 차례`;
  }

  function jitterControl(i, j) {
    const p1 = dots[i];
    const p2 = dots[j];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const length = Math.hypot(dx, dy) || 1;
    const amount = (hash(i, j) - .5) * 10;
    return { x: (p1.x + p2.x) / 2 - dy / length * amount, y: (p1.y + p2.y) / 2 + dx / length * amount };
  }

  function drawTriangleFill(triangle) {
    const a = dots[triangle.a];
    const b = dots[triangle.b];
    const c = dots[triangle.c];
    const player = PLAYERS[triangle.player];
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.lineTo(c.x, c.y);
    ctx.closePath();
    ctx.clip();
    ctx.globalAlpha = .16;
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.globalAlpha = .35;
    ctx.strokeStyle = player.color;
    ctx.lineWidth = 1;
    const minX = Math.min(a.x, b.x, c.x);
    const maxX = Math.max(a.x, b.x, c.x);
    const minY = Math.min(a.y, b.y, c.y);
    const maxY = Math.max(a.y, b.y, c.y);
    ctx.beginPath();
    for (let x = minX - (maxY - minY); x < maxX + (maxY - minY); x += 7) {
      ctx.moveTo(x, minY);
      ctx.lineTo(x + maxY - minY, maxY);
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate((a.x + b.x + c.x) / 3, (a.y + b.y + c.y) / 3);
    ctx.rotate((hash(triangle.a, triangle.b) - .5) * .5);
    ctx.globalAlpha = .85;
    ctx.fillStyle = player.dark;
    ctx.font = "700 15px 'Kalam', cursive";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`${player.symbol}${triangle.seq}`, 0, 0);
    ctx.restore();
  }

  function drawEdge(edge) {
    const p1 = dots[edge.a];
    const p2 = dots[edge.b];
    const control = jitterControl(edge.a, edge.b);
    const isLastMove = lastMoveKey === edgeKey(edge.a, edge.b);
    ctx.save();
    ctx.strokeStyle = isLastMove ? "#d9a83a" : PLAYERS[edge.player].color;
    ctx.lineWidth = isLastMove ? 3.4 : 2.4;
    ctx.lineCap = "round";
    if (isLastMove) {
      ctx.shadowColor = "rgba(217,168,58,.6)";
      ctx.shadowBlur = 6;
    }
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(control.x, control.y, p2.x, p2.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawDot(index) {
    const dot = dots[index];
    ctx.save();
    if (selected === index) {
      const pulse = 6 + Math.sin(pulseTime / 220) * 2.4;
      ctx.beginPath();
      ctx.arc(dot.x, dot.y, 9 + pulse, 0, Math.PI * 2);
      ctx.strokeStyle = PLAYERS[currentPlayer].color;
      ctx.lineWidth = 2;
      ctx.globalAlpha = .55;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, 4.2, 0, Math.PI * 2);
    ctx.fillStyle = "#3a3730";
    ctx.fill();
    ctx.restore();
  }

  function draw() {
    ctx.clearRect(0, 0, LOGICAL_W, LOGICAL_H);
    claimed.forEach(drawTriangleFill);
    edges.forEach(drawEdge);
    dots.forEach((_, index) => drawDot(index));
  }

  canvas.addEventListener("pointerdown", (event) => {
    if (gameOver || activePointerId !== null) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    pointerStart = { x: event.clientX, y: event.clientY };
    canvas.setPointerCapture?.(event.pointerId);
  });

  canvas.addEventListener("pointerup", (event) => {
    if (event.pointerId !== activePointerId) return;
    event.preventDefault();
    const moved = Math.hypot(event.clientX - pointerStart.x, event.clientY - pointerStart.y);
    activePointerId = null;
    pointerStart = null;
    if (moved <= 12) handlePick(nearestDot(pointerPosition(event), event.pointerType));
  });

  canvas.addEventListener("pointercancel", () => {
    activePointerId = null;
    pointerStart = null;
  });

  setupForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = {
      1: {
        name: document.getElementById("team1Name").value.trim(),
        symbol: document.getElementById("team1Symbol").value.trim()
      },
      2: {
        name: document.getElementById("team2Name").value.trim(),
        symbol: document.getElementById("team2Symbol").value.trim()
      }
    };
    if (!values[1].name || !values[1].symbol || !values[2].name || !values[2].symbol) {
      formError.textContent = "두 팀의 이름과 기호를 모두 입력해주세요.";
      return;
    }
    Object.assign(PLAYERS[1], values[1]);
    Object.assign(PLAYERS[2], values[2]);
    setupOverlay.classList.remove("show");
    resetGame();
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    selected = null;
    draw();
  });
  document.getElementById("newGameBtn").addEventListener("click", openSetup);
  document.getElementById("playAgainBtn").addEventListener("click", openSetup);
  difficultySelect.addEventListener("change", () => {
    difficulty = difficultySelect.value;
    resetGame();
  });

  function animationLoop(timestamp) {
    pulseTime = timestamp;
    if (selected !== null) draw();
    requestAnimationFrame(animationLoop);
  }

  setupHiDPI();
  dots = generateDots();
  updateScoreUI();
  draw();
  requestAnimationFrame(animationLoop);
  window.addEventListener("resize", () => {
    setupHiDPI();
    draw();
  });
})();
