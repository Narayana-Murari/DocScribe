#!/bin/zsh
# Start the DocScribe demo. Uses the project-local Node in .node/ if present,
# otherwise falls back to the system Node (18+ required, 20 recommended).
cd "$(dirname "$0")"
if [ -x "$PWD/.node/bin/node" ]; then
  export PATH="$PWD/.node/bin:$PATH"
fi
exec node server/index.js
