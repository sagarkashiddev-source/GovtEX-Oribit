const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'govtex.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT,
  dob TEXT,
  gender TEXT,
  category TEXT DEFAULT 'General',
  state TEXT,
  onboarding_step TEXT DEFAULT 'basic',
  avatar_color TEXT DEFAULT '#1E3A8A',
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS education_details (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  highest_qualification TEXT,
  stream TEXT,
  board_university TEXT,
  year_of_passing INTEGER,
  percentage REAL,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS physical_profile (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  height_cm REAL,
  weight_kg REAL,
  chest_cm REAL,
  vision TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS preferences (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  preferred_categories TEXT DEFAULT '[]',
  preferred_states TEXT DEFAULT '[]',
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS exams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  short_name TEXT,
  category TEXT,
  conducting_body TEXT,
  description TEXT,
  min_age INTEGER,
  max_age INTEGER,
  age_relaxation TEXT DEFAULT '{}',
  min_qualification TEXT,
  min_percentage REAL DEFAULT 0,
  requires_physical INTEGER DEFAULT 0,
  physical_standards TEXT DEFAULT '{}',
  application_start TEXT,
  application_end TEXT,
  exam_date TEXT,
  fee_general INTEGER,
  fee_reserved INTEGER,
  vacancies INTEGER,
  accent_color TEXT DEFAULT '#1E3A8A',
  official_link TEXT
);

CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  exam_id TEXT REFERENCES exams(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  applied_at TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, exam_id)
);

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT,
  icon TEXT,
  category TEXT,
  color TEXT DEFAULT '#4059AA'
);

CREATE TABLE IF NOT EXISTS notes (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT,
  description TEXT,
  content TEXT,
  pages INTEGER,
  downloads INTEGER DEFAULT 0,
  pdf_path TEXT,
  pdf_original_name TEXT,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS videos (
  id TEXT PRIMARY KEY,
  subject_id TEXT REFERENCES subjects(id) ON DELETE CASCADE,
  title TEXT,
  instructor TEXT,
  duration_min INTEGER,
  views INTEGER DEFAULT 0,
  thumbnail_color TEXT DEFAULT '#1E3A8A',
  description TEXT,
  video_path TEXT,
  youtube_url TEXT
);

CREATE TABLE IF NOT EXISTS saved_items (
  id TEXT PRIMARY KEY,
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  item_type TEXT,
  item_id TEXT,
  saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, item_type, item_id)
);
`);

// --- Lightweight migrations for columns added after initial release ---
// SQLite has no "ADD COLUMN IF NOT EXISTS", so check pragma table_info first.
function ensureColumn(table, column, definition) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
  if (!cols.includes(column)) {
    db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}
ensureColumn('notes', 'pdf_path', 'TEXT');
ensureColumn('notes', 'pdf_original_name', 'TEXT');
ensureColumn('videos', 'video_path', 'TEXT');
ensureColumn('videos', 'youtube_url', 'TEXT');

module.exports = db;
