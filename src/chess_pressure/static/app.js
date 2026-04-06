/* Chess Pressure — main application */

(function () {
  "use strict";

  // --- State ---
  let gameData = null;       // {headers, moves, frames, result}
  let currentIndex = 0;      // which frame we're viewing
  let playing = false;
  let playTimer = null;
  let pressureMode = "equal"; // "equal" or "weighted"
  let board = null;
  let forkPoint = null;      // index where fork happened, null if on original line
  let originalData = null;   // saved original game before fork
  let forkedMoves = [];      // UCI moves made after fork point
  let showPieces = true;
  let showBoard = false;
  let selectedSquare = null;  // tap-to-move: currently selected source square
  let legalMoves = [];        // legal moves from selected square

  const PLAY_SPEED = 800;    // ms between auto-advance

  // --- Pressure colors ---
  function pressureColor(value, maxAbs) {
    if (value === 0 || maxAbs === 0) return "transparent";
    const intensity = Math.min(Math.abs(value) / maxAbs, 1);
    const alpha = 0.15 + intensity * 0.55;
    if (value > 0) return `rgba(50, 130, 220, ${alpha})`;  // blue = white
    return `rgba(220, 50, 50, ${alpha})`;                   // red = black
  }

  // --- Pressure rendering (applied directly to board squares) ---
  const FILES = "abcdefgh";

  const PRESSURE_SCALE = { equal: 5, weighted: 15 };

  function renderPressure(frame) {
    const key = pressureMode === "weighted" ? "pressure_weighted" : "pressure";
    const pressure = frame[key];
    const maxAbs = PRESSURE_SCALE[pressureMode];

    for (let rank = 1; rank <= 8; rank++) {
      for (let fileIdx = 0; fileIdx < 8; fileIdx++) {
        const sq = FILES[fileIdx] + rank;
        const pyIdx = (rank - 1) * 8 + fileIdx; // python-chess square index
        const el = document.querySelector(`[data-square="${sq}"]`);
        if (!el) continue;

        const val = pressure[pyIdx];
        const isLight = (rank + fileIdx) % 2 === 1;

        if (!showBoard) {
          // Pure pressure view — theme-aware neutral background
          const isDark = document.documentElement.dataset.theme !== "light";
          const neutral = isDark ? [26, 26, 26] : [245, 245, 245];
          if (val === 0) {
            el.style.backgroundColor = `rgb(${neutral[0]}, ${neutral[1]}, ${neutral[2]})`;
          } else {
            const intensity = Math.min(Math.abs(val) / maxAbs, 1);
            const alpha = 0.3 + intensity * 0.7;
            const tint = val > 0 ? [50, 130, 220] : [220, 50, 50];
            const base = neutral;
            const r = Math.round(base[0] * (1 - alpha) + tint[0] * alpha);
            const g = Math.round(base[1] * (1 - alpha) + tint[1] * alpha);
            const b = Math.round(base[2] * (1 - alpha) + tint[2] * alpha);
            el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          }
        } else {
          const base = isLight ? [192, 192, 192] : [120, 120, 120]; // grayscale
          if (val === 0) {
            el.style.backgroundColor = `rgb(${base[0]}, ${base[1]}, ${base[2]})`;
          } else {
            const intensity = Math.min(Math.abs(val) / maxAbs, 1);
            const alpha = 0.2 + intensity * 0.6;
            const tint = val > 0 ? [50, 130, 220] : [220, 50, 50];
            const r = Math.round(base[0] * (1 - alpha) + tint[0] * alpha);
            const g = Math.round(base[1] * (1 - alpha) + tint[1] * alpha);
            const b = Math.round(base[2] * (1 - alpha) + tint[2] * alpha);
            el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
          }
        }
      }
    }
  }

  // --- Move list ---
  // --- Tap-to-move ---
  function clearSelection() {
    selectedSquare = null;
    legalMoves = [];
    document.querySelectorAll(".square-selected, .square-target").forEach((el) => {
      el.classList.remove("square-selected", "square-target");
    });
  }

  function handleSquareClick(square) {
    if (!gameData) return;
    const frame = gameData.frames[currentIndex];
    const fen = frame.board.fen;

    if (selectedSquare) {
      // Check if this square is a legal target
      const uci = selectedSquare + square;
      const isTarget = legalMoves.some((m) => m === uci || m === uci + "q");
      if (isTarget) {
        // Make the move
        const moveUci = legalMoves.find((m) => m.startsWith(uci)) || uci;
        clearSelection();
        doMove(fen, moveUci);
        return;
      }
    }

    // Select a new piece (or deselect)
    if (square === selectedSquare) {
      clearSelection();
      return;
    }

    // Fetch legal moves for this square
    fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, uci: square + square }), // dummy — we just need to check if piece exists
    }).catch(() => {});

    // Check if there's a piece here by seeing if any legal move starts from this square
    // We need to ask the server for legal moves from this position
    fetch(`/api/legal?fen=${encodeURIComponent(fen)}`).then(r => r.ok ? r.json() : null).then(data => {
      if (!data) return;
      const fromMoves = data.filter((m) => m.startsWith(square));
      if (fromMoves.length === 0) {
        clearSelection();
        return;
      }
      clearSelection();
      selectedSquare = square;
      legalMoves = fromMoves;

      // Highlight
      const srcEl = document.querySelector(`[data-square="${square}"]`);
      if (srcEl) srcEl.classList.add("square-selected");
      fromMoves.forEach((m) => {
        const target = m.substring(2, 4);
        const el = document.querySelector(`[data-square="${target}"]`);
        if (el) el.classList.add("square-target");
      });
    });
  }

  function doMove(fen, uci) {
    fetch("/api/move", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fen, uci }),
    })
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        if (forkPoint === null && currentIndex < gameData.frames.length - 1) {
          originalData = JSON.parse(JSON.stringify(gameData));
          forkPoint = currentIndex;
          gameData.moves = gameData.moves.slice(0, currentIndex);
          gameData.frames = gameData.frames.slice(0, currentIndex + 1);
          forkedMoves = [];
        }
        gameData.moves.push({ san: data.san, uci: data.uci, ply: currentIndex + 1 });
        gameData.frames.push(data.frame);
        if (forkPoint !== null) forkedMoves.push(data.uci);
        goTo(gameData.frames.length - 1);
        updateForkUI();
      });
  }

  // --- Move list ---
  function renderMoveList() {
    const el = document.getElementById("move-list");
    if (!gameData || !gameData.moves.length) {
      el.innerHTML = '<span style="color:var(--fg2)">No moves</span>';
      return;
    }
    let html = "";
    for (let i = 0; i < gameData.moves.length; i += 2) {
      const num = Math.floor(i / 2) + 1;
      const w = gameData.moves[i];
      const b = gameData.moves[i + 1];
      const wClass = currentIndex === i + 1 ? "active" : "";
      const bClass = b && currentIndex === i + 2 ? "active" : "";
      const wForked = forkPoint !== null && i >= forkPoint ? " forked" : "";
      const bForked = forkPoint !== null && i + 1 >= forkPoint ? " forked" : "";
      html += `<div class="move-row">`;
      html += `<span class="move-num">${num}.</span>`;
      html += `<span class="move${wClass ? " " + wClass : ""}${wForked}" data-idx="${i + 1}">${w.san}</span>`;
      if (b) {
        html += `<span class="move${bClass ? " " + bClass : ""}${bForked}" data-idx="${i + 2}">${b.san}</span>`;
      }
      html += `</div>`;
    }
    el.innerHTML = html;

    // Scroll active into view within the move list only (not the page)
    const active = el.querySelector(".move.active");
    if (active) {
      const container = el;
      const top = active.offsetTop - container.offsetTop;
      const bottom = top + active.offsetHeight;
      if (top < container.scrollTop) {
        container.scrollTop = top;
      } else if (bottom > container.scrollTop + container.clientHeight) {
        container.scrollTop = bottom - container.clientHeight;
      }
    }

    // Click handlers
    el.querySelectorAll(".move[data-idx]").forEach((m) => {
      m.addEventListener("click", () => goTo(parseInt(m.dataset.idx)));
    });
  }

  // --- Navigation ---
  function goTo(index) {
    if (!gameData) return;
    index = Math.max(0, Math.min(index, gameData.frames.length - 1));
    currentIndex = index;
    const frame = gameData.frames[index];
    board.position(frame.board.fen, false);
    renderPressure(frame);
    renderMoveList();
    updateSlider();
    updateStatus(frame);
  }

  function updateSlider() {
    const slider = document.getElementById("slider");
    slider.max = gameData ? gameData.frames.length - 1 : 0;
    slider.value = currentIndex;
  }

  function updateStatus(frame) {
    const el = document.getElementById("status-bar");
    const b = frame.board;
    let text = b.turn === "w" ? "White to move" : "Black to move";
    if (b.is_checkmate) text = (b.turn === "w" ? "Black" : "White") + " wins by checkmate";
    else if (b.is_stalemate) text = "Stalemate";
    else if (b.is_check) text += " (check)";
    if (gameData.result && gameData.result !== "*") text += ` — ${gameData.result}`;
    text += ` | Move ${b.fullmove}`;
    el.textContent = text;
  }

  function updateGameInfo() {
    const el = document.getElementById("game-info");
    if (!gameData || !gameData.headers) {
      el.textContent = "";
      return;
    }
    const h = gameData.headers;
    const parts = [];
    if (h.White) parts.push(`${h.White} vs ${h.Black || "?"}`);
    if (h.Event) parts.push(h.Event);
    if (h.Date) parts.push(h.Date);
    el.textContent = parts.join(" — ");
  }

  // --- Playback ---
  function togglePlay() {
    playing = !playing;
    document.getElementById("btn-play").innerHTML = playing ? "&#9646;&#9646;" : "&#9654;";
    if (playing) {
      playTimer = setInterval(() => {
        if (currentIndex >= gameData.frames.length - 1) {
          togglePlay();
          return;
        }
        goTo(currentIndex + 1);
      }, PLAY_SPEED);
    } else {
      clearInterval(playTimer);
    }
  }

  // --- Interactive moves ---
  function onDrop(source, target) {
    if (source === target) {
      // Tap — treat as click-to-select/move
      handleSquareClick(source);
      return "snapback";
    }
    clearSelection();
    const frame = gameData.frames[currentIndex];
    const fen = frame.board.fen;
    let uci = source + target;
    // Auto-promote to queen for pawn reaching last rank
    const rank = target.charAt(1);
    const piece = frame.board.fen.split(" ")[0]; // just for checking
    if ((rank === "8" || rank === "1") && uci.length === 4) {
      uci += "q";
    }
    doMove(fen, uci);
    return "snapback";
  }

  function updateForkUI() {
    const el = document.getElementById("fork-controls");
    if (forkPoint !== null) {
      el.style.display = "flex";
      document.getElementById("fork-point").textContent = Math.floor(forkPoint / 2) + 1;
    } else {
      el.style.display = "none";
    }
  }

  function resetFork() {
    if (!originalData) return;
    gameData = originalData;
    originalData = null;
    forkPoint = null;
    forkedMoves = [];
    goTo(0);
    updateForkUI();
  }

  // --- Load game ---
  async function loadGame(gameId) {
    const r = await fetch(`/api/games/${gameId}`);
    if (!r.ok) return;
    gameData = await r.json();
    forkPoint = null;
    originalData = null;
    forkedMoves = [];
    currentIndex = 0;
    goTo(0);
    updateGameInfo();
    updateForkUI();
  }

  async function loadPGN(pgn) {
    const r = await fetch("/api/parse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pgn }),
    });
    if (!r.ok) {
      alert("Failed to parse PGN");
      return;
    }
    gameData = await r.json();
    forkPoint = null;
    originalData = null;
    forkedMoves = [];
    currentIndex = 0;
    goTo(0);
    updateGameInfo();
    updateForkUI();
    document.getElementById("game-select").value = "";
  }

  // --- Init ---
  async function init() {
    // Build board
    board = Chessboard("board", {
      draggable: true,
      position: "start",
      pieceTheme: "/static/img/chesspieces/wikipedia/{piece}.png",
      onDrop: onDrop,
    });

    // Tap destination squares (onDrop only fires on pieces, not empty squares)
    document.getElementById("board").addEventListener("click", (e) => {
      if (!selectedSquare) return;
      const sqEl = e.target.closest("[data-square]");
      if (sqEl) handleSquareClick(sqEl.dataset.square);
    });

    // Restore theme before first render
    const saved = localStorage.getItem("theme");
    if (saved) document.documentElement.dataset.theme = saved;

    // Load game list
    const r = await fetch("/api/games");
    const games = await r.json();
    const select = document.getElementById("game-select");
    games.forEach((g) => {
      const opt = document.createElement("option");
      opt.value = g.id;
      opt.textContent = g.name;
      select.appendChild(opt);
    });

    // Load first game by default
    if (games.length) {
      await loadGame(games[0].id);
      select.value = games[0].id;
    }

    // Show board after first render (prevents tan flash)
    document.getElementById("board").classList.add("ready");

    // --- Event listeners ---
    select.addEventListener("change", (e) => {
      if (e.target.value === "__new") {
        loadPGN('[White "You"]\n[Black "Opponent"]\n[Result "*"]\n\n*');
      } else if (e.target.value) {
        loadGame(e.target.value);
      }
    });

    document.getElementById("slider").addEventListener("input", (e) => {
      goTo(parseInt(e.target.value));
    });

    document.getElementById("btn-start").addEventListener("click", () => goTo(0));
    document.getElementById("btn-prev").addEventListener("click", () => goTo(currentIndex - 1));
    document.getElementById("btn-play").addEventListener("click", togglePlay);
    document.getElementById("btn-next").addEventListener("click", () => goTo(currentIndex + 1));
    document.getElementById("btn-end").addEventListener("click", () =>
      goTo(gameData ? gameData.frames.length - 1 : 0)
    );

    document.querySelectorAll('input[name="pmode"]').forEach((r) => {
      r.addEventListener("change", (e) => {
        pressureMode = e.target.value;
        if (gameData) renderPressure(gameData.frames[currentIndex]);
      });
    });

    document.getElementById("toggle-pieces").addEventListener("change", (e) => {
      showPieces = e.target.checked;
      document.getElementById("board").classList.toggle("hide-pieces", !showPieces);
    });

    document.getElementById("toggle-board").addEventListener("change", (e) => {
      showBoard = e.target.checked;
      if (gameData) renderPressure(gameData.frames[currentIndex]);
    });

    document.getElementById("theme-toggle").addEventListener("click", () => {
      const html = document.documentElement;
      html.dataset.theme = html.dataset.theme === "dark" ? "light" : "dark";
      localStorage.setItem("theme", html.dataset.theme);
      if (gameData) renderPressure(gameData.frames[currentIndex]);
    });

    // PGN upload dialog
    const dialog = document.getElementById("pgn-dialog");
    document.getElementById("btn-upload").addEventListener("click", () => dialog.showModal());
    document.getElementById("pgn-cancel").addEventListener("click", () => dialog.close());
    document.getElementById("pgn-file-btn").addEventListener("click", () =>
      document.getElementById("pgn-file").click()
    );
    document.getElementById("pgn-file").addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          document.getElementById("pgn-input").value = ev.target.result;
        };
        reader.readAsText(file);
      }
    });
    document.getElementById("pgn-submit").addEventListener("click", () => {
      const pgn = document.getElementById("pgn-input").value.trim();
      if (pgn) {
        loadPGN(pgn);
        dialog.close();
      }
    });

    // Fork reset
    document.getElementById("btn-reset-fork").addEventListener("click", resetFork);

    // GIF export
    const exportDialog = document.getElementById("export-dialog");
    document.getElementById("btn-export").addEventListener("click", () => exportDialog.showModal());
    document.getElementById("export-cancel").addEventListener("click", () => exportDialog.close());
    document.getElementById("export-go").addEventListener("click", exportGif);

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.target.tagName === "TEXTAREA" || e.target.tagName === "INPUT") return;
      if (e.key === "ArrowLeft") goTo(currentIndex - 1);
      else if (e.key === "ArrowRight") goTo(currentIndex + 1);
      else if (e.key === "Home") goTo(0);
      else if (e.key === "End") goTo(gameData ? gameData.frames.length - 1 : 0);
      else if (e.key === " ") { e.preventDefault(); togglePlay(); }
    });

    // Responsive board resize
    // Re-apply pressure after any board redraw (resize, scroll zoom, etc.)
    window.addEventListener("resize", () => {
      board.resize();
      if (gameData) renderPressure(gameData.frames[currentIndex]);
    });

    // Catch chessboard.js redraws that reset square colors (e.g. scroll-triggered resize)
    const boardEl = document.getElementById("board");
    let repaintTimer = null;
    const observer = new MutationObserver(() => {
      if (repaintTimer) return;
      repaintTimer = setTimeout(() => {
        repaintTimer = null;
        if (gameData) renderPressure(gameData.frames[currentIndex]);
      }, 50);
    });
    observer.observe(boardEl, { childList: true, subtree: true });

    // Prevent board touch events from scrolling the page
    boardEl.addEventListener("touchstart", (e) => { e.stopPropagation(); }, { passive: false });
    boardEl.addEventListener("touchmove", (e) => { e.preventDefault(); e.stopPropagation(); }, { passive: false });
  }

  // --- GIF Export ---
  const EXPORT_SIZE = 480;
  const SQ = EXPORT_SIZE / 8;
  let pieceImages = {};

  function loadPieceImages() {
    const pieces = ["wK","wQ","wR","wB","wN","wP","bK","bQ","bR","bB","bN","bP"];
    const promises = pieces.map((p) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { pieceImages[p] = img; resolve(); };
      img.onerror = () => resolve();
      img.src = `/static/img/chesspieces/wikipedia/${p}.png`;
    }));
    return Promise.all(promises);
  }

  function computeSquareColor(val, maxAbs, rank, fileIdx) {
    const isDark = document.documentElement.dataset.theme !== "light";
    const isLight = (rank + fileIdx) % 2 === 1;

    if (!showBoard) {
      const neutral = isDark ? [26, 26, 26] : [245, 245, 245];
      if (val === 0) return `rgb(${neutral[0]},${neutral[1]},${neutral[2]})`;
      const intensity = Math.min(Math.abs(val) / maxAbs, 1);
      const alpha = 0.3 + intensity * 0.7;
      const tint = val > 0 ? [50, 130, 220] : [220, 50, 50];
      const r = Math.round(neutral[0] * (1 - alpha) + tint[0] * alpha);
      const g = Math.round(neutral[1] * (1 - alpha) + tint[1] * alpha);
      const b = Math.round(neutral[2] * (1 - alpha) + tint[2] * alpha);
      return `rgb(${r},${g},${b})`;
    } else {
      const base = isLight ? [192, 192, 192] : [120, 120, 120];
      if (val === 0) return `rgb(${base[0]},${base[1]},${base[2]})`;
      const intensity = Math.min(Math.abs(val) / maxAbs, 1);
      const alpha = 0.2 + intensity * 0.6;
      const tint = val > 0 ? [50, 130, 220] : [220, 50, 50];
      const r = Math.round(base[0] * (1 - alpha) + tint[0] * alpha);
      const g = Math.round(base[1] * (1 - alpha) + tint[1] * alpha);
      const b = Math.round(base[2] * (1 - alpha) + tint[2] * alpha);
      return `rgb(${r},${g},${b})`;
    }
  }

  function drawFrame(ctx, frame) {
    const key = pressureMode === "weighted" ? "pressure_weighted" : "pressure";
    const pressure = frame[key];
    const maxAbs = PRESSURE_SCALE[pressureMode];
    const fen = frame.board.fen.split(" ")[0];

    // Draw squares
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const rank = 8 - row;
        const pyIdx = (rank - 1) * 8 + col;
        const color = computeSquareColor(pressure[pyIdx], maxAbs, rank, col);
        ctx.fillStyle = color;
        ctx.fillRect(col * SQ, row * SQ, SQ, SQ);
      }
    }

    // Draw pieces if enabled
    if (showPieces) {
      const rows = fen.split("/");
      for (let row = 0; row < 8; row++) {
        let col = 0;
        for (const ch of rows[row]) {
          if (ch >= "1" && ch <= "8") {
            col += parseInt(ch);
          } else {
            const color = ch === ch.toUpperCase() ? "w" : "b";
            const pieceMap = { k:"K", q:"Q", r:"R", b:"B", n:"N", p:"P" };
            const key = color + pieceMap[ch.toLowerCase()];
            const img = pieceImages[key];
            if (img) {
              ctx.drawImage(img, col * SQ, row * SQ, SQ, SQ);
            }
            col++;
          }
        }
      }
    }
  }

  async function exportGif() {
    if (!gameData || gameData.frames.length === 0) return;

    await loadPieceImages();

    const speed = parseInt(document.getElementById("export-speed").value);
    const progressEl = document.getElementById("export-progress");
    const barEl = document.getElementById("export-bar");
    const pctEl = document.getElementById("export-pct");
    const goBtn = document.getElementById("export-go");

    progressEl.style.display = "flex";
    goBtn.disabled = true;
    goBtn.textContent = "Exporting...";

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: EXPORT_SIZE,
      height: EXPORT_SIZE,
      workerScript: "/static/gif.worker.js",
    });

    const canvas = document.createElement("canvas");
    canvas.width = EXPORT_SIZE;
    canvas.height = EXPORT_SIZE;
    const ctx = canvas.getContext("2d");

    const total = gameData.frames.length;
    for (let i = 0; i < total; i++) {
      drawFrame(ctx, gameData.frames[i]);
      gif.addFrame(ctx, { copy: true, delay: speed });
      const pct = Math.round(((i + 1) / total) * 50);
      barEl.value = pct;
      pctEl.textContent = pct + "%";
    }

    gif.on("progress", (p) => {
      const pct = 50 + Math.round(p * 50);
      barEl.value = pct;
      pctEl.textContent = pct + "%";
    });

    gif.on("finished", (blob) => {
      barEl.value = 100;
      pctEl.textContent = "100%";
      goBtn.disabled = false;
      goBtn.textContent = "Export";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "chess-pressure.gif";
      a.click();
      URL.revokeObjectURL(url);

      setTimeout(() => { progressEl.style.display = "none"; }, 1000);
    });

    gif.render();
  }

  document.addEventListener("DOMContentLoaded", init);
})();
