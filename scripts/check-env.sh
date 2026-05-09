#!/usr/bin/env bash
# scripts/check-env.sh — pre-flight for `npm run dev`.
# Checks only what NutriMex needs: GEMINI_API_KEY in apps/agent/.env.
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_ROOT"

PROBLEMS=()

# ---------- npx (for the MCP server) -----------------------------------------
if ! command -v npx >/dev/null 2>&1; then
  PROBLEMS+=("npx is not on PATH. Install Node.js 20+ (npm bundles npx).")
fi

# ---------- agent/.env — only GEMINI_API_KEY required ------------------------
AGENT_ENV="$REPO_ROOT/apps/agent/.env"
if [[ ! -f "$AGENT_ENV" ]]; then
  PROBLEMS+=("apps/agent/.env is missing. Create it with: echo 'GEMINI_API_KEY=your_key' > apps/agent/.env")
else
  read_var() {
    local key="$1"
    grep -E "^[[:space:]]*${key}=" "$AGENT_ENV" | tail -n1 | sed -E "s/^[[:space:]]*${key}=//; s/^[\"']//; s/[\"'][[:space:]]*$//; s/[[:space:]]+$//"
  }
  is_stub() {
    local v="$1"
    [[ -z "$v" ]] && return 0
    case "$v" in stub*|"<paste"*|"<set"*|"replace-with-"*) return 0 ;; esac
    return 1
  }
  val="$(read_var GEMINI_API_KEY || true)"
  if is_stub "$val"; then
    PROBLEMS+=("GEMINI_API_KEY is unset in apps/agent/.env. Get a key at https://aistudio.google.com → Get API key.")
  fi
fi

# ---------- Report -----------------------------------------------------------
if [[ ${#PROBLEMS[@]} -gt 0 ]]; then
  echo ""
  echo "Pre-flight check found ${#PROBLEMS[@]} problem(s):"
  echo ""
  i=1
  for p in "${PROBLEMS[@]}"; do
    echo "  $i. $p"
    i=$((i+1))
  done
  echo ""
  echo "Fix these and re-run \`npm run dev\`."
  exit 1
fi

exit 0
