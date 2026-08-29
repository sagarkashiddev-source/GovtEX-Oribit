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
ensureColumn('exams', 'notification_url', 'TEXT');
ensureColumn('exams', 'notification_date', 'TEXT');
ensureColumn('exams', 'correction_window', 'TEXT');
ensureColumn('exams', 'admit_card_date', 'TEXT');
ensureColumn('exams', 'result_date', 'TEXT');
ensureColumn('exams', 'age_cutoff_date', 'TEXT');
ensureColumn('exams', 'selection_stages', "TEXT DEFAULT '[]'");
ensureColumn('exams', 'data_source', "TEXT DEFAULT 'illustrative'");
ensureColumn('exams', 'verified_at', 'TEXT');

// --- Real, web-researched data for a handful of exams (as of 29 Aug 2026) ---
// Applied by short_name match so it upgrades both fresh seeds and already-deployed
// databases the same way. Everything else in the catalog remains clearly-labeled
// illustrative data until researched the same way.
const VERIFIED_EXAMS = [
  {
    short_name: 'SSC CGL',
    min_age: 18, max_age: 32, age_cutoff_date: '2026-08-01',
    min_qualification: 'Graduate', min_percentage: 0,
    notification_url: 'https://ssc.gov.in', notification_date: '2026-05-21',
    application_start: '2026-05-21', application_end: '2026-06-25',
    correction_window: '2026-07-01 to 2026-07-03',
    exam_date: '2026-09-01', admit_card_date: 'Released region-wise, ~3-7 days before Tier 1',
    result_date: null, vacancies: 12256, fee_general: 100, fee_reserved: 0,
    selection_stages: JSON.stringify(['Tier 1 (Computer Based Test)', 'Tier 2 (Computer Based Test)', 'Document Verification', 'Medical Examination (post-specific)']),
    official_link: 'https://ssc.gov.in'
  },
  {
    short_name: 'IBPS PO',
    min_age: 20, max_age: 30, age_cutoff_date: '2026-07-01',
    min_qualification: 'Graduate', min_percentage: 0,
    notification_url: 'https://ibps.in', notification_date: '2026-07-01',
    application_start: '2026-07-01', application_end: '2026-07-21',
    correction_window: null,
    exam_date: '2026-08-22', admit_card_date: 'Released via login before each stage',
    result_date: null, vacancies: 7565, fee_general: 850, fee_reserved: 175,
    selection_stages: JSON.stringify(['Prelims', 'Mains', 'Personality Test / Interview', 'Provisional Allotment']),
    official_link: 'https://ibps.in'
  },
  {
    short_name: 'CTET',
    min_age: 18, max_age: 0, age_cutoff_date: null,
    min_qualification: '12th', min_percentage: 0,
    notification_url: 'https://ctet.nic.in', notification_date: '2026-05-11',
    application_start: '2026-08-25', application_end: '2026-09-01',
    correction_window: '2026-06-15 to 2026-06-18 (earlier window)',
    exam_date: 'Postponed from 6 Sep 2026 — revised date not yet announced', admit_card_date: null,
    result_date: null, vacancies: 0, fee_general: 1000, fee_reserved: 500,
    selection_stages: JSON.stringify(['Written Exam (Paper 1 and/or Paper 2)', 'Lifetime-valid eligibility certificate on passing']),
    official_link: 'https://ctet.nic.in',
    description: 'National-level teacher eligibility test for primary (Paper 1, min. Class 12 + 2-yr Diploma in Elementary Education) and upper-primary (Paper 2, min. Graduate + B.Ed) teaching posts. Passing gives a lifetime-valid eligibility certificate, not a job directly.'
  },
  {
    short_name: 'State Police Constable',
    name: 'SSC GD Constable', short_name_new: 'SSC GD Constable',
    min_age: 18, max_age: 23, age_cutoff_date: '2026-01-01',
    min_qualification: '10th', min_percentage: 0,
    requires_physical: 1,
    physical_standards: JSON.stringify({ male: { height: 170, chest: 80 }, female: { height: 157, chest: 0 } }),
    notification_url: 'https://ssc.gov.in', notification_date: '2025-12-01',
    application_start: '2025-12-01', application_end: '2025-12-31',
    correction_window: null,
    exam_date: 'Computer Based Exam date to be announced', admit_card_date: null,
    result_date: null, vacancies: 25487, fee_general: 100, fee_reserved: 0,
    selection_stages: JSON.stringify(['Computer Based Examination', 'Physical Efficiency Test (PET)', 'Physical Standard Test (PST)', 'Medical Examination (BMI 18-25)']),
    official_link: 'https://ssc.gov.in',
    description: 'Recruitment of General Duty Constables into central armed police forces (BSF, CISF, CRPF, ITBP and others). A uniformed, field-duty role — physical and medical standards apply alongside the written exam.'
  }
];

const updateVerified = db.prepare(`
  UPDATE exams SET
    name = COALESCE(@name, name),
    short_name = COALESCE(@new_short_name, short_name),
    min_age=@min_age, max_age=@max_age, age_cutoff_date=@age_cutoff_date,
    min_qualification=@min_qualification, min_percentage=@min_percentage,
    requires_physical = COALESCE(@requires_physical, requires_physical),
    physical_standards = COALESCE(@physical_standards, physical_standards),
    notification_url=@notification_url, notification_date=@notification_date,
    application_start=@application_start, application_end=@application_end,
    correction_window=@correction_window, exam_date=@exam_date, admit_card_date=@admit_card_date,
    result_date=@result_date, vacancies=@vacancies, fee_general=@fee_general, fee_reserved=@fee_reserved,
    selection_stages=@selection_stages, official_link=@official_link,
    description = COALESCE(@description, description),
    data_source='verified', verified_at=@verified_at
  WHERE short_name = @short_name
`);
const VERIFIED_AT = '2026-08-29';
db.transaction(() => {
  VERIFIED_EXAMS.forEach(e => {
    const exists = db.prepare('SELECT id FROM exams WHERE short_name = ?').get(e.short_name);
    if (!exists) return; // catalog changed; skip silently rather than error
    updateVerified.run({
      name: e.name || null, new_short_name: e.short_name_new || null,
      requires_physical: e.requires_physical ?? null,
      physical_standards: e.physical_standards || null, description: e.description || null,
      verified_at: VERIFIED_AT,
      ...Object.fromEntries(['short_name','min_age','max_age','age_cutoff_date','min_qualification','min_percentage',
        'notification_url','notification_date','application_start','application_end','correction_window','exam_date',
        'admit_card_date','result_date','vacancies','fee_general','fee_reserved','selection_stages','official_link']
        .map(k => [k, e[k] ?? null]))
    });
  });
})();

module.exports = db;
