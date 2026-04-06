"""Chess pressure computation engine."""

from __future__ import annotations

import chess
import chess.pgn
import io

PIECE_VALUES = {
    chess.PAWN: 1,
    chess.KNIGHT: 3,
    chess.BISHOP: 3,
    chess.ROOK: 5,
    chess.QUEEN: 9,
    chess.KING: 1,
}


def compute_pressure(board: chess.Board, weighted: bool = False) -> list[int]:
    """Compute net pressure for each square.

    Positive = white controls, negative = black controls.
    """
    pressure = [0] * 64
    for square in chess.SQUARES:
        piece = board.piece_at(square)
        if piece is None:
            continue
        attacks = board.attacks(square)
        weight = PIECE_VALUES[piece.piece_type] if weighted else 1
        sign = 1 if piece.color == chess.WHITE else -1
        for target in attacks:
            pressure[target] += sign * weight
    return pressure


def board_to_dict(board: chess.Board) -> dict:
    """Serialize board state for the frontend."""
    return {
        "fen": board.fen(),
        "turn": "w" if board.turn == chess.WHITE else "b",
        "is_check": board.is_check(),
        "is_checkmate": board.is_checkmate(),
        "is_stalemate": board.is_stalemate(),
        "is_game_over": board.is_game_over(),
        "fullmove": board.fullmove_number,
    }


def parse_pgn(pgn_text: str) -> dict:
    """Parse a PGN string and compute pressure for every position.

    Returns {headers, moves, frames} where frames[i] corresponds to position after moves[i].
    frames[0] is the starting position.
    """
    game = chess.pgn.read_game(io.StringIO(pgn_text))
    if game is None:
        raise ValueError("Could not parse PGN")

    headers = dict(game.headers)
    board = game.board()

    moves = []
    frames = []

    # Frame 0: starting position
    frames.append({
        "board": board_to_dict(board),
        "pressure": compute_pressure(board, weighted=False),
        "pressure_weighted": compute_pressure(board, weighted=True),
    })

    for node in game.mainline():
        move = node.move
        san = board.san(move)
        board.push(move)
        moves.append({
            "san": san,
            "uci": move.uci(),
            "ply": board.ply(),
        })
        frames.append({
            "board": board_to_dict(board),
            "pressure": compute_pressure(board, weighted=False),
            "pressure_weighted": compute_pressure(board, weighted=True),
        })

    return {
        "headers": headers,
        "moves": moves,
        "frames": frames,
        "result": headers.get("Result", "*"),
    }


def position_from_moves(move_list: list[str], start_fen: str | None = None) -> dict:
    """Apply a list of UCI moves and return the current frame."""
    board = chess.Board(start_fen) if start_fen else chess.Board()
    for uci in move_list:
        board.push_uci(uci)
    return {
        "board": board_to_dict(board),
        "pressure": compute_pressure(board, weighted=False),
        "pressure_weighted": compute_pressure(board, weighted=True),
        "legal_moves": [m.uci() for m in board.legal_moves],
    }


def make_move(fen: str, uci_move: str) -> dict:
    """Make a move from a FEN position, return new frame + legal moves."""
    board = chess.Board(fen)
    move = chess.Move.from_uci(uci_move)
    if move not in board.legal_moves:
        raise ValueError(f"Illegal move: {uci_move}")
    san = board.san(move)
    board.push(move)
    return {
        "san": san,
        "uci": uci_move,
        "frame": {
            "board": board_to_dict(board),
            "pressure": compute_pressure(board, weighted=False),
            "pressure_weighted": compute_pressure(board, weighted=True),
        },
        "legal_moves": [m.uci() for m in board.legal_moves],
    }
