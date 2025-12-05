import express from 'express';

import adminRoute from './adminRoute.js'
import authRouter from './authRoute.js';
import deviceRouter from './deviceRoute.js'

import { requireUser, requireAdmin } from '../middlewares/auth.js';

const router = express.Router();

// auth
router.use('/auth', authRouter);
// admin
router.use('/admin', requireUser, requireAdmin, adminRoute);
// device
router.use('/device', deviceRouter);

export default router;