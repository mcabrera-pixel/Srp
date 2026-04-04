#!/bin/bash
# ============================================================
# NLM Daemon - Processes content generation jobs continuously
# ============================================================
# Modes:
#   local - Scans ./input/ for .md files
#   api   - Polls Worker API for pending jobs
# ============================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/.env" 2>/dev/null || true

# Config with defaults
MODE="${MODE:-local}"
POLL_INTERVAL="${POLL_INTERVAL:-30}"
API_BASE_URL="${API_BASE_URL:-http://localhost:8787}"
API_TOKEN="${API_TOKEN:-}"
INPUT_DIR="${INPUT_DIR:-$SCRIPT_DIR/input}"
OUTPUT_DIR="${OUTPUT_DIR:-$SCRIPT_DIR/output}"
LOG_DIR="${LOG_DIR:-$SCRIPT_DIR/logs}"
PROCESSED_DIR="${PROCESSED_DIR:-$SCRIPT_DIR/processed}"

# Create directories
mkdir -p "$INPUT_DIR" "$OUTPUT_DIR" "$LOG_DIR" "$PROCESSED_DIR"

# Logging
log() {
    local level="$1" msg="$2"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] [$level] $msg" | tee -a "$LOG_DIR/daemon.log"
}

# Auth health check
check_auth() {
    log "INFO" "Checking NotebookLM auth..."
    if nlm login --check 2>/dev/null; then
        log "INFO" "Auth OK ✓"
        return 0
    else
        log "WARN" "Auth expired, attempting refresh..."
        nlm login 2>/dev/null || {
            log "ERROR" "Auth refresh failed! Manual 'nlm login' required."
            return 1
        }
    fi
}

# Process a single document (local mode)
process_local_file() {
    local file="$1"
    local basename=$(basename "$file" .md)
    local title=$(echo "$basename" | sed 's/_/ /g' | sed 's/\b\(.\)/\u\1/g')
    local content_type="${2:-video}"

    log "INFO" "Processing: $basename ($content_type)"

    # Select prompt template
    local prompt_file="$SCRIPT_DIR/prompts/generate-${content_type}.md"
    if [ ! -f "$prompt_file" ]; then
        log "ERROR" "Prompt template not found: $prompt_file"
        return 1
    fi

    # Build the full prompt: template + document content
    local full_prompt=$(cat "$prompt_file")
    full_prompt="${full_prompt/\{\{TITLE\}\}/$title}"
    full_prompt="${full_prompt/\{\{DOCUMENT_CONTENT\}\}/$(cat "$file")}"

    # Execute via Claude Code headless
    local result_file="$OUTPUT_DIR/${basename}_result.json"
    log "INFO" "Sending to Claude Code..."

    echo "$full_prompt" | claude -p \
        --allowedTools "mcp__notebooklm-mcp__*" \
        --output-format json \
        > "$result_file" 2>>"$LOG_DIR/${basename}_error.log"

    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        log "INFO" "✓ Completed: $basename"
        mv "$file" "$PROCESSED_DIR/"
    else
        log "ERROR" "✗ Failed: $basename (exit code: $exit_code)"
    fi

    return $exit_code
}

# Process a job from the API
process_api_job() {
    # Get next pending job
    local job_json=$(curl -sf \
        -H "Authorization: Bearer $API_TOKEN" \
        "$API_BASE_URL/api/jobs/next" 2>/dev/null)

    if [ -z "$job_json" ] || [ "$job_json" = "null" ]; then
        return 1  # No jobs available
    fi

    local job_id=$(echo "$job_json" | jq -r '.id')
    local title=$(echo "$job_json" | jq -r '.title')
    local content_type=$(echo "$job_json" | jq -r '.content_type')
    local document_content=$(echo "$job_json" | jq -r '.content_md // empty')

    log "INFO" "Processing job $job_id: $title ($content_type)"

    # Mark as processing
    curl -sf -X PUT \
        -H "Authorization: Bearer $API_TOKEN" \
        -H "Content-Type: application/json" \
        -d '{"status":"processing"}' \
        "$API_BASE_URL/api/jobs/$job_id" >/dev/null

    # Select prompt template and fill in
    local prompt_file="$SCRIPT_DIR/prompts/generate-${content_type}.md"
    local full_prompt=$(cat "$prompt_file")
    full_prompt="${full_prompt/\{\{TITLE\}\}/$title}"
    full_prompt="${full_prompt/\{\{DOCUMENT_CONTENT\}\}/$document_content}"

    # Execute via Claude Code headless
    local result=$(echo "$full_prompt" | claude -p \
        --allowedTools "mcp__notebooklm-mcp__*" \
        --output-format json 2>>"$LOG_DIR/job_${job_id}.log")

    local exit_code=$?

    if [ $exit_code -eq 0 ]; then
        # Update job as completed
        curl -sf -X PUT \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"completed\",\"result\":$(echo "$result" | jq -c '.')}" \
            "$API_BASE_URL/api/jobs/$job_id" >/dev/null
        log "INFO" "✓ Job $job_id completed"
    else
        curl -sf -X PUT \
            -H "Authorization: Bearer $API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"status\":\"failed\",\"error\":\"Exit code $exit_code\"}" \
            "$API_BASE_URL/api/jobs/$job_id" >/dev/null
        log "ERROR" "✗ Job $job_id failed"
    fi
}

# ========== MAIN LOOP ==========
log "INFO" "============================================"
log "INFO" "NLM Daemon starting (mode: $MODE)"
log "INFO" "============================================"

# Initial auth check
check_auth || { log "ERROR" "Cannot start without auth. Run 'nlm login' first."; exit 1; }

auth_check_counter=0

while true; do
    # Periodic auth check (every 10 cycles)
    auth_check_counter=$((auth_check_counter + 1))
    if [ $((auth_check_counter % 10)) -eq 0 ]; then
        check_auth || log "WARN" "Auth check failed, will retry next cycle"
    fi

    if [ "$MODE" = "local" ]; then
        # Local mode: scan input directory
        found=false
        for file in "$INPUT_DIR"/*.md; do
            [ -f "$file" ] || continue
            found=true
            process_local_file "$file" "video" || true
            sleep 5  # Rate limiting between jobs
        done

        if [ "$found" = false ]; then
            log "DEBUG" "No files in input/. Waiting..."
        fi
    else
        # API mode: poll for jobs
        process_api_job || true
    fi

    sleep "$POLL_INTERVAL"
done
