#!/bin/bash
# TensorBored Demo Startup Script
# 
# This script:
# 1. Generates demo data if it doesn't exist
# 2. Starts TensorBoard on port 7860 (HuggingFace Spaces default)

set -e

LOGDIR="/app/logs"

echo "=============================================="
echo "  TensorBored Demo"
echo "=============================================="
echo ""

# Generate demo data if it doesn't exist
if [ ! -d "$LOGDIR" ] || [ -z "$(ls -A $LOGDIR 2>/dev/null)" ]; then
    echo "Generating demo data..."
    cd /app
    python generate_demo_data.py
    echo ""
fi

echo "Starting TensorBoard..."
echo "  Log directory: $LOGDIR"
echo "  Port: 7860"
echo ""
echo "=============================================="

# Start TensorBoard
# - Bind to all interfaces (required for Docker/HuggingFace Spaces)
# - Port 7860 is HuggingFace Spaces default
# - Disable reload for static demo
exec tensorboard \
    --logdir="$LOGDIR" \
    --host=0.0.0.0 \
    --port=7860 \
    --reload_interval=0
