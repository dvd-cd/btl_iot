import express from 'express';

import { addDevice, deleteDevice, getAllDevices, getDevice, updateDevice, doorAction, getAccessLogs } from '../controllers/deviceController.js';
import { addFace, deleteFace } from '../controllers/faceBiometricController.js';
import { requireUser } from '../middlewares/auth.js'
import uploadCloud from '../middlewares/upload.js';

const router = express.Router();

// get all device
router.get('/', getAllDevices);
// get one device
router.get('/:deviceId', getDevice);
// add new device
router.post('/new', addDevice);
// update device
router.put('/:deviceId', updateDevice);
// delete device
router.delete('/:deviceId', deleteDevice);

// biometrics
router.post('/:deviceId/faces/new', uploadCloud.array('images'), addFace);
router.delete('/:deviceId/faces/:faceId/:imageURL', deleteFace);

// click open/close door
router.post('/:deviceId/commands', doorAction);

// logs
router.get('/:deviceId/access-logs', getAccessLogs);

export default router;