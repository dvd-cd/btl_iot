import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '30m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '90d';

// access token
const generateAccessToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
    );
};

// refresh token
const generateRefreshToken = (user) => {
    return jwt.sign(
        {
            id: user._id,
            role: user.role,
            type: 'refresh'
        },
        JWT_SECRET,
        { expiresIn: JWT_REFRESH_EXPIRES_IN }
    );
};

// verify token
const verifyToken = (token) => {
    try {
        const user = jwt.verify(token, JWT_SECRET);
        // console.log(user);
        return user;
    } catch (error) {
        return null;
    }
};

export {
    generateAccessToken,
    generateRefreshToken,
    verifyToken,
};