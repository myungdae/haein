// 강해인 시낭송교실 PWA — client behavior
(function () {
  'use strict';

  // ---- Service worker registration ----
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {});
    });
  }

  // ---- Install prompt (Android/Chrome) ----
  let deferredPrompt = null;
  const banner = document.getElementById('installBanner');
  const chip = document.getElementById('installChip');
  const btnInstall = document.getElementById('installBannerBtn');
  const btnClose = document.getElementById('installBannerClose');
  const chipInstall = document.getElementById('installChipBtn');

  function isStandalone() {
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true
    );
  }

  function showInstallUI() {
    if (isStandalone()) return;
    if (sessionStorage.getItem('installDismissed') === '1') {
      if (chip) chip.classList.add('show');
      return;
    }
    if (banner) banner.classList.add('show');
    if (chip) chip.classList.add('show');
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallUI();
  });

  async function doInstall() {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (banner) banner.classList.remove('show');
    if (chip) chip.classList.remove('show');
  }

  if (btnInstall) btnInstall.addEventListener('click', doInstall);
  if (chipInstall) chipInstall.addEventListener('click', doInstall);
  if (btnClose)
    btnClose.addEventListener('click', () => {
      if (banner) banner.classList.remove('show');
      sessionStorage.setItem('installDismissed', '1');
    });

  window.addEventListener('appinstalled', () => {
    if (banner) banner.classList.remove('show');
    if (chip) chip.classList.remove('show');
  });

  // iOS Safari: no beforeinstallprompt — show a gentle hint banner once.
  const isIos = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  if (isIos && !isStandalone() && !sessionStorage.getItem('iosHintShown')) {
    const iosBanner = document.getElementById('iosInstallHint');
    if (iosBanner) {
      iosBanner.classList.add('show');
      sessionStorage.setItem('iosHintShown', '1');
      const closeBtn = document.getElementById('iosHintClose');
      if (closeBtn) closeBtn.addEventListener('click', () => iosBanner.classList.remove('show'));
    }
  }

  // ---- Apply form submission ----
  const form = document.getElementById('applyForm');
  if (form) {
    const msg = document.getElementById('applyMsg');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const data = {
        name: form.name.value.trim(),
        tel: form.tel.value.trim(),
        email: form.email.value.trim(),
        term: form.term.value,
        experience: form.experience.value,
        message: form.message.value.trim()
      };
      if (!data.name || !data.tel) {
        showMsg('이름과 연락처를 입력해 주세요.', false);
        return;
      }
      submitBtn.disabled = true;
      submitBtn.textContent = '접수 중...';
      try {
        const res = await fetch('/api/apply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        const json = await res.json();
        if (json.ok) {
          showMsg('신청이 완료되었습니다. 곧 연락드리겠습니다 :)', true);
          form.reset();
        } else {
          showMsg(json.error || '신청 중 오류가 발생했습니다. 다시 시도해 주세요.', false);
        }
      } catch (err) {
        showMsg('네트워크 오류입니다. 잠시 후 다시 시도해 주세요.', false);
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = '수강 신청하기';
      }
    });

    function showMsg(text, ok) {
      if (!msg) return;
      msg.textContent = text;
      msg.className = 'form-msg show ' + (ok ? 'ok' : 'err');
    }
  }
})();
