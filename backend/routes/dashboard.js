const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');
const { evaluateExam } = require('../eligibility-engine');

const router = express.Router();
router.use(requireAuth);

function daysUntil(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  return Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
}

router.get('/', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const education = db.prepare('SELECT * FROM education_details WHERE user_id = ?').get(req.userId);
  const physical = db.prepare('SELECT * FROM physical_profile WHERE user_id = ?').get(req.userId);

  const exams = db.prepare('SELECT * FROM exams ORDER BY application_end ASC').all();
  const evals = exams.map(exam => ({ exam, ...evaluateExam(user, education, physical, exam) }));
  const eligible = evals.filter(e => e.overall === 'eligible');

  const today = new Date().toISOString().slice(0, 10);
  const openForApplication = eligible.filter(e => {
    const dl = daysUntil(e.exam.application_end);
    return dl === null || dl >= 0;
  });

  // Best match: highest eligibility %, tie-broken by soonest deadline
  const bestMatch = [...openForApplication].sort((a, b) => {
    if ((b.matchPercent ?? 0) !== (a.matchPercent ?? 0)) return (b.matchPercent ?? 0) - (a.matchPercent ?? 0);
    const da = daysUntil(a.exam.application_end) ?? Infinity;
    const db_ = daysUntil(b.exam.application_end) ?? Infinity;
    return da - db_;
  })[0] || null;

  const deadlinesThisWeek = eligible.filter(e => {
    const dl = daysUntil(e.exam.application_end);
    return dl !== null && dl >= 0 && dl <= 7;
  }).length;

  const upcomingDeadlines = evals
    .filter(e => {
      const dl = daysUntil(e.exam.application_end);
      return dl === null || dl >= 0;
    })
    .slice(0, 4)
    .map(e => ({ exam: e.exam, overall: e.overall, matchPercent: e.matchPercent, daysLeft: daysUntil(e.exam.application_end) }));

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
      eligibleCount: eligible.length,
      applicationsInProgress: applications.filter(a => a.status !== 'result').length,
      savedCount,
      profileCompletion,
      deadlinesThisWeek
    },
    bestMatch: bestMatch ? { exam: bestMatch.exam, matchPercent: bestMatch.matchPercent, daysLeft: daysUntil(bestMatch.exam.application_end) } : null,
    upcomingDeadlines,
    recentApplications: applications
  });
});

module.exports = router;
