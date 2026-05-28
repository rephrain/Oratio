#!/bin/bash

# --- Oratio Docker Hub Push Script ---

IMAGE_NAME="rephrainarchaimeric/oratio:latest"

echo "🐳 Building Docker image..."
docker build -t $IMAGE_NAME .

echo "🔑 Logging into Docker Hub..."
# Assumes the user is already logged in or will be prompted
docker login

echo "🚀 Pushing image to Docker Hub..."
docker push $IMAGE_NAME

echo "✅ Image pushed successfully!"
