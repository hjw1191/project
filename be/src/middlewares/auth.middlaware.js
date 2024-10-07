import jwt from 'jsonwebtoken';
import { prisma } from '../utils/prisma/index.js';

export default async function authMiddleware(req, res, next) {
    try {
        const { authorization } = req.headers;
        if (!authorization) {
            throw new Error('Authorization header is missing');
        }

        const [tokenType, token] = authorization.split(' ');

        if (tokenType !== 'Bearer') {
            throw new Error('Invalid token type');
        }

        if (!token) {
            throw new Error('Token is missing');
        }

        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        } catch (jwtError) {
            if (jwtError instanceof jwt.TokenExpiredError) {
                throw new Error('Token has expired');
            } else if (jwtError instanceof jwt.JsonWebTokenError) {
                // console.log("hello")
                throw new Error('Invalid token');
            } else {
                throw new Error('JWT verification failed');
            }
        }

        const email = decodedToken.email;
        if (!email) {
            throw new Error('Email is missing from token payload');
        }

        const user = await prisma.user.findUnique({
            where: { email: email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        req.user = user;
        next();
    } catch (error) {
        let statusCode = 401;
        let errorMessage = 'Authentication failed';

        switch (error.message) {
            case 'Authorization header is missing':
                errorMessage = 'Authorization header is missing';
                break;
            case 'Invalid token type':
                errorMessage = 'Invalid token type';
                break;
            case 'Token is missing':
                errorMessage = 'Token is missing';
                break;
            case 'Token has expired':
                errorMessage = 'Token has expired';
                break;
            case 'Invalid token':
                errorMessage = 'Token is invalid or has been manipulated';
                break;
            case 'JWT verification failed':
                errorMessage = 'JWT verification failed';
                break;
            case 'Email is missing from token payload':
                errorMessage = 'Token payload is invalid';
                break;
            case 'User not found':
                errorMessage = 'User associated with token not found';
                statusCode = 404;
                break;
            default:
                statusCode = 500;
                errorMessage = 'Internal server error during authentication';
        }

        return res.status(statusCode).json({
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}