'use strict';

const SECTION_CONFIG = {
  profile: { title: '내 소개', fields: [
    ['profile_image','프로필 사진','image'], ['profile_tagline','한 줄 소개','text'], ['profile_heading','소개 제목','textarea'],
    ['profile_intro_1','자기소개 첫 번째 문단','textarea'], ['profile_intro_2','자기소개 두 번째 문단','textarea'],
    ['profile_roles','현재 활동','textarea','한 줄에 하나씩 입력하세요. 예: 시인, 시낭송가, MC'],
    ['activity_section_title','주요 활동 분야 제목','text'], ['activity_section_intro','주요 활동 분야 소개','textarea'],
    ['hide_unverified_profile','확인 전 소개 항목 숨기기','text','true이면 사실 확인 전 항목을 공개 페이지에서 숨깁니다.']
  ]},
  hero: { title: '메인 화면', fields: [
    ['hero_tag','이름 표기','text'], ['hero_title_1','메인 문구 첫 줄','text'],
    ['hero_title_2','메인 문구 둘째 줄','text'], ['hero_subtitle','영문 보조 문구','text']
  ]},
  class: { title: '시낭송교실', fields: [
    ['class_title','수업 소개 제목','textarea'], ['class_intro_1','수업 소개 첫 번째 문단','textarea'], ['class_intro_2','수업 소개 두 번째 문단','textarea'],
    ['class_stat_cohorts','누적 기수','text','현재 홈페이지의 숫자입니다. 사실 여부를 확인해 수정하거나 지울 수 있습니다.'],
    ['class_stat_graduates','수료생 수','text','현재 홈페이지의 숫자입니다. 사실 여부를 확인해 수정하거나 지울 수 있습니다.'],
    ['class_stat_duration','정규 과정','text'], ['class_stat_capacity','최대 정원','text'],
    ['class_teacher_image','강사 사진 주소','text'], ['class_teacher_name','강사 이름','text'], ['class_teacher_title','강사 소개','text'],
    ['class_method','수업 방식','text'], ['class_schedule','수업 일정','text'], ['class_period','수업 기간','text'],
    ['class_capacity','정원','text'], ['class_fee','수강료','text'], ['class_target','대상','text']
  ]},
  contact: { title: '연락처', fields: [
    ['contact_banner_title','문의 화면 제목','textarea'], ['contact_banner_services','주요 서비스','textarea'], ['contact_intro','문의 안내','textarea'],
    ['contact_email','이메일','email'], ['contact_tel','전화번호','tel'], ['contact_hours','운영시간','text'], ['contact_address','주소','textarea'],
    ['contact_youtube','유튜브 주소','url'], ['contact_instagram','인스타그램 주소','url'], ['contact_facebook','페이스북 주소','url'], ['contact_blog','블로그 주소','url']
  ]}
};

