#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

if ! command -v luac >/dev/null 2>&1; then
  echo "ERROR: luac is not installed" >&2
  exit 1
fi

cd "$PROJECT_DIR"

checked=0

if [ -f "df_game_r.lua" ]; then
  luac -p df_game_r.lua
  checked=$((checked + 1))
fi

while IFS= read -r -d '' f; do
  luac -p "$f"
  checked=$((checked + 1))
done < <(find script -name '*.lua' -print0 2>/dev/null || true)

if [ $checked -eq 0 ]; then
  echo "ERROR: No Lua files found to check" >&2
  exit 1
fi

echo "Lua syntax OK: ${checked} file(s) checked"
