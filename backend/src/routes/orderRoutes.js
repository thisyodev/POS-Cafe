import express from 'express';
import {
    getOrders,
    getOrderById,
    createOrder,
    checkoutOrder,
    updateOrderStatus,
    generateReceiptPDF,
} from '../controllers/orderController.js';
// import { verifyToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// router.use(verifyToken);

router.get('/', getOrders);
router.get('/:id', getOrderById);
router.post('/', createOrder);
router.post('/checkout', checkoutOrder); // เพิ่ม endpoint checkout
router.put('/:id/status', updateOrderStatus);
router.get('/receipt/:id', generateReceiptPDF);

export default router;
