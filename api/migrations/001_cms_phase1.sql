-- HAEIN CMS Phase 1
-- 기존 테이블은 변경하거나 삭제하지 않고 CMS용 콘텐츠 테이블만 추가합니다.

CREATE TABLE IF NOT EXISTS site_content (
  key         VARCHAR(100) PRIMARY KEY,
  section     VARCHAR(50)  NOT NULL,
  label       VARCHAR(100) NOT NULL,
  value       TEXT         NOT NULL DEFAULT '',
  updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_site_content_section
  ON site_content(section, key);

-- 현재 공개 HTML의 내용을 초기값으로 보존합니다.
-- ON CONFLICT DO NOTHING으로 운영자가 이미 수정한 값은 덮어쓰지 않습니다.
INSERT INTO site_content (key, section, label, value) VALUES
  ('profile_image', 'profile', '프로필 사진', '/images/haein-trench-nobg.png?v=20260606'),
  ('profile_tagline', 'profile', '한 줄 소개', '따뜻한 미소와 아름다운 목소리로 사람들의 마음을 편안하게 하는 사람… 이나 강해인'),
  ('profile_heading', 'profile', '소개 제목', E'시로 마음을 잇고\n낭송으로 감동을 전합니다'),
  ('profile_intro_1', 'profile', '자기소개 첫 번째 문단', '강해인은 시인이자 시낭송가로, 시와 낭송을 통해 사람들의 마음에 따뜻한 치유와 감동을 전하는 문화예술인입니다. 특히 부모님에 대한 사랑과 효(孝)의 가치를 시낭송으로 승화시킨 「효 콘서트」를 기획하고 이끌며, 우리 사회에 잊혀 가는 효의 아름다움을 되새기게 하는 데 힘쓰고 있습니다.'),
  ('profile_intro_2', 'profile', '자기소개 두 번째 문단', '시집 『어머니의 봄』, 『빛의 낭송』 등을 출간하였으며, 전국 각지에서 시낭송 공연과 문화예술 강의를 통해 수만 명의 관객과 수강생들을 만나왔습니다. 전문 MC로서 품격 있는 진행 역량과, 이미지 컨설팅을 통한 내면과 외면의 조화를 추구하며 "시는 삶의 가장 아름다운 고백"이라는 신념으로 활동하고 있습니다.'),
  ('profile_roles', 'profile', '현재 활동', E'시인\n시낭송가\n전문 MC\n이미지 컨설턴트\n효 콘서트 기획자\n문화예술 강사'),

  ('hero_tag', 'hero', '이름 표기', '강해인 · Kang Haein'),
  ('hero_title_1', 'hero', '메인 문구 첫 줄', '시로 마음을 잇고'),
  ('hero_title_2', 'hero', '메인 문구 둘째 줄', '낭송으로 감동을 전합니다'),
  ('hero_subtitle', 'hero', '영문 보조 문구', 'Poetry Recital · Hyo Concert · Healing Stage'),

  ('contact_banner_title', 'contact', '문의 화면 제목', E'함께 만들어가는\n감동의 무대'),
  ('contact_banner_services', 'contact', '주요 서비스', E'시낭송 · 효 콘서트 · 전문 MC\n이미지 컨설팅 · 문화예술 특강'),
  ('contact_intro', 'contact', '문의 안내', '효 콘서트, 시낭송 공연, 문화예술 강의, 기업·기관 특강 등 다양한 형태의 공연과 교육 프로그램을 기획합니다. 문의를 남겨주시면 빠른 시일 내에 연락 드리겠습니다.'),
  ('contact_email', 'contact', '이메일', 'haeink72@hanmail.net'),
  ('contact_tel', 'contact', '전화번호', '010-5064-3805'),
  ('contact_hours', 'contact', '운영시간', '평일 오전 10시 – 오후 6시'),
  ('contact_address', 'contact', '주소', '서울특별시 종로구 인사동 (구체 주소 추후 안내)'),
  ('contact_youtube', 'contact', '유튜브 주소', 'https://www.youtube.com/@%EA%B0%95%ED%95%B4%EC%9D%B8-m4n'),
  ('contact_instagram', 'contact', '인스타그램 주소', ''),
  ('contact_facebook', 'contact', '페이스북 주소', 'https://www.facebook.com/jiang.hai.ren.100506?locale=ko_KR'),
  ('contact_blog', 'contact', '블로그 주소', ''),

  ('class_title', 'class', '수업 소개 제목', E'시낭송의 아름다움을\n함께 나눕니다'),
  ('class_intro_1', 'class', '수업 소개 첫 번째 문단', '강해인 시낭송교실은 시낭송에 관심 있는 분이라면 누구나 참여할 수 있는 열린 교실입니다. 시낭송의 기초 발성부터 감정 표현, 무대 연출까지 체계적인 커리큘럼으로 배웁니다.'),
  ('class_intro_2', 'class', '수업 소개 두 번째 문단', '초보자도 쉽게 따라올 수 있도록 단계별 수업을 제공하며, 소수 정예로 운영되어 개인에게 맞춤화된 지도를 받을 수 있습니다.'),
  ('class_stat_cohorts', 'class', '누적 기수', '6기'),
  ('class_stat_graduates', 'class', '수료생 수', '120+'),
  ('class_stat_duration', 'class', '정규 과정', '12주'),
  ('class_stat_capacity', 'class', '최대 정원', '8명'),
  ('class_teacher_image', 'class', '강사 사진', '/images/gallery/daily-07-lecture.jpg?v=20260701'),
  ('class_teacher_name', 'class', '강사 이름', '강해인'),
  ('class_teacher_title', 'class', '강사 소개', '시인 · 시낭송가 · 문화예술 강사'),
  ('class_method', 'class', '수업 방식', '오프라인 (서울) + 온라인 병행'),
  ('class_schedule', 'class', '수업 일정', '매주 화 · 목요일 오후 2시'),
  ('class_period', 'class', '수업 기간', '12주 (약 3개월)'),
  ('class_capacity', 'class', '정원', '회당 최대 8명 (소수 정예)'),
  ('class_fee', 'class', '수강료', '월 15만원 (12주 기준 45만원)'),
  ('class_target', 'class', '대상', '시낭송에 관심 있는 누구나')
ON CONFLICT (key) DO NOTHING;

