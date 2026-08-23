(function () {
  'use strict';

  const state = {
    errors: [],
    brands: new Map(),
    query: '',
    model: '',
    brand: '',
    category: '',
    includeAliases: true,
  };

  const categoryLabels = {
    sensors: 'حساسات',
    compressor: 'ضاغط',
    inverter: 'انفرتر',
    communication: 'اتصال',
    electrical: 'كهرباء',
    mechanical: 'ميكانيكا',
    fan: 'مروحة',
    condenser: 'مكثف',
    pcb: 'لوحة تحكم',
    drainage: 'تصريف',
    freezing: 'تجمّد',
    cooling: 'تبريد',
    heating: 'تدفئة',
    remote: 'ريموت',
    wifi: 'واي فاي',
  };

  const elements = {
    input: document.getElementById('searchInput'),
    model: document.getElementById('modelFilter'),
    brand: document.getElementById('brandFilter'),
    category: document.getElementById('categoryFilter'),
    alias: document.getElementById('aliasToggle'),
    clear: document.getElementById('clearButton'),
    results: document.getElementById('resultsGrid'),
    empty: document.getElementById('emptyState'),
    count: document.getElementById('resultsCount'),
    hint: document.getElementById('resultsHint'),
    status: document.getElementById('dataStatus'),
  };

  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    bindSharedUi();
    bindEvents();
    try {
      const [errorsResponse, brandsResponse] = await Promise.all([
        fetch('data/errors.json'),
        fetch('data/brands.json'),
      ]);
      if (!errorsResponse.ok || !brandsResponse.ok) throw new Error('تعذر الوصول إلى ملفات البيانات');
      state.errors = await errorsResponse.json();
      const brands = await brandsResponse.json();
      brands.forEach((brand) => state.brands.set(brand.id, brand));
      populateFilters();
      setStatus(`تم تحميل ${state.errors.length} سجلًا`, 'ready');
      render();
    } catch (error) {
      console.error(error);
      setStatus('تعذر تحميل قاعدة البيانات', 'error');
      elements.hint.textContent = 'تحقق من تشغيل الصفحة عبر خادم محلي بدل فتحها مباشرة من الملفات.';
      elements.results.innerHTML = '<div class="empty-state"><div class="empty-icon">!</div><h3>حدث خطأ في تحميل البيانات</h3><p>تأكد من وجود data/errors.json وتشغيل الموقع عبر خادم HTTP.</p></div>';
    }
  }

  function bindSharedUi() {
    const themeToggle = document.getElementById('themeToggle');
    const savedTheme = localStorage.getItem('hvac-theme');
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', initialTheme);
    if (themeToggle) {
      themeToggle.textContent = initialTheme === 'dark' ? '☀️' : '🌙';
      themeToggle.addEventListener('click', () => {
        const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nextTheme);
        localStorage.setItem('hvac-theme', nextTheme);
        themeToggle.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
      });
    }

    const menuButton = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileNav');
    const overlay = document.getElementById('mobileOverlay');
    const closeMenu = () => {
      mobileMenu?.classList.remove('open');
      overlay?.classList.remove('open');
      if (menuButton) menuButton.textContent = '☰';
    };
    menuButton?.addEventListener('click', () => {
      const isOpen = mobileMenu?.classList.toggle('open');
      overlay?.classList.toggle('open', Boolean(isOpen));
      menuButton.textContent = isOpen ? '✕' : '☰';
    });
    overlay?.addEventListener('click', closeMenu);
    mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  }

  function bindEvents() {
    elements.input.addEventListener('input', (event) => {
      state.query = event.target.value;
      render();
    });
    elements.model.addEventListener('input', (event) => {
      state.model = event.target.value;
      render();
    });
    elements.brand.addEventListener('change', (event) => {
      state.brand = event.target.value;
      render();
    });
    elements.category.addEventListener('change', (event) => {
      state.category = event.target.value;
      render();
    });
    elements.alias.addEventListener('change', (event) => {
      state.includeAliases = event.target.checked;
      render();
    });
    elements.clear.addEventListener('click', clearFilters);

    document.querySelectorAll('[data-preset]').forEach((button) => {
      button.addEventListener('click', () => {
        state.query = button.dataset.preset;
        elements.input.value = state.query;
        elements.input.focus();
        render();
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement !== elements.input && document.activeElement !== elements.model) {
        event.preventDefault();
        elements.input.focus();
      }
      if (event.key === 'Escape' && document.activeElement === elements.input) {
        clearFilters();
      }
    });
  }

  function populateFilters() {
    [...state.brands.values()]
      .sort((a, b) => (a.nameAr || a.name).localeCompare(b.nameAr || b.name, 'ar'))
      .forEach((brand) => {
        elements.brand.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(brand.id)}">${escapeHtml(brand.nameAr || brand.name)}</option>`);
      });

    [...new Set(state.errors.map((error) => error.category))]
      .sort((a, b) => labelCategory(a).localeCompare(labelCategory(b), 'ar'))
      .forEach((category) => {
        elements.category.insertAdjacentHTML('beforeend', `<option value="${escapeHtml(category)}">${escapeHtml(labelCategory(category))}</option>`);
      });
  }

  function render() {
    const results = getFilteredResults();
    elements.count.textContent = results.length;
    elements.empty.hidden = results.length !== 0;
    elements.results.innerHTML = results.map((error, index) => renderCard(error, index)).join('');
    elements.hint.textContent = state.query || state.model || state.brand || state.category
      ? `المطابقة تشمل ${state.includeAliases ? 'الكود والaliases والنصوص' : 'الكود والنصوص دون aliases'}`
      : 'أدخل كودًا أو كلمة لبدء الاختبار';
    bindResultActions();
  }

  function getFilteredResults() {
    const query = normalizeSearch(state.query);
    const model = normalizeSearch(state.model);
    return state.errors.filter((error) => {
      if (state.brand && error.brandId !== state.brand) return false;
      if (state.category && error.category !== state.category) return false;

      const scopeText = getScopeText(error.modelScope);
      if (model && !scopeText.includes(model)) return false;

      if (!query) return true;
      const searchable = [
        error.code,
        error.titleAr,
        error.titleEn,
        getBrandName(error.brandId),
        ...(error.symptoms || []),
        ...(error.causes || []),
        scopeText,
        ...(state.includeAliases ? (error.aliases || []) : []),
      ].map(normalizeSearch);
      return searchable.some((value) => value.includes(query));
    });
  }

  function renderCard(error, index) {
    const brand = getBrand(error.brandId);
    const scopeData = getScope(error.modelScope);
    const aliases = (error.aliases || []).filter((alias) => alias && alias !== error.code);
    const matchNote = aliases.length && state.query && aliases.some((alias) => normalizeSearch(alias).includes(normalizeSearch(state.query)))
      ? '<span class="scope-tag">مطابقة alias</span>'
      : '';
    const series = scopeData.series.length ? scopeData.series.join('، ') : 'غير محددة؛ راجع دليل الطراز';
    const markets = scopeData.markets.length ? scopeData.markets.join('، ') : 'غير محددة';
    const source = error.sourceUrl || (error.references || []).find((reference) => /^https?:\/\//i.test(reference));

    return `
      <article class="result-card" style="animation-delay:${Math.min(index * 35, 280)}ms">
        <div class="result-card-head">
          <span class="result-code">${escapeHtml(error.code)}</span>
          <span class="result-brand">${escapeHtml(brand?.nameAr || error.brandId)}</span>
        </div>
        <h3>${escapeHtml(error.titleAr)}<span>${escapeHtml(error.titleEn)}</span></h3>
        <p class="result-summary">${escapeHtml((error.symptoms || []).slice(0, 2).join(' • '))}</p>
        ${aliases.length ? `<div class="alias-list" aria-label="مرادفات الكود"><span class="result-brand">aliases:</span>${aliases.map((alias) => `<span class="alias-tag">${escapeHtml(alias)}</span>`).join('')}</div>` : ''}
        <div class="result-meta">
          <span class="scope-tag">${escapeHtml(labelCategory(error.category))}</span>
          <span class="scope-tag">${error.needsTechnician ? 'فني' : 'DIY محتمل'}</span>
          ${matchNote}
        </div>
        <div class="result-model">
          <div><strong>نوع الجهاز:</strong> ${escapeHtml(scopeData.unitType || 'غير محدد')}</div>
          <div><strong>السلاسل:</strong> ${escapeHtml(series)}</div>
          <div><strong>الأسواق:</strong> ${escapeHtml(markets)}</div>
        </div>
        <div class="result-actions">
          <a href="error.html?id=${encodeURIComponent(error.id)}">التفاصيل</a>
          <button type="button" data-copy-code="${escapeHtml(error.code)}">نسخ الكود</button>
          ${source ? `<a href="${escapeHtml(source)}" target="_blank" rel="noopener noreferrer">المصدر</a>` : ''}
        </div>
      </article>`;
  }

  function bindResultActions() {
    document.querySelectorAll('[data-copy-code]').forEach((button) => {
      button.addEventListener('click', async () => {
        const code = button.dataset.copyCode;
        try {
          await navigator.clipboard.writeText(code);
          button.textContent = 'تم النسخ';
          setTimeout(() => { button.textContent = 'نسخ الكود'; }, 1300);
        } catch {
          button.textContent = code;
        }
      });
    });
  }

  function clearFilters() {
    state.query = '';
    state.model = '';
    state.brand = '';
    state.category = '';
    state.includeAliases = true;
    elements.input.value = '';
    elements.model.value = '';
    elements.brand.value = '';
    elements.category.value = '';
    elements.alias.checked = true;
    render();
    elements.input.focus();
  }

  function getBrand(id) { return state.brands.get(id); }
  function getBrandName(id) { return getBrand(id)?.nameAr || id; }
  function labelCategory(category) { return categoryLabels[category] || category || 'غير مصنف'; }

  function getScope(scopeValue) {
    if (scopeValue && typeof scopeValue === 'object') {
      return {
        unitType: scopeValue.unitType || 'غير محدد',
        series: Array.isArray(scopeValue.series) ? scopeValue.series : [],
        markets: Array.isArray(scopeValue.markets) ? scopeValue.markets : [],
        notesAr: scopeValue.notesAr || '',
      };
    }
    return { unitType: 'model-specific', series: [], markets: [], notesAr: scopeValue || '' };
  }

  function getScopeText(scopeValue) {
    const value = getScope(scopeValue);
    return normalizeSearch([value.unitType, ...value.series, ...value.markets, value.notesAr].join(' '));
  }

  function normalizeSearch(value) {
    return String(value || '')
      .toLocaleLowerCase('ar')
      .replace(/[\s\-_/]+/g, '')
      .trim();
  }

  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
  }

  function setStatus(text, status) {
    elements.status.className = `data-status ${status || ''}`;
    elements.status.innerHTML = `<span class="status-dot"></span>${escapeHtml(text)}`;
  }
})();
