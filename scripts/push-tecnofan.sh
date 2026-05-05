#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
ENV_FILE="$ROOT/.github-push.env"
if [ ! -f "$ENV_FILE" ]; then
  echo "Falta $ENV_FILE"
  echo "cp .github-push.env.example .github-push.env && edita GITHUB_TOKEN"
  exit 1
fi
# shellcheck disable=SC1090
set -a
# shellcheck disable=SC1091
source "$ENV_FILE"
set +a
if [ -z "${GITHUB_TOKEN:-}" ]; then
  echo "GITHUB_TOKEN está vacío en .github-push.env"
  exit 1
fi
REMOTE="https://ottohernandez85-sudo:${GITHUB_TOKEN}@github.com/ottohernandez85-sudo/TecnoFan.git"
git push "$REMOTE" main frontend backend database
