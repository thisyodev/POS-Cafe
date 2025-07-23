import pool from '../config/db.js';

(async () => {
    try {
      console.log('--- Migrating DB (drop + recreate) ---');

      // ปิด FK ชั่วคราว ป้องกัน error ตอน DROP
      await pool.query('SET FOREIGN_KEY_CHECKS=0');

      // ลบตารางตามลำดับ dependency
      await pool.query('DROP TABLE IF EXISTS order_items');
      await pool.query('DROP TABLE IF EXISTS orders');
      await pool.query('DROP TABLE IF EXISTS menus');

      // เปิด FK กลับ
      await pool.query('SET FOREIGN_KEY_CHECKS=1');

      // ตารางผู้ใช้งาน
      await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'staff') DEFAULT 'staff',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

      // ตารางเมนูอาหาร
      await pool.query(`
      CREATE TABLE menus (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR(100),
        temperature ENUM('Hot','Iced','Both') DEFAULT 'Both',
        size VARCHAR(10),
        description TEXT,
        imageUrl VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_menus_category (category),
        INDEX idx_menus_name (name)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

      // ตารางออร์เดอร์หลัก
      await pool.query(`
      CREATE TABLE orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        table_number VARCHAR(10),
        total DECIMAL(10,2),
        status VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_orders_created (created_at),
        INDEX idx_orders_status (status),
        INDEX idx_orders_table (table_number)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);


      // ตารางรายการอาหารในออร์เดอร์
      await pool.query(`
      CREATE TABLE order_items (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id INT NOT NULL,
        menu_id INT NOT NULL,
        quantity INT NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (menu_id) REFERENCES menus(id) ON DELETE RESTRICT,
        INDEX idx_order_items_order (order_id),
        INDEX idx_order_items_menu (menu_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

        console.log('Migration completed.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();
