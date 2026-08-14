# حالة العمل - تحسين SEO و PWA لموقع hvac-errors

## معلومات المشروع
- المستودع: imadtbn/hvac-errors — branch: main — URL النشر: https://imadtbn.github.io/hvac-errors/
- مسار العمل: /home/ubuntu/hvac-errors
- النطاق الرسمي المستخدم في canonicals: https://imadtbn.github.io/hvac-errors/
- AdSense: ca-pub-5656416032906373 — Analytics: G-K0RNZQ2W00
- GitHub Search Console verification file: google4e08a8803a39e9f9.html

## المشاكل المكتشفة في الفحص (تم إصلاحها)
1. canonical URLs كانت تشير إلى github.com repo مسار (broken) → صُححت لجميع 11 صفحة
2. robots.txt كان بصيغة بايثون خاطئة → أعيد كتابته نصاً سليماً
3. sitemap.xml كان ناقصاً (10 صفحات فقط) → 69 رابطاً شاملاً (30 عطل + 23 ماركة + 5 تصنيفات + 11 ثابتة)
4. articles.json مفقود → أُنشئ data/articles.json بـ 8 مقالات (a001..a008)
5. manifest كان يشير لأيقونات غير موجودة (72..384) وشاشات غير موجودة → أعيد كتابته بمسارات /hvac-errors/ وأيقونات فعلية (192, 512, 180)
6. service worker: CACHE_NAME v1 → v2، مسارات نسبية ./، حذف articles.json من الكاش الصلب، network-first لـ HTML، تجاهل النطاقات الخارجية
7. structured data: WebSite+SearchAction, Organization, BreadcrumbList لكل صفحة، AboutPage, ContactPage, FAQPage (8 أسئلة من faq.html), PrivacyPolicy

## الملفات التي تم تعديلها
- index.html, errors.html, brands.html, articles.html, search.html, about.html, contact.html, faq.html, privacy.html, disclaimer.html (SEO blocks via scripts/generate_seo.py)
- error.html, article.html (SEO templates + JSON-LD breadcrumb + dynamic JS meta)
- robots.txt (rewrite)
- sitemap.xml (scripts/generate_sitemap.py)
- service-worker.js (rewrite v2)
- manifest.webmanifest (rewrite)
- js/pwa.js (NEW: زر تثبيت #hvacInstallBtn + إشعار أول زيارة + SW register مع scope /hvac-errors/ + إعادة تحميل عند التحديث)

## تحديث الحالة (بعد إكمال كل شيء - 14/08)
- [x] pwa.js مضاف لكل 12 صفحة، زر hvacInstallBtn في كل الهيدرات
- [x] CSS لنظام PWA مضاف نهاية style.css
- [x] SEO ديناميكي error.html (TechArticle+FAQPage) و article.html (Article) يعمل - تم التحقق بالكونسول
- [x] favicon.ico أعيد توليده (كان JPEG خاطئ)، تكرارات favicon في head أزيلت
- [x] articles.html: CollectionPage JSON-LD أُضيف
- [x] اختبارات محلية نجحت: 12 صفحة 200، SW مسجل، banner التثبيت يظهر، زر الهيدر يظهر
- [x] sitemap: 69 رابط | robots.txt سليم

## المتبقي فقط
- git commit + push ثم تسليم النتيجة

## بيانات مهمة
- 30 عطلاً في data/errors.json (e001..e030)، 23 ماركة في brands.json
- الأيقونات المولدة: icons/icon-192x192.png, icons/icon-512x512.png, apple-touch-icon.png (cropped من icon.png)
