#!/usr/bin/env bash
set -euo pipefail

if ! command -v luac >/dev/null 2>&1; then
  echo "luac not found"
  exit 1
fi

files=()
if [ -f df_game_r.lua ]; then
  files+=("df_game_r.lua")
fi

while IFS= read -r file; do
  files+=("$file")
done < <(find script -name "*.lua" -type f | sort)

count=0
for file in "${files[@]}"; do
  echo "checking $file"
  luac -p "$file"
  count=$((count + 1))
done

echo "checked $count Lua files"
