import pool from '../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "secret123"; // ควรเปลี่ยนใน production

export const register = async (req, res) => {
    const { username, password, role } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });

    try {
        const hashed = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashed, role || 'staff']
        );
        res.json({ message: "สร้างผู้ใช้สำเร็จ" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "ไม่สามารถสร้างผู้ใช้ได้" });
    }
};

export const login = async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password)
        return res.status(400).json({ error: "กรอกข้อมูลไม่ครบ" });

    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length === 0) return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านผิด" });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "ชื่อผู้ใช้หรือรหัสผ่านผิด" });

        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "เกิดข้อผิดพลาด" });
    }
};
