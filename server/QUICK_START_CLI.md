# Quick Start: Deploy to Railway via CLI

Deploy your JobQ backend to Railway in 5 minutes using the command line.

## Prerequisites

- Node.js installed
- Railway account (with billing enabled)
- Your code pushed to GitHub

## Quick Deploy (5 Steps)

### Step 1: Install Railway CLI
```bash
npm install -g @railway/cli
```

### Step 2: Login to Railway
```bash
railway login
```

### Step 3: Navigate to Server Directory
```bash
cd server
```

### Step 4: Run Deployment Script
```bash
# Deploy web service (API)
./deploy.sh

# Deploy worker service (in another terminal or after web service)
./deploy-worker.sh
```

### Step 5: Get Your API URL
```bash
railway domain
```

## Manual Deployment (Alternative)

If you prefer to deploy manually:

```bash
# 1. Initialize Railway project
cd server
railway init

# 2. Set environment variables
railway variables --set "MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority"
railway variables --set "REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385"

# Generate JWT_SECRET
JWT_SECRET=$(openssl rand -base64 32)
railway variables --set "JWT_SECRET=$JWT_SECRET"

# Set other variables
railway variables --set "NODE_ENV=production"
railway variables --set "JWT_EXPIRE=7d"
railway variables --set "LOG_LEVEL=info"
railway variables --set "LOG_DIR=/tmp/logs"
railway variables --set "TMP_DIR=/tmp"

# 3. Deploy
railway up

# 4. Get URL
railway domain
```

## Important Notes

### Service Configuration
After deploying via CLI, you need to configure service settings via Railway dashboard:
1. Go to [railway.app](https://railway.app)
2. Open your project
3. For web service:
   - Root Directory: `server`
   - Build Command: `npm ci --only=production`
   - Start Command: `node src/app.js`
4. For worker service:
   - Root Directory: `server`
   - Build Command: `npm ci --only=production`
   - Start Command: `node src/worker/jobWorker.js`

### Worker Service Setup
```bash
# Create worker service
railway service create jobq-worker

# Link to worker service
railway link --service jobq-worker

# Set variables for worker
railway variables --set "MONGO_URI=..." --service jobq-worker
railway variables --set "REDIS_URL=..." --service jobq-worker
# ... (other variables)

# Deploy worker
railway up --service jobq-worker
```

## Useful Commands

```bash
# View logs
railway logs --follow

# View logs for specific service
railway logs --follow --service jobq-worker

# Check status
railway status

# Open dashboard
railway open

# List variables
railway variables

# Get service URL
railway domain
```

## Troubleshooting

### "Command not found: railway"
```bash
npm install -g @railway/cli
```

### "Not logged in"
```bash
railway login
```

### Service settings (root directory, build commands)
Configure these via Railway dashboard (see Important Notes above).

## Next Steps

1. ✅ Deploy using CLI
2. ✅ Configure service settings via dashboard
3. ✅ Test your API
4. ✅ Set up custom domain (optional)

---

**For detailed guide, see [RAILWAY_CLI_DEPLOYMENT.md](RAILWAY_CLI_DEPLOYMENT.md)**

