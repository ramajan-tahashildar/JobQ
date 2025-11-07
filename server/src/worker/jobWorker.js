import dotenv from 'dotenv';
dotenv.config();

import { connectMongoDB, getMongoDB, closeMongoDB } from '../config/database.js';
import { connectRedis, getRedis, closeRedis } from '../config/database.js';
import logger from '../utils/logger.js';
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COLLECTION_NAME = 'jobs';
const QUEUE_NAME = 'jobQueue';
const POLL_INTERVAL = 2000; // 2 seconds

// Ensure tmp directory exists
// Use environment variable or fallback to relative path
const TMP_DIR = process.env.TMP_DIR || process.env.LOG_DIR || path.join(__dirname, '../../tmp');
const ensureTmpDir = async () => {
    try {
        await fs.mkdir(TMP_DIR, { recursive: true });
        logger.info(`Temporary directory set to: ${TMP_DIR}`);
    } catch (error) {
        logger.error('Error creating tmp directory:', error);
    }
};

// CPU-bound task: Calculate nth Fibonacci number
const fibonacci = (n) => {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
        [a, b] = [b, a + b];
    }
    return b;
};

// IO-bound task: Generate a report file
const generateReport = async (jobId, payload) => {
    const reportData = {
        jobId,
        generatedAt: new Date().toISOString(),
        reportType: payload.reportType || 'default',
        data: payload.data || { message: 'Sample report data' },
        metadata: {
            version: '1.0',
            format: 'JSON'
        }
    };

    const fileName = `report_${jobId}_${Date.now()}.json`;
    const filePath = path.join(TMP_DIR, fileName);

    await fs.writeFile(filePath, JSON.stringify(reportData, null, 2), 'utf8');

    return {
        fileName,
        filePath,
        size: JSON.stringify(reportData).length,
        ...reportData
    };
};

// CPU-bound task: Compute expensive calculation
const computeTask = async (payload) => {
    const n = payload.n || 40; // Default to 40th Fibonacci number
    logger.info(`Computing Fibonacci(${n})...`);

    const startTime = Date.now();
    const result = fibonacci(n);
    const endTime = Date.now();
    const duration = endTime - startTime;

    return {
        input: n,
        result,
        duration: `${duration}ms`,
        computedAt: new Date().toISOString()
    };
};

// Process a single job
const processJob = async (jobId) => {
    const db = getMongoDB();
    const collection = db.collection(COLLECTION_NAME);

    try {
        // Fetch job from MongoDB
        const job = await collection.findOne({ jobId });
        if (!job) {
            logger.warn(`Job ${jobId} not found in database`);
            return;
        }

        // Skip if already processed
        if (job.status === 'SUCCESS' || job.status === 'FAILED') {
            logger.info(`Job ${jobId} already ${job.status}, skipping`);
            return;
        }

        // Update status to PROCESSING
        await collection.updateOne(
            { jobId },
            {
                $set: {
                    status: 'PROCESSING',
                    updatedAt: new Date()
                }
            }
        );

        logger.info(`Processing job ${jobId} (${job.taskType}): ${job.taskName}`);

        let result = null;
        let error = null;

        try {
            // Process based on task type
            if (job.taskType === 'IO') {
                result = await generateReport(jobId, job.payload);
                logger.info(`IO task completed for job ${jobId}`);
            } else if (job.taskType === 'CPU') {
                result = await computeTask(job.payload);
                logger.info(`CPU task completed for job ${jobId}`);
            } else {
                throw new Error(`Unknown task type: ${job.taskType}`);
            }

            // Mark as SUCCESS
            await collection.updateOne(
                { jobId },
                {
                    $set: {
                        status: 'SUCCESS',
                        result,
                        updatedAt: new Date()
                    }
                }
            );

            logger.info(`Job ${jobId} completed successfully`);
        } catch (processError) {
            logger.error(`Error processing job ${jobId}:`, processError);

            const newAttempts = (job.attempts || 0) + 1;
            const maxAttempts = job.maxAttempts || 3;

            error = {
                message: processError.message,
                code: 'PROCESSING_ERROR',
                attempt: newAttempts
            };

            if (newAttempts >= maxAttempts) {
                // Max attempts reached, mark as FAILED
                await collection.updateOne(
                    { jobId },
                    {
                        $set: {
                            status: 'FAILED',
                            attempts: newAttempts,
                            error,
                            updatedAt: new Date()
                        }
                    }
                );
                logger.error(`Job ${jobId} failed after ${newAttempts} attempts`);
            } else {
                // Retry: push back to queue
                const redis = getRedis();
                await redis.lPush(QUEUE_NAME, jobId);

                await collection.updateOne(
                    { jobId },
                    {
                        $set: {
                            status: 'PENDING',
                            attempts: newAttempts,
                            error,
                            updatedAt: new Date()
                        }
                    }
                );
                logger.info(`Job ${jobId} retrying (attempt ${newAttempts}/${maxAttempts})`);
            }
        }
    } catch (error) {
        logger.error(`Error in processJob for ${jobId}:`, error);
    }
};

// Main worker loop
const workerLoop = async () => {
    const redis = getRedis();

    while (true) {
        try {
            // Pop job from queue (blocking with timeout)
            const jobId = await redis.rPop(QUEUE_NAME);

            if (jobId) {
                await processJob(jobId);
            } else {
                // No jobs in queue, wait before polling again
                await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
            }
        } catch (error) {
            logger.error('Error in worker loop:', error);
            // Wait before retrying
            await new Promise(resolve => setTimeout(resolve, POLL_INTERVAL));
        }
    }
};

// Graceful shutdown
const shutdown = async (signal) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);
    await closeRedis();
    await closeMongoDB();
    process.exit(0);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Start worker
const startWorker = async () => {
    try {
        logger.info('Starting job worker...');

        // Ensure tmp directory exists
        await ensureTmpDir();

        // Connect to databases
        await connectMongoDB();
        await connectRedis();

        logger.info('Worker started, waiting for jobs...');

        // Start processing loop
        await workerLoop();
    } catch (error) {
        logger.error('Failed to start worker:', error);
        process.exit(1);
    }
};

startWorker();

