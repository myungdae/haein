'use strict';

require('dotenv').config();
const express   = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');
const multer    = require('multer');
const sharp     = require('sharp');
const path      = require('path');
const fs        = require('fs');
const {
  COOKIE_NAME,
  clearSessionCookie,
  createSessionToken,
  normalizeSectionUpdate,
  parseCookies,
  requireCmsEnv,
  safeEqual,
  sessionCookie,
  verifySessionToken,
} = require('./cms');

requireCmsEnv();

// 업로드 저장 디렉토리 (서버 절대경로로 수정 필요 — .env의 UPLOAD_DIR 참조)
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../images/gallery');
const CMS_UPLOAD_DIR = process.env.CMS_UPLOAD_DIR || path.join(path.dirname(UPLOAD_DIR), 'cms');

const app  = express();
const PORT = process.env.API_PORT || 3000;

// Nginx 리버스 프록시 신뢰 설정 (X-Forwarded-For 에러 해결)
app.set('trust proxy', 1);

// =============================================
// DB 연결
// =============================================
const pool = global.__HAEIN_TEST_POOL || new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'haein_db',
  user:     process.env.DB_USER || 'haein_user',
  password: process.env.DB_PASS,
});

pool.connect((err) => {
  if (err) {
    console.error('[DB] 연결 실패:', err.message);
  } else {
    console.log('[DB] PostgreSQL 연결 성공');
  }
});

