#!/usr/bin/env python3
"""
Generate complete SEO blocks (canonical, meta description, meta keywords,
JSON-LD structured data) for every page of hvac-errors and inject them
into the HTML files.
"""
import json
import re
from datetime import date

BASE = "/home/ubuntu/hvac-errors"
SITE_URL = "https://imadtbn.github.io/hvac-errors/"
SITE_NAME = "دليل أعطال أجهزة التكييف المنزلية"
SITE_NAME_EN = "HVAC Error Codes Guide"

with open(f"{BASE}/data/brands.json") as f:
    BRANDS = {b["id"]: b for b in json.load(f)}
with open(f"{BASE}/data/errors.json") as f:
    ERRORS = json.load(f)

TODAY = date.today().isoformat()

CATEGORY_LABELS = {
    "sensors": "أعطال الحساسات",
    "compressor": "أعطال الضاغط",
    "inverter": "أعطال الانفرتر",
    "communication": "أற்றال الاتصال",
    "electrical": "أعطال كهربائية",
    "mechanical": "أعطال ميكانيكية",
    "fan": "أعطال المروحة",
    "condenser": "أعطال المكثف",
    "pcb": "أعطال PCB",
    "drainage": "أعطال صرف المياه",
    "freezing": "أعطال التجميد",
    "cooling": "ضعف التبريد",
    "heating": "ضعف التدفئة",
    "remote": "أعطال الريموت",
    "wifi": "أعطال الواي فاي",
}
CATEGORY_LABELS["communication"] = "أعطال الاتصال"


def site_jsonld():
    return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SITE_NAME,
        "alternateName": SITE_NAME_EN,
        "url": SITE_URL,
        "description": "أكبر مرجع عربي لأعطال أجهزة التكييف المنزلية: أكواد الأخطاء، أسباب العطل، خطوات الإصلاح، وتكلفة الصيانة لأكثر من 25 ماركة.",
        "inLanguage": "ar",
        "potentialAction": {
            "@type": "SearchAction",
            "target": f"{SITE_URL}search.html?q={{{'{'}search_term_string{'}'}}}",
            "query-input": "required name=search_term_string",
        },
    }


def org_jsonld():
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SITE_NAME,
        "alternateName": SITE_NAME_EN,
        "url": SITE_URL,
        "logo": f"{SITE_URL}icons/icon-192x192.png",
        "email": "info@hvac-errors.com",
        "sameAs": [],
        "description": "مرجع عربي متخصص في أكواد أعطال أجهزة التكييف المنزلية وأسبابها وطرق إصلاحها.",
    }


def breadcrumb_jsonld(items):
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "الرئيسية", "item": SITE_URL},
        ]
        + [
            {"@type": "ListItem", "position": i + 1, "name": item[0], "item": item[1]}
            for i, item in enumerate(items, start=1)
        ],
    }


def read(path):
    with open(f"{BASE}/{path}") as f:
        return f.read()


def write(path, content):
    with open(f"{BASE}/{path}", "w") as f:
        f.write(content)


def inject_head_block(html, blocks, remove_keywords_block=True):
    """Insert structured blocks right after the existing meta description link.

    We locate the </title> tag, keep the title, and rebuild the SEO block.
    Simpler: replace the whole SEO region from <title> to the end of the
    (first) canonical/link rel stylesheet... Actually we replace from
    '<meta name="description"' until '</head>' with our SEO block + rest.
    """
    head_start = html.index("<head>")
    head_end = html.index("</head>")
    head = html[head_start:head_end]

    title_m = re.search(r"<title>(.*?)</title>", head, re.S)
    title = title_m.group(1) if title_m else ""

    new_head = "<head>\n"
    new_head += "  <meta charset=\"UTF-8\">\n"
    new_head += "  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n"
    new_head += "  <title>" + title + "</title>\n\n"
    new_head += blocks
    # remove old duplicated SEO tags (description, keywords, canonical, og, twitter, JSON-LD)
    remainder = head[head.index("</title>") + len("</title>"):]
    old_tags = re.compile(
        r'\s*<meta name="(?:description|keywords|robots|author|google-adsense-account)"[^>]*>\n?'
        r'|\s*<link rel="canonical"[^>]*>\n?'
        r'|\s*<meta property="og:[^"]*"[^>]*>\n?'
        r'|\s*<meta name="twitter:[^"]*"[^>]*>\n?'
        r'|\s*<script type="application/ld\+json">\n?.*?</script>\n?',
        re.S,
    )
    remainder = old_tags.sub("", remainder)
    new_head += remainder
    return html[:head_start] + new_head + html[head_end:]


