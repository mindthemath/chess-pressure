"""Built-in famous games for the dropdown."""

GAMES = [
    {
        "id": "immortal",
        "name": "The Immortal Game (1851)",
        "white": "Anderssen",
        "black": "Kieseritzky",
        "pgn": """[Event "London"]
[Site "London"]
[Date "1851.06.21"]
[White "Adolf Anderssen"]
[Black "Lionel Kieseritzky"]
[Result "1-0"]

1. e4 e5 2. f4 exf4 3. Bc4 Qh4+ 4. Kf1 b5 5. Bxb5 Nf6 6. Nf3 Qh6 7. d3 Nh5
8. Nh4 Qg5 9. Nf5 c6 10. g4 Nf6 11. Rg1 cxb5 12. h4 Qg6 13. h5 Qg5 14. Qf3
Ng8 15. Bxf4 Qf6 16. Nc3 Bc5 17. Nd5 Qxb2 18. Bd6 Bxg1 19. e5 Qxa1+ 20. Ke2
Na6 21. Nxg7+ Kd8 22. Qf6+ Nxf6 23. Be7# 1-0""",
    },
    {
        "id": "opera",
        "name": "The Opera Game (1858)",
        "white": "Morphy",
        "black": "Duke of Brunswick & Count Isouard",
        "pgn": """[Event "Opera House"]
[Site "Paris"]
[Date "1858.11.02"]
[White "Paul Morphy"]
[Black "Duke of Brunswick and Count Isouard"]
[Result "1-0"]

1. e4 e5 2. Nf3 d6 3. d4 Bg4 4. dxe5 Bxf3 5. Qxf3 dxe5 6. Bc4 Nf6 7. Qb3 Qe7
8. Nc3 c6 9. Bg5 b5 10. Nxb5 cxb5 11. Bxb5+ Nbd7 12. O-O-O Rd8 13. Rxd7 Rxd7
14. Rd1 Qe6 15. Bxd7+ Nxd7 16. Qb8+ Nxb8 17. Rd8# 1-0""",
    },
    {
        "id": "kasparov-topalov",
        "name": "Kasparov's Immortal (1999)",
        "white": "Kasparov",
        "black": "Topalov",
        "pgn": """[Event "Hoogovens"]
[Site "Wijk aan Zee"]
[Date "1999.01.20"]
[White "Garry Kasparov"]
[Black "Veselin Topalov"]
[Result "1-0"]

1. e4 d6 2. d4 Nf6 3. Nc3 g6 4. Be3 Bg7 5. Qd2 c6 6. f3 b5 7. Nge2 Nbd7
8. Bh6 Bxh6 9. Qxh6 Bb7 10. a3 e5 11. O-O-O Qe7 12. Kb1 a6 13. Nc1 O-O-O
14. Nb3 exd4 15. Rxd4 c5 16. Rd1 Nb6 17. g3 Kb8 18. Na5 Ba8 19. Bh3 d5
20. Qf4+ Ka7 21. Re1 d4 22. Nd5 Nbxd5 23. exd5 Qd6 24. Rxd4 cxd4 25. Re7+
Kb6 26. Qxd4+ Kxa5 27. b4+ Ka4 28. Qc3 Qxd5 29. Ra7 Bb7 30. Rxb7 Qc4
31. Qxf6 Kxa3 32. Qxa6+ Kxb4 33. c3+ Kxc3 34. Qa1+ Kd2 35. Qb2+ Kd1
36. Bf1 Rd2 37. Rd7 Rxd7 38. Bxc4 bxc4 39. Qxh8 Rd3 40. Qa8 c3 41. Qa4+
Ke1 42. f4 f5 43. Kc1 Rd2 44. Qa7 1-0""",
    },
    {
        "id": "fischer-spassky-6",
        "name": "Fischer vs Spassky, Game 6 (1972)",
        "white": "Fischer",
        "black": "Spassky",
        "pgn": """[Event "World Championship"]
[Site "Reykjavik"]
[Date "1972.07.23"]
[White "Robert James Fischer"]
[Black "Boris Spassky"]
[Result "1-0"]

1. c4 e6 2. Nf3 d5 3. d4 Nf6 4. Nc3 Be7 5. Bg5 O-O 6. e3 h6 7. Bh4 b6
8. cxd5 Nxd5 9. Bxe7 Qxe7 10. Nxd5 exd5 11. Rc1 Be6 12. Qa4 c5 13. Qa3 Rc8
14. Bb5 a6 15. dxc5 bxc5 16. O-O Ra7 17. Be2 Nd7 18. Nd4 Qf8 19. Nxe6 fxe6
20. e4 d4 21. f4 Qe7 22. e5 Rb8 23. Bc4 Kh8 24. Qh3 Nf8 25. b3 a5 26. f5
exf5 27. Rxf5 Nh7 28. Rcf1 Qd8 29. Qg3 Re7 30. h4 Rbb7 31. e6 Rbc7 32. Qe5
Qe8 33. a4 Qd8 34. R1f2 Qe8 35. R2f3 Qd8 36. Bd3 Qe8 37. Qe4 Nf6 38. Rxf6
gxf6 39. Rxf6 Kg8 40. Bc4 Kh8 41. Qf4 1-0""",
    },
    {
        "id": "deep-blue",
        "name": "Kasparov vs Deep Blue, Game 2 (1997)",
        "white": "Deep Blue",
        "black": "Kasparov",
        "pgn": """[Event "IBM Man-Machine"]
[Site "New York"]
[Date "1997.05.04"]
[White "Deep Blue"]
[Black "Garry Kasparov"]
[Result "1-0"]

1. e4 e5 2. Nf3 Nc6 3. Bb5 a6 4. Ba4 Nf6 5. O-O Be7 6. Re1 b5 7. Bb3 d6
8. c3 O-O 9. h3 h6 10. d4 Re8 11. Nbd2 Bf8 12. Nf1 Bd7 13. Ng3 Na5 14. Bc2
c5 15. b3 Nc6 16. d5 Ne7 17. Be3 Ng6 18. Qd2 Nh7 19. a4 Nh4 20. Nxh4 Qxh4
21. Qe2 Qd8 22. b4 Qc7 23. Rec1 c4 24. Ra3 Rec8 25. Rca1 Qd8 26. f4 Nf6
27. fxe5 dxe5 28. Qf1 Ne8 29. Qf2 Nd6 30. Bb6 Qe8 31. R3a2 Be7 32. Bc5 Bf8
33. Nf5 Bxf5 34. exf5 f6 35. Bxd6 Bxd6 36. axb5 axb5 37. Be4 Rxa2 38. Qxa2
Qd7 39. Qa7 Rc7 40. Qb6 Rb7 41. Ra8+ Kf7 42. Qa6 Qc7 43. Qc6 Qb6+ 44. Kf1
Rb8 45. Ra6 1-0""",
    },
]


def get_game_list() -> list[dict]:
    """Return list of available games (id, name, white, black)."""
    return [{"id": g["id"], "name": g["name"], "white": g["white"], "black": g["black"]} for g in GAMES]


def get_game_pgn(game_id: str) -> str | None:
    """Return PGN for a built-in game."""
    for g in GAMES:
        if g["id"] == game_id:
            return g["pgn"]
    return None
