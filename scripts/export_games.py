"""Export the built-in games to static/games.json for the client-side app.

The browser parses these PGNs locally (via chess.js) — the server is no longer
in the gameplay path. Re-run after editing games.py:

    uv run python scripts/export_games.py
"""

import json
from pathlib import Path

from chess_pressure.games import GAMES

OUT = Path(__file__).resolve().parent.parent / "src" / "chess_pressure" / "static" / "games.json"

data = [
    {
        "id": g["id"],
        "name": g["name"],
        "white": g["white"],
        "black": g["black"],
        "pgn": g["pgn"],
    }
    for g in GAMES
]

OUT.write_text(json.dumps(data, indent=2) + "\n")
print(f"Wrote {len(data)} games to {OUT}")
