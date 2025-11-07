import logger from './logger.js';

export class AppError extends Error {
    constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
        this.details = details;
        Error.captureStackTrace(this, this.constructor);
    }
}

export const errorHandler = (err, req, res, next) => {
    logger.error('Error:', {
        message: err.message,
        stack: err.stack,
        code: err.code,
        url: req.url,
        method: req.method
    });

    // If it's our custom AppError
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            error: {
                message: err.message,
                code: err.code,
                ...(err.details && { details: err.details })
            }
        });
    }

    // MongoDB duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            error: {
                message: 'Resource already exists',
                code: 'DUPLICATE_ENTRY'
            }
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: {
                message: 'Invalid token',
                code: 'INVALID_TOKEN'
            }
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: {
                message: 'Token expired',
                code: 'TOKEN_EXPIRED'
            }
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        error: {
            message: err.message || 'Internal server error',
            code: err.code || 'INTERNAL_ERROR',
            ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
        }
    });
};

export const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        error: {
            message: `Route ${req.originalUrl} not found`,
            code: 'NOT_FOUND'
        }
    });
};

