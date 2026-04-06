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
    {
        "id": "polgar-anand",
        "name": "Polgar vs Anand (1999)",
        "white": "Polgar",
        "black": "Anand",
        "pgn": """[Event "Dos Hermanas"]
[Site "Dos Hermanas"]
[Date "1999.04.??"]
[White "Judit Polgar"]
[Black "Viswanathan Anand"]
[Result "1-0"]

1.e4 c5 2.Nf3 d6 3.d4 cxd4 4.Nxd4 Nf6 5.Nc3 a6 6.Be3 e6 7.g4 e5 8.Nf5 g6
9.g5 gxf5 10.exf5 d5 11.Qf3 d4 12.O-O-O Nbd7 13.Bd2 dxc3 14.Bxc3 Bg7 15.Rg1
O-O 16.gxf6 Qxf6 17.Qe3 Kh8 18.f4 Qb6 19.Qg3 Qh6 20.Rd6 f6 21.Bd2 e4 22.Bc4
b5 23.Be6 Ra7 24.Rc6 a5 25.Be3 Rb7 26.Bd5 Rb8 27.Rc7 b4 28.b3 Rb5 29.Bc6 Rxf5
30.Rxc8 Rxc8 31.Bxd7 Rcc5 32.Bxf5 Rxf5 33.Rd1 Kg8 34.Qg2 1-0""",
    },
    {
        "id": "polgar-kasparov",
        "name": "Polgar vs Kasparov (2002)",
        "white": "Polgar",
        "black": "Kasparov",
        "pgn": """[Event "Russia vs Rest of the World"]
[Site "Moscow"]
[Date "2002.09.09"]
[White "Judit Polgar"]
[Black "Garry Kasparov"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.d4 Nd6 6.Bxc6 dxc6 7.dxe5 Nf5
8.Qxd8+ Kxd8 9.Nc3 h6 10.Rd1+ Ke8 11.h3 Be7 12.Ne2 Nh4 13.Nxh4 Bxh4 14.Be3
Bf5 15.Nd4 Bh7 16.g4 Be7 17.Kg2 h5 18.Nf5 Bf8 19.Kf3 Bg6 20.Rd2 hxg4+ 21.hxg4
Rh3+ 22.Kg2 Rh7 23.Kg3 f6 24.Bf4 Bxf5 25.gxf5 fxe5 26.Re1 Bd6 27.Bxe5 Kd7
28.c4 c5 29.Bxd6 cxd6 30.Re6 Rah8 31.Rexd6+ Kc8 32.R2d5 Rh3+ 33.Kg2 Rh2+
34.Kf3 R2h3+ 35.Ke4 b6 36.Rc6+ Kb8 37.Rd7 Rh2 38.Ke3 Rf8 39.Rcc7 Rxf5
40.Rb7+ Kc8 41.Rdc7+ Kd8 42.Rxg7 Kc8 1-0""",
    },
    {
        "id": "hou-caruana",
        "name": "Hou Yifan vs Caruana (2017)",
        "white": "Hou Yifan",
        "black": "Caruana",
        "pgn": """[Event "GRENKE Chess Classic"]
[Site "Karlsruhe"]
[Date "2017.04.15"]
[White "Hou Yifan"]
[Black "Fabiano Caruana"]
[Result "1-0"]

1.e4 e5 2.Nf3 Nc6 3.Bb5 Nf6 4.O-O Nxe4 5.Re1 Nd6 6.Nxe5 Be7 7.Bf1 O-O 8.d4
Nf5 9.Nf3 d5 10.c3 Bd6 11.Nbd2 Nce7 12.Qc2 c6 13.Bd3 g6 14.Nf1 f6 15.h3 Rf7
16.Bd2 Bd7 17.Re2 c5 18.dxc5 Bxc5 19.Bf4 Rc8 20.Rae1 g5 21.Ng3 Nxg3 22.Bxg3
a5 23.Qd2 a4 24.b4 axb3 25.axb3 Ng6 26.h4 gxh4 27.Nxh4 Nxh4 28.Bxh4 Qf8
29.Qf4 Bd6 30.Qd4 Rd8 31.Re3 Bc8 32.b4 Kg7 33.Bb5 Bc7 34.Re8 Qd6 35.Bg3 Qb6
36.Qd3 Bd7 37.Bxd7 Rdxd7 38.Qf5 Bxg3 39.Qg4+ Kh6 40.Qh3+ 1-0""",
    },
    {
        "id": "ju-lei",
        "name": "Ju Wenjun vs Lei Tingjie, WCC G12 (2023)",
        "white": "Ju Wenjun",
        "black": "Lei Tingjie",
        "pgn": """[Event "Women's World Championship"]
[Site "Shanghai/Chongqing"]
[Date "2023.07.22"]
[White "Ju Wenjun"]
[Black "Lei Tingjie"]
[Result "1-0"]

1.d4 d5 2.Nf3 Nf6 3.e3 c5 4.dxc5 e6 5.b4 a5 6.c3 axb4 7.cxb4 b6 8.Bb5+ Bd7
9.Bxd7+ Nbxd7 10.a4 bxc5 11.b5 Qc7 12.Bb2 Bd6 13.O-O O-O 14.Nbd2 Rfc8 15.Qc2
c4 16.Bc3 Nc5 17.a5 Nb3 18.Bxf6 Nxa1 19.Bxa1 Qxa5 20.Qc3 Qxc3 21.Bxc3 Rcb8
22.Nd4 e5 23.Nf5 Bf8 24.Bxe5 Rxb5 25.g4 g6 26.Nd4 Rb2 27.Nb1 Bg7 28.Bxg7 Kxg7
29.Nc3 Ra5 30.Rd1 Rb6 31.Nde2 Rb3 32.Kg2 h6 33.Kf3 f6 34.Rc1 Kf7 35.Nf4 d4
36.exd4 g5 37.Ne2 f5 38.gxf5 Rxf5+ 39.Ke3 g4 40.Nf4 Rb8 41.d5 Rf6 42.Rc2 Ra8
43.Nb5 Rb6 44.Nd4 Ra3+ 45.Ke4 c3 46.Nfe2 Rb2 47.Kd3 Rb1 48.Nxc3 Rh1 49.f3 gxf3
50.Nxf3 Rf1 51.Nd4 Ke7 52.Kc4 Rf4 53.Rb2 Rh4 54.Rb7+ Kf6 55.Rb2 Ra8 56.Kc5 Rh3
57.Ncb5 Re3 58.d6 Ke5 59.Nc6+ Ke4 60.d7 Rd3 61.Nd6+ Kf4 62.Rb8 1-0""",
    },
    {
        "id": "shirov-polgar",
        "name": "Shirov vs Polgar (1994)",
        "white": "Shirov",
        "black": "Polgar",
        "pgn": """[Event "Buenos Aires Sicilian"]
[Site "Buenos Aires"]
[Date "1994.10.22"]
[White "Alexei Shirov"]
[Black "Judit Polgar"]
[Result "0-1"]

1.e4 c5 2.Nf3 e6 3.d4 cxd4 4.Nxd4 Nc6 5.Nc3 d6 6.g4 a6 7.Be3 Nge7 8.Nb3 b5
9.f4 Bb7 10.Qf3 g5 11.fxg5 Ne5 12.Qg2 b4 13.Ne2 h5 14.gxh5 Nf5 15.Bf2 Qxg5
16.Na5 Ne3 17.Qg3 Qxg3 18.Nxg3 Nxc2+ 19.Kd1 Nxa1 20.Nxb7 b3 21.axb3 Nxb3
22.Kc2 Nc5 23.Nxc5 dxc5 24.Be1 Nf3 25.Bc3 Nd4+ 26.Kd3 Bd6 27.Bg2 Be5 28.Kc4
Ke7 29.Ra1 Nc6 0-1""",
    },
]


def get_game_list() -> list[dict]:
    """Return list of available games (id, name, white, black)."""
    return [
        {"id": g["id"], "name": g["name"], "white": g["white"], "black": g["black"]}
        for g in GAMES
    ]


def get_game_pgn(game_id: str) -> str | None:
    """Return PGN for a built-in game."""
    for g in GAMES:
        if g["id"] == game_id:
            return g["pgn"]
    return None
