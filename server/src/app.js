import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { connectMongoDB, closeMongoDB } from './config/database.js';
import { connectRedis, closeRedis } from './config/database.js';
import logger from './utils/logger.js';
import { errorHandler, notFoundHandler } from './utils/errors.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import jobRoutes from './routes/jobRoutes.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path}`, {
        ip: req.ip,
        userAgent: req.get('user-agent')
    });
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Task Queue API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            jobs: '/api/jobs',
            health: '/api/jobs/health'
        }
    });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await closeRedis();
    await closeMongoDB();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start server
const startServer = async () => {
    try {
        // Connect to databases
        await connectMongoDB();
        await connectRedis();

        // Start listening
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (error) {
        logger.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();

export default app;

