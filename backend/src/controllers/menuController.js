import pool from '../config/db.js';

// helper: random placeholder image (coffee/drink)
function randomMenuImage(seed = Date.now()) {
  // Unsplash featured/random
  const r = Math.floor(Math.random() * 99999);
  return `https://source.unsplash.com/featured/?coffee,drink&sig=${seed}-${r}`;
}

export const getMenus = async (req, res) => {
  const { category, temperature, size, q } = req.query;
  let sql = 'SELECT * FROM menus WHERE 1=1';
  const params = [];

  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }
  if (temperature) {
    sql += ' AND temperature = ?';
    params.push(temperature);
  }
  if (size) {
    sql += ' AND size = ?';
    params.push(size);
  }
  if (q) {
    sql += ' AND name LIKE ?';
    params.push(`%${q}%`);
  }
  const [rows] = await pool.query(sql, params);
  res.json(rows);
};

export const createMenu = async (req, res) => {
  let { name, price, imageUrl } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'name and price are required' });
  }

  // ไม่ insert เมนูซ้ำ
  const [exists] = await pool.query('SELECT id FROM menus WHERE name=?', [name]);
  if (exists.length > 0) {
    return res.status(400).json({ error: 'Menu already exists' });
  }

  if (!imageUrl || imageUrl.trim() === '') {
    imageUrl = `https://source.unsplash.com/featured/?coffee,drink&sig=${Date.now()}`;
  }

  await pool.query(
    'INSERT INTO menus (name, price, imageUrl) VALUES (?, ?, ?)',
    [name, price, imageUrl]
  );
  res.json({ message: 'Menu created' });
};

export const updateMenu = async (req, res) => {
  const { name, price, image } = req.body;
  await pool.query(
    'UPDATE menus SET name=?, price=?, image=? WHERE id=?',
    [name, price, image, req.params.id]
  );
  res.json({ message: 'Menu updated' });
};

export const deleteMenu = async (req, res) => {
  await pool.query('DELETE FROM menus WHERE id=?', [req.params.id]);
  res.json({ message: 'Menu deleted' });
};
