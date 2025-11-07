#!/bin/bash

# Railway CLI Deployment Script for JobQ Worker Service

echo "👷 Starting Railway deployment for JobQ Worker..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔐 Please login to Railway..."
    railway login
fi

# Navigate to server directory (if not already there)
if [ ! -f "package.json" ]; then
    echo "📁 Navigating to server directory..."
    cd server || exit 1
fi

# Create worker service if it doesn't exist
echo "🔧 Creating/connecting to worker service..."
railway service create jobq-worker 2>/dev/null || true
railway link --service jobq-worker

# Set environment variables for worker
echo "📝 Setting environment variables for worker..."

railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority" --service jobq-worker
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385" --service jobq-worker
railway variables --set "NODE_ENV=production" --service jobq-worker
railway variables --set "LOG_LEVEL=info" --service jobq-worker
railway variables --set "LOG_DIR=/tmp/logs" --service jobq-worker
railway variables --set "TMP_DIR=/tmp" --service jobq-worker

# Show current variables
echo ""
echo "📋 Current environment variables for worker:"
railway variables --service jobq-worker

# Deploy worker
echo ""
echo "🚀 Deploying worker service..."
railway up --service jobq-worker

echo ""
echo "✅ Worker deployment complete!"
echo "📊 View logs: railway logs --follow --service jobq-worker"
echo "🌐 Open dashboard: railway open"