const RESOURCE_CONFIG = {
  careers:{ title:'약력', description:'현재 홈페이지 표시 내용은 사실 확인이 필요합니다.', add:'＋ 약력 추가', fields:[['date_label','연도 또는 날짜'],['title','내용'],['description','상세설명','textarea'],['sort_order','정렬 순서','number'],['verification_status','사실 확인 상태','verify']] },
  awards:{ title:'수상 경력', add:'＋ 수상 경력 추가', fields:[['date_label','연도/날짜'],['title','상명'],['organization','주최 기관'],['award_detail','수상 내용','textarea'],['description','설명','textarea'],['evidence_url','증빙 또는 링크','url'],['sort_order','정렬 순서','number'],['verification_status','사실 확인 상태','verify']] },
  activities:{ title:'활동 이력', add:'＋ 활동 추가', fields:[['date_label','날짜/연도'],['title','활동명'],['role','역할'],['organization','기관/장소'],['description','설명','textarea'],['media_url','관련 이미지 또는 링크','url'],['sort_order','정렬 순서','number'],['verification_status','사실 확인 상태','verify']] },
  press:{ title:'언론 보도', add:'＋ 언론 보도 추가', fields:[['published_date','날짜'],['publisher','언론사'],['title','기사 제목'],['article_url','기사 URL','url'],['description','짧은 설명','textarea'],['image_url','대표 이미지','url'],['sort_order','정렬 순서','number'],['verification_status','사실 확인 상태','verify']] },
  fields:{ title:'주요 활동 분야', add:'＋ 활동 분야 추가', fields:[['title','활동명'],['short_description','한 줄 설명'],['description','상세 설명','textarea'],['image_url','대표 이미지 또는 아이콘','url'],['link_url','연결 URL','url'],['sort_order','정렬 순서','number']] },
  works:{ title:'창작시', description:'시와 작품을 직접 등록하고 수정합니다.', add:'＋ 새 작품 추가', fields:[['title','제목'],['body','작품 전문','textarea'],['excerpt','짧은 소개 또는 발췌문','textarea'],['published_date','작성일 또는 발표일'],['category','분류'],['image_url','대표 이미지','url'],['video_url','낭송 영상 URL','url'],['audio_url','낭송 음원 URL','url'],['verification_status','사실 확인 상태','verify'],['is_featured','메인 대표 작품','checkbox'],['sort_order','정렬 순서','number']] },
  performances:{ title:'효 콘서트', description:'공연 정보와 프로그램을 관리합니다.', add:'＋ 새 공연 추가', fields:[['edition','회차','number'],['title','공연명'],['subtitle','부제'],['event_date','날짜'],['event_time','시간'],['venue','장소'],['host','주최'],['organizer','주관'],['sponsor','후원'],['description','공연 소개','textarea'],['image_url','대표 이미지','url'],['poster_url','포스터','url'],['invitation_url','초대장','url'],['page_slug','기존 디자인 페이지'],['is_featured','메인 추천','checkbox'],['sort_order','정렬 순서','number']] },
  programs:{ title:'공연 프로그램', description:'프로그램 항목을 추가하고 순서를 바꿀 수 있습니다.', add:'＋ 프로그램 추가', fields:[['item_order','순서','number'],['title','프로그램 제목'],['work_title','시/작품명'],['performer','출연자'],['role','역할'],['description','설명','textarea']] },
  performers:{ title:'출연진', add:'＋ 출연진 추가', fields:[['name','이름'],['photo_url','사진','url'],['position_title','직함'],['bio','소개','textarea'],['work_title','담당 작품'],['role','역할'],['sort_order','정렬 순서','number']] },
  media:{ title:'공연 미디어', add:'＋ 미디어 추가', fields:[['media_type','종류(image/video)'],['media_url','사진 또는 영상 URL','url'],['description','설명','textarea'],['sort_order','정렬 순서','number']] }
};

const state = { sections: {}, current: null };
let authTransition = 0;
const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
  const requestOptions = { credentials: 'same-origin', cache: url.startsWith('/api/admin/') ? 'no-store' : 'default', ...options, headers: { ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...(options.headers || {}) } };
  let response = await fetch(url, requestOptions);
  // 일부 프록시가 fetch에 본문 없는 304를 직접 전달하는 경우 한 번 새로 조회합니다.
  if (response.status === 304) {
    const separator = url.includes('?') ? '&' : '?';
    response = await fetch(`${url}${separator}_cms=${Date.now()}`, { ...requestOptions, cache:'reload' });
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || '요청을 처리하지 못했습니다.'), { status: response.status });
  return data;
}

function showLogin() { $('loginView').hidden = false; $('cmsView').hidden = true; }
function showCms() { $('loginView').hidden = true; $('cmsView').hidden = false; }
function beginAuthTransition() { authTransition += 1; return authTransition; }
function showDashboardError(message) { $('dashboardMessage').textContent = message || '콘텐츠를 불러오지 못했습니다. 새로고침해 주세요.'; }

async function boot() {
  const transition = beginAuthTransition();
  try {
    await api('/api/admin/session');
    if (transition !== authTransition) return;
    showCms();
  } catch {
    if (transition === authTransition) showLogin();
    return;
  }
  try {
    await loadContent();
  } catch (err) {
    if (transition === authTransition) showDashboardError(err.message);
  }
}

