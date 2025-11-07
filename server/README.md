# Task Queue API - Distributed Job Queue System

A production-ready Node.js REST API for managing asynchronous job processing with Redis queue, MongoDB storage, Docker containerization, and CI/CD automation.

## 🎯 Features

- **RESTful API** for job creation and status tracking
- **JWT Authentication** for secure API access
- **Redis Queue** for asynchronous job processing
- **MongoDB** for persistent job storage
- **Background Worker** with automatic retry mechanism (up to 3 attempts)
- **Two Task Types**:
  - **IO-bound**: File/report generation
  - **CPU-bound**: Expensive computations (Fibonacci)
- **Docker & Docker Compose** for containerization
- **GitHub Actions** CI/CD pipeline
- **Winston Logging** with file rotation
- **Health Check** endpoint for monitoring

## 🏗️ Architecture

```
┌────────────────────┐
│   REST API Server  │
│ (Express + MongoDB)│
└──────┬─────────────┘
       │
POST /jobs │
       ▼
  ┌──────────┐
  │ MongoDB  │
  └────┬─────┘
       │
       │ PUSH job_id
       ▼
  ┌──────────┐
  │  Redis   │
  │  Queue   │
  └────┬─────┘
       │ POP job_id
       ▼
  ┌──────────┐
  │ Worker   │
  │ Service  │
  └──────────┘
       │
Updates job status
       ▼
  ┌──────────┐
  │ MongoDB  │
  └──────────┘
```

## 📋 Prerequisites

- Node.js 18+
- Docker & Docker Compose
- MongoDB (local or Atlas)
- Redis (local or hosted)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
cd server
npm install
```

### 2. Environment Variables

Create a `.env` file in the `server/` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/taskqueue
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/taskqueue

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_URL=redis://localhost:6379

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Logging
LOG_LEVEL=info
LOG_DIR=./logs
```

### 3. Run with Docker Compose (Recommended)

```bash
docker-compose up -d
```

This will start:
- API server on `http://localhost:3000`
- Worker service
- Redis on port `6379`
- MongoDB on port `27017`

### 4. Run Locally (Development)

**Terminal 1 - API Server:**
```bash
npm start
# or for development with auto-reload
npm run dev
```

**Terminal 2 - Worker:**
```bash
npm run worker
# or for development
npm run dev:worker
```

## 📡 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Jobs

#### Create Job
```http
POST /api/jobs
Authorization: Bearer <token>
Content-Type: application/json

{
  "taskName": "generate-weekly-report",
  "taskType": "IO",
  "payload": {
    "reportType": "weekly",
    "data": { "period": "2024-01" }
  }
}
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "507f1f77bcf86cd799439011",
  "taskName": "generate-weekly-report",
  "taskType": "IO",
  "payload": { "reportType": "weekly", "data": { "period": "2024-01" } },
  "status": "PENDING",
  "attempts": 0,
  "maxAttempts": 3,
  "result": null,
  "error": null,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

#### Get Job Status
```http
GET /api/jobs/:jobId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "PROCESSING",
  "result": null,
  ...
}
```

#### List Jobs
```http
GET /api/jobs?status=SUCCESS&taskType=IO&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `status`: Filter by status (PENDING, PROCESSING, SUCCESS, FAILED)
- `taskType`: Filter by type (IO, CPU)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
```json
{
  "jobs": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  }
}
```

#### Health Check
```http
GET /api/jobs/health
```

**Response:**
```json
{
  "status": "healthy",
  "mongodb": "connected",
  "redis": "connected",
  "uptime": 3600,
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔄 Job Status Flow

```
PENDING → PROCESSING → SUCCESS
              ↓
           FAILED (after 3 attempts)
```

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f worker

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build
```

## 🧪 Testing the API

### Using cURL

1. **Register:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"test123"}'
```

2. **Login (save token):**
```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' | jq -r '.token')
```

3. **Create IO Job:**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"test-report","taskType":"IO","payload":{"reportType":"test"}}'
```

4. **Create CPU Job:**
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"taskName":"fibonacci-40","taskType":"CPU","payload":{"n":40}}'
```

5. **Check Job Status:**
```bash
curl -X GET http://localhost:3000/api/jobs/<jobId> \
  -H "Authorization: Bearer $TOKEN"
