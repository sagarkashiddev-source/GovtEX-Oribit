const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { evaluateExam } = require('../eligibility-engine');

const router = express.Router();
router.use(requireAuth);

router.get('/', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const education = db.prepare('SELECT * FROM education_details WHERE user_id = ?').get(req.userId);
  const physical = db.prepare('SELECT * FROM physical_profile WHERE user_id = ?').get(req.userId);

  const exams = db.prepare('SELECT * FROM exams ORDER BY application_end ASC').all();
  const evals = exams.map(exam => ({ exam, ...evaluateExam(user, education, physical, exam) }));
  const eligibleCount = evals.filter(e => e.overall === 'eligible').length;

  const today = new Date().toISOString().slice(0, 10);
  const upcomingDeadlines = evals
    .filter(e => e.exam.application_end >= today)
    .slice(0, 4)
    .map(e => ({ exam: e.exam, overall: e.overall }));

  const applications = db.prepare(`SELECT a.*, e.name as exam_name, e.short_name as exam_short_name, e.accent_color
    FROM applications a JOIN exams e ON a.exam_id = e.id WHERE a.user_id = ? ORDER BY a.updated_at DESC LIMIT 5`).all(req.userId);

  const savedCount = db.prepare('SELECT COUNT(*) c FROM saved_items WHERE user_id = ?').get(req.userId).c;

  let profileFields = 4; // dob, gender, category, state
  let filled = [user.dob, user.gender, user.category, user.state].filter(Boolean).length;
  profileFields += 2; filled += education ? [education.highest_qualification, education.percentage].filter(v => v != null).length : 0;
  const profileCompletion = Math.round((filled / profileFields) * 100);

  res.json({
    user: { name: user.name, avatar_color: user.avatar_color, onboarding_step: user.onboarding_step },
    stats: {
      totalExams: exams.length,
      eligibleCount,
      applicationsInProgress: applications.filter(a => a.status !== 'result').length,
      savedCount,
      profileCompletion
    },
    upcomingDeadlines,
    recentApplications: applications
  });
});

module.exports = router;
