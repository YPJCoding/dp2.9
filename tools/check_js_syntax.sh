#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: node is not installed" >&2
  exit 1
fi

cd "$PROJECT_DIR"

found=0
checked=0

if [ -f "df_game_r.js" ]; then
  node --check df_game_r.js
  checked=$((checked + 1))
  found=1
fi

for f in script/js/*.js; do
  if [ -f "$f" ]; then
    node --check "$f"
    checked=$((checked + 1))
    found=1
  fi
done

if [ $found -eq 0 ]; then
  echo "No JS files found to check" >&2
  exit 1
fi

echo "JS syntax OK: ${checked} file(s) checked"