```

## 📁 Project Structure

```
server/
├── src/
│   ├── app.js                 # Express app entry point
│   ├── config/
│   │   └── database.js        # MongoDB & Redis connections
│   ├── routes/
│   │   ├── authRoutes.js      # Authentication routes
│   │   └── jobRoutes.js       # Job routes
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   └── jobController.js   # Job logic
│   ├── models/
│   │   └── User.js            # User model (MongoDB native)
│   ├── middleware/
│   │   └── authMiddleware.js  # JWT verification
│   ├── utils/
│   │   ├── logger.js          # Winston logger
│   │   └── errors.js          # Error handlers
│   └── worker/
│       └── jobWorker.js       # Background worker
├── .github/
│   └── workflows/
│       └── ci-cd.yml          # GitHub Actions
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## 🔐 Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Environment variables for sensitive data
- Input validation on all endpoints

## 📊 Monitoring

- Health check endpoint: `/api/jobs/health`
- Winston logs in `./logs/` directory
- Log rotation with daily files
- Error tracking with stack traces

## 🚢 Deployment

### Deploy to Railway 🚂

**Recommended hosting platform!** Railway makes it easy to deploy with MongoDB and Redis support.

👉 **[Complete Railway Deployment Guide](RAILWAY_DEPLOYMENT_GUIDE.md)** - Step-by-step guide with your database connection strings

**Deployment Options:**
- **[Railway CLI Deployment](RAILWAY_CLI_DEPLOYMENT.md)** - Deploy via command line (faster, automatable)
- **[Railway Dashboard Guide](RAILWAY_DEPLOYMENT_GUIDE.md)** - Deploy via web interface (easier for beginners)

**Other Guides:**
- **[Railway Deployment Guide](RAILWAY_DEPLOYMENT.md)** - General deployment guide
- **[Railway with External Databases](RAILWAY_EXTERNAL_DATABASES.md)** - Using external databases

**Quick Overview:**
1. Connect your GitHub repository to Railway (or use CLI)
2. Configure web service (API) and worker service
3. Set environment variables (MongoDB Atlas + DragonflyDB connection strings)
4. Deploy - Railway automatically deploys on git push (or use `railway up`)

**Quick CLI Deploy:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Set variables and deploy
cd server
railway variables --set "MONGO_URI=your-mongodb-uri"
railway variables --set "REDIS_URL=your-redis-url"
railway up
```

### Other Platforms (Fly.io / Heroku / Render)

1. Set environment variables in your hosting platform
2. Configure build command: `cd server && npm ci --only=production`
3. Configure start command: `cd server && node src/app.js`
4. For worker, deploy as separate service with: `cd server && node src/worker/jobWorker.js`

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3000
MONGO_URI=<your-mongodb-connection-string>
REDIS_URL=<your-redis-connection-string>
REDIS_HOST=<redis-host>  # Optional if REDIS_URL is set
REDIS_PORT=<redis-port>  # Optional if REDIS_URL is set
JWT_SECRET=<strong-random-secret>
JWT_EXPIRE=7d
LOG_LEVEL=info
LOG_DIR=/tmp/logs
TMP_DIR=/tmp
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run API in development mode (with auto-reload)
npm run dev

# Run worker in development mode
npm run dev:worker
```

## 📝 Job Schema

```javascript
{
  jobId: String,              // UUID
  userId: String,             // User who created it
  taskName: String,           // Task identifier
  taskType: "IO" | "CPU",    // Task type
  payload: Object,            // Task-specific data
  status: "PENDING" | "PROCESSING" | "SUCCESS" | "FAILED",
  attempts: Number,           // Retry count
  maxAttempts: Number,        // Default: 3
  result: Object | null,      // Task result
  error: {                    // Error details if failed
    message: String,
    code: String
  } | null,
  createdAt: Date,
  updatedAt: Date
}
```

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Check `MONGO_URI` in `.env`
- Ensure MongoDB is running
- For Atlas, check IP whitelist

### Redis Connection Issues
- Check `REDIS_URL` in `.env`
- Ensure Redis is running
- Check network connectivity

### Worker Not Processing Jobs
- Check worker logs: `docker-compose logs worker`
- Verify Redis connection
- Check MongoDB connection
- Ensure queue has jobs: `redis-cli LLEN jobQueue`

## 📄 License

ISC

## 👤 Author

Your Name

---

**Built with ❤️ using Node.js, Express, MongoDB, Redis, and Docker**

