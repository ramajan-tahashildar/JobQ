#!/bin/bash

# Railway CLI Deployment Script for JobQ Backend (Web Service)

echo "🚀 Starting Railway deployment for JobQ Backend..."

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

# Initialize Railway project if not already initialized
if [ ! -d ".railway" ]; then
    echo "🔧 Initializing Railway project..."
    railway init
fi

# Set environment variables
echo "📝 Setting environment variables..."

railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority"
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385"
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_EXPIRE=7d"
railway variables --set "LOG_LEVEL=info"
railway variables --set "LOG_DIR=/tmp/logs"
railway variables --set "TMP_DIR=/tmp"

# Check if JWT_SECRET is set
if ! railway variables | grep -q JWT_SECRET; then
    echo "🔑 Generating JWT_SECRET..."
    JWT_SECRET=$(openssl rand -base64 32)
    railway variables --set "JWT_SECRET=$JWT_SECRET"
    echo "✅ JWT_SECRET set: $JWT_SECRET"
else
    echo "✅ JWT_SECRET already set"
fi

# Show current variables
echo ""
echo "📋 Current environment variables:"
railway variables

# Deploy web service
echo ""
echo "🚀 Deploying web service..."
railway up

# Get service URL
echo ""
echo "📡 Service URL:"
railway domain

echo ""
echo "✅ Deployment complete!"
echo "📊 View logs: railway logs --follow"
echo "🌐 Open dashboard: railway open"

