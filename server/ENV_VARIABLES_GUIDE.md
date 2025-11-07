# Environment Variables Configuration for Railway

## For jobq-api Service

Add these variables in Railway Dashboard → Variables tab:

```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
JWT_SECRET=fPBvBBpAu+JLY00PJO112+FLe1+LSNFxLw+HMu71Tf8=
JWT_EXPIRE=7d
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
PORT=3000
```

**Important:**
- Replace `REDIS_URL` with your DragonflyDB connection string (not Railway's Redis)
- Remove `REDIS_HOST` if you're using `REDIS_URL` (the URL includes host info)
- Use `/tmp/logs` not `/app/logs` (free tier works better with `/tmp`)

## For jobq-worker Service

Add these variables:

```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
```

**Note:** Worker doesn't need `JWT_SECRET` or `JWT_EXPIRE` - those are only for the API.

## Using Railway's Raw Editor

1. Go to Variables tab
2. Click "{} Raw Editor"
3. Switch to "ENV" tab
4. Paste the variables above
5. Click "Update Variables"

## Copy-Paste Format for Raw Editor (ENV tab)

### jobq-api:
```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
JWT_SECRET=fPBvBBpAu+JLY00PJO112+FLe1+LSNFxLw+HMu71Tf8=
JWT_EXPIRE=7d
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
PORT=3000
```

### jobq-worker:
```
MONGO_URI=mongodb+srv://ramajan:4KPsZIIvuX9qIsxE@cluster0.dsqzsys.mongodb.net/taskqueue?retryWrites=true&w=majority
REDIS_URL=rediss://default:5e66f7t6f4ce@jvtz1kxub.dragonflydb.cloud:6385
NODE_ENV=production
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
```

