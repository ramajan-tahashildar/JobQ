import { MongoClient } from 'mongodb';
import { createClient } from 'redis';
import logger from '../utils/logger.js';

let mongoClient = null;
let mongoDb = null;
let redisClient = null;

// MongoDB Connection
export const connectMongoDB = async () => {
    // Prevent multiple simultaneous connection attempts
    if (mongoClient && mongoClient.topology && mongoClient.topology.isConnected()) {
        logger.info('MongoDB already connected');
        return mongoDb;
    }

    try {
        const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskqueue';

        // Check if this is a MongoDB Atlas connection
        const isSrvConnection = uri.includes('mongodb+srv://');
        const isAtlasConnection = isSrvConnection || uri.includes('.mongodb.net');

        // Log connection type (without exposing credentials)
        const logUri = uri.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@');
        logger.info(`Connecting to MongoDB${isAtlasConnection ? ' Atlas' : ''} at: ${logUri}`);

        // For mongodb+srv:// connections, use minimal options - TLS is automatic
        // For regular mongodb:// Atlas connections, explicitly enable TLS
        const clientOptions = isSrvConnection ? {
            // SRV connections: Let MongoDB driver handle TLS automatically
            serverSelectionTimeoutMS: 15000, // Reduced to fail faster
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000,
        } : (isAtlasConnection ? {
            // Non-SRV Atlas: Explicitly enable TLS
            tls: true,
            serverSelectionTimeoutMS: 15000,
            connectTimeoutMS: 15000,
            socketTimeoutMS: 15000,
        } : {
            // Local MongoDB: Standard options
            serverSelectionTimeoutMS: 5000,
            connectTimeoutMS: 10000,
        });

        mongoClient = new MongoClient(uri, clientOptions);

        // Add a timeout wrapper to prevent indefinite hanging
        const connectionPromise = mongoClient.connect();
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error('MongoDB connection timeout after 20 seconds. Check your IP whitelist in MongoDB Atlas Network Access.'));
            }, 20000);
        });

        await Promise.race([connectionPromise, timeoutPromise]);

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
        // Clean up failed connection
        if (mongoClient) {
            try {
                await mongoClient.close().catch(() => { });
            } catch (e) {
                // Ignore cleanup errors
            }
            mongoClient = null;
        }

        // Provide more helpful error messages
        const errorMessage = error?.message || String(error);

        if (errorMessage.includes('timeout') || errorMessage.includes('Timeout')) {
            logger.error('═══════════════════════════════════════════════════════════');
            logger.error('MongoDB Connection Timeout - IP Whitelist Issue');
            logger.error('═══════════════════════════════════════════════════════════');
            logger.error('');
            logger.error('Your IP address is likely NOT whitelisted in MongoDB Atlas.');
            logger.error('');
            logger.error('QUICK FIX:');
            logger.error('1. Go to: https://cloud.mongodb.com/');
            logger.error('2. Select your project → Network Access (or IP Access List)');
            logger.error('3. Click "Add IP Address"');
            logger.error('4. Click "Add Current IP Address" (or add 0.0.0.0/0 for testing)');
            logger.error('5. Wait 1-2 minutes for changes to propagate');
            logger.error('6. Try connecting again');
            logger.error('');
            logger.error('═══════════════════════════════════════════════════════════');
        } else if (errorMessage.includes('SSL') || errorMessage.includes('TLS') || errorMessage.includes('alert')) {
            logger.error('MongoDB TLS/SSL connection error. Common causes:');
            logger.error('1. IP address not whitelisted in MongoDB Atlas Network Access');
            logger.error('2. Connection string has special characters in password that need URL encoding');
            logger.error('3. Connection string format is incorrect');
            logger.error('4. Node.js/OpenSSL version compatibility issue');
            logger.error('');
            logger.error('To fix:');
            logger.error('- Go to MongoDB Atlas → Network Access → Add your IP (or 0.0.0.0/0 for testing)');
            logger.error('- Ensure connection string format: mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority');
            logger.error('- URL-encode special characters in password (e.g., @ becomes %40)');
        }

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

    const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || 'localhost'}:${process.env.REDIS_PORT || 6379}`;

    // Log connection info without exposing password
    const logUrl = redisUrl.includes('@')
        ? redisUrl.replace(/:\/\/[^:]+:[^@]+@/, '://***:***@')
        : redisUrl;
    logger.info(`Attempting to connect to Redis at: ${logUrl}`);

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
            // Configure Redis client with SSL support for DragonflyDB and other SSL-enabled Redis
            const clientConfig = {
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
                    connectTimeout: 10000, // Increased timeout for SSL connections
                    // Enable TLS if using rediss:// (SSL) protocol
                    ...(redisUrl.startsWith('rediss://') && {
                        tls: {
                            rejectUnauthorized: false // Allow self-signed certificates (adjust if needed)
                        }
                    })
                }
            };

            redisClient = createClient(clientConfig);

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

