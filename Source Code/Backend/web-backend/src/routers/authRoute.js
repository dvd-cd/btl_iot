import express from 'express';

import { login, refreshAccessToken, getUserInfo, updateProfile } from '../controllers/authController.js';
// import { updateProfile } from '../controllers/.js'
import { requireUser } from '../middlewares/auth.js';

const router = express.Router();

// login
router.post('/login', login);
// refresh access token
router.post('/refresh-token', refreshAccessToken);


// ping
router.get('/me', requireUser, getUserInfo);
// update info
router.put('/me', requireUser, updateProfile);


export default router;