# Railway Deployment Guide - Step by Step

This is a complete step-by-step guide to deploy your JobQ backend to Railway with MongoDB and Redis.

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- [ ] GitHub account
- [ ] Your code pushed to a GitHub repository
- [ ] Railway account (we'll create this in Step 1)
- [ ] **Important**: Railway account must have billing enabled (free $5 credit works)

---

## ⚠️ Important: Railway Plan Requirements

### Understanding Railway's Free Tier

Railway offers a **free $5 credit per month** which is sufficient for deploying:
- ✅ Web services (API)
- ✅ Worker services
- ✅ MongoDB database
- ✅ Redis database

### If You See "Limited Access" Banner

If you see a message saying **"Your account is on a limited plan and can only deploy databases"**:

**This means:**
- Your Railway account needs billing information added (even for free tier)
- Railway requires a payment method to be added to use the $5 free credit
- You can still use the free tier - you won't be charged unless you exceed $5/month

**Solution:**
1. Click on **"Upgrade your plan"** or go to Railway Settings
2. Add a payment method (credit card)
3. You'll get $5 free credit per month automatically
4. You won't be charged unless you exceed the free credit
5. After adding payment method, you'll be able to deploy web and worker services

**Note:** This is Railway's way of preventing abuse. The free tier is truly free as long as you stay within the $5 credit limit.

---

## Step 1: Create Railway Account

### 1.1 Sign Up
1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"** (recommended - easiest way)
4. Authorize Railway to access your GitHub account
5. You'll be redirected to Railway dashboard

### 1.2 Verify Account
- Your Railway dashboard should now be visible
- You should see an empty project list or welcome screen

### 1.3 Enable Billing (Required for Free Tier)
**Important:** Even though Railway has a free tier, you need to add a payment method to use it.

1. Click on your **profile icon** (top right)
2. Go to **"Account Settings"** or **"Billing"**
3. Click **"Add Payment Method"**
4. Add your credit card (you won't be charged if you stay within free tier)
5. You'll automatically receive **$5 free credit per month**
6. You only pay if you exceed the $5 credit (very unlikely for this project)

**Why this is needed:**
- Railway requires billing info to prevent abuse
- You get $5 free credit every month
- For this project, you'll likely use less than $1-2/month
- No charges unless you exceed the free credit

**✅ Checkpoint:** You should now be logged into Railway with billing enabled.

---

## Step 2: Create New Project from GitHub

### 2.1 Create New Project
1. Click the **"+ New Project"** button (top right or center)
2. Select **"Deploy from GitHub repo"**
3. If this is your first time, authorize Railway to access your GitHub repositories
4. Grant access to your repositories (or all repositories)

### 2.2 Select Your Repository
1. You'll see a list of your GitHub repositories
2. Find and click on your **JobQ** repository
3. Railway will start importing your project

### 2.3 Wait for Initial Setup
- Railway will automatically detect it's a Node.js project
- It will create a web service automatically
- Wait for the initial deployment to complete (may take 2-3 minutes)

**✅ Checkpoint:** Your project should now appear in Railway dashboard with a web service.

---

## Step 3: Configure the Web Service (API)

### 3.1 Open Web Service Settings
1. Click on your **web service** in the Railway dashboard
2. Click on the **"Settings"** tab (top menu)

### 3.2 Set Root Directory
1. Scroll down to **"Root Directory"** section
2. Enter: `server`
3. Click **"Save"**

### 3.3 Configure Build Command
1. Scroll to **"Build Command"** section
2. Enter: `npm ci --only=production`
3. Click **"Save"**

### 3.4 Configure Start Command
1. Scroll to **"Start Command"** section
2. Enter: `node src/app.js`
3. Click **"Save"**

### 3.5 Verify Port Configuration
- Railway automatically sets the `PORT` environment variable
- Your app already uses `process.env.PORT || 3000`, so this is fine
- No action needed here

**✅ Checkpoint:** Web service is configured with correct root directory, build, and start commands.

---

## Step 4: Set Up Databases

**Choose one option based on your setup:**

### Option A: Use Railway's Databases (If you don't have databases yet)

If you don't have MongoDB and Redis hosted elsewhere, Railway can provide them:

#### 4A.1 Add MongoDB Database
1. Go back to your project overview (click project name at top)
2. Click **"+ New"** button
3. Select **"Database"**
4. Choose **"Add MongoDB"**
5. Wait for provisioning (1-2 minutes)
6. Click on the **MongoDB service** → **"Variables"** tab
7. Copy the **`MONGO_URI`** value for Step 6

#### 4A.2 Add Redis Database
1. Go back to your project overview
2. Click **"+ New"** button again
3. Select **"Database"**
4. Choose **"Add Redis"**
5. Wait for provisioning (1-2 minutes)
6. Click on the **Redis service** → **"Variables"** tab
7. Copy the **`REDIS_URL`** value for Step 6

**✅ Checkpoint (Option A):** Railway databases are created and connection strings are available.

---

### Option B: Use External Databases (If you already have MongoDB/Redis)

**If you already have MongoDB (MongoDB Atlas) and Redis (Redis Cloud, AWS ElastiCache, etc.) hosted elsewhere, skip Railway databases and use your existing ones.**

#### 4B.1 Get Your MongoDB Connection String
1. Go to your MongoDB provider (e.g., MongoDB Atlas)
2. Get your connection string (usually looks like: `mongodb+srv://username:password@cluster.mongodb.net/database`)
3. Make sure it includes your database name at the end
4. **Save this connection string** - you'll use it in Step 6

#### 4B.2 Get Your Redis Connection String
1. Go to your Redis provider (e.g., Redis Cloud, AWS ElastiCache)
2. Get your Redis connection URL (usually looks like: `redis://username:password@host:port` or `rediss://...` for SSL)
3. **Save this connection string** - you'll use it in Step 6

**✅ Checkpoint (Option B):** You have your external database connection strings ready.

**Note:** If using external databases, you can skip creating Railway database services. Just proceed to Step 6 to configure environment variables.

---

## Step 6: Configure Environment Variables for Web Service

### 6.1 Open Web Service Variables
1. Go back to your **web service**
2. Click on **"Variables"** tab

### 6.2 Add MongoDB Connection

**If using Railway MongoDB (Option A):**
1. Click **"+ New Variable"** button
2. Click **"Reference"** tab (recommended - auto-syncs)
3. Select **MongoDB service** from dropdown
4. Select **`MONGO_URI`** variable
5. Click **"Add"**

**If using External MongoDB (Option B):**
1. Click **"+ New Variable"** button
2. For **"Variable Name"**, enter: `MONGO_URI`
3. For **"Value"**, paste your MongoDB Atlas (or other provider) connection string
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/jobq?retryWrites=true&w=majority`
4. Click **"Add"**

### 6.3 Add Redis Connection

**If using Railway Redis (Option A):**
1. Click **"+ New Variable"** again
2. Click **"Reference"** tab
3. Select **Redis service** from dropdown
4. Select **`REDIS_URL`** variable
5. Click **"Add"**

**If using External Redis (Option B):**
1. Click **"+ New Variable"** again
2. For **"Variable Name"**, enter: `REDIS_URL`
3. For **"Value"**, paste your Redis connection string
   - Example: `redis://username:password@host:port`
   - Or with SSL: `rediss://username:password@host:port`
4. Click **"Add"**

### 6.4 Add Other Required Variables
Add these variables one by one:

**NODE_ENV:**
- Name: `NODE_ENV`
- Value: `production`
- Click **"Add"**

**JWT_SECRET:**
- Generate a secret first:
  ```bash
  openssl rand -base64 32
  ```
  Or use an online generator: https://generate-secret.vercel.app/32
- Name: `JWT_SECRET`
- Value: (paste your generated secret)
- Click **"Add"**

**JWT_EXPIRE:**
- Name: `JWT_EXPIRE`
- Value: `7d`
- Click **"Add"**

**LOG_LEVEL:**
- Name: `LOG_LEVEL`
- Value: `info`
- Click **"Add"**

**LOG_DIR:**
- Name: `LOG_DIR`
- Value: `/tmp/logs`
- Click **"Add"**

**TMP_DIR:**
- Name: `TMP_DIR`
- Value: `/tmp`
- Click **"Add"**

**✅ Checkpoint:** All environment variables for web service are set.

---

## Step 7: Create Worker Service

### 7.1 Create New Service from Same Repo
1. Go to project overview
2. Click **"+ New"** button
3. Select **"GitHub Repo"**
4. Select the **same JobQ repository**

### 7.2 Configure Worker Service
1. Click on the new service
2. Go to **"Settings"** tab
3. Set **Root Directory**: `server`
4. Set **Build Command**: `npm ci --only=production`
5. Set **Start Command**: `node src/worker/jobWorker.js`
6. Click **"Save"** for each setting

**✅ Checkpoint:** Worker service is created and configured.

---

## Step 8: Configure Environment Variables for Worker Service

### 8.1 Open Worker Service Variables
1. Stay in the worker service
2. Click on **"Variables"** tab

### 8.2 Add Required Variables

**MONGO_URI:**
- **If using Railway MongoDB:** Click **"+ New Variable"** → **"Reference"** → Select **MongoDB service** → Select **`MONGO_URI`** → Click **"Add"**
- **If using External MongoDB:** Click **"+ New Variable"** → Name: `MONGO_URI` → Value: (paste your MongoDB connection string) → Click **"Add"**

**REDIS_URL:**
- **If using Railway Redis:** Click **"+ New Variable"** → **"Reference"** → Select **Redis service** → Select **`REDIS_URL`** → Click **"Add"**
- **If using External Redis:** Click **"+ New Variable"** → Name: `REDIS_URL` → Value: (paste your Redis connection string) → Click **"Add"**

**NODE_ENV:**
- Name: `NODE_ENV`
- Value: `production`
- Click **"Add"**

**LOG_LEVEL:**
- Name: `LOG_LEVEL`
- Value: `info`
- Click **"Add"**

**LOG_DIR:**
- Name: `LOG_DIR`
- Value: `/tmp/logs`
- Click **"Add"**

**TMP_DIR:**
- Name: `TMP_DIR`
- Value: `/tmp`
- Click **"Add"**

**Note:** Worker doesn't need `JWT_SECRET` or `JWT_EXPIRE` - those are only for the API.

**✅ Checkpoint:** All environment variables for worker service are set.

---

## Step 9: Deploy and Verify

### 9.1 Trigger Deployment
Railway automatically deploys when you:
- Push code to your main branch, OR
- Click **"Deploy"** button manually

**Manual Deployment:**
1. Go to your **web service**
2. Click **"Deployments"** tab
3. Click **"Redeploy"** button (if needed)
4. Wait for deployment to complete (2-5 minutes)

### 9.2 Check Deployment Logs
1. Stay in **"Deployments"** tab
2. Click on the latest deployment
3. Watch the logs for:
   - ✅ Build successful
   - ✅ Dependencies installed
   - ✅ Server starting
   - ✅ MongoDB connected successfully
   - ✅ Redis connected successfully
   - ✅ Server running on port

### 9.3 Get Your API URL
1. Go to web service **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** (if not already generated)
4. Copy your service URL (e.g., `https://your-app.up.railway.app`)

### 9.4 Test Your API
1. Open a terminal or use a tool like Postman
2. Test the root endpoint:
   ```bash
   curl https://your-app.up.railway.app/
   ```
3. Expected response:
   ```json
   {
     "message": "Task Queue API",
     "version": "1.0.0",
     "endpoints": {
       "auth": "/api/auth",
       "jobs": "/api/jobs",
       "health": "/api/jobs/health"
     }
   }
   ```

### 9.5 Test Health Endpoint
```bash
curl https://your-app.up.railway.app/api/jobs/health
```

Expected response:
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "redis": "connected",
  "uptime": 123,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 9.6 Check Worker Logs
1. Go to your **worker service**
2. Click **"Deployments"** tab
3. Check logs for:
   - ✅ Worker started
   - ✅ MongoDB connected
   - ✅ Redis connected
   - ✅ Waiting for jobs

**✅ Checkpoint:** Both services are deployed and running successfully.

---

## Step 10: Test Complete Flow

### 10.1 Register a User
```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Save the token from the response.

### 10.2 Create a Job
```bash
curl -X POST https://your-app.up.railway.app/api/jobs \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "taskName": "test-job",
    "taskType": "IO",
    "payload": {
      "reportType": "test"
    }
  }'
```

### 10.3 Check Job Status
```bash
curl -X GET https://your-app.up.railway.app/api/jobs/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

The worker should process the job automatically!

**✅ Checkpoint:** Complete flow is working end-to-end.

---

## Step 11: Configure Custom Domain (Optional)

### 11.1 Add Custom Domain
1. Go to web service **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter your domain name
4. Follow Railway's instructions to configure DNS

### 11.2 SSL Certificate
- Railway automatically provides SSL certificates
- No additional configuration needed

---

## Troubleshooting

### Issue: "Limited Access" - Can Only Deploy Databases

**Symptoms:**
- Yellow banner saying "Limited Access"
- Message: "Your account is on a limited plan and can only deploy databases"
- Web and worker services show "No deploys"
- Only database services (MongoDB, Redis) can be deployed

**Cause:**
- Railway account doesn't have billing information added
- Free tier requires payment method to be added (even though it's free)

**Solution:**
1. Click on **"Upgrade your plan"** in the banner, OR
2. Go to Railway dashboard → Click your profile icon → **"Account Settings"** → **"Billing"**
3. Click **"Add Payment Method"**
4. Add your credit card
5. You'll receive $5 free credit per month automatically
6. Go back to your project - the banner should disappear
7. You can now deploy web and worker services

**Important Notes:**
- ✅ You won't be charged as long as you stay within $5/month
- ✅ This project uses less than $1-2/month typically
- ✅ Railway only charges if you exceed the free credit
- ✅ You can set spending limits in Railway settings

**After adding payment method:**
- Wait a few seconds for the account to update
- Refresh the Railway dashboard
- The "Limited Access" banner should be gone
- You can now proceed with deploying web and worker services

### Issue: Build Fails

**Symptoms:**
- Deployment fails during build phase
- Error messages in build logs

**Solutions:**
1. Check build logs for specific errors
2. Verify `package.json` is in `server` directory
3. Ensure root directory is set to `server`
4. Check Node.js version compatibility

### Issue: Service Won't Start

**Symptoms:**
- Build succeeds but service doesn't start
- Errors in deployment logs

**Solutions:**
1. Verify start command: `node src/app.js`
2. Check root directory is set correctly
3. Verify all environment variables are set
4. Check logs for connection errors

### Issue: MongoDB Connection Failed

**Symptoms:**
- Logs show "MongoDB connection error"
- Service starts but can't connect to database

**Solutions:**
1. Verify `MONGO_URI` is set correctly
2. Check MongoDB service is running
3. Ensure `MONGO_URI` variable is referenced correctly
4. Try copying the connection string manually

### Issue: Redis Connection Failed

**Symptoms:**
- Logs show "Redis connection error"
- Service starts but can't connect to Redis

**Solutions:**
1. Verify `REDIS_URL` is set correctly
2. Check Redis service is running
3. Ensure `REDIS_URL` variable is referenced correctly
4. Try copying the connection string manually

### Issue: Worker Not Processing Jobs

**Symptoms:**
- Jobs created but not processed
- Worker logs show no activity

**Solutions:**
1. Verify worker service is running
2. Check worker has access to MongoDB and Redis
3. Verify all environment variables are set in worker
4. Check worker logs for errors
5. Ensure worker service is deployed and running

### Issue: 404 Errors

**Symptoms:**
- API returns 404 for all endpoints
- Service is running but endpoints don't work

**Solutions:**
1. Verify you're using the correct URL
2. Check the root endpoint works: `https://your-app.up.railway.app/`
3. Ensure routes are configured correctly
4. Check service logs for routing errors

---

## Railway Dashboard Overview

### Services Tab
- View all services (web, worker, MongoDB, Redis)
- See service status and health
- Quick access to logs and settings

### Deployments Tab
- View deployment history
- See build and runtime logs
- Redeploy services

### Variables Tab
- Manage environment variables
- Reference variables from other services
- Add secrets securely

### Settings Tab
- Configure build and start commands
- Set root directory
- Configure networking
- Set up custom domains

### Metrics Tab (Paid Plans)
- Monitor resource usage
- View performance metrics
- Track requests and responses

---

## Environment Variables Reference

### Web Service Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://...` |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `JWT_SECRET` | Secret for JWT tokens | `your-secret-key` |
| `JWT_EXPIRE` | JWT expiration time | `7d` |
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_DIR` | Log directory | `/tmp/logs` |
| `TMP_DIR` | Temp directory | `/tmp` |

### Worker Service Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://...` |
| `REDIS_URL` | Redis connection string | `redis://...` |
| `NODE_ENV` | Environment | `production` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_DIR` | Log directory | `/tmp/logs` |
| `TMP_DIR` | Temp directory | `/tmp` |

---

## Next Steps

After successful deployment:

1. **Monitor Logs** - Regularly check service logs for errors
2. **Set Up Alerts** - Configure monitoring and alerts (paid plans)
3. **Optimize Performance** - Monitor resource usage and optimize as needed
4. **Scale Services** - Upgrade plans if you need more resources
5. **Set Up CI/CD** - Railway automatically deploys on git push
6. **Backup Strategy** - Configure backups for MongoDB (paid plans)

---

## Railway Pricing

### Free Tier ($5 Credit/Month)
- **$5 credit per month** - Automatically added to your account
- **Requires payment method** to be added (no charge unless you exceed $5)
- Sufficient for small projects and development
- This JobQ project typically uses **$1-2/month** (well within free tier)
- Services may sleep after inactivity (can be disabled)

**What's included:**
- Web services (API)
- Worker services
- MongoDB database
- Redis database
- Automatic SSL certificates
- Custom domains
- 500MB storage
- 100GB bandwidth

**Important:** You must add a payment method to use the free tier, but you won't be charged unless you exceed $5/month.

### Paid Plans (If You Exceed Free Tier)
- **Pay-as-you-go** pricing (only charged for what you use beyond $5)
- No sleep on paid plans
- Better performance and resources
- More storage and bandwidth
- Typically $5-10/month for small to medium projects

### Cost Estimate for This Project
- Web Service: ~$0.50/month
- Worker Service: ~$0.50/month
- MongoDB: ~$0.50/month (small database)
- Redis: ~$0.20/month
- **Total: ~$1.70/month** (well within free $5 credit)

---

## Support Resources

- **Railway Documentation**: https://docs.railway.app
- **Railway Discord**: https://discord.gg/railway
- **Railway Status**: https://status.railway.app
- **Railway GitHub**: https://github.com/railwayapp

---

## Summary Checklist

Use this checklist to verify your deployment:

- [ ] Railway account created
- [ ] Project created from GitHub repo
- [ ] Web service configured (root directory, build, start)
- [ ] MongoDB service added
- [ ] Redis service added
- [ ] Web service environment variables set
- [ ] Worker service created
- [ ] Worker service configured
- [ ] Worker service environment variables set
- [ ] Services deployed successfully
- [ ] API URL obtained
- [ ] Health endpoint tested
- [ ] Complete flow tested (register, create job, check status)

---

**Congratulations! 🎉 Your JobQ backend is now live on Railway!**

If you encounter any issues, refer to the Troubleshooting section or check Railway's documentation.