def seo_blocks(title, description, keywords, jsonld_blocks, canonical_suffix="", og_image=""):
    canonical = SITE_URL + canonical_suffix
    og_img = og_image or f"{SITE_URL}icons/icon-512x512.png"
    out = []
    out.append(f'  <meta name="description" content="{description}">\n')
    out.append(f'  <meta name="keywords" content="{keywords}">\n')
    out.append(f'  <link rel="canonical" href="{canonical}">\n')
    out.append('  <meta property="og:site_name" content="{}">\n'.format(SITE_NAME))
    out.append(f'  <meta property="og:title" content="{title}">\n')
    out.append(f'  <meta property="og:description" content="{description}">\n')
    out.append('  <meta property="og:type" content="website">\n')
    out.append(f'  <meta property="og:url" content="{canonical}">\n')
    out.append(f'  <meta property="og:image" content="{og_img}">\n')
    out.append('  <meta property="og:locale" content="ar">\n')
    out.append('  <meta name="twitter:card" content="summary_large_image">\n')
    out.append(f'  <meta name="twitter:title" content="{title}">\n')
    out.append(f'  <meta name="twitter:description" content="{description}">\n')
    out.append('  <meta name="robots" content="index, follow, max-image-preview:large">\n')
    out.append('  <meta name="author" content="{}">\n'.format(SITE_NAME))
    out.append('  <link rel="manifest" href="manifest.webmanifest">\n')
    out.append('  <meta name="theme-color" content="#0066CC">\n')
    out.append('  <meta name="apple-mobile-web-app-capable" content="yes">\n')
    out.append('  <meta name="mobile-web-app-capable" content="yes">\n')
    out.append('  <meta name="apple-mobile-web-app-title" content="دليل الأعطال">\n')
    out.append('  <meta name="application-name" content="دليل أعطال التكييف">\n')
    for block in jsonld_blocks:
        out.append("  <script type=\"application/ld+json\">\n")
        out.append("    " + json.dumps(block, ensure_ascii=False).replace("},", "},\n    ") + "\n")
        out.append("  </script>\n")
    return "".join(out) + "\n"


# =========================================================
# 1. INDEX PAGE
# =========================================================
html = read("index.html")
b = seo_blocks(
    "دليل أعطال أجهزة التكييف المنزلية | أكواد الأخطاء والإصلاح",
    "أكبر مرجع عربي لأعطال أجهزة التكييف المنزلية: معاني أكواد الأخطاء، أسباب العطل، أعراضه، خطوات الفحص والإصلاح، والتكلفة التقريبية لأكثر من 25 ماركة مثل Daikin وLG وSamsung وGree وMidea وCarrier.",
    "أعطال المكيفات, أكواد أخطاء التكييف, صيانة المكيفات, كود E1 تكييف, عطل الانفرتر, حساسات التكييف, ضاغط التكييف, تسرب الفريون, ضعف التبريد, Daikin, LG, Samsung, Gree, Midea, Carrier, Mitsubishi, Panasonic, دليل أعطال التكييف",
    [site_jsonld(), org_jsonld(), breadcrumb_jsonld([])],
)
html = inject_head_block(html, b)
write("index.html", html)

