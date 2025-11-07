# Railway CLI Deployment Guide

Deploy your JobQ backend to Railway using the command line interface (CLI). This is faster and more efficient than using the web dashboard.

## Prerequisites

- [ ] Node.js installed (for Railway CLI)
- [ ] Git repository pushed to GitHub
- [ ] Railway account created
- [ ] Billing enabled in Railway (for free tier)

## Step 1: Install Railway CLI

### Option A: Using npm (Recommended)
```bash
npm install -g @railway/cli
```

### Option B: Using Homebrew (macOS)
```bash
brew install railway
```

### Option C: Using Scoop (Windows)
```bash
scoop install railway
```

### Verify Installation
```bash
railway --version
```

You should see the Railway CLI version number.

**✅ Checkpoint:** Railway CLI is installed.

---

## Step 2: Login to Railway

```bash
railway login
```

This will:
1. Open your browser
2. Ask you to authorize Railway CLI
3. Return to terminal after successful login

**✅ Checkpoint:** You're logged into Railway CLI.

---

## Step 3: Create New Project

### 3.1 Initialize Railway Project
Navigate to your project root directory:
```bash
cd /home/ramajanallabhaksh/Desktop/PWORK/Personal-project/JobQ
```

Initialize Railway project:
```bash
railway init
```

You'll be prompted to:
1. **Create a new project** or **Link to existing project**
   - Choose: **Create a new project**
2. **Project name:**
   - Enter: `jobq-backend` (or any name you prefer)
3. **Environment:**
   - Choose: `production` (or `development`)

This creates a `.railway` directory and links your local project to Railway.

**✅ Checkpoint:** Railway project is initialized.

---

## Step 4: Configure Services

### 4.1 Create Web Service

Railway will automatically detect your repository structure. We need to configure it for the `server` directory.

Create a `railway.json` configuration file in the project root:

```bash
cd /home/ramajanallabhaksh/Desktop/PWORK/Personal-project/JobQ
```

Create `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server/src/app.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Note:** Railway CLI uses service-based deployment. We'll create services separately.

### 4.2 Alternative: Use Railway Service Commands

Instead of `railway.json`, we'll use Railway CLI commands to configure services directly.

**✅ Checkpoint:** Project structure is ready.

---

## Step 5: Set Environment Variables

### 5.1 Set Variables for Web Service

Set all environment variables using Railway CLI:

```bash
# MongoDB Connection
railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority"

# Redis Connection (DragonflyDB)
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385"

# Generate JWT Secret (run this command first to generate)
openssl rand -base64 32

# Then set it (replace YOUR_SECRET_HERE with the generated secret)
railway variables --set "JWT_SECRET=YOUR_SECRET_HERE"

# Other variables
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_EXPIRE=7d"
railway variables --set "LOG_LEVEL=info"
railway variables --set "LOG_DIR=/tmp/logs"
railway variables --set "TMP_DIR=/tmp"
```

### 5.2 Verify Variables

List all variables:
```bash
railway variables
```

**✅ Checkpoint:** All environment variables are set.

---

## Step 6: Configure Service Settings

### 6.1 Set Root Directory and Build Commands

Railway CLI doesn't directly support setting root directory via CLI, but we can use a `railway.toml` file or deploy from the server directory.

**Option A: Deploy from server directory**

```bash
cd server
railway link
```

Then set variables and deploy from there.

**Option B: Use railway.toml**

Create `railway.toml` in project root:

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd server && npm ci --only=production"

[deploy]
startCommand = "cd server && node src/app.js"
```

**Option C: Use Railway Service Configuration**

We'll configure this when creating the service.

---

## Step 7: Deploy Web Service

### 7.1 Deploy from Server Directory

```bash
cd server
railway up
```

This will:
1. Build your application
2. Deploy to Railway
3. Show deployment logs

### 7.2 Deploy from Project Root (with railway.toml)

If you created `railway.toml` in the project root:

```bash
cd /home/ramajanallabhaksh/Desktop/PWORK/Personal-project/JobQ
railway up --service jobq-api
```

