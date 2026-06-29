#!/bin/bash
# =============================================
# 강해인 怡娜 API 서버 설치 스크립트
# 실행: bash install.sh
# =============================================
set -e

API_DIR="/home/ubuntu/haein/api"
cd "$API_DIR"

echo "======================================="
echo "  강해인 API 서버 설치 시작"
echo "======================================="

# 1. DB 생성
echo ""
echo "[1/5] PostgreSQL DB 및 사용자 생성..."
sudo -u postgres psql -c "CREATE USER haein_user WITH PASSWORD 'haein2024!secure';" 2>/dev/null || echo "  → 사용자 이미 존재 (건너뜀)"
sudo -u postgres psql -c "CREATE DATABASE haein_db OWNER haein_user ENCODING 'UTF8';" 2>/dev/null || echo "  → DB 이미 존재 (건너뜀)"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE haein_db TO haein_user;" 2>/dev/null

# 2. 테이블 생성
echo ""
echo "[2/5] 테이블 생성..."
PGPASSWORD='haein2024!secure' psql -h localhost -U haein_user -d haein_db -f setup-tables.sql

# 3. .env 파일 생성
echo ""
echo "[3/5] .env 설정 파일 생성..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "  → .env 생성 완료"
else
  echo "  → .env 이미 존재 (건너뜀)"
fi

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
