'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');

process.env.DB_PASS = 'test-db-password';
process.env.ADMIN_USERNAME = 'haein';
process.env.ADMIN_PASSWORD = 'test-admin-password';
process.env.ADMIN_SESSION_SECRET = 'test-session-secret-that-is-long-enough';
process.env.NODE_ENV = 'test';

const rows = [
  { key:'hero_tag', section:'hero', label:'이름 표기', value:'강해인 · Kang Haein', updated_at:new Date() },
  { key:'profile_tagline', section:'profile', label:'한 줄 소개', value:'기존 자기소개', updated_at:new Date() },
  { key:'contact_tel', section:'contact', label:'전화번호', value:'010-5064-3805', updated_at:new Date() },
  { key:'class_method', section:'class', label:'수업 방식', value:'오프라인', updated_at:new Date() },
];
const phase2Rows = Object.fromEntries(['career_items','awards','activity_items','press_items','activity_fields','works','performances','performance_programs','performers','performance_media'].map(table=>[table,[]]));
let phase2Id = 1;

function resultFor(sql, params = []) {
  const normalized = String(sql).replace(/\s+/g, ' ').trim();
  const tableMatch = normalized.match(/(?:FROM|INTO|UPDATE) (career_items|awards|activity_items|press_items|activity_fields|works|performances|performance_programs|performers|performance_media)/);
  if (tableMatch) {
    const table=tableMatch[1]; const store=phase2Rows[table];
    if (normalized.startsWith('SELECT')) return { rows:store.map(item=>({...item})) };
    if (normalized.startsWith('INSERT')) {
      const fields=normalized.match(/\(([^)]+)\) VALUES/)[1].split(','); const item={id:phase2Id++,is_visible:true,sort_order:0}; fields.forEach((field,index)=>item[field]=params[index]); store.push(item); return {rows:[{...item}],rowCount:1};
    }
    if (normalized.startsWith('UPDATE')) {
      const id=params.at(-1); const item=store.find(entry=>entry.id===id); const fields=normalized.match(/ SET (.+), updated_at=/)[1].split(',').map(value=>value.split('=')[0]); if(item)fields.forEach((field,index)=>item[field]=params[index]); return {rows:item?[{...item}]:[],rowCount:item?1:0};
    }
    if (normalized.startsWith('DELETE')) { const id=params[0]; const index=store.findIndex(entry=>entry.id===id); if(index<0)return {rows:[],rowCount:0}; store.splice(index,1); return {rows:[{id}],rowCount:1}; }
  }
  if (/SELECT key, value, updated_at FROM site_content/.test(normalized)) return { rows:rows.map(({key,value,updated_at})=>({key,value,updated_at})) };
  if (/SELECT key, section, label, value, updated_at FROM site_content/.test(normalized)) return { rows:rows.map(row=>({...row})) };
  if (/UPDATE site_content SET value=\$1/.test(normalized)) {
    const row = rows.find(item => item.key === params[1] && item.section === params[2]);
    if (row) { row.value = params[0]; row.updated_at = new Date(); }
    return { rowCount:row ? 1 : 0, rows:[] };
  }
  if (/SELECT \* FROM gallery_images/.test(normalized)) return { rows:[] };
  if (/SELECT COUNT\(\*\) FROM gallery_images/.test(normalized)) return { rows:[{count:'0'}] };
  return { rows:[], rowCount:1 };
}

const fakePool = {
  connect(callback) {
    if (callback) { callback(null, { release(){} }); return; }
    return Promise.resolve({ query:async(sql,params)=>resultFor(sql,params), release(){} });
  },
  async query(sql, params) { return resultFor(sql, params); }
};
global.__HAEIN_TEST_POOL = fakePool;

const { app } = require('../server');

let server;
let base;
test.before(async () => {
  server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  base = `http://127.0.0.1:${server.address().port}`;
});
test.after(() => new Promise(resolve => server.close(resolve)));

async function json(path, options = {}) {
  const response = await fetch(base + path, { ...options, headers:{ 'Content-Type':'application/json', ...(options.headers||{}) } });
  return { response, body:await response.json() };
}

