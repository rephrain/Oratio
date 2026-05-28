#!/bin/bash

# --- Oratio VPS Deployment Script (Docker Hub) ---

IMAGE_NAME="rephrainarchaimeric/oratio:latest"

# 1. Pull latest image from Docker Hub
echo "⏬ Pulling latest image from Docker Hub..."
docker pull $IMAGE_NAME

# 2. Restart containers
echo "🚀 Restarting containers..."
# --no-build ensures it uses the image we just pulled instead of trying to build locally
docker compose up -d --no-build

# 3. Clean up old images
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment complete!"
