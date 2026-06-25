/* Parity test: assert the JS engine matches python-chess across every built-in game.
 *
 * Reads python output from .py_frames.json (produced by dump_python.py) and
 * compares it to engine.js's parse of the same PGNs, frame by frame.
 * Exits non-zero on any mismatch.
 */
const fs = require("fs");
const path = require("path");
const { Chess } = require("chess.js");
const makeEngine = require("../src/chess_pressure/static/engine.js");
const engine = makeEngine(Chess);

const pyData = JSON.parse(
  fs.readFileSync(path.join(__dirname, ".py_frames.json"), "utf8"),
);

function eq(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

let failures = 0;
let framesChecked = 0;

for (const game of pyData) {
  const js = engine.parsePgn(game.pgn);

  if (js.result !== game.result) {
    console.error(`[${game.id}] result mismatch: py=${game.result} js=${js.result}`);
    failures++;
  }
  if (js.frames.length !== game.frames.length) {
    console.error(
      `[${game.id}] frame count mismatch: py=${game.frames.length} js=${js.frames.length}`,
    );
    failures++;
    continue;
  }
  if (js.moves.length !== game.moves.length) {
    console.error(
      `[${game.id}] move count mismatch: py=${game.moves.length} js=${js.moves.length}`,
    );
    failures++;
  }

  for (let i = 0; i < game.frames.length; i++) {
    const pf = game.frames[i];
    const jf = js.frames[i];
    framesChecked++;
    if (!eq(pf.pressure, jf.pressure)) {
      console.error(`[${game.id}] frame ${i}: unweighted pressure mismatch`);
      failures++;
    }
    if (!eq(pf.pressure_weighted, jf.pressure_weighted)) {
      console.error(`[${game.id}] frame ${i}: weighted pressure mismatch`);
      failures++;
    }
    if (pf.board.fen !== jf.board.fen) {
      console.error(
        `[${game.id}] frame ${i}: fen mismatch\n  py=${pf.board.fen}\n  js=${jf.board.fen}`,
      );
      failures++;
    }
    if (
      pf.board.is_check !== jf.board.is_check ||
      pf.board.is_checkmate !== jf.board.is_checkmate ||
      pf.board.is_stalemate !== jf.board.is_stalemate ||
      pf.board.fullmove !== jf.board.fullmove ||
      pf.board.turn !== jf.board.turn
    ) {
      console.error(`[${game.id}] frame ${i}: board status mismatch`);
      failures++;
    }
  }

  for (let i = 0; i < Math.min(game.moves.length, js.moves.length); i++) {
    if (game.moves[i].san !== js.moves[i].san || game.moves[i].uci !== js.moves[i].uci) {
      console.error(
        `[${game.id}] move ${i} mismatch: py=${game.moves[i].san}/${game.moves[i].uci} js=${js.moves[i].san}/${js.moves[i].uci}`,
      );
      failures++;
    }
  }
}

if (failures === 0) {
  console.log(
    `PARITY OK — ${pyData.length} games, ${framesChecked} frames identical (pressure, fen, status, moves).`,
  );
  process.exit(0);
} else {
  console.error(`PARITY FAILED — ${failures} mismatch(es).`);
  process.exit(1);
}
