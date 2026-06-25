# Fully client-side app — production is just static files served by a tiny,
# fast-booting static-web-server (Rust). No Python in the runtime image.
FROM ghcr.io/static-web-server/static-web-server:2

COPY src/chess_pressure/static/ /public/

ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8888 \
    SERVER_ROOT=/public \
    SERVER_FALLBACK_PAGE=/public/index.html \
    SERVER_COMPRESSION=true

EXPOSE 8888