async function loadContent() {
  const data = await api('/api/admin/content');
  state.sections = data.sections || {};
}

function fieldHtml([key, label, type, help]) {
  const value = state.sections[state.current]?.[key] || '';
  const escaped = value.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
  if (type === 'image') return `<div class="field-card"><label>${label}</label><img class="image-preview" id="profilePreview" src="${escaped}" alt="현재 프로필 사진"><div class="image-actions"><input id="profileFile" type="file" accept="image/jpeg,image/png,image/webp,image/gif"><button type="button" class="secondary" id="uploadProfile">사진 변경</button></div>${help ? `<p class="field-help">${help}</p>`:''}<input type="hidden" name="${key}" value="${escaped}"></div>`;
  const control = type === 'textarea' ? `<textarea name="${key}">${escaped}</textarea>` : `<input name="${key}" type="${type}" value="${escaped}">`;
  return `<div class="field-card"><label>${label}${control}</label>${help ? `<p class="field-help">${help}</p>`:''}</div>`;
}

function openEditor(section) {
  state.current = section;
  const config = SECTION_CONFIG[section];
  $('editorTitle').textContent = config.title;
  $('fields').innerHTML = config.fields.map(fieldHtml).join('');
  if (section === 'profile') {
    $('fields').insertAdjacentHTML('beforeend', `<section class="field-card profile-structured"><h2>소개 상세 관리</h2><p class="field-help">약력과 활동 기록을 확인하고 직접 관리합니다. 확인되지 않은 기존 내용도 관리자에게 표시됩니다.</p><div id="profileResourceOverview" class="profile-resource-overview" aria-live="polite"></div></section>`);
    loadProfileOverview();
  }
  $('menuView').hidden = true;
  $('editorView').hidden = false;
  $('saveMessage').textContent = '';
  $('uploadProfile')?.addEventListener('click', uploadProfile);
  window.scrollTo(0,0);
}

const PROFILE_RESOURCES = ['careers','awards','activities','press','fields'];
async function loadProfileOverview() {
  const container=$('profileResourceOverview'); if(!container)return;
  container.innerHTML='<p class="field-help">소개 항목을 불러오는 중입니다.</p>';
  const results=await Promise.all(PROFILE_RESOURCES.map(async key => {
    try { const data=await api(`/api/admin/${key}`); return {key,items:data.items||[]}; }
    catch(error){ return {key,items:[],error:error.message}; }
  }));
  if(!$('profileResourceOverview'))return;
  container.innerHTML=results.map(({key,items,error})=>`<section class="profile-resource-panel" data-profile-resource="${key}"><div class="profile-resource-head"><div><h3>${RESOURCE_CONFIG[key].title}</h3><small>${items.length}개 항목</small></div><button type="button" class="secondary" data-open-resource="${key}">관리하기</button></div>${error?`<p class="message">${escapeHtml(error)}</p>`:items.length?`<ul>${items.slice(0,5).map(item=>`<li><span>${escapeHtml(item.date_label||item.published_date||'')}</span><strong>${escapeHtml(itemHeading(item))}</strong>${item.verification_status==='needs_review'?'<em>⚠ 확인 필요</em>':item.verification_status==='verified'?'<em class="verified">✓ 확인 완료</em>':''}</li>`).join('')}</ul>`:'<p class="field-help">등록된 항목이 없습니다.</p>'}</section>`).join('');
}

