import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: "ไม่พบ Token" });

    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(403).json({ error: "Token ไม่ถูกต้อง" });
        req.user = decoded;
        next();
    });
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "ต้องเป็น admin" });
    next();
};
