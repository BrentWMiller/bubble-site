#!/bin/bash
# Pulls what the site shows of the app (its scripted session, Claude colours, motions, toast wording and island
# sizes) from the Claude Bubble app, so the site stays in step with it. Run after changing any of those in the app.
set -euo pipefail
SITE="$(cd "$(dirname "$0")/.." && pwd)"
APP="${CLAUDE_BUBBLE_REPO:-$SITE/../claude-bubble}"
cd "$APP"
swift build --product ClaudeBubble >/dev/null
TMP="$(mktemp)"
.build/debug/ClaudeBubble --export-site "$TMP"
{ printf '// Exported from the Claude Bubble app (scripts/sync-from-app.sh). Do not edit by hand.\nwindow.BUBBLE_APP = '; cat "$TMP"; printf ';\n'; } > "$SITE/data/app.js"
rm -f "$TMP"
echo "Updated data/app.js from $(basename "$APP")"
