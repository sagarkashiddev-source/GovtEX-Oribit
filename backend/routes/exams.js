const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.get('/', (req, res) => {
  const { category, q } = req.query;
  let sql = 'SELECT * FROM exams WHERE 1=1';
  const params = [];
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (q) { sql += ' AND (name LIKE ? OR short_name LIKE ?)'; params.push(`%${q}%`, `%${q}%`); }
  sql += ' ORDER BY application_end ASC';
  const exams = db.prepare(sql).all(...params);
  res.json({ exams });
});

router.get('/categories', (req, res) => {
  const rows = db.prepare('SELECT DISTINCT category FROM exams ORDER BY category').all();
  res.json({ categories: rows.map(r => r.category) });
});

router.get('/:id', (req, res) => {
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  res.json({ exam });
});

module.exports = router;
