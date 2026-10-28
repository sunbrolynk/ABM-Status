#!/usr/bin/env bash
# Build the page with next-on-pages, serve it in wrangler's local Workers runtime (the one
# Cloudflare runs) and fail unless every page answers 200 in several reader languages.
set -euo pipefail

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"
port="${EDGE_CHECK_PORT:-8798}"
tmp="$(mktemp -d)"
export WRANGLER_SEND_METRICS=false

npx @cloudflare/next-on-pages > "$tmp/build.log" 2>&1 || { cat "$tmp/build.log" >&2; exit 1; }
npx wrangler d1 execute uptimeflare-abm_d1 --local --persist-to "$tmp/d1" --file init.sql > /dev/null
node_modules/.bin/wrangler pages dev .vercel/output/static --port "$port" --persist-to "$tmp/d1" > "$tmp/server.log" 2>&1 &
server=$!
trap 'kill "$server" 2>/dev/null; wait "$server" 2>/dev/null; rm -rf "$tmp"' EXIT

curl -s -o /dev/null --retry 60 --retry-connrefused --retry-delay 1 "http://127.0.0.1:$port/" || true
failed=0
for path in / /incidents; do
    for lang in en de ja; do
        code="$(curl -s -o /dev/null -w '%{http_code}' -H "Accept-Language: $lang" "http://127.0.0.1:$port$path")"
        echo "  GET $path ($lang): $code"
        [[ "$code" == 200 ]] || failed=1
    done
done
if [[ "$failed" == 1 ]]; then
    cat "$tmp/server.log" >&2
    exit 1
fi
