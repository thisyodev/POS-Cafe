import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

dotenv.config();
const app = express();

/**
 * Allowed origins
 * - ถ้ามี POS_URL / CUSTOMER_URL ให้ใช้
 * - ถ้าไม่ตั้ง env -> อนุญาตทุก origin (เพื่อ dev ง่าย ๆ)
 */
const allowedOrigins = [
    process.env.POS_URL,
    process.env.CUSTOMER_URL,
    process.env.EXTRA_ORIGIN, // เผื่ออนาคต
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        // ไม่ระบุ origin (เช่น curl / server-to-server) -> allow
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0) return callback(null, true); // allow all
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false, // เปลี่ยนเป็น true ถ้าต้องการ cookie / auth-based session
};

// ใช้ CORS ทุก request
app.use(cors(corsOptions));
// จัดการ preflight
app.options('*', cors(corsOptions));

// Body parser
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
// Routes
app.use('/api/menu', menuRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/report', reportRoutes);

// Health
app.get('/', (req, res) => res.send('POS-Cafe Backend Running'));

// Error handler (CORS / อื่น ๆ)
app.use((err, req, res, next) => {
    console.error('Server error:', err?.message || err);
    if (err?.message?.startsWith('CORS blocked')) {
        return res.status(403).json({ error: err.message });
    }
    res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`POS-Cafe backend running on port ${PORT}`)
);
