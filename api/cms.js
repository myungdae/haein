'use strict';

const crypto = require('crypto');

const CMS_FIELDS = Object.freeze({
  profile: ['profile_image', 'profile_tagline', 'profile_heading', 'profile_intro_1', 'profile_intro_2', 'profile_roles', 'activity_section_title', 'activity_section_intro', 'hide_unverified_profile'],
  hero: ['hero_tag', 'hero_title_1', 'hero_title_2', 'hero_subtitle'],
  contact: [
    'contact_banner_title', 'contact_banner_services', 'contact_intro', 'contact_email', 'contact_tel',
    'contact_hours', 'contact_address', 'contact_youtube', 'contact_instagram', 'contact_facebook', 'contact_blog'
  ],
  class: [
    'class_title', 'class_intro_1', 'class_intro_2', 'class_stat_cohorts', 'class_stat_graduates',
    'class_stat_duration', 'class_stat_capacity', 'class_teacher_image', 'class_teacher_name',
    'class_teacher_title', 'class_method', 'class_schedule', 'class_period', 'class_capacity',
    'class_fee', 'class_target'
  ]
});

const COOKIE_NAME = 'haein_admin_session';
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function requireCmsEnv(env = process.env) {
  const required = ['DB_PASS', 'ADMIN_PASSWORD', 'ADMIN_SESSION_SECRET'];
  const missing = required.filter((name) => !env[name]);
  if (missing.length) throw new Error(`필수 환경변수가 없습니다: ${missing.join(', ')}`);
}

function safeEqual(left, right) {
  const a = Buffer.from(String(left || ''));
  const b = Buffer.from(String(right || ''));
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}

function sign(value, secret) {
  return crypto.createHmac('sha256', secret).update(value).digest('base64url');
}

function createSessionToken(username, secret, now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ username, exp: now + SESSION_TTL_SECONDS * 1000 })).toString('base64url');
  return `${payload}.${sign(payload, secret)}`;
}

function verifySessionToken(token, secret, now = Date.now()) {
  if (!token || !secret) return null;
  const [payload, signature, extra] = String(token).split('.');
  if (!payload || !signature || extra || !safeEqual(signature, sign(payload, secret))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return session.username && Number(session.exp) > now ? session : null;
  } catch {
    return null;
  }
}

function parseCookies(header = '') {
  return header.split(';').reduce((out, item) => {
    const index = item.indexOf('=');
    if (index > 0) out[item.slice(0, index).trim()] = decodeURIComponent(item.slice(index + 1).trim());
    return out;
  }, {});
}

function sessionCookie(token, secure) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${SESSION_TTL_SECONDS}${secure ? '; Secure' : ''}`;
}

function clearSessionCookie(secure) {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure ? '; Secure' : ''}`;
}

function normalizeSectionUpdate(section, input) {
  const allowed = CMS_FIELDS[section];
  if (!allowed || !input || typeof input !== 'object' || Array.isArray(input)) return null;
  const output = {};
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) continue;
    const value = String(input[key] ?? '').trim();
    if (value.length > 5000) throw new Error(`${key} 값이 너무 깁니다.`);
    output[key] = value;
  }
  return output;
}

module.exports = {
  CMS_FIELDS,
  COOKIE_NAME,
  clearSessionCookie,
  createSessionToken,
  normalizeSectionUpdate,
  parseCookies,
  requireCmsEnv,
  safeEqual,
  sessionCookie,
  verifySessionToken
};
