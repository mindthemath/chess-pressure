# Chess Pressure

A web application that visualizes **pressure maps** on a chess board -- showing which squares are controlled by white vs. black across every move of a game.

## What is "pressure"?

For each square on the board, pressure is the net number of pieces attacking it. Positive values mean white controls the square; negative means black does. Two modes are available:

- **Unweighted** -- each attacking piece contributes +1 or -1.
- **Weighted** -- each attacking piece contributes its material value (pawn=1, knight/bishop=3, rook=5, queen=9, king=1).

## Features

- Step through famous built-in games move by move and watch the pressure heatmap evolve.
- Upload your own PGN to analyze any game.
- Make moves from any position and see legal moves + pressure updates in real time.
- Save games to your browser and re-load them later; export any game as a PGN file.
- **Fully client-side gameplay** — legal moves, move application, and pressure are all
  computed in the browser (via [chess.js](https://github.com/jhlywa/chess.js)), so the
  app keeps working instantly even when the server is asleep or offline. Production is
  served as plain static files (no backend in the request path).

## Architecture

The chess logic exists in two equivalent implementations:

- `engine.py` (python-chess) — the original engine; also the parity reference.
- `static/engine.js` (chess.js) — a line-for-line port that runs in the browser.

`make parity` verifies the two produce **identical** output (pressure maps, FENs,
board status, and SAN/UCI) across every built-in game, so the client engine can be
trusted as a drop-in. Production deploys only the static assets; the FastAPI server
(`app.py`, with the `/api` routes below) is kept as an optional local fallback.

## Built-in Games

| Game | Year | White | Black |
|------|------|-------|-------|
| The Immortal Game | 1851 | Anderssen | Kieseritzky |
| The Opera Game | 1858 | Morphy | Duke of Brunswick & Count Isouard |
| Fischer vs Spassky, Game 6 | 1972 | Fischer | Spassky |
| Xie Jun vs Chiburdanidze, WCC | 1991 | Xie Jun | Chiburdanidze |
| Kasparov vs Deep Blue, Game 2 | 1997 | Deep Blue | Kasparov |
| Polgar vs Anand | 1999 | Polgar | Anand |
| Polgar vs Kasparov | 2002 | Polgar | Kasparov |
| Carlsen vs Nakamura | 2010 | Carlsen | Nakamura |
| Hou Yifan vs Caruana | 2017 | Hou Yifan | Caruana |
| Ju Wenjun vs Lei Tingjie, WCC G12 | 2023 | Ju Wenjun | Lei Tingjie |

## Quickstart

```bash
make dev        # static dev server on http://localhost:8888 (bun)
```

Other useful targets:

```bash
make serve      # optional Python fallback server (also serves the static app)
make games      # regenerate static/games.json after editing games.py
make parity     # verify the JS engine matches python-chess
make bump       # bump the asset cache version (run before deploy — see below)
make deploy     # deploy the static image to Fly.io
```

## Deployment

Production is a ~9 MB image built on
[static-web-server](https://static-web-server.net/) (see `Dockerfile`) — it serves
`static/` and nothing else, so it boots fast and scales to zero cleanly. The only
cold-start cost is the initial page load; all gameplay afterwards is local.

### Cache versioning (run before every deploy)

Static assets are cache-busted by a single version number that appears in two
places: `index.html` (`style.css?v=N`, `app.js?v=N`) and `sw.js`
(`CACHE = "chess-pressure-vN"`). **Whenever you change a cached asset, bump it:**

```bash
make bump        # v25 -> v26 across index.html and sw.js, kept in sync
```

This matters for the normal browser cache, and is **critical when the PWA is
enabled** — the service worker will otherwise keep serving the old assets to
returning visitors forever. Forgetting `make bump` is the #1 "why am I seeing old
code?" cause. Commit the bump along with your asset change, then `make deploy`.

### Offline / PWA (opt-in, off by default)

The app can install a service worker (`sw.js` + `manifest.json`) that caches the
whole app shell, so **repeat visits load instantly and work fully offline**. It is
**disabled by default on purpose**: an active service worker serves returning
visitors entirely from cache, so they no longer hit the server and won't appear in
the Fly logs. Enable it at build time:

```bash
docker build --build-arg ENABLE_CHESS_PWA=1 .
fly deploy --build-arg ENABLE_CHESS_PWA=1        # to ship it on Fly
ENABLE_CHESS_PWA=1 make dev                       # to test it locally
```

The flag flips `window.CHESS_PWA` in `index.html`; when false, the service worker
is never registered. Remember to `make bump` on every deploy once it's on.

## API (optional Python server)

The static app does not use these, but `app.py` still exposes them:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/games` | List built-in games |
| GET | `/api/games/{id}` | Load a built-in game (headers, moves, pressure frames) |
| POST | `/api/parse` | Parse a PGN string (`{"pgn": "..."}`) |
| GET | `/api/legal?fen=...` | Get legal moves for a FEN position |
| POST | `/api/move` | Make a move (`{"fen": "...", "uci": "e2e4"}`) |

## Project Structure

```
src/chess_pressure/
  __init__.py
  app.py            # Optional FastAPI server (/api routes + static fallback)
  engine.py         # Pressure computation, PGN parsing, move logic (parity reference)
  games.py          # Built-in famous games (PGN data)
  static/
    engine.js       # Browser port of engine.py (chess.js)
    chess.min.js    # Vendored chess.js 1.4.0 (bundled global)
    games.json      # Built-in games, generated from games.py
    sw.js           # Service worker (opt-in PWA/offline cache)
    manifest.json   # PWA manifest
    app.js, ...     # Frontend (HTML, JS, CSS, piece images)
scripts/export_games.py   # games.py -> static/games.json
scripts/bump_version.sh   # bump the asset cache version (make bump)
parity/                   # JS-vs-python engine parity test
dev-server.js             # bun static dev server (ENABLE_CHESS_PWA=1 to test PWA)
```

## License

MIT
