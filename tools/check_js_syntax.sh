#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "node not found"
  exit 1
fi

count=0

for file in df_game_r.js script/js/*.js; do
  if [ -f "$file" ]; then
    echo "checking $file"
    node --check "$file"
    count=$((count + 1))
  fi
done

echo "checked $count JS files"
