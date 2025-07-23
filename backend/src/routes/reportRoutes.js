import express from 'express';
import { getDailyReport, getMonthlyReport, getDailySales } from '../controllers/reportController.js';
const router = express.Router();

router.get('/daily', getDailyReport);
router.get('/monthly', getMonthlyReport);
router.get('/daily-sales', getDailySales);

export default router;
