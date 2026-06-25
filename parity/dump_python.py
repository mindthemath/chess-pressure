"""Dump python-chess engine output for every built-in game as JSON on stdout.

Consumed by check.js to verify the JS engine produces identical results.
Run from the package root: `uv run python parity/dump_python.py`.
"""

import json
import sys

from chess_pressure.engine import parse_pgn
from chess_pressure.games import GAMES

out = []
for g in GAMES:
    parsed = parse_pgn(g["pgn"])
    out.append(
        {
            "id": g["id"],
            "pgn": g["pgn"],
            "moves": parsed["moves"],
            "frames": parsed["frames"],
            "result": parsed["result"],
        }
    )

json.dump(out, sys.stdout)
