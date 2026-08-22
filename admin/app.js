'use strict';

const SECTION_CONFIG = {
  profile: { title: '내 소개', fields: [
    ['profile_image','프로필 사진','image'], ['profile_tagline','한 줄 소개','text'], ['profile_heading','소개 제목','textarea'],
    ['profile_intro_1','자기소개 첫 번째 문단','textarea'], ['profile_intro_2','자기소개 두 번째 문단','textarea'],
    ['profile_roles','현재 활동','textarea','한 줄에 하나씩 입력하세요. 예: 시인, 시낭송가, MC']
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

const state = { sections: {}, current: null };
const $ = (id) => document.getElementById(id);

async function api(url, options = {}) {
  const response = await fetch(url, { credentials: 'same-origin', ...options, headers: { ...(options.body instanceof FormData ? {} : {'Content-Type':'application/json'}), ...(options.headers || {}) } });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(data.message || '요청을 처리하지 못했습니다.'), { status: response.status });
  return data;
}

function showLogin() { $('loginView').hidden = false; $('cmsView').hidden = true; }
function showCms() { $('loginView').hidden = true; $('cmsView').hidden = false; }

async function boot() {
  try {
    await api('/api/admin/session');
    showCms();
    await loadContent();
  } catch { showLogin(); }
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
  $('menuView').hidden = true;
  $('editorView').hidden = false;
  $('saveMessage').textContent = '';
  $('uploadProfile')?.addEventListener('click', uploadProfile);
  window.scrollTo(0,0);
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
  clearMessage: () => { $('loginMessage').textContent = ''; },
  showError: (message) => { $('loginMessage').textContent = message; }
}));
document.querySelectorAll('[data-section]').forEach((button) => button.addEventListener('click', () => openEditor(button.dataset.section)));
$('backButton').addEventListener('click', () => { $('editorView').hidden=true; $('menuView').hidden=false; state.current=null; });
$('logoutButton').addEventListener('click', async () => { await api('/api/admin/logout',{method:'POST'}).catch(()=>{}); showLogin(); });
$('previewButton').addEventListener('click', showPreview);
$('contentForm').addEventListener('submit', (event) => { event.preventDefault(); showPreview(); });
$('closePreview').addEventListener('click', () => $('previewDialog').close());
$('previewCancel').addEventListener('click', () => $('previewDialog').close());
$('previewPublish').addEventListener('click', saveCurrent);
boot();
