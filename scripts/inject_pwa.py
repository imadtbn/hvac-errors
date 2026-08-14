#!/usr/bin/env python3
"""Inject the PWA install button into the shared header of every page,
load js/pwa.js before main.js, and add dynamic SEO update scripts to
error.html and article.html."""
import re

BASE = "/home/ubuntu/hvac-errors"
INSTALL_BTN_HTML = (
    '        <button class="btn-icon pwa-install-btn" id="hvacInstallBtn" '
    'title="تثبيت الموقع على جهازك" style="display:none">📲</button>\n'
)


def read(p):
    with open(f"{BASE}/{p}") as f:
        return f.read()


def write(p, content):
    with open(f"{BASE}/{p}", "w") as f:
        f.write(content)


PAGES = [
    "index.html", "errors.html", "error.html", "brands.html",
    "articles.html", "article.html", "search.html", "about.html",
    "contact.html", "faq.html", "privacy.html", "disclaimer.html",
]

for page in PAGES:
    html = read(page)
    # Add install button right before </div class="header-actions">
    html = html.replace(
        '        <button class="btn-icon mobile-menu-btn" id="mobileMenuBtn">☰</button>\n',
        INSTALL_BTN_HTML + '        <button class="btn-icon mobile-menu-btn" id="mobileMenuBtn">☰</button>\n',
    )
    # Add pwa.js before main.js
    html = html.replace('<script src="js/main.js"></script>',
                        '<script src="js/pwa.js"></script>\n  <script src="js/main.js"></script>')
    write(page, html)

# ---- error.html: dynamic SEO (description, keywords, canonical, JSON-LD) ----
err = read("error.html")
dynamic_block = """  <script>
    // تحديث SEO ديناميكياً بعد تحميل بيانات العطل
    document.addEventListener('dataLoaded', function (e) {
      const {errors, brands} = e.detail;
      const params = new URLSearchParams(location.search);
      const errId = params.get('id');
      const err = errors.find(x => x.id === errId);
      if (!err) return;

      const brand = brands.find(b => b.id === err.brandId);
      const brandName = brand ? brand.name : '';
      const site = 'https://imadtbn.github.io/hvac-errors/';
      const pageUrl = site + 'error.html?id=' + encodeURIComponent(err.id);
      const desc = 'عطل ' + err.code + ' في تكييف ' + brandName + ': ' + err.symptoms.join('، ') + ' - تعرف على الأسباب المحتملة وخطوات الفحص والإصلاح والتكلفة التقريبية للإصلاح.';
      const keywords = err.code + ', عطل تكييف ' + brandName + ', كود ' + err.code + ' ' + brandName + ', إصلاح ' + err.titleAr + ', صيانة تكييف ' + brandName + ', أعطال المكيفات';

      // meta
      let md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', desc);
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement('meta');
        kw.setAttribute('name', 'keywords');
        document.head.appendChild(kw);
      }
      kw.setAttribute('content', keywords);

      // title & canonical & og
      document.title = 'عطل ' + err.code + ' تكييف ' + brandName + ' - ' + err.titleAr + ' | دليل الأعطال';
      let cl = document.querySelector('link[rel="canonical"]');
      if (cl) cl.setAttribute('href', pageUrl);
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', pageUrl);
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', document.title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);
      let twTitle = document.querySelector('meta[name="twitter:title"]');
      if (twTitle) twTitle.setAttribute('content', document.title);
      let twDesc = document.querySelector('meta[name="twitter:description"]');
      if (twDesc) twDesc.setAttribute('content', desc);

      // JSON-LD (FAQ enriched TechArticle)
      const faqData = [
        {q: 'ما هو عطل ' + err.code + ' في تكييف ' + brandName + '؟', a: err.titleAr + ': ' + err.symptoms.join('؛ ')},
        {q: 'ما هي أسباب عطل ' + err.code + '؟', a: err.causes ? err.causes.join('؛ ') : 'تختلف حسب الحالة.'},
        {q: 'هل يمكن إصلاح عطل ' + err.code + ' بنفسي؟', a: err.diyPossible ? 'نعم، هذا العطل يمكن إصلاحه ذاتياً باتباع الخطوات المذكورة.' : 'لا، يُنصح بالاستعانة بفني صيانة معتمد لإصلاح هذا العطل.'}
      ];
      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        "headline": 'عطل ' + err.code + ' تكييف ' + brandName + ' - ' + err.titleAr,
        "description": desc,
        "image": site + 'icons/icon-512x512.png',
        "datePublished": "2026-07-01",
        "dateModified": "2026-08-14",
        "inLanguage": "ar",
        "author": {"@type": "Organization", "name": "دليل أعطال أجهزة التكييف المنزلية", "url": site},
        "publisher": {"@type": "Organization", "name": "دليل أعطال أجهزة التكييف المنزلية", "logo": {"@type": "ImageObject", "url": site + 'icons/icon-192x192.png'}},
        "mainEntityOfPage": {"@type": "WebPage", "@id": pageUrl},
        "keywords": keywords,
        "about": [
          {"@type": "Thing", "name": brandName},
          {"@type": "Thing", "name": err.titleAr}
        ],
        "timeRequired": "PT" + (parseInt(err.duration) || 30) + "M"
      };
      const extraJsonLd = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqData.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {"@type": "Answer", "text": f.a}
        }))
      };
      [jsonLd, extraJsonLd].forEach(data => {
        const s = document.createElement('script');
        s.type = 'application/ld+json';
        s.textContent = JSON.stringify(data, null, 2);
        document.head.appendChild(s);
      });
    });
  </script>
"""
# insert dynamic SEO script right before </body>
err = err.replace("</body>\n", dynamic_block + "</body>\n")
write("error.html", err)

