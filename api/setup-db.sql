-- =============================================
-- 강해인 怡娜 웹사이트 - PostgreSQL 초기 설정
-- 실행: sudo -u postgres psql -v db_password='안전한비밀번호' -f setup-db.sql
-- =============================================

-- 기존 사용자/DB가 있으면 건너뜁니다. 비밀번호는 파일에 저장하지 않습니다.
SELECT format('CREATE USER haein_user WITH PASSWORD %L', :'db_password')
WHERE NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'haein_user') \gexec

-- 2. 데이터베이스 생성
SELECT 'CREATE DATABASE haein_db OWNER haein_user ENCODING ''UTF8'''
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'haein_db') \gexec

-- 권한 부여
GRANT ALL PRIVILEGES ON DATABASE haein_db TO haein_user;
