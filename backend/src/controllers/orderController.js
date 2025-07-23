import pool from '../config/db.js';
import PDFDocument from 'pdfkit';

export const getOrders = async (req, res) => {
    try {
        const [orders] = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
        for (const order of orders) {
            const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
            order.items = items;
        }
        res.json(orders);
    } catch (err) {
        console.error("getOrders error:", err);
        res.status(500).json({ error: 'Error fetching orders' });
    }
};

export const getOrderById = async (req, res) => {
    const { id } = req.params;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return res.status(404).json({ error: 'Order not found' });

        const order = orders[0];
        const [items] = await pool.query(`
      SELECT oi.id, oi.quantity AS qty, m.name, m.price
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = ?
    `, [id]);

        res.json({ order, items });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching order details' });
    }
};

export const createOrder = async (req, res) => {
    const { tableNumber, items, total } = req.body;

    if (!tableNumber || !items || items.length === 0) {
        return res.status(400).json({ error: 'ข้อมูลโต๊ะและรายการสินค้าต้องครบ' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO orders (table_number, total, status) VALUES (?, ?, ?)',
            [tableNumber, total, 'pending']
        );
        const orderId = result.insertId;

        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.menu_id, item.quantity, item.price] // ต้องส่ง price มาด้วย
            );
        }

        res.json({ message: 'สร้างออเดอร์เรียบร้อย', orderId });
    } catch (err) {
        console.error("createOrder error:", err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างออเดอร์' });
    }
};

export const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    try {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, req.params.id]);
        res.json({ message: 'Order status updated' });
    } catch (err) {
        console.error("updateOrderStatus error:", err);
        res.status(500).json({ error: 'Error updating order status' });
    }
};

export const generateReceiptPDF = async (req, res) => {
    const { id } = req.params;
    try {
        const [orders] = await pool.query('SELECT * FROM orders WHERE id = ?', [id]);
        if (orders.length === 0) return res.status(404).send('Order not found');

        const order = orders[0];
        const [items] = await pool.query(`
      SELECT oi.quantity AS qty, oi.price, m.name
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = ?
    `, [id]);

        // แปลง total ให้เป็น number แน่ใจ
        const total = Number(order.total) || 0;

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=receipt_${id}.pdf`);

        doc.pipe(res);

        doc.fontSize(20).text('POS-Cafe Receipt', { align: 'center' });
        doc.moveDown();
        doc.fontSize(14).text(`Order ID: ${id}`);
        doc.text(`Table Number: ${order.table_number}`);
        doc.text(`Date: ${order.created_at ? new Date(order.created_at).toLocaleString() : new Date().toLocaleString()}`);
        doc.moveDown();

        items.forEach(item => {
            const itemTotal = (Number(item.price) || 0) * (Number(item.qty) || 0);
            doc.text(`${item.name} x${item.qty}  -  ${itemTotal.toFixed(2)} ฿`);
        });

        doc.moveDown();
        doc.fontSize(16).text(`Total: ${total.toFixed(2)} ฿`, { align: 'right' });

        doc.end();

        // อย่าเขียน response อะไรเพิ่มเติมหลังนี้
    } catch (err) {
        console.error('generateReceiptPDF error:', err);
        if (!res.headersSent) {
            res.status(500).send('Server error');
        }
    }
};

export const checkoutOrder = async (req, res) => {
    try {
        const { tableNumber, items, total } = req.body;

        // ถ้าไม่มี tableNumber ให้ตั้งเป็น "Walk-in"
        const table = tableNumber && tableNumber.trim() !== "" ? tableNumber : "Walk-in";

        if (!items || items.length === 0) {
            return res.status(400).json({ error: 'ต้องมีรายการสินค้า' });
        }

        const [result] = await pool.query(
            'INSERT INTO orders (table_number, total, status) VALUES (?, ?, ?)',
            [table, total, 'paid'] // Checkout แล้ว ถือว่าชำระเงินทันที
        );
        const orderId = result.insertId;

        for (const item of items) {
            await pool.query(
                'INSERT INTO order_items (order_id, menu_id, quantity, price) VALUES (?, ?, ?, ?)',
                [orderId, item.id || item.menu_id, item.quantity || item.qty, item.price]
            );
        }

        res.json({ message: 'Checkout สำเร็จ', orderId });
    } catch (err) {
        console.error("checkoutOrder error:", err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการ Checkout' });
    }
};
