#!/usr/bin/env bash
set -euo pipefail

# always run from the repo root (folder where this script lives)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# sanity: show node version (playwright needs node 18+)
echo "node: $(node -v)"
echo "npm:  $(npm -v)"

# install deps if needed (pick ONE: npm / pnpm / yarn / bun)
if [ -f package-lock.json ]; then
  npm ci
elif [ -f pnpm-lock.yaml ]; then
  pnpm install --frozen-lockfile
elif [ -f yarn.lock ]; then
  yarn install --frozen-lockfile
elif [ -f bun.lockb ]; then
  bun install
else
  npm install
fi

# ensure browsers are installed (safe to run repeatedly)
npx playwright install

# run tests
npx playwright test
