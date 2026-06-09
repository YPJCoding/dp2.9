#!/usr/bin/env bash
set -euo pipefail

if ! command -v node >/dev/null 2>&1; then
  echo "node not found"
  exit 1
fi

files=()
if [ -f df_game_r.js ]; then
  files+=("df_game_r.js")
fi

if [ -d script/js ]; then
  while IFS= read -r file; do
    files+=("$file")
  done < <(find script/js -name "*.js" -type f | sort)
fi

count=0
for file in "${files[@]}"; do
  echo "checking $file"
  node --check "$file"
  count=$((count + 1))
done

echo "checked $count JS files"