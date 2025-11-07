# Railway Deployment with External Databases

If you already have MongoDB and Redis hosted elsewhere (MongoDB Atlas, Redis Cloud, etc.), you don't need Railway's database services. Here's how to configure your deployment.

## Prerequisites

- [ ] MongoDB cluster already set up (MongoDB Atlas or other)
- [ ] Redis instance already set up (Redis Cloud, AWS ElastiCache, or other)
- [ ] Connection strings for both databases
- [ ] Railway account with billing enabled

## Quick Setup Steps

### 1. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Create new project from GitHub repo
3. Railway will create a web service automatically

### 2. Configure Web Service

#### 2.1 Set Root Directory
- Go to web service → **Settings**
- Set **Root Directory**: `server`
- Set **Build Command**: `npm ci --only=production`
- Set **Start Command**: `node src/app.js`

#### 2.2 Set Environment Variables
Go to web service → **Variables** tab and add:

**MONGO_URI:**
- Name: `MONGO_URI`
- Value: Your MongoDB connection string
  - MongoDB Atlas example: `mongodb+srv://username:password@cluster.mongodb.net/jobq?retryWrites=true&w=majority`
  - Make sure to include your database name in the connection string

**REDIS_URL:**
- Name: `REDIS_URL`
- Value: Your Redis connection string
  - Example: `redis://username:password@host:port`
  - With SSL: `rediss://username:password@host:port`
  - Redis Cloud example: `redis://default:password@redis-12345.redis.cloud:12345`

**Other Required Variables:**
- `NODE_ENV`: `production`
- `JWT_SECRET`: Generate with `openssl rand -base64 32`
- `JWT_EXPIRE`: `7d`
- `LOG_LEVEL`: `info`
- `LOG_DIR`: `/tmp/logs`
- `TMP_DIR`: `/tmp`

### 3. Create Worker Service

#### 3.1 Add Worker Service
1. Click **"+ New"** → **"GitHub Repo"**
2. Select the same repository
3. Configure settings:
   - **Root Directory**: `server`
   - **Build Command**: `npm ci --only=production`
   - **Start Command**: `node src/worker/jobWorker.js`

#### 3.2 Set Worker Environment Variables
Go to worker service → **Variables** tab and add:

**MONGO_URI:**
- Name: `MONGO_URI`
- Value: Same MongoDB connection string as web service

**REDIS_URL:**
- Name: `REDIS_URL`
- Value: Same Redis connection string as web service

**Other Variables:**
- `NODE_ENV`: `production`
- `LOG_LEVEL`: `info`
- `LOG_DIR`: `/tmp/logs`
- `TMP_DIR`: `/tmp`

### 4. Deploy and Test

1. Railway will automatically deploy when you push to GitHub
2. Check deployment logs for connection status
3. Test your API endpoint
4. Verify MongoDB and Redis connections are successful

## Benefits of Using External Databases

✅ **No Railway database services needed** - Save on Railway costs
✅ **Use your existing databases** - No migration needed
✅ **Better for production** - Use managed database services
✅ **More control** - Configure databases independently

## Connection String Examples

### MongoDB Atlas
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/jobq?retryWrites=true&w=majority
```

**Getting MongoDB Atlas Connection String:**
1. Go to MongoDB Atlas dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<username>` and `<password>`
6. Add your database name: `...mongodb.net/jobq?...`

### Redis Cloud
```
redis://default:password@redis-12345.redis.cloud:12345
```

**Getting Redis Connection String:**
1. Go to your Redis provider dashboard
2. Find connection details
3. Format: `redis://username:password@host:port`
4. For SSL: `rediss://username:password@host:port`

### AWS ElastiCache Redis
```
redis://your-cluster.xxxxx.0001.use1.cache.amazonaws.com:6379
```

### Upstash Redis
```
rediss://default:password@xxxxx.upstash.io:6379
```

## Security Considerations

1. **Use SSL/TLS** when possible (rediss:// for Redis)
2. **Restrict IP access** in your database provider settings
3. **Use strong passwords** for database users
4. **Rotate credentials** regularly
5. **Monitor connection logs** for suspicious activity

## Network Configuration

### MongoDB Atlas
- Add Railway's IP ranges to MongoDB Atlas network access
- Or allow access from anywhere (0.0.0.0/0) for development

### Redis
- Configure Redis to allow connections from Railway
- Use SSL/TLS for secure connections
- Set up proper firewall rules

## Troubleshooting

### MongoDB Connection Issues

**Error: "MongoDB connection failed"**
- Verify connection string is correct
- Check MongoDB Atlas IP whitelist includes Railway IPs
- Verify database name is included in connection string
- Check username and password are correct

### Redis Connection Issues

**Error: "Redis connection failed"**
- Verify Redis URL format is correct
- Check Redis allows connections from external IPs
- Verify port is correct (default: 6379)
- Check if SSL is required (use rediss:// instead of redis://)

### Connection Timeout

**Error: "Connection timeout"**
- Check database provider allows external connections
- Verify firewall rules
- Check if VPN or whitelist is required
- Verify network settings in database provider

## Cost Comparison

### Using Railway Databases
- MongoDB: ~$0.50/month (small database)
- Redis: ~$0.20/month
- **Total: ~$0.70/month**

### Using External Databases
- MongoDB Atlas (M0 free tier): **$0/month**
- Redis Cloud (free tier): **$0/month**
- **Total: $0/month**

**Note:** External free tiers have limitations but are perfect for development and small projects.

## Next Steps

1. ✅ Configure environment variables in Railway
2. ✅ Deploy services
3. ✅ Test connections
4. ✅ Monitor logs
5. ✅ Set up monitoring and alerts

---

**You're all set!** Your Railway services will now connect to your external databases.