# =========================================================
# 2. STATIC PAGES
# =========================================================
static_pages = {
    "errors.html": (
        "جميع أكواد أعطال التكييف | تصفح الأعطال حسب الماركة والتصنيف",
        "قائمة شاملة لجميع أكواد أعطال أجهزة التكييف المنزلية مع أعراض العطل، الأسباب المحتملة، وخطوات الإصلاح. تصفح الأعطال حسب الماركة (Daikin, LG, Samsung) أو التصنيف (حساسات، ضاغط، انفرتر، كهربائية).",
        "أكواد أعطال التكييف, قائمة أعطال المكيفات, رمز الخطأ, عطل الضاغط, عطل الحساسات, أعطال الانفرتر, أعطال كهربائية, أخطاء تكييف Daikin, أخطاء تكييف LG, أخطاء تكييف Gree",
        breadcrumb_jsonld([("الأعطال", f"{SITE_URL}errors.html")]),
        "errors.html",
    ),
    "brands.html": (
        "ماركات التكييف المدعومة | Daikin, LG, Samsung, Gree وغيرها",
        "تصفح أعطال جهاز التكييف حسب الماركة: Daikin, LG, Samsung, Gree, Midea, Carrier, Mitsubishi, Panasonic, Toshiba, Hisense وغيرها من الماركات اليابانية والكورية والصينية.",
        "ماركات التكييف, Daikin, LG, Samsung, Gree, Midea, Carrier, Mitsubishi, Panasonic, Toshiba, Hitachi, Hisense, Haier, Fujitsu, York, Trane, أخطاء التكييف حسب الماركة",
        breadcrumb_jsonld([("الماركات", f"{SITE_URL}brands.html")]),
        "brands.html",
    ),
    "articles.html": (
        "مقالات صيانة التكييف والتعليمية | دليل أعطال التكييف",
        "مقالات تعليمية متخصصة في صيانة أجهزة التكييف المنزلية: كيف يعمل الانفرتر، شحن الفريون، تنظيف الفلاتر، دائرة التبريد، ونصائح توفير الطاقة والحفاظ على المكيف.",
        "مقالات التكييف, صيانة المكيفات, تنظيف فلتر المكيف, شحن فريون, تكييف انفرتر, دائرة التبريد, نصائح توفير الطاقة, تعليم صيانة التكييف",
        breadcrumb_jsonld([("المقالات", f"{SITE_URL}articles.html")]),
        "articles.html",
    ),
    "search.html": (
        "البحث في أكواد أعطال التكييف | بحث متقدم بالماركة والرمز",
        "ابحث في جميع أكواد أعطال أجهزة التكييف برمز الخطأ أو اسم العطل أو الماركة أو القطعة المتضررة. نتائج فورية من قاعدة بيانات تضم أكثر من 30 عطلاً لأكثر من 25 ماركة.",
        "بحث أكواد أعطال التكييف, البحث في أعطال المكيفات, ابحث عن رمز الخطأ, بحث الماركات, ابحث عن عطل التكييف",
        breadcrumb_jsonld([("البحث", f"{SITE_URL}search.html")]),
        "search.html",
    ),
    "about.html": (
        "من نحن | دليل أعطال أجهزة التكييف المنزلية",
        "تعرف على فريق دليل أعطال التكييف: مهندسو HVAC وفنيو صيانة معتمدون نقدم أكبر مرجع عربي لأكواد أخطاء التكييف مبنياً على كتيبات Service Manuals الرسمية.",
        "من نحن, دليل أعطال التكييف, مهندسو HVAC, فريق صيانة التكييف, Service Manuals, مصادر موثوقة, مراجع الأعطال",
        [
            {
                "@context": "https://schema.org",
                "@type": "AboutPage",
                "name": "من نحن - دليل أعطال أجهزة التكييف",
                "url": f"{SITE_URL}about.html",
                "mainEntityOfPage": {"@type": "WebPage", "@id": f"{SITE_URL}about.html"},
                "inLanguage": "ar",
                "description": "من نحن: تعريف بفريق دليل أعطال التكييف ومصادرنا ومهمتنا في توثيق أكواد أعطال التكييف المنزلية.",
            }
        ]
        + [breadcrumb_jsonld([("من نحن", f"{SITE_URL}about.html")])],
        "about.html",
    ),
    "contact.html": (
        "اتصل بنا | دليل أعطال أجهزة التكييف",
        "تواصل مع فريق دليل أعطال التكييف عبر الهاتف أو البريد الإلكتروني أو واتساب للاستفسارات والاقتراحات وإضافة أكواد أعطال جديدة.",
        "اتصل بنا, تواصل معنا, دعم دليل الأعطال, واتساب التكييف, استفسار صيانة التكييف, اقتراح كود عطل",
        [
            {
                "@context": "https://schema.org",
                "@type": "ContactPage",
                "name": "اتصل بنا - دليل أعطال أجهزة التكييف",
                "url": f"{SITE_URL}contact.html",
                "inLanguage": "ar",
                "description": "تواصل مع فريق دليل أعطال التكييف عبر الهاتف أو البريد الإلكتروني أو واتساب.",
                "mainEntityOfPage": {"@type": "WebPage", "@id": f"{SITE_URL}contact.html"},
            }
        ]
        + [breadcrumb_jsonld([("اتصل بنا", f"{SITE_URL}contact.html")])],
        "contact.html",
    ),
    "faq.html": (
        "الأسئلة الشائعة | أكواد أعطال التكييف وصيانته",
        "إجابات على الأسئلة الأكثر شيوعاً حول أكواد أخطاء التكييف: ما معنى رمز الخطأ، هل يمكن الإصلاح المنزلي، تكلفة الإصلاح، الفرق بين الانفرتر والعادي، ومدة تنظيف الفلاتر.",
        "أسئلة شائعة التكييف, رموز الأخطاء, الإصلاح المنزلي للمكيف, تكلفة إصلاح التكييف, الفرق بين انفرتر وعادي, تنظيف فلاتر المكيف, تجميد المبخر",
        [
            {
                "@context": "https://schema.org",
                "@type": "FAQPage",
                "mainEntity": [
                    {
                        "@type": "Question",
                        "name": "ما هو رمز الخطأ (Error Code)؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "رمز الخطأ هو رقم أو حرف يظهر على شاشة التكييف أو عبر وميض المؤشرات LED للإشارة إلى نوع العطل. يساعد الفني في تحديد المشكلة بدقة.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "هل يمكنني إصلاح العطل بنفسي؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "يعتمد على نوع العطل. الأعطال البسيطة مثل تلف الحساسات أو الفلاتر يمكن إصلاحها منزلياً. أما أعطال الضاغط والانفرتر والفريون فتحتاج فنياً معتمداً.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "كيف أبحث عن رمز الخطأ؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "يمكنك استخدام مربع البحث في الصفحة الرئيسية وكتابة رمز الخطأ (مثل E1, CH01, U4) أو اسم الماركة أو وصف العطل.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "هل المعلومات موثوقة؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "نعم، جميع المعلومات مبنية على كتيبات Service Manuals الرسمية من الشركات المصنعة. ومع ذلك، قد تختلف الأعطال حسب طراز الجهاز وسنة الصنع.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "ما هي تكلفة الإصلاح التقريبية؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "التكلفة المذكورة في كل عطل هي تقدير تقريبي وقد تختلف حسب المنطقة وتوفر القطع. ننصح بالحصول على عرض سعر من فني معتمد.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "لماذا يتجمد المبخر؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "تجميد المبخر يحدث بسبب: انسداد فلتر الهواء، تلف حساس المبخر، تسرب فريون، أو خلل في مروحة المبخر.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "ما هو الفرق بين Inverter و Non-Inverter؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "التكييف Inverter يستخدم ضاغطاً متغير السرعة مما يوفر طاقة بنسبة 30-50%. أما Non-Inverter فيعمل الضاغط إما ON أو OFF بالكامل.",
                        },
                    },
                    {
                        "@type": "Question",
                        "name": "كم مرة يجب تنظيف الفلاتر؟",
                        "acceptedAnswer": {
                            "@type": "Answer",
                            "text": "ينصح بتنظيف فلاتر الهواء كل أسبوعين إلى شهر حسب الاستخدام والبيئة. الفلاتر القذرة تسبب ضعف التبريد وتجميد المبخر.",
                        },
                    },
                ],
            }
        ]
        + [breadcrumb_jsonld([("الأسئلة الشائعة", f"{SITE_URL}faq.html")])],
        "faq.html",
    ),
    "privacy.html": (
        "سياسة الخصوصية | دليل أعطال أجهزة التكييف",
        "سياسة الخصوصية لموقع دليل أعطال التكييف: ما البيانات التي نجمعها، استخدام ملفات تعريف الارتباط (Cookies)، وإعلانات Google AdSense والتحليلات.",
        "سياسة الخصوصية, ملفات تعريف الارتباط, Google AdSense, Google Analytics, حماية البيانات, خصوصية الموقع",
        [
            {
                "@context": "https://schema.org",
                "@type": "PrivacyPolicy",
                "name": "سياسة الخصوصية - دليل أعطال أجهزة التكييف",
                "url": f"{SITE_URL}privacy.html",
                "inLanguage": "ar",
                "dateModified": TODAY,
            }
        ]
        + [breadcrumb_jsonld([("سياسة الخصوصية", f"{SITE_URL}privacy.html")])],
        "privacy.html",
    ),
    "disclaimer.html": (
        "إخلاء المسؤولية | دليل أعطال أجهزة التكييف",
        "إخلاء مسؤولية موقع دليل أعطال التكييف: المحتوى تعليمي وإرشادي فقط ولا يغني عن الفحص الفني بواسطة فني معتمد للأعطال المعقدة.",
        "إخلاء المسؤولية, تنبيه, محتوى تعليمي, فني معتمد, تحذير صيانة التكييف, عدم التعويض",
        breadcrumb_jsonld([("إخلاء المسؤولية", f"{SITE_URL}disclaimer.html")]),
        "disclaimer.html",
    ),
}

