# Railway Deployment Guide - Complete Step-by-Step

This guide will help you deploy your JobQ backend to Railway using your existing MongoDB Atlas and DragonflyDB (Redis) databases.

## Your Database Connections

- **MongoDB Atlas:** `mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority`
- **DragonflyDB (Redis):** `rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385`

---

## Step 1: Create Railway Account

### 1.1 Sign Up
1. Go to **[railway.app](https://railway.app)**
2. Click **"Start a New Project"** or **"Login"**
3. Choose **"Login with GitHub"** (recommended)
4. Authorize Railway to access your GitHub account
5. You'll be redirected to Railway dashboard

### 1.2 Enable Billing (Required for Free Tier)
**Important:** Railway requires a payment method even for the free tier.

1. Click on your **profile icon** (top right)
2. Go to **"Account Settings"** → **"Billing"**
3. Click **"Add Payment Method"**
4. Add your credit card
5. You'll automatically receive **$5 free credit per month**
6. You won't be charged unless you exceed $5/month (this project uses ~$1-2/month)

**✅ Checkpoint:** You're logged into Railway with billing enabled.

---

## Step 2: Create New Project from GitHub

### 2.1 Create New Project
1. Click the **"+ New Project"** button
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway if this is your first time
4. Grant access to your repositories

### 2.2 Select Your Repository
1. Find and click on your **JobQ** repository
2. Railway will start importing your project
3. Wait for initial setup (2-3 minutes)

**✅ Checkpoint:** Your project appears in Railway dashboard with a web service.

---

## Step 3: Configure Web Service (API)

### 3.1 Open Web Service Settings
1. Click on your **web service** (usually named after your repo)
2. Click on the **"Settings"** tab

### 3.2 Configure Service Settings

**Root Directory:**
1. Scroll to **"Root Directory"** section
2. Enter: `server`
3. Click **"Save"**

**Build Command:**
1. Scroll to **"Build Command"** section
2. Enter: `npm ci --only=production`
3. Click **"Save"**

**Start Command:**
1. Scroll to **"Start Command"** section
2. Enter: `node src/app.js`
3. Click **"Save"**

**✅ Checkpoint:** Web service is configured correctly.

---

## Step 4: Configure Environment Variables for Web Service

### 4.1 Open Variables Tab
1. Stay in your **web service**
2. Click on **"Variables"** tab

### 4.2 Add MongoDB Connection
1. Click **"+ New Variable"** button
2. **Variable Name:** `MONGO_URI`
3. **Value:** `mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority`
4. Click **"Add"**

### 4.3 Add Redis Connection (DragonflyDB)
1. Click **"+ New Variable"** button
2. **Variable Name:** `REDIS_URL`
3. **Value:** `rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385`
4. Click **"Add"**

### 4.4 Add Other Required Variables

Add these variables one by one:

**NODE_ENV:**
- Name: `NODE_ENV`
- Value: `production`
- Click **"Add"**

**JWT_SECRET:**
- Generate a secret first (run in terminal):
  ```bash
  openssl rand -base64 32
  ```
  Or use online: https://generate-secret.vercel.app/32
- Name: `JWT_SECRET`
- Value: (paste your generated secret - make it long and random)
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

## Step 5: Create Worker Service

### 5.1 Create New Service
1. Go back to your project overview (click project name at top)
2. Click **"+ New"** button
3. Select **"GitHub Repo"**
4. Select the **same JobQ repository**

### 5.2 Configure Worker Service
1. Click on the new service (it will be created)
2. Go to **"Settings"** tab
3. Set **Root Directory:** `server`
4. Set **Build Command:** `npm ci --only=production`
5. Set **Start Command:** `node src/worker/jobWorker.js`
6. Click **"Save"** for each setting

**✅ Checkpoint:** Worker service is created and configured.

---

## Step 6: Configure Environment Variables for Worker Service

### 6.1 Open Worker Variables
1. Stay in the **worker service**
2. Click on **"Variables"** tab

### 6.2 Add Required Variables

**MONGO_URI:**
1. Click **"+ New Variable"**
2. Name: `MONGO_URI`
3. Value: `mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority`
4. Click **"Add"**

**REDIS_URL:**
1. Click **"+ New Variable"**
2. Name: `REDIS_URL`
3. Value: `rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385`
4. Click **"Add"**

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

## Step 7: Deploy and Verify

### 7.1 Trigger Deployment
Railway automatically deploys when you:
- Push code to your main branch, OR
- Click **"Deploy"** button manually

**Manual Deployment:**
1. Go to your **web service**
2. Click **"Deployments"** tab
3. Click **"Redeploy"** button
4. Wait for deployment (2-5 minutes)

### 7.2 Check Deployment Logs
1. Stay in **"Deployments"** tab
2. Click on the latest deployment
3. Watch the logs for:
   - ✅ Build successful
   - ✅ Dependencies installed
   - ✅ Server starting
   - ✅ MongoDB connected successfully
   - ✅ Redis connected successfully
   - ✅ Server running on port

### 7.3 Get Your API URL
1. Go to web service **"Settings"** tab
2. Scroll to **"Networking"** section
3. Click **"Generate Domain"** (if not already generated)
4. Copy your service URL (e.g., `https://your-app.up.railway.app`)

### 7.4 Test Your API
1. Open a terminal or browser
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

### 7.5 Test Health Endpoint
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

### 7.6 Check Worker Logs
1. Go to your **worker service**
2. Click **"Deployments"** tab
3. Check logs for:
   - ✅ Worker started
   - ✅ MongoDB connected
   - ✅ Redis connected
   - ✅ Waiting for jobs

**✅ Checkpoint:** Both services are deployed and running successfully.

---

## Step 8: Test Complete Flow

### 8.1 Register a User
```bash
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

Save the `token` from the response.

### 8.2 Create a Job
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

Save the `jobId` from the response.

### 8.3 Check Job Status
```bash
curl -X GET https://your-app.up.railway.app/api/jobs/JOB_ID_HERE \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

The worker should process the job automatically!

**✅ Checkpoint:** Complete flow is working end-to-end.

---

## Environment Variables Summary

### Web Service Variables
```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
NODE_ENV=production
JWT_SECRET=your-generated-secret-here
JWT_EXPIRE=7d
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
```

### Worker Service Variables
```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
```

---

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoDB connection failed"**
1. Verify `MONGO_URI` is set correctly in Railway
2. Check MongoDB Atlas network access allows connections from Railway
3. Go to MongoDB Atlas → Network Access → Add IP Address
4. Add `0.0.0.0/0` (allow from anywhere) for testing, or add Railway's IP ranges
5. Verify username and password are correct

### Redis/DragonflyDB Connection Issues

**Error: "Redis connection failed"**
1. Verify `REDIS_URL` is set correctly
2. Check DragonflyDB allows external connections
3. Verify the connection string format: `rediss://default:password@host:port`
4. Check if SSL/TLS is properly configured (the code handles this automatically)
5. Verify port 6385 is correct

**SSL/TLS Issues:**
- The code automatically handles SSL connections when using `rediss://`
- If you get SSL errors, the connection string should start with `rediss://` (with double 's')

### Service Won't Start

**Error: "Service won't start"**
1. Check build logs in Railway dashboard
2. Verify root directory is set to `server`
3. Verify build command: `npm ci --only=production`
4. Verify start command: `node src/app.js` (for web) or `node src/worker/jobWorker.js` (for worker)
5. Check all environment variables are set correctly

### Build Fails

**Error: "Build failed"**
1. Check build logs for specific errors
2. Verify `package.json` exists in `server` directory
3. Ensure all dependencies are in `package.json`
4. Check Node.js version compatibility

---

## Security Best Practices

1. **Rotate Secrets Regularly:**
   - Change `JWT_SECRET` periodically
   - Update database passwords if compromised

2. **Restrict Database Access:**
   - In MongoDB Atlas, restrict IP access to Railway IPs only
   - Use strong passwords for database users

3. **Monitor Logs:**
   - Regularly check Railway logs for suspicious activity
   - Monitor database connection logs

4. **Environment Variables:**
   - Never commit secrets to git
   - Use Railway's environment variables for all secrets
   - Rotate credentials if exposed

---

## Railway Features

### Automatic Deployments
- Railway automatically deploys on git push to main branch
- You can enable/disable this in service settings

### Custom Domains
1. Go to service → **"Settings"** → **"Networking"**
2. Click **"Custom Domain"**
3. Enter your domain
4. Follow Railway's DNS instructions

### Monitoring
- View real-time logs in Railway dashboard
- Check deployment history
- Monitor service health

---

## Cost Estimate

### Free Tier ($5 Credit/Month)
- Web Service: ~$0.50/month
- Worker Service: ~$0.50/month
- **Total: ~$1.00/month** (well within free $5 credit)

### External Databases (Free)
- MongoDB Atlas: Free (M0 tier)
- DragonflyDB: Free tier available
- **Total: $0/month**

**Grand Total: ~$1.00/month** (within Railway's free tier)

---

## Next Steps

1. ✅ Monitor logs regularly
2. ✅ Set up custom domain (optional)
3. ✅ Configure monitoring alerts
4. ✅ Set up CI/CD for automatic deployments
5. ✅ Backup strategy for MongoDB
6. ✅ Scale services as needed

---

## Quick Reference

### Service URLs
- **API:** `https://your-app.up.railway.app`
- **Health Check:** `https://your-app.up.railway.app/api/jobs/health`

### Important Commands
```bash
# Test API
curl https://your-app.up.railway.app/

# Register user
curl -X POST https://your-app.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com","password":"test123"}'

# Health check
curl https://your-app.up.railway.app/api/jobs/health
```

---

**Congratulations! 🎉 Your JobQ backend is now live on Railway!**

Your API is ready to use at: `https://your-app.up.railway.app`

