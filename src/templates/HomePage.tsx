import type { SiteContent, Cohort, CurriculumItem } from '../lib/db';

const STATUS_LABELS: Record<string, string> = {
  모집예정: '모집예정',
  모집중: '모집중',
  마감: '마감',
  수료완료: '수료완료'
};

function c(content: SiteContent, key: string, fallback = ''): string {
  return content[key] ?? fallback;
}

export function HomePage({
  content,
  cohorts,
  curriculum
}: {
  content: SiteContent;
  cohorts: Cohort[];
  curriculum: CurriculumItem[];
}) {
  const current = cohorts.find((x) => x.is_current === 1) ?? cohorts[0];

  return (
    <>
      {/* ===== App Bar ===== */}
      <header class="appbar">
        <div class="appbar-inner">
          <img class="appbar-logo" src="/icons/icon-96.png" alt="강해인 시낭송교실 로고" />
          <div>
            <div class="appbar-title">강해인 시낭송교실</div>
            <div class="appbar-sub">문학의 집 서울</div>
          </div>
          <div class="appbar-spacer"></div>
          <button id="installChip" class="install-chip">
            <span id="installChipBtn">앱 설치</span>
          </button>
        </div>
      </header>

      {/* ===== Hero ===== */}
      <section class="hero">
        <div class="hero-content container">
          <div class="hero-text-area">
            <span class="hero-sparkle">Poetry Recital Class</span>
            <h1 class="hero-title">{c(content, 'hero_title', '시낭송교실')}</h1>
            <p class="hero-desc">{c(content, 'hero_subtitle')}</p>
            <div class="hero-badges">
              <span class="hero-badge">🎤 소수정예 {c(content, 'stat_capacity', '8명')}</span>
              <span class="hero-badge">📍 남산 · 문학의 집 서울</span>
              {current && <span class="hero-badge">✦ {current.term_label} {STATUS_LABELS[current.status] ?? current.status}</span>}
            </div>
          </div>

          <div class="hero-photos">
            <div class="hero-slider" id="heroSlider">
              <div class="hero-slide active">
                <img class="hero-person-img" src="/images/hero-haein.webp" alt="강해인 시낭송 공연" />
              </div>
              <div class="hero-slide">
                <img class="hero-person-img" src="/images/profile-haein.webp" alt="강해인 프로필" />
              </div>
              <div class="hero-slide">
                <img class="hero-person-img hero-group-img" src="/images/activity-class.jpg" alt="시낭송 수업 현장" />
              </div>

              <div class="hero-photo-badge">
                <span class="badge-kr">강해인</span>
                <span class="badge-en">Poet &amp; Reciter</span>
              </div>

              <div class="hero-slider-dots" aria-label="슬라이드 이동">
                <button class="slider-dot active" data-index="0" aria-label="슬라이드 1"></button>
                <button class="slider-dot" data-index="1" aria-label="슬라이드 2"></button>
                <button class="slider-dot" data-index="2" aria-label="슬라이드 3"></button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main>
        {/* ===== Intro ===== */}
        <section class="section">
          <div class="container">
            <span class="section-label fade-up">{c(content, 'intro_label', '수업 소개')}</span>
            <h2 class="section-title fade-up">{c(content, 'intro_title')}</h2>
            <div class="divider"></div>
            <p class="intro-body fade-up">{c(content, 'intro_body1')}</p>
            <p class="intro-body fade-up">{c(content, 'intro_body2')}</p>

            <div class="stats-row fade-up">
              <div class="stat-box">
                <div class="stat-num">{c(content, 'stat_cohorts', '6기')}</div>
                <div class="stat-label">{c(content, 'stat_cohorts_label', '누적 기수')}</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{c(content, 'stat_graduates', '120+')}</div>
                <div class="stat-label">{c(content, 'stat_graduates_label', '수료생 수')}</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{c(content, 'stat_duration', '12주')}</div>
                <div class="stat-label">{c(content, 'stat_duration_label', '정규 과정')}</div>
              </div>
              <div class="stat-box">
                <div class="stat-num">{c(content, 'stat_capacity', '8명')}</div>
                <div class="stat-label">{c(content, 'stat_capacity_label', '최대 정원')}</div>
              </div>
            </div>

            <div class="teacher-card fade-up">
              <img src="/images/teacher-photo.jpg" alt={c(content, 'teacher_name', '강해인')} />
              <div>
                <div class="teacher-name">{c(content, 'teacher_name', '강해인')}</div>
                <div class="teacher-title">{c(content, 'teacher_title')}</div>
              </div>
            </div>

            <div class="info-card fade-up">
              <div class="info-row">
                <span class="info-key">수업방식</span>
                <span class="info-val">{c(content, 'info_method')}</span>
              </div>
              <div class="info-row">
                <span class="info-key">수업일정</span>
                <span class="info-val">{c(content, 'info_schedule')}</span>
              </div>
              <div class="info-row">
                <span class="info-key">수업기간</span>
                <span class="info-val">{c(content, 'info_period')}</span>
              </div>
              <div class="info-row">
                <span class="info-key">정원</span>
                <span class="info-val">{c(content, 'info_capacity')}</span>
              </div>
              <div class="info-row">
                <span class="info-key">수강료</span>
                <span class="info-val">{c(content, 'info_fee')}</span>
              </div>
              <div class="info-row">
                <span class="info-key">대상</span>
                <span class="info-val">{c(content, 'info_target')}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Venue ===== */}
        <section class="section alt">
          <div class="container">
            <span class="section-label fade-up">Venue</span>
            <h2 class="section-title fade-up">수업 장소</h2>
            <div class="divider"></div>
            <div class="venue-card fade-up">
              <img src="/images/venue-imhs.jpg" alt={c(content, 'venue_name', '문학의 집 서울')} />
              <div class="venue-body">
                <div class="venue-name">{c(content, 'venue_name', '문학의 집 서울')}</div>
                <p class="venue-desc">{c(content, 'venue_desc')}</p>
                <div class="venue-meta">
                  <span>📍 {c(content, 'venue_address')}</span>
                  <span>☎ {c(content, 'venue_tel')}</span>
                  <a href={c(content, 'venue_url', 'http://www.imhs.co.kr/')} target="_blank" rel="noopener noreferrer">
                    문학의 집 서울 홈페이지 바로가기 →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== Curriculum ===== */}
        <section class="section" id="curriculum">
          <div class="container">
            <span class="section-label fade-up">Curriculum</span>
            <h2 class="section-title fade-up">강의 커리큘럼</h2>
            <div class="divider"></div>
            <p class="section-sub fade-up">12주 동안 시낭송의 기초부터 무대 발표까지</p>
            <div class="curr-list">
              {curriculum.map((item) => (
                <div class="curr-item fade-up" key={item.id}>
                  <span class="curr-week">{item.week_range}</span>
                  <div>
                    <div class="curr-title">{item.title}</div>
                    <p class="curr-desc">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Schedule ===== */}
        <section class="section alt" id="schedule">
          <div class="container">
            <span class="section-label fade-up">Schedule</span>
            <h2 class="section-title fade-up">교육 일정</h2>
            <div class="divider"></div>
            <div class="sched-list">
              {cohorts.map((ck) => (
                <div class={`sched-item fade-up ${ck.is_current ? 'current' : ''}`} key={ck.id}>
                  <div>
                    <div class="sched-term">{ck.term_label}</div>
                    <div class="sched-dates">
                      {ck.start_date} ~ {ck.end_date} · {ck.schedule_text}
                    </div>
                  </div>
                  <span class={`sched-status status-${ck.status}`}>{STATUS_LABELS[ck.status] ?? ck.status}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Apply ===== */}
        <section class="section" id="apply">
          <div class="container">
            <span class="section-label fade-up">Apply</span>
            <h2 class="section-title fade-up">수강 신청</h2>
            <div class="divider"></div>
            <p class="section-sub fade-up">{c(content, 'apply_subtitle')}</p>

            <form class="apply-form fade-up" id="applyForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="applyName">이름 *</label>
                  <input type="text" id="applyName" name="name" placeholder="성함" required />
                </div>
                <div class="form-group">
                  <label for="applyTel">연락처 *</label>
                  <input type="tel" id="applyTel" name="tel" placeholder="010-0000-0000" required />
                </div>
              </div>
              <div class="form-group">
                <label for="applyEmail">이메일</label>
                <input type="email" id="applyEmail" name="email" placeholder="이메일 주소" />
              </div>
              <div class="form-group">
                <label for="applyTerm">희망 기수</label>
                <select id="applyTerm" name="term">
                  <option value="">선택해 주세요</option>
                  {current && <option value={current.term_label}>{current.term_label} — {STATUS_LABELS[current.status] ?? current.status}</option>}
                  <option value="미정">미정 (안내만 받고 싶어요)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="applyExp">시낭송 경험</label>
                <select id="applyExp" name="experience">
                  <option value="">선택해 주세요</option>
                  <option value="없음">없음 (완전 처음)</option>
                  <option value="초급">초급</option>
                  <option value="중급">중급</option>
                  <option value="고급">고급 (공연 경험 있음)</option>
                </select>
              </div>
              <div class="form-group">
                <label for="applyMessage">문의 사항</label>
                <textarea id="applyMessage" name="message" placeholder="궁금한 점을 남겨 주세요"></textarea>
              </div>
              <button type="submit" class="btn-submit">수강 신청하기</button>
              <p class="form-msg" id="applyMsg"></p>
            </form>
          </div>
        </section>
      </main>

      {/* ===== Footer ===== */}
      <footer class="footer">
        <div class="container">
          <div class="footer-logo">강해인 시낭송교실</div>
          <div class="footer-line">{c(content, 'contact_email')}</div>
          <div class="footer-line">
            <a href={`tel:${c(content, 'contact_tel')}`}>{c(content, 'contact_tel')}</a>
          </div>
          <div class="footer-copy">© 2026 강해인. All rights reserved.</div>
        </div>
      </footer>

      {/* ===== Install banner ===== */}
      <div class="install-banner" id="installBanner">
        <button class="install-banner-close" id="installBannerClose" aria-label="닫기">✕</button>
        <img src="/icons/icon-96.png" alt="" />
        <div class="install-banner-text">
          <div class="install-banner-title">홈 화면에 앱 추가</div>
          <div class="install-banner-sub">시낭송교실을 앱처럼 바로 열어보세요</div>
        </div>
        <button class="install-banner-btn" id="installBannerBtn">설치</button>
      </div>

      {/* ===== iOS install hint ===== */}
      <div class="install-banner" id="iosInstallHint">
        <button class="install-banner-close" id="iosHintClose" aria-label="닫기">✕</button>
        <img src="/icons/icon-96.png" alt="" />
        <div class="install-banner-text">
          <div class="install-banner-title">홈 화면에 추가하기</div>
          <div class="install-banner-sub">공유 버튼 → "홈 화면에 추가"를 눌러주세요</div>
        </div>
      </div>
    </>
  );
}
