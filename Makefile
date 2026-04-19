.PHONY: dev serve lint fmt build publish fly-install deploy logs status help

# Development server with auto-reload
dev:
	uv run uvicorn chess_pressure.app:app --host 0.0.0.0 --port 8888 --reload

# Production server
serve:
	uv run chess-pressure

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
	@echo "  make dev     dev server with reload (:8888)"
	@echo "  make serve   production server (:8888)"
	@echo "  make lint    ruff format + check"
	@echo "  make fmt     ruff format + auto-fix"
	@echo "  make build   build sdist + wheel"
	@echo "  make publish     build + publish to PyPI"
	@echo "  make fly-install install flyctl"
	@echo "  make deploy      deploy to Fly.io"
	@echo "  make logs    tail production logs"
	@echo "  make status  Fly.io app status"
