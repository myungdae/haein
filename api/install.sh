#!/bin/bash
# =============================================
# 강해인 怡娜 API 서버 설치 스크립트
# 실행: bash install.sh
# =============================================
set -e

API_DIR="/home/ubuntu/haein/api"
cd "$API_DIR"

if [ ! -f .env ]; then
  cp .env.example .env
  echo "[중단] api/.env를 생성했습니다. 실제 DB/관리자 비밀번호를 입력한 뒤 다시 실행하세요."
  exit 1
fi

set -a
. ./.env
set +a

if [ -z "$DB_PASS" ] || [ "$DB_PASS" = "CHANGE_ME_WITH_A_STRONG_DATABASE_PASSWORD" ]; then
  echo "[오류] .env의 DB_PASS를 안전한 실제 값으로 설정하세요."
  exit 1
fi
if [ -z "$ADMIN_PASSWORD" ] || [ "$ADMIN_PASSWORD" = "CHANGE_ME_WITH_A_STRONG_ADMIN_PASSWORD" ]; then
  echo "[오류] .env의 ADMIN_PASSWORD를 안전한 실제 값으로 설정하세요."
  exit 1
fi
if [ ${#ADMIN_SESSION_SECRET} -lt 32 ] || [ "$ADMIN_SESSION_SECRET" = "CHANGE_ME_WITH_AT_LEAST_32_RANDOM_CHARACTERS" ]; then
  echo "[오류] .env의 ADMIN_SESSION_SECRET을 32자 이상의 무작위 값으로 설정하세요."
  exit 1
fi

echo "======================================="
echo "  강해인 API 서버 설치 시작"
echo "======================================="

# 1. DB 생성
echo ""
echo "[1/5] PostgreSQL DB 및 사용자 생성..."
sudo -u postgres psql -v db_password="$DB_PASS" -f setup-db.sql

# 2. 테이블 생성
echo ""
echo "[2/5] 테이블 생성..."
PGPASSWORD="$DB_PASS" psql -h "${DB_HOST:-localhost}" -U "${DB_USER:-haein_user}" -d "${DB_NAME:-haein_db}" -f setup-tables.sql
PGPASSWORD="$DB_PASS" psql -h "${DB_HOST:-localhost}" -U "${DB_USER:-haein_user}" -d "${DB_NAME:-haein_db}" -f migrations/001_cms_phase1.sql

# 3. .env 확인
echo ""
echo "[3/5] .env 설정 확인 완료"

# 4. npm 패키지 설치
echo ""
echo "[4/5] Node.js 패키지 설치..."
npm install --production

# 5. PM2로 서버 시작
echo ""
echo "[5/5] PM2로 API 서버 시작..."
mkdir -p logs
npm install -g pm2 2>/dev/null || true
pm2 delete haein-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup 2>/dev/null || true

echo ""
echo "======================================="
echo "  설치 완료!"
echo "======================================="
echo ""
echo "▶ 상태 확인: pm2 status"
echo "▶ 로그 확인: pm2 logs haein-api"
echo "▶ 헬스체크:  curl http://localhost:3000/api/health"
echo ""

# 헬스체크
sleep 2
echo "헬스체크 결과:"
curl -s http://localhost:3000/api/health || echo "  → 서버 응답 없음 (로그 확인 필요)"
echo ""
