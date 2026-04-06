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
| Kasparov's Immortal | 1999 | Kasparov | Topalov |
| Fischer vs Spassky, Game 6 | 1972 | Fischer | Spassky |
| Kasparov vs Deep Blue, Game 2 | 1997 | Deep Blue | Kasparov |

## Quickstart

```bash
# Install dependencies
pip install fastapi uvicorn python-chess

# Run the server
python -m chess_pressure.app
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
chess_pressure/
  __init__.py
  app.py       # FastAPI routes and static file serving
  engine.py    # Pressure computation, PGN parsing, move logic
  games.py     # Built-in famous games (PGN data)
```

## License

MIT
