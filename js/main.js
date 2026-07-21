/* ============================================
   دليل أعطال أجهزة التكييف - HVAC Error Codes Guide
   Main JavaScript
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // DATA
  // ============================================
  let brands = [];
  let errors = [];
  let currentErrors = [];
  let currentPage = 1;
  const ITEMS_PER_PAGE = 12;

  // ============================================
  // DOM READY
  // ============================================
  document.addEventListener('DOMContentLoaded', init);

  function init() {
    loadData();
    initTheme();
    initHeader();
    initMobileMenu();
    initBackToTop();
    initSearch();
    initAnimations();
  }

  // ============================================
  // LOAD DATA
  // ============================================
  async function loadData() {
    try {
      const [brandsRes, errorsRes] = await Promise.all([
        fetch('data/brands.json'),
        fetch('data/errors.json')
      ]);
      brands = await brandsRes.json();
      errors = await errorsRes.json();
      currentErrors = [...errors];

      // Dispatch event for page-specific handlers
      document.dispatchEvent(new CustomEvent('dataLoaded', { detail: { brands, errors } }));
    } catch (e) {
      console.error('Failed to load data:', e);
    }
  }

  // ============================================
  // THEME
  // ============================================
  function initTheme() {
    const saved = localStorage.getItem('hvac-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = saved || (prefersDark ? 'dark' : 'light');
    setTheme(theme);

    const btn = document.getElementById('themeToggle');
    if (btn) {
      btn.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'dark' ? 'light' : 'dark');
      });
    }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('hvac-theme', theme);
    const btn = document.getElementById('themeToggle');
    if (btn) btn.innerHTML = theme === 'dark' ? '☀️' : '🌙';
  }

  // ============================================
  // HEADER SCROLL
  // ============================================
  function initHeader() {
    const header = document.querySelector('.header');
    if (!header) return;
    window.addEventListener('scroll', () => {
      header.classList.toggle('scrolled', window.scrollY > 20);
    });
  }

  // ============================================
  // MOBILE MENU
  // ============================================
  function initMobileMenu() {
    const btn = document.getElementById('mobileMenuBtn');
    const nav = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');
    if (!btn || !nav) return;

    btn.addEventListener('click', () => {
      nav.classList.toggle('open');
      overlay?.classList.toggle('open');
      btn.innerHTML = nav.classList.contains('open') ? '✕' : '☰';
    });
    overlay?.addEventListener('click', closeMobileMenu);
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMobileMenu));

    function closeMobileMenu() {
      nav.classList.remove('open');
      overlay?.classList.remove('open');
      btn.innerHTML = '☰';
    }
  }

  // ============================================
  // BACK TO TOP
  // ============================================
  function initBackToTop() {
    const btn = document.getElementById('backToTop');
    if (!btn) return;
    window.addEventListener('scroll', () => {
      btn.classList.toggle('visible', window.scrollY > 500);
    });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ============================================
  // SEARCH
  // ============================================
  function initSearch() {
    const input = document.getElementById('searchInput');
    const results = document.getElementById('searchResults');
    if (!input) return;

    let debounceTimer;
    input.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => doSearch(e.target.value), 300);
    });

    input.addEventListener('focus', () => {
      if (input.value.length >= 2) results?.classList.add('active');
    });

    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !results?.contains(e.target)) {
        results?.classList.remove('active');
      }
    });

    function doSearch(query) {
      if (!results) return;
      if (query.length < 2) {
        results.classList.remove('active');
        return;
      }
      const q = query.toLowerCase();
      const matches = errors.filter(e =>
        e.code.toLowerCase().includes(q) ||
        e.titleAr.includes(q) ||
        e.titleEn.toLowerCase().includes(q) ||
        getBrandName(e.brandId).includes(q)
      ).slice(0, 8);

      if (matches.length === 0) {
        results.innerHTML = '<div class="search-result-item"><span>لا توجد نتائج</span></div>';
      } else {
        results.innerHTML = matches.map(e => `
          <a href="error.html?id=${e.id}" class="search-result-item">
            <span class="code">${e.code}</span>
            <div>
              <div class="title">${e.titleAr}</div>
              <div class="brand">${getBrandName(e.brandId)}</div>
            </div>
          </a>
        `).join('');
      }
      results.classList.add('active');
    }
  }

  // ============================================
  // ANIMATIONS
  // ============================================
  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.animationDelay = entry.target.dataset.delay || '0s';
          entry.target.classList.add('animate');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.card, .cat-card, .brand-card, .detail-section').forEach((el, i) => {
      el.dataset.delay = `${i * 0.05}s`;
      observer.observe(el);
    });
  }

  // ============================================
  // HELPERS (Global)

  window.getBrandName = function(id) {
    const b = brands.find(x => x.id === id);
    return b ? b.nameAr : id;
  };

  window.getSeverityLabel = function(sev) {
    const map = { critical: 'حرج', high: 'عالي', medium: 'متوسط', low: 'منخفض' };
    return map[sev] || sev;
  };

  window.getSeverityClass = function(sev) {
    return sev;
  };

  window.getCategoryLabel = function(cat) {
    const map = {
      sensors: 'أعطال الحساسات',
      compressor: 'أعطال الضاغط',
      inverter: 'أعطال الانفرتر',
      communication: 'أعطال الاتصال',
      electrical: 'أعطال كهربائية',
      mechanical: 'أعطال ميكانيكية',
      fan: 'أعطال المروحة',
      condenser: 'أعطال المكثف',
      pcb: 'أعطال PCB',
      drainage: 'أعطال صرف المياه',
      freezing: 'أعطال التجميد',
      cooling: 'ضعف التبريد',
      heating: 'ضعف التدفئة',
      remote: 'أعطال الريموت',
      wifi: 'أعطال الواي فاي'
    };
    return map[cat] || cat;
  };

  window.getCategoryIcon = function(cat) {
    const map = {
      sensors: '🌡️', compressor: '⚙️', inverter: '🔌', communication: '📡',
      electrical: '⚡', mechanical: '🔧', fan: '🌀', condenser: '❄️',
      pcb: '💻', drainage: '💧', freezing: '🧊', cooling: '🥶',
      heating: '🔥', remote: '📱', wifi: '📶'
    };
    return map[cat] || '🔧';
  };

  window.renderStars = function() {
    // Placeholder for rating
    return '⭐⭐⭐⭐⭐';
  };

})();
