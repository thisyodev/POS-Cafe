import pool from '../config/db.js';

export const getDailyReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT DATE(created_at) as date, SUM(total) as total_sales
      FROM orders
      WHERE DATE(created_at) = CURDATE()
      GROUP BY DATE(created_at)
    `);
        res.json(rows[0] || { date: new Date(), total_sales: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching daily report' });
    }
};

export const getMonthlyReport = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT MONTH(created_at) as month, YEAR(created_at) as year, SUM(total) as total_sales
      FROM orders
      WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())
      GROUP BY MONTH(created_at), YEAR(created_at)
    `);
        res.json(rows[0] || { month: new Date().getMonth() + 1, total_sales: 0 });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching monthly report' });
    }
};

/**
 * ดึงยอดขายรายวัน (daily sales)
 * สามารถกรองตามหมวดหมู่ เช่น /api/report/daily-sales?category=cake
 */
export const getDailySales = async (req, res) => {
    try {
        const [rows] = await pool.query(`
      SELECT DATE(o.created_at) as date, SUM(o.total) as totalSales, COUNT(o.id) as totalOrders
      FROM orders o
      WHERE DATE(o.created_at) = CURDATE()
      GROUP BY DATE(o.created_at)
    `);

        const [topMenus] = await pool.query(`
      SELECT m.name, SUM(oi.quantity) as qty
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      JOIN orders o ON oi.order_id = o.id
      WHERE DATE(o.created_at) = CURDATE()
      GROUP BY m.name
      ORDER BY qty DESC
      LIMIT 5
    `);

        res.json({
            reportDate: rows[0]?.date || new Date().toISOString().split('T')[0],
            totalSales: rows[0]?.totalSales || 0,
            totalOrders: rows[0]?.totalOrders || 0,
            topMenus
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching daily sales report' });
    }
};