### 7.3 Watch Deployment Logs

```bash
railway logs --follow
```

This shows real-time logs from your deployed service.

**✅ Checkpoint:** Web service is deployed.

---

## Step 8: Create Worker Service

### 8.1 Create New Service for Worker

```bash
railway service create jobq-worker
```

### 8.2 Link Worker Service

```bash
railway link --service jobq-worker
```

### 8.3 Set Worker Environment Variables

```bash
# MongoDB Connection (same as web service)
railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority" --service jobq-worker

# Redis Connection (same as web service)
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385" --service jobq-worker

# Other variables
railway variables --set "NODE_ENV=production" --service jobq-worker
railway variables --set "LOG_LEVEL=info" --service jobq-worker
railway variables --set "LOG_DIR=/tmp/logs" --service jobq-worker
railway variables --set "TMP_DIR=/tmp" --service jobq-worker
```

### 8.4 Configure Worker Service

You'll need to configure the worker service settings (root directory, start command) via Railway dashboard or use Railway API.

**Note:** Some settings like root directory need to be set via Railway dashboard. CLI has limitations for service configuration.

### 8.5 Deploy Worker

```bash
cd server
railway up --service jobq-worker
```

**✅ Checkpoint:** Worker service is deployed.

---

## Step 9: Configure Service Settings via Dashboard

Since Railway CLI has limitations for some settings, you'll need to configure these via the Railway dashboard:

