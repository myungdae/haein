-- HAEIN CMS Phase 2: 반복 실행 가능한 구조화 콘텐츠 스키마
BEGIN;

CREATE TABLE IF NOT EXISTS career_items (
 id BIGSERIAL PRIMARY KEY, date_label VARCHAR(100), title VARCHAR(300) NOT NULL, description TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 verification_status VARCHAR(20) NOT NULL DEFAULT 'needs_review' CHECK (verification_status IN ('needs_review','verified')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS awards (
 id BIGSERIAL PRIMARY KEY, date_label VARCHAR(100), title VARCHAR(300) NOT NULL, organization VARCHAR(300), award_detail TEXT, description TEXT, evidence_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 verification_status VARCHAR(20) NOT NULL DEFAULT 'needs_review' CHECK (verification_status IN ('needs_review','verified')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS activity_items (
 id BIGSERIAL PRIMARY KEY, date_label VARCHAR(100), title VARCHAR(300) NOT NULL, role VARCHAR(300), organization VARCHAR(300), description TEXT, media_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 verification_status VARCHAR(20) NOT NULL DEFAULT 'needs_review' CHECK (verification_status IN ('needs_review','verified')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS press_items (
 id BIGSERIAL PRIMARY KEY, published_date VARCHAR(100), publisher VARCHAR(300), title VARCHAR(500) NOT NULL, article_url TEXT, description TEXT, image_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 verification_status VARCHAR(20) NOT NULL DEFAULT 'needs_review' CHECK (verification_status IN ('needs_review','verified')),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS activity_fields (
 id BIGSERIAL PRIMARY KEY, title VARCHAR(300) NOT NULL, short_description TEXT, description TEXT, image_url TEXT, link_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS works (
 id BIGSERIAL PRIMARY KEY, title VARCHAR(300) NOT NULL, body TEXT, excerpt TEXT, published_date VARCHAR(100), category VARCHAR(100), image_url TEXT, video_url TEXT, audio_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, is_featured BOOLEAN NOT NULL DEFAULT FALSE, sort_order INTEGER NOT NULL DEFAULT 0,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS performances (
 id BIGSERIAL PRIMARY KEY, edition INTEGER, title VARCHAR(300) NOT NULL, subtitle VARCHAR(500), event_date VARCHAR(100), event_time VARCHAR(100), venue VARCHAR(500), host VARCHAR(300), organizer VARCHAR(300), sponsor TEXT, description TEXT, image_url TEXT, poster_url TEXT, invitation_url TEXT,
 is_visible BOOLEAN NOT NULL DEFAULT TRUE, is_featured BOOLEAN NOT NULL DEFAULT FALSE, sort_order INTEGER NOT NULL DEFAULT 0, page_slug VARCHAR(100),
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS performance_programs (
 id BIGSERIAL PRIMARY KEY, performance_id BIGINT NOT NULL REFERENCES performances(id) ON DELETE CASCADE, item_order INTEGER NOT NULL DEFAULT 0, title VARCHAR(300) NOT NULL, work_title VARCHAR(300), performer VARCHAR(300), role VARCHAR(300), description TEXT, is_visible BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS performers (
 id BIGSERIAL PRIMARY KEY, performance_id BIGINT NOT NULL REFERENCES performances(id) ON DELETE CASCADE, name VARCHAR(300) NOT NULL, photo_url TEXT, position_title VARCHAR(300), bio TEXT, work_title VARCHAR(300), role VARCHAR(300), sort_order INTEGER NOT NULL DEFAULT 0, is_visible BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());
CREATE TABLE IF NOT EXISTS performance_media (
 id BIGSERIAL PRIMARY KEY, performance_id BIGINT NOT NULL REFERENCES performances(id) ON DELETE CASCADE, media_type VARCHAR(20) NOT NULL DEFAULT 'image', media_url TEXT NOT NULL, description TEXT, sort_order INTEGER NOT NULL DEFAULT 0, is_visible BOOLEAN NOT NULL DEFAULT TRUE,
 created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW());

INSERT INTO site_content (key, section, label, value) VALUES
 ('activity_section_title','profile','주요 활동 분야 제목','주요 활동 분야'),
 ('activity_section_intro','profile','주요 활동 분야 소개','강해인의 다양한 활동을 만나보세요'),
 ('hide_unverified_profile','profile','확인 전 소개 항목 숨기기','true')
ON CONFLICT (key) DO NOTHING;

INSERT INTO works (title,body,excerpt,published_date,category,sort_order)
SELECT v.* FROM (VALUES
 ('어머니의 봄','어머니의 손등은\n겨울 논밭처럼 거칠지만\n그 손이 얹혀올 때\n내 마음에는 봄이 온다','어머니의 손등은 겨울 논밭처럼 거칠지만…','2020.03 · 시집 「어머니의 봄」 수록','가족',10),
 ('효(孝)','효는 특별한 것이 아니다\n아침마다 드리는 안부 한 마디\n저녁마다 차리는 따뜻한 밥상','효는 특별한 것이 아니다…','2021.05 · 효 콘서트 낭송시','효',20),
 ('낙엽 위의 시','낙엽이 지는 것은\n죽음이 아니라\n새봄을 위한 준비다','낙엽이 지는 것은 죽음이 아니라…','2022.10 · 가을 시낭송 공연','계절',30),
 ('빛의 낭송','소리는 빛을 닮았다\n어둠 속에서 더 멀리 퍼지고\n막힐수록 더 깊이 스민다','소리는 빛을 닮았다…','2023.04 · 시집 「빛의 낭송」 수록','낭송',40),
 ('강은 흐른다','강은 막히면 돌아가고\n돌아가다 모이면 바다가 된다','강은 막히면 돌아가고…','2021.08 · 시낭송 공연 낭송','삶',50),
 ('아버지의 등','아버지는 늘 등으로 말했다\n무거운 짐을 진 등\n구부러진 등','아버지는 늘 등으로 말했다…','2020.06 · 시집 「어머니의 봄」 수록','가족',60),
 ('치유의 시','상처는 아문다\n사실은 사람이 약이다','상처는 아문다…','2023.11 · 시집 「빛의 낭송」 수록','치유',70),
 ('고향의 봄','고향은 멀어질수록\n더 선명해진다','고향은 멀어질수록 더 선명해진다…','2022.03 · 시낭송 발표시','계절',80),
 ('봄비','봄비는 조용히 온다\n떠들지 않고\n자랑하지 않고','봄비는 조용히 온다…','2024.04 · 신작시','계절',90)
) AS v(title,body,excerpt,published_date,category,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM works);

INSERT INTO performances (edition,title,subtitle,event_date,image_url,poster_url,invitation_url,page_slug,sort_order)
SELECT v.* FROM (VALUES
 (1,'제1회 효 콘서트','가을 편지','2023.10','/images/activity-poetry-class.jpg',NULL,NULL,NULL,10),
 (2,'제2회 효 콘서트','어머니의 강','2024.05','/images/mc-field-arts.jpg',NULL,NULL,NULL,20),
 (3,'제3회 효 콘서트','아버님전상서','2025.05.10','/images/concert3-poster.jpg','/images/concert3-poster.jpg','/images/concert3-invite.jpg','concert3.html',30),
 (4,'제4회 효 콘서트','다시, 행복','2026.05.30','/images/concert4-haein-hanbok.jpg',NULL,NULL,'concert4.html',40)
) AS v(edition,title,subtitle,event_date,image_url,poster_url,invitation_url,page_slug,sort_order)
WHERE NOT EXISTS (SELECT 1 FROM performances);

-- 기존 소개 페이지의 임시 문구는 모두 '확인 필요'로 가져옵니다.
INSERT INTO career_items (date_label,title,sort_order)
SELECT v.* FROM (VALUES
 ('2024','대한민국 시낭송 대상 최우수상 수상',10),('2023','시집 『빛의 낭송』 출간 · 출판기념회 개최',20),('2022','전국 순회 시낭송 공연 「효를 읽다」',30),('2021','제10회 효 콘서트 「어머니의 강」 개최',40),('2020','시집 『어머니의 봄』 출간',50),('2019','한국시낭송가협회 정회원 등록',60),('2018','효 콘서트 창립 및 초연',70),('2016','한국문인협회 정회원 등록',80),('2015','문학지 등단(시 부문)',90)
) v(date_label,title,sort_order) WHERE NOT EXISTS (SELECT 1 FROM career_items);
INSERT INTO awards (date_label,title,sort_order)
SELECT v.* FROM (VALUES ('2024','제15회 대한민국 시낭송 대상 최우수상',10),('2023','제12회 전국 시낭송 경연대회 대상',20),('2022','문화체육관광부 장관상(문화예술 공로)',30),('2021','제8회 효 문화 예술제 감사패',40),('2019','한국시낭송가협회 우수 낭송가상',50)) v(date_label,title,sort_order) WHERE NOT EXISTS (SELECT 1 FROM awards);
INSERT INTO activity_items (date_label,title,sort_order)
SELECT v.* FROM (VALUES ('현재','강해인 시낭송교실 운영',10),('현재','전문 MC 활동',20),('현재','이미지 컨설팅',30),('현재','문인·시낭송가 협회 활동',40),('현재','문화예술 특강',50)) v(date_label,title,sort_order) WHERE NOT EXISTS (SELECT 1 FROM activity_items);
INSERT INTO press_items (published_date,publisher,title,sort_order)
SELECT v.* FROM (VALUES ('2024','문화일보','「효를 낭송하는 시인, 강해인」 인터뷰',10),('2023','KBS 1라디오','「문화와 나」 출연',20),('2022','한겨레','「시낭송으로 피어나는 효의 아름다움」 기사',30),('2021','YTN','문화 뉴스 효 콘서트 소개',40),('2020','경향신문','신간 소개 「어머니의 봄」',50)) v(published_date,publisher,title,sort_order) WHERE NOT EXISTS (SELECT 1 FROM press_items);
INSERT INTO activity_fields (title,short_description,image_url,link_url,sort_order)
SELECT v.* FROM (VALUES
 ('전문 MC','품격 있는 진행과 따뜻한 소통','/images/activity-mc.jpg','/pages/mc.html',10),
 ('이미지 컨설턴트','내면과 외면의 조화를 돕는 컨설팅','/images/activity-image-consulting.jpg','/pages/image-consulting.html',20),
 ('시낭송교실','시의 감동을 목소리로 표현하는 배움','/images/activity-poetry-class.jpg','/pages/class.html',30)
) v(title,short_description,image_url,link_url,sort_order) WHERE NOT EXISTS (SELECT 1 FROM activity_fields);

CREATE INDEX IF NOT EXISTS idx_works_public ON works(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_performances_public ON performances(is_visible, sort_order);
CREATE INDEX IF NOT EXISTS idx_program_performance ON performance_programs(performance_id, item_order);
CREATE INDEX IF NOT EXISTS idx_profile_structured ON career_items(is_visible, verification_status, sort_order);
COMMIT;
