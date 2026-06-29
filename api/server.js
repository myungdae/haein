'use strict';

require('dotenv').config();
const express   = require('express');
const { Pool }  = require('pg');
const cors      = require('cors');
const rateLimit = require('express-rate-limit');

const app  = express();
const PORT = process.env.API_PORT || 3000;

// =============================================
// DB 연결
// =============================================
const pool = new Pool({
  host:     process.env.DB_HOST || 'localhost',
  port:     parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'haein_db',
  user:     process.env.DB_USER || 'haein_user',
  password: process.env.DB_PASS || 'haein2024!secure',
});

pool.connect((err) => {
  if (err) {
    console.error('[DB] 연결 실패:', err.message);
  } else {
    console.log('[DB] PostgreSQL 연결 성공');
  }
});

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
  methods: ['POST', 'GET'],
}));

// Rate Limit - 같은 IP에서 10분에 10회 제한
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { ok: false, message: '잠시 후 다시 시도해 주세요.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

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
app.listen(PORT, '127.0.0.1', () => {
  console.log(`[서버] http://127.0.0.1:${PORT} 에서 실행 중`);
});
