import express from 'express';

import { addDevice } from '../controllers/deviceController.js';
import { requireUser } from '../middlewares/auth.js'

const router = express.Router();

router.post('/new', requireUser, addDevice);

export default router;