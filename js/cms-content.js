/* 공개 페이지용 CMS 콘텐츠 로더. API 실패 시 기존 HTML을 그대로 유지합니다. */
(function () {
  'use strict';

  function setLines(element, value) {
    element.replaceChildren();
    String(value).split('\n').forEach(function (line, index) {
      if (index) element.appendChild(document.createElement('br'));
      element.appendChild(document.createTextNode(line));
    });
  }

  function applyContent(content) {
    document.querySelectorAll('[data-cms]').forEach(function (element) {
      var key = element.dataset.cms;
      if (!Object.prototype.hasOwnProperty.call(content, key)) return;
      var value = content[key];
      if (element.dataset.cmsAttr) {
        element.setAttribute(element.dataset.cmsAttr, value);
      } else if (element.dataset.cmsLines !== undefined) {
        setLines(element, value);
      } else {
        element.textContent = value;
      }
    });

    var roles = document.querySelector('[data-cms-roles]');
    if (roles && Object.prototype.hasOwnProperty.call(content, 'profile_roles')) {
      roles.replaceChildren();
      content.profile_roles.split('\n').map(function (item) { return item.trim(); }).filter(Boolean).forEach(function (role) {
        var badge = document.createElement('span');
        badge.className = 'role-badge';
        badge.textContent = role;
        roles.appendChild(badge);
      });
    }

    if (content.contact_email !== undefined) {
      document.querySelectorAll('a[href^="mailto:"]').forEach(function (link) {
        link.href = 'mailto:' + content.contact_email;
        if (!link.dataset.keepLabel) link.textContent = content.contact_email;
      });
    }
    if (content.contact_tel !== undefined) {
      document.querySelectorAll('a[href^="tel:"]').forEach(function (link) {
        link.href = 'tel:' + content.contact_tel.replace(/\s/g, '');
        if (!link.dataset.keepLabel) link.textContent = content.contact_tel;
      });
    }
    document.querySelectorAll('[data-cms-social]').forEach(function (link) {
      var value = content[link.dataset.cmsSocial];
      if (value === undefined) return;
      link.href = value || '#';
      link.hidden = !value;
    });
  }

  var controller = new AbortController();
  var timer = setTimeout(function () { controller.abort(); }, 3000);
  fetch('/api/cms/content', { signal: controller.signal, headers: { Accept: 'application/json' } })
    .then(function (response) { if (!response.ok) throw new Error('CMS unavailable'); return response.json(); })
    .then(function (data) { if (data.ok && data.content) applyContent(data.content); })
    .catch(function () { /* 의도적으로 기존 HTML fallback 유지 */ })
    .finally(function () { clearTimeout(timer); });
})();
