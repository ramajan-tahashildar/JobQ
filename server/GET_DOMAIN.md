# How to Get Your Railway Domain

## Quick Method (Dashboard)

1. **Go to Railway Dashboard**
   - Visit: https://railway.app
   - Login to your account

2. **Open Your Project**
   - Click on your project (e.g., "accomplished-charm" or "JobQ")

3. **Open Your Service**
   - Click on **jobq-api** service

4. **Get Domain**
   - Go to **Settings** tab
   - Scroll to **Networking** section
   - Find **Public Networking**
   - Your domain will be shown: `https://your-service-name.up.railway.app`
   - Click the **copy icon** to copy it

## Generate Domain (If Not Created)

If you don't see a domain:

1. In **Settings** → **Networking** → **Public Networking**
2. Click **"Generate Domain"** button
3. Railway will create a domain automatically
4. Copy the domain URL

## Your Current Domain

Based on your earlier deployment:
```
https://jobq-production-840a.up.railway.app
```

## Add Custom Domain (Optional)

1. In **Settings** → **Networking** → **Public Networking**
2. Click **"+ Custom Domain"**
3. Enter your domain name (e.g., `api.yourdomain.com`)
4. Follow Railway's DNS instructions
5. Railway will automatically provide SSL certificate

## Test Your Domain

Once you have the domain, test it:

```bash
# Test root endpoint
curl https://your-domain.up.railway.app/

# Test health endpoint
curl https://your-domain.up.railway.app/api/jobs/health
```

## For Worker Service

The worker service doesn't need a public domain (it runs in the background).
Only the API service needs a public domain.

## Troubleshooting

**Domain not showing?**
- Make sure the service is deployed
- Check if service is in "production" environment
- Try generating a new domain

**Domain returns 404?**
- Service might not be deployed yet
- Check deployment logs
- Verify environment variables are set
- Make sure service is running

