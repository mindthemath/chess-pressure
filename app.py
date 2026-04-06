"""FastAPI application for chess pressure visualization."""

from __future__ import annotations

from pathlib import Path

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from .engine import make_move, parse_pgn
from .games import get_game_list, get_game_pgn

STATIC = Path(__file__).resolve().parent.parent / "static"

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
    uvicorn.run("chess_pressure.app:app", host="0.0.0.0", port=8888, workers=2)


if __name__ == "__main__":
    main()
