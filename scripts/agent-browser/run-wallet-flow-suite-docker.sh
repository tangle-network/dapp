#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DAPP_DIR="$(cd "${SCRIPT_DIR}/../.." && pwd)"
CODE_DIR="$(cd "${DAPP_DIR}/.." && pwd)"

IMAGE="${PLAYWRIGHT_IMAGE:-mcr.microsoft.com/playwright:v1.51.1-noble}"
WORKSPACE_MOUNT="${CODE_DIR}:/work"
WORKDIR="/work/dapp"
HOST_UID="$(id -u)"
HOST_GID="$(id -g)"

echo "[wallet-flows:docker] image=${IMAGE}"
echo "[wallet-flows:docker] workdir=${WORKDIR}"

if [[ -f "${DAPP_DIR}/.env.local" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "${DAPP_DIR}/.env.local"
  set +a
fi

ARGS=("$@")
if [[ "${#ARGS[@]}" -gt 0 && "${ARGS[0]}" == "--" ]]; then
  ARGS=("${ARGS[@]:1}")
fi

ENV_ARGS=()
for name in OPENAI_API_KEY ANTHROPIC_API_KEY GOOGLE_GENERATIVE_AI_API_KEY LLM_BASE_URL AGENT_BROWSER_DRIVER_MODULE AGENT_BROWSER_PROVIDER AGENT_BROWSER_MODEL AGENT_BROWSER_TIMEOUT_MS AGENT_BROWSER_MAX_TURNS AGENT_BROWSER_OUTPUT_DIR AGENT_WALLET_EXTENSION_PATHS AGENT_WALLET_USER_DATA_DIR AGENT_WALLET_PASSWORD AGENT_WALLET_RESET_PROFILE AGENT_WALLET_BOOTSTRAP AGENT_WALLET_BOOTSTRAP_RETRIES; do
  if [[ -n "${!name:-}" ]]; then
    ENV_ARGS+=("-e" "${name}")
  fi
done

if [[ -z "${AGENT_BROWSER_DRIVER_MODULE:-}" ]]; then
  ENV_ARGS+=("-e" "AGENT_BROWSER_DRIVER_MODULE=file:///work/agent-browser-driver/dist/index.js")
fi

exec docker run --rm --network host \
  --user "${HOST_UID}:${HOST_GID}" \
  -v "${WORKSPACE_MOUNT}" \
  -w "${WORKDIR}" \
  "${ENV_ARGS[@]}" \
  "${IMAGE}" \
  bash -lc '
set -euo pipefail
Xvfb :99 -screen 0 1280x1024x24 -nolisten tcp >/tmp/xvfb.log 2>&1 &
XVFB_PID=$!
cleanup() {
  kill "${XVFB_PID}" >/dev/null 2>&1 || true
}
trap cleanup EXIT
export DISPLAY=:99
for _ in $(seq 1 50); do
  if xdpyinfo -display "${DISPLAY}" >/dev/null 2>&1; then
    break
  fi
  sleep 0.1
done
if [[ "${AGENT_WALLET_RESET_PROFILE:-0}" == "1" && -n "${AGENT_WALLET_USER_DATA_DIR:-}" ]]; then
  rm -rf "${AGENT_WALLET_USER_DATA_DIR}"
fi
if [[ "${AGENT_WALLET_BOOTSTRAP:-0}" == "1" && -n "${AGENT_WALLET_EXTENSION_PATHS:-}" ]]; then
  IFS=, read -r BOOTSTRAP_EXTENSION _ <<<"${AGENT_WALLET_EXTENSION_PATHS}"
  if [[ -n "${BOOTSTRAP_EXTENSION:-}" ]]; then
    MAX_BOOTSTRAP_ATTEMPTS="${AGENT_WALLET_BOOTSTRAP_RETRIES:-3}"
    ATTEMPT=1
    until [[ "${ATTEMPT}" -gt "${MAX_BOOTSTRAP_ATTEMPTS}" ]]; do
      BOOTSTRAP_ARGS=(
        --extension-path "${BOOTSTRAP_EXTENSION}"
        --user-data-dir "${AGENT_WALLET_USER_DATA_DIR:-/work/dapp/.agent-wallet-profile}"
      )
      if [[ -n "${AGENT_WALLET_PASSWORD:-}" ]]; then
        BOOTSTRAP_ARGS+=(--password "${AGENT_WALLET_PASSWORD}")
      fi
      if node scripts/agent-browser/bootstrap-wallet-profile.mjs "${BOOTSTRAP_ARGS[@]}"; then
        break
      fi

      if [[ "${ATTEMPT}" -eq "${MAX_BOOTSTRAP_ATTEMPTS}" ]]; then
        echo "[wallet-flows:docker] bootstrap failed after ${MAX_BOOTSTRAP_ATTEMPTS} attempts" >&2
        exit 1
      fi

      echo "[wallet-flows:docker] bootstrap attempt ${ATTEMPT}/${MAX_BOOTSTRAP_ATTEMPTS} failed; retrying" >&2
      ATTEMPT=$((ATTEMPT + 1))
      sleep 1
    done
  fi
fi
node scripts/agent-browser/run-wallet-flow-suite.mjs "$@"
' _ "${ARGS[@]}"
