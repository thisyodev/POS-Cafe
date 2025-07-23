import pool from '../config/db.js';

export const processPayment = async (req, res) => {
    try {
        const { items, total, method } = req.body;
        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'No items' });
        }

        // บันทึก order
        const [result] = await pool.query(
            'INSERT INTO orders (total, method, created_at) VALUES (?, ?, NOW())',
            [total, method]
        );
        const orderId = result.insertId;

        // บันทึก order_items
        for (let i of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, menu_id, qty, price) VALUES (?, ?, ?, ?)',
                [orderId, i.id, i.qty, i.price]
            );
        }

        res.json({ message: 'Payment success', orderId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Payment failed' });
    }
};