test('공개 CMS API가 기존 콘텐츠를 제공한다', async () => {
  const { response, body } = await json('/api/cms/content');
  assert.equal(response.status, 200);
  assert.equal(body.content.profile_tagline, '기존 자기소개');
});

test('인증 없는 CMS 쓰기 요청은 차단한다', async () => {
  const { response } = await json('/api/admin/content/hero', { method:'PUT', body:JSON.stringify({values:{hero_tag:'변경'}}) });
  assert.equal(response.status, 401);
});

test('로그인 후 Hero를 수정하면 새 조회에도 유지된다', async () => {
  const login = await json('/api/admin/login', { method:'POST', body:JSON.stringify({username:'haein',password:'test-admin-password'}) });
  assert.equal(login.response.status, 200);
  const cookie = login.response.headers.get('set-cookie').split(';')[0];
  const update = await json('/api/admin/content/hero', { method:'PUT', headers:{Cookie:cookie}, body:JSON.stringify({values:{hero_tag:'새로운 강해인'}}) });
  assert.equal(update.response.status, 200);
  const published = await json('/api/cms/content');
  assert.equal(published.body.content.hero_tag, '새로운 강해인');
});

test('기존 문의·수강신청·갤러리 조회 API가 유지된다', async () => {
  const contact = await json('/api/contact', { method:'POST', body:JSON.stringify({name:'테스트',tel:'010',message:'문의'}) });
  const apply = await json('/api/apply', { method:'POST', body:JSON.stringify({name:'테스트',tel:'010'}) });
  const gallery = await json('/api/gallery');
  assert.equal(contact.response.status, 200);
  assert.equal(apply.response.status, 200);
  assert.equal(gallery.response.status, 200);
});

test('약력·수상·활동·보도·활동분야·작품·공연 CRUD와 공개 전환이 동작한다', async () => {
  const login = await json('/api/admin/login', { method:'POST', body:JSON.stringify({username:'haein',password:'test-admin-password'}) });
  const cookie = login.response.headers.get('set-cookie').split(';')[0];
  for (const resource of ['careers','awards','activities','press','fields','works','performances']) {
    const payload = resource==='press' ? {publisher:'테스트 언론',title:'기사'} : {title:'테스트 항목'};
    const created=await json(`/api/admin/${resource}`,{method:'POST',headers:{Cookie:cookie},body:JSON.stringify(payload)});
    assert.equal(created.response.status,201,resource+' 추가');
    const id=created.body.item.id;
    const updated=await json(`/api/admin/${resource}/${id}`,{method:'PUT',headers:{Cookie:cookie},body:JSON.stringify({is_visible:false,sort_order:20})});
    assert.equal(updated.body.item.is_visible,false,resource+' 비공개');
    const deleted=await json(`/api/admin/${resource}/${id}`,{method:'DELETE',headers:{Cookie:cookie}});
    assert.equal(deleted.response.status,200,resource+' 삭제');
  }
});

test('공연 프로그램을 추가하고 순서를 변경할 수 있다', async () => {
  const login=await json('/api/admin/login',{method:'POST',body:JSON.stringify({username:'haein',password:'test-admin-password'})});
  const cookie=login.response.headers.get('set-cookie').split(';')[0];
  const performance=await json('/api/admin/performances',{method:'POST',headers:{Cookie:cookie},body:JSON.stringify({title:'제5회 효 콘서트'})});
  const program=await json('/api/admin/programs',{method:'POST',headers:{Cookie:cookie},body:JSON.stringify({performance_id:performance.body.item.id,title:'시낭송',item_order:1})});
  assert.equal(program.response.status,201);
  const moved=await json(`/api/admin/programs/${program.body.item.id}`,{method:'PUT',headers:{Cookie:cookie},body:JSON.stringify({item_order:2})});
  assert.equal(moved.body.item.item_order,2);
});

test('인증 없는 Phase 2 쓰기 요청은 차단한다', async () => {
  const result=await json('/api/admin/works',{method:'POST',body:JSON.stringify({title:'차단'})});
  assert.equal(result.response.status,401);
});
