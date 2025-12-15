#!/bin/bash
# Jotly Development Script
# Starts both backend and frontend for development

set -e

PROJECT_DIR="$(dirname "$(dirname "$(realpath "$0")")")"
BACKEND_DIR="$PROJECT_DIR/backend"
DESKTOP_DIR="$PROJECT_DIR/desktop"

echo "🎤 Starting Jotly development environment..."
echo "   Backend: $BACKEND_DIR"
echo "   Desktop: $DESKTOP_DIR"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down..."
    if [ -n "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend
echo ""
echo "📦 Starting Python backend..."
cd "$BACKEND_DIR"
uv run uvicorn src.main:app --host 127.0.0.1 --port 8765 --reload &
BACKEND_PID=$!

# Wait for backend to be ready
echo "⏳ Waiting for backend..."
for i in {1..30}; do
    if curl -s http://127.0.0.1:8765/health > /dev/null 2>&1; then
        echo "✅ Backend ready!"
        break
    fi
    sleep 1
done

# Check if backend started
if ! curl -s http://127.0.0.1:8765/health > /dev/null 2>&1; then
    echo "❌ Backend failed to start"
    exit 1
fi

# Start Desktop
echo ""
echo "⚡ Starting Desktop..."
cd "$DESKTOP_DIR"
bun run dev

# Wait for processes
wait
