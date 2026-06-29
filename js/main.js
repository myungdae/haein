/* ============================================================
   강해인 시낭송 효 콘서트 - Main JavaScript
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // Header Scroll Effect
  // ==========================================
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 50);
    });
  }

  // ==========================================
  // Mobile Menu
  // ==========================================
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const isOpen = mobileMenu.classList.contains('open');
      hamburger.setAttribute('aria-expanded', isOpen);
      hamburger.querySelectorAll('span').forEach((s, i) => {
        if (isOpen) {
          if (i === 0) s.style.transform = 'rotate(45deg) translate(5px, 5px)';
          if (i === 1) s.style.opacity = '0';
          if (i === 2) s.style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
          s.style.transform = '';
          s.style.opacity = '';
        }
      });
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!header.contains(e.target)) {
        mobileMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      }
    });

    // Close menu on link click
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = '';
          s.style.opacity = '';
        });
      });
    });
  }

  // ==========================================
  // Active Nav Link (current page)
  // ==========================================
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-menu a, .mobile-menu a').forEach(link => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });

  // ==========================================
  // Scroll Animations (IntersectionObserver)
  // ==========================================
  const animTargets = document.querySelectorAll('.fade-up, .fade-in');
  if (animTargets.length > 0) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('visible');
          }, (entry.target.dataset.delay || 0));
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    animTargets.forEach(el => observer.observe(el));
  }

  // ==========================================
  // Poem Modal (poems.html)
  // ==========================================
  const poemModalOverlay = document.getElementById('poemModal');
  if (poemModalOverlay) {
    const poemCards = document.querySelectorAll('.poem-card');
    const modalClose = poemModalOverlay.querySelector('.modal-close');

    poemCards.forEach(card => {
      card.addEventListener('click', () => {
        const title = card.dataset.title;
        const text = card.dataset.poem;
        const date = card.dataset.date;

        poemModalOverlay.querySelector('.modal-poem-title').textContent = title;
        poemModalOverlay.querySelector('.modal-poem-text').textContent = text;
        poemModalOverlay.querySelector('.modal-poem-date').textContent = date;
        poemModalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      });
    });

    const closeModal = () => {
      poemModalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    if (modalClose) modalClose.addEventListener('click', closeModal);
    poemModalOverlay.addEventListener('click', (e) => {
      if (e.target === poemModalOverlay) closeModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ==========================================
  // Poem Search (poems.html)
  // ==========================================
  const searchInput = document.getElementById('poemSearch');
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      const q = searchInput.value.trim().toLowerCase();
      document.querySelectorAll('.poem-card').forEach(card => {
        const title = (card.dataset.title || '').toLowerCase();
        const text = (card.dataset.poem || '').toLowerCase();
        card.style.display = (title.includes(q) || text.includes(q)) ? '' : 'none';
      });
    });
  }

  // ==========================================
  // Gallery Lightbox (gallery.html)
  // ==========================================
  const lightboxOverlay = document.getElementById('lightbox');
  if (lightboxOverlay) {
    const galleryItems = document.querySelectorAll('.masonry-item');
    const lightboxImg = lightboxOverlay.querySelector('.lightbox-img');
    const lightboxCaption = lightboxOverlay.querySelector('.lightbox-caption');
    const lightboxClose = lightboxOverlay.querySelector('.lightbox-close');
    const prevBtn = lightboxOverlay.querySelector('.lightbox-prev');
    const nextBtn = lightboxOverlay.querySelector('.lightbox-next');
    let currentIndex = 0;
    let items = [];

    // Filter logic
    const filterBtns = document.querySelectorAll('.gallery-filter .filter-btn');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        galleryItems.forEach(item => {
          if (cat === 'all' || item.dataset.cat === cat) {
            item.style.display = '';
          } else {
            item.style.display = 'none';
          }
        });
        buildItemList();
      });
    });

    const buildItemList = () => {
      items = [...document.querySelectorAll('.masonry-item:not([style*="display: none"])')];
    };

    const openLightbox = (index) => {
      buildItemList();
      currentIndex = index;
      const item = items[currentIndex];
      if (!item) return;
      const img = item.querySelector('img');
      const placeholder = item.querySelector('.gallery-placeholder');
      if (img) {
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightboxCaption.textContent = img.alt || '';
      } else if (placeholder) {
        lightboxImg.src = '';
        lightboxCaption.textContent = placeholder.textContent || '';
      }
      lightboxOverlay.classList.add('open');
      document.body.style.overflow = 'hidden';
    };

    const closeLightbox = () => {
      lightboxOverlay.classList.remove('open');
      document.body.style.overflow = '';
    };

    buildItemList();

    galleryItems.forEach((item, i) => {
      item.addEventListener('click', () => {
        buildItemList();
        const visibleIndex = items.indexOf(item);
        openLightbox(visibleIndex >= 0 ? visibleIndex : 0);
      });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    lightboxOverlay.addEventListener('click', (e) => {
      if (e.target === lightboxOverlay) closeLightbox();
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        openLightbox(currentIndex);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        currentIndex = (currentIndex + 1) % items.length;
        openLightbox(currentIndex);
      });
    }

    document.addEventListener('keydown', (e) => {
      if (!lightboxOverlay.classList.contains('open')) return;
      if (e.key === 'ArrowLeft') prevBtn?.click();
      if (e.key === 'ArrowRight') nextBtn?.click();
      if (e.key === 'Escape') closeLightbox();
    });
  }

  // ==========================================
  // Concert Filter (concert.html)
  // ==========================================
  const concertFilterBtns = document.querySelectorAll('.concert-filter .filter-btn');
  if (concertFilterBtns.length > 0) {
    concertFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        concertFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cat = btn.dataset.cat;
        document.querySelectorAll('.concert-card').forEach(card => {
          if (cat === 'all' || card.dataset.cat === cat) {
            card.style.display = '';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });
  }

  // ==========================================
  // API 서버 설정 (PostgreSQL 연동)
  // ==========================================
  const API_BASE = 'https://haein.exko.kr/api';

  // 공통 전송 함수
  async function sendToAPI(endpoint, payload, btn, successMsg) {
    const original = btn.textContent;
    btn.disabled = true;
    btn.textContent = '전송 중...';

    try {
      const res = await fetch(API_BASE + endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        showNotification(successMsg, 'success');
      } else {
        throw new Error(data.message || '오류가 발생했습니다.');
      }
    } catch (err) {
      console.error('폼 전송 오류:', err);
      showNotification('전송 중 오류가 발생했습니다. 직접 연락 주시면 빠르게 답변 드리겠습니다.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = original;
    }
  }

  // ==========================================
  // Contact Form (contact.html)
  // ==========================================
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = contactForm.querySelector('[name="name"]')?.value.trim();
      const tel     = contactForm.querySelector('[name="tel"]')?.value.trim();
      const email   = contactForm.querySelector('[name="email"]')?.value.trim();
      const type    = contactForm.querySelector('[name="type"]')?.value;
      const org     = contactForm.querySelector('[name="org"]')?.value.trim();
      const message = contactForm.querySelector('[name="message"]')?.value.trim();

      if (!name || !tel) {
        showNotification('이름과 연락처를 입력해 주세요.', 'error');
        return;
      }
      if (!message) {
        showNotification('문의 내용을 입력해 주세요.', 'error');
        return;
      }

      const btn = contactForm.querySelector('[type="submit"]');
      await sendToAPI(
        '/contact',
        { name, tel, email, type, org, message },
        btn,
        '문의가 접수되었습니다. 빠른 시일 내에 답변 드리겠습니다.'
      );
      contactForm.reset();
    });
  }

  // ==========================================
  // Apply Form (class.html)
  // ==========================================
  const applyForm = document.getElementById('applyForm');
  if (applyForm) {
    applyForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name    = applyForm.querySelector('[name="name"]')?.value.trim();
      const tel     = applyForm.querySelector('[name="tel"]')?.value.trim();
      const email   = applyForm.querySelector('[name="email"]')?.value.trim();
      const course  = applyForm.querySelector('[name="course"]')?.value;
      const message = applyForm.querySelector('[name="message"]')?.value.trim();

      if (!name || !tel) {
        showNotification('이름과 연락처를 입력해 주세요.', 'error');
        return;
      }

      const btn = applyForm.querySelector('[type="submit"]');
      await sendToAPI(
        '/apply',
        { name, tel, email, course, message },
        btn,
        '수강 신청이 완료되었습니다. 확인 후 연락 드리겠습니다.'
      );
      applyForm.reset();
    });
  }

  // ==========================================
  // Notification Toast
  // ==========================================
  const showNotification = (message, type = 'success') => {
    const existing = document.querySelector('.notification-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.className = 'notification-toast';
    toast.style.cssText = `
      position: fixed; bottom: 2rem; right: 2rem; z-index: 9999;
      background: ${type === 'success' ? '#3E2723' : '#c62828'};
      color: #FDFAF5; padding: 1rem 1.5rem; border-radius: 4px;
      font-size: 0.9rem; font-family: 'Noto Sans KR', sans-serif;
      box-shadow: 0 8px 30px rgba(0,0,0,0.2);
      transform: translateY(20px); opacity: 0;
      transition: all 0.35s ease; max-width: 380px; line-height: 1.5;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    requestAnimationFrame(() => {
      toast.style.transform = 'translateY(0)';
      toast.style.opacity = '1';
    });

    setTimeout(() => {
      toast.style.transform = 'translateY(20px)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 350);
    }, 4000);
  };

  // ==========================================
  // Smooth anchor scroll
  // ==========================================
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - offset,
          behavior: 'smooth'
        });
      }
    });
  });

});
