import { Hono } from 'hono';
import { renderer } from './renderer';
import { HomePage } from './templates/HomePage';
import { getSiteContent, getCohorts, getCurriculum, insertApplication } from './lib/db';
import type { Bindings } from './lib/types';

const app = new Hono<{ Bindings: Bindings }>();

app.use(renderer);

app.get('/', async (c) => {
  const db = c.env.DB;
  const [content, cohorts, curriculum] = await Promise.all([
    getSiteContent(db),
    getCohorts(db),
    getCurriculum(db)
  ]);
  return c.render(<HomePage content={content} cohorts={cohorts} curriculum={curriculum} />);
});

// ---- Public API ----

app.get('/api/content', async (c) => {
  const db = c.env.DB;
  const [content, cohorts, curriculum] = await Promise.all([
    getSiteContent(db),
    getCohorts(db),
    getCurriculum(db)
  ]);
  return c.json({ ok: true, content, cohorts, curriculum });
});

app.post('/api/apply', async (c) => {
  let body: any;
  try {
    body = await c.req.json();
  } catch {
    return c.json({ ok: false, error: '잘못된 요청입니다.' }, 400);
  }

  const name = String(body?.name ?? '').trim();
  const tel = String(body?.tel ?? '').trim();

  if (!name || !tel) {
    return c.json({ ok: false, error: '이름과 연락처는 필수입니다.' }, 400);
  }
  if (name.length > 50 || tel.length > 30) {
    return c.json({ ok: false, error: '입력값이 너무 길어요.' }, 400);
  }

  try {
    await insertApplication(c.env.DB, {
      name,
      tel,
      email: body?.email ? String(body.email).trim().slice(0, 100) : undefined,
      term: body?.term ? String(body.term).trim().slice(0, 50) : undefined,
      experience: body?.experience ? String(body.experience).trim().slice(0, 20) : undefined,
      message: body?.message ? String(body.message).trim().slice(0, 1000) : undefined
    });
    return c.json({ ok: true });
  } catch (err) {
    console.error('apply insert failed', err);
    return c.json({ ok: false, error: '서버 오류가 발생했습니다.' }, 500);
  }
});

app.get('/api/health', (c) => c.json({ ok: true, service: 'haein-class-pwa' }));

export default app;
