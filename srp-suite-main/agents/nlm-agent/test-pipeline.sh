#!/bin/bash
# ============================================================
# Test Pipeline - Quick test of the NLM content generation
# ============================================================
# Usage:
#   ./test-pipeline.sh document.md [video|audio|infographic]
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Args
DOC_FILE="${1:-}"
CONTENT_TYPE="${2:-video}"

if [ -z "$DOC_FILE" ]; then
    echo "Usage: ./test-pipeline.sh <document.md> [video|audio|infographic]"
    echo ""
    echo "Examples:"
    echo "  ./test-pipeline.sh input/procedure.md video"
    echo "  ./test-pipeline.sh input/procedure.md audio"
    exit 1
fi

if [ ! -f "$DOC_FILE" ]; then
    echo "Error: File not found: $DOC_FILE"
    exit 1
fi

# Check prerequisites
echo "=== NLM Pipeline Test ==="
echo ""

echo "[1/4] Checking Claude Code..."
if command -v claude &>/dev/null; then
    echo "  ✓ Claude Code found: $(claude --version 2>/dev/null || echo 'installed')"
else
    echo "  ✗ Claude Code not found. Install: https://docs.anthropic.com/claude-code"
    exit 1
fi

echo "[2/4] Checking NotebookLM auth..."
if nlm login --check 2>/dev/null; then
    echo "  ✓ NotebookLM authenticated"
else
    echo "  ✗ NotebookLM auth expired. Running 'nlm login'..."
    nlm login
fi

echo "[3/4] Preparing prompt..."
BASENAME=$(basename "$DOC_FILE" .md)
TITLE=$(echo "$BASENAME" | sed 's/_/ /g' | sed 's/\b\(.\)/\u\1/g')
PROMPT_FILE="$SCRIPT_DIR/prompts/generate-${CONTENT_TYPE}.md"

if [ ! -f "$PROMPT_FILE" ]; then
    echo "  ✗ Prompt template not found: $PROMPT_FILE"
    exit 1
fi

FULL_PROMPT=$(cat "$PROMPT_FILE")
FULL_PROMPT="${FULL_PROMPT/\{\{TITLE\}\}/$TITLE}"
DOC_CONTENT=$(cat "$DOC_FILE")
FULL_PROMPT="${FULL_PROMPT/\{\{DOCUMENT_CONTENT\}\}/$DOC_CONTENT}"

echo "  ✓ Prompt ready ($(echo "$FULL_PROMPT" | wc -c) chars)"
echo "  Title: $TITLE"
echo "  Type:  $CONTENT_TYPE"

echo "[4/4] Executing via Claude Code..."
echo "  (This may take 2-5 minutes)"
echo ""
echo "--- Claude Code Output ---"

mkdir -p "$SCRIPT_DIR/output"
RESULT_FILE="$SCRIPT_DIR/output/${BASENAME}_${CONTENT_TYPE}_result.json"

echo "$FULL_PROMPT" | claude -p \
    --allowedTools "mcp__notebooklm-mcp__*" \
    --output-format json \
    > "$RESULT_FILE" 2>&1

EXIT_CODE=$?

echo ""
echo "--- End Output ---"
echo ""

if [ $EXIT_CODE -eq 0 ]; then
    echo "✓ Pipeline test completed successfully!"
    echo "  Result saved: $RESULT_FILE"
else
    echo "✗ Pipeline test failed (exit code: $EXIT_CODE)"
    echo "  Check output above for errors"
fi

exit $EXIT_CODE
