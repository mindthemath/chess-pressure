#!/usr/bin/env bash
# Bump the static-asset cache-bust version in one shot.
#
# The version appears in two places that must stay in sync:
#   - index.html  -> style.css?v=N and app.js?v=N  (browser HTTP cache)
#   - sw.js       -> CACHE = "chess-pressure-vN"   (service worker cache, PWA)
#
# Run this whenever you change app.js / style.css (or any cached asset) so
# returning visitors pick up the new files instead of a stale cached copy.
# This matters always for the browser cache, and is *critical* when the PWA
# service worker is enabled (ENABLE_CHESS_PWA=1) — without a bump the SW keeps
# serving the old assets forever.
set -euo pipefail

cd "$(dirname "$0")/.."
STATIC="src/chess_pressure/static"
INDEX="$STATIC/index.html"
SW="$STATIC/sw.js"

cur=$(grep -oE '\?v=[0-9]+' "$INDEX" | head -1 | grep -oE '[0-9]+' || true)
if [ -z "${cur:-}" ]; then
  echo "error: could not find a '?v=N' version in $INDEX" >&2
  exit 1
fi
next=$((cur + 1))

sed -i -E "s/\?v=$cur\b/?v=$next/g" "$INDEX"
sed -i -E "s/chess-pressure-v$cur\b/chess-pressure-v$next/g" "$SW"

echo "cache version bumped: v$cur -> v$next"
grep -nE '\?v=[0-9]+|chess-pressure-v[0-9]+' "$INDEX" "$SW" | sed 's/^/  /'
