const pool = require('../db');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, unique_id, email, created_at FROM users ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      const result = await pool.query(
        'UPDATE users SET email = $1, password = $2 WHERE id = $3 RETURNING id, unique_id, email',
        [email, hashed, id]
      );
      if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
      return res.json(result.rows[0]);
    }
    const result = await pool.query(
      'UPDATE users SET email = $1 WHERE id = $2 RETURNING id, unique_id, email',
      [email, id]
    );
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    if (!result.rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
