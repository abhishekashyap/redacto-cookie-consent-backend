#!/bin/bash

# Cookie Consent Backend Startup Script

echo "🚀 Starting Redacto Cookie Consent Backend..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found. Creating from template..."
    cp env.example .env
    echo "📝 Please edit .env file with your configuration before running again."
    exit 1
fi

# Create necessary directories
mkdir -p data logs

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Build the project
echo "🔨 Building TypeScript project..."
npm run build

# Start the server
echo "🌟 Starting server..."
npm start
