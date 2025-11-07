import { getMongoDB } from '../config/database.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import { AppError } from '../utils/errors.js';
import logger from '../utils/logger.js';

const COLLECTION_NAME = 'users';

export class User {
    constructor(data) {
        this.name = data.name;
        this.email = data.email;
        this.password = data.password;
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    // Hash password before saving
    static async hashPassword(password) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    }

    // Compare password
    async comparePassword(enteredPassword) {
        return await bcrypt.compare(enteredPassword, this.password);
    }

    // Create user
    static async create(userData) {
        try {
            const db = getMongoDB();
            const collection = db.collection(COLLECTION_NAME);

            // Check if user exists
            const existingUser = await collection.findOne({ email: userData.email });
            if (existingUser) {
                throw new AppError('User already exists', 'USER_EXISTS', 400);
            }

            // Hash password
            const hashedPassword = await User.hashPassword(userData.password);

            const user = {
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const result = await collection.insertOne(user);
            logger.info(`User created: ${user.email}`);

            // Return user without password
            const { password, ...userWithoutPassword } = user;
            return {
                _id: result.insertedId.toString(),
                ...userWithoutPassword
            };
        } catch (error) {
            logger.error('Error creating user:', error);
            throw error;
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const db = getMongoDB();
            const collection = db.collection(COLLECTION_NAME);
            return await collection.findOne({ email });
        } catch (error) {
            logger.error('Error finding user:', error);
            throw error;
        }
    }

    // Find user by ID
    static async findById(id) {
        try {
            const db = getMongoDB();
            const collection = db.collection(COLLECTION_NAME);
            // Convert string ID to ObjectId if needed
            const objectId = ObjectId.isValid(id) ? new ObjectId(id) : id;
            const user = await collection.findOne({ _id: objectId });
            if (user) {
                const { password, ...userWithoutPassword } = user;
                return userWithoutPassword;
            }
            return null;
        } catch (error) {
            logger.error('Error finding user by ID:', error);
            throw error;
        }
    }

    // Verify password
    static async verifyPassword(email, password) {
        try {
            const user = await User.findByEmail(email);
            if (!user) {
                return null;
            }

            const isValid = await bcrypt.compare(password, user.password);
            if (!isValid) {
                return null;
            }

            // Return user without password
            const { password: _, ...userWithoutPassword } = user;
            return userWithoutPassword;
        } catch (error) {
            logger.error('Error verifying password:', error);
            throw error;
        }
    }
}

