const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { evaluateExam } = require('../eligibility-engine');

const router = express.Router();
router.use(requireAuth);

function getProfile(userId) {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  const education = db.prepare('SELECT * FROM education_details WHERE user_id = ?').get(userId);
  const physical = db.prepare('SELECT * FROM physical_profile WHERE user_id = ?').get(userId);
  return { user, education, physical };
}

router.get('/', (req, res) => {
  const { user, education, physical } = getProfile(req.userId);
  const exams = db.prepare('SELECT * FROM exams ORDER BY application_end ASC').all();
  const results = exams.map(exam => {
    const evalResult = evaluateExam(user, education, physical, exam);
    return { exam, ...evalResult };
  });
  const summary = {
    eligible: results.filter(r => r.overall === 'eligible').length,
    not_eligible: results.filter(r => r.overall === 'not_eligible').length,
    incomplete: results.filter(r => r.overall === 'incomplete').length
  };
  res.json({ results, summary });
});

router.get('/:examId', (req, res) => {
  const { user, education, physical } = getProfile(req.userId);
  const exam = db.prepare('SELECT * FROM exams WHERE id = ?').get(req.params.examId);
  if (!exam) return res.status(404).json({ error: 'Exam not found' });
  const result = evaluateExam(user, education, physical, exam);
  res.json({ exam, ...result });
});

module.exports = router;
