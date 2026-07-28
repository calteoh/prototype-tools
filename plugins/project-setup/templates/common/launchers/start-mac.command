#!/usr/bin/env bash
# Double-click this file in Finder to preview the {{PROJECT_NAME}} prototypes locally.
# It starts a tiny local web server in this folder and opens your browser.
# Leave this window open while you browse. Close it (or press Ctrl+C) when done.

# Move into the folder this script lives in (the build folder).
cd "$(dirname "$0")" || exit 1

# Keep the Terminal window open with a clear message when something goes wrong,
# instead of letting a stack trace scroll by and the window close on its own.
fail() {
  echo ""
  echo "  $1"
  echo ""
  echo "  Press Return to close."
  read -r _
  exit 1
}

# Find a free port by probing upward from a base port, so more than one build
# folder can run at the same time without colliding on a single fixed port.
# Skipping any port that already has a listener also means a still-running server
# from another build can never quietly "win" and show the wrong content.
BASE_PORT=8000
PORT=""
p="$BASE_PORT"
end=$((BASE_PORT + 50))
while [ "$p" -lt "$end" ]; do
  if ! lsof -nP -iTCP:"$p" -sTCP:LISTEN >/dev/null 2>&1; then
    PORT="$p"
    break
  fi
  p=$((p + 1))
done

if [ -z "$PORT" ]; then
  fail "Couldn't find a free port between $BASE_PORT and $((end - 1)). Close some other preview windows and double-click this file again."
fi

URL="http://localhost:$PORT/"

echo ""
echo "  {{PROJECT_NAME}} — Concept Prototypes"
echo "  Starting a local preview at $URL"
if [ "$PORT" != "$BASE_PORT" ]; then
  echo "  (Port $BASE_PORT was busy, so this build is using $PORT instead.)"
fi
echo "  Keep this window open while you browse."
echo "  To stop: close this window or press Control + C."
echo ""

# Pick a local server using whatever is available on this machine.
if command -v python3 >/dev/null 2>&1; then
  SERVER_CMD=(python3 -m http.server "$PORT")
elif command -v python >/dev/null 2>&1; then
  SERVER_CMD=(python -m http.server "$PORT")
elif command -v npx >/dev/null 2>&1; then
  SERVER_CMD=(npx --yes serve -l "$PORT" .)
else
  echo "  Could not find Python or Node on this machine."
  echo "  Install either one, then double-click this file again:"
  echo "    Python  →  https://www.python.org/downloads/"
  echo "    Node    →  https://nodejs.org  (click the green LTS button)"
  echo ""
  echo "  Press Return to close."
  read -r _
  exit 1
fi

# Start the local server in the background so we can confirm OUR server — not some
# other build's leftover server — is the one bound to the port before we open a tab.
"${SERVER_CMD[@]}" &
SERVER_PID=$!

# True when $1 is our server process or a descendant of it. `npx serve` binds the
# port in a child process, so an exact PID match alone would miss that case.
owned_by_server() {
  local pid="$1"
  while [ -n "$pid" ] && [ "$pid" -gt 1 ]; do
    [ "$pid" = "$SERVER_PID" ] && return 0
    pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
  done
  return 1
}

# Open the browser only once OUR server owns the port — never on a blind timer, and
# never onto a response that's actually coming from another build's server.
(
  tries=0
  while [ "$tries" -lt 40 ]; do
    # If our server has already exited (e.g. it couldn't bind), open nothing.
    kill -0 "$SERVER_PID" 2>/dev/null || exit 0
    listener="$(lsof -nP -iTCP:"$PORT" -sTCP:LISTEN -t 2>/dev/null | head -n1)"
    if [ -n "$listener" ] && owned_by_server "$listener"; then
      open "$URL"
      exit 0
    fi
    sleep 0.25
    tries=$((tries + 1))
  done
) &
OPENER_PID=$!

# Control + C or closing the window tears everything down quietly — no scary message.
trap 'kill "$SERVER_PID" "$OPENER_PID" 2>/dev/null; exit 0' INT TERM HUP

# Block here while the server runs; Control + C interrupts the wait via the trap.
wait "$SERVER_PID"
STATUS=$?

# The server exited on its own (not via Control + C, which the trap handles).
# Stop the browser-opener so it can't open a stale URL after the fact.
kill "$OPENER_PID" 2>/dev/null

# A clean exit is fine; any other status means the server couldn't start — most
# likely the port was taken between the check above and the bind — so surface it
# loudly instead of pretending it worked.
if [ "$STATUS" -ne 0 ]; then
  fail "The local preview couldn't start on $URL (the server exited with code $STATUS). The address may already be in use — close other preview windows, then double-click this file again."
fi
