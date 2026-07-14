-- Seed data extracted from kanghaein.com/pages/class.html

INSERT OR REPLACE INTO site_content (key, value) VALUES
  ('hero_label', 'Poetry Recital Class'),
  ('hero_title', '시낭송교실'),
  ('hero_subtitle', '강해인과 함께하는 시낭송의 세계'),
  ('intro_label', '수업 소개'),
  ('intro_title', '시낭송의 아름다움을 함께 나눕니다'),
  ('intro_body1', '강해인 시낭송교실은 시낭송에 관심 있는 분이라면 누구나 참여할 수 있는 열린 교실입니다. 시낭송의 기초 발성부터 감정 표현, 무대 연출까지 체계적인 커리큘럼으로 배웁니다.'),
  ('intro_body2', '초보자도 쉽게 따라올 수 있도록 단계별 수업을 제공하며, 소수 정예로 운영되어 개인에게 맞춤화된 지도를 받을 수 있습니다.'),
  ('stat_cohorts', '6기'),
  ('stat_cohorts_label', '누적 기수'),
  ('stat_graduates', '120+'),
  ('stat_graduates_label', '수료생 수'),
  ('stat_duration', '12주'),
  ('stat_duration_label', '정규 과정'),
  ('stat_capacity', '8명'),
  ('stat_capacity_label', '최대 정원'),
  ('teacher_name', '강해인'),
  ('teacher_title', '시인 · 시낭송가 · 문화예술 강사'),
  ('info_method', '오프라인 (서울) + 온라인 병행'),
  ('info_schedule', '매주 화 · 목요일 오후 2시'),
  ('info_period', '12주 (약 3개월)'),
  ('info_capacity', '회당 최대 8명 (소수 정예)'),
  ('info_fee', '월 15만원 (12주 기준 45만원)'),
  ('info_target', '시낭송에 관심 있는 누구나'),
  ('venue_name', '문학의 집 서울'),
  ('venue_desc', '남산 자락, 문학의 향기가 깃든 공간에서 수업이 진행됩니다. 시와 낭송이 살아 숨 쉬는 문학의 집 서울에서 여러분을 기다립니다.'),
  ('venue_address', '서울 중구 퇴계로 26길 65 (예장동)'),
  ('venue_tel', '02-778-1026'),
  ('venue_url', 'http://www.imhs.co.kr/'),
  ('contact_email', 'haeink72@hanmail.net'),
  ('contact_tel', '010-5064-3805'),
  ('apply_subtitle', '사전 신청을 남겨주시면 안내 드립니다.');

INSERT INTO curriculum (week_range, title, description, sort_order) VALUES
  ('1-2주차', '시낭송의 이해와 기초 발성', '시낭송이란 무엇인가. 올바른 호흡법과 발성의 기초를 배우고, 시의 리듬과 구조를 이해합니다.', 1),
  ('3-4주차', '시의 감정 읽기와 표현', '시 속에 담긴 감정을 이해하고 목소리로 표현하는 방법을 배웁니다. 다양한 시를 낭송하며 감정 표현을 익힙니다.', 2),
  ('5-6주차', '낭송 속도와 쉬어 읽기', '시의 맥락에 맞는 낭송 속도를 조절하는 법, 쉬어 읽기와 강조 기법을 학습합니다.', 3),
  ('7-8주차', '몸짓과 시선 처리', '무대 위에서의 자연스러운 몸짓, 시선 처리, 발 위치 등 무대 매너를 익힙니다.', 4),
  ('9-10주차', '마이크 활용과 음향', '마이크를 사용한 낭송 기법, 공간에 따른 음량 조절, 반주 음악과의 조화를 배웁니다.', 5),
  ('11-12주차', '종합 발표 및 수료', '각자가 준비한 시를 무대에서 발표합니다. 가족과 지인을 초대하는 수료 발표회로 마무리.', 6);

INSERT INTO cohorts (term_label, start_date, end_date, schedule_text, status, capacity, is_current, sort_order) VALUES
  ('7기 (2025 봄)', '2025.03.04', '2025.05.22', '화·목 오후 2시', '모집예정', 8, 1, 1),
  ('6기 (2024 가을)', '2024.09.03', '2024.11.21', '화·목 오후 2시', '마감', 8, 0, 2),
  ('5기 (2024 봄)', '2024.03.05', '2024.05.23', '화·목 오후 2시', '마감', 8, 0, 3),
  ('4기 (2023 가을)', '2023.09.05', '2023.11.23', '화·목 오후 2시', '수료완료', 8, 0, 4),
  ('3기 (2023 봄)', '2023.03.07', '2023.05.25', '화·목 오후 2시', '수료완료', 8, 0, 5);
