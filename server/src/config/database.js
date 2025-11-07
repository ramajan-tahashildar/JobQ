import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

let mongoClient = null;
let mongoDb = null;
let redisClient = null;

// MongoDB Connection
export const connectMongoDB = async () => {
    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskqueue';
        mongoClient = new MongoClient(uri);
        await mongoClient.connect();

        // Extract database name from URI or use default
        const dbName = uri.split('/').pop().split('?')[0] || 'taskqueue';
        mongoDb = mongoClient.db(dbName);

        // Create indexes
        try {
            await mongoDb.collection('jobs').createIndex({ jobId: 1 }, { unique: true });
            await mongoDb.collection('jobs').createIndex({ userId: 1 });
            await mongoDb.collection('jobs').createIndex({ status: 1 });
            await mongoDb.collection('users').createIndex({ email: 1 }, { unique: true });
        } catch (indexError) {
            // Indexes might already exist, log but don't fail
            logger.warn('Index creation warning (may already exist):', indexError.message);
        }

        logger.info('MongoDB connected successfully');
        return mongoDb;
    } catch (error) {
        logger.error('MongoDB connection error:', error);
        throw error;
    }
};

export const getMongoDB = () => {
    if (!mongoDb) {
        throw new Error('MongoDB not connected. Call connectMongoDB() first.');
    }
    return mongoDb;
};

export const closeMongoDB = async () => {
    if (mongoClient) {
        await mongoClient.close();
        logger.info('MongoDB connection closed');
    }
};

// Redis Connection
export const connectRedis = async (maxRetries = 5, retryDelay = 2000) => {
    // Prevent multiple connection attempts
    if (redisClient && redisClient.isOpen) {
        logger.info('Redis already connected');
        return redisClient;
    }

    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 8001}`;

    logger.info(`Attempting to connect to Redis at: ${redisUrl}`);

    // Clean up existing client if it exists but isn't open
    if (redisClient && !redisClient.isOpen) {
        try {
            await redisClient.quit().catch(() => { });
        } catch (e) {
            // Ignore cleanup errors
        }
        redisClient = null;
    }

    let isConnecting = false;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            isConnecting = true;
            redisClient = createClient({
                url: redisUrl,
                socket: {
                    reconnectStrategy: (retries) => {
                        if (retries > 10) {
                            logger.error('Redis reconnection failed after 10 attempts');
                            return new Error('Redis reconnection limit exceeded');
                        }
                        const delay = Math.min(retries * 100, 3000);
                        return delay;
                    },
                    connectTimeout: 5000
                }
            });

            // Set up event handlers - suppress errors during initial connection
            redisClient.on('error', (err) => {
                // Only log errors that occur after connection is established
                // Connection errors during connect() will be caught by try/catch
                if (!isConnecting && redisClient && redisClient.isOpen) {
                    const errorMsg = err?.message || err?.toString() || String(err);
                    logger.error('Redis Client Error:', errorMsg);
                }
            });
            redisClient.on('connect', () => {
                if (isConnecting) {
                    logger.info('Redis connecting...');
                }
            });
            redisClient.on('ready', () => {
                isConnecting = false;
                logger.info('Redis connected successfully');
            });

            await redisClient.connect();
            isConnecting = false;
            logger.info('Redis connected successfully');
            return redisClient;
        } catch (error) {
            isConnecting = false;
            const errorMsg = error?.message || error?.toString() || String(error);
            const delay = retryDelay * Math.pow(2, attempt - 1); // Exponential backoff

            if (attempt < maxRetries) {
                logger.warn(`Redis connection attempt ${attempt}/${maxRetries} failed. Retrying in ${delay}ms...`, {
                    error: errorMsg
                });

                // Clean up failed client
                if (redisClient) {
                    try {
                        await redisClient.quit().catch(() => { });
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                    redisClient = null;
                }

                await new Promise(resolve => setTimeout(resolve, delay));
            } else {
                logger.error(`Redis connection failed after ${maxRetries} attempts:`, errorMsg);
                // Clean up failed client
                if (redisClient) {
                    try {
                        await redisClient.quit().catch(() => { });
                    } catch (e) {
                        // Ignore cleanup errors
                    }
                    redisClient = null;
                }
                throw new Error(`Failed to connect to Redis after ${maxRetries} attempts: ${errorMsg}`);
            }
        }
    }
};

export const getRedis = () => {
    if (!redisClient || !redisClient.isOpen) {
        throw new Error('Redis not connected. Call connectRedis() first.');
    }
    return redisClient;
};

export const closeRedis = async () => {
    if (redisClient) {
        try {
            if (redisClient.isOpen) {
                await redisClient.quit();
            }
            logger.info('Redis connection closed');
        } catch (error) {
            logger.warn('Error closing Redis connection:', error.message);
        } finally {
            redisClient = null;
        }
    }
};

