const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db');

const router = express.Router();

const UPLOAD_ROOT = path.join(__dirname, '..', 'uploads');
const PDF_DIR = path.join(UPLOAD_ROOT, 'notes');
const VIDEO_DIR = path.join(UPLOAD_ROOT, 'videos');
[UPLOAD_ROOT, PDF_DIR, VIDEO_DIR].forEach(dir => fs.mkdirSync(dir, { recursive: true }));

const ADMIN_KEY = process.env.ADMIN_KEY || 'govtex-admin-dev-key';

function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== ADMIN_KEY) return res.status(401).json({ error: 'Invalid or missing admin key.' });
  next();
}
router.use(requireAdmin);

// ---- listing helpers for the admin UI (so it can show what's already there) ----
router.get('/notes', (req, res) => {
  const notes = db.prepare(`SELECT n.*, s.name as subject_name FROM notes n JOIN subjects s ON n.subject_id = s.id ORDER BY s.name, n.title`).all();
  res.json({ notes });
});
router.get('/videos', (req, res) => {
  const videos = db.prepare(`SELECT v.*, s.name as subject_name FROM videos v JOIN subjects s ON v.subject_id = s.id ORDER BY s.name, v.title`).all();
  res.json({ videos });
});

// ---- PDF upload for a note ----
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, PDF_DIR),
  filename: (req, file, cb) => cb(null, `${req.params.id}${path.extname(file.originalname) || '.pdf'}`)
});
const uploadPdf = multer({
  storage: pdfStorage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') return cb(new Error('Only PDF files are allowed.'));
    cb(null, true);
  }
});

router.post('/notes/:id/pdf', uploadPdf.single('file'), (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  // remove old file if a new one replaces it under a different extension
  if (note.pdf_path) {
    const oldPath = path.join(UPLOAD_ROOT, note.pdf_path);
    if (fs.existsSync(oldPath) && oldPath !== req.file.path) fs.unlinkSync(oldPath);
  }
  const relPath = path.relative(UPLOAD_ROOT, req.file.path);
  db.prepare('UPDATE notes SET pdf_path = ?, pdf_original_name = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(relPath, req.file.originalname, req.params.id);
  res.json({ ok: true, pdf_path: relPath });
});

router.delete('/notes/:id/pdf', (req, res) => {
  const note = db.prepare('SELECT * FROM notes WHERE id = ?').get(req.params.id);
  if (!note) return res.status(404).json({ error: 'Note not found.' });
  if (note.pdf_path) {
    const p = path.join(UPLOAD_ROOT, note.pdf_path);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('UPDATE notes SET pdf_path = NULL, pdf_original_name = NULL WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// ---- Video upload OR YouTube link for a video lecture ----
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, VIDEO_DIR),
  filename: (req, file, cb) => cb(null, `${req.params.id}${path.extname(file.originalname) || '.mp4'}`)
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('video/')) return cb(new Error('Only video files are allowed.'));
    cb(null, true);
  }
});

router.post('/videos/:id/file', uploadVideo.single('file'), (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  if (video.video_path) {
    const oldPath = path.join(UPLOAD_ROOT, video.video_path);
    if (fs.existsSync(oldPath) && oldPath !== req.file.path) fs.unlinkSync(oldPath);
  }
  const relPath = path.relative(UPLOAD_ROOT, req.file.path);
  // uploading a real file supersedes any YouTube link
  db.prepare('UPDATE videos SET video_path = ?, youtube_url = NULL WHERE id = ?').run(relPath, req.params.id);
  res.json({ ok: true, video_path: relPath });
});

router.put('/videos/:id/youtube', express.json(), (req, res) => {
  const { youtube_url } = req.body;
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  if (!youtube_url || !/^https:\/\/(www\.)?(youtube\.com|youtu\.be)\//.test(youtube_url)) {
    return res.status(400).json({ error: 'Please provide a valid YouTube URL.' });
  }
  // a YouTube link supersedes any uploaded file
  if (video.video_path) {
    const p = path.join(UPLOAD_ROOT, video.video_path);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('UPDATE videos SET youtube_url = ?, video_path = NULL WHERE id = ?').run(youtube_url, req.params.id);
  res.json({ ok: true });
});

router.delete('/videos/:id/media', (req, res) => {
  const video = db.prepare('SELECT * FROM videos WHERE id = ?').get(req.params.id);
  if (!video) return res.status(404).json({ error: 'Video not found.' });
  if (video.video_path) {
    const p = path.join(UPLOAD_ROOT, video.video_path);
    if (fs.existsSync(p)) fs.unlinkSync(p);
  }
  db.prepare('UPDATE videos SET video_path = NULL, youtube_url = NULL WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

// multer errors (file too large, wrong type) land here
router.use((err, req, res, next) => {
  if (err) return res.status(400).json({ error: err.message || 'Upload failed.' });
  next();
});

module.exports = router;
