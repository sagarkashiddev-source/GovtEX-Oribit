const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

function hydrate(item) {
  if (item.item_type === 'exam') {
    return { ...item, detail: db.prepare('SELECT * FROM exams WHERE id = ?').get(item.item_id) };
  }
  if (item.item_type === 'note') {
    return { ...item, detail: db.prepare('SELECT n.*, s.name as subject_name FROM notes n JOIN subjects s ON n.subject_id = s.id WHERE n.id = ?').get(item.item_id) };
  }
  if (item.item_type === 'video') {
    return { ...item, detail: db.prepare('SELECT v.*, s.name as subject_name FROM videos v JOIN subjects s ON v.subject_id = s.id WHERE v.id = ?').get(item.item_id) };
  }
  return item;
}

router.get('/', (req, res) => {
  const { type } = req.query;
  let sql = 'SELECT * FROM saved_items WHERE user_id = ?';
  const params = [req.userId];
  if (type) { sql += ' AND item_type = ?'; params.push(type); }
  sql += ' ORDER BY saved_at DESC';
  const items = db.prepare(sql).all(...params).map(hydrate).filter(i => i.detail);
  res.json({ items });
});

router.post('/', (req, res) => {
  const { item_type, item_id } = req.body;
  if (!['exam', 'note', 'video'].includes(item_type)) return res.status(400).json({ error: 'Invalid item type' });
  const existing = db.prepare('SELECT * FROM saved_items WHERE user_id=? AND item_type=? AND item_id=?').get(req.userId, item_type, item_id);
  if (existing) return res.json({ saved: true, item: existing });
  const id = uuid();
  db.prepare('INSERT INTO saved_items (id, user_id, item_type, item_id) VALUES (?,?,?,?)').run(id, req.userId, item_type, item_id);
  res.json({ saved: true, item: db.prepare('SELECT * FROM saved_items WHERE id = ?').get(id) });
});

router.delete('/', (req, res) => {
  const { item_type, item_id } = req.body;
  db.prepare('DELETE FROM saved_items WHERE user_id=? AND item_type=? AND item_id=?').run(req.userId, item_type, item_id);
  res.json({ saved: false });
});

router.get('/check', (req, res) => {
  const { item_type, item_id } = req.query;
  const existing = db.prepare('SELECT id FROM saved_items WHERE user_id=? AND item_type=? AND item_id=?').get(req.userId, item_type, item_id);
  res.json({ saved: !!existing });
});

module.exports = router;
