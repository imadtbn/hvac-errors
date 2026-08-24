/* HVAC Errors — shared UX, bilingual content, article imagery and SEO helpers */
(function () {
  'use strict';

  const SITE = 'https://imadtbn.github.io/hvac-errors/';
  const urlLang = new URLSearchParams(location.search).get('lang');
  const state = { lang: urlLang === 'en' || urlLang === 'ar' ? urlLang : (localStorage.getItem('hvac-lang') || 'ar'), brands: [], errors: [], articles: [], errorsEn: [], articlesEn: [], uiEn: {} };
  const common = {
    'الرئيسية': 'Home', 'الأعطال': 'Error Codes', 'الماركات': 'Brands', 'المقالات': 'Articles', 'عن الموقع': 'About', 'اتصل بنا': 'Contact',
    'الأسئلة الشائعة': 'FAQ', 'سياسة الخصوصية': 'Privacy Policy', 'إخلاء المسؤولية': 'Disclaimer', 'روابط الموقع': 'Site Links', 'معلومات قانونية': 'Legal', 'تواصل معنا': 'Contact us',
    'دليل أعطال التكييف': 'HVAC Error Codes Guide', 'دليل أعطال أجهزة التكييف المنزلية': 'Residential HVAC Error Codes Guide',
    'أكبر مرجع عربي متخصص': 'A practical HVAC reference', 'تصنيفات الأعطال': 'Error categories', 'تصفح الأعطال حسب نوع المشكلة': 'Browse faults by problem type',
    'آخر الأعطال المسجلة': 'Latest error codes', 'أحدث الأعطال التي تمت إضافتها إلى قاعدة البيانات': 'The latest additions to the database',
    'الماركات المدعومة': 'Supported brands', 'ابحث عن أعطال جهازك حسب الماركة': 'Find codes by manufacturer', 'جميع الماركات': 'All brands',
    'لماذا دليل أعطال التكييف؟': 'Why this HVAC guide?', 'كل ما تحتاجه لفهم وإصلاح أعطال جهاز التكييف': 'Everything you need to understand and service an air conditioner',
    'بحث ذكي': 'Smart search', 'تقييم الخطورة': 'Safety-first guidance', 'خطوات الإصلاح': 'Repair steps', 'مراجع رسمية': 'Official references',
    'تنبيه هام': 'Important safety note', 'المقال غير موجود': 'Article not found', 'العطل غير موجود': 'Error code not found',
    'العودة للمقالات': 'Back to articles', 'العودة لقائمة الأعطال': 'Back to error codes', 'المراجع العلمية': 'Technical references',
    'الأعراض': 'Symptoms', 'الأسباب المحتملة': 'Possible causes', 'القطع المحتملة المتضررة': 'Potentially affected parts', 'خطوات الفحص': 'Inspection steps', 'خطوات الإصلاح': 'Repair steps', 'الأدوات المطلوبة': 'Required tools',
    'معلومات سريعة': 'Quick facts', 'الماركة': 'Brand', 'رمز الخطأ': 'Error code', 'التصنيف': 'Category', 'الخطورة': 'Severity', 'المدة': 'Time', 'التكلفة': 'Estimated cost', 'يحتاج فني؟': 'Technician required?', 'يمكن DIY؟': 'DIY possible?',
    'نعم': 'Yes', 'لا': 'No', 'فني': 'Technician', 'عطل مسجل': 'Recorded faults', 'ماركة': 'Brands', 'تصنيف': 'Categories', 'مختبر البحث': 'Search Lab', 'مختبر البحث في الأكواد': 'Error Code Search Lab', 'أداة اختبار JSON': 'JSON test tool', 'اختبر البحث بالكود الأساسي أو المرادفات أو الماركة والطراز، وتحقق من نطاق كل نتيجة قبل اعتمادها.': 'Test searches by canonical code, alias, brand, and model, then verify each result scope before relying on it.', 'ابحث داخل': 'Search inside', 'تتم المطابقة مباشرة في المتصفح، وتشمل المرادفات عند تفعيل الخيار أدناه.': 'Matching runs directly in your browser and includes aliases when enabled below.', 'اختصارات البحث': 'Search shortcuts', 'تصفية حسب الماركة': 'Filter by brand', 'تصفية حسب التصنيف': 'Filter by category',
    'مقالات تعليمية متخصصة في صيانة أجهزة التكييف المنزلية': 'Practical articles about residential air-conditioner maintenance',
    'اعرف معنى رمز الخطأ، سبب العطل، القطعة المتسببة، وخطوات الإصلاح لأكثر من 30 ماركة عالمية': 'Understand the error code, likely cause, affected part, and repair steps for more than 30 global brands',
    'ابحث برمز الخطأ، اسم العطل، أو الماركة...': 'Search by error code, fault name, or brand...',
    'عطل مسجل': 'Recorded faults', 'أكبر مرجع عربي لأعطال أجهزة التكييف المنزلية. نقدم شرحاً مفصلاً لأكواد الأخطاء، أسباب العطل، وخطوات الإصلاح بناءً على كتيبات الشركات المصنعة الرسمية.': 'A practical reference for air-conditioner faults, with code explanations, causes, repair steps, and official manufacturer references.',
    'نعرض لك مستوى خطورة كل عطل وهل يحتاج فنياً أم يمكنك إصلاحه بنفسك': 'See the risk level and whether a qualified technician is required.',
    'ابحث برمز الخطأ أو اسم العطل أو الماركة وستجد النتيجة فوراً': 'Search by code, fault name, or brand and find the right record quickly.',
    'خطوات فحص وإصلاح مفصلة مع الأدوات المطلوبة والتكلفة التقريبية': 'Detailed inspection and repair steps with required tools and an indicative cost.',
    'جميع البيانات مبنية على كتيبات Service Manuals الرسمية من الشركات المصنعة': 'Records are grounded in official manufacturer manuals and support pages.',
    'هذا الموقع تعليمي فقط ولا يغني عن الفحص الفني. بعض الأعطال تتطلب فنياً معتمداً. لا تقم بأي إصلاحات كهربائية إذا لم تكن مؤهلاً.': 'This website is educational and does not replace professional inspection. Some faults require a qualified technician. Do not perform electrical repairs unless you are trained.',
    'دليلك الشامل لفهم أجهزة التكييف وصيانتها': 'A practical guide to understanding and maintaining air conditioners',
    'أكبر مرجع عربي لأعطال أجهزة التكييف المنزلية': 'A practical reference for residential air-conditioner faults',
    'اتصل بنا': 'Contact us', 'إرسال': 'Send', 'بحث': 'Search', 'الكل': 'All', 'تعليمي': 'Educational', 'صيانة': 'Maintenance', 'تقنية': 'Technical', 'نصائح': 'Tips'
  };
  const englishAlts = {
    a001: 'Editorial illustration of an air conditioner display showing an error code and diagnostic tools',
    a002: 'Editorial illustration of inverter compressor control waves',
    a003: 'Editorial illustration of a refrigerant drop representing a charging cycle',
    a004: 'Editorial illustration of cleaning and maintaining an indoor air conditioner',
    a005: 'Editorial illustration of the refrigeration cycle stages',
    a006: 'Editorial illustration of energy-efficient air conditioner operation',
    a007: 'Editorial illustration of a temperature sensor and thermistor testing',
    a008: 'Editorial illustration of an evaporator freeze-up crystal'
  };
  const categories = { sensors: 'Sensors', compressor: 'Compressor', inverter: 'Inverter', communication: 'Communication', electrical: 'Electrical', mechanical: 'Mechanical', fan: 'Fan', condenser: 'Condenser', pcb: 'PCB', drainage: 'Drainage', freezing: 'Freezing', cooling: 'Cooling', heating: 'Heating', remote: 'Remote', wifi: 'Wi-Fi' };
  const severities = { critical: 'Critical', high: 'High', medium: 'Medium', low: 'Low' };

  function normalize(value) { return String(value || '').toLowerCase().replace(/[\s\-/]/g, ''); }
  function esc(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c])); }
  function localizedError(error) { return state.lang === 'en' ? (state.errorsEn.find(x => x.id === error.id) || error) : error; }
  function localizedArticle(article) { return state.lang === 'en' ? (state.articlesEn.find(x => x.id === article.id) || article) : article; }
  function brandName(id) { const brand = state.brands.find(x => x.id === id); return state.lang === 'en' ? (brand?.name || id) : (brand?.nameAr || id); }
  function categoryLabel(cat) { return state.lang === 'en' ? (categories[cat] || cat) : (window.getCategoryLabel ? window.getCategoryLabel(cat) : cat); }
  function severityLabel(sev) { return state.lang === 'en' ? (severities[sev] || sev) : (window.getSeverityLabel ? window.getSeverityLabel(sev) : sev); }
  function errorField(error, key) { const en = localizedError(error); const suffix = key + 'En'; return state.lang === 'en' && en[suffix] ? en[suffix] : error[key]; }
  function durationLabel(value) { return state.lang === 'en' ? String(value || '').replace(/دقيقة/g, 'minutes').replace(/ساعة/g, 'hour').replace(/ساعات/g, 'hours') : value; }
  function costLabel(value) { return state.lang === 'en' ? String(value || '').replace(/دج/g, 'DZD') : value; }

  window.HvacI18n = { state, normalize, esc, localizedError, localizedArticle, brandName, categoryLabel, severityLabel, errorField, apply: applyLanguage };
  window.getBrandName = brandName;
  window.getCategoryLabel = categoryLabel;
  window.getSeverityLabel = severityLabel;

  function languageUrl(lang) {
    const url = new URL(location.href);
    url.searchParams.set('lang', lang);
    return url.href;
  }

  function installAlternateLinks() {
    ['ar', 'en'].forEach(lang => {
      const rel = `alternate-${lang}`;
      let link = document.head.querySelector(`link[data-hreflang="${lang}"], link[data-static-hreflang="${lang}"]`);
      if (!link) { link = document.createElement('link'); link.rel = 'alternate'; link.dataset.hreflang = lang; document.head.appendChild(link); }
      link.hreflang = lang;
      link.href = languageUrl(lang);
    });
    let fallback = document.head.querySelector('link[data-hreflang="x-default"], link[data-static-hreflang="x-default"]');
    if (!fallback) { fallback = document.createElement('link'); fallback.rel = 'alternate'; fallback.dataset.hreflang = 'x-default'; document.head.appendChild(fallback); }
    fallback.hreflang = 'x-default'; fallback.href = languageUrl('ar');
  }

  function addLanguageToggle() {
    const actions = document.querySelector('.header-actions');
    if (!actions || document.getElementById('languageToggle')) return;
    const button = document.createElement('button');
    button.className = 'btn-icon language-toggle';
    button.id = 'languageToggle';
    button.type = 'button';
    button.addEventListener('click', () => applyLanguage(state.lang === 'ar' ? 'en' : 'ar'));
    actions.insertBefore(button, actions.firstChild);
  }

  function translateStaticText() {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => {
      if (node.parentElement.closest('script,style,code,pre,h1,[data-no-translate]')) return;
      const raw = node.nodeValue.trim();
      if (!raw) return;
      if (state.lang === 'en' && (state.uiEn[raw] || common[raw])) node.nodeValue = node.nodeValue.replace(raw, state.uiEn[raw] || common[raw]);
      if (state.lang === 'ar') {
        const original = Object.keys(state.uiEn).find(key => state.uiEn[key] === raw) || Object.keys(common).find(key => common[key] === raw);
        if (original) node.nodeValue = node.nodeValue.replace(raw, original);
      }
    });
    document.querySelectorAll('p,h2,h3,h4,a,button,label,span').forEach(el => {
      if (el.children.length || el.closest('h1')) return;
      const raw = el.textContent.trim();
      if (state.lang === 'en' && (state.uiEn[raw] || common[raw])) el.textContent = state.uiEn[raw] || common[raw];
      if (state.lang === 'ar') {
        const original = Object.keys(state.uiEn).find(key => state.uiEn[key] === raw) || Object.keys(common).find(key => common[key] === raw);
        if (original) el.textContent = original;
      }
    });
    document.querySelectorAll('[data-lang-ar][data-lang-en]').forEach(el => { el.textContent = state.lang === 'en' ? el.dataset.langEn : el.dataset.langAr; });
  }

  function translateShell() {
    document.documentElement.lang = state.lang;
    document.documentElement.dir = state.lang === 'en' ? 'ltr' : 'rtl';
    document.documentElement.dataset.language = state.lang;
    document.body.classList.toggle('lang-en', state.lang === 'en');
    const toggle = document.getElementById('languageToggle');
    if (toggle) { toggle.textContent = state.lang === 'en' ? 'ع' : 'EN'; toggle.title = state.lang === 'en' ? 'Switch to Arabic' : 'Switch to English'; toggle.setAttribute('aria-label', toggle.title); }
    translateStaticText();
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.placeholder = state.lang === 'en' ? 'Search by error code, fault name, or brand...' : 'ابحث برمز الخطأ، اسم العطل، أو الماركة...';
    const advancedSearchInput = document.getElementById('advancedSearchInput');
    if (advancedSearchInput) advancedSearchInput.placeholder = state.lang === 'en' ? 'Search by error code, fault name, brand, or part...' : 'ابحث برمز الخطأ، اسم العطل، الماركة، أو القطعة...';
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.title = state.lang === 'en' ? 'Toggle theme' : 'تبديل الوضع';
    document.querySelectorAll('.warning-box p').forEach(el => { if (state.lang === 'en') el.textContent = 'This website is educational and does not replace professional inspection. Some faults require a qualified technician. Do not perform electrical repairs unless you are trained.'; });
    document.querySelectorAll('.footer-grid > div:first-child p').forEach(el => { if (state.lang === 'en') el.textContent = 'A practical reference for air-conditioner faults, with code explanations, causes, repair steps, and official manufacturer references.'; });
    document.querySelectorAll('.footer-bottom p').forEach(el => { if (state.lang === 'en') el.innerHTML = '© 2024 HVAC Error Codes Guide. All rights reserved. | <a href="privacy.html" style="display:inline;">Privacy Policy</a> | <a href="disclaimer.html" style="display:inline;">Disclaimer</a>'; });
    const page = location.pathname.split('/').pop() || 'index.html';
    const titles = { 'index.html': ['HVAC Error Codes Guide | Residential Air Conditioners', 'Search verified HVAC error codes, symptoms, checks and repair guidance by brand.'], 'articles.html': ['HVAC Maintenance Articles | HVAC Error Codes Guide', 'Practical HVAC articles about error codes, maintenance, refrigerant, inverter systems and energy saving.'], 'errors.html': ['Air Conditioner Error Codes by Brand | HVAC Error Codes Guide', 'Search air conditioner error codes by brand, category and model scope.'], 'brands.html': ['Supported Air Conditioner Brands | HVAC Error Codes Guide', 'Browse supported air-conditioner brands and verified error-code references.'], 'about.html': ['About the HVAC Error Codes Guide', 'Learn about the mission, sources and safety principles behind this HVAC reference.'], 'contact.html': ['Contact the HVAC Error Codes Guide', 'Send questions, corrections and suggestions to the HVAC Error Codes Guide team.'], 'faq.html': ['HVAC Error Codes FAQ', 'Answers to common questions about air-conditioner codes, diagnosis and safe servicing.'], 'privacy.html': ['Privacy Policy | HVAC Error Codes Guide', 'Read how this website uses cookies, advertising and analytics.'], 'disclaimer.html': ['Safety Disclaimer | HVAC Error Codes Guide', 'Important limitations and safety guidance for using HVAC error-code information.'], 'search.html': ['Search Air Conditioner Error Codes | HVAC Error Codes Guide', 'Search HVAC error codes by code, brand, fault name and affected component.'] };
    if (state.lang === 'en' && titles[page]) { document.title = titles[page][0]; setMeta('description', titles[page][1]); setMetaProperty('og:locale', 'en_US'); }
    if (state.lang === 'ar') setMetaProperty('og:locale', 'ar');
  }
  function setMeta(name, content) { const el = document.querySelector(`meta[name="${name}"]`); if (el) el.content = content; }
  function setMetaProperty(property, content) { const el = document.querySelector(`meta[property="${property}"]`); if (el) el.content = content; }

  function applyLanguage(lang) {
    state.lang = lang;
    localStorage.setItem('hvac-lang', lang);
    installAlternateLinks();
    translateShell();
    renderDynamic();
    if (window.gtag) window.gtag('event', 'language_switch', { language: lang });
  }

  async function loadLocalizedData(detail) {
    state.brands = detail?.brands || state.brands;
    state.errors = detail?.errors || state.errors;
    const [articles, articlesEn, errorsEn, uiEn] = await Promise.all([
      fetch('data/articles.json').then(r => r.json()),
      fetch('data/articles.en.json').then(r => r.json()).catch(() => []),
      fetch('data/errors.en.json').then(r => r.json()).catch(() => []),
      fetch('data/ui.en.json').then(r => r.json()).catch(() => ({}))
    ]);
    state.articles = articles; state.articlesEn = articlesEn; state.errorsEn = errorsEn; state.uiEn = uiEn;
    window.__hvacData = state;
    translateShell();
    renderDynamic();
    window.setTimeout(renderDynamic, 180);
  }

  function articleCard(article) {
    const a = localizedArticle(article);
    const alt = state.lang === 'en' ? (englishAlts[article.id] || article.imageAlt) : article.imageAlt;
    return `<a href="article.html?id=${esc(article.id)}" class="card article-card" data-article-id="${esc(article.id)}"><div class="article-cover"><img loading="lazy" src="${esc(article.image)}?v=2" alt="${esc(alt)}"><span class="article-category">${esc(a.category)}</span></div><div class="article-card-body"><div class="article-meta"><span>${esc(a.readTime)}</span><span>${esc(a.date)}</span></div><h3>${esc(a.title)}</h3><p>${esc(a.excerpt)}</p><span class="read-more">${state.lang === 'en' ? 'Read article →' : 'اقرأ المقال ←'}</span></div></a>`;
  }

  function renderArticleList() {
    const grid = document.getElementById('articlesGrid'); if (!grid || !state.articles.length) return;
    const heading = document.querySelector('.hero h1'); if (heading) heading.textContent = state.lang === 'en' ? 'Educational HVAC Articles' : 'المقالات التعليمية';
    const heroText = document.querySelector('.hero h1 + p'); if (heroText) heroText.textContent = state.lang === 'en' ? 'A practical guide to understanding and maintaining air conditioners' : 'دليلك الشامل لفهم أجهزة التكييف وصيانتها';
    const active = document.querySelector('.filter-chip.active')?.dataset.filter || 'all';
    const list = active === 'all' ? state.articles : state.articles.filter(a => a.category === active);
    grid.innerHTML = list.map(articleCard).join('');
  }

  function renderRelated(article) {
    const section = document.getElementById('relatedArticles');
    if (!section) return;
    const related = (article.relatedIds || []).map(id => state.articles.find(a => a.id === id)).filter(Boolean);
    section.innerHTML = `<div class="section-header compact"><span class="eyebrow">${state.lang === 'en' ? 'Continue reading' : 'تابع القراءة'}</span><h2>${state.lang === 'en' ? 'Related articles' : 'مقالات ذات صلة'}</h2></div><div class="card-grid related-grid">${related.map(articleCard).join('')}</div>`;
  }

  function renderArticleDetail() {
    const content = document.getElementById('articleContent'); if (!content || !state.articles.length) return;
    const id = new URLSearchParams(location.search).get('id');
    const original = state.articles.find(a => a.id === id); if (!original) return;
    const article = localizedArticle(original);
    document.title = `${article.title} | HVAC Error Codes Guide`;
    const title = document.getElementById('articleTitle'); if (title) title.textContent = article.title;
    const crumb = document.getElementById('breadcrumbTitle'); if (crumb) crumb.textContent = article.title;
    const meta = document.getElementById('articleMeta'); if (meta) meta.innerHTML = `<span class="badge">${esc(article.date)}</span><span class="badge">${esc(article.readTime)}</span><span class="badge">${esc(article.category)}</span>`;
    let cover = document.getElementById('articleCover');
    if (!cover) { cover = document.createElement('figure'); cover.id = 'articleCover'; cover.className = 'article-featured-image'; content.parentElement.insertBefore(cover, content); }
    cover.innerHTML = `<img src="${esc(original.image)}?v=2" alt="${esc(original.imageAlt)}" loading="eager"><figcaption>${esc(article.title)}</figcaption>`;
    content.innerHTML = article.content;
    let related = document.getElementById('relatedArticles');
    if (!related) { related = document.createElement('section'); related.id = 'relatedArticles'; related.className = 'section related-section'; content.parentElement.appendChild(related); }
    renderRelated(original);
    setMeta('description', article.excerpt); setMetaProperty('og:title', article.title); setMetaProperty('og:description', article.excerpt); setMetaProperty('og:image', SITE + original.image);
    const canonical = document.querySelector('link[rel="canonical"]'); if (canonical) canonical.href = state.lang === 'en' ? languageUrl('en') : SITE + 'article.html?id=' + encodeURIComponent(id);
    const articleSchema = { '@context': 'https://schema.org', '@type': 'Article', headline: article.title, description: article.excerpt, image: [SITE + original.image], datePublished: original.date, dateModified: original.date, inLanguage: state.lang, author: { '@type': 'Organization', name: 'HVAC Error Codes Guide' }, mainEntityOfPage: { '@type': 'WebPage', '@id': location.href } };
    let schema = document.getElementById('hvac-article-schema'); if (!schema) { schema = document.createElement('script'); schema.id = 'hvac-article-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); } schema.textContent = JSON.stringify(articleSchema);
  }

  function renderErrorDetail() {
    const title = document.getElementById('errorTitle'); if (!title || !state.errors.length) return;
    const id = new URLSearchParams(location.search).get('id'); const original = state.errors.find(e => e.id === id); if (!original) return;
    const error = localizedError(original);
    title.textContent = state.lang === 'en' ? error.titleEn : original.titleAr;
    const crumb = document.getElementById('breadcrumbTitle'); if (crumb) crumb.textContent = title.textContent;
    const badge = document.getElementById('errorBadges'); if (badge) badge.innerHTML = `<span class="badge">${esc(brandName(original.brandId))}</span><span class="badge">${esc(categoryLabel(original.category))}</span><span class="badge">⚠ ${esc(severityLabel(original.severity))}</span><span class="badge badge-${original.diyPossible ? 'diy' : 'tech'}">${original.diyPossible ? '✓ DIY' : '⚒ ' + (state.lang === 'en' ? 'Technician' : 'يحتاج فني')}</span>`;
    const put = (id, values) => { const el = document.getElementById(id); if (el) el.innerHTML = (values || []).map(v => `<li>${esc(v)}</li>`).join(''); };
    const quick = document.getElementById('quickInfo');
    if (quick) quick.innerHTML = `<div class="info-item"><label>${state.lang === 'en' ? 'Brand' : 'الماركة'}</label><strong>${esc(brandName(original.brandId))}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Error code' : 'رمز الخطأ'}</label><strong>${esc(original.code)}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Category' : 'التصنيف'}</label><strong>${esc(categoryLabel(original.category))}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Severity' : 'الخطورة'}</label><strong>${esc(severityLabel(original.severity))}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Time' : 'المدة'}</label><strong>${esc(durationLabel(original.duration))}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Estimated cost' : 'التكلفة'}</label><strong>${esc(costLabel(original.cost))}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'Technician required?' : 'يحتاج فني؟'}</label><strong>${original.needsTechnician ? (state.lang === 'en' ? 'Yes' : 'نعم') : (state.lang === 'en' ? 'No' : 'لا')}</strong></div><div class="info-item"><label>${state.lang === 'en' ? 'DIY possible?' : 'يمكن DIY؟'}</label><strong>${original.diyPossible ? (state.lang === 'en' ? 'Yes' : 'نعم') : (state.lang === 'en' ? 'No' : 'لا')}</strong></div>`;
    put('symptomsList', errorField(original, 'symptoms')); put('causesList', errorField(original, 'causes')); put('checkStepsList', errorField(original, 'checkSteps')); put('repairStepsList', errorField(original, 'repairSteps'));
    const parts = document.getElementById('partsGrid'); if (parts) parts.innerHTML = (errorField(original, 'parts') || []).map(p => `<div class="part-item"><span class="icon">🔩</span>${esc(p)}</div>`).join('');
    const tools = document.getElementById('toolsGrid'); if (tools) tools.innerHTML = (errorField(original, 'tools') || []).map(p => `<div class="part-item"><span class="icon">🧰</span>${esc(p)}</div>`).join('');
    document.querySelectorAll('.detail-section h2').forEach(h => { const key = h.textContent.replace(/^\S+\s*/, '').trim(); if (state.lang === 'en' && common[key]) h.lastChild.nodeValue = ' ' + common[key]; });
    const canonical = document.querySelector('link[rel="canonical"]'); if (canonical) canonical.href = state.lang === 'en' ? languageUrl('en') : SITE + 'error.html?id=' + encodeURIComponent(id);
    document.title = `${original.code} - ${title.textContent} | HVAC Error Codes Guide`;
  }

  function renderErrorList() {
    const grid = document.getElementById('errorsGrid'); if (!grid || !state.errors.length) return;
    const heading = document.querySelector('.hero h1'); if (heading && state.lang === 'en') heading.textContent = 'Air Conditioner Error Codes';
    const params = new URLSearchParams(location.search); const brandFilter = params.get('brand'); const categoryFilter = document.querySelector('.filter-chip.active')?.dataset.filter || params.get('category');
    let list = state.errors.slice(); if (brandFilter) list = list.filter(e => e.brandId === brandFilter); if (categoryFilter && categoryFilter !== 'all') list = list.filter(e => e.category === categoryFilter);
    const page = Number(grid.dataset.langPage || 1); const pageItems = list.slice((page - 1) * 12, page * 12);
    const count = document.getElementById('resultsCount'); if (count) count.textContent = list.length;
    grid.innerHTML = pageItems.map(e => { const le = localizedError(e); return `<a href="error.html?id=${esc(e.id)}" class="card error-card"><span class="error-code ${esc(e.severity)}">${esc(e.code)}</span><h3>${esc(state.lang === 'en' ? le.titleEn : e.titleAr)}</h3><div class="brand-tag">🏭 ${esc(brandName(e.brandId))}</div><div class="symptoms">${esc((state.lang === 'en' && le.symptomsEn ? le.symptomsEn : e.symptoms).slice(0, 2).join(' • '))}</div><div class="meta-row"><span class="badge badge-${e.diyPossible ? 'diy' : 'tech'}">${e.diyPossible ? '✓ DIY' : '⚒ ' + (state.lang === 'en' ? 'Technician' : 'فني')}</span><span class="badge badge-cost">💰 ${esc(costLabel(e.cost))}</span><span class="badge">⏱ ${esc(durationLabel(e.duration))}</span></div></a>`; }).join('');
  }

  function renderHome() {
    if (!document.getElementById('categoriesGrid') || !state.errors.length) return;
    const categoriesGrid = document.getElementById('categoriesGrid');
    const counts = {};
    state.errors.forEach(error => { counts[error.category] = (counts[error.category] || 0) + 1; });
    categoriesGrid.innerHTML = Object.entries(counts).map(([cat, count]) => `<a href="errors.html?category=${encodeURIComponent(cat)}" class="cat-card"><div class="icon">${window.getCategoryIcon ? window.getCategoryIcon(cat) : '🔧'}</div><h4>${esc(categoryLabel(cat))}</h4><span>${count} ${state.lang === 'en' ? 'faults' : 'عطل'}</span></a>`).join('');
    const latestGrid = document.getElementById('latestErrorsGrid');
    if (latestGrid) latestGrid.innerHTML = state.errors.slice(-8).reverse().map(original => { const error = localizedError(original); return `<a href="error.html?id=${esc(original.id)}" class="card error-card"><span class="error-code ${esc(original.severity)}">${esc(original.code)}</span><h3>${esc(state.lang === 'en' ? error.titleEn : original.titleAr)}</h3><div class="brand-tag">🏭 ${esc(brandName(original.brandId))}</div><div class="symptoms">${esc((state.lang === 'en' && error.symptomsEn ? error.symptomsEn : original.symptoms).slice(0, 2).join(' • '))}</div><div class="meta-row"><span class="badge badge-${original.diyPossible ? 'diy' : 'tech'}">${original.diyPossible ? '✓ DIY' : '⚒ ' + (state.lang === 'en' ? 'Technician' : 'يحتاج فني')}</span><span class="badge badge-cost">💰 ${esc(costLabel(original.cost))}</span><span class="badge">⏱ ${esc(durationLabel(original.duration))}</span></div></a>`; }).join('');
    const brandsGrid = document.getElementById('brandsGrid');
    if (brandsGrid) brandsGrid.innerHTML = state.brands.slice(0, 6).map(brand => { const count = state.errors.filter(error => error.brandId === brand.id).length; return `<a href="errors.html?brand=${esc(brand.id)}" class="card brand-card"><img class="brand-logo" src="${esc(brand.logo || 'images/default-brand.png')}" alt="${esc(brand.name)}"><div><h3>${esc(state.lang === 'en' ? brand.name : brand.nameAr)}</h3><p>${esc(brand.country || '')} · ${count} ${state.lang === 'en' ? 'faults' : 'عطل'}</p></div></a>`; }).join('');
    if (state.lang === 'en') {
      const h1 = document.querySelector('.hero h1'); if (h1) h1.innerHTML = 'Residential <span>Air Conditioner</span> Error Codes';
    } else {
      const h1 = document.querySelector('.hero h1'); if (h1) h1.innerHTML = 'دليل <span>أعطال أجهزة التكييف</span> المنزلية';
    }
  }

  function renderBrandList() {
    if ((location.pathname.split('/').pop() || 'index.html') !== 'brands.html') return;
    const grid = document.getElementById('brandsGrid'); if (!grid || !state.brands.length) return;
    const heading = document.querySelector('.hero h1'); if (heading) heading.textContent = state.lang === 'en' ? 'Supported Air Conditioner Brands' : 'الماركات المدعومة';
    const heroText = document.querySelector('.hero h1 + p'); if (heroText) heroText.textContent = state.lang === 'en' ? 'Browse brands and explore verified error-code references.' : 'تصفح الماركات واستكشف مراجع أكواد الأعطال الموثوقة.';
    grid.innerHTML = state.brands.map(brand => { const count = state.errors.filter(error => error.brandId === brand.id).length; return `<a href="errors.html?brand=${esc(brand.id)}" class="card brand-card"><img class="brand-logo" src="${esc(brand.logo || 'images/default-brand.png')}" alt="${esc(brand.name)}"><div class="brand-body"><h3>${esc(state.lang === 'en' ? brand.name : brand.nameAr)}</h3><p>${esc(brand.country || '')} · ${count} ${state.lang === 'en' ? 'faults' : 'عطل'}</p></div></a>`; }).join('');
  }

  function renderSearchPage() {
    const input = document.getElementById('advancedSearchInput'); const grid = document.getElementById('searchResultsGrid'); const count = document.getElementById('searchResultsCount');
    if (!input || !grid || !state.errors.length) return;
    const run = query => {
      const q = normalize(query); const type = document.querySelector('[data-type].active')?.dataset.type || 'all'; const results = [];
      if (type === 'all' || type === 'errors') state.errors.forEach(original => { const error = localizedError(original); const brand = state.brands.find(candidate => candidate.id === original.brandId); const text = [original.code, ...(original.aliases || []), brandName(original.brandId), brand?.name, original.titleAr, error.titleEn, ...(original.symptoms || []), ...(error.symptomsEn || []), ...(original.parts || []), ...(error.partsEn || [])].join(' '); if (normalize(text).includes(q)) results.push({ ...original, _type: 'error', _localized: error }); });
      if (type === 'all' || type === 'articles') state.articles.forEach(original => { const article = localizedArticle(original); if (normalize([original.title, original.excerpt, ...(original.tags || []), ...(article.title ? [article.title, article.excerpt, ...(article.tags || [])] : [])].join(' ')).includes(q)) results.push({ ...original, _type: 'article', _localized: article }); });
      count.textContent = results.length;
      if (!q) { grid.innerHTML = `<div class="detail-section" style="text-align:center;"><p>${state.lang === 'en' ? 'Enter a code, fault name, or brand above.' : 'اكتب رمز الخطأ أو اسم العطل أو الماركة أعلاه.'}</p></div>`; return; }
      if (!results.length) { grid.innerHTML = `<div class="detail-section" style="text-align:center;"><p>${state.lang === 'en' ? 'No matching results found.' : 'لا توجد نتائج مطابقة لبحثك.'}</p></div>`; return; }
      grid.innerHTML = results.map(result => { if (result._type === 'error') { const title = state.lang === 'en' ? result._localized.titleEn : result.titleAr; const symptoms = state.lang === 'en' ? result._localized.symptomsEn : result.symptoms; return `<a href="error.html?id=${esc(result.id)}" class="card error-card"><span class="error-code ${esc(result.severity)}">${esc(result.code)}</span><h3>${esc(title)}</h3><div class="brand-tag">🏭 ${esc(brandName(result.brandId))}</div><div class="symptoms">${esc((symptoms || []).slice(0, 2).join(' • '))}</div><div class="meta-row"><span class="badge badge-${result.diyPossible ? 'diy' : 'tech'}">${result.diyPossible ? '✓ DIY' : '⚒ ' + (state.lang === 'en' ? 'Technician' : 'فني')}</span><span class="badge badge-cost">💰 ${esc(costLabel(result.cost))}</span></div></a>`; } return articleCard(result); }).join('');
    };
    if (!input.dataset.enSearchBound) {
      input.dataset.enSearchBound = 'true';
      input.addEventListener('input', event => run(event.target.value), true);
      document.querySelectorAll('[data-type]').forEach(button => button.addEventListener('click', () => setTimeout(() => run(input.value), 20), true));
    }
    run(input.value);
  }

  function updateListingSchema() {
    const page = location.pathname.split('/').pop() || 'index.html';
    const list = page === 'articles.html' ? state.articles : page === 'errors.html' ? state.errors : [];
    if (!list.length) return;
    const itemListElement = list.map((item, index) => ({ '@type': 'ListItem', position: index + 1, name: page === 'articles.html' ? localizedArticle(item).title : `${item.code} — ${state.lang === 'en' ? localizedError(item).titleEn : item.titleAr}`, url: SITE + (page === 'articles.html' ? `article.html?id=${item.id}` : `error.html?id=${item.id}`) }));
    let schema = document.getElementById('hvac-list-schema');
    if (!schema) { schema = document.createElement('script'); schema.id = 'hvac-list-schema'; schema.type = 'application/ld+json'; document.head.appendChild(schema); }
    schema.textContent = JSON.stringify({ '@context': 'https://schema.org', '@type': 'CollectionPage', name: document.title, url: location.href, inLanguage: state.lang, mainEntity: { '@type': 'ItemList', numberOfItems: itemListElement.length, itemListElement } });
  }

  function renderDynamic() { renderHome(); renderArticleList(); renderBrandList(); renderArticleDetail(); renderErrorList(); renderErrorDetail(); renderSearchPage(); updateListingSchema(); }

  function init() {
    addLanguageToggle(); installAlternateLinks(); translateShell();
    document.addEventListener('dataLoaded', e => { state.brands = e.detail.brands || []; state.errors = e.detail.errors || []; loadLocalizedData(e.detail); setTimeout(wrapPagination, 80); });
    setTimeout(renderDynamic, 500);
    document.addEventListener('click', e => { if (e.target.closest('.filter-chip')) setTimeout(renderDynamic, 30); });
    wrapPagination();
  }

  function wrapPagination() {
    const originalPage = window.goToPage;
    if (!originalPage || originalPage.__localized) return;
    const wrapped = p => { const grid = document.getElementById('errorsGrid'); if (grid) grid.dataset.langPage = p; originalPage(p); setTimeout(renderDynamic, 30); };
    wrapped.__localized = true;
    window.goToPage = wrapped;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true }); else init();
})();
