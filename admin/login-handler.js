'use strict';

(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory;
  else root.createAdminLoginHandler = factory;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAdminLoginHandler(deps) {
  return async function handleAdminLogin(event) {
    // Event.currentTarget은 await 이후 null이 될 수 있으므로 즉시 실제 폼을 보존합니다.
    const formElement = event.currentTarget;
    event.preventDefault();
    if (deps.beginAuthTransition) deps.beginAuthTransition();
    deps.clearMessage();
    const formData = new FormData(formElement);

    try {
      await deps.api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify(Object.fromEntries(formData))
      });
      deps.showCms();
      formElement.reset();
      try {
        await deps.loadContent();
      } catch (err) {
        if (deps.showDashboardError) deps.showDashboardError(err.message);
      }
    } catch (err) {
      deps.showError(err.message);
    }
  };
});
