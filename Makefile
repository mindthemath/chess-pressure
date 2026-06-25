.PHONY: dev serve games parity bump lint fmt build publish fly-install deploy logs status help

# Static dev server (client-side app; refresh picks up edits)
dev:
	bun run dev-server.js

# Optional Python fallback server (also serves the static app + /api routes)
serve:
	uv run chess-pressure

# Regenerate static/games.json from games.py (run after editing games)
games:
	uv run python scripts/export_games.py

# Verify the JS engine matches python-chess across every built-in game
parity:
	cd parity && bun install --silent
	uv run python parity/dump_python.py > parity/.py_frames.json
	cd parity && bun run check.js

# Bump static asset cache-bust version (index.html + sw.js). Run before deploy
# when any cached asset changed — required for the PWA service worker to update.
bump:
	./scripts/bump_version.sh

# Lint
lint: fmt
	uvx ruff check src/chess_pressure/

# Format
fmt:
	uvx ruff format src/chess_pressure/
	uvx ruff check --fix src/chess_pressure/

# Build sdist + wheel
build:
	rm -rf dist/
	uv build

# Publish to PyPI
publish: build
	uv publish

# Install flyctl
fly-install:
	curl -L https://fly.io/install.sh | sh

# Deploy to Fly.io
deploy:
	fly deploy -a chess-pressure

# Tail production logs
logs:
	fly logs -a chess-pressure

# Production status
status:
	fly status -a chess-pressure

help:
	@echo "chess-pressure"
	@echo ""
	@echo "  make dev     static dev server (:8888)"
	@echo "  make serve   optional Python fallback server (:8888)"
	@echo "  make games   regenerate static/games.json from games.py"
	@echo "  make parity  verify JS engine matches python-chess"
	@echo "  make bump    bump asset cache version (run before deploy)"
	@echo "  make lint    ruff format + check"
	@echo "  make fmt     ruff format + auto-fix"
	@echo "  make build   build sdist + wheel"
	@echo "  make publish     build + publish to PyPI"
	@echo "  make fly-install install flyctl"
	@echo "  make deploy      deploy to Fly.io"
	@echo "  make logs    tail production logs"
	@echo "  make status  Fly.io app status"
