#!/bin/bash
# ============================================================
# NLM Agent - VM Setup Script (Cloudflare-first architecture)
# Run as root on the existing GCP VM (Ubuntu 22.04)
# ============================================================

set -euo pipefail

echo "=========================================="
echo "  NLM Daemon - VM Setup"
echo "=========================================="

# 1. System packages
echo "[1/6] Installing system packages..."
apt update && apt install -y \
    curl wget git jq \
    google-chrome-stable || true

# 2. Install Node.js (for Claude Code)
echo "[2/6] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 3. Install Claude Code
echo "[3/6] Installing Claude Code..."
npm install -g @anthropic-ai/claude-code

# 4. Install notebooklm-mcp-cli
echo "[4/6] Installing notebooklm-mcp-cli..."
pip install notebooklm-mcp-cli || pip3 install notebooklm-mcp-cli

# 5. Create service user and setup
echo "[5/6] Setting up NLM daemon..."
useradd -r -m -s /bin/bash nlm 2>/dev/null || true

mkdir -p /opt/nlm-agent
cp -r . /opt/nlm-agent/
chown -R nlm:nlm /opt/nlm-agent
chmod +x /opt/nlm-agent/daemon.sh
chmod +x /opt/nlm-agent/test-pipeline.sh

# Copy .env
if [ ! -f /opt/nlm-agent/.env ]; then
    cp /opt/nlm-agent/.env.example /opt/nlm-agent/.env
    echo "  → Edit /opt/nlm-agent/.env with your API_TOKEN"
fi

# 6. Install systemd service
echo "[6/6] Installing systemd service..."
cp /opt/nlm-agent/deploy/nlm-daemon.service /etc/systemd/system/
systemctl daemon-reload
systemctl enable nlm-daemon

echo ""
echo "=========================================="
echo "  Setup complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "  1. Login to NotebookLM (requires VNC/X11 one time):"
echo "     su - nlm -c 'nlm login'"
echo ""
echo "  2. Configure Claude Code:"
echo "     su - nlm -c 'claude'"
echo "     (Accept permissions, configure MCP)"
echo ""
echo "  3. Edit config:"
echo "     nano /opt/nlm-agent/.env"
echo ""
echo "  4. Start the daemon:"
echo "     systemctl start nlm-daemon"
echo "     journalctl -u nlm-daemon -f"
