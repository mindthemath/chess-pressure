"""FastAPI application for chess pressure visualization."""

from __future__ import annotations

from functools import lru_cache
from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .engine import make_move, parse_pgn
from .games import get_game_list, get_game_pgn

STATIC = Path(__file__).resolve().parent / "static"

app = FastAPI(title="Chess Pressure", docs_url=None, redoc_url=None)


# --- Models ---


class PGNUpload(BaseModel):
    pgn: str


class MoveRequest(BaseModel):
    fen: str
    uci: str


# --- API ---


@app.get("/api/games")
def list_games():
    return get_game_list()


@app.get("/api/games/{game_id}")
@lru_cache(maxsize=16)
def load_game(game_id: str):
    pgn = get_game_pgn(game_id)
    if pgn is None:
        raise HTTPException(404, "Game not found")
    return parse_pgn(pgn)


@app.post("/api/parse")
def parse_uploaded_pgn(body: PGNUpload):
    try:
        return parse_pgn(body.pgn)
    except ValueError as e:
        raise HTTPException(400, str(e))


@app.get("/api/legal")
def legal_moves(fen: str):
    import chess

    board = chess.Board(fen)
    return [m.uci() for m in board.legal_moves]


@app.post("/api/move")
def do_move(body: MoveRequest):
    try:
        return make_move(body.fen, body.uci)
    except ValueError as e:
        raise HTTPException(400, str(e))


# --- Static files ---

app.mount("/static", StaticFiles(directory=str(STATIC)), name="static")


@app.get("/")
def index():
    return FileResponse(
        str(STATIC / "index.html"),
        headers={"Cache-Control": "no-cache, must-revalidate"},
    )


def main():
    import argparse

    parser = argparse.ArgumentParser(description="Chess Pressure server")
    parser.add_argument(
        "--host", default="0.0.0.0", help="Bind address (default: 0.0.0.0)"
    )
    parser.add_argument(
        "--port", "-p", type=int, default=8888, help="Port (default: 8888)"
    )
    parser.add_argument(
        "--workers", "-w", type=int, default=2, help="Worker processes (default: 2)"
    )
    args = parser.parse_args()

    uvicorn.run(
        "chess_pressure.app:app",
        host=args.host,
        port=args.port,
        workers=args.workers,
    )


if __name__ == "__main__":
    main()
