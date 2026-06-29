-- =============================================
-- 강해인 怡娜 웹사이트 - 테이블 생성
-- 실행: psql -U haein_user -d haein_db -f setup-tables.sql
-- =============================================

-- 1. 공연문의 테이블
CREATE TABLE IF NOT EXISTS contact_inquiry (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        VARCHAR(100) NOT NULL,
  tel         VARCHAR(20)  NOT NULL,
  email       VARCHAR(200),
  type        VARCHAR(50),
  org         VARCHAR(200),
  message     TEXT NOT NULL,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

-- 2. 수강신청 테이블
CREATE TABLE IF NOT EXISTS class_apply (
  id          SERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  name        VARCHAR(100) NOT NULL,
  tel         VARCHAR(20)  NOT NULL,
  email       VARCHAR(200),
  course      VARCHAR(100),
  message     TEXT,
  is_read     BOOLEAN NOT NULL DEFAULT FALSE
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_contact_created ON contact_inquiry(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_apply_created   ON class_apply(created_at DESC);

-- 확인
\dt
SELECT 'DB 설정 완료!' AS result;