1. Go to [railway.app](https://railway.app)
2. Open your project
3. For each service (web and worker):

**Web Service:**
- Root Directory: `server`
- Build Command: `npm ci --only=production`
- Start Command: `node src/app.js`

**Worker Service:**
- Root Directory: `server`
- Build Command: `npm ci --only=production`
- Start Command: `node src/worker/jobWorker.js`

---

## Step 10: Get Service URL

### 10.1 Get Web Service URL

```bash
railway domain
```

Or check the service URL:
```bash
railway status
```

### 10.2 Generate Domain (if needed)

```bash
railway domain generate
```

**✅ Checkpoint:** Service URL is available.

---

## Step 11: Test Deployment

### 11.1 Test API Endpoint

```bash
# Get your service URL
RAILWAY_URL=$(railway domain)

# Test root endpoint
curl $RAILWAY_URL

# Test health endpoint
curl $RAILWAY_URL/api/jobs/health
```

### 11.2 View Logs

```bash
# Web service logs
railway logs --service jobq-api

# Worker service logs
railway logs --service jobq-worker

# Follow logs in real-time
railway logs --follow
```

**✅ Checkpoint:** Deployment is tested and working.

---

## Useful Railway CLI Commands

### Project Management
```bash
# List all projects
railway list

# Link to existing project
railway link

# Show current project status
railway status

# Open project in browser
railway open
```

### Service Management
```bash
# List all services
railway service list

# Create new service
railway service create SERVICE_NAME

# Link to specific service
railway link --service SERVICE_NAME

# Delete service
railway service delete SERVICE_NAME
```

### Environment Variables
```bash
# Set variable
railway variables --set "KEY=value"

# Set variable for specific service
railway variables --set "KEY=value" --service SERVICE_NAME

# List all variables
railway variables

# List variables for specific service
railway variables --service SERVICE_NAME

# Note: To delete variables, use Railway dashboard or API
```

### Deployment
```bash
# Deploy current service
railway up

# Deploy specific service
railway up --service SERVICE_NAME

# View deployment logs
railway logs

# View logs for specific service
railway logs --service SERVICE_NAME

# Follow logs in real-time
railway logs --follow

# View specific deployment
railway logs --deploy DEPLOYMENT_ID
```

### Domain Management
```bash
# List domains
railway domain

# Generate domain
railway domain generate

# Add custom domain
railway domain add yourdomain.com
```

### Other Useful Commands
```bash
# Show help
railway help

# Show command help
railway help COMMAND

# Check Railway status
railway status

# Open Railway dashboard
railway open

# Show service info
railway service
```

---

## Complete Deployment Script

Create a deployment script to automate the process:

### `deploy.sh`

```bash
#!/bin/bash

# Railway CLI Deployment Script for JobQ Backend

echo "🚀 Starting Railway deployment..."

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

# Navigate to server directory
cd server

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
    echo "✅ JWT_SECRET set"
fi

# Deploy web service
echo "🚀 Deploying web service..."
railway up

# Get service URL
echo "📡 Service URL:"
railway domain

echo "✅ Deployment complete!"
echo "📊 View logs: railway logs --follow"
```

### `deploy-worker.sh`

```bash
#!/bin/bash

# Deploy Worker Service

echo "👷 Deploying worker service..."

cd server

# Link to worker service (create if doesn't exist)
railway service create jobq-worker 2>/dev/null || true
railway link --service jobq-worker

# Set environment variables for worker
railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority" --service jobq-worker
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385" --service jobq-worker
railway variables --set "NODE_ENV=production" --service jobq-worker
railway variables --set "LOG_LEVEL=info" --service jobq-worker
railway variables --set "LOG_DIR=/tmp/logs" --service jobq-worker
railway variables --set "TMP_DIR=/tmp" --service jobq-worker

# Deploy worker
railway up --service jobq-worker

echo "✅ Worker deployed!"
```

Make scripts executable:
```bash
chmod +x deploy.sh deploy-worker.sh
```

Run deployment:
```bash
./deploy.sh
```

---

## Troubleshooting

### Issue: "Command not found: railway"

**Solution:**
```bash
npm install -g @railway/cli
```

### Issue: "Not logged in"

**Solution:**
```bash
railway login
```

### Issue: "Service not found"

**Solution:**
```bash
# Create service first
railway service create SERVICE_NAME

# Then link to it
railway link --service SERVICE_NAME
```

### Issue: "Cannot set root directory via CLI"

**Solution:**
- Root directory must be set via Railway dashboard
- Or deploy from the `server` directory directly
- Or use `railway.toml` configuration file

### Issue: "Build fails"

**Solution:**
- Check if you're in the correct directory
- Verify `package.json` exists
- Check build logs: `railway logs`

### Issue: "Environment variables not working"

**Solution:**
- Verify variables are set: `railway variables`
- Check service is linked: `railway status`
- Set variables for specific service: `railway variables --set "KEY=value" --service SERVICE_NAME`

---

## CLI vs Dashboard Comparison

### CLI Advantages
- ✅ Faster deployment
- ✅ Automatable with scripts
- ✅ Version control friendly
- ✅ Better for CI/CD
- ✅ Command-line workflow

### Dashboard Advantages
- ✅ Visual interface
- ✅ Easier service configuration (root directory, build commands)
- ✅ Better for beginners
- ✅ Visual logs and monitoring

### Recommended Approach
- **Use CLI for:** Environment variables, deployment, logs
- **Use Dashboard for:** Initial service setup (root directory, build/start commands)

---

## Next Steps

1. ✅ Deploy using CLI
2. ✅ Configure service settings via dashboard (if needed)
3. ✅ Set up CI/CD for automatic deployments
4. ✅ Monitor logs using CLI
5. ✅ Set up custom domain

---

## Quick Reference

### Essential Commands
```bash
# Login
railway login

# Initialize project
railway init

# Set variables
railway variables --set "KEY=value"

# Deploy
railway up

# View logs
railway logs --follow

# Get URL
railway domain
```

### Service-Specific Commands
```bash
# Create service
railway service create SERVICE_NAME

# Link to service
railway link --service SERVICE_NAME

# Set variable for service
railway variables --set "KEY=value" --service SERVICE_NAME

# Deploy service
railway up --service SERVICE_NAME

# View service logs
railway logs --service SERVICE_NAME
```

---

**Congratulations! 🎉 Your backend is now deployable via Railway CLI!**

For a complete step-by-step guide, see [RAILWAY_DEPLOYMENT_GUIDE.md](RAILWAY_DEPLOYMENT_GUIDE.md)

