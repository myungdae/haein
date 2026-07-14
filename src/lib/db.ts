// D1 helper functions for the class content model.

export type SiteContent = Record<string, string>;

export interface Cohort {
  id: number;
  term_label: string;
  start_date: string | null;
  end_date: string | null;
  schedule_text: string | null;
  status: string;
  capacity: number;
  is_current: number;
  sort_order: number;
}

export interface CurriculumItem {
  id: number;
  week_range: string;
  title: string;
  description: string | null;
  sort_order: number;
}

export async function getSiteContent(db: D1Database): Promise<SiteContent> {
  const { results } = await db.prepare('SELECT key, value FROM site_content').all<{ key: string; value: string }>();
  const map: SiteContent = {};
  for (const row of results ?? []) map[row.key] = row.value;
  return map;
}

export async function getCohorts(db: D1Database): Promise<Cohort[]> {
  const { results } = await db
    .prepare('SELECT * FROM cohorts ORDER BY sort_order ASC')
    .all<Cohort>();
  return results ?? [];
}

export async function getCurrentCohort(db: D1Database): Promise<Cohort | null> {
  const row = await db
    .prepare('SELECT * FROM cohorts WHERE is_current = 1 ORDER BY sort_order ASC LIMIT 1')
    .first<Cohort>();
  return row ?? null;
}

export async function getCurriculum(db: D1Database): Promise<CurriculumItem[]> {
  const { results } = await db
    .prepare('SELECT * FROM curriculum ORDER BY sort_order ASC')
    .all<CurriculumItem>();
  return results ?? [];
}

export interface ApplicationInput {
  name: string;
  tel: string;
  email?: string;
  term?: string;
  experience?: string;
  message?: string;
}

export async function insertApplication(db: D1Database, input: ApplicationInput): Promise<void> {
  await db
    .prepare(
      'INSERT INTO applications (name, tel, email, term, experience, message) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(
      input.name,
      input.tel,
      input.email ?? null,
      input.term ?? null,
      input.experience ?? null,
      input.message ?? null
    )
    .run();
}
