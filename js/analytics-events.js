/* Lightweight GA4 interaction events; safe when the tag is blocked or unavailable. */
(function () {
  'use strict';
  function track(name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
  }
  document.addEventListener('click', function (event) {
    const link = event.target.closest('a');
    if (!link) return;
    if (link.hostname && link.hostname !== location.hostname) track('outbound_click', { link_url: link.href, link_text: link.textContent.trim().slice(0, 80) });
    if (link.href.includes('error.html?id=')) track('error_detail_open', { error_url: link.href });
    if (link.href.includes('article.html?id=')) track('article_open', { article_url: link.href });
  });
  document.addEventListener('submit', function (event) { track('form_submit', { form_id: event.target.id || 'unknown' }); });
  const input = document.getElementById('searchInput');
  if (input) {
    let timer;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { if (input.value.trim().length > 1) track('site_search', { search_term: input.value.trim().slice(0, 80) }); }, 700);
    });
  }
})();
