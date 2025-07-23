import express from 'express';
import { login, register } from '../controllers/authController.js';
const router = express.Router();

router.post('/login', login);
router.post('/register', register); // สามารถปิดใน production หรือเช็ค admin

export default router;
