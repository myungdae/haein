-- Haein Class PWA — initial schema
-- site_content: flexible key/value store for editable text blocks (hero, intro, stats, info-table, teacher bio, footer contact)
CREATE TABLE IF NOT EXISTS site_content (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- cohorts: 기수 (class terms/sessions) — Kang Haein edits these each time she opens a new cohort
CREATE TABLE IF NOT EXISTS cohorts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  term_label TEXT NOT NULL,          -- e.g. "7기 (2025 가을)"
  start_date TEXT,                   -- e.g. "2025.09.02"
  end_date TEXT,                     -- e.g. "2025.11.20"
  schedule_text TEXT,                -- e.g. "화·목 오후 2시"
  status TEXT NOT NULL DEFAULT '모집예정', -- 모집예정 | 모집중 | 마감 | 수료완료
  capacity INTEGER DEFAULT 8,
  is_current INTEGER NOT NULL DEFAULT 0, -- 1 = currently accepting applications, shown in apply form
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- curriculum: 커리큘럼 항목 (6 stages by default, editable)
CREATE TABLE IF NOT EXISTS curriculum (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  week_range TEXT NOT NULL,          -- e.g. "1-2주차"
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- applications: 수강 신청 접수
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  name TEXT NOT NULL,
  tel TEXT NOT NULL,
  email TEXT,
  term TEXT,
  experience TEXT,
  message TEXT,
  is_read INTEGER NOT NULL DEFAULT 0
);

-- admin_users: simple single-admin credential store (password is salted-hash, set via seed/secret)
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_cohorts_sort ON cohorts(sort_order);
CREATE INDEX IF NOT EXISTS idx_curriculum_sort ON curriculum(sort_order);
CREATE INDEX IF NOT EXISTS idx_applications_created ON applications(created_at);
