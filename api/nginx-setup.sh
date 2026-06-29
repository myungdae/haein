#!/bin/bash
# =============================================
# Nginx /api/ 프록시 설정 적용 스크립트
# 실행: bash nginx-setup.sh
# =============================================
set -e

echo "[Nginx] 현재 haein.exko.kr 설정 파일 찾는 중..."

# haein.exko.kr 설정 파일 위치 찾기
NGINX_CONF=$(sudo nginx -T 2>/dev/null | grep -B5 "haein.exko.kr" | grep "# configuration file" | head -1 | awk '{print $NF}' | tr -d ':')

if [ -z "$NGINX_CONF" ]; then
  # 일반적인 위치 탐색
  for f in /etc/nginx/sites-enabled/* /etc/nginx/conf.d/*.conf; do
    if sudo grep -q "haein.exko.kr" "$f" 2>/dev/null; then
      NGINX_CONF="$f"
      break
    fi
  done
fi

if [ -z "$NGINX_CONF" ]; then
  echo "[오류] haein.exko.kr Nginx 설정 파일을 찾을 수 없습니다."
  echo "  수동으로 nginx-api.conf 내용을 server 블록 안에 추가해 주세요."
  exit 1
fi

echo "[Nginx] 설정 파일: $NGINX_CONF"

# 이미 /api/ 프록시가 있는지 확인
if sudo grep -q "proxy_pass.*3000" "$NGINX_CONF"; then
  echo "[Nginx] /api/ 프록시 설정이 이미 존재합니다."
else
  echo "[Nginx] /api/ 프록시 추가 중..."
  # server 블록 닫는 } 바로 앞에 삽입
  sudo sed -i '/^}/i\
\
    location /api/ {\
        proxy_pass         http://127.0.0.1:3000;\
        proxy_http_version 1.1;\
        proxy_set_header   Host              $host;\
        proxy_set_header   X-Real-IP         $remote_addr;\
        proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;\
        proxy_set_header   X-Forwarded-Proto $scheme;\
        proxy_read_timeout 10s;\
    }\
' "$NGINX_CONF"
  echo "[Nginx] 설정 추가 완료"
fi

# 문법 검사 및 재로드
echo "[Nginx] 문법 검사..."
sudo nginx -t

echo "[Nginx] 설정 재로드..."
sudo systemctl reload nginx

echo ""
echo "[완료] Nginx /api/ 프록시 설정 적용 완료!"
echo "▶ 테스트: curl https://haein.exko.kr/api/health"
