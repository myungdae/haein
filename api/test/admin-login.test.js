'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function loadLoginHandler(FormDataClass) {
  const filename = path.resolve(__dirname, '../../admin/login-handler.js');
  const source = fs.readFileSync(filename, 'utf8');
  const sandbox = { module:{ exports:{} }, exports:{}, globalThis:{}, FormData:FormDataClass };
  vm.runInNewContext(source, sandbox, { filename });
  return sandbox.module.exports;
}

test('로그인 await 이후 currentTarget이 null이어도 보존한 폼을 reset한다', async () => {
  class FakeFormData {
    constructor(form) { this.form = form; }
    *[Symbol.iterator]() { yield ['username', this.form.username]; yield ['password', this.form.password]; }
  }
  const createAdminLoginHandler = loadLoginHandler(FakeFormData);

  let resetCount = 0;
  let dashboardShown = false;
  let contentLoaded = false;
  const form = { username:'haein', password:'secret', reset() { resetCount += 1; } };
  const event = { currentTarget:form, preventDefault() {} };

  const handler = createAdminLoginHandler({
    async api(url, options) {
      assert.equal(url, '/api/admin/login');
      assert.deepEqual(JSON.parse(options.body), { username:'haein', password:'secret' });
      // 브라우저 이벤트 디스패치가 끝난 상황을 재현합니다.
      event.currentTarget = null;
    },
    showCms() { dashboardShown = true; },
    async loadContent() { contentLoaded = true; },
    clearMessage() {},
    showError(message) { assert.fail(message); }
  });

  await handler(event);

  assert.equal(dashboardShown, true);
  assert.equal(contentLoaded, true);
  assert.equal(resetCount, 1);
});
