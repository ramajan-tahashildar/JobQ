import { getMongoDB, getRedis } from '../config/database.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';
import { randomUUID } from 'crypto';
import { ObjectId } from 'mongodb';

const COLLECTION_NAME = 'jobs';
const QUEUE_NAME = 'jobQueue';

// Create a new job
export const createJob = async (req, res, next) => {
    try {
        const { taskName, taskType, payload } = req.body;
        const userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);

        // Validation
        if (!taskName) {
            throw new AppError('taskName is required', 'VALIDATION_ERROR', 400);
        }

        if (!taskType || !['IO', 'CPU'].includes(taskType)) {
            throw new AppError('taskType must be either "IO" or "CPU"', 'VALIDATION_ERROR', 400);
        }

        const db = getMongoDB();
        const redis = getRedis();

        // Generate unique job ID
        const jobId = randomUUID();

        // Create job document
        const job = {
            jobId,
            userId,
            taskName,
            taskType,
            payload: payload || {},
            status: 'PENDING',
            attempts: 0,
            maxAttempts: 3,
            result: null,
            error: null,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // Insert into MongoDB
        await db.collection(COLLECTION_NAME).insertOne(job);

        // Push jobId to Redis queue
        await redis.lPush(QUEUE_NAME, jobId);

        logger.info(`Job created: ${jobId} by user ${userId}`);

        // Return job without internal MongoDB _id
        const { _id, ...jobResponse } = job;
        res.status(201).json(jobResponse);
    } catch (error) {
        next(error);
    }
};

// Get job by ID
export const getJob = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);

        const db = getMongoDB();
        const job = await db.collection(COLLECTION_NAME).findOne({ jobId: id });

        if (!job) {
            throw new AppError('Job not found', 'JOB_NOT_FOUND', 404);
        }

        // Check if user owns the job
        if (job.userId !== userId) {
            throw new AppError('Unauthorized to access this job', 'UNAUTHORIZED', 403);
        }

        // Remove MongoDB _id from response
        const { _id, ...jobResponse } = job;
        res.json(jobResponse);
    } catch (error) {
        next(error);
    }
};

// List jobs with filters
export const listJobs = async (req, res, next) => {
    try {
        const userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);
        const { status, taskType, page = 1, limit = 10 } = req.query;

        const db = getMongoDB();
        const collection = db.collection(COLLECTION_NAME);

        // Build query
        const query = { userId };
        if (status) {
            query.status = status;
        }
        if (taskType) {
            query.taskType = taskType;
        }

        // Pagination
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const limitNum = parseInt(limit);

        // Get total count
        const total = await collection.countDocuments(query);

        // Get jobs
        const jobs = await collection
            .find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .toArray();

        // Remove _id from each job
        const jobsResponse = jobs.map(({ _id, ...job }) => job);

        res.json({
            jobs: jobsResponse,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        next(error);
    }
};

// Health check endpoint
export const healthCheck = async (req, res, next) => {
    try {
        const db = getMongoDB();
        const redis = getRedis();

        // Check MongoDB connection
        let mongoStatus = 'disconnected';
        try {
            await db.admin().ping();
            mongoStatus = 'connected';
        } catch (error) {
            logger.error('MongoDB health check failed:', error);
        }

        // Check Redis connection
        let redisStatus = 'disconnected';
        try {
            await redis.ping();
            redisStatus = 'connected';
        } catch (error) {
            logger.error('Redis health check failed:', error);
        }

        const health = {
            status: mongoStatus === 'connected' && redisStatus === 'connected' ? 'healthy' : 'degraded',
            mongodb: mongoStatus,
            redis: redisStatus,
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        };

        const statusCode = health.status === 'healthy' ? 200 : 503;
        res.status(statusCode).json(health);
    } catch (error) {
        next(error);
    }
};

