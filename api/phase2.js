'use strict';

const RESOURCES = Object.freeze({
  careers: { table:'career_items', requireVerified:true, fields:['date_label','title','description','is_visible','sort_order','verification_status'] },
  awards: { table:'awards', requireVerified:true, fields:['date_label','title','organization','award_detail','description','evidence_url','is_visible','sort_order','verification_status'] },
  activities: { table:'activity_items', requireVerified:true, fields:['date_label','title','role','organization','description','media_url','is_visible','sort_order','verification_status'] },
  press: { table:'press_items', requireVerified:true, fields:['published_date','publisher','title','article_url','description','image_url','is_visible','sort_order','verification_status'] },
  fields: { table:'activity_fields', fields:['title','short_description','description','image_url','link_url','is_visible','sort_order'] },
  works: { table:'works', fields:['title','body','excerpt','published_date','category','image_url','video_url','audio_url','is_visible','is_featured','sort_order','verification_status'] },
  performances: { table:'performances', fields:['edition','title','subtitle','event_date','event_time','venue','host','organizer','sponsor','description','image_url','poster_url','invitation_url','is_visible','is_featured','sort_order','page_slug'] },
  programs: { table:'performance_programs', fields:['performance_id','item_order','title','work_title','performer','role','description','is_visible'] },
  performers: { table:'performers', fields:['performance_id','name','photo_url','position_title','bio','work_title','role','sort_order','is_visible'] },
  media: { table:'performance_media', fields:['performance_id','media_type','media_url','description','sort_order','is_visible'] },
});

const BOOLEAN_FIELDS = new Set(['is_visible','is_featured']);
const INTEGER_FIELDS = new Set(['sort_order','edition','item_order','performance_id']);
const VERIFY = new Set(['needs_review','verified']);

function normalize(resource, body, partial = false) {
  const config = RESOURCES[resource];
  if (!config || !body || typeof body !== 'object' || Array.isArray(body)) return null;
  const values = {};
  for (const field of config.fields) {
    if (!Object.prototype.hasOwnProperty.call(body, field)) continue;
    if (BOOLEAN_FIELDS.has(field)) values[field] = body[field] === true || body[field] === 'true';
    else if (INTEGER_FIELDS.has(field)) values[field] = Number.isFinite(Number(body[field])) ? Number(body[field]) : 0;
    else if (field === 'verification_status') values[field] = VERIFY.has(body[field]) ? body[field] : 'needs_review';
    else {
      const value = String(body[field] ?? '').trim();
      if (value.length > 30000) throw new Error(`${field} 값이 너무 깁니다.`);
      values[field] = value || null;
    }
  }
  if (!partial && resource !== 'media' && !values.title && !values.name && !values.publisher) throw new Error('제목 또는 이름을 입력해 주세요.');
  return values;
}

function registerPhase2(app, pool, adminAuth) {
  app.get('/api/cms/:resource', async (req, res, next) => {
    const config = RESOURCES[req.params.resource];
    if (!config) return next();
    try {
      const filters = ['is_visible = TRUE'];
      const params = [];
      if (config.fields.includes('performance_id') && req.query.performance_id) {
        params.push(Number(req.query.performance_id)); filters.push(`performance_id = $${params.length}`);
      }
      if (config.requireVerified && req.query.include_unverified !== 'true') filters.push("verification_status = 'verified'");
      const order = config.fields.includes('item_order') ? 'item_order ASC, id ASC' : 'sort_order ASC, id ASC';
      const result = await pool.query(`SELECT * FROM ${config.table} WHERE ${filters.join(' AND ')} ORDER BY ${order}`, params);
      res.set('Cache-Control', 'no-cache');
      res.json({ ok:true, items:result.rows });
    } catch (err) {
      console.error('[Phase 2 공개 조회 오류]', err.message);
      res.status(503).json({ ok:false, message:'현재 기본 홈페이지 내용을 표시합니다.' });
    }
  });

  app.get('/api/admin/:resource', adminAuth, async (req, res, next) => {
    const config = RESOURCES[req.params.resource];
    if (!config) return next();
    try {
      const params = []; let where = '';
      if (config.fields.includes('performance_id') && req.query.performance_id) { params.push(Number(req.query.performance_id)); where=' WHERE performance_id=$1'; }
      const order = config.fields.includes('item_order') ? 'item_order ASC, id ASC' : 'sort_order ASC, id ASC';
      const result = await pool.query(`SELECT * FROM ${config.table}${where} ORDER BY ${order}`, params);
      res.json({ ok:true, items:result.rows });
    } catch (err) { res.status(500).json({ ok:false, message:'목록을 불러오지 못했습니다.' }); }
  });

  app.post('/api/admin/:resource', adminAuth, async (req, res, next) => {
    const config = RESOURCES[req.params.resource];
    if (!config) return next();
    try {
      const values = normalize(req.params.resource, req.body);
      const fields = Object.keys(values); const params = Object.values(values);
      const placeholders = fields.map((_, index) => `$${index + 1}`).join(',');
      const result = await pool.query(`INSERT INTO ${config.table} (${fields.join(',')}) VALUES (${placeholders}) RETURNING *`, params);
      res.status(201).json({ ok:true, item:result.rows[0], message:'추가했습니다.' });
    } catch (err) { res.status(400).json({ ok:false, message:err.message }); }
  });

  app.put('/api/admin/:resource/:id', adminAuth, async (req, res, next) => {
    const config = RESOURCES[req.params.resource];
    if (!config) return next();
    try {
      const values = normalize(req.params.resource, req.body, true);
      const fields = Object.keys(values);
      if (!fields.length) return res.status(400).json({ ok:false, message:'수정할 내용을 확인해 주세요.' });
      const params = Object.values(values); params.push(Number(req.params.id));
      const sets = fields.map((field, index) => `${field}=$${index + 1}`).join(',');
      const result = await pool.query(`UPDATE ${config.table} SET ${sets}, updated_at=NOW() WHERE id=$${params.length} RETURNING *`, params);
      if (!result.rows.length) return res.status(404).json({ ok:false, message:'항목을 찾을 수 없습니다.' });
      res.json({ ok:true, item:result.rows[0], message:'저장했습니다.' });
    } catch (err) { res.status(400).json({ ok:false, message:err.message }); }
  });

  app.delete('/api/admin/:resource/:id', adminAuth, async (req, res, next) => {
    const config = RESOURCES[req.params.resource];
    if (!config) return next();
    try {
      const result = await pool.query(`DELETE FROM ${config.table} WHERE id=$1 RETURNING id`, [Number(req.params.id)]);
      if (!result.rows.length) return res.status(404).json({ ok:false, message:'항목을 찾을 수 없습니다.' });
      res.json({ ok:true, message:'삭제했습니다.' });
    } catch (err) { res.status(500).json({ ok:false, message:'삭제하지 못했습니다.' }); }
  });
}

module.exports = { RESOURCES, normalize, registerPhase2 };
