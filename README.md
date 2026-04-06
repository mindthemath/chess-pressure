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
- FastAPI backend with a lightweight static frontend.

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
uv run chess-pressure
```

The app starts on [http://localhost:8888](http://localhost:8888).

## API

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
  app.py       # FastAPI routes and static file serving
  engine.py    # Pressure computation, PGN parsing, move logic
  games.py     # Built-in famous games (PGN data)
  static/      # Frontend assets (HTML, JS, CSS, piece images)
```

## License

MIT