// 서버 시작 시 gallery_images 테이블 자동 생성
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gallery_images (
        id          SERIAL PRIMARY KEY,
        created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
        filename    VARCHAR(200) NOT NULL UNIQUE,
        category    VARCHAR(50)  NOT NULL DEFAULT 'etc',
        title       VARCHAR(200),
        caption     VARCHAR(500),
        tags        VARCHAR(300),
        sort_order  INTEGER      NOT NULL DEFAULT 0,
        file_size   INTEGER,
        is_visible  BOOLEAN      NOT NULL DEFAULT TRUE
      )
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_gallery_cat
        ON gallery_images(category, sort_order, created_at DESC)
    `);
    console.log('[DB] gallery_images 테이블 준비 완료');
  } catch (err) {
    console.error('[DB] 테이블 생성 오류:', err.message);
  }
})();

// =============================================
// 미들웨어
// =============================================
app.use(express.json());

// CORS - haein.exko.kr 에서만 허용
app.use(cors({
  origin: [
    'https://haein.exko.kr',
    'http://localhost',
    'http://127.0.0.1'
  ],
  methods: ['POST', 'GET', 'PUT', 'DELETE'],
  credentials: true,
}));

// Rate Limit - 일반 API (10분에 10회)
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { ok: false, message: '잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/contact', limiter);
app.use('/api/apply', limiter);

// Rate Limit - 업로드 (10분에 60회)
const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 60,
  message: { ok: false, message: '업로드 횟수 초과. 잠시 후 다시 시도해 주세요.' },
});
app.use('/api/gallery', uploadLimiter);

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { ok: false, message: '로그인 시도가 너무 많습니다. 잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// =============================================
// 관리자 인증 미들웨어
// =============================================
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'haein';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const ADMIN_SESSION_SECRET = process.env.ADMIN_SESSION_SECRET;

function requestIsSecure(req) {
  return req.secure || req.get('x-forwarded-proto') === 'https';
}

function getAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return verifySessionToken(cookies[COOKIE_NAME], ADMIN_SESSION_SECRET);
}

function adminAuth(req, res, next) {
  const token = req.headers['x-admin-token'] || req.query.token;
  const legacyTokenIsValid = ADMIN_TOKEN && safeEqual(token, ADMIN_TOKEN);
  if (!getAdminSession(req) && !legacyTokenIsValid) {
    return res.status(401).json({ ok: false, message: '인증이 필요합니다.' });
  }
  next();
}

// =============================================
// Multer 설정 (메모리 저장 → sharp 처리 후 저장)
// =============================================
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('JPG, PNG, WEBP, GIF 파일만 업로드 가능합니다.'));
  },
});

// =============================================
// 유틸
// =============================================
function sanitize(str, maxLen = 500) {
  if (!str) return '';
  return String(str).trim().slice(0, maxLen);
}

// =============================================
// GET /api/health  — 서버 상태 확인
// =============================================
app.get('/api/health', (req, res) => {
  res.json({ ok: true, message: '강해인 API 서버 정상 동작 중' });
});

// =============================================
// CMS 공개 콘텐츠
// =============================================
app.get('/api/cms/content', async (req, res) => {
  try {
    const result = await pool.query('SELECT key, value, updated_at FROM site_content ORDER BY section, key');
    const content = {};
    let updatedAt = null;
    for (const row of result.rows) {
      content[row.key] = row.value;
      if (!updatedAt || row.updated_at > updatedAt) updatedAt = row.updated_at;
    }
    // 관리자가 공개한 내용이 새로고침 즉시 반영되도록 재검증합니다.
    res.set('Cache-Control', 'no-cache');
    res.json({ ok: true, content, updated_at: updatedAt });
  } catch (err) {
    console.error('[CMS 콘텐츠 조회 오류]', err.message);
    res.status(503).json({ ok: false, message: '현재 기본 홈페이지 내용을 표시합니다.' });
  }
});

// =============================================
// CMS 관리자 로그인 / 세션
// =============================================
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');
  if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ ok: false, message: '아이디 또는 비밀번호를 확인해 주세요.' });
  }
  const token = createSessionToken(username, ADMIN_SESSION_SECRET);
  res.setHeader('Set-Cookie', sessionCookie(token, requestIsSecure(req)));
  res.json({ ok: true, username });
});

app.get('/api/admin/session', (req, res) => {
  const session = getAdminSession(req);
  if (!session) return res.status(401).json({ ok: false });
  res.json({ ok: true, username: session.username });
});

app.post('/api/admin/logout', (req, res) => {
  res.setHeader('Set-Cookie', clearSessionCookie(requestIsSecure(req)));
  res.json({ ok: true });
});

app.get('/api/admin/content', adminAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT key, section, label, value, updated_at FROM site_content ORDER BY section, key');
    const sections = {};
    for (const row of result.rows) {
      if (!sections[row.section]) sections[row.section] = {};
      sections[row.section][row.key] = row.value;
    }
    res.json({ ok: true, sections });
  } catch (err) {
    console.error('[CMS 관리자 조회 오류]', err.message);
    res.status(500).json({ ok: false, message: '콘텐츠를 불러오지 못했습니다.' });
  }
});

app.put('/api/admin/content/:section', adminAuth, async (req, res) => {
  let values;
  try {
    values = normalizeSectionUpdate(req.params.section, req.body?.values);
  } catch (err) {
    return res.status(400).json({ ok: false, message: err.message });
  }
  if (!values || !Object.keys(values).length) {
    return res.status(400).json({ ok: false, message: '저장할 내용을 확인해 주세요.' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    for (const [key, value] of Object.entries(values)) {
      await client.query(
        `UPDATE site_content SET value=$1, updated_at=NOW()
           WHERE key=$2 AND section=$3`,
        [value, key, req.params.section]
      );
    }
    await client.query('COMMIT');
    res.json({ ok: true, message: '저장하고 공개했습니다.', values });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[CMS 저장 오류]', err.message);
    res.status(500).json({ ok: false, message: '저장하지 못했습니다.' });
  } finally {
    client.release();
  }
});

app.post('/api/admin/profile-image', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, message: '사진을 선택해 주세요.' });
  const targetDir = CMS_UPLOAD_DIR;
  const filename = `profile-${Date.now()}.jpg`;
  const savePath = path.join(targetDir, filename);
  try {
    fs.mkdirSync(targetDir, { recursive: true });
    await sharp(req.file.buffer)
      .rotate()
      .resize({ width: 1600, height: 2000, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 88, progressive: true })
      .toFile(savePath);
    const url = `/images/cms/${filename}`;
    res.json({ ok: true, url, message: '사진을 올렸습니다. 미리보기 후 저장 및 공개를 눌러 주세요.' });
  } catch (err) {
    if (fs.existsSync(savePath)) fs.unlinkSync(savePath);
    console.error('[프로필 사진 오류]', err.message);
    res.status(500).json({ ok: false, message: '사진을 저장하지 못했습니다.' });
  }
});

// =============================================
// POST /api/gallery/sync  — 폴더 스캔 → DB 자동 등록 (관리자)
// =============================================
app.post('/api/gallery/sync', adminAuth, async (req, res) => {
  try {
    // 1. 폴더에 있는 이미지 파일 목록
    if (!fs.existsSync(UPLOAD_DIR)) {
      return res.json({ ok: true, added: 0, message: '폴더가 없습니다.' });
    }
    const exts    = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
    const files   = fs.readdirSync(UPLOAD_DIR)
      .filter(f => exts.includes(path.extname(f).toLowerCase()));

    // 2. DB에 이미 있는 파일명 목록
    const existing = await pool.query('SELECT filename FROM gallery_images');
    const existSet = new Set(existing.rows.map(r => r.filename));

    // 3. DB에 없는 파일만 등록
    let added = 0;
    for (const filename of files) {
      if (existSet.has(filename)) continue;

      // 파일명에서 카테고리 유추
      // perf- → performance, event- → event, daily- → rehearsal
      let category = 'etc';
      if (/^perf-/i.test(filename))       category = 'performance';
      else if (/^event-/i.test(filename)) category = 'event';
      else if (/^daily-/i.test(filename)) category = 'rehearsal';
      else if (/^performance/i.test(filename)) category = 'performance';
      else if (/^rehearsal/i.test(filename))   category = 'rehearsal';

      // 파일 크기
      const filePath = path.join(UPLOAD_DIR, filename);
      const fileSize = fs.statSync(filePath).size;

      await pool.query(
        `INSERT INTO gallery_images (filename, category, title, caption, tags, file_size)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (filename) DO NOTHING`,
        [filename, category, '', '', '', fileSize]
      );
      added++;
    }

    console.log(`[갤러리싱크] 총 ${files.length}개 파일 / ${added}개 신규 등록`);
    res.json({
      ok: true,
      total_files: files.length,
      added,
      message: `${files.length}개 파일 중 ${added}개 신규 등록 완료`,
    });

  } catch (err) {
    console.error('[갤러리싱크 오류]', err.message);
    res.status(500).json({ ok: false, message: err.message });
  }
});

// =============================================
// POST /api/gallery/upload  — 이미지 업로드 (관리자)
// =============================================
app.post('/api/gallery/upload', adminAuth, upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ ok: false, message: '이미지 파일이 없습니다.' });
  }

  try {
    // 파일명 생성: 카테고리-타임스탬프.jpg
    const cat      = sanitize(req.body.category || 'etc', 20).replace(/[^a-z0-9]/gi, '-');
    const title    = sanitize(req.body.title || '', 100);
    const caption  = sanitize(req.body.caption || '', 200);
    const tags     = sanitize(req.body.tags || '', 200);
    const ts       = Date.now();
    const filename = `${cat}-${ts}.jpg`;
    const savePath = path.join(UPLOAD_DIR, filename);

    // 업로드 디렉토리 없으면 생성
    if (!fs.existsSync(UPLOAD_DIR)) {
      fs.mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    // sharp로 리사이즈 + 최적화 (최대 1600px, WebP 품질 85)
    await sharp(req.file.buffer)
      .rotate()                          // EXIF 방향 자동 보정
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 85, progressive: true })
      .toFile(savePath);

    // DB에 메타 저장
    const result = await pool.query(
      `INSERT INTO gallery_images (filename, category, title, caption, tags, file_size)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, filename, category, title, caption, tags, created_at`,
      [filename, cat, title, caption, tags,
       fs.statSync(savePath).size]
    );

    const row = result.rows[0];
    console.log(`[갤러리업로드] ${filename} | ${cat} | ${title}`);

    res.json({
      ok: true,
      message: '업로드 완료',
      image: {
        id:       row.id,
        filename: row.filename,
        url:      `/images/gallery/${row.filename}`,
        category: row.category,
        title:    row.title,
        caption:  row.caption,
        tags:     row.tags,
        created_at: row.created_at,
      }
    });

  } catch (err) {
    console.error('[갤러리업로드 오류]', err.message);
    res.status(500).json({ ok: false, message: err.message || '서버 오류' });
  }
});

// =============================================
// GET /api/gallery  — 이미지 목록 조회
// =============================================
app.get('/api/gallery', async (req, res) => {
  const cat    = req.query.category || '';
  const limit  = Math.min(parseInt(req.query.limit) || 100, 200);
  const offset = parseInt(req.query.offset) || 0;

  try {
    let query, params;
    if (cat && cat !== 'all') {
      query  = `SELECT * FROM gallery_images WHERE category=$1 ORDER BY sort_order ASC, created_at DESC LIMIT $2 OFFSET $3`;
      params = [cat, limit, offset];
    } else {
      query  = `SELECT * FROM gallery_images ORDER BY sort_order ASC, created_at DESC LIMIT $1 OFFSET $2`;
      params = [limit, offset];
    }

    const result = await pool.query(query, params);
    const countQ = cat && cat !== 'all'
      ? await pool.query(`SELECT COUNT(*) FROM gallery_images WHERE category=$1`, [cat])
      : await pool.query(`SELECT COUNT(*) FROM gallery_images`);

    res.json({
      ok: true,
      total: parseInt(countQ.rows[0].count),
      images: result.rows.map(r => ({
        id:         r.id,
        filename:   r.filename,
        url:        `/images/gallery/${r.filename}`,
        category:   r.category,
        title:      r.title,
        caption:    r.caption,
        tags:       r.tags,
        sort_order: r.sort_order,
        created_at: r.created_at,
      }))
    });

  } catch (err) {
    console.error('[갤러리조회 오류]', err.message);
    res.status(500).json({ ok: false, message: '서버 오류' });
  }
});

// =============================================
// PUT /api/gallery/:id  — 메타 수정 (관리자)
// =============================================
app.put('/api/gallery/:id', adminAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ ok: false, message: '잘못된 ID' });

  const category   = sanitize(req.body.category  || '', 50);
  const title      = sanitize(req.body.title      || '', 200);
  const caption    = sanitize(req.body.caption    || '', 500);
  const tags       = sanitize(req.body.tags       || '', 300);
  const sort_order = parseInt(req.body.sort_order) || 0;

  try {
    const result = await pool.query(
      `UPDATE gallery_images
          SET category=$1, title=$2, caption=$3, tags=$4, sort_order=$5
        WHERE id=$6
        RETURNING id, filename, category, title, caption, tags, sort_order, created_at`,
      [category, title, caption, tags, sort_order, id]
    );

    if (!result.rows.length) {
      return res.status(404).json({ ok: false, message: '이미지를 찾을 수 없습니다.' });
    }

    const row = result.rows[0];
    console.log(`[갤러리수정] id=${id} | ${category} | ${title}`);
    res.json({
      ok: true,
      message: '수정 완료',
      image: {
        id:         row.id,
        filename:   row.filename,
        url:        `/images/gallery/${row.filename}`,
        category:   row.category,
        title:      row.title,
        caption:    row.caption,
        tags:       row.tags,
        sort_order: row.sort_order,
        created_at: row.created_at,
      }
    });

  } catch (err) {
    console.error('[갤러리수정 오류]', err.message);
    res.status(500).json({ ok: false, message: '서버 오류' });
  }
});

// =============================================
// DELETE /api/gallery/:id  — 이미지 삭제 (관리자)
// =============================================
app.delete('/api/gallery/:id', adminAuth, async (req, res) => {
  const id = parseInt(req.params.id);
  if (!id) return res.status(400).json({ ok: false, message: '잘못된 ID' });

  try {
    const result = await pool.query(`SELECT filename FROM gallery_images WHERE id=$1`, [id]);
    if (!result.rows.length) return res.status(404).json({ ok: false, message: '이미지 없음' });

    const filename = result.rows[0].filename;
    const filePath = path.join(UPLOAD_DIR, filename);

    // DB에서 삭제
    await pool.query(`DELETE FROM gallery_images WHERE id=$1`, [id]);

    // 파일 삭제
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

    console.log(`[갤러리삭제] id=${id} | ${filename}`);
    res.json({ ok: true, message: '삭제 완료' });

  } catch (err) {
    console.error('[갤러리삭제 오류]', err.message);
    res.status(500).json({ ok: false, message: '서버 오류' });
  }
});

// =============================================
// POST /api/contact  — 공연문의 접수
// =============================================
app.post('/api/contact', async (req, res) => {
  const { name, tel, email, type, org, message } = req.body;

  // 필수값 검증
  if (!name || !tel || !message) {
    return res.status(400).json({ ok: false, message: '이름, 연락처, 문의내용은 필수입니다.' });
  }

  try {
    await pool.query(
      `INSERT INTO contact_inquiry (name, tel, email, type, org, message)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        sanitize(name, 100),
        sanitize(tel, 20),
        sanitize(email, 200),
        sanitize(type, 50),
        sanitize(org, 200),
        sanitize(message, 2000),
      ]
    );

    console.log(`[문의접수] ${new Date().toISOString()} | ${sanitize(name)} | ${sanitize(tel)}`);
    res.json({ ok: true, message: '문의가 접수되었습니다.' });

  } catch (err) {
    console.error('[문의접수 오류]', err.message);
    res.status(500).json({ ok: false, message: '서버 오류가 발생했습니다.' });
  }
});

