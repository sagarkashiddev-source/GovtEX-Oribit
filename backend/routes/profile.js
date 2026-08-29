const express = require('express');
const db = require('../db');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.put('/basic', (req, res) => {
  const { name, phone, dob, gender, category, state } = req.body;
  db.prepare(`UPDATE users SET name = COALESCE(?, name), phone = ?, dob = ?, gender = ?, category = ?, state = ?,
    onboarding_step = CASE WHEN onboarding_step = 'basic' THEN 'education' ELSE onboarding_step END
    WHERE id = ?`).run(name, phone, dob, gender, category, state, req.userId);
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  const { password_hash, ...rest } = user;
  res.json({ user: rest });
});

router.put('/education', (req, res) => {
  const { highest_qualification, stream, board_university, year_of_passing, percentage } = req.body;
  const existing = db.prepare('SELECT user_id FROM education_details WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare(`UPDATE education_details SET highest_qualification=?, stream=?, board_university=?,
      year_of_passing=?, percentage=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`)
      .run(highest_qualification, stream, board_university, year_of_passing, percentage, req.userId);
  } else {
    db.prepare(`INSERT INTO education_details (user_id, highest_qualification, stream, board_university,
      year_of_passing, percentage) VALUES (?,?,?,?,?,?)`)
      .run(req.userId, highest_qualification, stream, board_university, year_of_passing, percentage);
  }
  db.prepare(`UPDATE users SET onboarding_step = CASE WHEN onboarding_step = 'education' THEN 'physical' ELSE onboarding_step END WHERE id = ?`).run(req.userId);
  res.json({ education: db.prepare('SELECT * FROM education_details WHERE user_id = ?').get(req.userId) });
});

router.put('/physical', (req, res) => {
  const { height_cm, weight_kg, chest_cm, vision } = req.body;
  const existing = db.prepare('SELECT user_id FROM physical_profile WHERE user_id = ?').get(req.userId);
  if (existing) {
    db.prepare(`UPDATE physical_profile SET height_cm=?, weight_kg=?, chest_cm=?, vision=?, updated_at=CURRENT_TIMESTAMP
      WHERE user_id=?`).run(height_cm, weight_kg, chest_cm, vision, req.userId);
  } else {
    db.prepare(`INSERT INTO physical_profile (user_id, height_cm, weight_kg, chest_cm, vision) VALUES (?,?,?,?,?)`)
      .run(req.userId, height_cm, weight_kg, chest_cm, vision);
  }
  db.prepare(`UPDATE users SET onboarding_step = CASE WHEN onboarding_step = 'physical' THEN 'done' ELSE onboarding_step END WHERE id = ?`).run(req.userId);
  res.json({ physical: db.prepare('SELECT * FROM physical_profile WHERE user_id = ?').get(req.userId) });
});

router.put('/preferences', (req, res) => {
  const { preferred_categories, preferred_states } = req.body;
  db.prepare(`UPDATE preferences SET preferred_categories=?, preferred_states=?, updated_at=CURRENT_TIMESTAMP WHERE user_id=?`)
    .run(JSON.stringify(preferred_categories || []), JSON.stringify(preferred_states || []), req.userId);
  db.prepare(`UPDATE users SET onboarding_step='done' WHERE id = ?`).run(req.userId);
  res.json({ ok: true });
});

router.put('/skip-onboarding', (req, res) => {
  db.prepare(`UPDATE users SET onboarding_step='done' WHERE id = ?`).run(req.userId);
  res.json({ ok: true });
});

module.exports = router;
