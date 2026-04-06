.PHONY: dev serve lint fmt help

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

help:
	@echo "chess-pressure"
	@echo ""
	@echo "  make dev     dev server with reload (:8888)"
	@echo "  make serve   production server (:8888)"
	@echo "  make lint    ruff format + check"
	@echo "  make fmt     ruff format + auto-fix"