let resourceState = { key:null, items:[], editing:null, parentId:null };
function escapeHtml(value='') { return String(value ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;'); }
async function openResource(key, parentId=null) {
  resourceState.key = key; resourceState.editing = null; resourceState.parentId=parentId;
  const config = RESOURCE_CONFIG[key];
  $('resourceTitle').textContent = config.title; $('resourceDescription').textContent = config.description || '추가, 수정, 공개 여부와 순서를 관리합니다.'; $('addResource').textContent = config.add;
  $('menuView').hidden=true; $('editorView').hidden=true; $('resourceView').hidden=false;
  await loadResource(); window.scrollTo(0,0);
}
async function loadResource() {
  try { const query=resourceState.parentId?`?performance_id=${resourceState.parentId}`:''; const data=await api(`/api/admin/${resourceState.key}${query}`); resourceState.items=data.items||[]; renderResource(); }
  catch(err){ $('resourceMessage').textContent=err.message; }
}
function itemHeading(item) { return item.title || item.name || item.publisher || '제목 없음'; }
function renderResource() {
  $('resourceList').innerHTML = resourceState.items.length ? resourceState.items.map(item => `<article class="resource-card" data-id="${item.id}"><h3>${escapeHtml(itemHeading(item))}</h3><p>${escapeHtml(item.date_label || item.published_date || item.subtitle || item.excerpt || '')}</p>${item.verification_status==='needs_review'?'<p class="review-warning">⚠️ 현재 홈페이지 표시 내용 — 사실 확인 필요</p>':''}<div class="resource-actions"><button data-action="edit">수정</button><button data-action="toggle">${item.is_visible?'비공개':'공개'}</button>${item.verification_status==='needs_review'?'<button data-action="verify">✓ 맞음</button>':''}${resourceState.key==='performances'?'<button data-action="programs">프로그램</button><button data-action="performers">출연진</button><button data-action="media">미디어</button>':''}<button data-action="up">위로</button><button data-action="down">아래로</button><button class="danger" data-action="delete">삭제</button></div></article>`).join('') : '<div class="field-card">등록된 항목이 없습니다.</div>';
}
function resourceField([key,label,type='text'], item={}) {
  const value=escapeHtml(item[key] ?? ''); const wide=type==='textarea'?' wide':'';
  if(type==='textarea') return `<label class="${wide.trim()}">${label}<textarea name="${key}">${value}</textarea></label>`;
  if(type==='checkbox') return `<label>${label}<select name="${key}"><option value="false">아니요</option><option value="true" ${item[key]?'selected':''}>예</option></select></label>`;
  if(type==='verify') return `<label>${label}<select name="${key}"><option value="needs_review">확인 필요</option><option value="verified" ${item[key]==='verified'?'selected':''}>확인 완료</option></select></label>`;
  return `<label>${label}<input name="${key}" type="${type}" value="${value}"></label>`;
}
function showResourceForm(item=null) {
  resourceState.editing=item; const config=RESOURCE_CONFIG[resourceState.key];
  $('resourceDialogTitle').textContent=item?'항목 수정':config.add.replace('＋ ','');
  $('resourceFields').innerHTML=`<div class="resource-form-grid">${config.fields.map(f=>resourceField(f,item||{})).join('')}<label>공개 여부<select name="is_visible"><option value="true">공개</option><option value="false" ${item && !item.is_visible?'selected':''}>비공개</option></select></label></div>`;
  $('resourceDialog').showModal();
}
async function persistResource(visible) {
  const values={}; new FormData($('resourceForm')).forEach((value,key)=>values[key]=value); values.is_visible=visible;
  if(resourceState.parentId) values.performance_id=resourceState.parentId;
  const editing=resourceState.editing; const url=`/api/admin/${resourceState.key}${editing?'/'+editing.id:''}`;
  try { await api(url,{method:editing?'PUT':'POST',body:JSON.stringify(values)}); $('resourceDialog').close(); await loadResource(); $('resourceMessage').textContent=visible?'저장하고 공개했습니다.':'비공개로 저장했습니다.'; }
  catch(err){ alert(err.message); }
}
async function resourceAction(event) {
  const button=event.target.closest('[data-action]'); if(!button)return; const card=button.closest('[data-id]'); const item=resourceState.items.find(x=>String(x.id)===card.dataset.id); const action=button.dataset.action;
  if(action==='edit') return showResourceForm(item);
  if(['programs','performers','media'].includes(action)) return openResource(action,item.id);
  if(action==='delete'){ if(!confirm('정말 삭제할까요? 삭제한 내용은 되돌릴 수 없습니다.'))return; await api(`/api/admin/${resourceState.key}/${item.id}`,{method:'DELETE'}); return loadResource(); }
  const patch={}; if(action==='toggle')patch.is_visible=!item.is_visible; if(action==='verify')patch.verification_status='verified';
  if(action==='up'||action==='down')patch.sort_order=Number(item.sort_order||0)+(action==='up'?-10:10);
  await api(`/api/admin/${resourceState.key}/${item.id}`,{method:'PUT',body:JSON.stringify(patch)}); await loadResource();
}

function collectValues() {
  const values = {};
  new FormData($('contentForm')).forEach((value, key) => { values[key] = String(value); });
  return values;
}

function showPreview() {
  const values = collectValues();
  const config = SECTION_CONFIG[state.current];
  $('previewContent').innerHTML = config.fields.map(([key,label,type]) => type === 'image'
    ? `<div class="preview-block"><strong>${label}</strong><img class="preview-photo" src="${values[key] || ''}" alt=""></div>`
    : `<div class="preview-block"><strong>${label}</strong><p></p></div>`).join('');
  [...$('previewContent').querySelectorAll('.preview-block')].forEach((block,index) => {
    const [key,,type] = config.fields[index];
    if (type !== 'image') block.querySelector('p').textContent = values[key] || '(비어 있음)';
  });
  $('previewDialog').showModal();
}

async function saveCurrent() {
  const button = $('contentForm').querySelector('[type="submit"]');
  button.disabled = true;
  try {
    const values = collectValues();
    await api(`/api/admin/content/${state.current}`, { method:'PUT', body:JSON.stringify({ values }) });
    state.sections[state.current] = { ...state.sections[state.current], ...values };
    $('saveMessage').textContent = '저장하고 공개했습니다.';
    $('saveMessage').className = 'message success';
    $('previewDialog').close();
  } catch (err) {
    $('saveMessage').textContent = err.message;
    $('saveMessage').className = 'message';
  } finally { button.disabled = false; }
}

async function uploadProfile() {
  const file = $('profileFile').files[0];
  if (!file) return alert('변경할 사진을 선택해 주세요.');
  const data = new FormData(); data.append('image', file);
  try {
    const result = await api('/api/admin/profile-image', { method:'POST', body:data });
    $('profilePreview').src = result.url;
    $('contentForm').elements.profile_image.value = result.url;
    state.sections.profile.profile_image = result.url;
  } catch (err) { alert(err.message); }
}

$('loginForm').addEventListener('submit', createAdminLoginHandler({
  api,
  showCms,
  loadContent,
  beginAuthTransition,
  clearMessage: () => { $('loginMessage').textContent = ''; },
  showError: (message) => { $('loginMessage').textContent = message; },
  showDashboardError
}));
$('menuView').addEventListener('click',(event)=>{
  const sectionButton=event.target.closest('[data-section]');
  if(sectionButton){ event.preventDefault(); openEditor(sectionButton.dataset.section); return; }
  const resourceButton=event.target.closest('[data-resource]');
  if(resourceButton){ event.preventDefault(); openResource(resourceButton.dataset.resource); }
});
$('fields').addEventListener('click',(event)=>{ const button=event.target.closest('[data-open-resource]'); if(button)openResource(button.dataset.openResource); });
$('resourceBack').addEventListener('click',()=>{$('resourceView').hidden=true;$('menuView').hidden=false;});
$('addResource').addEventListener('click',()=>showResourceForm());
$('resourceList').addEventListener('click',resourceAction);
$('closeResource').addEventListener('click',()=>$('resourceDialog').close());
$('savePrivate').addEventListener('click',()=>persistResource(false));
$('resourceForm').addEventListener('submit',(event)=>{event.preventDefault();persistResource(true);});
$('backButton').addEventListener('click', () => { $('editorView').hidden=true; $('menuView').hidden=false; state.current=null; });
$('logoutButton').addEventListener('click', async () => { await api('/api/admin/logout',{method:'POST'}).catch(()=>{}); showLogin(); });
$('previewButton').addEventListener('click', showPreview);
$('contentForm').addEventListener('submit', (event) => { event.preventDefault(); showPreview(); });
$('closePreview').addEventListener('click', () => $('previewDialog').close());
$('previewCancel').addEventListener('click', () => $('previewDialog').close());
$('previewPublish').addEventListener('click', saveCurrent);
boot();
