const express = require('express');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

const VALID_STATUSES = ['draft', 'applied', 'admit_card', 'exam_taken', 'result'];

router.get('/', (req, res) => {
  const rows = db.prepare(`
    SELECT a.*, e.name as exam_name, e.short_name as exam_short_name, e.accent_color, e.exam_date, e.application_end
    FROM applications a JOIN exams e ON a.exam_id = e.id
    WHERE a.user_id = ? ORDER BY a.updated_at DESC`).all(req.userId);
  res.json({ applications: rows });
});

router.post('/', (req, res) => {
  const { exam_id, status } = req.body;
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(exam_id);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  const existing = db.prepare('SELECT * FROM applications WHERE user_id = ? AND exam_id = ?').get(req.userId, exam_id);
  if (existing) return res.status(409).json({ error: 'You are already tracking this exam.', application: existing });

  const id = uuid();
  const finalStatus = VALID_STATUSES.includes(status) ? status : 'draft';
  db.prepare(`INSERT INTO applications (id, user_id, exam_id, status, applied_at) VALUES (?,?,?,?,?)`)
    .run(id, req.userId, exam_id, finalStatus, finalStatus === 'applied' ? new Date().toISOString() : null);
  const application = db.prepare('SELECT * FROM applications WHERE id = ?').get(id);
  res.json({ application });
});

router.put('/:id', (req, res) => {
  const { status, notes } = req.body;
  const app = db.prepare('SELECT * FROM applications WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!app) return res.status(404).json({ error: 'Application not found' });
  const finalStatus = VALID_STATUSES.includes(status) ? status : app.status;
  db.prepare(`UPDATE applications SET status=?, notes=COALESCE(?, notes),
    applied_at = CASE WHEN ? = 'applied' AND applied_at IS NULL THEN ? ELSE applied_at END,
    updated_at=CURRENT_TIMESTAMP WHERE id=?`)
    .run(finalStatus, notes, finalStatus, new Date().toISOString(), req.params.id);
  res.json({ application: db.prepare('SELECT * FROM applications WHERE id = ?').get(req.params.id) });
});

router.delete('/:id', (req, res) => {
  const info = db.prepare('DELETE FROM applications WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  if (info.changes === 0) return res.status(404).json({ error: 'Application not found' });
  res.json({ ok: true });
});

module.exports = router;
