#!/bin/bash
# Gateway Integration Test Runner
# Usage: ./run-tests.sh [gateway-url]

GATEWAY_URL="${1:-http://localhost:8081}"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
GATEWAY_DIR="$(dirname "$SCRIPT_DIR")/../botnet-arch/gateway"

echo "╔════════════════════════════════════════════════════════╗"
echo "║       Gateway Integration Test Runner                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Check if gateway is running
echo "Checking gateway at $GATEWAY_URL..."
if ! curl -s "$GATEWAY_URL/health" > /dev/null 2>&1; then
    echo "Gateway is not running. Starting gateway..."

    # Check if gateway exists
    if [ ! -d "$GATEWAY_DIR" ]; then
        echo "Error: Gateway directory not found at $GATEWAY_DIR"
        exit 1
    fi

    # Start gateway in background
    cd "$GATEWAY_DIR"
    node src/index.js &
    GATEWAY_PID=$!
    sleep 2

    # Verify it started
    if ! curl -s "$GATEWAY_URL/health" > /dev/null 2>&1; then
        echo "Error: Failed to start gateway"
        kill $GATEWAY_PID 2>/dev/null
        exit 1
    fi

    echo "Gateway started with PID $GATEWAY_PID"
    STARTED_GATEWAY=true
fi

# Run tests
echo ""
echo "Running integration tests..."
echo ""

GATEWAY_BASE="$GATEWAY_URL" node "$SCRIPT_DIR/gateway-integration.test.js"
TEST_RESULT=$?

# Stop gateway if we started it
if [ "$STARTED_GATEWAY" = true ]; then
    echo "Stopping gateway..."
    kill $GATEWAY_PID 2>/dev/null
fi

exit $TEST_RESULT
