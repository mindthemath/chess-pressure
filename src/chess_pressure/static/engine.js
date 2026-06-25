/* Chess Pressure — client-side engine.
 *
 * A direct port of engine.py. Computes the same pressure maps and frame
 * structures entirely in the browser, so gameplay never needs the server.
 *
 * UMD: in the browser it self-initializes from the global `Chess`
 * (chess.min.js must load first) and exposes `window.ChessPressure`.
 * Under Node/Bun it exports the factory so the parity test can inject its
 * own Chess: `require("./engine.js")(require("chess.js").Chess)`.
 */
(function (root, factory) {
  if (typeof module === "object" && module.exports) {
    module.exports = factory; // caller supplies Chess
  } else {
    root.ChessPressure = factory(root.Chess);
  }
})(typeof self !== "undefined" ? self : this, function (Chess) {
  "use strict";

  const PIECE_VALUES = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 1 };
  const FILES = "abcdefgh";

  // square index 0..63 (a1=0, b1=1, ... h8=63) -> "e4" — matches python-chess.
  const SQ_NAMES = [];
  for (let i = 0; i < 64; i++) SQ_NAMES.push(FILES[i % 8] + (Math.floor(i / 8) + 1));

  /** Net pressure per square. Positive = white controls, negative = black. */
  function computePressure(chess, weighted) {
    const pressure = new Array(64).fill(0);
    for (let i = 0; i < 64; i++) {
      const sq = SQ_NAMES[i];
      for (const color of ["w", "b"]) {
        const attackers = chess.attackers(sq, color);
        const sign = color === "w" ? 1 : -1;
        for (const from of attackers) {
          const weight = weighted ? PIECE_VALUES[chess.get(from).type] : 1;
          pressure[i] += sign * weight;
        }
      }
    }
    return pressure;
  }

  /** Serialize board state for the frontend (mirrors board_to_dict). */
  function boardDict(chess) {
    return {
      fen: chess.fen(),
      turn: chess.turn(),
      is_check: chess.isCheck(),
      is_checkmate: chess.isCheckmate(),
      is_stalemate: chess.isStalemate(),
      is_game_over: chess.isGameOver(),
      fullmove: chess.moveNumber(),
    };
  }

  function frameFor(chess) {
    return {
      board: boardDict(chess),
      pressure: computePressure(chess, false),
      pressure_weighted: computePressure(chess, true),
    };
  }

  function uciOf(move) {
    return move.from + move.to + (move.promotion || "");
  }

  /** Legal moves from a FEN as UCI strings (mirrors /api/legal). */
  function legalMoves(fen) {
    const chess = new Chess(fen);
    return chess.moves({ verbose: true }).map(uciOf);
  }

  /** Apply a UCI move to a FEN (mirrors make_move). Throws on illegal. */
  function makeMove(fen, uci) {
    const chess = new Chess(fen);
    const move = {
      from: uci.slice(0, 2),
      to: uci.slice(2, 4),
      promotion: uci.length > 4 ? uci[4] : undefined,
    };
    let result;
    try {
      result = chess.move(move);
    } catch (e) {
      throw new Error("Illegal move: " + uci);
    }
    if (!result) throw new Error("Illegal move: " + uci);
    return {
      san: result.san,
      uci,
      frame: frameFor(chess),
      legal_moves: chess.moves({ verbose: true }).map(uciOf),
    };
  }

  /** Parse a PGN string into {headers, moves, frames, result} (mirrors parse_pgn). */
  function parsePgn(pgnText) {
    const parser = new Chess();
    parser.loadPgn(pgnText); // throws on unparseable PGN
    const headers = parser.getHeaders();
    const history = parser.history({ verbose: true });

    const replay = headers.FEN ? new Chess(headers.FEN) : new Chess();
    const moves = [];
    const frames = [frameFor(replay)]; // frame 0 = starting position

    for (const mv of history) {
      const san = mv.san;
      const uci = uciOf(mv);
      replay.move({ from: mv.from, to: mv.to, promotion: mv.promotion });
      moves.push({ san, uci, ply: replay.history().length });
      frames.push(frameFor(replay));
    }

    return {
      headers,
      moves,
      frames,
      result: headers.Result || "*",
    };
  }

  /** Build a PGN-compatible string from headers + a list of {uci} moves. */
  function toPgn(headers, moves) {
    const chess = headers && headers.FEN ? new Chess(headers.FEN) : new Chess();
    if (headers) {
      for (const key of Object.keys(headers)) {
        if (headers[key] != null && headers[key] !== "") {
          chess.setHeader(key, String(headers[key]));
        }
      }
    }
    for (const m of moves) {
      chess.move({
        from: m.uci.slice(0, 2),
        to: m.uci.slice(2, 4),
        promotion: m.uci.length > 4 ? m.uci[4] : undefined,
      });
    }
    return chess.pgn();
  }

  return {
    computePressure,
    boardDict,
    frameFor,
    legalMoves,
    makeMove,
    parsePgn,
    toPgn,
  };
});
