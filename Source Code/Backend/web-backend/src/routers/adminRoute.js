import express from 'express';

import { register, getAllUsers, deleteUser } from '../controllers/userController.js';

const router = express.Router();

// GET /admin/users
router.get("/users", getAllUsers);
// POST /admin/users/new
router.post("/users/new", register);
// DELETE /admin/users/:id 
router.delete("/users/:uid", deleteUser);

export default router;