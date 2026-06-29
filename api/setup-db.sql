-- =============================================
-- 강해인 怡娜 웹사이트 - PostgreSQL 초기 설정
-- 실행: sudo -u postgres psql -f setup-db.sql
-- =============================================

-- 1. 사용자 생성
CREATE USER haein_user WITH PASSWORD 'haein2024!secure';

-- 2. 데이터베이스 생성
CREATE DATABASE haein_db OWNER haein_user ENCODING 'UTF8';

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE haein_db TO haein_user;
