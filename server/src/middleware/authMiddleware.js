import jwt from 'jsonwebtoken';
import { getMongoDB } from '../config/database.js';
import { ObjectId } from 'mongodb';
import { AppError } from '../utils/errors.js';

export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            throw new AppError('No token provided, authorization denied', 'NO_TOKEN', 401);
        }

        try {
            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const db = getMongoDB();
            const user = await db.collection('users').findOne({ _id: new ObjectId(decoded.id) });

            if (!user) {
                throw new AppError('User not found', 'USER_NOT_FOUND', 404);
            }

            // Attach user to request (without password)
            const { password, ...userWithoutPassword } = user;
            req.user = userWithoutPassword;

            next();
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                throw new AppError('Invalid token', 'INVALID_TOKEN', 401);
            }
            if (error.name === 'TokenExpiredError') {
                throw new AppError('Token expired', 'TOKEN_EXPIRED', 401);
            }
            throw error;
        }
    } catch (error) {
        next(error);
    }
};