// =============================================
// POST /api/apply  — 수강신청 접수
// =============================================
app.post('/api/apply', async (req, res) => {
  const { name, tel, email, course, message } = req.body;

  if (!name || !tel) {
    return res.status(400).json({ ok: false, message: '이름과 연락처는 필수입니다.' });
  }

  try {
    await pool.query(
      `INSERT INTO class_apply (name, tel, email, course, message)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        sanitize(name, 100),
        sanitize(tel, 20),
        sanitize(email, 200),
        sanitize(course, 100),
        sanitize(message, 2000),
      ]
    );

    console.log(`[수강신청] ${new Date().toISOString()} | ${sanitize(name)} | ${sanitize(tel)}`);
    res.json({ ok: true, message: '수강 신청이 완료되었습니다.' });

  } catch (err) {
    console.error('[수강신청 오류]', err.message);
    res.status(500).json({ ok: false, message: '서버 오류가 발생했습니다.' });
  }
});

// =============================================
// 서버 시작
// =============================================
if (process.env.SERVE_STATIC === 'true') {
  app.use(express.static(path.join(__dirname, '..'), { extensions: ['html'] }));
}

if (require.main === module) {
  app.listen(PORT, '127.0.0.1', () => {
    console.log(`[서버] http://127.0.0.1:${PORT} 에서 실행 중`);
  });
}

module.exports = { app, pool };
