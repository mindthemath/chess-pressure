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
  let hasReference = false;  // true for loaded games (built-in/upload/saved) that can be reset
  let originalData = null;   // pristine copy of a reference game, captured on first edit
  let showPieces = true;
  let showBoard = false;
  let selectedSquare = null;  // tap-to-move: currently selected source square
  let legalMoves = [];        // legal moves from selected square

  const PLAY_SPEED = 800;    // ms between auto-advance
  const NEW_GAME_PGN = '[White "You"]\n[Black "Opponent"]\n[Result "*"]\n\n*';

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

    // Legal moves originating from this square (computed locally)
    const fromMoves = ChessPressure.legalMoves(fen).filter((m) => m.startsWith(square));
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
  }

  function doMove(fen, uci) {
    let data;
    try {
      data = ChessPressure.makeMove(fen, uci); // computed locally — no server round-trip
    } catch (e) {
      return; // illegal move — ignore
    }
    // For reference games (built-in/upload/saved), snapshot the pristine line the
    // first time the user diverges from it, so "Reset to original" works. New games
    // have no reference — corrections just overwrite, with no fork UI.
    if (hasReference && originalData === null && currentIndex < gameData.frames.length - 1) {
      originalData = JSON.parse(JSON.stringify(gameData));
    }
    // Always overwrite any continuation past the current point, so rewinding and
    // playing a different move replaces the old line instead of appending to it.
    gameData.moves = gameData.moves.slice(0, currentIndex);
    gameData.frames = gameData.frames.slice(0, currentIndex + 1);
    gameData.moves.push({ san: data.san, uci: data.uci, ply: currentIndex + 1 });
    gameData.frames.push(data.frame);
    goTo(gameData.frames.length - 1);
    updateForkUI();
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
      html += `<div class="move-row">`;
      html += `<span class="move-num">${num}.</span>`;
      html += `<span class="move${wClass ? " " + wClass : ""}" data-idx="${i + 1}">${w.san}</span>`;
      if (b) {
        html += `<span class="move${bClass ? " " + bClass : ""}" data-idx="${i + 2}">${b.san}</span>`;
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
    // chess.js fills the Seven Tag Roster with "?" / "????.??.??" placeholders;
    // skip those so a fresh game just reads "You vs Opponent".
    const real = (v) => v && v !== "?" && v !== "????.??.??";
    const parts = [];
    if (real(h.White) || real(h.Black)) parts.push(`${h.White || "?"} vs ${h.Black || "?"}`);
    if (real(h.Event)) parts.push(h.Event);
    if (real(h.Date)) parts.push(h.Date);
    el.textContent = parts.join(" — ");
  }

  // --- Playback ---
  const ICON_PLAY = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><polygon points="3,2 13,8 3,14"/></svg>';
  const ICON_PAUSE = '<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12"/><rect x="9" y="2" width="4" height="12"/></svg>';

  function togglePlay() {
    playing = !playing;
    document.getElementById("btn-play").innerHTML = playing ? ICON_PAUSE : ICON_PLAY;
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
    document.getElementById("fork-controls").style.display = originalData ? "flex" : "none";
  }

  function resetFork() {
    if (!originalData) return;
    gameData = originalData;
    originalData = null; // back on the pristine reference; still resettable after future edits
    goTo(0);
    updateForkUI();
  }

  // --- Game sources (built-in + browser-saved) ---
  let BUILTIN_GAMES = [];
  const SAVED_KEY = "cp.games";
  let currentSavedId = null;

  function getSavedGames() {
    try {
      return JSON.parse(localStorage.getItem(SAVED_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function setSavedGames(list) {
    localStorage.setItem(SAVED_KEY, JSON.stringify(list));
  }

  function applyParsed(parsed, savedId, isReference) {
    gameData = parsed;
    hasReference = !!isReference;
    originalData = null;
    currentSavedId = savedId || null;
    currentIndex = 0;
    goTo(0);
    updateGameInfo();
    updateForkUI();
    updateSavedControls();
  }

  // --- Load game ---
  function loadGame(gameId) {
    const g = BUILTIN_GAMES.find((x) => x.id === gameId);
    if (!g) return;
    applyParsed(ChessPressure.parsePgn(g.pgn), null, true);
  }

  function loadSaved(savedId) {
    const g = getSavedGames().find((x) => x.id === savedId);
    if (!g) return;
    let parsed;
    try {
      parsed = ChessPressure.parsePgn(g.pgn);
    } catch (e) {
      alert("That saved game could not be loaded (corrupted PGN).");
      return;
    }
    applyParsed(parsed, savedId, true);
  }

  // isReference defaults true (uploaded games are resettable); new games pass false.
  function loadPGN(pgn, isReference) {
    if (isReference === undefined) isReference = true;
    let parsed;
    try {
      parsed = ChessPressure.parsePgn(pgn);
    } catch (e) {
      alert("Could not parse PGN — please check the format and try again.");
      return;
    }
    applyParsed(parsed, null, isReference);
    document.getElementById("game-select").value = "";
  }

  // --- Saved games (localStorage) + PGN export ---
  function populateGameSelect() {
    const select = document.getElementById("game-select");
    const prev = select.value;
    select.innerHTML = '<option value="__new">New game</option>';

    if (BUILTIN_GAMES.length) {
      const og = document.createElement("optgroup");
      og.label = "Famous games";
      BUILTIN_GAMES.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = g.id;
        opt.textContent = g.name;
        og.appendChild(opt);
      });
      select.appendChild(og);
    }

    const saved = getSavedGames();
    if (saved.length) {
      const og = document.createElement("optgroup");
      og.label = "Saved games";
      saved.forEach((g) => {
        const opt = document.createElement("option");
        opt.value = "saved:" + g.id;
        opt.textContent = g.name;
        og.appendChild(opt);
      });
      select.appendChild(og);
    }

    // Restore selection if it still exists
    if (prev && [...select.options].some((o) => o.value === prev)) {
      select.value = prev;
    }
  }

  function updateSavedControls() {
    const del = document.getElementById("btn-delete-saved");
    if (del) del.style.display = currentSavedId ? "" : "none";
    const select = document.getElementById("game-select");
    if (currentSavedId) select.value = "saved:" + currentSavedId;
  }

  function defaultGameName() {
    const h = (gameData && gameData.headers) || {};
    if (h.White && h.Black) return `${h.White} vs ${h.Black}`;
    return "My game";
  }

  function currentSavedName() {
    if (!currentSavedId) return null;
    const g = getSavedGames().find((x) => x.id === currentSavedId);
    return g ? g.name : null;
  }

  // Promise-based in-app modal. Native prompt()/confirm() are unreliable here —
  // browsers suppress them when the page isn't the active tab — so all save/delete
  // prompts go through a real <dialog>. Resolves to true (OK) or false (cancel/Esc).
  function openModal(dlg) {
    return new Promise((resolve) => {
      const okBtn = dlg.querySelector("[data-ok]");
      const cancelBtn = dlg.querySelector("[data-cancel]");
      let done = false;
      const finish = (val) => {
        if (done) return;
        done = true;
        okBtn.removeEventListener("click", onOk);
        cancelBtn.removeEventListener("click", onCancel);
        dlg.removeEventListener("close", onClose);
        dlg.removeEventListener("keydown", onKey);
        if (dlg.open) dlg.close();
        resolve(val);
      };
      const onOk = () => finish(true);
      const onCancel = () => finish(false);
      const onClose = () => finish(false);
      const onKey = (e) => {
        if (e.key === "Enter" && e.target !== cancelBtn) {
          e.preventDefault();
          finish(true);
        }
      };
      okBtn.addEventListener("click", onOk);
      cancelBtn.addEventListener("click", onCancel);
      dlg.addEventListener("close", onClose);
      dlg.addEventListener("keydown", onKey);
      dlg.showModal();
    });
  }

  async function saveCurrentGame() {
    if (!gameData) return;
    const dlg = document.getElementById("save-dialog");
    const input = document.getElementById("save-name");
    const note = document.getElementById("save-note");
    input.value = currentSavedName() || defaultGameName();

    // Live "this overwrites" warning, so clicking Save IS the confirmation.
    const refreshNote = () => {
      const key = input.value.trim().toLowerCase();
      const exists = key && getSavedGames().some((g) => g.name.toLowerCase() === key);
      note.style.display = exists ? "block" : "none";
    };
    input.addEventListener("input", refreshNote);
    refreshNote();
    setTimeout(() => { input.focus(); input.select(); }, 0);

    const ok = await openModal(dlg);
    input.removeEventListener("input", refreshNote);
    if (!ok) return;

    const name = input.value.trim();
    if (!name) return;

    // Replace any same-named game (case-insensitive); also collapses old duplicates.
    const key = name.toLowerCase();
    const saved = getSavedGames().filter((g) => g.name.toLowerCase() !== key);
    const id = "g" + Date.now().toString(36);
    saved.push({
      id,
      name,
      pgn: ChessPressure.toPgn(gameData.headers, gameData.moves),
      savedAt: new Date().toISOString(),
    });
    setSavedGames(saved);
    currentSavedId = id;
    populateGameSelect();
    updateSavedControls();
  }

  async function deleteSavedGame() {
    if (!currentSavedId) return;
    const g = getSavedGames().find((x) => x.id === currentSavedId);
    if (!g) return;
    document.getElementById("confirm-msg").textContent = `Delete saved game "${g.name}"?`;
    const ok = await openModal(document.getElementById("confirm-dialog"));
    if (!ok) return;
    setSavedGames(getSavedGames().filter((x) => x.id !== currentSavedId));
    currentSavedId = null;
    populateGameSelect();
    updateSavedControls();
  }

  function exportPGN() {
    if (!gameData) return;
    const pgn = ChessPressure.toPgn(gameData.headers, gameData.moves);
    const slug = (defaultGameName() || "game")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "game";
    const blob = new Blob([pgn], { type: "application/x-chess-pgn" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = slug + ".pgn";
    a.click();
    URL.revokeObjectURL(url);
  }

  // --- Init ---
  async function init() {
    // Build board
    board = Chessboard("board", {
      draggable: true,
      position: "start",
      pieceTheme: "/img/chesspieces/wikipedia/{piece}.png",
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

    // Load built-in game list (static JSON, parsed in the browser)
    const r = await fetch("/games.json");
    BUILTIN_GAMES = await r.json();
    const select = document.getElementById("game-select");
    populateGameSelect();

    // Start on a fresh game so the player can begin immediately.
    loadPGN(NEW_GAME_PGN, false);
    select.value = "__new";

    // Show board after first render (prevents tan flash)
    document.getElementById("board").classList.add("ready");

    // --- Event listeners ---
    select.addEventListener("change", (e) => {
      const v = e.target.value;
      if (v === "__new") {
        loadPGN(NEW_GAME_PGN, false);
      } else if (v.startsWith("saved:")) {
        loadSaved(v.slice(6));
      } else if (v) {
        loadGame(v);
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

    // Save / export PGN / delete saved game
    document.getElementById("btn-save").addEventListener("click", saveCurrentGame);
    document.getElementById("btn-export-pgn").addEventListener("click", exportPGN);
    document.getElementById("btn-delete-saved").addEventListener("click", deleteSavedGame);

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
      img.src = `/img/chesspieces/wikipedia/${p}.png`;
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
      workerScript: "/gif.worker.js",
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
