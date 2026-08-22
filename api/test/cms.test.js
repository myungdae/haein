'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  createSessionToken,
  normalizeSectionUpdate,
  parseCookies,
  requireCmsEnv,
  sessionCookie,
  verifySessionToken,
} = require('../cms');

test('관리자 세션은 서명 검증과 만료 시간을 확인한다', () => {
  const now = Date.UTC(2026, 7, 22);
  const token = createSessionToken('haein', 'a-very-long-test-secret', now);
  assert.equal(verifySessionToken(token, 'a-very-long-test-secret', now + 1000).username, 'haein');
  assert.equal(verifySessionToken(token + 'tampered', 'a-very-long-test-secret', now), null);
  assert.equal(verifySessionToken(token, 'wrong-secret', now), null);
  assert.equal(verifySessionToken(token, 'a-very-long-test-secret', now + 9 * 60 * 60 * 1000), null);
});

test('세션 쿠키는 HttpOnly와 SameSite를 사용한다', () => {
  const cookie = sessionCookie('token', true);
  assert.match(cookie, /HttpOnly/);
  assert.match(cookie, /SameSite=Strict/);
  assert.match(cookie, /Secure/);
  assert.equal(parseCookies('one=1; haein_admin_session=abc').haein_admin_session, 'abc');
});

test('CMS 수정은 섹션별 허용 필드만 받는다', () => {
  const values = normalizeSectionUpdate('hero', { hero_tag: ' 강해인 ', unknown: 'no' });
  assert.deepEqual(values, { hero_tag: '강해인' });
  assert.equal(normalizeSectionUpdate('unknown', {}), null);
  assert.throws(() => normalizeSectionUpdate('hero', { hero_tag: 'x'.repeat(5001) }), /너무 깁니다/);
});

test('필수 secret이 없으면 서버 설정 검증이 실패한다', () => {
  assert.throws(() => requireCmsEnv({}), /DB_PASS/);
  assert.doesNotThrow(() => requireCmsEnv({ DB_PASS:'x', ADMIN_PASSWORD:'y', ADMIN_SESSION_SECRET:'z' }));
});

test('공개 4개 페이지는 CMS loader와 기존 fallback 콘텐츠를 함께 가진다', () => {
  const root = path.resolve(__dirname, '../..');
  const cases = [
    ['index.html', '시로 마음을 잇고'],
    ['pages/about.html', '강해인은 시인이자 시낭송가로'],
    ['pages/class.html', '강해인 시낭송교실은'],
    ['pages/contact.html', 'haeink72@hanmail.net'],
  ];
  for (const [filename, fallback] of cases) {
    const html = fs.readFileSync(path.join(root, filename), 'utf8');
    assert.match(html, /cms-content\.js/);
    assert.ok(html.includes(fallback), `${filename} fallback 누락`);
  }
});

