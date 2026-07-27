const pool = require('../db');
const multer = require('multer');
const csvParser = require('csv-parser');
const fastCsv = require('fast-csv');
const ExcelJS = require('exceljs');
const fs = require('fs');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
exports.upload = multer({ storage });

exports.csvUpload = multer({ dest: 'uploads/csv/' });

exports.getAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { sortBy = 'created_at', order = 'desc', search = '', category = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT p.*, c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND p.name ILIKE $${params.length}`;
    }
    if (category) {
      params.push(`%${category}%`);
      query += ` AND c.name ILIKE $${params.length}`;
    }

    const validSort = ['price', 'created_at', 'name'];
    const sortColumn = validSort.includes(sortBy) ? sortBy : 'created_at';
    const sortOrder = order === 'asc' ? 'ASC' : 'DESC';
    query += ` ORDER BY p.${sortColumn} ${sortOrder}`;

    params.push(limit, offset);
    query += ` LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const data = await pool.query(query, params);

    let countQuery = `SELECT COUNT(*) FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const countParams = [];
    if (search) { countParams.push(`%${search}%`); countQuery += ` AND p.name ILIKE $${countParams.length}`; }
    if (category) { countParams.push(`%${category}%`); countQuery += ` AND c.name ILIKE $${countParams.length}`; }
    const count = await pool.query(countQuery, countParams);

    res.json({
      products: data.rows,
      total: parseInt(count.rows[0].count),
      page,
      totalPages: Math.ceil(parseInt(count.rows[0].count) / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = $1',
      [req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    if (!name || !price || !category_id) return res.status(400).json({ message: 'Name, price, and category are required' });
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      'INSERT INTO products (name, image, price, category_id) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, image, parseFloat(price), category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, price, category_id } = req.body;
    if (!name || !price || !category_id) return res.status(400).json({ message: 'Name, price, and category are required' });
    const image = req.file ? `/uploads/${req.file.filename}` : (req.body.image || null);
    const result = await pool.query(
      'UPDATE products SET name=$1, image=$2, price=$3, category_id=$4 WHERE id=$5 RETURNING *',
      [name, image, parseFloat(price), category_id, req.params.id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json(result.rows[0]);
  } catch (err) {
    if (req.file) fs.unlink(req.file.path, () => {});
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING id', [req.params.id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.bulkUpload = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });
  const filePath = req.file.path;
  const results = [];

  const cleanup = () => { try { fs.unlinkSync(filePath); } catch (_) {} };

  const stream = fs.createReadStream(filePath).pipe(csvParser());

  stream.on('data', (row) => results.push(row));

  stream.on('error', (err) => {
    cleanup();
    res.status(500).json({ message: 'Error reading CSV', error: err.message });
  });

  stream.on('end', async () => {
    if (results.length === 0) {
      cleanup();
      return res.status(400).json({ message: 'CSV file is empty' });
    }
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let inserted = 0;
      for (const row of results) {
        if (!row.name || !row.price || !row.category_id) continue;
        await client.query(
          'INSERT INTO products (name, price, category_id) VALUES ($1, $2, $3)',
          [row.name.trim(), parseFloat(row.price), row.category_id.trim()]
        );
        inserted++;
      }
      await client.query('COMMIT');
      cleanup();
      res.json({ message: `${inserted} products uploaded successfully` });
    } catch (err) {
      await client.query('ROLLBACK');
      cleanup();
      res.status(500).json({ message: 'Bulk upload failed', error: err.message });
    } finally {
      client.release();
    }
  });
};

exports.downloadCSV = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name, p.price, p.unique_id, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=products.csv');
    fastCsv.write(result.rows, { headers: true }).pipe(res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.downloadExcel = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.name, p.price, p.unique_id, c.name as category
      FROM products p LEFT JOIN categories c ON p.category_id = c.id
      ORDER BY p.created_at DESC
    `);
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Products');
    sheet.columns = [
      { header: 'Name', key: 'name', width: 30 },
      { header: 'Price', key: 'price', width: 15 },
      { header: 'Unique ID', key: 'unique_id', width: 40 },
      { header: 'Category', key: 'category', width: 20 }
    ];
    sheet.addRows(result.rows);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=products.xlsx');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
