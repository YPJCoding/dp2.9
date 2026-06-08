#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

if [ ! -f "df_game_r.js" ]; then
  echo "ERROR: df_game_r.js not found" >&2
  exit 1
fi

MARKERS=(
  "function set_return_user"
  "function hidden_option"
  "function start_hidden_option"
  "function getQuestIds1"
  "function Inspection_tasks"
  "function vip_Login"
)

found=0
for marker in "${MARKERS[@]}"; do
  if grep -n "$marker" df_game_r.js >/dev/null 2>&1; then
    echo "LEGACY FOUND: $marker" >&2
    grep -n "$marker" df_game_r.js >&2
    found=1
  fi
done

if [ $found -ne 0 ]; then
  echo "ERROR: Legacy function markers still present in df_game_r.js" >&2
  exit 1
fi

echo "Legacy marker check PASSED: no cleaned legacy functions remain in df_game_r.js"
