# JobQ

A distributed job queue system with Node.js, MongoDB, and Redis, featuring a modern React frontend.

## 🎯 Features

- **RESTful API** - Node.js/Express backend with JWT authentication
- **Modern Frontend** - Beautiful React UI with Tailwind CSS
- **Job Queue** - Redis-based queue for asynchronous job processing
- **Database** - MongoDB for persistent job storage
- **Background Worker** - Automatic job processing with retry mechanism
- **Task Types** - Support for IO-bound and CPU-bound tasks

## 📚 Documentation

- [Server README](server/README.md) - Full API documentation and local setup
- [Frontend README](client/README.md) - Frontend setup and usage
- [Railway Deployment Guide](server/RAILWAY_DEPLOYMENT.md) - Deploy to Railway platform

## 🚀 Quick Start

### Backend Setup

```bash
cd server
npm install
# Create .env file (see server/README.md)
npm start
```

### Frontend Setup

```bash
cd client
npm install
# (Optional) Create .env file if you want to override the default API URL
# VITE_API_URL=https://jobq-13ga.onrender.com/api
npm run dev
```

The frontend will be available at `http://localhost:5173` and will talk to the deployed backend at `https://jobq-13ga.onrender.com/api` by default.

## 🛠️ Local Development

### Backend
See [server/README.md](server/README.md) for detailed backend setup instructions.

### Frontend
See [client/README.md](client/README.md) for detailed frontend setup instructions.

## 🚢 Deployment

### Backend
See the [Railway Deployment Guide](server/RAILWAY_DEPLOYMENT.md) for step-by-step instructions to deploy your backend with MongoDB and Redis.

### Frontend
Build the frontend and deploy to any static hosting service:
```bash
cd client
npm run build
# Deploy the dist/ folder to Vercel, Netlify, etc.
```

## 📁 Project Structure

```
JobQ/
├── server/          # Backend API (Node.js/Express)
├── client/          # Frontend (React/Vite)
└── README.md        # This file
```
