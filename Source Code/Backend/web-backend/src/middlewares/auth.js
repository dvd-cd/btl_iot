import { verifyToken } from '../utils/jwt.js';
import User from '../models/User.js';

const requireUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token missing',
            });
        }

        // verify token
        const token = authHeader.replace('Bearer ', '');
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token',
            });
        }

        // invalid token type
        if (decoded.type === 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token type',
            });
        }

        // get user
        req.user = decoded;
        // console.log(req.user);

        next();
    } catch (error) {
        console.error('[auth.js] Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            message: 'Authentication error',
        });
    }
};

// 
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        res.status(403).json({ success: false, message: 'Access denied. Admin only.' });
    }
}

export {
    requireUser,
    requireAdmin,
}