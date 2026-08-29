const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuid } = require('uuid');
const db = require('../db');
const { requireAuth, SECRET } = require('../middleware/auth');

const router = express.Router();
const AVATAR_COLORS = ['#1E3A8A', '#4059AA', '#0B192C', '#2563EB'];

function publicUser(u) {
  if (!u) return null;
  const { password_hash, ...rest } = u;
  return rest;
}

router.post('/signup', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email and password are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
  if (existing) return res.status(409).json({ error: 'An account with this email already exists.' });

  const id = uuid();
  const hash = bcrypt.hashSync(password, 10);
  const color = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
  db.prepare(`INSERT INTO users (id, name, email, password_hash, avatar_color, onboarding_step)
    VALUES (?, ?, ?, ?, ?, 'basic')`).run(id, name, email.toLowerCase(), hash, color);
  db.prepare('INSERT INTO preferences (user_id) VALUES (?)').run(id);

  const token = jwt.sign({ userId: id }, SECRET, { expiresIn: '30d' });
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  res.json({ token, user: publicUser(user) });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });
  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }
  const token = jwt.sign({ userId: user.id }, SECRET, { expiresIn: '30d' });
  res.json({ token, user: publicUser(user) });
});

router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const education = db.prepare('SELECT * FROM education_details WHERE user_id = ?').get(req.userId);
  const physical = db.prepare('SELECT * FROM physical_profile WHERE user_id = ?').get(req.userId);
  const preferences = db.prepare('SELECT * FROM preferences WHERE user_id = ?').get(req.userId);
  res.json({
    user: publicUser(user),
    education: education || null,
    physical: physical || null,
    preferences: preferences ? {
      ...preferences,
      preferred_categories: JSON.parse(preferences.preferred_categories || '[]'),
      preferred_states: JSON.parse(preferences.preferred_states || '[]')
    } : null
  });
});

module.exports = router;
