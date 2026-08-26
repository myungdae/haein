'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { JSDOM } = require('jsdom');

const root = path.resolve(__dirname, '../..');

function response(status, body) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() { return body; }
  };
}

async function eventually(assertion, timeoutMs = 1000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try { assertion(); return; } catch { await new Promise(resolve => setTimeout(resolve, 10)); }
  }
  assertion();
}

test('로그인 성공 후 실제 DOM에서 로그인 패널은 숨고 7개 대시보드 메뉴가 보인다', async () => {
  const html = fs.readFileSync(path.join(root, 'admin/index.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'admin/style.css'), 'utf8');
  const loginHandler = fs.readFileSync(path.join(root, 'admin/login-handler.js'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'admin/app.js'), 'utf8');
  const dom = new JSDOM(html, { url:'https://kanghaein.com/admin/', runScripts:'outside-only', pretendToBeVisual:true });
  const { window } = dom;
  const { document } = window;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);
  window.scrollTo = () => {};

  let sessionResolved;
  let contentRequests = 0;
  const pendingSession = new Promise(resolve => { sessionResolved = resolve; });
  window.fetch = async (url) => {
    if (url === '/api/admin/session') {
      await pendingSession;
      return response(401, { ok:false });
    }
    if (url === '/api/admin/login') return response(200, { ok:true, username:'haein' });
    if (url.startsWith('/api/admin/content')) {
      contentRequests += 1;
      if (contentRequests === 1) return response(304, {});
      return response(200, { ok:true, sections:{ profile:{}, hero:{}, class:{}, contact:{} } });
    }
    throw new Error(`예상하지 못한 요청: ${url}`);
  };

  window.eval(loginHandler);
  window.eval(app);

  // CSS가 hidden을 존중하므로 초기 세션 확인 중에는 로그인 폼을 조작할 수 없습니다.
  assert.equal(window.getComputedStyle(document.getElementById('loginView')).display, 'none');
  sessionResolved();
  await eventually(() => assert.equal(document.getElementById('loginView').hidden, false));

  document.querySelector('[name="username"]').value = 'haein';
  document.querySelector('[name="password"]').value = 'secret';
  document.getElementById('loginForm').dispatchEvent(new window.Event('submit', { bubbles:true, cancelable:true }));

  const loginView = document.getElementById('loginView');
  const cmsView = document.getElementById('cmsView');
  await eventually(() => {
    assert.equal(loginView.hidden, true);
    assert.equal(cmsView.hidden, false);
    assert.equal(window.getComputedStyle(loginView).display, 'none');
    assert.notEqual(window.getComputedStyle(cmsView).display, 'none');
  });

  const expected = ['내 소개', '메인 화면', '시낭송교실', '연락처', '갤러리', '창작시', '효 콘서트'];
  const cards = [...document.querySelectorAll('#menuView .menu-card')];
  assert.deepEqual(cards.map(card => card.querySelector('strong').textContent), expected);
  for (const card of cards) {
    assert.equal(card.hidden, false);
    assert.notEqual(window.getComputedStyle(card).display, 'none');
  }

  assert.equal(document.querySelector('[name="username"]').value, '');
  assert.equal(document.querySelector('[name="password"]').value, '');
  assert.equal(contentRequests, 2, '304 응답 후 콘텐츠를 한 번 새로 조회해야 합니다.');
  dom.window.close();
});
