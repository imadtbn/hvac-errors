/*
 * HVAC Error Codes — Central analytics, tag, ads, and clarity loader
 *
 * ضع المعرفات الجديدة مكان xxxxxxxx فقط بعد اعتماد الحسابات الجديدة.
 * لا تضع مفاتيح سرية أو رموز OAuth هنا؛ هذه المعرفات عامة بطبيعتها.
 */
(function () {
  'use strict';

  const CONFIG = Object.freeze({
    ga4Id: 'G-K0RNZQ2W00',
    gtmId: 'xxxxxxxx', // ضع هنا معرف حاوية Google Tag Manager مثل GTM-XXXXXXX
    adsenseClient: 'xxxxxxxx', // ضع هنا معرف ناشر AdSense مثل ca-pub-XXXXXXXXXXXXXXXX
    clarityId: 'xxxxxxxx' // ضع هنا معرف مشروع Microsoft Clarity
  });

  const state = window.__hvacSiteTags = window.__hvacSiteTags || {
    started: false,
    sources: {},
    adsScheduled: false
  };

  function configured(value, pattern) {
    return typeof value === 'string' && value.trim() !== '' && !/^x+$/i.test(value.trim()) && (!pattern || pattern.test(value.trim()));
  }

  function hasScript(match) {
    return Array.from(document.scripts).some(script => match.test(script.src || ''));
  }

  function loadScript(src, key) {
    if (state.sources[key]) return state.sources[key];
    const existing = Array.from(document.scripts).find(script => script.src === src || script.dataset.hvacSource === key);
    if (existing) {
      state.sources[key] = Promise.resolve(existing);
      return state.sources[key];
    }
    state.sources[key] = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.async = true;
      script.src = src;
      script.dataset.hvacSource = key;
      script.onload = () => resolve(script);
      script.onerror = reject;
      document.head.appendChild(script);
    });
    return state.sources[key];
  }

  function loadGTM() {
    if (!configured(CONFIG.gtmId, /^GTM-[A-Z0-9]+$/i)) return false;
    window.dataLayer = window.dataLayer || [];
    if (!state.gtmInitialized) {
      window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
      state.gtmInitialized = true;
    }
    if (!hasScript(/googletagmanager\.com\/gtm\.js/)) {
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(CONFIG.gtmId)}`, 'gtm');
    }
    return true;
  }

  function loadGA4Direct() {
    if (!configured(CONFIG.ga4Id, /^G-[A-Z0-9]+$/i) || hasScript(/googletagmanager\.com\/gtag\/js/)) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    if (!state.ga4Initialized) {
      window.gtag('js', new Date());
      window.gtag('config', CONFIG.ga4Id, { anonymize_ip: true });
      state.ga4Initialized = true;
    }
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(CONFIG.ga4Id)}`, 'ga4');
  }

  function loadClarityDirect() {
    if (configured(CONFIG.gtmId, /^GTM-[A-Z0-9]+$/i) || !configured(CONFIG.clarityId, /^[A-Z0-9]+$/i)) return;
    if (!window.clarity) {
      window.clarity = function () { (window.clarity.q = window.clarity.q || []).push(arguments); };
    }
    if (!hasScript(/clarity\.ms\/tag/)) loadScript(`https://www.clarity.ms/tag/${encodeURIComponent(CONFIG.clarityId)}`, 'clarity');
  }

  function scheduleAds() {
    if (state.adsScheduled) return;
    state.adsScheduled = true;
    const run = () => loadAdSense();
    if ('requestIdleCallback' in window) window.requestIdleCallback(run, { timeout: 2500 });
    else window.setTimeout(run, 1200);
  }

  function loadAdSense() {
    const units = Array.from(document.querySelectorAll('ins.adsbygoogle'));
    if (!units.length) return;
    const containers = units.map(unit => unit.closest('.ad-slot')).filter(Boolean);
    if (!configured(CONFIG.adsenseClient, /^ca-pub-[A-Z0-9]+$/i)) {
      containers.forEach(container => { container.dataset.adState = 'disabled'; });
      return;
    }
    units.forEach(unit => {
      if (!unit.dataset.adClient) unit.dataset.adClient = CONFIG.adsenseClient;
      if (!unit.getAttribute('data-ad-client')) unit.setAttribute('data-ad-client', CONFIG.adsenseClient);
    });
    const load = hasScript(/pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/)
      ? Promise.resolve()
      : loadScript(`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(CONFIG.adsenseClient)}`, 'adsense');
    load.then(() => {
      window.adsbygoogle = window.adsbygoogle || [];
      units.forEach(unit => {
        if (unit.dataset.hvacAdQueued === 'true' || unit.getAttribute('data-adsbygoogle-status')) return;
        try {
          window.adsbygoogle.push({});
          unit.dataset.hvacAdQueued = 'true';
          const container = unit.closest('.ad-slot');
          if (container) {
            container.dataset.adState = 'loading';
            container.classList.add('is-active');
          }
        } catch (error) {
          const container = unit.closest('.ad-slot');
          if (container) {
            container.dataset.adState = 'unavailable';
            container.classList.remove('is-active');
          }
          console.warn('AdSense unit could not be initialized:', error);
        }
      });
    }).catch(() => containers.forEach(container => {
      container.dataset.adState = 'unavailable';
      container.classList.remove('is-active');
    }));
  }

  function start() {
    if (state.started) return;
    state.started = true;
    const gtmActive = loadGTM();
    if (!gtmActive) loadGA4Direct();
    loadClarityDirect();
    if (document.querySelector('ins.adsbygoogle')) {
      if (document.readyState === 'complete') scheduleAds();
      else window.addEventListener('load', scheduleAds, { once: true });
    }
  }

  window.HvacSiteTags = { config: CONFIG, start, loadAdSense };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
