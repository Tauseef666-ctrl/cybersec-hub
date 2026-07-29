#!/bin/bash
set -e

echo "=== CyberSec Hub Electron Builder ==="
echo ""

cd "$(dirname "$0")"

echo "[1/4] Building index.html from sources..."
cat shell_top.html sections.html shell_bot.html > index.html
echo "  -> index.html generated"
echo ""

echo "[2/4] Generating app icon..."
node electron/generate-icon.js
echo ""

echo "[3/4] Installing npm dependencies..."
npm install
echo ""

echo "[4/4] Building desktop packages..."
echo ""

# Linux builds (always works on Linux)
echo "--- Linux ---"
npx electron-builder --linux 2>&1 | grep -E '(building|WARNING|ERROR|failed|success)'
echo ""

# Windows: try NSIS installer first (needs wine), fall back to portable zip
echo "--- Windows ---"
if command -v wine &>/dev/null || command -v wine64 &>/dev/null; then
  echo "  wine detected, building NSIS installer..."
  npx electron-builder --win 2>&1 | grep -E '(building|WARNING|ERROR|failed|success|release)'
else
  echo "  wine not found — building portable (no installer)..."
  # Build unpacked directory first
  npx electron-builder --win --config.win.target='dir' 2>&1 | grep -E '(building|WARNING|ERROR|packaging)'
  # Zip the unpacked directory for distribution
  if [ -d "release/win-unpacked" ]; then
    echo "  Packaging portable archive..."
    cd release
    rm -f cybersec-hub-windows-x64.zip
    tar -czf cybersec-hub-windows-x64.tar.gz win-unpacked/
    cd ..
    echo "  -> release/cybersec-hub-windows-x64.zip"
  fi
fi
echo ""

echo "====================================="
echo "  BUILD COMPLETE"
echo "====================================="
echo ""
echo "Outputs:"
ls -lh release/ 2>/dev/null | awk '{print "  " $5 "  " $9}'
echo ""
echo "Run locally:  npm start"
