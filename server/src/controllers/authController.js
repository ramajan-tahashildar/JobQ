import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const generateToken = (userId) => {
    return jwt.sign(
        { id: userId },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );
};

// Register new user
export const registerUser = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) {
            throw new AppError('Name, email, and password are required', 'VALIDATION_ERROR', 400);
        }

        if (password.length < 6) {
            throw new AppError('Password must be at least 6 characters', 'VALIDATION_ERROR', 400);
        }

        // Create user
        const user = await User.create({ name, email, password });
        const token = generateToken(user._id);

        logger.info(`User registered: ${email}`);

        res.status(201).json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// Login user
export const loginUser = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            throw new AppError('Email and password are required', 'VALIDATION_ERROR', 400);
        }

        // Verify user and password
        const user = await User.verifyPassword(email, password);
        if (!user) {
            throw new AppError('Invalid email or password', 'INVALID_CREDENTIALS', 401);
        }

        const token = generateToken(user._id);

        logger.info(`User logged in: ${email}`);

        res.json({
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

// Get current user
export const getMe = async (req, res, next) => {
    try {
        const userId = req.user._id.toString ? req.user._id.toString() : String(req.user._id);
        const user = await User.findById(userId);
        if (!user) {
            throw new AppError('User not found', 'USER_NOT_FOUND', 404);
        }

        res.json({
            user: {
                id: user._id || userId,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        next(error);
    }
};

