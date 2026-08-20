/*
 * HVAC Errors — Unified AdSense manager
 * Loads ad units only when they approach the viewport, preserving page speed
 * and preventing duplicate pushes during navigation or dynamic rendering.
 */
(function () {
  'use strict';

  const AD_SELECTOR = '.ad-container .adsbygoogle';
  const LOAD_MARGIN = '280px 0px';
  const RETRY_DELAY = 1200;
  const MAX_RETRIES = 4;

  function getContainer(ad) {
    return ad.closest('.ad-container');
  }

  function classify(ad, container) {
    const format = ad.dataset.adFormat || 'auto';
    const layout = ad.dataset.adLayout || '';
    const type = layout === 'in-article' ? 'in-article' : format === 'autorelaxed' ? 'multiplex' : format === 'fluid' ? 'fluid' : 'display';
    container.dataset.adType = type;
    container.dataset.adState = 'waiting';
    container.setAttribute('role', 'complementary');
    container.setAttribute('aria-label', 'إعلان');
  }

  function pushAd(ad, attempt) {
    const container = getContainer(ad);
    if (!container || ad.dataset.adInitialized === 'true') return;

    // AdSense adds this attribute after a successful or rejected request.
    if (ad.getAttribute('data-adsbygoogle-status')) {
      ad.dataset.adInitialized = 'true';
      container.dataset.adState = 'ready';
      return;
    }

    try {
      window.adsbygoogle = window.adsbygoogle || [];
      window.adsbygoogle.push({});
      ad.dataset.adInitialized = 'true';
      container.dataset.adState = 'loading';
    } catch (error) {
      if ((attempt || 0) < MAX_RETRIES) {
        window.setTimeout(function () {
          pushAd(ad, (attempt || 0) + 1);
        }, RETRY_DELAY);
      } else {
        container.dataset.adState = 'unavailable';
        console.warn('AdSense unit could not be initialized:', error);
      }
    }
  }

  function prepare(ad) {
    const container = getContainer(ad);
    if (!container || ad.dataset.adPrepared === 'true') return;
    ad.dataset.adPrepared = 'true';
    classify(ad, container);
  }

  function init() {
    const ads = Array.from(document.querySelectorAll(AD_SELECTOR));
    if (!ads.length) return;

    ads.forEach(prepare);

    if (!('IntersectionObserver' in window)) {
      ads.forEach(function (ad) { pushAd(ad); });
      return;
    }

    const observer = new IntersectionObserver(function (entries, currentObserver) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        pushAd(entry.target);
        currentObserver.unobserve(entry.target);
      });
    }, { rootMargin: LOAD_MARGIN, threshold: 0.01 });

    ads.forEach(function (ad) {
      observer.observe(ad);
    });

    // Re-scan only when the DOM actually receives new ad units.
    const mutationObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (!(node instanceof Element)) return;
          const newAds = node.matches(AD_SELECTOR) ? [node] : Array.from(node.querySelectorAll(AD_SELECTOR));
          newAds.forEach(function (ad) {
            prepare(ad);
            observer.observe(ad);
          });
        });
      });
    });
    mutationObserver.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
