import User from '../models/User.js';
import { hash, compare } from '../utils/bcrypt.js';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt.js';

/**
 * update user profile
 * POST api/admin/users/new
 */
const register = async (req, res) => {
    try {
        const { username, password, fullname, role = "USER" } = req.body;

        if (!username || !fullname || !password || !role) {
            return res.status(400).json({
                success: false,
                message: 'username, fullname, password are required',
            });
        }

        // check username unique
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Username already exists',
            });
        }

        // create new user
        const user = new User({
            username: username,
            fullname: fullname,
            password: await hash(password),
            role: role,
        });
        await user.save();

        // tokens
        const accessToken = generateAccessToken(user._id.toString());
        const refreshToken = generateRefreshToken(user._id.toString());

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user._id,
                    username: user.username,
                    fullname: user.fullname,
                    role: user.role
                },
                accessToken: accessToken,
                refreshToken: refreshToken,
            }
        });
    } catch (error) {
        console.error('[userController.js] Register error:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

/**
* Search users by username or displayName (exclude current user)
* GET /api/users/search?q=searchTerm
*/
const getAllUsers = async (req, res) => {
    try {
        let users = await User.find();

        const { id } = req.user;
        // console.log(id);
        users = users.filter(user => user._id.toString() !== id)
            .map(user => ({
                id: user._id,
                username: user.username,
                fullname: user.fullname,
                role: user.role
            }));

        res.status(200).json({
            success: true,
            data: {
                users: users
            }
        });
    } catch (error) {
        console.error('[userController.js] Get all user error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

/**
 * delete user
 * DELETE /api/admin/users/:uid
 */
const deleteUser = async (req, res) => {
    try {
        const { id } = req.user;
        const { uid } = req.params;

        if (id === uid) return res.status(400).json({
            success: false,
            message: "Can not delete current user"
        });

        const deleted = await User.findByIdAndDelete(uid);
        if (!deleted) return res.status(404).json({
            success: false,
            message: "User not found"
        });

        return res.status(200).json({
            success: true,
            data: {
                deletedUser: {
                    id: deleted._id,
                    username: deleted.username,
                    fullname: deleted.fullname,
                    role: deleted.role
                }
            }
        })
    } catch (error) {
        console.error('[userController.js] Delete user error:', error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
}


export {
    register,
    getAllUsers,
    deleteUser
}