# ---- article.html: dynamic SEO ----
art = read("article.html")
art_dynamic = """  <script>
    // تحديث SEO ديناميكياً بعد تحميل بيانات المقال
    document.addEventListener('dataLoaded', function (e) {
      const articles = e.detail.articles || e.detail;
      const params = new URLSearchParams(location.search);
      const artId = params.get('id');
      const art = Array.isArray(articles) ? articles.find(x => x.id === artId) : null;
      if (!art) return;

      const site = 'https://imadtbn.github.io/hvac-errors/';
      const pageUrl = site + 'article.html?id=' + encodeURIComponent(art.id);
      const desc = art.excerpt || art.title;
      const keywords = art.tags ? art.tags.join('، ') : '';

      let md = document.querySelector('meta[name="description"]');
      if (md) md.setAttribute('content', desc);
      let kw = document.querySelector('meta[name="keywords"]');
      if (!kw) {
        kw = document.createElement('meta');
        kw.setAttribute('name', 'keywords');
        document.head.appendChild(kw);
      }
      kw.setAttribute('content', keywords);
      document.title = art.title + ' | دليل أعطال التكييف';
      let cl = document.querySelector('link[rel="canonical"]');
      if (cl) cl.setAttribute('href', pageUrl);
      let ogUrl = document.querySelector('meta[property="og:url"]');
      if (ogUrl) ogUrl.setAttribute('content', pageUrl);
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.setAttribute('content', document.title);
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.setAttribute('content', desc);

      const jsonLd = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": art.title,
        "description": desc,
        "image": site + 'icons/icon-512x512.png',
        "datePublished": art.date || "2026-06-01",
        "dateModified": art.date || "2026-08-14",
        "inLanguage": "ar",
        "author": {"@type": "Organization", "name": "دليل أعطال أجهزة التكييف المنزلية", "url": site},
        "publisher": {"@type": "Organization", "name": "دليل أعطال أجهزة التكييف المنزلية", "logo": {"@type": "ImageObject", "url": site + 'icons/icon-192x192.png'}},
        "mainEntityOfPage": {"@type": "WebPage", "@id": pageUrl},
        "keywords": keywords,
        "articleSection": art.category || "صيانة التكييف"
      };
      const s = document.createElement('script');
      s.type = 'application/ld+json';
      s.textContent = JSON.stringify(jsonLd, null, 2);
      document.head.appendChild(s);
    });
  </script>
"""
art = art.replace("</body>\n", art_dynamic + "</body>\n")
write("article.html", art)

print("PWA injection complete")
