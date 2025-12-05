import User from '../models/User.js';
// import bcrypt from 'bcryptjs';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../utils/jwt.js'
import { hash, compare } from '../utils/bcrypt.js';

/**
 * login
 * POST api/auth/login
 */
const login = async (req, res) => {
    try {
        const { username, password } = req.body;
        // 
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: 'username and password are required',
            });
        }
        // get user
        const user = await User.findOne({ username: username });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid username or password',
            });
        }
        // verify password
        const isPasswordValid = await compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid passsword',
            });
        }
        // gen tokens
        const accessToken = generateAccessToken(user);
        const refreshToken = generateRefreshToken(user);

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role,
                },
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
        });
    } catch (error) {
        console.error('[userController.js] Login error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
/**
 * refresh access token
 * POST /api/auth/refresh-token
 */
const refreshAccessToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: 'refresh token is required',
            });
        }

        // verify
        const decoded = verifyToken(refreshToken);

        if (!decoded || decoded.type !== 'refresh') {
            return res.status(401).json({
                success: false,
                message: 'Invalid refresh token',
            });
        }

        // get user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found',
            });
        }

        // 
        const accessToken = generateAccessToken(user);

        res.status(200).json({
            success: true,
            data: {
                accessToken: accessToken,
            }
        });
    } catch (error) {
        console.error('[userController.js] Refresh token error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
 * get user info
 * GET /api/auth/me
 */
const getUserInfo = async (req, res) => {
    try {
        const { id } = req.user;

        // console.log(id);

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role
                }
            }
        })

    } catch (error) {
        console.error('[userController.js] Ping /me error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
}

/**
 * update user profile
 * PUT /api/auth/me
 */
const updateProfile = async (req, res) => {
    try {
        const { fullname, currentPassword, newPassword, email } = req.body;

        if (!fullname && !email && !currentPassword && !newPassword) {
            return res.status(400).json({
                success: false,
                message: "nothing to update"
            });
        }
        // get user
        const { id } = req.user;
        // console.log(userId);
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // check for update
        // fullname
        user.fullname = fullname || user.fullname;
        // email
        user.email = email || user.email;
        // password
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is required',
                });
            }
            if (newPassword === currentPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'New password must be different from current password',
                });
            }
            const isPasswordValid = await compare(currentPassword, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: "Wrong password",
                });
            }

            user.password = await hash(newPassword)
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role,
                    email: user.email,
                },
            }
        });
    } catch (error) {
        console.error('[userController.js] Update profile error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};


export {
    login,
    refreshAccessToken,
    getUserInfo,
    updateProfile
};