for fname, (title, desc, kw, extra_jsonld, suffix) in static_pages.items():
    html = read(fname)
    b = seo_blocks(title, desc, kw, extra_jsonld, suffix)
    html = inject_head_block(html, b)
    write(fname, html)

# =========================================================
# 3. DYNAMIC PAGES (error.html / article.html) - template updates
# =========================================================
# For single error pages, we add dynamic meta/keywords/JSON-LD filled by JS.

err_html = read("error.html")
err_block = seo_blocks(
    "تفاصيل العطل | دليل أعطال أجهزة التكييف",
    "تفاصيل العطل، أسبابه، خطوات الفحص والإصلاح، والتكلفة التقريبية.",
    "",
    [breadcrumb_jsonld([("الأعطال", f"{SITE_URL}errors.html")])],
    "error.html",
)
# Remove empty keywords line from template (will be set dynamically)
err_block = err_block.replace('<meta name="keywords" content="">\n', "")
err_html = inject_head_block(err_html, err_block)
write("error.html", err_html)

art_html = read("article.html")
art_block = seo_blocks(
    "المقال | دليل أعطال أجهزة التكييف",
    "اقرأ المقال الكامل حول أعطال وصيانة أجهزة التكييف.",
    "",
    [breadcrumb_jsonld([("المقالات", f"{SITE_URL}articles.html")])],
    "article.html",
)
art_block = art_block.replace('<meta name="keywords" content="">\n', "")
art_html = inject_head_block(art_html, art_block)
write("article.html", art_html)

print("SEO injection complete.")
