const express = require('express');
const db = require('../db');

const router = express.Router();

router.get('/subjects', (req, res) => {
  const subjects = db.prepare(`
    SELECT s.*,
      (SELECT COUNT(*) FROM notes n WHERE n.subject_id = s.id) as notes_count,
      (SELECT COUNT(*) FROM videos v WHERE v.subject_id = s.id) as videos_count
    FROM subjects s ORDER BY s.name`).all();
  res.json({ subjects });
});

router.get('/subjects/:id/notes', (req, res) => {
  const notes = db.prepare('SELECT id, subject_id, title, description, pages, downloads FROM notes WHERE subject_id = ? ORDER BY title').all(req.params.id);
  res.json({ notes });
});

router.get('/subjects/:id/videos', (req, res) => {
  const videos = db.prepare('SELECT * FROM videos WHERE subject_id = ? ORDER BY title').all(req.params.id);
  res.json({ videos });
});

router.get('/notes', (req, res) => {
  const { q } = req.query;
  let sql = `SELECT n.*, s.name as subject_name, s.color as subject_color FROM notes n JOIN subjects s ON n.subject_id = s.id`;
  const params = [];
  if (q) { sql += ' WHERE n.title LIKE ?'; params.push(`%${q}%`); }
  sql += ' ORDER BY n.downloads DESC';
  res.json({ notes: db.prepare(sql).all(...params) });
});

router.get('/notes/:id', (req, res) => {
  const note = db.prepare(`SELECT n.*, s.name as subject_name, s.color as subject_color FROM notes n
    JOIN subjects s ON n.subject_id = s.id WHERE n.id = ?`).get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found' });
  db.prepare('UPDATE notes SET downloads = downloads + 1 WHERE id = ?').run(req.params.id);
  res.json({ note });
});

router.get('/videos', (req, res) => {
  const { q } = req.query;
  let sql = `SELECT v.*, s.name as subject_name FROM videos v JOIN subjects s ON v.subject_id = s.id`;
  const params = [];
  if (q) { sql += ' WHERE v.title LIKE ?'; params.push(`%${q}%`); }
  sql += ' ORDER BY v.views DESC';
  res.json({ videos: db.prepare(sql).all(...params) });
});

router.get('/videos/:id', (req, res) => {
  const video = db.prepare(`SELECT v.*, s.name as subject_name FROM videos v JOIN subjects s ON v.subject_id = s.id WHERE v.id = ?`).get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found' });
  res.json({ video });
});

module.exports = router;
