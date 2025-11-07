# Render Deployment Guide

This guide explains how to deploy your JobQ application to Render with MongoDB and Redis.

## Hosting Options for MongoDB and Redis

### Option 1: MongoDB Atlas + Render Redis (Recommended)
- **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (Free tier available)
- **Redis**: Use [Render's Redis service](https://render.com/docs/redis) (Free tier available)

### Option 2: MongoDB Atlas + Redis Cloud
- **MongoDB**: Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Redis**: Use [Redis Cloud](https://redis.com/try-free/) (Free tier available)

### Option 3: Render MongoDB + Render Redis
- **MongoDB**: Use [Render's MongoDB service](https://render.com/docs/databases)
- **Redis**: Use [Render's Redis service](https://render.com/docs/redis)

## Step-by-Step Deployment

### 1. Set Up MongoDB Atlas (Recommended)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Create a free account
3. Create a new cluster (choose the free M0 tier)
4. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Save the username and password
5. Whitelist IP addresses:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for Render
6. Get your connection string:
   - Go to "Database" → "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskqueue?retryWrites=true&w=majority`

### 2. Set Up Redis on Render

1. Go to your [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Redis"
3. Configure:
   - **Name**: `jobq-redis` (or any name you prefer)
   - **Plan**: Free (or paid if needed)
   - **Region**: Choose closest to your app
4. Click "Create Redis"
5. Once created, you'll see:
   - **Internal Redis URL**: `redis://red-xxxxx:6379` (for Render services)
   - **External Redis URL**: `rediss://red-xxxxx:6379` (for external access)
   - **Redis Host**: `red-xxxxx`
   - **Redis Port**: `6379`
   - **Password**: (if set)

### 3. Deploy Your Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository:
   - Select your repository: `ramajan-tahashildar/JobQ`
   - Click "Connect"
4. Configure the service:
   - **Name**: `jobq-api` (or any name)
   - **Region**: Same as Redis
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or set to `server/` if needed)
   - **Runtime**: `Node`
   - **Build Command**: `cd server && npm ci --only=production`
   - **Start Command**: `cd server && node src/app.js`
   - **Dockerfile Path**: `Dockerfile` (or leave empty if using build command)
5. Add Environment Variables:
   ```
   NODE_ENV=production
   PORT=3000
   MONGO_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/taskqueue?retryWrites=true&w=majority
   REDIS_URL=redis://red-xxxxx:6379
   REDIS_HOST=red-xxxxx
   REDIS_PORT=6379
   JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
   JWT_EXPIRE=7d
   LOG_LEVEL=info
   LOG_DIR=/app/logs
   ```
6. Click "Create Web Service"

### 4. Deploy Worker Service (Optional)

If you want to run the worker separately:

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New +" → "Background Worker"
3. Connect the same repository
4. Configure:
   - **Name**: `jobq-worker`
   - **Root Directory**: `server/`
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `node src/worker/jobWorker.js`
5. Add the same environment variables as the web service
6. Click "Create Background Worker"

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/taskqueue` |
| `REDIS_URL` | Redis connection URL | `redis://red-xxxxx:6379` |
| `JWT_SECRET` | Secret key for JWT tokens | `your_secret_key_here` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `REDIS_HOST` | Redis hostname | `localhost` |
| `REDIS_PORT` | Redis port | `6379` |
| `JWT_EXPIRE` | JWT expiration | `7d` |
| `LOG_LEVEL` | Logging level | `info` |
| `LOG_DIR` | Log directory | `./logs` |

## Important Notes

### Redis Connection

- **Internal Redis URL**: Use this if your app and Redis are on Render
  - Format: `redis://red-xxxxx:6379`
  - No password needed for free tier
- **External Redis URL**: Use this if connecting from outside Render
  - Format: `rediss://red-xxxxx:6379` (note the `rediss://` with SSL)
  - May require password

### MongoDB Connection

- **MongoDB Atlas**: Always uses SSL (`mongodb+srv://`)
- Make sure to replace `<password>` in the connection string
- Whitelist Render's IP ranges or use `0.0.0.0/0` for development

### Security Best Practices

1. **Never commit `.env` files** to Git
2. **Use strong JWT_SECRET** (generate with: `openssl rand -base64 32`)
3. **Restrict MongoDB IP whitelist** in production
4. **Use environment variables** for all secrets
5. **Enable Redis password** if using paid tier

## Troubleshooting

### Connection Issues

1. **MongoDB Connection Failed**:
   - Check IP whitelist in MongoDB Atlas
   - Verify connection string has correct password
   - Check network access settings

2. **Redis Connection Failed**:
   - Verify `REDIS_URL` is correct
   - Check if Redis service is running on Render
   - Ensure you're using internal URL for Render services

3. **Build Fails**:
   - Check build logs in Render dashboard
   - Verify `package.json` is in the correct directory
   - Ensure Node.js version is compatible

### Checking Logs

- View logs in Render Dashboard → Your Service → Logs
- Check application logs at `/app/logs` (if accessible)

## Cost Estimation

### Free Tier (Suitable for Development)
- **Render Web Service**: Free (with limitations)
- **Render Redis**: Free (25MB storage)
- **MongoDB Atlas**: Free (512MB storage)
- **Total**: $0/month

### Paid Tier (Production)
- **Render Web Service**: $7/month (Starter plan)
- **Render Redis**: $10/month (Starter plan)
- **MongoDB Atlas**: $9/month (M10 cluster)
- **Total**: ~$26/month

## Next Steps

1. Set up MongoDB Atlas
2. Create Redis on Render
3. Deploy your web service
4. (Optional) Deploy worker service
5. Test your API endpoints
6. Monitor logs and performance

For more information, visit:
- [Render Documentation](https://render.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)

