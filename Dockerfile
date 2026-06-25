# Fully client-side app — production is just static files served by a tiny,
# fast-booting static-web-server (Rust). No Python in the runtime image.
#
# PWA/offline service worker is OFF by default (so all visitors hit the server
# and show up in logs). Enable it at build time:
#   docker build --build-arg ENABLE_CHESS_PWA=1 .
#   fly deploy --build-arg ENABLE_CHESS_PWA=1

ARG ENABLE_CHESS_PWA=0

FROM alpine:3 AS build
ARG ENABLE_CHESS_PWA
WORKDIR /src
COPY src/chess_pressure/static/ ./static/
RUN if [ "$ENABLE_CHESS_PWA" = "1" ]; then \
      sed -i 's/window.CHESS_PWA = false/window.CHESS_PWA = true/' static/index.html; \
      echo "chess-pressure: PWA ENABLED"; \
    else \
      echo "chess-pressure: PWA disabled"; \
    fi

FROM ghcr.io/static-web-server/static-web-server:2
COPY --from=build /src/static /public

ENV SERVER_HOST=0.0.0.0 \
    SERVER_PORT=8888 \
    SERVER_ROOT=/public \
    SERVER_FALLBACK_PAGE=/public/index.html \
    SERVER_COMPRESSION=true

EXPOSE 8888
