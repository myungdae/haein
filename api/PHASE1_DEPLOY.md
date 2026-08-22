# HAEIN CMS Phase 1 운영 메모

이 문서는 AWS 운영 서버에서 실행할 명령을 정리한 것입니다. 로컬 구현 단계에서는 실행하지 않습니다.

## 최초 환경 설정

```bash
cd /home/ubuntu/haein/api
cp .env.example .env
nano .env
```

`.env`에서 `DB_PASS`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`을 실제 값으로 바꿉니다. 세션 비밀값은 다음처럼 만들 수 있습니다.

```bash
openssl rand -base64 48
```

`ADMIN_TOKEN`은 구형 갤러리 토큰 방식을 병행할 때만 설정합니다. 새 `/admin/`은 로그인 쿠키를 사용합니다.

## DB migration

```bash
cd /home/ubuntu/haein/api
set -a
. ./.env
set +a
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -f migrations/001_cms_phase1.sql
```

마이그레이션은 기존 테이블을 변경하거나 삭제하지 않습니다. 이미 존재하는 CMS 값도 덮어쓰지 않습니다.

## 애플리케이션 배포

```bash
cd /home/ubuntu/haein
git fetch origin
git switch feature/haein-cms-phase1
git pull --ff-only origin feature/haein-cms-phase1
cd api
npm ci --omit=dev
npm test
pm2 restart haein-api --update-env
pm2 status
curl -fsS http://127.0.0.1:3000/api/health
```

정적 사이트 배포 방식에 맞춰 루트의 `index.html`, `pages/`, `admin/`, `js/`, `css/`, `images/`도 현재 Nginx document root에 반영해야 합니다.

## 확인 URL

- 관리자: `https://haein.exko.kr/admin/`
- 공개 CMS API: `https://haein.exko.kr/api/cms/content`
- 갤러리 관리: `https://haein.exko.kr/admin/gallery-upload.html`

## Rollback

코드는 직전 운영 커밋으로 되돌린 뒤 API를 재시작합니다.

```bash
cd /home/ubuntu/haein
git switch main
git pull --ff-only origin main
cd api
npm ci --omit=dev
pm2 restart haein-api --update-env
```

공개 페이지에는 기존 HTML fallback이 있으므로 CMS API를 중단해도 기존 콘텐츠가 표시됩니다. `site_content` 테이블은 기존 테이블과 독립적이므로 코드 롤백 시 남겨 두는 것을 권장합니다. 꼭 제거해야 한다면 먼저 백업합니다.

```bash
PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -t site_content > site_content_backup.sql
```
