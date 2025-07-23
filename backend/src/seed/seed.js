import pool from '../config/db.js';

const menus = [
    {
        name: "Americano",
        price: 50,
        category: "Coffee",
        temperature: "Both",
        size: "M",
        description: "กาแฟดำเข้มข้น รสกลมกล่อม ดื่มได้ทั้งร้อนและเย็น",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Latte",
        price: 60,
        category: "Coffee",
        temperature: "Both",
        size: "M",
        description: "กาแฟลาเต้ รสละมุน นมเยอะหน่อย ดื่มได้ทั้งร้อนและเย็น",
        imageUrl: "https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Cappuccino",
        price: 65,
        category: "Coffee",
        temperature: "Hot",
        size: "M",
        description: "กาแฟคาปูชิโน่ รสชาติเข้มข้นและฟองนมนุ่ม",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Espresso",
        price: 55,
        category: "Coffee",
        temperature: "Hot",
        size: "S",
        description: "กาแฟเอสเพรสโซ่ เข้มข้นสุดสำหรับคอกาแฟแท้",
        imageUrl: "https://images.unsplash.com/photo-1585247226805-ae4efcfd6bda?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Mocha",
        price: 70,
        category: "Coffee",
        temperature: "Both",
        size: "M",
        description: "กาแฟมอคค่า หวานมันช็อกโกแลตเข้มข้น",
        imageUrl: "https://images.unsplash.com/photo-1512568400610-62da28bc8a13?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Chocolate Cake",
        price: 120,
        category: "Cake",
        temperature: "Both",
        size: "M",
        description: "เค้กช็อกโกแลตเนื้อเนียน หวานกำลังดี",
        imageUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Cheesecake",
        price: 130,
        category: "Cake",
        temperature: "Both",
        size: "M",
        description: "ชีสเค้กรสละมุน เนื้อเนียนนุ่ม",
        imageUrl: "https://images.unsplash.com/photo-1606312619344-54bc3a6292d6?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Red Velvet Cake",
        price: 140,
        category: "Cake",
        temperature: "Both",
        size: "M",
        description: "เค้กเรดเวลเวต รสชาติหวานมันนุ่มลิ้น",
        imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Hot Chocolate",
        price: 75,
        category: "Rich",
        temperature: "Hot",
        size: "M",
        description: "ช็อกโกแลตร้อน หวานมัน กลมกล่อม",
        imageUrl: "https://images.unsplash.com/photo-1600891964599-f61ba0e24092?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Matcha Latte",
        price: 80,
        category: "Rich",
        temperature: "Both",
        size: "M",
        description: "มัทฉะลาเต้ หอมชาเขียว รสเข้มข้น",
        imageUrl: "https://images.unsplash.com/photo-1617181511413-3ef0e7ec4b43?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Thai Iced Tea",
        price: 65,
        category: "Rich",
        temperature: "Iced",
        size: "L",
        description: "ชาไทยเย็น หวานมัน รสชาติต้นตำรับ",
        imageUrl: "https://images.unsplash.com/photo-1528825871115-3581a5387919?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Spaghetti Carbonara",
        price: 150,
        category: "Main Dish",
        temperature: "Hot",
        size: "L",
        description: "สปาเก็ตตี้คาโบนาร่าซอสครีมชีสเข้มข้น โรยเบคอนกรอบ",
        imageUrl: "https://images.unsplash.com/photo-1525755662778-989d0524087e?auto=format&fit=crop&w=400&h=300&q=80"
    },
    {
        name: "Spaghetti Bolognese",
        price: 140,
        category: "Main Dish",
        temperature: "Hot",
        size: "L",
        description: "สปาเก็ตตี้โบโลเนสเนื้อบดซอสเข้มข้นแบบอิตาเลียน",
        imageUrl: "https://images.unsplash.com/photo-1613145998139-41b6d45d2f6b?auto=format&fit=crop&w=400&h=300&q=80"
    },
];

(async () => {
    try {
        // ปิด Foreign Key Checks
        await pool.query('SET FOREIGN_KEY_CHECKS = 0');

        // ลบข้อมูลเก่า
        await pool.query('TRUNCATE TABLE order_items');
        await pool.query('TRUNCATE TABLE orders');
        await pool.query('TRUNCATE TABLE menus');

        // เปิด Foreign Key Checks กลับ
        await pool.query('SET FOREIGN_KEY_CHECKS = 1');

        // Insert ข้อมูลใหม่
        for (const menu of menus) {
            await pool.query(
                `INSERT INTO menus (name, price, category, temperature, size, description, imageUrl)
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [menu.name, menu.price, menu.category, menu.temperature, menu.size, menu.description, menu.imageUrl]
            );
        }

        console.log('🌱 Seed data inserted successfully.');
        process.exit(0);
    } catch (err) {
        console.error('Error inserting seed data:', err);
        process.exit(1);
    }
})();
