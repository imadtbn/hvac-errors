#!/usr/bin/env python3
from __future__ import annotations
import json
from datetime import date
from pathlib import Path
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
SITE = 'https://imadtbn.github.io/hvac-errors/'
TODAY = date.today().isoformat()

static_pages = ['index.html', 'errors.html', 'brands.html', 'articles.html', 'about.html', 'contact.html', 'faq.html', 'privacy.html', 'disclaimer.html', 'search.html']
articles = json.loads((ROOT / 'data' / 'articles.json').read_text(encoding='utf-8'))
errors = json.loads((ROOT / 'data' / 'errors.json').read_text(encoding='utf-8'))

paths = []
for page in static_pages:
    base = '' if page == 'index.html' else page
    paths.append((base, 'weekly' if page in {'index.html', 'errors.html', 'articles.html'} else 'monthly', '0.9' if page in {'index.html', 'errors.html', 'articles.html'} else '0.6'))
for article in articles:
    paths.append((f"article.html?id={article['id']}", 'monthly', '0.7'))
for error in errors:
    paths.append((f"error.html?id={error['id']}", 'monthly', '0.7'))


def full(path: str, lang: str | None = None) -> str:
    if not lang:
        return SITE + path
    separator = '&' if '?' in path else '?'
    return SITE + path + separator + 'lang=' + lang


def entry(path: str, frequency: str, priority: str, lang: str) -> str:
    url = full(path, lang)
    alternate_ar = full(path, 'ar')
    alternate_en = full(path, 'en')
    return f'''  <url>\n    <loc>{escape(url)}</loc>\n    <lastmod>{TODAY}</lastmod>\n    <changefreq>{frequency}</changefreq>\n    <priority>{priority}</priority>\n    <xhtml:link rel="alternate" hreflang="ar" href="{escape(alternate_ar)}" />\n    <xhtml:link rel="alternate" hreflang="en" href="{escape(alternate_en)}" />\n    <xhtml:link rel="alternate" hreflang="x-default" href="{escape(alternate_ar)}" />\n  </url>'''

chunks = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">']
for path, frequency, priority in paths:
    chunks.append(entry(path, frequency, priority, 'ar'))
    chunks.append(entry(path, frequency, priority, 'en'))
chunks.append('</urlset>')
(ROOT / 'sitemap.xml').write_text('\n'.join(chunks) + '\n', encoding='utf-8')
print(f'Generated sitemap with {len(paths) * 2} localized URLs')
